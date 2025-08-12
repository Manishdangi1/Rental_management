import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import {
  QrCode,
  CreditCard,
  AccountBalance,
  Payment,
  CheckCircle,
  Schedule,
  Warning,
  Error,
  Download,
  Print,
  Share,
  Refresh,
  Visibility,
  Close,
  AttachMoney,
  Receipt,
  Security,
  Lock,
  Smartphone,
  Computer,
  LocalShipping
} from '@mui/icons-material';
import QRCodePayment from './QRCodePayment';
import StripePayment from './StripePayment';

interface EnhancedPaymentProps {
  amount: number;
  invoiceId: string;
  currency?: string;
  description?: string;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: 'qr' | 'digital' | 'traditional';
  description: string;
  features: string[];
  processingTime: string;
  fees: string;
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

const EnhancedPayment: React.FC<EnhancedPaymentProps> = ({
  amount,
  invoiceId,
  currency = 'USD',
  description = 'Payment for rental services',
  onSuccess,
  onError,
  onCancel,
  disabled = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0);

  const paymentMethods: PaymentMethod[] = [
    // QR Code Methods
    {
      id: 'qr_venmo',
      name: 'Venmo QR',
      icon: <QrCode />,
      color: 'primary',
      category: 'qr',
      description: 'Pay with Venmo using QR code',
      features: ['Instant', 'No fees', 'Mobile app required'],
      processingTime: 'Instant',
      fees: 'Free'
    },
    {
      id: 'qr_paypal',
      name: 'PayPal QR',
      icon: <QrCode />,
      color: 'info',
      category: 'qr',
      description: 'Pay with PayPal using QR code',
      features: ['Secure', 'Widely accepted', 'Buyer protection'],
      processingTime: 'Instant',
      fees: 'Free for personal'
    },
    {
      id: 'qr_cashapp',
      name: 'Cash App QR',
      icon: <QrCode />,
      color: 'success',
      category: 'qr',
      description: 'Pay with Cash App using QR code',
      features: ['Fast', 'No fees', 'Direct deposit'],
      processingTime: 'Instant',
      fees: 'Free'
    },
    {
      id: 'qr_zelle',
      name: 'Zelle QR',
      icon: <QrCode />,
      color: 'secondary',
      category: 'qr',
      description: 'Pay with Zelle using QR code',
      features: ['Bank-to-bank', 'No fees', 'Instant'],
      processingTime: 'Instant',
      fees: 'Free'
    },
    {
      id: 'qr_apple_pay',
      name: 'Apple Pay QR',
      icon: <QrCode />,
      color: 'default',
      category: 'qr',
      description: 'Pay with Apple Pay using QR code',
      features: ['Secure', 'Touch ID', 'Apple ecosystem'],
      processingTime: 'Instant',
      fees: 'Free'
    },
    {
      id: 'qr_google_pay',
      name: 'Google Pay QR',
      icon: <QrCode />,
      color: 'warning',
      category: 'qr',
      description: 'Pay with Google Pay using QR code',
      features: ['Secure', 'Android', 'Google ecosystem'],
      processingTime: 'Instant',
      fees: 'Free'
    },
    
    // Digital Payment Methods
    {
      id: 'stripe_card',
      name: 'Credit/Debit Card',
      icon: <CreditCard />,
      color: 'primary',
      category: 'digital',
      description: 'Pay with any credit or debit card',
      features: ['Widely accepted', 'Secure', 'Rewards points'],
      processingTime: '2-3 business days',
      fees: '2.9% + $0.30'
    },
    {
      id: 'stripe_ach',
      name: 'Bank Transfer (ACH)',
      icon: <AccountBalance />,
      color: 'info',
      category: 'digital',
      description: 'Direct bank account transfer',
      features: ['Lower fees', 'Secure', 'Direct from bank'],
      processingTime: '3-5 business days',
      fees: '0.8% (max $5)'
    },
    
    // Traditional Methods
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      icon: <LocalShipping />,
      color: 'success',
      category: 'traditional',
      description: 'Pay with cash when items are delivered',
      features: ['No upfront payment', 'Pay when satisfied', 'Traditional'],
      processingTime: 'Upon delivery',
      fees: 'Free'
    },
    {
      id: 'bank_deposit',
      name: 'Bank Deposit',
      icon: <AccountBalance />,
      color: 'secondary',
      category: 'traditional',
      description: 'Direct bank deposit to our account',
      features: ['No fees', 'Secure', 'Traditional banking'],
      processingTime: '1-2 business days',
      fees: 'Free'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedMethod(null);
    setPaymentStep(0);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentStep(0);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = (payment: any) => {
    onSuccess(payment);
    setShowPaymentDialog(false);
    setPaymentStep(0);
  };

  const handlePaymentError = (error: string) => {
    onError(error);
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setPaymentStep(0);
    setSelectedMethod(null);
  };

  const getCategoryMethods = (category: string) => {
    return paymentMethods.filter(m => m.category === category);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    return method.icon;
  };

  const getMethodColor = (method: PaymentMethod) => {
    return method.color;
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <Grid item xs={12} sm={6} md={4} key={method.id}>
      <Card
        sx={{
          cursor: 'pointer',
          height: '100%',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)',
            transition: 'all 0.3s ease-in-out'
          },
          border: selectedMethod?.id === method.id ? 2 : 1,
          borderColor: selectedMethod?.id === method.id ? `${method.color}.main` : 'divider'
        }}
        onClick={() => handleMethodSelect(method)}
      >
        <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Avatar sx={{ bgcolor: `${method.color}.main`, mx: 'auto', mb: 2, width: 56, height: 56 }}>
            {getMethodIcon(method)}
          </Avatar>
          
          <Typography variant="h6" gutterBottom>
            {method.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {method.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {method.features.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {method.processingTime}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {method.fees}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderPaymentDialog = () => {
    if (!selectedMethod) return null;

    if (selectedMethod.category === 'qr') {
      return (
        <QRCodePayment
          amount={amount}
          invoiceId={invoiceId}
          currency={currency}
          description={description}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
          disabled={disabled}
        />
      );
    }

    if (selectedMethod.id === 'stripe_card' || selectedMethod.id === 'stripe_ach') {
      return (
        <StripePayment
          amount={amount}
          invoiceId={invoiceId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      );
    }

    // Traditional payment methods
    return (
      <Box>
        <Stepper activeStep={paymentStep} orientation={isMobile ? 'vertical' : 'horizontal'} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Payment Details</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirmation</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete</StepLabel>
          </Step>
        </Stepper>

        {paymentStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {selectedMethod.name} Payment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedMethod.description}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Payment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Payment Method"
                      secondary={selectedMethod.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Amount"
                      secondary={`${currency} ${amount.toFixed(2)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Receipt color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Invoice ID"
                      secondary={invoiceId}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Processing Time"
                      secondary={selectedMethod.processingTime}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Payment Instructions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedMethod.id === 'cash_on_delivery' 
                      ? 'Pay with cash when your items are delivered. No upfront payment required.'
                      : selectedMethod.id === 'bank_deposit'
                      ? 'Please deposit the amount to our bank account. We will provide account details upon confirmation.'
                      : 'Please follow the instructions below to complete your payment.'
                    }
                  </Typography>
                  
                  {selectedMethod.id === 'bank_deposit' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Bank Account Details:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, borderRadius: 1 }}>
                        Bank: Sample Bank<br/>
                        Account: 1234-5678-9012<br/>
                        Routing: 987654321<br/>
                        Account Name: Rental Management System
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {paymentStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Payment Confirmed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your payment of {currency} {amount.toFixed(2)} has been confirmed.
            </Typography>
          </Box>
        )}

        {paymentStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Payment Complete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thank you for your payment. You will receive a confirmation email shortly.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Payment Method Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Payment Method
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="payment methods" sx={{ mb: 3 }}>
          <Tab label="QR Code Payments" icon={<QrCode />} />
          <Tab label="Digital Payments" icon={<Computer />} />
          <Tab label="Traditional Methods" icon={<LocalShipping />} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            {getCategoryMethods('qr').map(renderPaymentMethod)}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2}>
            {getCategoryMethods('digital').map(renderPaymentMethod)}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={2}>
            {getCategoryMethods('traditional').map(renderPaymentMethod)}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={handlePaymentCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedMethod?.icon}
            <Typography variant="h6">
              {selectedMethod?.name} Payment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderPaymentDialog()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentCancel}>Cancel</Button>
          {selectedMethod && selectedMethod.category === 'traditional' && paymentStep < 2 && (
            <Button
              variant="contained"
              onClick={() => setPaymentStep(prev => prev + 1)}
            >
              {paymentStep === 0 ? 'Confirm Payment' : 'Complete'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EnhancedPayment;
