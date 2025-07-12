import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { booksApi, membersApi, loansApi, reportsApi } from '../../services/api';
import { Book, Member, Loan, LoanReport, BookReport } from '../../types';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import Alert from '../UI/Alert';
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueLoans: 0,
    availableBooks: 0,
    reservedBooks: 0
  });
  const [recentActivity, setRecentActivity] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [booksResponse, membersResponse, loansResponse, loanReportResponse, bookReportResponse] = await Promise.all([
        booksApi.getAll(),
        user?.role !== 'member' ? membersApi.getAll() : Promise.resolve({ success: true, data: [] }),
        loansApi.getAll(),
        reportsApi.getLoanReport(),
        reportsApi.getBookReport()
      ]);

      if (booksResponse.success && booksResponse.data) {
        setStats(prev => ({ ...prev, totalBooks: booksResponse.data!.length }));
      }

      if (membersResponse.success && membersResponse.data) {
        setStats(prev => ({ ...prev, totalMembers: membersResponse.data!.length }));
      }

      if (loansResponse.success && loansResponse.data) {
        setRecentActivity(loansResponse.data.slice(0, 5));
      }

      if (loanReportResponse.success && loanReportResponse.data) {
        const report = loanReportResponse.data;
        setStats(prev => ({
          ...prev,
          activeLoans: report.activeLoans,
          overdueLoans: report.overdueLoans
        }));
      }

      if (bookReportResponse.success && bookReportResponse.data) {
        const report = bookReportResponse.data;
        setStats(prev => ({
          ...prev,
          availableBooks: report.availableBooks,
          reservedBooks: report.reservedBooks
        }));
      }

    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatsForRole = () => {
    const baseStats = [
      {
        title: 'Total Books',
        value: stats.totalBooks,
        icon: BookOpen,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Available Books',
        value: stats.availableBooks,
        icon: BookOpen,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    ];

    if (user?.role === 'admin' || user?.role === 'librarian') {
      return [
        ...baseStats,
        {
          title: 'Total Members',
          value: stats.totalMembers,
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        {
          title: 'Active Loans',
          value: stats.activeLoans,
          icon: BookMarked,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        },
        {
          title: 'Overdue Loans',
          value: stats.overdueLoans,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        },
        {
          title: 'Reserved Books',
          value: stats.reservedBooks,
          icon: Calendar,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50'
        }
      ];
    }

    return baseStats;
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-gray-600">Welcome to your library management dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getStatsForRole().map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {(user?.role === 'admin' || user?.role === 'librarian') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Activity">
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookMarked className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {loan.book?.title || 'Unknown Book'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Borrowed by {loan.member?.name || 'Unknown Member'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(loan.loanDate).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Add New Book</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Register Member</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <BookMarked className="h-5 w-5" />
                  <span className="font-medium">Process Loan</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">View Reports</span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;