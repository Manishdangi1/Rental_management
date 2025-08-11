import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';

interface RentalSelection {
  productId: string;
  startDate: Date | null;
  endDate: Date | null;
  quantity: number;
  rentalType: string;
  totalPrice: number;
}

interface RentalProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  specifications: any;
}

const steps = ['Review Selection', 'Delivery Details', 'Payment & Confirmation'];

const RentalCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [rentalSelections, setRentalSelections] = useState<RentalSelection[]>([]);
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Delivery details
  const [deliveryDetails, setDeliveryDetails] = useState({
    pickupAddress: '',
    returnAddress: '',
    contactName: '',
    contactPhone: '',
    specialInstructions: ''
  });

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [securityDeposit, setSecurityDeposit] = useState(0);

  useEffect(() => {
    loadRentalSelections();
  }, []);

  const loadRentalSelections = () => {
    try {
      const stored = localStorage.getItem('rentalSelections');
      if (stored) {
        const selections = JSON.parse(stored);
        // Convert date strings back to Date objects
        const parsedSelections = selections.map((selection: any) => ({
          ...selection,
          startDate: selection.startDate ? new Date(selection.startDate) : null,
          endDate: selection.endDate ? new Date(selection.endDate) : null
        }));
        setRentalSelections(parsedSelections);
        fetchProducts(parsedSelections.map((s: any) => s.productId));
      } else {
        navigate('/rentals/new');
      }
    } catch (error) {
      console.error('Error loading rental selections:', error);
      navigate('/rentals/new');
    }
  };

  const fetchProducts = async (productIds: string[]) => {
    try {
      const productPromises = productIds.map(id => 
        axios.get(`/api/products/${id}`)
      );
      const responses = await Promise.all(productPromises);
      const fetchedProducts = responses.map(res => res.data.product);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load product details');
    }
  };

  const calculateSubtotal = () => {
    return rentalSelections.reduce((sum, rental) => sum + rental.totalPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + securityDeposit;
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmitRental();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmitRental = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create rental order
      const rentalData = {
        customerId: user?.id,
        startDate: rentalSelections[0].startDate,
        endDate: rentalSelections[0].endDate,
        totalAmount: calculateSubtotal(),
        securityDeposit: securityDeposit,
        pickupAddress: deliveryDetails.pickupAddress,
        returnAddress: deliveryDetails.returnAddress,
        notes: deliveryDetails.specialInstructions,
        items: rentalSelections.map(selection => ({
          productId: selection.productId,
          quantity: selection.quantity,
          unitPrice: selection.totalPrice / selection.quantity,
          totalPrice: selection.totalPrice
        }))
      };

      const response = await axios.post('/api/rentals', rentalData);
      
      if (response.data.rental) {
        // Clear localStorage
        localStorage.removeItem('rentalSelections');
        
        // Navigate to rental confirmation
        navigate(`/rentals/${response.data.rental.id}`, { 
          state: { 
            message: 'Rental order created successfully!' 
          }
        });
      }
    } catch (error: any) {
      console.error('Error creating rental:', error);
      setError(error.response?.data?.message || 'Failed to create rental order');
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const getRentalDuration = (startDate: Date, endDate: Date) => {
    const days = differenceInDays(endDate, startDate);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const renderReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Rental Selection
      </Typography>
      
      <Grid container spacing={3}>
        {rentalSelections.map((selection, index) => {
          const product = getProductById(selection.productId);
          if (!product) return null;

          return (
            <Grid item xs={12} key={selection.productId}>
              <Card>
                <Box sx={{ display: 'flex' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120 }}
                    image={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/120x120?text=No+Image'}
                    alt={product.name}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {product.category?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Quantity
                        </Typography>
                        <Typography variant="body1">
                          {selection.quantity}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {selection.startDate && selection.endDate ? 
                            getRentalDuration(selection.startDate, selection.endDate) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Price
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatPrice(selection.totalPrice)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <List>
          {rentalSelections.map((selection, index) => {
            const product = getProductById(selection.productId);
            return (
              <ListItem key={index}>
                <ListItemText
                  primary={product?.name || 'Unknown Product'}
                  secondary={`${selection.quantity}x for ${selection.startDate && selection.endDate ? 
                    getRentalDuration(selection.startDate, selection.endDate) : 'N/A'}`}
                />
                <ListItemSecondaryAction>
                  <Typography variant="body1">
                    {formatPrice(selection.totalPrice)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
          <Divider />
          <ListItem>
            <ListItemText primary="Subtotal" />
            <ListItemSecondaryAction>
              <Typography variant="h6">
                {formatPrice(calculateSubtotal())}
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );

  const renderDeliveryStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Delivery & Pickup Details
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Pickup Address"
            value={deliveryDetails.pickupAddress}
            onChange={(e) => setDeliveryDetails(prev => ({ ...prev, pickupAddress: e.target.value }))}
            multiline
            rows={3}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Return Address"
            value={deliveryDetails.returnAddress}
            onChange={(e) => setDeliveryDetails(prev => ({ ...prev, returnAddress: e.target.value }))}
            multiline
            rows={3}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Name"
            value={deliveryDetails.contactName}
            onChange={(e) => setDeliveryDetails(prev => ({ ...prev, contactName: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Phone"
            value={deliveryDetails.contactPhone}
            onChange={(e) => setDeliveryDetails(prev => ({ ...prev, contactPhone: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Special Instructions"
            value={deliveryDetails.specialInstructions}
            onChange={(e) => setDeliveryDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
            multiline
            rows={3}
            placeholder="Any special delivery or pickup instructions..."
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment & Confirmation
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="card">Credit/Debit Card</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Security Deposit"
            type="number"
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(Number(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
            helperText="Optional security deposit amount"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Final Order Summary
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Rental Subtotal" />
            <ListItemSecondaryAction>
              <Typography variant="body1">
                {formatPrice(calculateSubtotal())}
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary="Security Deposit" />
            <ListItemSecondaryAction>
              <Typography variant="body1">
                {formatPrice(securityDeposit)}
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Total Amount" />
            <ListItemSecondaryAction>
              <Typography variant="h6" color="primary">
                {formatPrice(calculateTotal())}
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderReviewStep();
      case 1:
        return renderDeliveryStep();
      case 2:
        return renderPaymentStep();
      default:
        return 'Unknown step';
    }
  };

  if (rentalSelections.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">
          No rental selections found. Please go back to select products.
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/rentals/new')}>
          Select Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rental Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {getStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/rentals/new')}
            sx={{ mr: 1 }}
          >
            Modify Selection
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Confirm Rental' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RentalCheckout; 