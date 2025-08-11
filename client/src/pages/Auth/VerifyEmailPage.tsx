import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        // TODO: Implement email verification functionality
        // For now, simulate success
        setTimeout(() => {
          setVerified(true);
          setLoading(false);
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to verify email');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (loading) {
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
              textAlign: 'center'
            }}
          >
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Verifying your email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your email address.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (verified) {
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
              textAlign: 'center'
            }}
          >
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
              Email Verified!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your email has been successfully verified. You can now log in to your account.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                mb: 3,
                py: 1.5,
                px: 4,
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
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

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
            textAlign: 'center'
          }}
        >
          <Error sx={{ fontSize: 60, color: 'error.main', mb: 3 }} />
          <Typography variant="h4" sx={{ mb: 2, color: 'error.main' }}>
            Verification Failed
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            We couldn't verify your email address. Please check the link or request a new verification email.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Go to Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Register Again
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage; 