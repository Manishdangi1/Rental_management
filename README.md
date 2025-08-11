# Rental Management System

A modern, full-stack rental management application built with React, Node.js, and PostgreSQL. This system allows users to browse rental products, manage their rentals, and provides an intuitive interface for both customers and administrators.

## 🚀 Technologies Used

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Material-UI (MUI)** - React UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Prisma** - Database ORM and migration tool
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Nodemon** - Development server with auto-restart
- **Git** - Version control

## 📁 Project Structure

```
rental-management/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/                         # Source code
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Layout/             # Layout components (Navbar, Sidebar)
│   │   │   └── ErrorBoundary.tsx   # Error handling component
│   │   ├── contexts/               # React contexts for state management
│   │   │   ├── AuthContext.tsx     # Authentication context
│   │   │   └── CartContext.tsx     # Shopping cart context
│   │   ├── pages/                  # Page components
│   │   │   ├── Auth/               # Authentication pages
│   │   │   ├── Cart/               # Shopping cart page
│   │   │   ├── Checkout/           # Checkout process
│   │   │   ├── Dashboard/          # User dashboard
│   │   │   ├── Profile/            # User profile management
│   │   │   ├── Rentals/            # Rental management
│   │   │   ├── HomePage.tsx        # Landing page
│   │   │   ├── ProductsPage.tsx    # Products listing
│   │   │   └── ProductDetailPage.tsx # Individual product view
│   │   ├── App.tsx                 # Main application component
│   │   ├── index.tsx               # Application entry point
│   │   └── vite.config.ts          # Vite configuration
│   ├── package.json                 # Frontend dependencies
│   └── tsconfig.json               # TypeScript configuration
├── server/                          # Backend Node.js application
│   ├── prisma/                     # Database schema and migrations
│   │   ├── schema.prisma           # Database schema definition
│   │   └── migrations/             # Database migration files
│   ├── routes/                     # API route handlers
│   ├── middleware/                  # Express middleware
│   ├── controllers/                 # Business logic controllers
│   ├── models/                      # Data models
│   ├── utils/                       # Utility functions
│   ├── index.js                     # Server entry point
│   └── package.json                 # Backend dependencies
├── .env                             # Environment variables
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package.json
└── README.md                        # This file
```

## 🛠️ Key Features

### User Management
- User registration and authentication
- Role-based access control (User/Admin)
- User profile management

### Product Management
- Browse available rental products
- Product categories and search
- Product details with images and descriptions

### Rental System
- Add products to rental cart
- Configure rental duration and type (Hourly/Daily/Weekly/Monthly/Yearly)
- Rental checkout process
- Security deposit calculation

### Dashboard
- User rental history
- Active rentals tracking
- Financial summaries
- Quick actions for common tasks

### Cart & Checkout
- Shopping cart functionality
- Rental period selection
- Price calculation based on duration
- Secure checkout process

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rental-management
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Update environment variables
   # Database connection, JWT secret, etc.
   ```

4. **Database Setup**
   ```bash
   cd server
   
   # Run database migrations
   npx prisma migrate dev
   
   # Seed database (if applicable)
   npx prisma db seed
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend development server
   cd client
   npm run dev
   ```

## 📱 Available Scripts

### Root Level
```bash
npm run dev          # Start both frontend and backend in development mode
npm run build        # Build both frontend and backend
npm run start        # Start both in production mode
```

### Frontend (client/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend (server/)
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run build        # Build TypeScript (if applicable)
```

## 🗄️ Database Schema

The system uses PostgreSQL with Prisma ORM. Key entities include:

- **Users** - User accounts and authentication
- **Products** - Available rental items
- **Rentals** - User rental transactions
- **Categories** - Product categorization
- **Orders** - Rental orders and payments

## 🔐 Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes for authenticated users
- Role-based access control

## 🎨 UI/UX Features

- Responsive Material-UI design
- Mobile-first approach
- Dark/light theme support
- Intuitive navigation
- Loading states and error handling
- Form validation and user feedback

## 🚀 Deployment

### Frontend
- Build optimized production bundle
- Deploy to static hosting (Netlify, Vercel, etc.)

### Backend
- Environment variable configuration
- Database connection setup
- Process management (PM2, Docker, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core rental management features
- **v1.1.0** - Added cart functionality and checkout process
- **v1.2.0** - Enhanced dashboard and user management
- **v1.3.0** - Backend integration and API endpoints

---

**Note**: This is a development version. Some features may be in progress or subject to change. 