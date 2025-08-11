import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/Auth/AuthGuard';
import Navbar from './components/Layout/Navbar';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RentalsPage from './pages/Rentals/RentalsPage';
import RentalDetailPage from './pages/Rentals/RentalDetailPage';
import RentalProductSelection from './pages/Rentals/RentalProductSelection';
import RentalCheckout from './pages/Rentals/RentalCheckout';
import RentalOrderForm from './pages/Rentals/RentalOrderForm';
import RentalNavigation from './components/Layout/RentalNavigation';
import ProfilePage from './pages/Profile/ProfilePage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import StaffDashboardOverview from './pages/Dashboard/Staff/StaffDashboardOverview';
import StaffQuotationsPage from './pages/Dashboard/Staff/StaffQuotationsPage';
import StaffRentalsPage from './pages/Dashboard/Staff/StaffRentalsPage';
import StaffRevenuePage from './pages/Dashboard/Staff/StaffRevenuePage';
import StaffTopCategoriesPage from './pages/Dashboard/Staff/StaffTopCategoriesPage';
import StaffTopProductsPage from './pages/Dashboard/Staff/StaffTopProductsPage';
import StaffTopCustomersPage from './pages/Dashboard/Staff/StaffTopCustomersPage';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <CartProvider>
              <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Routes>
                    {/* Default Route - Redirect to Login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    
                    {/* Authentication Routes - No Navigation */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    
                    {/* Public Product Routes (can be accessed without login) */}
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/home" element={<HomePage />} />

                    {/* Protected Routes - With Navigation */}
                    <Route
                      path="/dashboard"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <StaffDashboardOverview />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard/quotations"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <StaffQuotationsPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard/rentals"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <StaffRentalsPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard/revenue"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <StaffRevenuePage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard/top-categories"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <StaffTopCategoriesPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard/top-products"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <StaffTopProductsPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard/top-customers"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <StaffTopCustomersPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/rentals"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <RentalsPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/rentals/:id"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <RentalDetailPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/rentals/new"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <RentalProductSelection />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/rentals/checkout"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <RentalCheckout />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/rentals/order-form"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <RentalOrderForm />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/rentals/navigation"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <RentalNavigation />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <ProfilePage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <CartPage />
                          </>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <AuthGuard>
                          <>
                            <Navbar />
                            <CheckoutPage />
                          </>
                        </AuthGuard>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <AuthGuard requireRole={['ADMIN']}>
                          <div>Admin Panel (Coming Soon)</div>
                        </AuthGuard>
                      }
                    />

                    {/* 404 Route - Redirect to Login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </Box>
              </Router>
            </CartProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 