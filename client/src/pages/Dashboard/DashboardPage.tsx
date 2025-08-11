import React from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import StaffDashboardOverview from './Staff/StaffDashboardOverview';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // If no user is found, show error
  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          User not found. Please log in again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Route to appropriate dashboard based on user role */}
      {user.role === 'CUSTOMER' ? (
        <CustomerDashboard />
      ) : user.role === 'ADMIN' ? (
        <StaffDashboardOverview />
      ) : (
        // Fallback for any unexpected roles
        <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="6b7280" sx={{ mb: 4 }}>
            Welcome, {user.firstName}! This dashboard is under development for your role: {user.role}
          </Typography>
          <Alert severity="info">
            Dashboard customization for {user.role} role is coming soon. Please check back later.
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage; 