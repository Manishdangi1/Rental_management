import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import {
  Settings,
  Business,
  Security,
  Notifications,
  Payment,
  LocalShipping,
  Save,
  Refresh
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminSettings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    companyName: 'RentPro Equipment Rental',
    businessEmail: 'info@rentpro.com',
    phone: '+1-555-0123',
    address: '123 Business St, City, State 12345',
    website: 'https://rentpro.com',
    taxRate: 8.5,
    currency: 'USD',
    timezone: 'America/New_York'
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    enableAuditLog: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    rentalReminders: true,
    paymentReminders: true,
    systemAlerts: true,
    marketingEmails: false
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    paypalEnabled: true,
    cashOnDelivery: true,
    requireDeposit: true,
    depositPercentage: 20,
    lateFeePercentage: 5
  });

  // Delivery Settings
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryEnabled: true,
    pickupEnabled: true,
    deliveryFee: 25,
    freeDeliveryThreshold: 200,
    deliveryRadius: 50,
    sameDayDelivery: false
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBusinessSettingChange = (field: string, value: string | number) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemSettingChange = (field: string, value: boolean | number) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentSettingChange = (field: string, value: boolean | number) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliverySettingChange = (field: string, value: boolean | number) => {
    setDeliverySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setBusinessSettings({
      companyName: 'RentPro Equipment Rental',
      businessEmail: 'info@rentpro.com',
      phone: '+1-555-0123',
      address: '123 Business St, City, State 12345',
      website: 'https://rentpro.com',
      taxRate: 8.5,
      currency: 'USD',
      timezone: 'America/New_York'
    });
    // Add other resets as needed
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">System Settings</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* Success Alert */}
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Settings Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Business" icon={<Business />} iconPosition="start" />
          <Tab label="System" icon={<Settings />} iconPosition="start" />
          <Tab label="Notifications" icon={<Notifications />} iconPosition="start" />
          <Tab label="Payments" icon={<Payment />} iconPosition="start" />
          <Tab label="Delivery" icon={<LocalShipping />} iconPosition="start" />
        </Tabs>

        {/* Business Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={businessSettings.companyName}
                onChange={(e) => handleBusinessSettingChange('companyName', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Email"
                type="email"
                value={businessSettings.businessEmail}
                onChange={(e) => handleBusinessSettingChange('businessEmail', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={businessSettings.phone}
                onChange={(e) => handleBusinessSettingChange('phone', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={businessSettings.website}
                onChange={(e) => handleBusinessSettingChange('website', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Address"
                multiline
                rows={3}
                value={businessSettings.address}
                onChange={(e) => handleBusinessSettingChange('address', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={businessSettings.taxRate}
                onChange={(e) => handleBusinessSettingChange('taxRate', parseFloat(e.target.value))}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Currency</InputLabel>
                <Select
                  value={businessSettings.currency}
                  label="Currency"
                  onChange={(e) => handleBusinessSettingChange('currency', e.target.value)}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="CAD">CAD (C$)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={businessSettings.timezone}
                  label="Timezone"
                  onChange={(e) => handleBusinessSettingChange('timezone', e.target.value)}
                >
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Chicago">Central Time</MenuItem>
                  <MenuItem value="America/Denver">Mountain Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Temporarily disable the system for maintenance
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.allowRegistration}
                    onChange={(e) => handleSystemSettingChange('allowRegistration', e.target.checked)}
                  />
                }
                label="Allow User Registration"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Allow new users to create accounts
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.requireEmailVerification}
                    onChange={(e) => handleSystemSettingChange('requireEmailVerification', e.target.checked)}
                  />
                }
                label="Require Email Verification"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.enableAuditLog}
                    onChange={(e) => handleSystemSettingChange('enableAuditLog', e.target.checked)}
                  />
                }
                label="Enable Audit Logging"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                value={systemSettings.maxLoginAttempts}
                onChange={(e) => handleSystemSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={systemSettings.sessionTimeout}
                onChange={(e) => handleSystemSettingChange('sessionTimeout', parseInt(e.target.value))}
                margin="normal"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => handleNotificationSettingChange('smsNotifications', e.target.checked)}
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.rentalReminders}
                    onChange={(e) => handleNotificationSettingChange('rentalReminders', e.target.checked)}
                  />
                }
                label="Rental Reminders"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.paymentReminders}
                    onChange={(e) => handleNotificationSettingChange('paymentReminders', e.target.checked)}
                  />
                }
                label="Payment Reminders"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onChange={(e) => handleNotificationSettingChange('systemAlerts', e.target.checked)}
                  />
                }
                label="System Alerts"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onChange={(e) => handleNotificationSettingChange('marketingEmails', e.target.checked)}
                  />
                }
                label="Marketing Emails"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Payment Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentSettings.stripeEnabled}
                    onChange={(e) => handlePaymentSettingChange('stripeEnabled', e.target.checked)}
                  />
                }
                label="Enable Stripe Payments"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentSettings.paypalEnabled}
                    onChange={(e) => handlePaymentSettingChange('paypalEnabled', e.target.checked)}
                  />
                }
                label="Enable PayPal Payments"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentSettings.cashOnDelivery}
                    onChange={(e) => handlePaymentSettingChange('cashOnDelivery', e.target.checked)}
                  />
                }
                label="Cash on Delivery"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentSettings.requireDeposit}
                    onChange={(e) => handlePaymentSettingChange('requireDeposit', e.target.checked)}
                  />
                }
                label="Require Deposit"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Deposit Percentage"
                type="number"
                value={paymentSettings.depositPercentage}
                onChange={(e) => handlePaymentSettingChange('depositPercentage', parseInt(e.target.value))}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Late Fee Percentage"
                type="number"
                value={paymentSettings.lateFeePercentage}
                onChange={(e) => handlePaymentSettingChange('lateFeePercentage', parseInt(e.target.value))}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Delivery Settings Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={deliverySettings.deliveryEnabled}
                    onChange={(e) => handleDeliverySettingChange('deliveryEnabled', e.target.checked)}
                  />
                }
                label="Enable Delivery Service"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={deliverySettings.pickupEnabled}
                    onChange={(e) => handleDeliverySettingChange('pickupEnabled', e.target.checked)}
                  />
                }
                label="Enable Pickup Service"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Fee ($)"
                type="number"
                value={deliverySettings.deliveryFee}
                onChange={(e) => handleDeliverySettingChange('deliveryFee', parseFloat(e.target.value))}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Free Delivery Threshold ($)"
                type="number"
                value={deliverySettings.freeDeliveryThreshold}
                onChange={(e) => handleDeliverySettingChange('freeDeliveryThreshold', parseFloat(e.target.value))}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Radius (miles)"
                type="number"
                value={deliverySettings.deliveryRadius}
                onChange={(e) => handleDeliverySettingChange('deliveryRadius', parseInt(e.target.value))}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={deliverySettings.sameDayDelivery}
                    onChange={(e) => handleDeliverySettingChange('sameDayDelivery', e.target.checked)}
                  />
                }
                label="Same Day Delivery"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminSettings; 