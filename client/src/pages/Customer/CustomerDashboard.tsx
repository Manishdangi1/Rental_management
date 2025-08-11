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
  useMediaQuery
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Receipt,
  Payment,
  Add,
  Visibility,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface CustomerRental {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeRentals, setActiveRentals] = useState<CustomerRental[]>([]);
  const [recentRentals, setRecentRentals] = useState<CustomerRental[]>([]);
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    totalSpent: 0,
    upcomingDeliveries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading customer data
    const loadCustomerData = async () => {
      try {
        setStats({
          totalRentals: 12,
          activeRentals: 3,
          totalSpent: 2847,
          upcomingDeliveries: 1
        });

        setActiveRentals([
          {
            id: '1',
            orderNumber: 'RO-1754916845853-006',
            status: 'IN_PROGRESS',
            totalAmount: 395,
            startDate: '2024-01-15',
            endDate: '2024-01-20',
            items: [
              { productName: 'Camping Tent Set', quantity: 1 },
              { productName: 'Portable Generator', quantity: 1 }
            ]
          },
          {
            id: '2',
            orderNumber: 'RO-1754916845854-036',
            status: 'CONFIRMED',
            totalAmount: 528,
            startDate: '2024-01-22',
            endDate: '2024-01-25',
            items: [
              { productName: 'BBQ Grill Set', quantity: 1 },
              { productName: 'Outdoor Furniture Set', quantity: 1 }
            ]
          }
        ]);

        setRecentRentals([
          {
            id: '3',
            orderNumber: 'RO-1754916845853-024',
            status: 'COMPLETED',
            totalAmount: 711,
            startDate: '2024-01-01',
            endDate: '2024-01-05',
            items: [
              { productName: 'Party Tent 10x15', quantity: 1 },
              { productName: 'Table & Chair Set', quantity: 1 }
            ]
          }
        ]);
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const quickActions = [
    {
      title: 'Browse Products',
      icon: <Add />,
      color: 'primary',
      path: '/products'
    },
    {
      title: 'View All Rentals',
      icon: <ShoppingCart />,
      color: 'secondary',
      path: '/customer/rentals'
    },
    {
      title: 'Check Deliveries',
      icon: <LocalShipping />,
      color: 'success',
      path: '/customer/deliveries'
    },
    {
      title: 'Payment History',
      icon: <Payment />,
      color: 'info',
      path: '/customer/payments'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName || 'Customer'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your rental activity.
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
                    Total Rentals
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRentals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                    Active Rentals
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeRentals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <CalendarToday />
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
                    Total Spent
                  </Typography>
                  <Typography variant="h4">
                    ${stats.totalSpent}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Upcoming Deliveries
                  </Typography>
                  <Typography variant="h4">
                    {stats.upcomingDeliveries}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <LocalShipping />
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

      {/* Active Rentals */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Active Rentals
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/customer/rentals')}
              >
                View All
              </Button>
            </Box>
            {activeRentals.length > 0 ? (
              <List>
                {activeRentals.map((rental, index) => (
                  <React.Fragment key={rental.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ShoppingCart />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={rental.orderNumber}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {rental.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {rental.startDate} - {rental.endDate} • ${rental.totalAmount}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={rental.status} 
                          color={getStatusColor(rental.status) as any}
                          size="small"
                        />
                        <IconButton size="small" onClick={() => navigate(`/customer/rentals/${rental.id}`)}>
                          <Visibility />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < activeRentals.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No active rentals
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/products')}
                >
                  Browse Products
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {recentRentals.length > 0 ? (
              <Box>
                {recentRentals.map((rental) => (
                  <Box key={rental.id} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {rental.orderNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rental.startDate} - {rental.endDate}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label={rental.status} 
                        color={getStatusColor(rental.status) as any}
                        size="small"
                      />
                      <Typography variant="body2" fontWeight="bold">
                        ${rental.totalAmount}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent activity
              </Typography>
            )}
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 2 }}
              onClick={() => navigate('/customer/rentals')}
            >
              View Rental History
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard; 