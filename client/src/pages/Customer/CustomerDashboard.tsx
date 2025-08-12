import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Popover,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Receipt,
  Payment,
  Add,
  Visibility,
  CalendarToday,
  AttachMoney,
  Search,
  AddShoppingCart,
  Delete,
  Edit,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import ProductCard from '../../components/Product/ProductCard';
import ShoppingCartComponent from '../../components/Cart/ShoppingCart';

interface CustomerRental {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  customerName?: string;
  pickupAddress?: string;
  returnAddress?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const CustomerDashboard: React.FC = () => {
  console.log('CustomerDashboard: Component rendering started');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  console.log('CustomerDashboard: Hooks initialized, user:', user);
  
  const [activeRentals, setActiveRentals] = useState<CustomerRental[]>([]);
  const [recentRentals, setRecentRentals] = useState<CustomerRental[]>([]);
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    totalSpent: 0,
    upcomingDeliveries: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartAnchorEl, setCartAnchorEl] = useState<null | HTMLElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  console.log('CustomerDashboard: State initialized');
  
  // Get cart context
  const { items: cartItems, removeRentalItem, updateRentalItemQuantity, clearRentalCart } = useCart();
  console.log('CustomerDashboard: Cart context loaded:', cartItems);

  // Get favorites context
  const { items: favoriteItems, removeFromFavorites, getFavoritesCount } = useFavorites();
  console.log('CustomerDashboard: Favorites context loaded:', favoriteItems);

  // Get unique categories (with safety checks)
  const categories = ['all', ...Array.from(new Set(Array.isArray(products) ? products.map(p => p?.category?.name || p?.categoryId).filter(Boolean) : []))];

  // Filter products based on search and category (with safety checks)
  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    if (!product || !product.name || !product.description) return false;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // Cart handlers
  const handleCartClick = (event: React.MouseEvent<HTMLElement>) => {
    setCartAnchorEl(event.currentTarget);
  };

