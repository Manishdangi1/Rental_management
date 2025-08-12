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
  Divider,
  CardActions,
  Tooltip,
  Badge,
  Grid
} from '@mui/material';
import { 
  AddShoppingCart, 
  CalendarToday, 
  AttachMoney, 
  Favorite, 
  FavoriteBorder,
  Visibility,
  Star
} from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';

interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  basePrice?: number;
  category?: string;
  categoryId?: string;
  availability?: boolean;
  isActive?: boolean;
  isRentable?: boolean;
  minimumRentalDays: number;
  maximumRentalDays: number;
  totalQuantity?: number;
  availableQuantity?: number;
  pricelistItems?: Array<{
    rentalType: string;
    price: number;
    currency: string;
    discount: number;
  }>;
}

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showActions = true, 
  compact = false 
}) => {
  const { addItem } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rentalDays, setRentalDays] = useState(product.minimumRentalDays);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isProductFavorite = isFavorite(product.id);

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

    // Get the base price from pricelist items or use a default
    const basePrice = product.basePrice || (product.pricelistItems && product.pricelistItems[0]?.price) || 50;

    const cartItem = {
      productId: product.id,
      name: product.name,
      sku: product.id, // Use product ID as SKU for now
      image: product.image || '/placeholder-product.jpg',
      quantity,
      rentalType: 'DAILY' as const, // Default to daily rental
      unitPrice: basePrice,
      totalPrice: basePrice * quantity * rentalDays,
      startDate: start,
      endDate: end,
      minimumDays: product.minimumRentalDays,
      maximumDays: product.maximumRentalDays,
      invoiceStatus: 'PENDING'
    };

    addItem(cartItem);
    setSuccessMessage('Added to cart successfully!');
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

  const handleToggleFavorite = () => {
    if (isProductFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        productId: product.id,
        name: product.name,
        description: product.description,
        image: product.image || '/placeholder-product.jpg',
        basePrice: product.basePrice || (product.pricelistItems && product.pricelistItems[0]?.price) || 50,
        category: product.category || 'General',
        availability: product.availability || product.isActive || false,
        minimumRentalDays: product.minimumRentalDays,
        maximumRentalDays: product.maximumRentalDays,
      });
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = product.basePrice || (product.pricelistItems && product.pricelistItems[0]?.price) || 50;
    return basePrice * quantity * rentalDays;
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartDate(value);
      if (endDate) {
        const start = new Date(value);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        setRentalDays(Math.max(days, product.minimumRentalDays));
      }
    } else {
      setEndDate(value);
      if (startDate) {
        const start = new Date(startDate);
        const end = new Date(value);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        setRentalDays(Math.max(days, product.minimumRentalDays));
      }
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            boxShadow: 8,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out'
          }
        }}
      >
        {/* Favorite Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
            }
          }}
          onClick={handleToggleFavorite}
          color={isProductFavorite ? 'error' : 'default'}
        >
          {isProductFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>

        {/* Product Image */}
        <CardMedia
          component="img"
          height={compact ? "140" : "200"}
          image={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent sx={{ flexGrow: 1, pb: compact ? 1 : 2 }}>
          {/* Product Name */}
          <Typography 
            variant={compact ? "subtitle1" : "h6"} 
            component="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              lineHeight: 1.2,
              minHeight: compact ? 'auto' : '2.4em'
            }}
          >
            {product.name}
          </Typography>

          {/* Category */}
          <Chip
            label={product.category || 'General'}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 1 }}
          />

          {/* Description */}
          {!compact && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                minHeight: '3em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {product.description}
            </Typography>
          )}

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AttachMoney color="primary" />
            <Typography variant="h6" color="primary" fontWeight="bold">
              {product.basePrice || (product.pricelistItems && product.pricelistItems[0]?.price) || 50}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              /day
            </Typography>
          </Box>

          {/* Availability */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={(product.availability || product.isActive || false) ? 'Available' : 'Unavailable'}
              color={(product.availability || product.isActive || false) ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Rental Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Min: {product.minimumRentalDays} days
              {product.maximumRentalDays && ` • Max: ${product.maximumRentalDays} days`}
            </Typography>
          </Box>
        </CardContent>

        {/* Action Buttons */}
        {showActions && (
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => setDialogOpen(true)}
              fullWidth
              sx={{ mb: 1 }}
            >
              View Details
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddShoppingCart />}
              onClick={() => setDialogOpen(true)}
              fullWidth
              disabled={!product.availability}
            >
              Add to Cart
            </Button>
          </CardActions>
        )}
      </Card>

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
          {successMessage}
        </Alert>
      )}

      {/* Rental Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img 
              src={product.image || '/placeholder-product.jpg'} 
              alt={product.name} 
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            />
            <Box>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {product.category}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: startDate || new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rental Days"
                type="number"
                value={rentalDays}
                onChange={(e) => setRentalDays(Math.max(product.minimumRentalDays, parseInt(e.target.value) || product.minimumRentalDays))}
                inputProps={{ 
                  min: product.minimumRentalDays, 
                  max: product.maximumRentalDays 
                }}
                helperText={`Min: ${product.minimumRentalDays}, Max: ${product.maximumRentalDays}`}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Total Price
            </Typography>
            <Typography variant="h4" color="primary" fontWeight="bold">
              ${calculateTotalPrice().toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {quantity} × ${product.basePrice} × {rentalDays} days
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddToCart}
            disabled={!startDate || !endDate}
            startIcon={<AddShoppingCart />}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard; 