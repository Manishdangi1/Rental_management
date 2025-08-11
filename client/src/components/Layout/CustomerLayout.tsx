import React from 'react';
import { Box } from '@mui/material';
import CustomerNavbar from './CustomerNavbar';
import { useSidebar } from '../../contexts/SidebarContext';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { sidebarOpen } = useSidebar();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CustomerNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: sidebarOpen ? '280px' : 0 }, // Account for sidebar width on desktop
          mt: '64px', // Account for AppBar height
          p: 3,
          width: { md: sidebarOpen ? `calc(100% - 280px)` : '100%' },
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default CustomerLayout; 