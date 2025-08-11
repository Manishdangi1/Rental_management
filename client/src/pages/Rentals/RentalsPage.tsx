import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';

const RentalsPage: React.FC = () => {
  // Mock data - replace with actual API calls
  const rentals = [
    {
      id: 1,
      item: 'MacBook Pro 16"',
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      status: 'Active',
      totalCost: 299.99,
      image: 'https://via.placeholder.com/150x100'
    },
    {
      id: 2,
      item: 'Canon EOS R5',
      startDate: '2024-01-10',
      endDate: '2024-01-17',
      status: 'Completed',
      totalCost: 199.99,
      image: 'https://via.placeholder.com/150x100'
    },
    {
      id: 3,
      item: 'Epson Projector',
      startDate: '2024-01-08',
      endDate: '2024-01-15',
      status: 'Completed',
      totalCost: 149.99,
      image: 'https://via.placeholder.com/150x100'
    },
    {
      id: 4,
      item: 'DJI Drone',
      startDate: '2024-01-20',
      endDate: '2024-01-27',
      status: 'Upcoming',
      totalCost: 399.99,
      image: 'https://via.placeholder.com/150x100'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'default';
      case 'Upcoming':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Rentals
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          color="primary"
        >
          Rent New Item
        </Button>
      </Box>

      <Grid container spacing={3}>
        {rentals.map((rental) => (
          <Grid item xs={12} md={6} key={rental.id}>
            <Card>
              <Box sx={{ display: 'flex' }}>
                <Box
                  component="img"
                  src={rental.image}
                  alt={rental.item}
                  sx={{ width: 150, height: 100, objectFit: 'cover' }}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {rental.item}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {rental.startDate} - {rental.endDate}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ${rental.totalCost}
                    </Typography>
                    <Chip
                      label={rental.status}
                      color={getStatusColor(rental.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={Link}
                      to={`/rentals/${rental.id}`}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      View Details
                    </Button>
                    {rental.status === 'Active' && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        Extend Rental
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RentalsPage; 