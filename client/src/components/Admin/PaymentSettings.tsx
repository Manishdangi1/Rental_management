import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Payment,
  QrCode,
  CreditCard,
  AccountBalance,
  Settings,
  Save,
  Edit,
  Delete,
  Add,
  ExpandMore,
  Security,
  CheckCircle,
  Warning,
  Error,
  Info,
  LocalShipping,
  Smartphone,
  Computer
} from '@mui/icons-material';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'qr' | 'digital' | 'traditional';
  enabled: boolean;
  config: any;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
  processingTime: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

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
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const PaymentSettings: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    // QR Code Methods
    {
      id: 'qr_venmo',
      name: 'Venmo QR',
      type: 'qr',
      enabled: true,
      config: {
        merchantId: 'rental_management',
        callbackUrl: 'https://rental-management.com/payment/callback'
      },
      fees: { percentage: 0, fixed: 0, currency: 'USD' },
      processingTime: 'Instant',
      description: 'Pay with Venmo using QR code',
      icon: <QrCode />,
      color: 'primary'
    },
    {
      id: 'qr_paypal',
      name: 'PayPal QR',
      type: 'qr',
      enabled: true,
      config: {
        clientId: 'your_paypal_client_id',
        secret: 'your_paypal_secret',
        mode: 'sandbox'
      },
      fees: { percentage: 2.9, fixed: 0.30, currency: 'USD' },
      processingTime: 'Instant',
      description: 'Pay with PayPal using QR code',
      icon: <QrCode />,
      color: 'info'
    },
    {
      id: 'qr_cashapp',
      name: 'Cash App QR',
      type: 'qr',
      enabled: false,
      config: {
        cashtag: '$RentalManagement',
        callbackUrl: 'https://rental-management.com/payment/callback'
      },
      fees: { percentage: 0, fixed: 0, currency: 'USD' },
      processingTime: 'Instant',
      description: 'Pay with Cash App using QR code',
      icon: <QrCode />,
      color: 'success'
    },
    {
      id: 'qr_zelle',
      name: 'Zelle QR',
      type: 'qr',
      enabled: false,
      config: {
        email: 'payments@rental-management.com',
        phone: '+1-555-0123'
      },
      fees: { percentage: 0, fixed: 0, currency: 'USD' },
      processingTime: 'Instant',
      description: 'Pay with Zelle using QR code',
      icon: <QrCode />,
      color: 'secondary'
    },
    
    // Digital Payment Methods
    {
      id: 'stripe_card',
      name: 'Stripe Credit/Debit Cards',
      type: 'digital',
      enabled: true,
      config: {
        publishableKey: 'pk_test_your_stripe_key',
        secretKey: 'sk_test_your_stripe_secret',
        webhookSecret: 'whsec_your_webhook_secret'
      },
      fees: { percentage: 2.9, fixed: 0.30, currency: 'USD' },
      processingTime: '2-3 business days',
      description: 'Accept all major credit and debit cards',
      icon: <CreditCard />,
      color: 'primary'
    },
    {
      id: 'stripe_ach',
      name: 'Stripe ACH Transfer',
      type: 'digital',
      enabled: false,
      config: {
        publishableKey: 'pk_test_your_stripe_key',
        secretKey: 'sk_test_your_stripe_secret'
      },
      fees: { percentage: 0.8, fixed: 5.00, currency: 'USD' },
      processingTime: '3-5 business days',
      description: 'Direct bank account transfers',
      icon: <AccountBalance />,
      color: 'info'
    },
    
    // Traditional Methods
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      type: 'traditional',
      enabled: true,
      config: {
        requireSignature: true,
        maxAmount: 1000,
        deliveryInstructions: 'Cash payment upon delivery'
      },
      fees: { percentage: 0, fixed: 0, currency: 'USD' },
      processingTime: 'Upon delivery',
      description: 'Pay with cash when items are delivered',
      icon: <LocalShipping />,
      color: 'success'
    },
    {
      id: 'bank_deposit',
      name: 'Bank Deposit',
      type: 'traditional',
      enabled: true,
      config: {
        bankName: 'Sample Bank',
        accountNumber: '1234-5678-9012',
        routingNumber: '987654321',
        accountName: 'Rental Management System'
      },
      fees: { percentage: 0, fixed: 0, currency: 'USD' },
      processingTime: '1-2 business days',
      description: 'Direct bank deposit to our account',
      icon: <AccountBalance />,
      color: 'secondary'
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMethodToggle = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === methodId 
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Payment settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to save payment settings');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowAddDialog(true);
  };

  const handleAddMethod = () => {
    setEditingMethod(null);
    setShowAddDialog(true);
  };

  const getTypeMethods = (type: string) => {
    return paymentMethods.filter(m => m.type === type);
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? <CheckCircle color="success" /> : <Warning color="warning" />;
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'success' : 'warning';
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <Card key={method.id} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={1}>
            <Avatar sx={{ bgcolor: `${method.color}.main` }}>
              {method.icon}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              {method.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {method.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" gutterBottom>
              <strong>Fees:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {method.fees.percentage > 0 ? `${method.fees.percentage}%` : 'Free'}
              {method.fees.fixed > 0 && ` + $${method.fees.fixed.toFixed(2)}`}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" gutterBottom>
              <strong>Processing:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {method.processingTime}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={getStatusIcon(method.enabled)}
                label={method.enabled ? 'Enabled' : 'Disabled'}
                color={getStatusColor(method.enabled) as any}
                size="small"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => handleEditMethod(method)}
              >
                Edit
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={method.enabled}
                    onChange={() => handleMethodToggle(method.id)}
                    color="primary"
                  />
                }
                label=""
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure and manage payment methods for your rental management system
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Payment Methods Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Payment Methods
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddMethod}
          >
            Add Payment Method
          </Button>
        </Box>
        
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="payment methods">
          <Tab label="QR Code Payments" icon={<QrCode />} />
          <Tab label="Digital Payments" icon={<Computer />} />
          <Tab label="Traditional Methods" icon={<LocalShipping />} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              QR Code Payment Methods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure QR code payment methods for instant mobile payments
            </Typography>
            {getTypeMethods('qr').map(renderPaymentMethod)}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Digital Payment Methods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure online payment processing methods
            </Typography>
            {getTypeMethods('digital').map(renderPaymentMethod)}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Traditional Payment Methods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure offline and traditional payment methods
            </Typography>
            {getTypeMethods('traditional').map(renderPaymentMethod)}
          </Box>
        </TabPanel>
      </Paper>

      {/* Global Payment Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Global Payment Settings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Require Payment Confirmation"
            />
            <Typography variant="body2" color="text.secondary">
              Require manual confirmation for payments above threshold
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Payment Notifications"
            />
            <Typography variant="body2" color="text.secondary">
              Send notifications for successful and failed payments
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Confirmation Threshold"
              type="number"
              defaultValue={1000}
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
              }}
              helperText="Amount above which payment confirmation is required"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Timeout (minutes)"
              type="number"
              defaultValue={30}
              helperText="Time before pending payments expire"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Security Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable 3D Secure"
            />
            <Typography variant="body2" color="text.secondary">
              Require additional authentication for card payments
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Fraud Detection"
            />
            <Typography variant="body2" color="text.secondary">
              Use AI-powered fraud detection for payments
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch />}
              label="Enable IP Whitelisting"
            />
            <Typography variant="body2" color="text.secondary">
              Restrict payments to specific IP addresses
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Payment Logging"
            />
            <Typography variant="body2" color="text.secondary">
              Log all payment activities for audit purposes
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Reset Changes
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {/* Add/Edit Payment Method Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {editingMethod 
              ? 'Update the configuration for this payment method'
              : 'Configure a new payment method for your system'
            }
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Method Name"
                defaultValue={editingMethod?.name || ''}
                helperText="Display name for the payment method"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                defaultValue={editingMethod?.description || ''}
                helperText="Brief description of the payment method"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fee Percentage"
                type="number"
                defaultValue={editingMethod?.fees.percentage || 0}
                InputProps={{
                  endAdornment: <Typography variant="body2">%</Typography>
                }}
                helperText="Percentage fee for this payment method"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fixed Fee"
                type="number"
                defaultValue={editingMethod?.fees.fixed || 0}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
                helperText="Fixed fee amount for this payment method"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Processing Time"
                defaultValue={editingMethod?.processingTime || ''}
                helperText="Estimated time for payment processing"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {editingMethod ? 'Update' : 'Add'} Method
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentSettings;
