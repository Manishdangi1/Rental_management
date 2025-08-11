import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Assessment, ListAlt, LocalShipping, TrendingUp, Category as CategoryIcon, Inventory, Person } from '@mui/icons-material';

const StaffNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 0;
    if (path === '/dashboard/quotations') return 1;
    if (path === '/dashboard/rentals') return 2;
    if (path === '/dashboard/revenue') return 3;
    if (path === '/dashboard/top-categories') return 4;
    if (path === '/dashboard/top-products') return 5;
    if (path === '/dashboard/top-customers') return 6;
    return 0;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const routes = [
      '/dashboard',
      '/dashboard/quotations',
      '/dashboard/rentals',
      '/dashboard/revenue',
      '/dashboard/top-categories',
      '/dashboard/top-products',
      '/dashboard/top-customers'
    ];
    navigate(routes[newValue]);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={getCurrentTab()}
        onChange={handleTabChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }
        }}
      >
        <Tab 
          label="Dashboard Overview" 
          icon={<Assessment fontSize="small" />} 
          iconPosition="start" 
        />
        <Tab 
          label="Quotations" 
          icon={<ListAlt fontSize="small" />} 
          iconPosition="start" 
        />
        <Tab 
          label="Rentals" 
          icon={<LocalShipping fontSize="small" />} 
          iconPosition="start" 
        />
        <Tab 
          label="Revenue" 
          icon={<TrendingUp fontSize="small" />} 
          iconPosition="start" 
        />
        <Tab 
          label="Top Categories" 
          icon={<CategoryIcon fontSize="small" />} 
          iconPosition="start" 
        />
        <Tab 
          label="Top Products" 
          icon={<Inventory fontSize="small" />} 
          iconPosition="start" 
        />
        <Tab 
          label="Top Customers" 
          icon={<Person fontSize="small" />} 
          iconPosition="start" 
        />
      </Tabs>
    </Box>
  );
};

export default StaffNavigation; 