import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { booksApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import BookCard from './BookCard';
import BookForm from './BookForm';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import Alert from '../UI/Alert';
import Modal from '../UI/Modal';
import { Plus, Search } from 'lucide-react';

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getAll();
      if (response.success && response.data) {
        setBooks(response.data);
      } else {
        setError(response.error || 'Failed to load books');
      }
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (bookData: Omit<Book, 'id' | 'isAvailable' | 'reservationQueue' | 'createdAt'>) => {
    try {
      const response = await booksApi.create(bookData);
      if (response.success && response.data) {
        setBooks([...books, response.data]);
        setShowAddForm(false);
      } else {
        setError(response.error || 'Failed to add book');
      }
    } catch (err) {
      setError('Failed to add book');
    }
  };

  const handleUpdateBook = async (bookData: Omit<Book, 'id' | 'isAvailable' | 'reservationQueue' | 'createdAt'>) => {
    if (!editingBook) return;
    
    try {
      const response = await booksApi.update(editingBook.id, bookData);
      if (response.success && response.data) {
        setBooks(books.map(book => 
          book.id === editingBook.id ? response.data! : book
        ));
        setEditingBook(null);
      } else {
        setError(response.error || 'Failed to update book');
      }
    } catch (err) {
      setError('Failed to update book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await booksApi.delete(bookId);
      if (response.success) {
        setBooks(books.filter(book => book.id !== bookId));
      } else {
        setError(response.error || 'Failed to delete book');
      }
    } catch (err) {
      setError('Failed to delete book');
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  const canManageBooks = user?.role === 'admin' || user?.role === 'librarian';

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Books</h1>
        {canManageBooks && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        )}
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            canManage={canManageBooks}
            onEdit={setEditingBook}
            onDelete={handleDeleteBook}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found</p>
        </div>
      )}

      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Book"
        size="lg"
      >
        <BookForm
          onSubmit={handleAddBook}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="Edit Book"
        size="lg"
      >
        {editingBook && (
          <BookForm
            book={editingBook}
            onSubmit={handleUpdateBook}
            onCancel={() => setEditingBook(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default BookList;