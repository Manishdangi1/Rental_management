import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      {message && (
        <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Member since {new Date().getFullYear()}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant={isEditing ? "outlined" : "contained"}
                  onClick={() => setIsEditing(!isEditing)}
                  fullWidth
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      multiline
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Account Type
                  </Typography>
                  <Typography variant="body1">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Account Status
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Active
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 