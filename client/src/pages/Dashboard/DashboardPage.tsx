import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface DashboardStats {
  activeRentals: number;
  totalRentals: number;
  pendingReturns: number;
  totalSpent: number;
}

interface RecentRental {
  id: string;
  item: string;
  startDate: string;
  endDate: string;
  status: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard statistics
        const statsResponse = await axios.get('/api/dashboard/stats');
        setStats(statsResponse.data);
        
        // Fetch recent rentals
        const rentalsResponse = await axios.get('/api/dashboard/recent-rentals');
        setRecentRentals(rentalsResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="h6" color="textSecondary">
          Unable to load dashboard data. Please try again later.
        </Typography>
      </Container>
    );
  }

  const statsData = [
    { title: 'Active Rentals', value: stats?.activeRentals?.toString() || '0', color: '#1976d2' },
    { title: 'Total Rentals', value: stats?.totalRentals?.toString() || '0', color: '#388e3c' },
    { title: 'Pending Returns', value: stats?.pendingReturns?.toString() || '0', color: '#f57c00' },
    { title: 'Total Spent', value: `$${stats?.totalSpent || 0}`, color: '#d32f2f' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.firstName || 'User'}!
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" component="h2" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/products"
                  variant="contained"
                  color="primary"
                >
                  Browse Products
                </Button>
                <Button
                  component={Link}
                  to="/rentals"
                  variant="outlined"
                  color="primary"
                >
                  View Rentals
                </Button>
                <Button
                  component={Link}
                  to="/profile"
                  variant="outlined"
                  color="primary"
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Rentals
              </Typography>
              {recentRentals.length > 0 ? (
                recentRentals.map((rental) => (
                  <Box key={rental.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {rental.item}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {rental.startDate} - {rental.endDate}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: rental.status === 'Active' ? 'success.main' : 'text.secondary',
                        fontWeight: 'bold'
                      }}
                    >
                      {rental.status}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  No recent rentals found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage; 