import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sku: string;
  features: string[];
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addRentalItem } = useCart();
  
  const [rentalType, setRentalType] = useState<'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('DAILY');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    if (startDate >= endDate) {
      alert('End date must be after start date');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.image,
      quantity: quantity,
      rentalType: rentalType,
      unitPrice: product.price,
      totalPrice: product.price * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), // Calculate based on duration
      startDate: startDate,
      endDate: endDate,
      minimumDays: 1,
      maximumDays: 365,
      invoiceStatus: 'NOTHING_TO_INVOICE'
    };

    console.log('ProductDetailPage: Adding item to cart:', cartItem);
    addRentalItem(cartItem);
    alert('Item added to cart!');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading product details...
        </Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Alert>
        <Typography variant="h6" color="textSecondary">
          Unable to load product details. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.image}
              alt={product.name}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price} per day
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Features:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {product.features.map((feature, index) => (
              <Typography key={index} component="li" variant="body1" paragraph>
                {feature}
              </Typography>
            ))}
          </Box>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rental Details:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rental Type</InputLabel>
                  <Select
                    value={rentalType}
                    label="Rental Type"
                    onChange={(e) => setRentalType(e.target.value as any)}
                  >
                    <MenuItem value="HOURLY">Hourly</MenuItem>
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="YEARLY">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleAddToCart}
            sx={{ mt: 2 }}
            fullWidth
          >
            Add to Rental Cart
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage; 