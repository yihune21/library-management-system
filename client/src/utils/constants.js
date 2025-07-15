// Constants and Configuration
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/method/library_management.api.auth.login',
  REGISTER: '/api/method/library_management.api.auth.register',
  LOGOUT: '/api/method/library_management.api.auth.logout',
  CURRENT_USER: '/api/method/library_management.api.auth.get_current_user',
  
  // Books
  BOOKS: '/api/method/library_management.api.books.get_books',
  BOOK_DETAIL: '/api/method/library_management.api.books.get_book',
  CREATE_BOOK: '/api/method/library_management.api.books.create_book',
  UPDATE_BOOK: '/api/method/library_management.api.books.update_book',
  DELETE_BOOK: '/api/method/library_management.api.books.delete_book',
  AVAILABLE_BOOKS: '/api/method/library_management.api.books.get_available_books',
  SEARCH_BOOKS: '/api/method/library_management.api.books.search_books',
  RESERVE_BOOK: '/api/method/library_management.api.books.reserve_book',
  
  // Members
  MEMBERS: '/api/method/library_management.api.members.get_members',
  MEMBER_DETAIL: '/api/method/library_management.api.members.get_member',
  CREATE_MEMBER: '/api/method/library_management.api.members.create_member',
  UPDATE_MEMBER: '/api/method/library_management.api.members.update_member',
  DELETE_MEMBER: '/api/method/library_management.api.members.delete_member',
  CURRENT_MEMBER: '/api/method/library_management.api.members.get_current_member_details',
  
  // Loans
  LOANS: '/api/method/library_management.api.loans.get_loans',
  LOAN_DETAIL: '/api/method/library_management.api.loans.get_loan',
  CREATE_LOAN: '/api/method/library_management.api.loans.create_loan',
  RETURN_BOOK: '/api/method/library_management.api.loans.return_book',
  RENEW_LOAN: '/api/method/library_management.api.loans.renew_loan',
  MY_LOANS: '/api/method/library_management.api.loans.get_my_loans',
  ACTIVE_LOANS: '/api/method/library_management.api.loans.get_active_loans',
  OVERDUE_LOANS: '/api/method/library_management.api.loans.get_overdue_loans',
  
  // Reservations
  RESERVATIONS: '/api/method/library_management.api.reservations.get_reservations',
  CREATE_RESERVATION: '/api/method/library_management.api.reservations.create_reservation',
  CANCEL_RESERVATION: '/api/method/library_management.api.reservations.cancel_reservation',
  MY_RESERVATIONS: '/api/method/library_management.api.reservations.get_my_reservations',
  
  // Reports
  DASHBOARD_STATS: '/api/method/library_management.api.reports.get_dashboard_stats',
  BOOKS_ON_LOAN_REPORT: '/api/method/library_management.api.reports.get_books_on_loan_report',
  OVERDUE_BOOKS_REPORT: '/api/method/library_management.api.reports.get_overdue_books_report',
  EXPORT_REPORT: '/api/method/library_management.api.reports.export_report'
};

export const USER_ROLES = {
  ADMIN: 'System Manager',
  LIBRARIAN: 'Librarian',
  MEMBER: 'Library Member'
};

export const USER_TYPES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  MEMBER: 'member'
};

export const BOOK_STATUS = {
  AVAILABLE: 'Available',
  LOANED: 'Loaned',
  RESERVED: 'Reserved',
  MAINTENANCE: 'Maintenance'
};

export const LOAN_STATUS = {
  ACTIVE: 'Active',
  RETURNED: 'Returned',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
};

export const RESERVATION_STATUS = {
  ACTIVE: 'Active',
  AVAILABLE: 'Available',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired'
};

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  EXPIRING_SOON: 'Expiring Soon',
  SUSPENDED: 'Suspended'
};