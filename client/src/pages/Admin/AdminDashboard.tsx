import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  LinearProgress
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  LocalShipping,
  Receipt,
  Payment,
  People,
  Inventory,
  Assessment,
  Notifications,
  Settings,
  Add,
  Edit,
  Delete,
  Visibility,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  Business,
  Category,
  LocalOffer,
  BarChart,
  PieChart,
  Timeline,
  Download,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminStats {
  totalRentals: number;
  activeRentals: number;
  totalRevenue: number;
  pendingDeliveries: number;
  overdueReturns: number;
  totalProducts: number;
  availableProducts: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
}

interface RentalOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  pickupDate?: string;
  returnDate?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
}

interface DeliveryItem {
  id: string;
  rentalId: string;
  customerName: string;
  productName: string;
  quantity: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
  scheduledDate: string;
  actualDate?: string;
  driverName?: string;
  notes?: string;
}

interface TopProduct {
  id: string;
  name: string;
  totalRentals: number;
  totalRevenue: number;
  averageRating: number;
  category: string;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalRentals: number;
  totalSpent: number;
  lastRentalDate: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Check if user is authenticated and has admin role
  if (!user || user.role !== 'ADMIN') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6" color="text.secondary">
          Access Denied. Admin privileges required.
        </Typography>
      </Box>
    );
  }
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalRentals: 0,
    activeRentals: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
    overdueReturns: 0,
    totalProducts: 0,
    availableProducts: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0
  });
  
  const [recentRentals, setRecentRentals] = useState<RentalOrder[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<DeliveryItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [overdueRentals, setOverdueRentals] = useState<RentalOrder[]>([]);

  // Fetch admin dashboard data using consolidated endpoint
  const fetchAdminData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication token not found. Please login again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Use the new consolidated endpoint for better performance
      const response = await fetch('/api/admin/dashboard-data', { headers });
      
      if (response.ok) {
        const data = await response.json();
        
        // Set all data at once
        setStats(data.stats);
        setRecentRentals(data.recentRentals || []);
        setPendingDeliveries(data.pendingDeliveries || []);
        setTopProducts(data.topProducts || []);
        setTopCustomers(data.topCustomers || []);
        setOverdueRentals(data.overdueRentals || []);
        
        console.log('Dashboard data loaded successfully:', data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Consolidated endpoint failed:', response.status, response.statusText, errorData);
        
        // Fallback to individual endpoints if consolidated fails
        try {
          console.log('Falling back to individual endpoints...');
          
          const [statsResponse, rentalsResponse, deliveriesResponse, topProductsResponse, topCustomersResponse, overdueResponse] = await Promise.all([
            fetch('/api/admin/stats', { headers }),
            fetch('/api/admin/rentals?limit=5', { headers }),
            fetch('/api/admin/deliveries?status=PENDING', { headers }),
            fetch('/api/admin/reports/top-products', { headers }),
            fetch('/api/admin/reports/top-customers', { headers }),
            fetch('/api/admin/rentals?status=OVERDUE', { headers })
          ]);

          let successCount = 0;
          let totalEndpoints = 6;

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
            successCount++;
          } else {
            console.error('Stats endpoint failed:', statsResponse.status);
          }
          
          if (rentalsResponse.ok) {
            const rentalsData = await rentalsResponse.json();
            setRecentRentals(rentalsData.rentals || []);
            successCount++;
          } else {
            console.error('Rentals endpoint failed:', rentalsResponse.status);
          }
          
          if (deliveriesResponse.ok) {
            const deliveriesData = await deliveriesResponse.json();
            setPendingDeliveries(deliveriesData.deliveries || []);
            successCount++;
          } else {
            console.error('Deliveries endpoint failed:', deliveriesResponse.status);
          }
          
          if (topProductsResponse.ok) {
            const topProductsData = await topProductsResponse.json();
            setTopProducts(topProductsData.products || []);
            successCount++;
          } else {
            console.error('Top products endpoint failed:', topProductsResponse.status);
          }
          
          if (topCustomersResponse.ok) {
            const topCustomersData = await topCustomersResponse.json();
            setTopCustomers(topCustomersData.customers || []);
            successCount++;
          } else {
            console.error('Top customers endpoint failed:', topCustomersResponse.status);
          }
          
          if (overdueResponse.ok) {
            const overdueData = await overdueResponse.json();
            setOverdueRentals(overdueData.rentals || []);
            successCount++;
          } else {
            console.error('Overdue rentals endpoint failed:', overdueResponse.status);
          }
          
          console.log(`Fallback completed: ${successCount}/${totalEndpoints} endpoints succeeded`);
          
          if (successCount === 0) {
            setError('All data endpoints failed. Please check your connection and try again.');
          } else if (successCount < totalEndpoints) {
            setError(`Partial data loaded (${successCount}/${totalEndpoints}). Some information may be incomplete.`);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setError('Failed to load dashboard data. Please try again.');
        }
      }

      // Data is already set above, just ensure loading is complete
      setLoading(false);

    } catch (error) {
      console.error('Error loading admin data:', error);
      
      // Check if it's a rate limiting error
      if (error instanceof Error && error.message.includes('429')) {
        if (retryCount < 3) {
          console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
          setTimeout(() => {
            fetchAdminData(retryCount + 1);
          }, (retryCount + 1) * 2000);
          return;
        } else {
          setError('Too many requests. Please wait a moment and try again.');
        }
      } else if (error instanceof Error && error.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setError('Failed to connect to server. Please try again.');
      } else {
        setError('Failed to load admin data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if user is authenticated and is admin
    if (user && user.role === 'ADMIN') {
      // Add a longer delay to prevent rate limiting
      const timer = setTimeout(() => {
        fetchAdminData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_TRANSIT':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'RETURNED':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your rental business operations, track performance, and monitor key metrics
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Rentals
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.activeRentals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Deliveries
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.pendingDeliveries}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LocalShipping />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Overdue Returns
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.overdueReturns}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Rental Management" />
          <Tab label="Delivery Management" />
          <Tab label="Products & Inventory" />
          <Tab label="Customers" />
          <Tab label="Reports & Analytics" />
          <Tab label="Settings" />
        </Tabs>
        
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          onClick={() => fetchAdminData()}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* Loading and Error Display */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Loading admin data...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={() => fetchAdminData()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Recent Rentals */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Rental Orders</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/admin/rentals')}
                  >
                    View All
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Dates</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentRentals.map((rental) => (
                        <TableRow key={rental.id}>
                          <TableCell>{rental.orderNumber}</TableCell>
                          <TableCell>{rental.customerName}</TableCell>
                          <TableCell>
                            <Chip
                              label={rental.status}
                              color={getStatusColor(rental.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(rental.totalAmount)}</TableCell>
                          <TableCell>
                            {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => navigate(`/admin/rentals/${rental.id}`)}>
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions & Alerts */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={2}>
              {/* Quick Actions */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/admin/products')}
                        fullWidth
                      >
                        Manage Products
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShoppingCart />}
                        onClick={() => navigate('/admin/rentals')}
                        fullWidth
                      >
                        Manage Rentals
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<LocalShipping />}
                        onClick={() => navigate('/admin/deliveries')}
                        fullWidth
                      >
                        Manage Deliveries
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Alerts */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Alerts & Notifications
                    </Typography>
                    {overdueRentals.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        {overdueRentals.length} overdue rental(s)
                      </Alert>
                    )}
                    {stats.pendingDeliveries > 0 && (
                      <Alert severity="info" sx={{ mb: 1 }}>
                        {stats.pendingDeliveries} pending delivery(ies)
                      </Alert>
                    )}
                    {stats.overdueReturns > 0 && (
                      <Alert severity="error">
                        {stats.overdueReturns} overdue return(s)
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Rental Management Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Rental Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/rentals')}
            >
              Manage Rentals
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Rental Orders Overview
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <CheckCircle />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Confirmed Orders"
                        secondary={`${stats.totalRentals} total orders`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <Schedule />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Active Rentals"
                        secondary={`${stats.activeRentals} currently active`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <Warning />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Overdue Returns"
                        secondary={`${stats.overdueReturns} need attention`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Summary
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue from Rentals
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/admin/reports/revenue')}
                  >
                    View Detailed Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Delivery Management Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Delivery Management</Typography>
            <Button
              variant="contained"
              startIcon={<LocalShipping />}
              onClick={() => navigate('/admin/deliveries/new')}
            >
              Schedule Delivery
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Deliveries
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Scheduled Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell>{delivery.customerName}</TableCell>
                        <TableCell>{delivery.productName}</TableCell>
                        <TableCell>{delivery.quantity}</TableCell>
                        <TableCell>
                          <Chip
                            label={delivery.status}
                            color={getDeliveryStatusColor(delivery.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(delivery.scheduledDate)}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Products & Inventory Tab */}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Products & Inventory</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/products/new')}
            >
              Add Product
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Inventory Summary
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Inventory />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Total Products"
                        secondary={`${stats.totalProducts} products in catalog`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <CheckCircle />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Available Products"
                        secondary={`${stats.availableProducts} ready for rental`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Rented Products
                  </Typography>
                  <List>
                    {topProducts.slice(0, 3).map((product) => (
                      <ListItem key={product.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <TrendingUp />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={`${product.totalRentals} rentals • ${formatCurrency(product.totalRevenue)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Customers Tab */}
      {activeTab === 4 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Customer Management</Typography>
            <Button
              variant="contained"
              startIcon={<People />}
              onClick={() => navigate('/admin/customers/new')}
            >
              Add Customer
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Customer Overview
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <People />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Total Customers"
                        secondary={`${stats.totalCustomers} registered customers`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <TrendingUp />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="New This Month"
                        secondary={`${stats.newCustomersThisMonth} new customers`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Customers
                  </Typography>
                  <List>
                    {topCustomers.slice(0, 3).map((customer) => (
                      <ListItem key={customer.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <AttachMoney />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={customer.name}
                          secondary={`${customer.totalRentals} rentals • ${formatCurrency(customer.totalSpent)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Reports & Analytics Tab */}
      {activeTab === 5 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Reports & Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Analytics
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h3" color="primary">
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                    onClick={() => navigate('/admin/reports/revenue')}
                  >
                    Download Revenue Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Rental Analytics
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h3" color="info.main">
                      {stats.totalRentals}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Rentals
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                    onClick={() => navigate('/admin/reports/rentals')}
                  >
                    Download Rental Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Export Reports
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Download />}
                        onClick={() => navigate('/admin/reports/products')}
                      >
                        Products Report
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Download />}
                        onClick={() => navigate('/admin/reports/customers')}
                      >
                        Customers Report
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Download />}
                        onClick={() => navigate('/admin/reports/deliveries')}
                      >
                        Deliveries Report
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Download />}
                        onClick={() => navigate('/admin/reports/analytics')}
                      >
                        Analytics Report
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 6 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            System Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Business Configuration
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Company Name"
                        secondary="Rental Management System"
                      />
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Notification Lead Time"
                        secondary="3 days before return"
                      />
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Late Fee Percentage"
                        secondary="10% of rental cost"
                      />
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Preferences
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Auto-generate invoices"
                        secondary="Automatically create invoices for confirmed orders"
                      />
                      <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email notifications"
                        secondary="Send email notifications to customers"
                      />
                      <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="SMS notifications"
                        secondary="Send SMS notifications for urgent updates"
                      />
                      <Switch />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard; 