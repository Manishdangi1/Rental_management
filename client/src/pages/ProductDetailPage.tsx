import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Avatar,
  Badge
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocalOffer,
  Security,
  Info,
  ShoppingCart,
  Favorite,
  Star,
  Schedule,
  LocationOn,
  CheckCircle,
  Warning,
  ExpandMore,
  DirectionsCar,
  Build,
  Description,
  AttachMoney
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, differenceInDays, format, isAfter, isBefore } from 'date-fns';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/axios';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: {
    id: string;
    name: string;
  };
  totalQuantity: number;
  availableQuantity: number;
  minimumRentalDays: number;
  maximumRentalDays?: number;
  basePrice?: number;
  isSeasonal: boolean;
  peakSeasonStart?: string;
  peakSeasonEnd?: string;
  rentalInstructions?: string;
  setupRequirements?: string;
  returnRequirements?: string;
  damagePolicy?: string;
  insuranceRequired: boolean;
  insuranceAmount?: number;
  images: string[];
  specifications?: any;
  pricelistItems: Array<{
    rentalType: string;
    price: number;
    currency: string;
    discount?: number;
    minimumDays: number;
    maximumDays?: number;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addRentalItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Rental states
  const [startDate, setStartDate] = useState<Date | null>(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | null>(addDays(new Date(), 3));
  const [rentalQuantity, setRentalQuantity] = useState(1);
  const [selectedRentalType, setSelectedRentalType] = useState<string>('DAILY');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (startDate && endDate && product) {
      checkAvailability();
    }
  }, [startDate, endDate, product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      
      // Set default rental type if available
      if (response.data.product.pricelistItems.length > 0) {
        setSelectedRentalType(response.data.product.pricelistItems[0].rentalType);
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      setError(error.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate || !product) return;

    try {
      setAvailabilityLoading(true);
      
      const response = await api.get(`/products/${product.id}/availability`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      setAvailability(response.data);
    } catch (error: any) {
      console.error('Error checking availability:', error);
      setAvailability(null);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!product || !startDate || !endDate) return;

    try {
      setPriceLoading(true);
      
      const response = await api.post(`/products/${product.id}/calculate-price`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rentalType: selectedRentalType,
        quantity: rentalQuantity
      });

      setCalculatedPrice(response.data.finalPrice);
    } catch (error: any) {
      console.error('Error calculating price:', error);
      setError('Failed to calculate rental price');
    } finally {
      setPriceLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !startDate || !endDate || !calculatedPrice) return;

    const cartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.images[0],
      quantity: rentalQuantity,
      rentalType: selectedRentalType as 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
      unitPrice: calculatedPrice / rentalQuantity,
      totalPrice: calculatedPrice,
      startDate: startDate,
      endDate: endDate,
      minimumDays: product.minimumRentalDays,
      maximumDays: product.maximumRentalDays,
      invoiceStatus: 'NOTHING_TO_INVOICE'
    };

    addRentalItem(cartItem);
    navigate('/cart');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getProductRating = () => {
    // Mock rating - in real app, this would come from reviews
    return 4.2 + Math.random() * 0.8;
  };

  const isDateRangeValid = () => {
    if (!startDate || !endDate) return false;
    
    const daysDiff = differenceInDays(endDate, startDate);
    if (daysDiff < (product?.minimumRentalDays || 1)) return false;
    if (product?.maximumRentalDays && daysDiff > product.maximumRentalDays) return false;
    
    return true;
  };

  const getSeasonalInfo = () => {
    if (!product?.isSeasonal) return null;
    
    const now = new Date();
    const isPeakSeason = product.peakSeasonStart && product.peakSeasonEnd &&
      isAfter(now, new Date(product.peakSeasonStart)) && 
      isBefore(now, new Date(product.peakSeasonEnd));
    
    return {
      isPeakSeason,
      peakStart: product.peakSeasonStart ? format(new Date(product.peakSeasonStart), 'MMM dd') : null,
      peakEnd: product.peakSeasonEnd ? format(new Date(product.peakSeasonEnd), 'MMM dd') : null
    };
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Product not found'}
        </Alert>
      </Container>
    );
  }

  const seasonalInfo = getSeasonalInfo();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Product Header */}
        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={product.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Category and Rating */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={product.category.name}
                  color="primary"
                  variant="outlined"
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ color: 'warning.main', mr: 0.5 }} />
                  <Typography variant="body1">
                    {getProductRating().toFixed(1)}
                  </Typography>
                </Box>
              </Box>

              {/* Product Name */}
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>

              {/* SKU */}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                SKU: {product.sku}
              </Typography>

              {/* Description */}
              {product.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {product.description}
                </Typography>
              )}

              {/* Features */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {product.insuranceRequired && (
                  <Chip
                    icon={<Security />}
                    label="Insurance Required"
                    color="warning"
                    variant="outlined"
                  />
                )}
                {product.isSeasonal && (
                  <Chip
                    icon={<Schedule />}
                    label="Seasonal Pricing"
                    color="info"
                    variant="outlined"
                  />
                )}
                {product.rentalInstructions && (
                  <Chip
                    icon={<Info />}
                    label="Instructions Available"
                    color="default"
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Availability Status */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={product.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                  color={product.availableQuantity > 0 ? 'success' : 'error'}
                  size="medium"
                  sx={{ fontSize: '1rem' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {product.availableQuantity} of {product.totalQuantity} units available
                </Typography>
              </Box>

              {/* Seasonal Info */}
              {seasonalInfo && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: seasonalInfo.isPeakSeason ? 'warning.50' : 'info.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule color={seasonalInfo.isPeakSeason ? 'warning' : 'info'} />
                    <Typography variant="body2" color={seasonalInfo.isPeakSeason ? 'warning.dark' : 'info.dark'}>
                      {seasonalInfo.isPeakSeason ? 'Peak Season' : 'Off Season'}
                      {seasonalInfo.peakStart && seasonalInfo.peakEnd && 
                        ` (${seasonalInfo.peakStart} - ${seasonalInfo.peakEnd})`
                      }
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={() => setActiveTab(1)}
                  disabled={product.availableQuantity === 0}
                  sx={{ minWidth: 150 }}
                >
                  Rent Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Favorite />}
                  sx={{ minWidth: 150 }}
                >
                  Add to Wishlist
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Product Tabs */}
        <Box sx={{ mt: 6 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Rental Details" icon={<CalendarToday />} />
            <Tab label="Specifications" icon={<Build />} />
            <Tab label="Pricing" icon={<AttachMoney />} />
            <Tab label="Instructions" icon={<Description />} />
          </Tabs>

          {/* Rental Details Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Book Your Rental
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        minDate={addDays(new Date(), 1)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        minDate={startDate ? addDays(startDate, 1) : addDays(new Date(), 2)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Rental Type</InputLabel>
                        <Select
                          value={selectedRentalType}
                          label="Rental Type"
                          onChange={(e: SelectChangeEvent) => setSelectedRentalType(e.target.value)}
                        >
                          {product.pricelistItems.map((item) => (
                            <MenuItem key={item.rentalType} value={item.rentalType}>
                              {item.rentalType} (${item.price}/{item.rentalType.toLowerCase()})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={rentalQuantity}
                        onChange={(e) => setRentalQuantity(parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, max: product.availableQuantity }}
                      />
                    </Grid>
                  </Grid>

                  {/* Availability Check */}
                  {availability && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: availability.isAvailable ? 'success.50' : 'error.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {availability.isAvailable ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Warning color="error" />
                        )}
                        <Typography variant="body2" color={availability.isAvailable ? 'success.dark' : 'error.dark'}>
                          {availability.isAvailable 
                            ? `Available for ${availability.duration} days` 
                            : 'Not available for selected dates'
                          }
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Price Calculation */}
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={calculatePrice}
                      disabled={!isDateRangeValid()}
                      fullWidth
                      size="large"
                    >
                      Calculate Price
                    </Button>
                    
                    {calculatedPrice && (
                      <Paper sx={{ mt: 2, p: 2, bgcolor: 'primary.50' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Total Price: ${calculatedPrice.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {startDate && endDate ? differenceInDays(endDate, startDate) : 0} days
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Rental Summary
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTime />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Minimum Duration"
                        secondary={`${product.minimumRentalDays} days`}
                      />
                    </ListItem>
                    
                    {product.maximumRentalDays && (
                      <ListItem>
                        <ListItemIcon>
                          <Schedule />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Maximum Duration"
                          secondary={`${product.maximumRentalDays} days`}
                        />
                      </ListItem>
                    )}
                    
                    {product.insuranceRequired && (
                      <ListItem>
                        <ListItemIcon>
                          <Security />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Insurance Required"
                          secondary={product.insuranceAmount ? `$${product.insuranceAmount}` : 'Yes'}
                        />
                      </ListItem>
                    )}
                  </List>

                  {calculatedPrice && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ my: 2 }} />
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<ShoppingCart />}
                        onClick={handleAddToCart}
                        fullWidth
                        disabled={!availability?.isAvailable}
                      >
                        Add to Cart - ${calculatedPrice.toFixed(2)}
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Specifications Tab */}
          <TabPanel value={activeTab} index={1}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Product Specifications
              </Typography>
              
              {product.specifications ? (
                <Grid container spacing={3}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {key}
                        </Typography>
                        <Typography variant="body1">
                          {String(value)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No specifications available for this product.
                </Typography>
              )}
            </Paper>
          </TabPanel>

          {/* Pricing Tab */}
          <TabPanel value={activeTab} index={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Rental Pricing
              </Typography>
              
              <Grid container spacing={3}>
                {product.pricelistItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.rentalType}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {item.rentalType}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          ${item.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          per {item.rentalType.toLowerCase()}
                        </Typography>
                        
                        {item.discount && item.discount > 0 && (
                          <Chip
                            label={`${item.discount}% off`}
                            color="success"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Min: {item.minimumDays} days
                          </Typography>
                          {item.maximumDays && (
                            <Typography variant="body2" color="text.secondary">
                              Max: {item.maximumDays} days
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </TabPanel>

          {/* Instructions Tab */}
          <TabPanel value={activeTab} index={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Rental Instructions & Policies
              </Typography>
              
              <Grid container spacing={3}>
                {product.rentalInstructions && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">Rental Instructions</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{product.rentalInstructions}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
                
                {product.setupRequirements && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">Setup Requirements</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{product.setupRequirements}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
                
                {product.returnRequirements && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">Return Requirements</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{product.returnRequirements}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
                
                {product.damagePolicy && (
                  <Grid item xs={12} md={6}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">Damage Policy</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{product.damagePolicy}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </TabPanel>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default ProductDetailPage; 