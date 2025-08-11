import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axios from 'axios';

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
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
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
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
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
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
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
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const response = await axios.get('/api/auth/profile');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: response.data.user, token },
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await axios.post('/api/auth/login', { email, password });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await axios.post('/api/auth/register', userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await axios.put('/api/auth/profile', userData);
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

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
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