  const handleCartClose = () => {
    setCartAnchorEl(null);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeRentalItem(itemId);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateRentalItemQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const cartOpen = Boolean(cartAnchorEl);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Products API response:', data);
        
        // Handle the API response structure: { products: [...], pagination: {...} }
        const productsArray = data.products || data;
        console.log('Products array:', productsArray);
        console.log('Products type:', typeof productsArray);
        console.log('Is array:', Array.isArray(productsArray));
        
        if (Array.isArray(productsArray)) {
          setProducts(productsArray);
          console.log(`Successfully loaded ${productsArray.length} products`);
        } else {
          console.error('Products data is not an array:', productsArray);
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch customer data from backend
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer stats
      const statsResponse = await fetch('/api/customer/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        // Set default stats if API fails
        setStats({
          totalRentals: 0,
          activeRentals: 0,
          totalSpent: 0,
          upcomingDeliveries: 0
        });
      }

      // Fetch active rentals
      const activeRentalsResponse = await fetch('/api/customer/rentals?status=ACTIVE', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (activeRentalsResponse.ok) {
        const activeRentalsData = await activeRentalsResponse.json();
        setActiveRentals(activeRentalsData.rentals || activeRentalsData || []);
      } else {
        setActiveRentals([]);
      }

      // Fetch recent rentals
      const recentRentalsResponse = await fetch('/api/customer/rentals?status=COMPLETED&limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (recentRentalsResponse.ok) {
        const recentRentalsData = await recentRentalsResponse.json();
        setRecentRentals(recentRentalsData.rentals || recentRentalsData || []);
      } else {
        setRecentRentals([]);
      }

    } catch (error) {
      console.error('Error loading customer data:', error);
      // Set default values to prevent crashes
      setStats({
        totalRentals: 0,
        activeRentals: 0,
        totalSpent: 0,
        upcomingDeliveries: 0
      });
      setActiveRentals([]);
      setRecentRentals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
    fetchProducts(); // Fetch products from backend
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const quickActions = [
    {
      title: 'Browse Products',
      icon: <Add />,
      color: 'primary',
      path: '/products'
    },
    {
      title: 'View All Rentals',
      icon: <ShoppingCart />,
      color: 'secondary',
      path: '/customer/rentals'
    },
    {
      title: 'Check Deliveries',
      icon: <LocalShipping />,
      color: 'success',
      path: '/customer/deliveries'
    },
    {
      title: 'Payment History',
      icon: <Payment />,
      color: 'info',
      path: '/customer/payments'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Main dashboard content
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName || 'Customer'}!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ShoppingCart />}
              onClick={handleCartClick}
              sx={{ position: 'relative' }}
            >
              Cart
              {cartItems?.length > 0 && (
                <Chip
                  label={cartItems.length}
                  size="small"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    minWidth: 20,
                    height: 20,
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your rentals, track deliveries, and browse available products
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs" sx={{ mb: 3 }}>
          <Tab label="Dashboard" />
          <Tab label="Products" />
          <Tab label="Favorites" />
          <Tab label="Rentals" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ShoppingCart />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.totalRentals}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Rentals</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <LocalShipping />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.activeRentals}</Typography>
                      <Typography variant="body2" color="text.secondary">Active Rentals</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">${stats.totalSpent}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <CalendarToday />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.upcomingDeliveries}</Typography>
                      <Typography variant="body2" color="text.secondary">Upcoming Deliveries</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>Quick Actions</Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} md={3} key={action.title}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { boxShadow: 4 },
                      transition: 'box-shadow 0.2s'
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ bgcolor: `${action.color}.main`, mx: 'auto', mb: 2 }}>
                        {action.icon}
                      </Avatar>
                      <Typography variant="subtitle1">{action.title}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Active Rentals */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>Active Rentals</Typography>
            <Grid container spacing={3}>
              {activeRentals.map((rental) => (
                <Grid item xs={12} md={6} key={rental.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>{rental.orderNumber}</Typography>
                          <Chip 
                            label={rental.status} 
                            color={getStatusColor(rental.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="h6" color="primary">
                          ${rental.totalAmount}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <List dense>
                        {rental.items.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText
                              primary={item.productName}
                              secondary={`Qty: ${item.quantity}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Recent Rentals */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>Recent Rentals</Typography>
            <Grid container spacing={3}>
              {recentRentals.map((rental) => (
                <Grid item xs={12} md={6} key={rental.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>{rental.orderNumber}</Typography>
                          <Chip 
                            label={rental.status} 
                            color={getStatusColor(rental.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="h6" color="primary">
                          ${rental.totalAmount}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <List dense>
                        {rental.items.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText
                              primary={item.productName}
                              secondary={`Qty: ${item.quantity}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

        {/* Cart Popover */}
        <Popover
          open={cartOpen}
          anchorEl={cartAnchorEl}
          onClose={handleCartClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { width: 400, maxHeight: 500 }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Shopping Cart</Typography>
              <Button size="small" onClick={handleCartClose}>Close</Button>
            </Box>
            
            {cartItems?.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {cartItems.map((item, index) => (
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
                                label={`${item.rentalType.toLowerCase()}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Qty: {item.quantity} × ${item.unitPrice}/day
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold">
                              ${item.totalPrice.toFixed(2)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFromCart(item.id)}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < cartItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${cartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Security Deposit:</Typography>
                    <Typography>${cartItems.reduce((sum, item) => sum + (item.unitPrice * 0.2), 0).toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${(cartItems.reduce((sum, item) => sum + item.totalPrice, 0) + cartItems.reduce((sum, item) => sum + (item.unitPrice * 0.2), 0)).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={clearRentalCart}
                    color="error"
                    size="small"
                  >
                    Clear Cart
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCheckout}
                    size="small"
                  >
                    Checkout
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Popover>

        {/* Products Header */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Available Products
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Browse our selection of rental products and add them to your cart
              </Typography>
              
              {/* Search and Filters */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {categories.map((category) => (
                      <Chip
                        key={category}
                        label={category === 'all' ? 'All Categories' : category}
                        onClick={() => setSelectedCategory(category)}
                        color={selectedCategory === category ? 'primary' : 'default'}
                        variant={selectedCategory === category ? 'filled' : 'outlined'}
                        clickable
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Products Grid */}
            {productsLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography>Loading products...</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product: any) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard 
                      product={{
                        ...product,
                        // Extract category name from nested object
                        category: product.category?.name || product.category || 'General',
                        // Extract base price from pricelist items
                        basePrice: product.basePrice || (product.pricelistItems && product.pricelistItems[0]?.price),
                        // Determine availability
                        availability: product.isActive && product.isRentable && (product.availableQuantity || 0) > 0
                      }}
                      showActions={true}
                      compact={false}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {!productsLoading && filteredProducts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or category filter
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Favorites Tab */}
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                My Favorites
              </Typography>
              <Chip 
                label={`${getFavoritesCount()} items`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>

            {favoriteItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No favorites yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start browsing products and add your favorites here
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab(1)}
                  startIcon={<Add />}
                >
                  Browse Products
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {favoriteItems.map((favorite) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={favorite.id}>
                    <ProductCard 
                      product={{
                        id: favorite.productId,
                        name: favorite.name,
                        description: favorite.description,
                        image: favorite.image,
                        basePrice: favorite.basePrice,
                        category: favorite.category,
                        availability: favorite.availability,
                        minimumRentalDays: favorite.minimumRentalDays,
                        maximumRentalDays: favorite.maximumRentalDays,
                      }}
                      showActions={true}
                      compact={false}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Rentals Tab */}
        {activeTab === 3 && (
          <ShoppingCartComponent />
        )}
      </Box>
    );
};

export default CustomerDashboard; 