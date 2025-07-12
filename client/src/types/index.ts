export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'librarian' | 'member';
  membershipId?: string;
  phone?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  isAvailable: boolean;
  currentLoanId?: string;
  reservationQueue: string[];
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  membershipId: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  bookId: string;
  memberId: string;
  loanDate: string;
  returnDate: string;
  actualReturnDate?: string;
  isOverdue: boolean;
  book?: Book;
  member?: Member;
  createdAt: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  memberId: string;
  reservationDate: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  book?: Book;
  member?: Member;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'member' | 'librarian';
  membershipId?: string;
  phone?: string;
}

export interface LoanReport {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  loans: Loan[];
}

export interface BookReport {
  totalBooks: number;
  availableBooks: number;
  loanedBooks: number;
  reservedBooks: number;
  books: Book[];
}