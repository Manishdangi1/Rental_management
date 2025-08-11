import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - replace with actual API calls
  const stats = [
    { title: 'Active Rentals', value: '3', color: '#1976d2' },
    { title: 'Total Rentals', value: '12', color: '#388e3c' },
    { title: 'Pending Returns', value: '1', color: '#f57c00' },
    { title: 'Total Spent', value: '$450', color: '#d32f2f' }
  ];

  const recentRentals = [
    { id: 1, item: 'Laptop', startDate: '2024-01-15', endDate: '2024-01-22', status: 'Active' },
    { id: 2, item: 'Camera', startDate: '2024-01-10', endDate: '2024-01-17', status: 'Completed' },
    { id: 3, item: 'Projector', startDate: '2024-01-08', endDate: '2024-01-15', status: 'Completed' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.firstName || 'User'}!
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
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
              {recentRentals.map((rental) => (
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
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage; 