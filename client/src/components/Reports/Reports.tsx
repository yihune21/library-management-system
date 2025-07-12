import React, { useState, useEffect } from 'react';
import { LoanReport, BookReport } from '../../types';
import { reportsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import Alert from '../UI/Alert';
import Button from '../UI/Button';
import { 
  Download, 
  BookOpen, 
  BookMarked, 
  AlertTriangle,
  Users,
  TrendingUp
} from 'lucide-react';

const Reports: React.FC = () => {
  const [loanReport, setLoanReport] = useState<LoanReport | null>(null);
  const [bookReport, setBookReport] = useState<BookReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [loanResponse, bookResponse] = await Promise.all([
        reportsApi.getLoanReport(),
        reportsApi.getBookReport()
      ]);

      if (loanResponse.success && loanResponse.data) {
        setLoanReport(loanResponse.data);
      }

      if (bookResponse.success && bookResponse.data) {
        setBookReport(bookResponse.data);
      }
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const canViewReports = user?.role === 'admin' || user?.role === 'librarian';

  if (!canViewReports) {
    return (
      <div className="text-center py-12">
        <Alert type="warning" message="You don't have permission to view reports" />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => loanReport && exportToCsv(loanReport.loans, 'loan-report.csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Loans
          </Button>
          <Button
            variant="secondary"
            onClick={() => bookReport && exportToCsv(bookReport.books, 'book-report.csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Books
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{bookReport?.totalBooks || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Books</p>
              <p className="text-2xl font-bold text-gray-900">{bookReport?.availableBooks || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-amber-50">
              <BookMarked className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{loanReport?.activeLoans || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Loans</p>
              <p className="text-2xl font-bold text-gray-900">{loanReport?.overdueLoans || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Current Loans">
          <div className="space-y-4">
            {loanReport?.loans.filter(loan => !loan.actualReturnDate).slice(0, 10).map((loan) => (
              <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {loan.book?.title || 'Unknown Book'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Borrowed by {loan.member?.name || 'Unknown Member'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Due: {new Date(loan.returnDate).toLocaleDateString()}
                  </p>
                  {loan.isOverdue && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            ))}
            {!loanReport?.loans.filter(loan => !loan.actualReturnDate).length && (
              <p className="text-gray-500 text-center py-4">No active loans</p>
            )}
          </div>
        </Card>

        <Card title="Most Popular Books">
          <div className="space-y-4">
            {bookReport?.books.filter(book => !book.isAvailable).slice(0, 10).map((book) => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{book.title}</p>
                  <p className="text-xs text-gray-500">by {book.author}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    On Loan
                  </span>
                </div>
              </div>
            ))}
            {!bookReport?.books.filter(book => !book.isAvailable).length && (
              <p className="text-gray-500 text-center py-4">No books currently on loan</p>
            )}
          </div>
        </Card>
      </div>

      {/* Statistics */}
      <Card title="Library Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {bookReport ? Math.round((bookReport.loanedBooks / bookReport.totalBooks) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Book Utilization Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookMarked className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loanReport?.totalLoans || 0}
            </p>
            <p className="text-sm text-gray-600">Total Loans</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loanReport ? Math.round((loanReport.overdueLoans / loanReport.totalLoans) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Overdue Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;