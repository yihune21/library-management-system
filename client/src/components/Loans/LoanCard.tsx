import React from 'react';
import { Loan } from '../../types';
import Button from '../UI/Button';
import { BookMarked, User, Calendar, AlertTriangle } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

interface LoanCardProps {
  loan: Loan;
  onReturn: (loanId: string) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onReturn }) => {
  const isOverdue = isAfter(new Date(), parseISO(loan.returnDate)) && !loan.actualReturnDate;
  const isReturned = !!loan.actualReturnDate;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookMarked className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {loan.book?.title || 'Unknown Book'}
              </h3>
              <p className="text-sm text-gray-600">
                by {loan.book?.author || 'Unknown Author'}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isReturned 
              ? 'bg-green-100 text-green-800' 
              : isOverdue 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span className="font-medium">Member:</span>
            <span className="ml-2">{loan.member?.name || 'Unknown Member'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-medium">Loan Date:</span>
            <span className="ml-2">{format(parseISO(loan.loanDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-medium">Due Date:</span>
            <span className="ml-2">{format(parseISO(loan.returnDate), 'MMM dd, yyyy')}</span>
          </div>
          {isReturned && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">Returned:</span>
              <span className="ml-2">{format(parseISO(loan.actualReturnDate!), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>

        {isOverdue && (
          <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              This loan is overdue!
            </span>
          </div>
        )}

        {!isReturned && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="success"
              onClick={() => onReturn(loan.id)}
            >
              Mark as Returned
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCard;