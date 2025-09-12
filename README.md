# Library Management System

A modern, production-ready library management system built with Go (backend) and React (frontend).

## Features

- **User Management**: Registration, authentication, and role-based access control (Admin, Librarian, Member)
- **Book Management**: CRUD operations, search, categorization, and availability tracking
- **Loan Management**: Book borrowing, returns, renewals, and overdue tracking
- **Reservation System**: Queue-based book reservation with automatic notifications
- **Member Management**: Member profiles, loan history, and fine tracking
- **Reports & Analytics**: Comprehensive statistics and reporting dashboard
- **Real-time Updates**: Redis-powered caching and real-time notifications
- **Security**: JWT authentication, rate limiting, and secure password hashing

## Tech Stack

### Backend
- **Go 1.21**: Modern, efficient backend language
- **Gin**: High-performance HTTP web framework
- **GORM**: Full-featured ORM for database operations
- **PostgreSQL**: Primary database for persistent storage
- **Redis**: Caching and session management
- **JWT**: Secure token-based authentication
- **Docker**: Containerization for easy deployment

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing
- **Context API**: State management

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Go 1.21+ (for local development)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- Redis 7+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yihune21/library-management-system.git
cd library-management-system
```

2. Create environment file:
```bash
cp server/.env.example server/.env
# Edit .env with your configuration
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/health

### Local Development

#### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
go mod download
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your local configuration
```

4. Run database migrations:
```bash
make migrate
```

5. Start the server:
```bash
make run
# Or for hot reload:
make dev
```

#### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables:
```bash
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
```

4. Start development server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

- `POST /api/method/library_management.api.auth/login` - User login
- `POST /api/method/library_management.api.auth/register` - User registration
- `POST /api/method/library_management.api.auth/logout` - User logout
- `GET /api/method/library_management.api.auth/get_current_user` - Get current user
- `POST /api/method/library_management.api.auth/change_password` - Change password

### Book Endpoints

- `GET /api/method/library_management.api.books/get_books` - Get paginated books
- `GET /api/method/library_management.api.books/get_book` - Get single book
- `POST /api/method/library_management.api.books/create_book` - Create book (Librarian)
- `POST /api/method/library_management.api.books/update_book` - Update book (Librarian)
- `POST /api/method/library_management.api.books/delete_book` - Delete book (Admin)
- `GET /api/method/library_management.api.books/get_available_books` - Get available books
- `GET /api/method/library_management.api.books/search_books` - Search books
- `POST /api/method/library_management.api.books/reserve_book` - Reserve book
- `GET /api/method/library_management.api.books/get_book_statistics` - Get statistics

## Default Credentials

For initial setup, a default admin account is created:
- Email: admin@library.com
- Password: admin123

**⚠️ Important**: Change the default admin password immediately after first login!

## Project Structure

```
library-management-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # API client modules
│   │   ├── components/       # React components
│   │   ├── contexts/         # Context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Service modules
│   │   └── types/           # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── server/                    # Go backend
│   ├── internal/
│   │   ├── config/          # Configuration
│   │   ├── database/        # Database connection
│   │   ├── handlers/        # HTTP handlers
│   │   ├── middleware/      # Middleware
│   │   ├── models/          # Data models
│   │   └── routes/          # Route definitions
│   ├── pkg/
│   │   ├── auth/            # Authentication utilities
│   │   ├── logger/          # Logging utilities
│   │   ├── redis/           # Redis client
│   │   └── utils/           # Helper utilities
│   ├── Dockerfile
│   ├── go.mod
│   └── main.go
├── docker-compose.yml
└── README.md
```

## Configuration

### Environment Variables

Key environment variables for the server:

- `PORT`: Server port (default: 8000)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `JWT_SECRET`: JWT signing secret
- `CORS_ALLOWED_ORIGINS`: Allowed CORS origins

See `server/.env.example` for complete list.

## Development

### Running Tests

Backend tests:
```bash
cd server
make test
```

Frontend tests:
```bash
cd client
npm test
```

### Code Quality

Backend:
```bash
cd server
make lint
make fmt
```

Frontend:
```bash
cd client
npm run lint
npm run format
```

## Production Deployment

### Using Docker Compose

1. Update environment variables in `.env` files
2. Set secure JWT secret
3. Configure SSL/TLS certificates
4. Run: `docker-compose -f docker-compose.prod.yml up -d`

### Manual Deployment

1. Build backend:
```bash
cd server
CGO_ENABLED=0 GOOS=linux go build -o main .
```

2. Build frontend:
```bash
cd client
npm run build
```

3. Deploy with your preferred hosting service

## Security Considerations

- Always use HTTPS in production
- Change default passwords immediately
- Keep JWT secret secure and rotate regularly
- Enable rate limiting
- Use environment-specific configurations
- Regular security updates and patches
- Implement proper backup strategies

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.