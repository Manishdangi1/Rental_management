import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

interface RentalItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Rental {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  securityDeposit: number;
  createdAt: string;
  items: RentalItem[];
}

const RentalsPage: React.FC = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRentals();
    }
  }, [user]);

  const fetchUserRentals = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get(`/api/rentals?customerId=${user?.id}`);
      if (response.data && response.data.rentals) {
        setRentals(response.data.rentals);
      }
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      setError('Failed to load your rentals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'OVERDUE':
        return 'Overdue';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchUserRentals} variant="outlined">
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Rentals
        </Typography>
        <Button
          component={Link}
          to="/rentals/new"
          variant="contained"
          color="primary"
        >
          Rent New Item
        </Button>
      </Box>

      {rentals.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No rentals found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by renting your first item!
          </Typography>
          <Button
            component={Link}
            to="/rentals/new"
            variant="contained"
            color="primary"
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {rentals.map((rental) => (
            <Grid item xs={12} md={6} key={rental.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {rental.items.length > 1 
                        ? `${rental.items.length} Items` 
                        : rental.items[0]?.product.name || 'Unknown Product'
                      }
                    </Typography>
                    <Chip
                      label={getStatusLabel(rental.status)}
                      color={getStatusColor(rental.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${rental.totalAmount.toFixed(2)}
                    </Typography>
                    {rental.securityDeposit > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        +${rental.securityDeposit.toFixed(2)} deposit
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Created: {formatDate(rental.createdAt)}
                  </Typography>
                  
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
                    {rental.status === 'CONFIRMED' && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        Track Delivery
                      </Button>
                    )}
                    {rental.status === 'IN_PROGRESS' && (
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
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RentalsPage; 