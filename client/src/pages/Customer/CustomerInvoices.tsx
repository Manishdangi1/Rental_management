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
  SelectChangeEvent
} from '@mui/material';
import {
  Receipt,
  Download,
  Visibility,
  Payment,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  AttachMoney,
  CalendarToday,
  AccessTime,
  Description,
  LocalOffer,
  AccountBalance,
  CreditCard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import StripePayment from '../../components/Payment/StripePayment';

interface Invoice {
  id: string;
  invoiceNumber: string;
  rentalId: string;
  orderNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
  }>;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  notes?: string;
  terms?: string;
}

const CustomerInvoices: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/invoices');
      setInvoices(response.data || []);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      setError(error.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'SENT': return 'info';
      case 'PAID': return 'success';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Description />;
      case 'SENT': return <Schedule />;
      case 'PAID': return <CheckCircle />;
      case 'OVERDUE': return <Warning />;
      case 'CANCELLED': return <Error />;
      default: return <Description />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'SENT': return 'Sent';
      case 'PAID': return 'Paid';
      case 'OVERDUE': return 'Overdue';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getFilteredInvoices = () => {
    let filtered = invoices || [];

    // Apply status filter
    if (filter === 'unpaid') {
      filtered = filtered.filter(inv => ['SENT', 'OVERDUE'].includes(inv.status));
    } else if (filter === 'paid') {
      filtered = filtered.filter(inv => inv.status === 'PAID');
    } else if (filter === 'overdue') {
      filtered = filtered.filter(inv => inv.status === 'OVERDUE');
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.items || []).some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // In a real app, this would download the PDF
    console.log('Downloading invoice:', invoice.invoiceNumber);
    alert(`Downloading invoice ${invoice.invoiceNumber}`);
  };

  const handleMakePayment = (invoice: Invoice) => {
    if (!invoice) {
      console.warn('No invoice provided for payment');
      return;
    }
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (payment: any) => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    // Reload invoices to reflect the updated status
    loadInvoices();
    // Show success message
    alert('Payment completed successfully!');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Error is already displayed in the payment component
  };

  const handlePaymentCancel = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
  };

  const calculateTotalUnpaid = () => {
    return (invoices || [])
      .filter(inv => ['SENT', 'OVERDUE'].includes(inv.status))
      .reduce((total, inv) => total + inv.total, 0);
  };

  const calculateTotalOverdue = () => {
    return (invoices || [])
      .filter(inv => inv.status === 'OVERDUE')
      .reduce((total, inv) => total + inv.total, 0);
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
          My Invoices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your rental invoices
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
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {(invoices || []).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Invoices
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
                    ${calculateTotalUnpaid().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Unpaid
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="error.main">
                    ${calculateTotalOverdue().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Overdue
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
                    {(invoices || []).filter(inv => inv.status === 'PAID').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid Invoices
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
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Receipt sx={{ mr: 1, color: 'text.secondary' }} />
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
                <MenuItem value="all">All Invoices ({(invoices || []).length})</MenuItem>
                <MenuItem value="unpaid">Unpaid ({(invoices || []).filter(inv => ['SENT', 'OVERDUE'].includes(inv.status)).length})</MenuItem>
                <MenuItem value="paid">Paid ({(invoices || []).filter(inv => inv.status === 'PAID').length})</MenuItem>
                <MenuItem value="overdue">Overdue ({(invoices || []).filter(inv => inv.status === 'OVERDUE').length})</MenuItem>
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
                onClick={() => handleMakePayment((invoices || [])[0])}
                disabled={(invoices || []).filter(inv => ['SENT', 'OVERDUE'].includes(inv.status)).length === 0}
              >
                Pay All Unpaid
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredInvoices().map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {invoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(invoice.items || []).length} items
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {invoice.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(invoice.status)}
                    label={getStatusLabel(invoice.status)}
                    color={getStatusColor(invoice.status) as any}
                    size="small"
                    variant={invoice.status === 'DRAFT' ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    ${invoice.total.toFixed(2)}
                  </Typography>
                  {invoice.discount > 0 && (
                    <Typography variant="caption" color="success.main">
                      -${invoice.discount.toFixed(2)} discount
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(invoice)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDownloadInvoice(invoice)}
                      title="Download"
                    >
                      <Download />
                    </IconButton>
                    {['SENT', 'OVERDUE'].includes(invoice.status) && (
                      <IconButton
                        color="success"
                        onClick={() => handleMakePayment(invoice)}
                        title="Make Payment"
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

      {/* No Invoices */}
      {getFilteredInvoices().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {filter === 'all' ? '' : filter} invoices found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'unpaid' 
              ? 'You have no unpaid invoices.'
              : filter === 'paid'
              ? 'You have no paid invoices yet.'
              : filter === 'overdue'
              ? 'You have no overdue invoices.'
              : 'You have no invoices yet.'
            }
          </Typography>
        </Box>
      )}

      {/* Invoice Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedInvoice && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Receipt color="primary" />
                <Typography variant="h6">
                  Invoice {selectedInvoice.invoiceNumber}
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedInvoice.status)}
                  label={getStatusLabel(selectedInvoice.status)}
                  color={getStatusColor(selectedInvoice.status) as any}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Invoice Header */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Invoice Details
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Order Number:</strong> {selectedInvoice.orderNumber}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Issue Date:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Payment Summary
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Subtotal:</Typography>
                          <Typography>${selectedInvoice.subtotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Tax:</Typography>
                          <Typography>${selectedInvoice.tax.toFixed(2)}</Typography>
                        </Box>
                        {selectedInvoice.discount > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Discount:</Typography>
                            <Typography color="success.main">-${selectedInvoice.discount.toFixed(2)}</Typography>
                          </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Total:</Typography>
                          <Typography variant="h6" color="primary">
                            ${selectedInvoice.total.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Items Table */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Items
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedInvoice.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {item.productName}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {item.description}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {item.quantity}
                              </TableCell>
                              <TableCell align="right">
                                ${item.unitPrice.toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2">
                                  ${item.totalPrice.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                {/* Payment Information */}
                {selectedInvoice.paymentMethod && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Payment Information
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Method:</strong> {selectedInvoice.paymentMethod}
                      </Typography>
                      {selectedInvoice.paidDate && (
                        <Typography variant="body2" color="success.main">
                          <strong>Paid Date:</strong> {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}

                {/* Terms and Notes */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Terms & Notes
                    </Typography>
                    {selectedInvoice.terms && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Terms:</strong> {selectedInvoice.terms}
                      </Typography>
                    )}
                    {selectedInvoice.notes && (
                      <Typography variant="body2">
                        <strong>Notes:</strong> {selectedInvoice.notes}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleDownloadInvoice(selectedInvoice)}
              >
                Download
              </Button>
              {['SENT', 'OVERDUE'].includes(selectedInvoice.status) && (
                <Button
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={() => handleMakePayment(selectedInvoice)}
                >
                  Make Payment
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Payment color="primary" />
            <Typography variant="h6">
              Payment for Invoice {selectedInvoice?.invoiceNumber}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <StripePayment
              invoiceId={selectedInvoice.id}
              amount={selectedInvoice.total}
              currency={selectedInvoice.currency}
              description={`Payment for invoice ${selectedInvoice.invoiceNumber}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CustomerInvoices; 