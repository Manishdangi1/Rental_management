import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import api from '../config/axios';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  restoreUserSession: () => Promise<boolean>;
  silentAuthRefresh: () => Promise<boolean>;
  recoverFromInconsistentState: () => Promise<boolean>;
  handleNetworkRecovery: () => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED' }
  | { type: 'UPDATE_TOKEN'; payload: string };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isInitialized: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        isInitialized: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isInitialized: true,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
        isInitialized: true,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'UPDATE_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: true,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Set up periodic token refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    let heartbeatInterval: NodeJS.Timeout;
    
    if (state.token) {
      // Refresh token every 6 days (before the 7-day expiration)
      refreshInterval = setInterval(async () => {
        try {
          console.log('AuthContext: Performing periodic token refresh');
          await refreshToken();
        } catch (error) {
          console.error('AuthContext: Periodic token refresh failed:', error);
        }
      }, 6 * 24 * 60 * 60 * 1000); // 6 days in milliseconds

      // Heartbeat check every 30 minutes to ensure session is still valid
      heartbeatInterval = setInterval(async () => {
        try {
          console.log('AuthContext: Performing heartbeat check');
          const isValid = await validateToken();
          if (!isValid) {
            console.log('AuthContext: Heartbeat check failed, logging out');
            logout();
          }
        } catch (error) {
          console.error('AuthContext: Heartbeat check failed:', error);
          // Don't logout on heartbeat failure, just log the error
        }
      }, 30 * 60 * 1000); // 30 minutes in milliseconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };
  }, [state.token]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && state.token) {
        // User returned to the tab, check if token is still valid
        try {
          console.log('AuthContext: Page became visible, checking token validity');
          const isValid = await validateToken();
          if (!isValid) {
            console.log('AuthContext: Token invalid on page visibility change, logging out');
            logout();
          }
        } catch (error) {
          console.error('AuthContext: Token validation on visibility change failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.token]);

  // Handle storage events (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        if (event.newValue !== event.oldValue) {
          console.log('AuthContext: Token changed in another tab');
          if (event.newValue && event.newValue !== state.token) {
            // Token was added/modified in another tab
            console.log('AuthContext: Updating token from another tab');
            dispatch({ type: 'UPDATE_TOKEN', payload: event.newValue });
            api.defaults.headers.common['Authorization'] = `Bearer ${event.newValue}`;
          } else if (!event.newValue && state.token) {
            // Token was removed in another tab
            console.log('AuthContext: Token removed in another tab, logging out');
            dispatch({ type: 'AUTH_LOGOUT' });
            delete api.defaults.headers.common['Authorization'];
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.token]);

  // Handle beforeunload to refresh token before leaving
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (state.token) {
        try {
          // Use sendBeacon for reliable token refresh before unload
          const token = localStorage.getItem('token');
          if (token) {
            const data = new FormData();
            data.append('token', token);
            navigator.sendBeacon('/api/auth/refresh', data);
          }
        } catch (error) {
          console.error('AuthContext: Token refresh before unload failed:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.token]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('AuthContext: Network connection restored');
      // When coming back online, validate the current token
      if (state.token) {
        validateToken().catch(error => {
          console.error('AuthContext: Token validation after coming online failed:', error);
        });
      }
    };

    const handleOffline = () => {
      console.log('AuthContext: Network connection lost');
      // Don't logout on network loss, just log it
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.token]);

  // Handle focus events to refresh token when returning to app
  useEffect(() => {
    const handleFocus = async () => {
      if (state.token) {
        try {
          console.log('AuthContext: Window focused, checking token validity');
          const isValid = await validateToken();
          if (!isValid) {
            console.log('AuthContext: Token invalid on focus, logging out');
            logout();
          }
        } catch (error) {
          console.error('AuthContext: Token validation on focus failed:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [state.token]);

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        return false;
      }

      // Set the current token temporarily for the refresh request
      api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      
      const response = await api.post('/auth/refresh');
      const { token: newToken } = response.data;
      
      // Update token in state and localStorage
      dispatch({ type: 'UPDATE_TOKEN', payload: newToken });
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Remove invalid token
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return false;
    }
  };

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext: Checking auth with token:', token ? 'exists' : 'missing');
      
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          
          // First validate the token
          const isValid = await validateToken();
          if (!isValid) {
            console.log('AuthContext: Stored token is invalid, removing it');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            dispatch({ type: 'AUTH_LOGOUT' });
            return;
          }
          
          // Try to restore the user session
          const sessionRestored = await restoreUserSession();
          if (sessionRestored) {
            console.log('AuthContext: User session restored successfully');
            return;
          }
          
          // If restore fails, try silent auth refresh
          console.log('AuthContext: Session restore failed, trying silent auth refresh');
          const refreshSuccess = await silentAuthRefresh();
          if (refreshSuccess) {
            console.log('AuthContext: Silent auth refresh successful');
            return;
          }
          
          // If refresh fails, try to recover from inconsistent state
          console.log('AuthContext: Silent auth refresh failed, trying recovery');
          const recoverySuccess = await recoverFromInconsistentState();
          if (recoverySuccess) {
            console.log('AuthContext: Recovery successful');
            return;
          }
          
          // If all else fails, try the old method as final fallback
          console.log('AuthContext: All methods failed, trying fallback method');
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/auth/profile');
          console.log('AuthContext: Profile response:', response.data);
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: response.data.user, token },
          });
        } catch (error: any) {
          console.error('AuthContext: Auth check failed:', error);
          
          // Try to refresh token if it's a 401 error
          if (error.response?.status === 401) {
            console.log('AuthContext: Attempting token refresh after 401 error');
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              // Try to get profile again with new token
              try {
                const profileResponse = await api.get('/auth/profile');
                const token = localStorage.getItem('token');
                if (token) {
                  dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: { user: profileResponse.data.user, token },
                  });
                  return;
                }
              } catch (profileError) {
                console.error('AuthContext: Profile fetch after refresh failed:', profileError);
              }
            }
          }
          
          // If refresh fails, try network recovery for network errors
          if (!error.response) {
            console.log('AuthContext: Network error detected, attempting recovery');
            const recoverySuccess = await handleNetworkRecovery();
            if (recoverySuccess) {
              console.log('AuthContext: Network recovery successful');
              return;
            }
          }
          
          // If all recovery attempts fail, logout
          console.log('AuthContext: All authentication attempts failed, logging out');
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          dispatch({ type: 'AUTH_LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_INITIALIZED' });
        }
      } else {
        console.log('AuthContext: No token found, marking as initialized');
        dispatch({ type: 'SET_INITIALIZED' });
      }
    };

    // Add a small delay to ensure the app is fully loaded
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Login function
  const login = async (email: string, password: string, role?: 'CUSTOMER' | 'ADMIN') => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('AuthContext: Attempting login for:', email, 'with role:', role);
      console.log('AuthContext: Making request to /auth/login');
      
      // Only send email and password to backend (backend doesn't expect role)
      const response = await api.post('/auth/login', { email, password });
      console.log('AuthContext: Backend response received:', response);
      
      const { user, token } = response.data;
      console.log('AuthContext: Login response:', { user, token: token ? 'exists' : 'missing' });
      
      // Validate that the user's actual role matches the expected role (if specified)
      if (role && user.role !== role) {
        const errorMessage = `This account is registered as a ${user.role}, not a ${role}. Please select the correct role or contact support.`;
        console.log('AuthContext: Role mismatch:', errorMessage);
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('AuthContext: Token stored in localStorage');
      
      // Set default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      console.log('AuthContext: Login successful, user authenticated');
      
      // Ensure isInitialized is set to true after successful login
      dispatch({ type: 'SET_INITIALIZED' });
      
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (user.role === 'CUSTOMER') {
        window.location.href = '/customer/dashboard';
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      console.error('AuthContext: Error response:', error.response);
      console.error('AuthContext: Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext: Logging out user');
    
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear any existing intervals or timeouts
    // Note: The useEffect cleanup functions will handle this automatically
    
    dispatch({ type: 'AUTH_LOGOUT' });
    
    // Force page reload to clear any cached state
    window.location.href = '/login';
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', userData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      throw new Error(errorMessage);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Token validation function
  const validateToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      // Set the token in headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Use the profile endpoint which properly validates the token
      const response = await api.get('/auth/profile');
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  // Function to restore user session from token
  const restoreUserSession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      // Set the token in headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user profile
      const response = await api.get('/auth/profile');
      const user = response.data.user;
      
      // Update state with user and token
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      return true;
    } catch (error) {
      console.error('Failed to restore user session:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return false;
    }
  };

  // Function to handle silent authentication refresh
  const silentAuthRefresh = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      // Try to refresh the token silently
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Try to restore the user session with the new token
        return await restoreUserSession();
      }
      return false;
    } catch (error) {
      console.error('Silent auth refresh failed:', error);
      return false;
    }
  };

  // Function to handle edge cases and recover from inconsistent state
  const recoverFromInconsistentState = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      console.log('AuthContext: Attempting to recover from inconsistent state');
      
      // Try to validate the token first
      const isValid = await validateToken();
      if (!isValid) {
        console.log('AuthContext: Token validation failed during recovery');
        return false;
      }

      // Try to get user profile directly
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/profile');
      
      if (response.data && response.data.user) {
        console.log('AuthContext: Recovery successful, user profile retrieved');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token },
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('AuthContext: Recovery attempt failed:', error);
      return false;
    }
  };

  // Function to handle network recovery
  const handleNetworkRecovery = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      console.log('AuthContext: Attempting network recovery');
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to validate token again
      const isValid = await validateToken();
      if (!isValid) {
        return false;
      }

      // Try to restore session
      return await restoreUserSession();
    } catch (error) {
      console.error('AuthContext: Network recovery failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    refreshToken,
    validateToken,
    restoreUserSession,
    silentAuthRefresh,
    recoverFromInconsistentState,
    handleNetworkRecovery,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 