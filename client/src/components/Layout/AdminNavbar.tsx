import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  ShoppingCart,
  Inventory,
  Category,
  Assessment,
  Settings,
  Notifications,
  Person,
  Logout,
  Home,
  LocalShipping,
  Receipt,
  Payment
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

const AdminNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const menuItems = [
    {
      section: 'Overview',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
      ]
    },
    {
      section: 'User Management',
      items: [
        { text: 'Users', icon: <People />, path: '/admin/users' },
      ]
    },
    {
      section: 'Rental Management',
      items: [
        { text: 'Rentals', icon: <ShoppingCart />, path: '/admin/rentals' },
      ]
    },
    {
      section: 'Inventory',
      items: [
        { text: 'Products', icon: <Inventory />, path: '/admin/products' },
        { text: 'Categories', icon: <Category />, path: '/admin/categories' },
      ]
    },
    {
      section: 'Analytics',
      items: [
        { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
      ]
    }
  ];

  // Only show Settings for ADMIN users
  if (user?.role === 'ADMIN') {
    menuItems.push({
      section: 'System',
      items: [
        { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
      ]
    });
  }

  const drawer = (
    <Box>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary">
          Admin Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Role: {user?.role}
        </Typography>
      </Box>
      <List>
        {menuItems.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            <ListItem sx={{ py: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                {section.section}
              </Typography>
            </ListItem>
            {section.items.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            {sectionIndex < menuItems.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rental Management - Admin Portal
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<Home />}
              onClick={() => navigate('/')}
            >
              Public Site
            </Button>

            <IconButton
              color="inherit"
              onClick={() => navigate('/admin/notifications')}
            >
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem onClick={() => navigate('/admin/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarOpen ? 280 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? 280 : 0,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100% - 64px)',
              borderRight: sidebarOpen ? '1px solid' : 'none',
              borderColor: 'divider',
              overflow: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default AdminNavbar; 