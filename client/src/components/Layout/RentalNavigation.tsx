import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  LocalShipping,
  Add,
  Inventory,
  ShoppingCart,
  Assessment,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RentalNavigation: React.FC = () => {
  const navigate = useNavigate();

  const rentalFeatures = [
    {
      title: 'Browse Products',
      description: 'View available rental equipment and select items',
      icon: <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/rentals/new',
      color: '#e3f2fd',
      buttonText: 'Start Browsing',
    },
    {
      title: 'Rental Cart',
      description: 'Manage your selected rental items and proceed to checkout',
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/rentals/checkout',
      color: '#fce4ec',
      buttonText: 'View Cart',
    },
    {
      title: 'Order Management',
      description: 'Create, edit, and manage rental orders (Staff Only)',
      icon: <Settings sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/rentals/order-form',
      color: '#e8f5e8',
      buttonText: 'Manage Orders',
    },
    {
      title: 'My Rentals',
      description: 'View your current and past rental history',
      icon: <LocalShipping sx={{ fontSize: 40, color: 'info.main' }} />,
      path: '/rentals',
      color: '#e0f2f1',
      buttonText: 'View Rentals',
    },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 700 }}>
        Rental Management System
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Choose from the options below to manage your rental experience
      </Typography>

      <Grid container spacing={3}>
        {rentalFeatures.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ 
                flexGrow: 1, 
                textAlign: 'center',
                backgroundColor: feature.color,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                
                {feature.title === 'Order Management' && (
                  <Chip 
                    label="Staff Only" 
                    size="small" 
                    color="warning" 
                    sx={{ mb: 2 }}
                  />
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(feature.path)}
                  startIcon={feature.title === 'Browse Products' ? <Add /> : undefined}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {feature.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/rentals/new')}
            startIcon={<Add />}
          >
            Start New Rental
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/rentals/order-form')}
            startIcon={<Settings />}
          >
            Manage Orders
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            startIcon={<Assessment />}
          >
            View Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RentalNavigation; 