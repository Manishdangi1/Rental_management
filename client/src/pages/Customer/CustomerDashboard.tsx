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
  Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
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
  }>;
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
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  console.log('CustomerDashboard: State initialized');
  
  try {
    const { state: cartState, removeItem, updateQuantity, clearCart } = useCart();
    console.log('CustomerDashboard: Cart context loaded:', cartState);
  } catch (error) {
    console.error('CustomerDashboard: Error loading cart context:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Error loading cart. Please refresh the page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  // Filter products based on search and category (with safety checks)
  const filteredProducts = products?.filter(product => {
    if (!product || !product.name || !product.description) return false;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories (with safety checks)
  const categories = ['all', ...Array.from(new Set(products?.map(p => p?.category).filter(Boolean) || []))];

  // Cart handlers
  const handleCartClick = (event: React.MouseEvent<HTMLElement>) => {
    setCartAnchorEl(event.currentTarget);
  };

  const handleCartClose = () => {
    setCartAnchorEl(null);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeItem(itemId);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    handleCartClose();
    setActiveTab(2); // Switch to shopping cart tab
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
        setProducts(data || []);
      } else {
        console.error('Failed to fetch products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    // Simulate loading customer data
    const loadCustomerData = async () => {
      try {
        setStats({
          totalRentals: 12,
          activeRentals: 3,
          totalSpent: 2847,
          upcomingDeliveries: 1
        });

        setActiveRentals([
          {
            id: '1',
            orderNumber: 'RO-1754916845853-006',
            status: 'IN_PROGRESS',
            totalAmount: 395,
            startDate: '2024-01-15',
            endDate: '2024-01-20',
            items: [
              { productName: 'Camping Tent Set', quantity: 1 },
              { productName: 'Portable Generator', quantity: 1 }
            ]
          },
          {
            id: '2',
            orderNumber: 'RO-1754916845854-036',
            status: 'CONFIRMED',
            totalAmount: 528,
            startDate: '2024-01-22',
            endDate: '2024-01-25',
            items: [
              { productName: 'BBQ Grill Set', quantity: 1 },
              { productName: 'Outdoor Furniture Set', quantity: 1 }
            ]
          }
        ]);

        setRecentRentals([
          {
            id: '3',
            orderNumber: 'RO-1754916845853-024',
            status: 'COMPLETED',
            totalAmount: 711,
            startDate: '2024-01-01',
            endDate: '2024-01-05',
            items: [
              { productName: 'Party Tent 10x15', quantity: 1 },
              { productName: 'Table & Chair Set', quantity: 1 }
            ]
          }
        ]);
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

    loadCustomerData();
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

  // Simple fallback to prevent white pages
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName || 'Customer'}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Dashboard is loading...
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </Box>
  );

  // Error boundary - if anything goes wrong, show a fallback
  try {
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
                {cartState?.items?.length > 0 && (
                  <Chip
                    label={cartState.items.length}
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
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Dashboard" />
            <Tab label="Browse Products" />
            <Tab label="Shopping Cart" />
          </Tabs>
        </Box>

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
            
            {cartState?.items?.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
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
                      {index < cartState.items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${cartState.totalAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Security Deposit:</Typography>
                    <Typography>${cartState.securityDeposit.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${cartState.grandTotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={clearCart}
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

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Receipt />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" color="primary.main">
                          {stats.totalRentals}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Rentals
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <LocalShipping />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" color="success.main">
                          {stats.activeRentals}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Rentals
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <AttachMoney />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" color="warning.main">
                          ${stats.totalSpent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <CalendarToday />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" color="info.main">
                          {stats.upcomingDeliveries}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Upcoming Deliveries
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
              </Grid>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ bgcolor: `${action.color}.main`, mx: 'auto', mb: 2 }}>
                        {action.icon}
                      </Avatar>
                      <Typography variant="body1">
                        {action.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Active Rentals */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Active Rentals
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate('/customer/rentals')}
                    >
                      View All
                    </Button>
                  </Box>
                  {activeRentals.length > 0 ? (
                    <List>
                      {activeRentals.map((rental, index) => (
                        <React.Fragment key={rental.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <ShoppingCart />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={rental.orderNumber}
                              secondary={
                                <Box>
                                  <Typography variant="body2" component="span">
                                    {rental.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                                  </Typography>
                                  <br />
                                  <Typography variant="caption" color="text.secondary">
                                    {rental.startDate} - {rental.endDate} • ${rental.totalAmount}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={rental.status} 
                                color={getStatusColor(rental.status) as any}
                                size="small"
                              />
                              <IconButton size="small" onClick={() => navigate(`/customer/rentals/${rental.id}`)}>
                                <Visibility />
                              </IconButton>
                            </Box>
                          </ListItem>
                          {index < activeRentals.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No active rentals
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => setActiveTab(1)}
                      >
                        Browse Products
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  {recentRentals.length > 0 ? (
                    <Box>
                      {recentRentals.map((rental) => (
                        <Box key={rental.id} sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {rental.orderNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rental.startDate} - {rental.endDate}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Chip 
                              label={rental.status} 
                              color={getStatusColor(rental.status) as any}
                              size="small"
                            />
                            <Typography variant="body2" fontWeight="bold">
                              ${rental.totalAmount}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  )}
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/customer/rentals')}
                  >
                    View Rental History
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Products Header */}
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
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
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

        {activeTab === 2 && (
          <ShoppingCartComponent />
        )}
      </Box>
    );
  } catch (error) {
    console.error('Error rendering CustomerDashboard:', error);
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" color="error">
          An unexpected error occurred. Please try again later.
        </Typography>
      </Box>
    );
  }
};

export default CustomerDashboard; 