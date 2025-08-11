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
  Rating,
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
import axios from 'axios';

interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
        setFeaturedProducts([]); // Set empty array instead of mock data
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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

  return (
    <Box>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
      
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
          <Grid item xs={12} sm={6} md={3}>
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
                <Search sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  Easy Booking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse thousands of products and book instantly online
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
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
                <LocalShipping sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  Fast Delivery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Professional delivery and pickup service included
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
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
                <Security sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  Secure Payments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Multiple payment options with secure processing
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
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
                <Support sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  24/7 Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Round-the-clock customer support for all your needs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading featured products...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : featuredProducts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography color="text.secondary">No featured products available at the moment.</Typography>
          </Box>
        ) : (
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
                    image={product.image}
                    alt={product.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip label={product.category} size="small" color="primary" />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={product.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({product.reviewCount})
                        </Typography>
                      </Box>
                    </Box>
                    <Typography gutterBottom variant="h6" component="h3">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      Starting at ${product.startingPrice}/day
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
        )}
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
            </Box>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default HomePage; 