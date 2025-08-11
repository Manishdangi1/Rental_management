import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Divider
} from '@mui/material';

const RentalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data - replace with actual API call
  const rental = {
    id: parseInt(id || '1'),
    item: 'MacBook Pro 16"',
    description: 'High-performance laptop perfect for video editing, software development, and graphic design.',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    status: 'Active',
    totalCost: 299.99,
    dailyRate: 42.85,
    image: 'https://via.placeholder.com/400x300',
    specifications: [
      '16-inch Retina Display',
      'M2 Pro Chip',
      '16GB Unified Memory',
      '512GB SSD Storage',
      'Backlit Magic Keyboard'
    ],
    pickupLocation: 'Main Office - 123 Main St',
    returnLocation: 'Main Office - 123 Main St',
    contactPerson: 'John Doe',
    contactPhone: '+1 (555) 123-4567'
  };

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
        <Grid item xs={12} md={6}>
          <Card>
            <Box
              component="img"
              src={rental.image}
              alt={rental.item}
              sx={{ width: '100%', height: 300, objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {rental.item}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {rental.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={rental.status}
                  color={getStatusColor(rental.status) as any}
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6" color="primary">
                  ${rental.totalCost}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Rental Period
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Start Date:</strong> {rental.startDate}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>End Date:</strong> {rental.endDate}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Daily Rate:</strong> ${rental.dailyRate}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Pickup & Return
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Pickup Location:</strong> {rental.pickupLocation}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Return Location:</strong> {rental.returnLocation}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Contact:</strong> {rental.contactPerson} - {rental.contactPhone}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Specifications
              </Typography>
              <Grid container spacing={2}>
                {rental.specifications.map((spec, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          mr: 1
                        }}
                      />
                      {spec}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {rental.status === 'Active' && (
                  <>
                    <Button variant="contained" color="primary">
                      Extend Rental
                    </Button>
                    <Button variant="outlined" color="secondary">
                      Report Issue
                    </Button>
                  </>
                )}
                <Button variant="outlined" color="primary">
                  Download Receipt
                </Button>
                <Button variant="outlined" color="primary">
                  Contact Support
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