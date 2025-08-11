import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Badge,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  CheckCircle,
  Schedule,
  Warning,
  Error,
  Visibility,
  Download,
  Receipt,
  AttachMoney,
  CalendarToday,
  AccessTime,
  Description,
  Security,
  Lock
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  rentalId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'CASH';
  methodDetails: {
    type: string;
    last4?: string;
    brand?: string;
    accountNumber?: string;
    bankName?: string;
  };
  transactionId?: string;
  authorizationCode?: string;
  processedDate?: string;
  failureReason?: string;
  refundReason?: string;
  refundDate?: string;
  securityDeposit: boolean;
  description: string;
  metadata?: any;
}

const CustomerPayments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/payments');
      setPayments(response.data || []);
    } catch (error: any) {
      console.error('Error loading payments:', error);
      setError(error.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'info';
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      case 'REFUNDED': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Schedule />;
      case 'PROCESSING': return <AccessTime />;
      case 'COMPLETED': return <CheckCircle />;
      case 'FAILED': return <Error />;
      case 'REFUNDED': return <Receipt />;
      default: return <Payment />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'PROCESSING': return 'Processing';
      case 'COMPLETED': return 'Completed';
      case 'FAILED': return 'Failed';
      case 'REFUNDED': return 'Refunded';
      default: return status;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard />;
      case 'BANK_TRANSFER':
        return <AccountBalance />;
      case 'PAYPAL':
        return <Payment />;
      case 'CASH':
        return <AttachMoney />;
      default:
        return <Payment />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return 'primary';
      case 'BANK_TRANSFER':
        return 'info';
      case 'PAYPAL':
        return 'secondary';
      case 'CASH':
        return 'success';
      default:
        return 'default';
    }
  };

  const getFilteredPayments = () => {
    let filtered = payments || [];

    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter(p => ['PENDING', 'PROCESSING'].includes(p.status));
    } else if (filter === 'completed') {
      filtered = filtered.filter(p => p.status === 'COMPLETED');
    } else if (filter === 'failed') {
      filtered = filtered.filter(p => p.status === 'FAILED');
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailDialogOpen(true);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    // In a real app, this would download the receipt
    console.log('Downloading receipt for payment:', payment.paymentNumber);
    alert(`Downloading receipt for payment ${payment.paymentNumber}`);
  };

  const handleRetryPayment = (payment: Payment) => {
    // In a real app, this would retry the payment
    console.log('Retrying payment:', payment.paymentNumber);
    alert(`Retrying payment ${payment.paymentNumber}`);
  };

  const calculateTotalCompleted = () => {
    return (payments || [])
      .filter(p => p.status === 'COMPLETED')
      .reduce((total, p) => total + p.amount, 0);
  };

  const calculateTotalPending = () => {
    return (payments || [])
      .filter(p => ['PENDING', 'PROCESSING'].includes(p.status))
      .reduce((total, p) => total + p.amount, 0);
  };

  const calculateTotalSecurityDeposits = () => {
    return (payments || [])
      .filter(p => p.securityDeposit && p.status === 'COMPLETED')
      .reduce((total, p) => total + p.amount, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your payment history and manage transactions
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Payment />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {(payments || []).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Payments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="success.main">
                    ${calculateTotalCompleted().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    ${calculateTotalPending().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Security />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="info.main">
                    ${calculateTotalSecurityDeposits().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Security Deposits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Payment sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filter}
                label="Filter by Status"
                onChange={(e: SelectChangeEvent) => setFilter(e.target.value as any)}
              >
                <MenuItem value="all">All Payments ({(payments || []).length})</MenuItem>
                <MenuItem value="pending">Pending ({(payments || []).filter(p => ['PENDING', 'PROCESSING'].includes(p.status)).length})</MenuItem>
                <MenuItem value="completed">Completed ({(payments || []).filter(p => p.status === 'COMPLETED').length})</MenuItem>
                <MenuItem value="failed">Failed ({(payments || []).filter(p => p.status === 'FAILED').length})</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
              >
                Export All
              </Button>
              <Button
                variant="contained"
                startIcon={<Payment />}
                fullWidth
                onClick={() => navigate('/customer/invoices')}
              >
                View Invoices
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredPayments().map((payment) => (
              <TableRow key={payment.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {payment.paymentNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {payment.description}
                    </Typography>
                    {payment.securityDeposit && (
                      <Chip
                        label="Security Deposit"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {payment.invoiceNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {payment.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${getMethodColor(payment.method)}.main`,
                        width: 32,
                        height: 32
                      }}
                    >
                      {getMethodIcon(payment.method)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.methodDetails.type}
                      </Typography>
                      {payment.methodDetails.last4 && (
                        <Typography variant="caption" color="text.secondary">
                          ****{payment.methodDetails.last4}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    ${payment.amount.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {payment.currency}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(payment.status)}
                    label={getStatusLabel(payment.status)}
                    color={getStatusColor(payment.status) as any}
                    size="small"
                    variant={payment.status === 'PENDING' ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell>
                  {payment.processedDate ? (
                    <Typography variant="body2">
                      {new Date(payment.processedDate).toLocaleDateString()}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(payment)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    {payment.status === 'COMPLETED' && (
                      <IconButton
                        color="secondary"
                        onClick={() => handleDownloadReceipt(payment)}
                        title="Download Receipt"
                      >
                        <Download />
                      </IconButton>
                    )}
                    {payment.status === 'FAILED' && (
                      <IconButton
                        color="warning"
                        onClick={() => handleRetryPayment(payment)}
                        title="Retry Payment"
                      >
                        <Payment />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* No Payments */}
      {getFilteredPayments().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Payment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {filter === 'all' ? '' : filter} payments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'pending' 
              ? 'You have no pending payments.'
              : filter === 'completed'
              ? 'You have no completed payments yet.'
              : filter === 'failed'
              ? 'You have no failed payments.'
              : 'You have no payments yet.'
            }
          </Typography>
        </Box>
      )}

      {/* Payment Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPayment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Payment color="primary" />
                <Typography variant="h6">
                  Payment {selectedPayment.paymentNumber}
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedPayment.status)}
                  label={getStatusLabel(selectedPayment.status)}
                  color={getStatusColor(selectedPayment.status) as any}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Payment Status Timeline */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Payment Status
                  </Typography>
                  <Stepper orientation={isMobile ? 'vertical' : 'horizontal'} activeStep={2}>
                    <Step>
                      <StepLabel>Initiated</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Processing</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Completed</StepLabel>
                    </Step>
                  </Stepper>
                </Grid>

                {/* Payment Details */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Payment Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Payment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={selectedPayment.paymentNumber}
                          secondary="Payment Number"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <Receipt />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={selectedPayment.invoiceNumber}
                          secondary="Invoice Number"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <AttachMoney />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`$${selectedPayment.amount.toFixed(2)} ${selectedPayment.currency}`}
                          secondary="Amount"
                        />
                      </ListItem>
                      {selectedPayment.securityDeposit && (
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              <Security />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Security Deposit"
                            secondary="This is a security deposit payment"
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>

                {/* Payment Method */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Payment Method
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${getMethodColor(selectedPayment.method)}.main`,
                          width: 48,
                          height: 48
                        }}
                      >
                        {getMethodIcon(selectedPayment.method)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {selectedPayment.methodDetails.type}
                        </Typography>
                        {selectedPayment.methodDetails.last4 && (
                          <Typography variant="body2" color="text.secondary">
                            ****{selectedPayment.methodDetails.last4}
                          </Typography>
                        )}
                        {selectedPayment.methodDetails.brand && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedPayment.methodDetails.brand}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {selectedPayment.method === 'BANK_TRANSFER' && (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          <strong>Bank:</strong> {selectedPayment.methodDetails.bankName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Account:</strong> {selectedPayment.methodDetails.accountNumber}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Transaction Details */}
                {selectedPayment.transactionId && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                      <Typography variant="h6" gutterBottom>
                        Transaction Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Transaction ID:</strong> {selectedPayment.transactionId}
                          </Typography>
                        </Grid>
                        {selectedPayment.authorizationCode && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" gutterBottom>
                              <strong>Auth Code:</strong> {selectedPayment.authorizationCode}
                            </Typography>
                          </Grid>
                        )}
                        {selectedPayment.processedDate && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" gutterBottom>
                              <strong>Processed:</strong> {new Date(selectedPayment.processedDate).toLocaleString()}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Failure Information */}
                {selectedPayment.status === 'FAILED' && selectedPayment.failureReason && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'error.50' }}>
                      <Typography variant="h6" gutterBottom color="error">
                        Payment Failed
                      </Typography>
                      <Typography variant="body1" color="error">
                        <strong>Reason:</strong> {selectedPayment.failureReason}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Refund Information */}
                {selectedPayment.status === 'REFUNDED' && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                      <Typography variant="h6" gutterBottom>
                        Refund Information
                      </Typography>
                      {selectedPayment.refundReason && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Reason:</strong> {selectedPayment.refundReason}
                        </Typography>
                      )}
                      {selectedPayment.refundDate && (
                        <Typography variant="body2">
                          <strong>Refund Date:</strong> {new Date(selectedPayment.refundDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}

                {/* Description */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayment.description}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              {selectedPayment.status === 'COMPLETED' && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                >
                  Download Receipt
                </Button>
              )}
              {selectedPayment.status === 'FAILED' && (
                <Button
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={() => handleRetryPayment(selectedPayment)}
                >
                  Retry Payment
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CustomerPayments; 