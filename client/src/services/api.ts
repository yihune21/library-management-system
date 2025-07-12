import { 
  User, 
  Book, 
  Member, 
  Loan, 
  Reservation, 
  ApiResponse, 
  LoginCredentials, 
  RegisterData,
  LoanReport,
  BookReport
} from '../types';

// Mock API implementation - Replace with actual Frappe API endpoints
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new ApiError(`API Error: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message
      };
    }
    
    // Mock successful responses for demo
    return mockApiResponse<T>(endpoint, options);
  }
};

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@library.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'librarian@library.com',
    name: 'Jane Librarian',
    role: 'librarian',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'member@library.com',
    name: 'John Member',
    role: 'member',
    membershipId: 'M001',
    phone: '+1234567890',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    publishDate: '1925-04-10',
    isAvailable: true,
    reservationQueue: [],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    publishDate: '1960-07-11',
    isAvailable: false,
    currentLoanId: '1',
    reservationQueue: ['3'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    publishDate: '1949-06-08',
    isAvailable: true,
    reservationQueue: [],
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    membershipId: 'M001',
    email: 'john@example.com',
    phone: '+1234567890',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    membershipId: 'M002',
    email: 'jane@example.com',
    phone: '+1234567891',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockLoans: Loan[] = [
  {
    id: '1',
    bookId: '2',
    memberId: '1',
    loanDate: '2024-01-01',
    returnDate: '2024-01-15',
    isOverdue: new Date() > new Date('2024-01-15'),
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    bookId: '2',
    memberId: '3',
    reservationDate: '2024-01-10',
    status: 'pending',
    createdAt: '2024-01-10T00:00:00Z'
  }
];

// Mock API responses
const mockApiResponse = <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const method = options.method || 'GET';
      
      if (endpoint === '/auth/login' && method === 'POST') {
        const body = JSON.parse(options.body as string);
        const user = mockUsers.find(u => u.email === body.email);
        if (user) {
          resolve({ success: true, data: user as T });
        } else {
          resolve({ success: false, error: 'Invalid credentials' });
        }
      } else if (endpoint === '/auth/register' && method === 'POST') {
        const body = JSON.parse(options.body as string);
        const newUser: User = {
          id: Date.now().toString(),
          email: body.email,
          name: body.name,
          role: body.role,
          membershipId: body.membershipId,
          phone: body.phone,
          createdAt: new Date().toISOString()
        };
        mockUsers.push(newUser);
        resolve({ success: true, data: newUser as T });
      } else if (endpoint === '/auth/me') {
        const token = localStorage.getItem('token');
        const user = mockUsers.find(u => u.id === token);
        if (user) {
          resolve({ success: true, data: user as T });
        } else {
          resolve({ success: false, error: 'User not found' });
        }
      } else if (endpoint === '/books') {
        if (method === 'GET') {
          resolve({ success: true, data: mockBooks as T });
        } else if (method === 'POST') {
          const body = JSON.parse(options.body as string);
          const newBook: Book = {
            id: Date.now().toString(),
            ...body,
            isAvailable: true,
            reservationQueue: [],
            createdAt: new Date().toISOString()
          };
          mockBooks.push(newBook);
          resolve({ success: true, data: newBook as T });
        }
      } else if (endpoint.startsWith('/books/')) {
        const bookId = endpoint.split('/')[2];
        const book = mockBooks.find(b => b.id === bookId);
        if (method === 'GET') {
          resolve({ success: true, data: book as T });
        } else if (method === 'PUT') {
          const body = JSON.parse(options.body as string);
          const index = mockBooks.findIndex(b => b.id === bookId);
          if (index !== -1) {
            mockBooks[index] = { ...mockBooks[index], ...body };
            resolve({ success: true, data: mockBooks[index] as T });
          }
        } else if (method === 'DELETE') {
          const index = mockBooks.findIndex(b => b.id === bookId);
          if (index !== -1) {
            mockBooks.splice(index, 1);
            resolve({ success: true, data: {} as T });
          }
        }
      } else if (endpoint === '/members') {
        if (method === 'GET') {
          resolve({ success: true, data: mockMembers as T });
        } else if (method === 'POST') {
          const body = JSON.parse(options.body as string);
          const newMember: Member = {
            id: Date.now().toString(),
            ...body,
            createdAt: new Date().toISOString()
          };
          mockMembers.push(newMember);
          resolve({ success: true, data: newMember as T });
        }
      } else if (endpoint === '/loans') {
        if (method === 'GET') {
          const loansWithDetails = mockLoans.map(loan => ({
            ...loan,
            book: mockBooks.find(b => b.id === loan.bookId),
            member: mockMembers.find(m => m.id === loan.memberId)
          }));
          resolve({ success: true, data: loansWithDetails as T });
        } else if (method === 'POST') {
          const body = JSON.parse(options.body as string);
          const book = mockBooks.find(b => b.id === body.bookId);
          if (book && book.isAvailable) {
            const newLoan: Loan = {
              id: Date.now().toString(),
              ...body,
              isOverdue: false,
              createdAt: new Date().toISOString()
            };
            mockLoans.push(newLoan);
            book.isAvailable = false;
            book.currentLoanId = newLoan.id;
            resolve({ success: true, data: newLoan as T });
          } else {
            resolve({ success: false, error: 'Book is not available' });
          }
        }
      } else if (endpoint === '/reservations') {
        if (method === 'GET') {
          const reservationsWithDetails = mockReservations.map(reservation => ({
            ...reservation,
            book: mockBooks.find(b => b.id === reservation.bookId),
            member: mockMembers.find(m => m.id === reservation.memberId)
          }));
          resolve({ success: true, data: reservationsWithDetails as T });
        } else if (method === 'POST') {
          const body = JSON.parse(options.body as string);
          const newReservation: Reservation = {
            id: Date.now().toString(),
            ...body,
            reservationDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          mockReservations.push(newReservation);
          resolve({ success: true, data: newReservation as T });
        }
      } else if (endpoint === '/reports/loans') {
        const overdueLoans = mockLoans.filter(loan => loan.isOverdue);
        const report: LoanReport = {
          totalLoans: mockLoans.length,
          activeLoans: mockLoans.filter(loan => !loan.actualReturnDate).length,
          overdueLoans: overdueLoans.length,
          loans: mockLoans
        };
        resolve({ success: true, data: report as T });
      } else if (endpoint === '/reports/books') {
        const report: BookReport = {
          totalBooks: mockBooks.length,
          availableBooks: mockBooks.filter(book => book.isAvailable).length,
          loanedBooks: mockBooks.filter(book => !book.isAvailable).length,
          reservedBooks: mockBooks.filter(book => book.reservationQueue.length > 0).length,
          books: mockBooks
        };
        resolve({ success: true, data: report as T });
      } else {
        resolve({ success: false, error: 'Endpoint not found' });
      }
    }, 500); // Simulate network delay
  });
};

// API service objects
export const authApi = {
  login: (credentials: LoginCredentials) => apiCall<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  register: (data: RegisterData) => apiCall<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getCurrentUser: () => apiCall<User>('/auth/me')
};

export const booksApi = {
  getAll: () => apiCall<Book[]>('/books'),
  
  getById: (id: string) => apiCall<Book>(`/books/${id}`),
  
  create: (book: Omit<Book, 'id' | 'isAvailable' | 'reservationQueue' | 'createdAt'>) =>
    apiCall<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(book)
    }),
  
  update: (id: string, book: Partial<Book>) =>
    apiCall<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book)
    }),
  
  delete: (id: string) => apiCall<{}>(`/books/${id}`, {
    method: 'DELETE'
  })
};

export const membersApi = {
  getAll: () => apiCall<Member[]>('/members'),
  
  getById: (id: string) => apiCall<Member>(`/members/${id}`),
  
  create: (member: Omit<Member, 'id' | 'createdAt'>) =>
    apiCall<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(member)
    }),
  
  update: (id: string, member: Partial<Member>) =>
    apiCall<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member)
    }),
  
  delete: (id: string) => apiCall<{}>(`/members/${id}`, {
    method: 'DELETE'
  })
};

export const loansApi = {
  getAll: () => apiCall<Loan[]>('/loans'),
  
  create: (loan: Omit<Loan, 'id' | 'isOverdue' | 'createdAt'>) =>
    apiCall<Loan>('/loans', {
      method: 'POST',
      body: JSON.stringify(loan)
    }),
  
  returnBook: (loanId: string) =>
    apiCall<Loan>(`/loans/${loanId}/return`, {
      method: 'POST'
    })
};

export const reservationsApi = {
  getAll: () => apiCall<Reservation[]>('/reservations'),
  
  create: (reservation: Omit<Reservation, 'id' | 'reservationDate' | 'status' | 'createdAt'>) =>
    apiCall<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation)
    }),
  
  cancel: (id: string) => apiCall<{}>(`/reservations/${id}`, {
    method: 'DELETE'
  })
};

export const reportsApi = {
  getLoanReport: () => apiCall<LoanReport>('/reports/loans'),
  getBookReport: () => apiCall<BookReport>('/reports/books')
};