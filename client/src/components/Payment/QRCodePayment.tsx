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
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  QrCode,
  QrCode2,
  Smartphone,
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
  Receipt
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodePaymentProps {
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
  qrSupported: boolean;
  description: string;
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

const QRCodePayment: React.FC<QRCodePaymentProps> = ({
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
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'qr_venmo',
      name: 'Venmo QR',
      icon: <QrCode />,
      color: 'primary',
      qrSupported: true,
      description: 'Pay with Venmo using QR code'
    },
    {
      id: 'qr_paypal',
      name: 'PayPal QR',
      icon: <QrCode />,
      color: 'info',
      qrSupported: true,
      description: 'Pay with PayPal using QR code'
    },
    {
      id: 'qr_cashapp',
      name: 'Cash App QR',
      icon: <QrCode />,
      color: 'success',
      qrSupported: true,
      description: 'Pay with Cash App using QR code'
    },
    {
      id: 'qr_zelle',
      name: 'Zelle QR',
      icon: <QrCode />,
      color: 'secondary',
      qrSupported: true,
      description: 'Pay with Zelle using QR code'
    },
    {
      id: 'qr_apple_pay',
      name: 'Apple Pay QR',
      icon: <QrCode />,
      color: 'default',
      qrSupported: true,
      description: 'Pay with Apple Pay using QR code'
    },
    {
      id: 'qr_google_pay',
      name: 'Google Pay QR',
      icon: <QrCode />,
      color: 'warning',
      qrSupported: true,
      description: 'Pay with Google Pay using QR code'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: <AccountBalance />,
      color: 'info',
      qrSupported: false,
      description: 'Direct bank transfer'
    },
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: <CreditCard />,
      color: 'primary',
      qrSupported: false,
      description: 'Pay with credit or debit card'
    }
  ];

  useEffect(() => {
    if (selectedMethod && selectedMethod.qrSupported) {
      generateQRCode();
    }
  }, [selectedMethod]);

  const generateQRCode = () => {
    if (!selectedMethod) return;

    // Generate QR code data based on payment method
    const qrData = {
      method: selectedMethod.id,
      amount: amount,
      currency: currency,
      invoiceId: invoiceId,
      description: description,
      timestamp: new Date().toISOString(),
      merchant: 'Rental Management System'
    };

    setQrCodeData(JSON.stringify(qrData));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedMethod(null);
    setError(null);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
    
    if (method.qrSupported) {
      setShowQRDialog(true);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success
      setPaymentStatus('completed');
      
      // Call success callback
      onSuccess({
        id: `payment_${Date.now()}`,
        method: selectedMethod.id,
        amount: amount,
        currency: currency,
        status: 'completed',
        transactionId: `txn_${Date.now()}`,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setPaymentStatus('failed');
      onError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus('pending');
    setError(null);
    setShowQRDialog(true);
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `payment-qr-${selectedMethod?.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment QR Code</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px 0; }
              .payment-info { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h2>Payment QR Code</h2>
            <div class="payment-info">
              <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
              <p><strong>Method:</strong> ${selectedMethod?.name}</p>
              <p><strong>Invoice:</strong> ${invoiceId}</p>
            </div>
            <div class="qr-container">
              <img src="${document.querySelector('canvas')?.toDataURL()}" alt="Payment QR Code" />
            </div>
            <p>Scan this QR code with your payment app to complete the payment</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Schedule color="info" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Schedule color="warning" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      {/* Payment Method Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Payment Method
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="payment methods">
          <Tab label="QR Code Payments" icon={<QrCode />} />
          <Tab label="Traditional Methods" icon={<CreditCard />} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            {paymentMethods.filter(m => m.qrSupported).map((method) => (
              <Grid item xs={12} sm={6} md={4} key={method.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease-in-out'
                    },
                    border: selectedMethod?.id === method.id ? 2 : 1,
                    borderColor: selectedMethod?.id === method.id ? `${method.color}.main` : 'divider'
                  }}
                  onClick={() => handleMethodSelect(method)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: `${method.color}.main`, mx: 'auto', mb: 2 }}>
                      {method.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {method.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2}>
            {paymentMethods.filter(m => !m.qrSupported).map((method) => (
              <Grid item xs={12} sm={6} md={4} key={method.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease-in-out'
                    },
                    border: selectedMethod?.id === method.id ? 2 : 1,
                    borderColor: selectedMethod?.id === method.id ? `${method.color}.main` : 'divider'
                  }}
                  onClick={() => handleMethodSelect(method)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: `${method.color}.main`, mx: 'auto', mb: 2 }}>
                      {method.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {method.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Payment Details */}
      {selectedMethod && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Details
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
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  icon={getStatusIcon()}
                  label={paymentStatus.toUpperCase()}
                  color={getStatusColor() as any}
                  sx={{ mb: 2 }}
                />
                
                {paymentStatus === 'pending' && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handlePaymentSubmit}
                    disabled={loading || disabled}
                    startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                    fullWidth
                  >
                    {loading ? 'Processing...' : `Pay ${currency} ${amount.toFixed(2)}`}
                  </Button>
                )}
                
                {paymentStatus === 'failed' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRetryPayment}
                    startIcon={<Refresh />}
                    fullWidth
                  >
                    Retry Payment
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* QR Code Dialog */}
      <Dialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <QrCode color="primary" />
            <Typography variant="h6">
              {selectedMethod?.name} Payment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {qrCodeData ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <QRCodeSVG
                    value={qrCodeData}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  Scan to Pay
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Open your {selectedMethod?.name} app and scan this QR code to complete your payment of {currency} {amount.toFixed(2)}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={downloadQRCode}
                  >
                    Download QR
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={printQRCode}
                  >
                    Print QR
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Payment QR Code',
                          text: `Scan this QR code to pay ${currency} ${amount.toFixed(2)}`,
                          url: window.location.href
                        });
                      }
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handlePaymentSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        {selectedMethod && !selectedMethod.qrSupported && (
          <Button
            variant="contained"
            onClick={handlePaymentSubmit}
            disabled={loading || disabled}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
          >
            {loading ? 'Processing...' : `Pay ${currency} ${amount.toFixed(2)}`}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QRCodePayment;
