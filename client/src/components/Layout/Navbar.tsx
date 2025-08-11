import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocalShipping,
  Person,
  Dashboard,
  Logout,
  Settings,
  Home,
  Inventory,
  Assessment,
  Add,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout, loading, error } = useAuth();
  const { items } = useCart();
  
  // Debug user and auth state
  console.log('Navbar: User:', user);
  console.log('Navbar: Loading:', loading);
  console.log('Navbar: Error:', error);
  console.log('Navbar: Cart items:', items);
  console.log('Navbar: Cart items length:', items.length);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    setUserMenuAnchor(null);
    // Don't navigate manually - AuthContext logout handles the redirect
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Only show minimal navigation for mobile
  const mobileNavigationItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { text: 'Rentals', path: '/rentals', icon: <LocalShipping /> },
    { text: 'New Rental', path: '/rentals/new', icon: <Add /> },
    { text: 'Order Form', path: '/rentals/order-form', icon: <Inventory /> },
  ];

  const renderMobileNavigation = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ width: 280, pt: 2 }}>
        <Typography variant="h6" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'white' }}>
          Rental Management
        </Typography>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        <List>
          {mobileNavigationItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: isActiveRoute(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                color: 'white',
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ color: 'white' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ 
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Brand */}
          <Typography
            variant="h5"
            component="div"
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'scale(1.02)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            onClick={() => user ? navigate('/dashboard') : navigate('/login')}
          >
            Rental Management
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {mobileNavigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: isActiveRoute(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Show loading state */}
            {loading && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Loading...
              </Typography>
            )}
            
            {/* Show error state */}
            {error && (
              <Typography variant="body2" sx={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                {error}
              </Typography>
            )}

            {/* Rental Cart - Only show if user is logged in */}
            {user && (
              <Tooltip title="Rental Cart" arrow>
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/cart')}
                  sx={{ 
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Badge 
                    badgeContent={items.length} 
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        fontWeight: 'bold',
                      }
                    }}
                  >
                    <LocalShipping sx={{ fontSize: 24 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* User menu or auth buttons */}
            {user ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleUserMenuOpen}
                  startIcon={
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.875rem',
                        background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                        color: '#667eea',
                        fontWeight: 'bold',
                        border: '2px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {user.firstName.charAt(0)}
                    </Avatar>
                  }
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {isMobile ? '' : `${user.firstName} ${user.lastName}`}
                </Button>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={() => setUserMenuAnchor(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                    }
                  }}
                >
                  <MenuItem 
                    onClick={() => { navigate('/profile'); setUserMenuAnchor(null); }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      },
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    }}
                  >
                    <ListItemIcon>
                      <Person fontSize="small" sx={{ color: '#667eea' }} />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/dashboard'); setUserMenuAnchor(null); }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      },
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    }}
                  >
                    <ListItemIcon>
                      <Dashboard fontSize="small" sx={{ color: '#667eea' }} />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem 
                      onClick={() => { navigate('/admin'); setUserMenuAnchor(null); }}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        },
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                      }}
                    >
                      <ListItemIcon>
                        <Settings fontSize="small" sx={{ color: '#667eea' }} />
                      </ListItemIcon>
                      Admin Panel
                    </MenuItem>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                      },
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      color: '#ff6b6b',
                    }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" sx={{ color: '#ff6b6b' }} />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      {renderMobileNavigation()}
    </>
  );
};

export default Navbar; 