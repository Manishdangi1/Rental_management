import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/Auth/AuthGuard';
import RoleGuard from './components/Auth/RoleGuard';
import Navbar from './components/Layout/Navbar';
import CustomerLayout from './components/Layout/CustomerLayout';
import AdminLayout from './components/Layout/AdminLayout';

// Public Pages
import HomePage from './pages/Public/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';

// Customer Pages
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import CustomerRentals from './pages/Customer/CustomerRentals';
import CustomerProfile from './pages/Customer/CustomerProfile';
import CustomerDeliveries from './pages/Customer/CustomerDeliveries';
import CustomerInvoices from './pages/Customer/CustomerInvoices';
import CustomerPayments from './pages/Customer/CustomerPayments';
import CustomerNotifications from './pages/Customer/CustomerNotifications';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminRentals from './pages/Admin/AdminRentals';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminRentalProducts from './pages/Admin/AdminRentalProducts';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminReports from './pages/Admin/AdminReports';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminDeliveries from './pages/Admin/AdminDeliveries';

// Shared Components
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SidebarProvider } from './contexts/SidebarContext';

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
              <FavoritesProvider>
                <Router>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/home" element={<HomePage />} />
                      
                      {/* Authentication Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                      
                      {/* Customer Routes */}
                      <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
                      <Route
                        path="/customer/dashboard"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <CustomerDashboard />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/customer/rentals"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <CustomerRentals />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/customer/profile"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <CustomerProfile />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/customer/deliveries"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <CustomerDeliveries />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/customer/invoices"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <CustomerInvoices />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/customer/payments"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <CustomerPayments />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/customer/notifications"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <CustomerNotifications />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      
                      {/* Protected Product Routes */}
                      <Route
                        path="/products"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <ProductsPage />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/products/:id"
                        element={
                          <RoleGuard allowedRoles={['CUSTOMER']}>
                            <SidebarProvider>
                              <CustomerLayout>
                                <ProductDetailPage />
                              </CustomerLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                      <Route
                        path="/admin/dashboard"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminDashboard />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminUsers />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/rentals"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminRentals />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/deliveries"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminDeliveries />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/products"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminProducts />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/rental-products"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminRentalProducts />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/categories"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminCategories />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/reports"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminReports />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <RoleGuard allowedRoles={['ADMIN']}>
                            <SidebarProvider>
                              <AdminLayout>
                                <AdminSettings />
                              </AdminLayout>
                            </SidebarProvider>
                          </RoleGuard>
                        }
                      />
                      
                      {/* Shared Routes */}
                      <Route
                        path="/cart"
                        element={
                          <AuthGuard>
                            <Navbar />
                            <CartPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <AuthGuard>
                            <Navbar />
                            <CheckoutPage />
                          </AuthGuard>
                        }
                      />
                      
                      {/* Legacy Routes - Redirect to appropriate dashboard */}
                      <Route
                        path="/dashboard"
                        element={<Navigate to="/admin/dashboard" replace />}
                      />
                      
                      {/* 404 Handler */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Box>
                </Router>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 