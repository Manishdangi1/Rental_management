import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import { AddShoppingCart, CalendarToday, AttachMoney } from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  category: string;
  availability: boolean;
  minimumRentalDays: number;
  maximumRentalDays: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rentalDays, setRentalDays] = useState(product.minimumRentalDays);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddToCart = () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    if (rentalDays < product.minimumRentalDays || rentalDays > product.maximumRentalDays) {
      alert(`Rental days must be between ${product.minimumRentalDays} and ${product.maximumRentalDays}`);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const calculatedRentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (calculatedRentalDays !== rentalDays) {
      alert('Rental days do not match selected dates');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      sku: product.id, // Use product ID as SKU for now
      image: product.image,
      quantity,
      rentalType: 'DAILY' as const, // Default to daily rental
      unitPrice: product.basePrice,
      totalPrice: product.basePrice * quantity * rentalDays,
      startDate: start,
      endDate: end,
      minimumDays: product.minimumRentalDays,
      maximumDays: product.maximumRentalDays,
      invoiceStatus: 'PENDING'
    };

    addItem(cartItem);
    setShowSuccess(true);
    setDialogOpen(false);
    
    // Reset form
    setRentalDays(product.minimumRentalDays);
    setQuantity(1);
    setStartDate('');
    setEndDate('');

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartDate(value);
      if (endDate) {
        const start = new Date(value);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          setRentalDays(days);
        }
      }
    } else {
      setEndDate(value);
      if (startDate) {
        const start = new Date(startDate);
        const end = new Date(value);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          setRentalDays(days);
        }
      }
    }
  };

  const calculateTotalPrice = () => {
    return product.basePrice * quantity * rentalDays;
  };

  if (!product) {
    return null;
  }

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {product.name}
            </Typography>
            <Chip
              label={product.category}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {product.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AttachMoney color="primary" />
            <Typography variant="h6" color="primary">
              {product.basePrice}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              /day
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Min: {product.minimumRentalDays} days | Max: {product.maximumRentalDays} days
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddShoppingCart />}
            onClick={() => setDialogOpen(true)}
            fullWidth
            disabled={!product.availability}
            sx={{ mt: 'auto' }}
          >
            {product.availability ? 'Add to Cart' : 'Not Available'}
          </Button>
        </CardContent>
      </Card>

      {/* Rental Configuration Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Rental</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {product.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: startDate || new Date().toISOString().split('T')[0] }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Rental Days"
              type="number"
              value={rentalDays}
              onChange={(e) => setRentalDays(Number(e.target.value))}
              fullWidth
              inputProps={{
                min: product.minimumRentalDays,
                max: product.maximumRentalDays
              }}
            />
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>

          {/* Rental Summary */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rental Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Base Price:</Typography>
              <Typography variant="body2">${product.basePrice}/day</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Quantity:</Typography>
              <Typography variant="body2">{quantity}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Rental Days:</Typography>
              <Typography variant="body2">{rentalDays}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${calculateTotalPrice().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddToCart} variant="contained">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Alert */}
      {showSuccess && (
        <Alert
          severity="success"
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300
          }}
          onClose={() => setShowSuccess(false)}
        >
          {product.name} added to cart successfully!
        </Alert>
      )}
    </>
  );
};

export default ProductCard; 