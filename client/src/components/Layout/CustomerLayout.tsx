import React from 'react';
import { Box } from '@mui/material';
import CustomerNavbar from './CustomerNavbar';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CustomerNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px', // Account for AppBar height
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default CustomerLayout; 