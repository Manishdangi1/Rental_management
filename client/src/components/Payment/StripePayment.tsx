import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

interface StripePaymentProps {
  amount: number;
  invoiceId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const StripePayment: React.FC<StripePaymentProps> = ({
  amount,
  invoiceId,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Stripe is configured
    const key = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;
    if (key && key !== 'pk_test_your_stripe_publishable_key_here' && key.startsWith('pk_')) {
      setStripeLoaded(true);
    } else {
      setStripeError('Stripe is not configured. Please contact support.');
      onError('Stripe is not configured. Please contact support.');
    }
  }, [onError]);

  // If Stripe is not configured, show a fallback message
  if (stripeError) {
    return (
      <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Payment processing is currently unavailable
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please contact customer support to complete your payment.
        </Typography>
      </Paper>
    );
  }

  // If Stripe is not loaded yet, show loading
  if (!stripeLoaded) {
    return (
      <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading payment form...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // For now, show a simple payment form placeholder
  // This prevents white pages while we work on the full Stripe integration
  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Amount to pay: <strong>${amount.toFixed(2)}</strong>
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Stripe payment integration is being configured. For now, please contact customer support to complete your payment.
      </Alert>
      
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Invoice ID: {invoiceId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Amount: ${amount.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StripePayment; 