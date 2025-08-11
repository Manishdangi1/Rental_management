import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  LocalShipping,
  Favorite,
  TrendingUp,
  Star,
  Person,
  Search,
  Add,
  CalendarToday,
  Payment,
  History,
  Notifications
} from '@mui/icons-material';

const CustomerDashboard: React.FC = () => {
  // Mock data for customer rental management
  const activeRentals = [
    { id: 1, product: 'Professional Camera Kit', startDate: '2024-01-15', endDate: '2024-01-20', status: 'Active', amount: 299.99, pickupTime: '10:00 AM' },
    { id: 2, product: 'Audio System Pro', startDate: '2024-01-22', endDate: '2024-01-25', status: 'Upcoming', amount: 199.99, pickupTime: '2:00 PM' }
  ];

  const recentRentals = [
    { id: 3, product: 'Lighting Equipment', startDate: '2024-01-10', endDate: '2024-01-12', status: 'Completed', amount: 149.99, rating: 5 },
    { id: 4, product: 'DJ Mixer Pro', startDate: '2024-01-05', endDate: '2024-01-08', status: 'Completed', amount: 179.99, rating: 4 }
  ];

  const rentalOffers = [
    { id: 1, title: 'Weekend Special', discount: '25% OFF', category: 'Weekend Rentals', validUntil: '3 days left', code: 'WEEKEND25' },
    { id: 2, title: 'Long-term Discount', discount: '30% OFF', category: '7+ Days', validUntil: 'Always available', code: 'LONGTERM30' },
    { id: 3, title: 'First Time User', discount: '15% OFF', category: 'New Customer', validUntil: '7 days left', code: 'WELCOME15' }
  ];

  const stats = {
    totalRentals: 18,
    totalSpent: 2847.85,
    activeRentals: 2,
    loyaltyPoints: 720
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Rental Dashboard 🎯
        </Typography>
        <Typography variant="body1" color="6b7280">
          Browse equipment, manage your rentals, and track your rental history
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.totalRentals}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Rentals
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <LocalShipping sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    ${stats.totalSpent.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Spent
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <TrendingUp sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.activeRentals}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Rentals
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CalendarToday sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.loyaltyPoints}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Loyalty Points
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Star sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Active & Upcoming Rentals */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Active & Upcoming Rentals
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<LocalShipping />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  View All Rentals
                </Button>
              </Box>
              
              <List sx={{ p: 0 }}>
                {activeRentals.map((rental, index) => (
                  <React.Fragment key={rental.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {rental.product}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {rental.startDate} - {rental.endDate}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pickup: {rental.pickupTime}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          ${rental.amount}
                        </Typography>
                        <Chip 
                          label={rental.status} 
                          size="small"
                          color={
                            rental.status === 'Active' ? 'success' :
                            rental.status === 'Upcoming' ? 'warning' : 'default'
                          }
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                    {index < activeRentals.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Rental Offers */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
                Special Offers
              </Typography>
              
              <Stack spacing={2}>
                {rentalOffers.map((offer) => (
                  <Paper
                    key={offer.id}
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                      borderRadius: 2,
                      border: '1px solid #fbbf24'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#92400e' }}>
                        {offer.title}
                      </Typography>
                      <Chip 
                        label={offer.discount} 
                        size="small"
                        sx={{ 
                          bgcolor: '#dc2626', 
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {offer.category}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {offer.validUntil}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#92400e' }}>
                      Code: {offer.code}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Rental History */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Recent Rental History
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<History />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  View All History
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {recentRentals.map((rental) => (
                  <Grid item xs={12} sm={6} key={rental.id}>
                    <Paper
                      sx={{
                        p: 2,
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#cbd5e1',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {rental.product}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {rental.startDate} - {rental.endDate}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669' }}>
                              ${rental.amount}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {[...Array(rental.rating)].map((_, i) => (
                                <Star key={i} sx={{ fontSize: 16, color: '#fbbf24' }} />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Search />}
                    sx={{ 
                      py: 2, 
                      borderRadius: 2, 
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      }
                    }}
                  >
                    Browse Equipment
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Add />}
                    sx={{ 
                      py: 2, 
                      borderRadius: 2, 
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    New Rental
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LocalShipping />}
                    sx={{ 
                      py: 2, 
                      borderRadius: 2, 
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    My Rentals
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Payment />}
                    sx={{ 
                      py: 2, 
                      borderRadius: 2, 
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    Billing
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard; 