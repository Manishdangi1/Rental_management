import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Security,
  Notifications,
  Payment,
  Save,
  Edit,
  Cancel,
  VerifiedUser,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile Information
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '123 Main St, City, State 12345',
    city: 'City',
    state: 'State',
    zipCode: '12345',
    dateOfBirth: '1990-01-01'
  });

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    rentalReminders: true,
    paymentReminders: true,
    promotionalEmails: false,
    orderUpdates: true
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    passwordChangeRequired: false,
    lastPasswordChange: '2024-01-01'
  });

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'Credit Card',
      last4: '1234',
      expiry: '12/25',
      isDefault: true,
      brand: 'Visa'
    },
    {
      id: '2',
      type: 'PayPal',
      email: 'customer@paypal.com',
      isDefault: false
    }
  ]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '123 Main St, City, State 12345',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        dateOfBirth: '1990-01-01'
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field: string, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (updateProfile) {
        await updateProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone
        });
      }
      
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset to original values
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '123 Main St, City, State 12345',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        dateOfBirth: '1990-01-01'
      });
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        {!editing && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {/* Success/Error Alerts */}
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3
              }}
            >
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'C'}
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={user?.role || 'CUSTOMER'} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label="Verified" 
                  color="success" 
                  size="small" 
                  icon={<VerifiedUser />}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Personal Info" icon={<Person />} iconPosition="start" />
          <Tab label="Notifications" icon={<Notifications />} iconPosition="start" />
          <Tab label="Security" icon={<Security />} iconPosition="start" />
          <Tab label="Payment Methods" icon={<Payment />} iconPosition="start" />
        </Tabs>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                margin="normal"
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                margin="normal"
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileData.email}
                margin="normal"
                disabled
                InputProps={{
                  endAdornment: (
                    <Chip 
                      label="Verified" 
                      color="success" 
                      size="small" 
                      icon={<VerifiedUser />}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                margin="normal"
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={profileData.address}
                onChange={(e) => handleProfileChange('address', e.target.value)}
                margin="normal"
                disabled={!editing}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={profileData.city}
                onChange={(e) => handleProfileChange('city', e.target.value)}
                margin="normal"
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={profileData.state}
                onChange={(e) => handleProfileChange('state', e.target.value)}
                margin="normal"
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={profileData.zipCode}
                onChange={(e) => handleProfileChange('zipCode', e.target.value)}
                margin="normal"
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                margin="normal"
                disabled={!editing}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {editing && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Notification Preferences Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.emailNotifications}
                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Receive important updates via email
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.smsNotifications}
                    onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                  />
                }
                label="SMS Notifications"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Receive urgent updates via text message
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.rentalReminders}
                    onChange={(e) => handleNotificationChange('rentalReminders', e.target.checked)}
                  />
                }
                label="Rental Reminders"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Get reminded about upcoming rental dates
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.paymentReminders}
                    onChange={(e) => handleNotificationChange('paymentReminders', e.target.checked)}
                  />
                }
                label="Payment Reminders"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Receive payment due reminders
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.orderUpdates}
                    onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                  />
                }
                label="Order Updates"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Get notified about rental status changes
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationPrefs.promotionalEmails}
                    onChange={(e) => handleNotificationChange('promotionalEmails', e.target.checked)}
                  />
                }
                label="Promotional Emails"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Receive special offers and promotions
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                  />
                }
                label="Two-Factor Authentication"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Add an extra layer of security to your account
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                  />
                }
                label="Login Alerts"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Get notified of new login attempts
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="h6" color="warning.main">
                      Password Security
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last password change: {securitySettings.lastPasswordChange}
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Payment Methods Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" size="small">
              Add Payment Method
            </Button>
          </Box>
          
          <List>
            {paymentMethods.map((method, index) => (
              <React.Fragment key={method.id}>
                <ListItem>
                  <ListItemIcon>
                    <Payment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {method.type}
                        {method.isDefault && (
                          <Chip label="Default" color="primary" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      method.type === 'Credit Card' 
                        ? `${method.brand} ending in ${method.last4} • Expires ${method.expiry}`
                        : method.email
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error">
                      Remove
                    </Button>
                  </Box>
                </ListItem>
                {index < paymentMethods.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CustomerProfile; 