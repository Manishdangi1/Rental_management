import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalOffer, CalendarToday, AccessTime, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format, differenceInDays, differenceInHours, addDays } from 'date-fns';

interface RentalProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  pricelistItems: Array<{
    rentalType: string;
    price: number;
    currency: string;
    discount: number;
  }>;
  specifications: any;
  totalQuantity: number;
  availableQuantity: number;
  minimumRentalDays: number;
  maximumRentalDays: number;
}

interface RentalSelection {
  productId: string;
  startDate: Date | null;
  endDate: Date | null;
  quantity: number;
  rentalType: string;
  totalPrice: number;
}

const RentalProductSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRentals, setSelectedRentals] = useState<RentalSelection[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    fetchRentalProducts();
  }, []);

  useEffect(() => {
    calculateCartTotal();
  }, [selectedRentals]);

  const fetchRentalProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get('/api/products?limit=20&rentable=true');
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch rental products:', error);
      setError('Failed to load rental products');
    } finally {
      setLoading(false);
    }
  };

  const calculateCartTotal = () => {
    const total = selectedRentals.reduce((sum, rental) => sum + rental.totalPrice, 0);
    setCartTotal(total);
  };

  const handleDateChange = (productId: string, field: 'startDate' | 'endDate', date: Date | null) => {
    setSelectedRentals(prev => {
      const existing = prev.find(r => r.productId === productId);
      if (existing) {
        const updated = { ...existing, [field]: date };
        
        // Recalculate price if both dates are set
        if (updated.startDate && updated.endDate) {
          const days = differenceInDays(updated.endDate, updated.startDate);
          const hours = differenceInHours(updated.endDate, updated.startDate);
          
          // Find the best pricing option
          const product = products.find(p => p.id === productId);
          if (product) {
            let bestPrice = 0;
            let bestType = '';
            
            product.pricelistItems.forEach(item => {
              let itemPrice = 0;
              switch (item.rentalType) {
                case 'HOURLY':
                  itemPrice = item.price * hours;
                  break;
                case 'DAILY':
                  itemPrice = item.price * Math.max(1, days);
                  break;
                case 'WEEKLY':
                  itemPrice = item.price * Math.ceil(days / 7);
                  break;
                case 'MONTHLY':
                  itemPrice = item.price * Math.ceil(days / 30);
                  break;
              }
              
              if (bestPrice === 0 || itemPrice < bestPrice) {
                bestPrice = itemPrice;
                bestType = item.rentalType;
              }
            });
            
            updated.rentalType = bestType;
            updated.totalPrice = bestPrice * updated.quantity;
          }
        }
        
        return prev.map(r => r.productId === productId ? updated : r);
      } else {
        // Create new rental selection
        const product = products.find(p => p.id === productId);
        if (product) {
          return [...prev, {
            productId,
            startDate: field === 'startDate' ? date : null,
            endDate: field === 'endDate' ? date : null,
            quantity: 1,
            rentalType: product.pricelistItems[0]?.rentalType || 'DAILY',
            totalPrice: 0
          }];
        }
      }
      return prev;
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedRentals(prev => 
      prev.map(r => {
        if (r.productId === productId) {
          const product = products.find(p => p.id === productId);
          if (product && r.startDate && r.endDate) {
            const days = differenceInDays(r.endDate, r.startDate);
            const hours = differenceInHours(r.endDate, r.startDate);
            
            let basePrice = 0;
            switch (r.rentalType) {
              case 'HOURLY':
                basePrice = product.pricelistItems.find(item => item.rentalType === 'HOURLY')?.price || 0;
                basePrice *= hours;
                break;
              case 'DAILY':
                basePrice = product.pricelistItems.find(item => item.rentalType === 'DAILY')?.price || 0;
                basePrice *= Math.max(1, days);
                break;
              case 'WEEKLY':
                basePrice = product.pricelistItems.find(item => item.rentalType === 'WEEKLY')?.price || 0;
                basePrice *= Math.ceil(days / 7);
                break;
              case 'MONTHLY':
                basePrice = product.pricelistItems.find(item => item.rentalType === 'MONTHLY')?.price || 0;
                basePrice *= Math.ceil(days / 30);
                break;
            }
            
            return { ...r, quantity, totalPrice: basePrice * quantity };
          }
        }
        return r;
      })
    );
  };

  const addToCart = (productId: string) => {
    const rental = selectedRentals.find(r => r.productId === productId);
    if (rental && rental.startDate && rental.endDate && rental.totalPrice > 0) {
      // Add to cart logic here
      console.log('Adding to cart:', rental);
      // Navigate to cart or show success message
    }
  };

  const proceedToCheckout = () => {
    if (selectedRentals.length > 0) {
      // Store selected rentals in context or localStorage
      localStorage.setItem('rentalSelections', JSON.stringify(selectedRentals));
      navigate('/rentals/checkout');
    }
  };

  const getRentalTypeLabel = (type: string) => {
    switch (type) {
      case 'HOURLY': return 'per hour';
      case 'DAILY': return 'per day';
      case 'WEEKLY': return 'per week';
      case 'MONTHLY': return 'per month';
      default: return 'per day';
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Select Rental Products
        </Typography>
        {selectedRentals.length > 0 && (
          <Paper sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="h6" gutterBottom>
              Cart Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedRentals.length} item(s) selected
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              Total: {formatPrice(cartTotal)}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={proceedToCheckout}
              sx={{ mt: 2 }}
              startIcon={<ShoppingCart />}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        )}
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => {
          const selectedRental = selectedRentals.find(r => r.productId === product.id);
          const isSelected = !!selectedRental;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip label={product.category?.name || 'Uncategorized'} size="small" color="primary" />
                    <Chip 
                      label={`${product.availableQuantity} available`} 
                      size="small" 
                      color={product.availableQuantity > 0 ? 'success' : 'error'}
                    />
                  </Box>
                  
                  <Typography gutterBottom variant="h6" component="h3">
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>

                  {/* Pricing Display */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalOffer sx={{ mr: 0.5, fontSize: 16 }} />
                      Pricing Options:
                    </Typography>
                    {product.pricelistItems.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                        {formatPrice(item.price)} {getRentalTypeLabel(item.rentalType)}
                      </Typography>
                    ))}
                  </Box>

                  {/* Rental Duration Constraints */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ mr: 0.5, fontSize: 16 }} />
                      Rental Duration:
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Min: {product.minimumRentalDays} days | Max: {product.maximumRentalDays} days
                    </Typography>
                  </Box>

                  {/* Date Selection */}
                  {isSelected && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ mr: 0.5, fontSize: 16 }} />
                        Select Dates:
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <DatePicker
                            label="Start Date"
                            value={selectedRental.startDate}
                            onChange={(date) => handleDateChange(product.id, 'startDate', date)}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true
                              }
                            }}
                            minDate={new Date()}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <DatePicker
                            label="End Date"
                            value={selectedRental.endDate}
                            onChange={(date) => handleDateChange(product.id, 'endDate', date)}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true
                              }
                            }}
                            minDate={selectedRental.startDate || addDays(new Date(), 1)}
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Quantity Selection */}
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Quantity</InputLabel>
                          <Select
                            value={selectedRental.quantity}
                            label="Quantity"
                            onChange={(e) => handleQuantityChange(product.id, e.target.value as number)}
                          >
                            {[...Array(Math.min(5, product.availableQuantity))].map((_, i) => (
                              <MenuItem key={i + 1} value={i + 1}>
                                {i + 1}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Total Price */}
                      {selectedRental.totalPrice > 0 && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="white" textAlign="center">
                            Total: {formatPrice(selectedRental.totalPrice)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  {!isSelected ? (
                    <Button 
                      size="small" 
                      color="primary" 
                      fullWidth
                      onClick={() => handleDateChange(product.id, 'startDate', new Date())}
                      disabled={product.availableQuantity === 0}
                    >
                      Select for Rental
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      color="primary" 
                      fullWidth
                      onClick={() => addToCart(product.id)}
                      disabled={!selectedRental.startDate || !selectedRental.endDate || selectedRental.totalPrice === 0}
                    >
                      Add to Cart
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {products.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No rental products available at the moment.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default RentalProductSelection; 