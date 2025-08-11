import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';

interface RentalItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    description: string;
    images: string[];
    specifications: any;
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
  pickupAddress: string;
  returnAddress: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: RentalItem[];
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

const RentalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRentalDetails();
    }
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get(`/api/rentals/${id}`);
      setRental(response.data);
    } catch (error) {
      console.error('Failed to fetch rental details:', error);
      setError('Failed to load rental details');
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

  const getRentalDuration = (startDate: string, endDate: string) => {
    try {
      const days = differenceInDays(new Date(endDate), new Date(startDate));
      return `${days} day${days !== 1 ? 's' : ''}`;
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !rental) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Rental not found'}
        </Alert>
        <Button component={Link} to="/rentals" variant="outlined">
          Back to Rentals
        </Button>
      </Container>
    );
  }

  // Show success message if coming from checkout
  const successMessage = location.state?.message;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Rental Details
        </Typography>
        <Button
          component={Link}
          to="/rentals"
          variant="outlined"
          color="primary"
        >
          Back to Rentals
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Rental Items */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rental Items
              </Typography>
              <List>
                {rental.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`SKU: ${item.product.sku} | Quantity: ${item.quantity}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="h6" color="primary">
                          ${item.totalPrice.toFixed(2)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < rental.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Rental Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rental Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(rental.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(rental.endDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {getRentalDuration(rental.startDate, rental.endDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(rental.status)}
                    color={getStatusColor(rental.status) as any}
                    size="small"
                  />
                </Grid>
              </Grid>

              {rental.pickupAddress && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pickup Address
                  </Typography>
                  <Typography variant="body2">
                    {rental.pickupAddress}
                  </Typography>
                </Box>
              )}

              {rental.returnAddress && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Return Address
                  </Typography>
                  <Typography variant="body2">
                    {rental.returnAddress}
                  </Typography>
                </Box>
              )}

              {rental.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {rental.notes}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText primary="Rental Amount" />
                  <ListItemSecondaryAction>
                    <Typography variant="body1">
                      ${rental.totalAmount.toFixed(2)}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {rental.securityDeposit > 0 && (
                  <ListItem>
                    <ListItemText primary="Security Deposit" />
                    <ListItemSecondaryAction>
                      <Typography variant="body1">
                        ${rental.securityDeposit.toFixed(2)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                )}
                
                <Divider />
                <ListItem>
                  <ListItemText primary="Total" />
                  <ListItemSecondaryAction>
                    <Typography variant="h6" color="primary">
                      ${(rental.totalAmount + rental.securityDeposit).toFixed(2)}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {formatDate(rental.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {formatDate(rental.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {rental.status === 'CONFIRMED' && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Track Delivery
                  </Button>
                )}
                
                {rental.status === 'IN_PROGRESS' && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                  >
                    Extend Rental
                  </Button>
                )}
                
                {rental.status === 'PENDING' && (
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                  >
                    Cancel Rental
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  fullWidth
                >
                  Download Invoice
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RentalDetailPage; 