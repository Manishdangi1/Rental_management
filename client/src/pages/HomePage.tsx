import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Container,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  LocalShipping,
  Security,
  Support,
  ArrowForward,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: {
    id: string;
    name: string;
    description: string;
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
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRentalItem, items } = useCart();
  
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await axios.get('/api/products?limit=6&featured=true');
        if (response.data && response.data.products) {
          setFeaturedProducts(response.data.products);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
        setError('Failed to load featured products');
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const features = [
    {
      icon: <Search sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Easy Booking',
      description: 'Browse thousands of products and book instantly online',
    },
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Fast Delivery',
      description: 'Professional delivery and pickup service included',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Payments',
      description: 'Multiple payment options with secure processing',
    },
    {
      icon: <Support sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs',
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/products');
    } else {
      navigate('/register');
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleTestAddToCart = () => {
    const testItem = {
      productId: 'test-1',
      name: 'Test Product',
      sku: 'TEST-001',
      image: 'https://via.placeholder.com/150x100',
      quantity: 1,
      rentalType: 'DAILY' as const,
      unitPrice: 50.00,
      totalPrice: 350.00, // 7 days * $50
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      minimumDays: 1,
      maximumDays: 30
    };
    
    console.log('HomePage: Adding test item to cart:', testItem);
    addRentalItem(testItem);
    alert('Test item added to cart!');
  };

  // Debug cart state
  console.log('HomePage: Current cart items:', items);
  console.log('HomePage: Cart items count:', items.length);

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
              }}
            >
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                Rent Everything You Need
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Access to thousands of products without the commitment of ownership. 
                From tools to party supplies, we've got you covered.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{ mr: 2, mb: 2 }}
                >
                  {user ? 'Browse Products' : 'Get Started'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/products')}
                  sx={{ mb: 2 }}
                  endIcon={<ArrowForward />}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          We make renting simple, affordable, and convenient
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2">
            Featured Products
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
            endIcon={<ArrowForward />}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => handleProductClick(product.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip label={product.category?.name || 'Uncategorized'} size="small" color="primary" />
                  </Box>
                  <Typography gutterBottom variant="h6" component="h3">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Starting at ${product.pricelistItems && product.pricelistItems.length > 0 ? product.pricelistItems[0].price : 0}/day
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                  <Button size="small" color="primary">
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Paper
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Start Renting?
            </Typography>
            <Typography variant="h6" paragraph>
              Join thousands of satisfied customers who choose to rent instead of buy
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{ 
                  mr: 2, 
                  mb: 2,
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  }
                }}
              >
                {user ? 'Browse Products' : 'Sign Up Now'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/products')}
                sx={{ 
                  mb: 2,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'grey.100',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Explore Products
              </Button>
              {user && (
                <>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleTestAddToCart}
                    sx={{ 
                      mb: 2,
                      ml: 2,
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'grey.100',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Test Add to Cart ({items.length})
                  </Button>
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="body2" color="white">
                      Cart Status: {items.length} items
                    </Typography>
                    {items.length > 0 && (
                      <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                        Items: {items.map(item => item.name).join(', ')}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default HomePage; 