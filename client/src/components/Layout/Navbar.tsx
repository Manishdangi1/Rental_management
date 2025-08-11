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
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  Dashboard,
  Logout,
  Settings,
  Home,
  Inventory,
  LocalShipping,
  Assessment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout } = useAuth();
  const { items } = useCart();
  
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
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Products', path: '/products', icon: <Inventory /> },
    ...(user ? [
      { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
      { text: 'My Rentals', path: '/rentals', icon: <LocalShipping /> },
      { text: 'Reports', path: '/reports', icon: <Assessment /> },
    ] : []),
  ];

  const renderDesktopNavigation = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {navigationItems.map((item) => (
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
  );

  const renderMobileNavigation = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
        },
      }}
    >
      <Box sx={{ width: 280, pt: 2 }}>
        <Typography variant="h6" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
          Rental Management
        </Typography>
        <Divider />
        <List>
          {navigationItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: isActiveRoute(item.path) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ color: isActiveRoute(item.path) ? 'primary.main' : 'inherit' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
            onClick={() => navigate('/')}
          >
            Rental Management
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && renderDesktopNavigation()}

          {/* Right side items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Cart */}
            {user && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/cart')}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={items.length} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            )}

            {/* User menu or auth buttons */}
            {user ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleUserMenuOpen}
                  startIcon={<Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
                    {user.firstName.charAt(0)}
                  </Avatar>}
                  sx={{ textTransform: 'none' }}
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
                >
                  <MenuItem onClick={() => { navigate('/profile'); setUserMenuAnchor(null); }}>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/dashboard'); setUserMenuAnchor(null); }}>
                    <ListItemIcon>
                      <Dashboard fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem onClick={() => { navigate('/admin'); setUserMenuAnchor(null); }}>
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      Admin Panel
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
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
                  sx={{ textTransform: 'none' }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    textTransform: 'none',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                    }
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