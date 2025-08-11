import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Dashboard,
  Inventory,
  LocalShipping,
  Assessment,
  People,
  Settings,
  Category,
  Receipt,
  Notifications,
  Payment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    products: true,
    rentals: true,
    management: true,
  });

  const handleSectionToggle = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      show: true,
    },
    {
      title: 'Products',
      icon: <Inventory />,
      show: true,
      section: 'products',
      items: [
        { title: 'All Products', path: '/products' },
        { title: 'Categories', path: '/categories' },
        { title: 'Pricelists', path: '/pricelists' },
      ]
    },
    {
      title: 'Rentals',
      icon: <LocalShipping />,
      show: true,
      section: 'rentals',
      items: [
        { title: 'My Rentals', path: '/rentals' },
        { title: 'New Rental', path: '/rentals/new' },
        { title: 'Rental History', path: '/rentals/history' },
      ]
    },
    {
      title: 'Management',
      icon: <Settings />,
      show: user?.role === 'ADMIN' || user?.role === 'STAFF',
      section: 'management',
      items: [
        { title: 'Users', path: '/admin/users' },
        { title: 'Deliveries', path: '/admin/deliveries' },
        { title: 'Invoices', path: '/admin/invoices' },
        { title: 'Payments', path: '/admin/payments' },
        { title: 'Notifications', path: '/admin/notifications' },
      ]
    },
    {
      title: 'Reports',
      icon: <Assessment />,
      show: true,
      path: '/reports',
    },
  ];

  const renderMenuItem = (item: any) => {
    if (!item.show) return null;

    if (item.items) {
      return (
        <Box key={item.title}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleSectionToggle(item.section)}
              sx={{
                backgroundColor: openSections[item.section] ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
              {openSections[item.section] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={openSections[item.section]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.items.map((subItem: any) => (
                <ListItemButton
                  key={subItem.path}
                  sx={{
                    pl: 4,
                    backgroundColor: isActiveRoute(subItem.path) ? 'rgba(25, 118, 210, 0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.25)',
                    },
                    borderLeft: isActiveRoute(subItem.path) ? '3px solid' : 'none',
                    borderLeftColor: 'primary.main',
                  }}
                  onClick={() => handleNavigation(subItem.path)}
                >
                  <ListItemText 
                    primary={subItem.title}
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      color: isActiveRoute(subItem.path) ? 'primary.main' : 'inherit'
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem key={item.title} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          sx={{
            backgroundColor: isActiveRoute(item.path) ? 'rgba(25, 118, 210, 0.15)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.25)',
            },
            borderLeft: isActiveRoute(item.path) ? '3px solid' : 'none',
            borderLeftColor: 'primary.main',
          }}
        >
          <ListItemIcon sx={{ 
            color: isActiveRoute(item.path) ? 'primary.main' : 'inherit'
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.title}
            primaryTypographyProps={{ 
              fontWeight: 'medium',
              color: isActiveRoute(item.path) ? 'primary.main' : 'inherit'
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  // Don't render sidebar on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          mt: '64px', // Account for AppBar height
        },
      }}
    >
      <Box sx={{ overflow: 'auto', py: 2 }}>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="h6" color="text.secondary" fontWeight="medium">
            Navigation
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List component="nav" disablePadding>
          {menuItems.map(renderMenuItem)}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 