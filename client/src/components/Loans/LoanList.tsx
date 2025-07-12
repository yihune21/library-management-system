import React, { useState, useEffect } from 'react';
import { Loan } from '../../types';
import { loansApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoanCard from './LoanCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import Alert from '../UI/Alert';
import { Search, Filter } from 'lucide-react';

const LoanList: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await loansApi.getAll();
      if (response.success && response.data) {
        setLoans(response.data);
      } else {
        setError(response.error || 'Failed to load loans');
      }
    } catch (err) {
      setError('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (loanId: string) => {
    try {
      const response = await loansApi.returnBook(loanId);
      if (response.success) {
        setLoans(loans.map(loan => 
          loan.id === loanId 
            ? { ...loan, actualReturnDate: new Date().toISOString() }
            : loan
        ));
      } else {
        setError(response.error || 'Failed to return book');
      }
    } catch (err) {
      setError('Failed to return book');
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.member?.membershipId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !loan.actualReturnDate) ||
      (filterStatus === 'overdue' && loan.isOverdue && !loan.actualReturnDate) ||
      (filterStatus === 'returned' && loan.actualReturnDate);

    return matchesSearch && matchesFilter;
  });

  const canManageLoans = user?.role === 'admin' || user?.role === 'librarian';

  if (!canManageLoans) {
    return (
      <div className="text-center py-12">
        <Alert type="warning" message="You don't have permission to view loans" />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Loans</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search loans by book title, member name, or membership ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLoans.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            onReturn={handleReturnBook}
          />
        ))}
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No loans found</p>
        </div>
      )}
    </div>
  );
};

export default LoanList;