import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading, isInitialized } = useAuth();

  console.log('RoleGuard: Current state:', { user, loading, isInitialized, allowedRoles });

  // Show loading only if we're still initializing and have a token
  if (loading && !isInitialized) {
    console.log('RoleGuard: Showing loading...');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // If not initialized yet, don't redirect
  if (!isInitialized) {
    console.log('RoleGuard: Not initialized yet...');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        Initializing...
      </div>
    );
  }

  if (!user) {
    console.log('RoleGuard: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(user.role)) {
    console.log('RoleGuard: User role not allowed, redirecting based on role');
    // Redirect based on user role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'CUSTOMER') {
      return <Navigate to="/customer/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  console.log('RoleGuard: User authorized, rendering children');
  return <>{children}</>;
};

export default RoleGuard; 