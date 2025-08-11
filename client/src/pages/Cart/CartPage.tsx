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
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';

const CartPage: React.FC = () => {
  const { items, removeItem, updateItemQuantity, clearCart } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateItemQuantity(itemId, newQuantity);
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
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Looks like you haven't added any items to your cart yet.
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          color="primary"
          size="large"
        >
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
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
                      Daily Rate: ${item.unitPrice}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rental Type: {item.rentalType}
                    </Typography>
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
                            updateItemQuantity(item.id, value);
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
                      onClick={() => removeItem(item.id)}
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
              onClick={clearCart}
            >
              Clear Cart
            </Button>
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              color="primary"
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal ({items.length} items)</Typography>
                  <Typography>${calculateSubtotal().toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax (8%)</Typography>
                  <Typography>${calculateTax().toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ${calculateTotal().toFixed(2)}
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
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage; 