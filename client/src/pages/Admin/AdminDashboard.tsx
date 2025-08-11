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
  CircularProgress
} from '@mui/material';
import {
  People,
  ShoppingCart,
  Inventory,
  AttachMoney,
  TrendingUp,
  Notifications,
  Add,
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import { formatStatusForDisplay, getStatusColor } from '../../utils/statusUtils';

interface DashboardStats {
  totalUsers: number;
  totalRentals: number;
  totalProducts: number;
  totalRevenue: number;
  quotationRentals: number;
  quotationSentRentals: number;
  pickedUpRentals: number;
  returnedRentals: number;
  reservedRentals: number;
}

interface RecentRental {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRentals: 0,
    totalProducts: 0,
    totalRevenue: 0,
    quotationRentals: 0,
    quotationSentRentals: 0,
    pickedUpRentals: 0,
    returnedRentals: 0,
    reservedRentals: 0
  });
  
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const [usersResponse, rentalsResponse, productsResponse] = await Promise.all([
        api.get('/admin/users/count'),
        api.get('/admin/rentals/stats'),
        api.get('/admin/products/count')
      ]);

      const rentalStats = rentalsResponse.data;
      const totalUsers = usersResponse.data.count;
      const totalProducts = productsResponse.data.count;
      const totalRentals = rentalStats.totalRentals;
      const totalRevenue = rentalStats.totalRevenue;

      setStats({
        totalUsers,
        totalRentals,
        totalProducts,
        totalRevenue,
        quotationRentals: rentalStats.quotationRentals || 0,
        quotationSentRentals: rentalStats.quotationSentRentals || 0,
        pickedUpRentals: rentalStats.pickedUpRentals || 0,
        returnedRentals: rentalStats.returnedRentals || 0,
        reservedRentals: rentalStats.reservedRentals || 0
      });

      // Fetch recent rentals
      const recentRentalsResponse = await api.get('/admin/rentals/recent?limit=5');
      setRecentRentals(recentRentalsResponse.data.rentals);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New User',
      icon: <People />,
      color: 'primary',
      path: '/admin/users'
    },
    {
      title: 'Create Rental',
      icon: <ShoppingCart />,
      color: 'secondary',
      path: '/admin/rentals'
    },
    {
      title: 'Add Product',
      icon: <Inventory />,
      color: 'success',
      path: '/admin/products'
    },
    {
      title: 'View Reports',
      icon: <TrendingUp />,
      color: 'info',
      path: '/admin/reports'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName || 'Admin'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your rental business today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Rentals
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRentals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalProducts}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Inventory />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: `${action.color}.main`, mx: 'auto', mb: 2 }}>
                  {action.icon}
                </Avatar>
                <Typography variant="body1">
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Rentals
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/admin/rentals')}
              >
                View All
              </Button>
            </Box>
            <List>
              {recentRentals.map((rental, index) => (
                <React.Fragment key={rental.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ShoppingCart />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={rental.orderNumber}
                      secondary={`${rental.customerName} • $${rental.totalAmount} • ${rental.createdAt}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={formatStatusForDisplay(rental.status)} 
                        color={getStatusColor(rental.status) as any}
                        size="small"
                      />
                      <IconButton size="small" onClick={() => navigate(`/admin/rentals/${rental.id}`)}>
                        <Visibility />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < recentRentals.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rental Status Overview
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Quotation Sent</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.quotationSentRentals}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Picked Up</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.pickedUpRentals}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Returned</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.returnedRentals}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Reserved</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.reservedRentals}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Quotation</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.quotationRentals}</Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2 }}
              onClick={() => navigate('/admin/reports')}
            >
              View Detailed Reports
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 