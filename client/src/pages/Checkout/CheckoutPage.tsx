import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert
} from '@mui/material';
import { useCart } from '../../contexts/CartContext';

const steps = ['Rental Information', 'Payment Details', 'Review & Confirm'];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearRentalCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [error, setError] = useState('');

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate rental information
      if (!shippingData.firstName || !shippingData.lastName || !shippingData.email || 
          !shippingData.address || !shippingData.city || !shippingData.state || !shippingData.zipCode) {
        setError('Please fill in all required rental information fields');
        return;
      }
    } else if (activeStep === 1) {
      // Validate payment information
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
        setError('Please fill in all required payment fields');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically send the rental order to your backend
      console.log('Rental order submitted:', { shippingData, paymentData, items });
      
      // Clear rental cart and redirect to dashboard
      clearRentalCart();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to process rental order. Please try again.');
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateSecurityDeposit = () => {
    return calculateSubtotal() * 0.2; // 20% security deposit
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateSecurityDeposit() + calculateTax();
  };

  const renderRentalForm = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rental Contact Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="firstName"
            value={shippingData.firstName}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="lastName"
            value={shippingData.lastName}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={shippingData.email}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Phone"
            name="phone"
            value={shippingData.phone}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address"
            name="address"
            value={shippingData.address}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="City"
            name="city"
            value={shippingData.city}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="State"
            name="state"
            value={shippingData.state}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            name="zipCode"
            value={shippingData.zipCode}
            onChange={handleShippingChange}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderPaymentForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Card Number"
          name="cardNumber"
          value={paymentData.cardNumber}
          onChange={handlePaymentChange}
          placeholder="1234 5678 9012 3456"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Cardholder Name"
          name="cardholderName"
          value={paymentData.cardholderName}
          onChange={handlePaymentChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Expiry Date"
          name="expiryDate"
          value={paymentData.expiryDate}
          onChange={handlePaymentChange}
          placeholder="MM/YY"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="CVV"
          name="cvv"
          value={paymentData.cvv}
          onChange={handlePaymentChange}
          placeholder="123"
        />
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rental Summary
      </Typography>
      {items.map((item) => (
        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>
            {item.name} x {item.quantity} ({item.rentalType})
          </Typography>
          <Typography>${item.totalPrice.toFixed(2)}</Typography>
        </Box>
      ))}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography>Rental Subtotal</Typography>
        <Typography>${calculateSubtotal().toFixed(2)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography>Security Deposit (20%)</Typography>
        <Typography>${calculateSecurityDeposit().toFixed(2)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography>Tax (8%)</Typography>
        <Typography>${calculateTax().toFixed(2)}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6" color="primary">
          ${calculateTotal().toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderRentalForm();
      case 1:
        return renderPaymentForm();
      case 2:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

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

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {steps[activeStep]}
              </Typography>
              {getStepContent(activeStep)}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rental Summary
              </Typography>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {item.name} x {item.quantity} ({item.rentalType})
                  </Typography>
                  <Typography variant="body2">${item.totalPrice.toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Rental Subtotal</Typography>
                <Typography>${calculateSubtotal().toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Security Deposit (20%)</Typography>
                <Typography>${calculateSecurityDeposit().toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax (8%)</Typography>
                <Typography>${calculateTax().toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Place Order
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default CheckoutPage; 