import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  Chip,
  Stack,
  FormControlLabel,
  Switch,
  Divider,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'ADMIN'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      role: e.target.value as 'CUSTOMER' | 'ADMIN'
    });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      
      // Redirect based on user role
      if (formData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError('Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            animation: 'slideInUp 0.6s ease-out',
            '@keyframes slideInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 1
              }}
            >
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign up to start managing your rentals
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Role Selection Section */}
          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, textAlign: 'center' }}>
                Register As:
              </FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                sx={{ justifyContent: 'space-around' }}
              >
                <FormControlLabel
                  value="CUSTOMER"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person fontSize="small" />
                      Customer
                    </Box>
                  }
                />
                <FormControlLabel
                  value="ADMIN"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AdminPanelSettings fontSize="small" />
                      Admin
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2, px: 2, lineHeight: 1.4 }}>
              {formData.role === 'CUSTOMER' 
                ? 'Create an account to access rental services and manage your equipment rentals' 
                : 'Create an account to access internal rental management system for administrative operations'}
            </Typography>
          </Box>
          
          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
              />
            </Box>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: 'primary.main',
                  },
                },
              }}
            />
            
            {/* Password Fields */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
              />
            </Box>
            
            {/* Terms and Conditions Toggle */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    required
                    color="primary"
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'primary.main',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link
                      href="#"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Terms and Conditions
                    </Link>
                  </Typography>
                }
                sx={{ 
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                  }
                }}
              />
            </Box>
            
            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 4, 
                mb: 3,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>
            
            {/* Links Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" component="span">
                Already have an account?{' '}
              </Typography>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage; 