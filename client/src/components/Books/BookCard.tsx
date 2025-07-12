import React from 'react';
import { Book } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import { BookOpen, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface BookCardProps {
  book: Book;
  canManage: boolean;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, canManage, onEdit, onDelete }) => {
  const { user } = useAuth();

  const handleLoan = () => {
    // This would typically open a loan modal
    console.log('Loan book:', book.id);
  };

  const handleReserve = () => {
    // This would typically open a reservation modal
    console.log('Reserve book:', book.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600">by {book.author}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            book.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {book.isAvailable ? 'Available' : 'On Loan'}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">ISBN:</span>
            <span className="ml-2">{book.isbn}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Published: {format(new Date(book.publishDate), 'MMM dd, yyyy')}</span>
          </div>
          {book.reservationQueue.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>{book.reservationQueue.length} reservation(s)</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {book.isAvailable && user?.role === 'member' && (
              <Button size="sm" onClick={handleLoan}>
                Borrow
              </Button>
            )}
            {!book.isAvailable && user?.role === 'member' && (
              <Button size="sm" variant="secondary" onClick={handleReserve}>
                Reserve
              </Button>
            )}
          </div>
          
          {canManage && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(book)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(book.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;