import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  LocalShipping,
  Security,
  Support,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const featuredProducts = [
    {
      id: '1',
      name: 'Camping Tent Set',
      category: 'Outdoor & Camping',
      price: 45,
      rating: 4.8,
      image: 'tent.jpg',
      description: 'Complete camping tent setup with poles and stakes'
    },
    {
      id: '2',
      name: 'BBQ Grill Set',
      category: 'Outdoor & Camping',
      price: 35,
      rating: 4.6,
      image: 'grill.jpg',
      description: 'Professional BBQ grill with accessories'
    },
    {
      id: '3',
      name: 'Party Tent 20x30',
      category: 'Party & Events',
      price: 150,
      rating: 4.9,
      image: 'party-tent.jpg',
      description: 'Large party tent for events and celebrations'
    },
    {
      id: '4',
      name: 'Portable Generator',
      category: 'Outdoor & Camping',
      price: 85,
      rating: 4.7,
      image: 'generator.jpg',
      description: '5000W portable generator for outdoor events'
    }
  ];

  const features = [
    {
      icon: <Search />,
      title: 'Easy Booking',
      description: 'Simple and quick rental process with instant confirmation'
    },
    {
      icon: <LocalShipping />,
      title: 'Fast Delivery',
      description: 'Reliable delivery and pickup service to your location'
    },
    {
      icon: <Security />,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing'
    },
    {
      icon: <Support />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any questions'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 3 }}
          >
            Rent Everything You Need
          </Typography>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}
          >
            From camping gear to party equipment, we have everything you need for your next adventure or event. 
            Quality equipment, competitive prices, and exceptional service.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Browse Products
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'grey.300' } }}
            >
              Sign Up Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {React.cloneElement(feature.icon, { 
                      sx: { fontSize: 30, color: 'white' } 
                    })}
                  </Box>
                  <Typography variant="h6" gutterBottom>
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
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Featured Products
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Our most popular items that customers love
          </Typography>
          <Grid container spacing={4}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      bgcolor: 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      {product.name}
                    </Typography>
                  </CardMedia>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip label={product.category} size="small" color="primary" />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                        <Typography variant="body2">{product.rating}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${product.price}/day
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
            >
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} sx={{ textAlign: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              1000+
            </Typography>
            <Typography variant="h6" gutterBottom>
              Happy Customers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Satisfied customers across the country
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              500+
            </Typography>
            <Typography variant="h6" gutterBottom>
              Products Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wide range of equipment and tools
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              24/7
            </Typography>
            <Typography variant="h6" gutterBottom>
              Customer Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always here when you need us
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              99%
            </Typography>
            <Typography variant="h6" gutterBottom>
              Satisfaction Rate
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer satisfaction guaranteed
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied customers who trust us for their rental needs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Create Account
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'grey.300' } }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 