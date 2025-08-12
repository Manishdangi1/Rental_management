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
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
import EnhancedPayment from '../../components/Payment/EnhancedPayment';

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
      console.log('Invoices API response:', response.data);
      
      // Validate and transform the data
      const invoicesData = response.data || [];
      const validatedInvoices = invoicesData.map((invoice: any) => ({
        id: invoice.id || '',
        invoiceNumber: invoice.invoiceNumber || `INV-${invoice.id || 'N/A'}`,
        rentalId: invoice.rentalId || '',
        orderNumber: invoice.orderNumber || `ORD-${invoice.rentalId || 'N/A'}`,
        status: invoice.status || 'DRAFT',
        issueDate: invoice.issueDate || new Date().toISOString(),
        dueDate: invoice.dueDate || new Date().toISOString(),
        paidDate: invoice.paidDate || undefined,
        subtotal: parseFloat(invoice.subtotal) || parseFloat(invoice.amount) || 0,
        tax: parseFloat(invoice.tax) || 0,
        discount: parseFloat(invoice.discount) || 0,
        total: parseFloat(invoice.total) || parseFloat(invoice.amount) || 0,
        currency: invoice.currency || 'USD',
        paymentMethod: invoice.paymentMethod || undefined,
        items: invoice.items || [],
        customer: invoice.customer || {
          name: 'N/A',
          email: 'N/A',
          address: 'N/A'
        },
        notes: invoice.notes || undefined,
        terms: invoice.terms || undefined
      }));
      
      setInvoices(validatedInvoices);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      setError(error.response?.data?.message || 'Failed to load invoices');
      setInvoices([]);
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
    // Generate invoice content for download
    const invoiceContent = generateInvoiceContent(invoice);
    
    // Create and download the file
    const blob = new Blob([invoiceContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoice_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateInvoiceContent = (invoice: Invoice) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 30px; }
        .customer-details { margin-bottom: 30px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .total-section { text-align: right; font-size: 18px; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; }
        .status-DRAFT { background-color: #6c757d; }
        .status-SENT { background-color: #007bff; }
        .status-PAID { background-color: #28a745; }
        .status-OVERDUE { background-color: #dc3545; }
        .status-CANCELLED { background-color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <h2>${invoice.invoiceNumber}</h2>
    </div>
    
    <div class="invoice-details">
        <h3>Invoice Details</h3>
        <p><strong>Order Number:</strong> ${invoice.orderNumber}</p>
        <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span class="status status-${invoice.status}">${invoice.status}</span></p>
    </div>
    
    <div class="customer-details">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${invoice.customer.name}</p>
        <p><strong>Email:</strong> ${invoice.customer.email}</p>
        <p><strong>Address:</strong> ${invoice.customer.address}</p>
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map(item => `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>$${item.totalPrice.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="total-section">
        <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
        <p><strong>Tax:</strong> $${invoice.tax.toFixed(2)}</p>
        ${invoice.discount > 0 ? `<p><strong>Discount:</strong> -$${invoice.discount.toFixed(2)}</p>` : ''}
        <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
    </div>
    
    ${invoice.notes ? `<div style="margin-top: 30px;"><h3>Notes</h3><p>${invoice.notes}</p></div>` : ''}
    ${invoice.terms ? `<div style="margin-top: 30px;"><h3>Terms</h3><p>${invoice.terms}</p></div>` : ''}
</body>
</html>`;
  };

  const handleExportAll = () => {
    if (!invoices || invoices.length === 0) {
      alert('No invoices to export');
      return;
    }
    
    // Create CSV content
    const csvContent = generateCSVContent(invoices);
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = (invoiceList: Invoice[]) => {
    const headers = [
      'Invoice Number',
      'Order Number',
      'Status',
      'Issue Date',
      'Due Date',
      'Subtotal',
      'Tax',
      'Discount',
      'Total',
      'Payment Status'
    ];
    
    const csvRows = [headers.join(',')];
    
    invoiceList.forEach(invoice => {
      const row = [
        invoice.invoiceNumber,
        invoice.orderNumber,
        invoice.status,
        new Date(invoice.issueDate).toLocaleDateString(),
        new Date(invoice.dueDate).toLocaleDateString(),
        invoice.subtotal.toFixed(2),
        invoice.tax.toFixed(2),
        invoice.discount.toFixed(2),
        invoice.total.toFixed(2),
        invoice.paymentMethod || 'Not specified'
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
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

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={64} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading invoices...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* No Invoices */}
      {!loading && !error && invoices.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No invoices found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any invoices yet. Invoices will appear here once you create rentals.
          </Typography>
        </Box>
      )}

      {/* Invoices Table */}
      {!loading && !error && invoices.length > 0 && (
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
                      ${(invoice.total || 0).toFixed(2)}
                    </Typography>
                    {(invoice.discount || 0) > 0 && (
                      <Typography variant="caption" color="success.main">
                        -${(invoice.discount || 0).toFixed(2)} discount
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
                onClick={handleExportAll}
                disabled={!invoices || invoices.length === 0}
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
                          <strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber || 'N/A'}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Order Number:</strong> {selectedInvoice.orderNumber || 'N/A'}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Issue Date:</strong> {selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Payment Summary
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Subtotal:</Typography>
                          <Typography>${(selectedInvoice.subtotal || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Tax:</Typography>
                          <Typography>${(selectedInvoice.tax || 0).toFixed(2)}</Typography>
                        </Box>
                        {(selectedInvoice.discount || 0) > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Discount:</Typography>
                            <Typography color="success.main">-${(selectedInvoice.discount || 0).toFixed(2)}</Typography>
                          </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Total:</Typography>
                          <Typography variant="h6" color="primary">
                            ${(selectedInvoice.total || 0).toFixed(2)}
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
                          {selectedInvoice.items?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {item.productName || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {item.description || 'No description'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {item.quantity || 0}
                              </TableCell>
                              <TableCell align="right">
                                ${(item.unitPrice || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2">
                                  ${(item.totalPrice || 0).toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  No items found
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
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
                        <strong>Method:</strong> {selectedInvoice.paymentMethod || 'N/A'}
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
                {(selectedInvoice.terms || selectedInvoice.notes) && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      {selectedInvoice.terms && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <strong>Terms:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedInvoice.terms}
                          </Typography>
                        </Box>
                      )}
                      {selectedInvoice.notes && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            <strong>Notes:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedInvoice.notes}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )}
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
        maxWidth="lg"
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
            <EnhancedPayment
              invoiceId={selectedInvoice.id || ''}
              amount={selectedInvoice.total || 0}
              currency={selectedInvoice.currency || 'USD'}
              description={`Payment for invoice ${selectedInvoice.invoiceNumber || 'N/A'}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setPaymentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CustomerInvoices; 