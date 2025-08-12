import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Divider,
  Rating,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import {
  Search,
  FilterList,
  CalendarToday,
  LocalOffer,
  Schedule,
  Security,
  Info,
  ShoppingCart,
  Favorite,
  Star,
  AccessTime,
  LocationOn,
  Add
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, differenceInDays, format } from 'date-fns';
import { useCart } from '../contexts/CartContext';
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
  }>;
}

const ProductsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addRentalItem } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced UI states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rentalDialogOpen, setRentalDialogOpen] = useState(false);
  const [rentalQuantity, setRentalQuantity] = useState(1);
  const [selectedRentalType, setSelectedRentalType] = useState<string>('DAILY');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [rentalTypeFilter, setRentalTypeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(true);
  
  // Date selection for rental
  const [startDate, setStartDate] = useState<Date | null>(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | null>(addDays(new Date(), 3));

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, priceRange, rentalTypeFilter, availabilityFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      setError(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category.id === categoryFilter);
    }

    // Apply price filter
    filtered = filtered.filter(product => {
      const prices = product.pricelistItems.map(item => item.price);
      if (prices.length === 0) return false;
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return minPrice >= (priceRange?.[0] || 0) && maxPrice <= (priceRange?.[1] || 1000);
    });

    // Apply rental type filter
    if (rentalTypeFilter !== 'all') {
      filtered = filtered.filter(product =>
        product.pricelistItems.some(item => item.rentalType === rentalTypeFilter)
      );
    }

    // Apply availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(product => product.availableQuantity > 0);
    }

    setFilteredProducts(filtered);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value);
  };

  const handleRentalTypeFilterChange = (event: SelectChangeEvent) => {
    setRentalTypeFilter(event.target.value);
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handleRentNow = (product: Product) => {
    setSelectedProduct(product);
    setRentalQuantity(1);
    setSelectedRentalType('DAILY');
    setCalculatedPrice(null);
    setRentalDialogOpen(true);
  };

  const calculatePrice = async () => {
    if (!selectedProduct || !startDate || !endDate) return;

    try {
      setPriceLoading(true);
      
      const response = await api.post(`/products/${selectedProduct.id}/calculate-price`, {
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
    if (!selectedProduct || !startDate || !endDate || !calculatedPrice) return;

    const cartItem = {
      id: selectedProduct.id,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      sku: selectedProduct.sku,
      image: selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : 'https://via.placeholder.com/300x200?text=No+Image',
      quantity: rentalQuantity,
      rentalType: selectedRentalType as 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
      unitPrice: calculatedPrice / rentalQuantity,
      totalPrice: calculatedPrice,
      startDate: startDate,
      endDate: endDate,
      minimumDays: selectedProduct.minimumRentalDays,
      maximumDays: selectedProduct.maximumRentalDays,
      invoiceStatus: 'NOTHING_TO_INVOICE'
    };

    addRentalItem(cartItem);
    setRentalDialogOpen(false);
    setSelectedProduct(null);
  };

  const getCategories = () => {
    if (!products || products.length === 0) return [];
    const categories = products.map(p => p.category);
    return Array.from(new Set(categories.map(c => c.id))).map(id => 
      categories.find(c => c.id === id)!
    );
  };

  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'all') return 'All Categories';
    const category = getCategories().find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getRentalTypes = () => {
    if (!products || products.length === 0) return [];
    const types = products.flatMap(p => p.pricelistItems.map(item => item.rentalType));
    return Array.from(new Set(types));
  };

  const getMinPrice = () => {
    const prices = products.flatMap(p => p.pricelistItems.map(item => item.price));
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getMaxPrice = () => {
    const prices = products.flatMap(p => p.pricelistItems.map(item => item.price));
    return prices.length > 0 ? Math.max(...prices) : 1000;
  };

  const getProductRating = (product: Product) => {
    // Mock rating - in real app, this would come from reviews
    return 4.2 + Math.random() * 0.8;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={<LocationOn />}
            label="Customer Portal"
            variant="outlined"
            color="primary"
            sx={{ mr: 1 }}
            component={Link}
            to="/customer/dashboard"
            clickable
          />
          <Chip
            icon={<LocalOffer />}
            label="Products"
            variant="filled"
            color="primary"
          />
        </Box>

        {/* Enhanced Header */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[4],
          position: 'relative'
        }}>
          <Button
            variant="outlined"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
            component={Link}
            to="/customer/dashboard"
            startIcon={<LocationOn />}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Rental Products
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Browse our wide selection of rental equipment and tools
          </Typography>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Enhanced Search and Filters */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.100'
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search rental products..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={handleCategoryFilterChange}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {getCategories().map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Rental Type</InputLabel>
                <Select
                  value={rentalTypeFilter}
                  label="Rental Type"
                  onChange={handleRentalTypeFilterChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {getRentalTypes().map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.50'
                  }
                }}
              >
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<CalendarToday />}
                fullWidth
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d7a6e 0%, #2ddb6d 100%)'
                  }
                }}
              >
                Select Dates
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {showFilters && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Price Range</Typography>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={getMinPrice()}
                    max={getMaxPrice()}
                    valueLabelFormat={(value) => `$${value}`}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">${priceRange?.[0] || 0}</Typography>
                        <Typography variant="body2">${priceRange?.[1] || 1000}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        minDate={addDays(new Date(), 1)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        minDate={startDate ? addDays(startDate, 1) : addDays(new Date(), 2)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Enhanced Results Count */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {filteredProducts.length} products found
            </Typography>
            <Chip 
              label={categoryFilter !== 'all' ? `Category: ${getCategoryName(categoryFilter)}` : 'All Categories'}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Showing rental products available for your selected dates
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {products.length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Total Products
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 56, 
                    height: 56,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Add sx={{ fontSize: 28, color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {filteredProducts.length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Available Now
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 56, 
                    height: 56,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <LocalOffer sx={{ fontSize: 28, color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                transition: 'all 0.3s cubic-bezier(0.4, 0.2, 1)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {getCategories().length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Categories
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 56, 
                    height: 56,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <FilterList sx={{ fontSize: 28, color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {getRentalTypes().length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Rental Types
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 56, 
                    height: 56,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Schedule sx={{ fontSize: 28, color: 'white' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {filteredProducts && filteredProducts.length > 0 && filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                {/* Product Image */}
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />

                {/* Product Info */}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Category and Rating */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={product.category.name}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                      <Typography variant="body2">
                        {getProductRating(product).toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Product Name */}
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>

                  {/* Description */}
                  {product.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description.length > 80 
                        ? `${product.description.substring(0, 80)}...` 
                        : product.description
                      }
                    </Typography>
                  )}

                  {/* Features */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {product.insuranceRequired && (
                      <Chip
                        icon={<Security fontSize="small" />}
                        label="Insurance"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                    {product.isSeasonal && (
                      <Chip
                        icon={<Schedule fontSize="small" />}
                        label="Seasonal"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                    {product.rentalInstructions && (
                      <Chip
                        icon={<Info fontSize="small" />}
                        label="Instructions"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Pricing */}
                  <Box sx={{ mb: 2 }}>
                    {product.pricelistItems.length > 0 ? (
                      <Box>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          From ${Math.min(...product.pricelistItems.map(item => item.price))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per {product.pricelistItems && product.pricelistItems.length > 0 ? product.pricelistItems[0].rentalType.toLowerCase() : 'day'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Pricing not available
                      </Typography>
                    )}
                  </Box>

                  {/* Availability */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Min: {product.minimumRentalDays} days
                      </Typography>
                    </Box>
                    <Chip
                      label={product.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                      color={product.availableQuantity > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/products/${product.id}`}
                      fullWidth
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleRentNow(product)}
                      disabled={product.availableQuantity === 0}
                      fullWidth
                    >
                      Rent Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {filteredProducts.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms
            </Typography>
          </Box>
        )}

        {/* Rental Dialog */}
        <Dialog 
          open={rentalDialogOpen} 
          onClose={() => setRentalDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">Rent {selectedProduct?.name}</Typography>
          </DialogTitle>
          <DialogContent>
            {selectedProduct && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Select your rental details
                  </Typography>
                </Grid>
                
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
                      onChange={(e) => setSelectedRentalType(e.target.value)}
                    >
                      {selectedProduct.pricelistItems.map((item) => (
                        <MenuItem key={item.rentalType} value={item.rentalType}>
                          {item.rentalType}
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
                    inputProps={{ min: 1, max: selectedProduct.availableQuantity }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={calculatePrice}
                    disabled={!startDate || !endDate}
                    fullWidth
                  >
                    Calculate Price
                  </Button>
                </Grid>
                
                {calculatedPrice && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Total Price: ${calculatedPrice.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {startDate && endDate ? differenceInDays(endDate, startDate) : 0} days
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRentalDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddToCart}
              variant="contained"
              disabled={!calculatedPrice}
            >
              Add to Cart
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Tooltip title="View Cart">
            <Fab
              color="primary"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              component={Link}
              to="/cart"
            >
              <ShoppingCart />
            </Fab>
          </Tooltip>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default ProductsPage; 