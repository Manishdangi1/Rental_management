import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  IconButton,
  TextField,
  Divider,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';
import { getInvoiceStatusColor, getInvoiceStatusLabel } from '../../utils/invoiceStatusUtils';

const CartPage: React.FC = () => {
  const { items, removeRentalItem, updateRentalItemQuantity, clearRentalCart } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateRentalItemQuantity(itemId, newQuantity);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Rental Cart is Empty
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Looks like you haven't added any rental items to your cart yet.
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          color="primary"
          size="large"
        >
          Browse Rental Items
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rental Cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Box
                      component="img"
                      src={item.image || 'https://via.placeholder.com/150x100'}
                      alt={item.name}
                      sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.rentalType === 'HOURLY' ? 'Hourly Rate' : 
                       item.rentalType === 'DAILY' ? 'Daily Rate' :
                       item.rentalType === 'WEEKLY' ? 'Weekly Rate' :
                       item.rentalType === 'MONTHLY' ? 'Monthly Rate' : 'Yearly Rate'}: ${item.unitPrice}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rental Period: {item.rentalType}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Duration: {Math.ceil((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      From: {item.startDate.toLocaleDateString()} - To: {item.endDate.toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={getInvoiceStatusLabel(item.invoiceStatus || 'NOTHING_TO_INVOICE')}
                        color={getInvoiceStatusColor(item.invoiceStatus || 'NOTHING_TO_INVOICE') as any}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            updateRentalItemQuantity(item.id, value);
                          }
                        }}
                        sx={{ width: 60, textAlign: 'center' }}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant="h6" color="primary">
                      ${item.totalPrice.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => removeRentalItem(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearRentalCart}
            >
              Clear Cart
            </Button>
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              color="primary"
            >
              Continue Browsing
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rental Summary
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Rental Subtotal ({items.length} items)</Typography>
                  <Typography>${calculateSubtotal().toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Security Deposit (20%)</Typography>
                  <Typography>${(calculateSubtotal() * 0.2).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax (8%)</Typography>
                  <Typography>${calculateTax().toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ${(calculateSubtotal() + calculateSubtotal() * 0.2 + calculateTax()).toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Button
                component={Link}
                to="/checkout"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={items.length === 0}
              >
                Proceed to Rental Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage; 