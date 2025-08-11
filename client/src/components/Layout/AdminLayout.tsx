import React from 'react';
import { Box } from '@mui/material';
import AdminNavbar from './AdminNavbar';
import { useSidebar } from '../../contexts/SidebarContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { sidebarOpen } = useSidebar();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AdminNavbar />
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

export default AdminLayout; 