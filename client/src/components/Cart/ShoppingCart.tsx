import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';

const ShoppingCartComponent: React.FC = () => {
  const { state: cartState, removeItem, clearCart } = useCart();

  if (!cartState || !cartState.items) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Cart data not available
        </Typography>
      </Paper>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse products and add them to your cart to get started.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Shopping Cart
      </Typography>
      
      <List>
        {cartState.items.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  src={item.image}
                  variant="rounded"
                  sx={{ width: 50, height: 50 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">{item.name}</Typography>
                    <Chip
                      label={item.rentalType?.toLowerCase() || 'daily'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.quantity} × ${item.unitPrice || 0}/day
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.startDate?.toLocaleDateString() || 'N/A'} - {item.endDate?.toLocaleDateString() || 'N/A'}
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                  ${(item.totalPrice || 0).toFixed(2)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeItem(item.id)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
            {index < cartState.items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Subtotal:</Typography>
          <Typography>${(cartState.totalAmount || 0).toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Security Deposit:</Typography>
          <Typography>${(cartState.securityDeposit || 0).toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            ${(cartState.grandTotal || 0).toFixed(2)}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={clearCart}
          color="error"
        >
          Clear Cart
        </Button>
        <Button
          variant="contained"
          fullWidth
          disabled
        >
          Proceed to Checkout
        </Button>
      </Box>
    </Paper>
  );
};

export default ShoppingCartComponent; 