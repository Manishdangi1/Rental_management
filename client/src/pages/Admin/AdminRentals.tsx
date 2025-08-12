import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  InputAdornment,
  Pagination,
  Checkbox,
  Toolbar,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Refresh,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Schedule,
  Warning,
  Block,
  AttachMoney,
  CalendarToday,
  Person,
  Inventory,
  Receipt,
  Payment,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RentalOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: string;
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  pickupDate?: string;
  returnDate?: string;
  pickupAddress: string;
  returnAddress: string;
  notes?: string;
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      sku: string;
      basePrice: number;
    };
    productName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const AdminRentals: React.FC = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<RentalOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRentals, setSelectedRentals] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Dialog states
  const [rentalDialog, setRentalDialog] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalOrder | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<RentalOrder | null>(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [rentalForStatusUpdate, setRentalForStatusUpdate] = useState<RentalOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [selectedRentalForView, setSelectedRentalForView] = useState<RentalOrder | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    startDate: '',
    endDate: '',
    pickupAddress: '',
    returnAddress: '',
    notes: '',
    items: [] as Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>
  });

  // Fetch rentals
  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/rentals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRentals(data.rentals || []);
      } else {
        setError('Failed to fetch rentals');
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setError('Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/users?role=CUSTOMER', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchRentals();
    fetchCustomers();
  }, []);

  // Filter rentals
  const filteredRentals = rentals.filter(rental => {
    if (!rental) return false;
    
    const customerName = rental.customer ? `${rental.customer.firstName || ''} ${rental.customer.lastName || ''}`.trim() : '';
    const orderNumber = rental.orderNumber || '';
    
    const matchesSearch = orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    const matchesCustomer = customerFilter === 'all' || (rental.customer && rental.customer.id === customerFilter);

    return matchesSearch && matchesStatus && matchesCustomer;
  });

  // Pagination
  const paginatedRentals = filteredRentals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'QUOTATION':
        return 'default';
      case 'CONFIRMED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'PICKED_UP':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'QUOTATION':
        return <Assignment />;
      case 'CONFIRMED':
        return <CheckCircle />;
      case 'IN_PROGRESS':
        return <Schedule />;
      case 'PICKED_UP':
        return <LocalShipping />;
      case 'COMPLETED':
        return <CheckCircle />;
      case 'CANCELLED':
        return <Block />;
      case 'OVERDUE':
        return <Warning />;
      default:
        return <Assignment />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate rental duration
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!rentalForStatusUpdate || !newStatus) return;

    try {
      const response = await fetch(`/api/rentals/${rentalForStatusUpdate.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStatusUpdateDialog(false);
        setRentalForStatusUpdate(null);
        setNewStatus('');
        fetchRentals();
      } else {
        setError('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'confirm' | 'cancel' | 'markPickedUp' | 'markReturned') => {
    if (selectedRentals.length === 0) return;

    try {
      const updatePromises = selectedRentals.map(id => {
        let newStatus = '';
        switch (action) {
          case 'confirm':
            newStatus = 'CONFIRMED';
            break;
          case 'cancel':
            newStatus = 'CANCELLED';
            break;
          case 'markPickedUp':
            newStatus = 'PICKED_UP';
            break;
          case 'markReturned':
            newStatus = 'COMPLETED';
            break;
        }

        return fetch(`/api/rentals/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: newStatus })
        });
      });
      
      await Promise.all(updatePromises);
      setSelectedRentals([]);
      fetchRentals();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action');
    }
  };

  // Select all rentals
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRentals(paginatedRentals.map(r => r.id));
    } else {
      setSelectedRentals([]);
    }
  };

  // Select individual rental
  const handleSelectRental = (rentalId: string, checked: boolean) => {
    if (checked) {
      setSelectedRentals(prev => [...prev, rentalId]);
    } else {
      setSelectedRentals(prev => prev.filter(id => id !== rentalId));
    }
  };

  // Handle create rental
  const handleCreateRental = async () => {
    if (!formData.customerId || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields: Customer, Start Date, and End Date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newRental = await response.json();
        setRentals([newRental, ...rentals]);
        setRentalDialog(false);
        setFormData({
          customerId: '',
          startDate: '',
          endDate: '',
          pickupAddress: '',
          returnAddress: '',
          notes: '',
          items: []
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create rental');
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      setError('Failed to create rental');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Rental Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage rental orders, track status, and handle customer requests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setRentalDialog(true)}
        >
          New Rental Order
        </Button>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search rentals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="QUOTATION">Quotation</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="PICKED_UP">Picked Up</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  label="Customer"
                >
                  <MenuItem value="all">All Customers</MenuItem>
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                                              {customer?.firstName || 'Unknown'} {customer?.lastName || 'Customer'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchRentals}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedRentals.length > 0 && (
        <Paper sx={{ mb: 2, p: 2, bgcolor: alpha('#1976d2', 0.1) }}>
          <Toolbar>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {selectedRentals.length} rental(s) selected
            </Typography>
            <Button
              size="small"
              onClick={() => handleBulkAction('confirm')}
              sx={{ mr: 1 }}
            >
              Confirm
            </Button>
            <Button
              size="small"
              onClick={() => handleBulkAction('markPickedUp')}
              sx={{ mr: 1 }}
            >
              Mark Picked Up
            </Button>
            <Button
              size="small"
              onClick={() => handleBulkAction('markReturned')}
              sx={{ mr: 1 }}
            >
              Mark Returned
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => handleBulkAction('cancel')}
            >
              Cancel
            </Button>
          </Toolbar>
        </Paper>
      )}

      {/* Rentals Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRentals.length === paginatedRentals.length}
                      indeterminate={selectedRentals.length > 0 && selectedRentals.length < paginatedRentals.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRentals.map((rental) => (
                  <TableRow key={rental.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRentals.includes(rental.id)}
                        onChange={(e) => handleSelectRental(rental.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {rental.orderNumber || 'No Order Number'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rental.createdAt ? formatDate(rental.createdAt) : 'Unknown Date'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {rental.customer?.firstName || 'Unknown'} {rental.customer?.lastName || 'Customer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rental.customer?.email || 'No email'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rental.status || 'UNKNOWN'}
                        color={getStatusColor(rental.status || 'UNKNOWN') as any}
                        size="small"
                        icon={getStatusIcon(rental.status || 'UNKNOWN')}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {rental.startDate ? formatDate(rental.startDate) : 'TBD'} - {rental.endDate ? formatDate(rental.endDate) : 'TBD'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rental.startDate && rental.endDate ? calculateDuration(rental.startDate, rental.endDate) : 'TBD'} days
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {rental.items?.length || 0} item(s)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rental.items?.map(item => item.product?.name || 'Unknown Product').join(', ') || 'No items'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(rental.totalAmount || 0)}
                      </Typography>
                      {(rental.securityDeposit || 0) > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          + {formatCurrency(rental.securityDeposit || 0)} deposit
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => {
                            setSelectedRentalForView(rental);
                            setViewDetailsDialog(true);
                          }}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setRentalForStatusUpdate(rental);
                              setNewStatus(rental.status || 'QUOTATION');
                              setStatusUpdateDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Rental">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setRentalToDelete(rental);
                              setDeleteDialog(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredRentals.length / rowsPerPage)}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create/Edit Rental Dialog */}
      <Dialog open={rentalDialog} onClose={() => setRentalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRental ? 'Edit Rental Order' : 'Create New Rental Order'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    label="Customer"
                  >
                    {customers.map(customer => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} ({customer.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pickup Address"
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Return Address"
                  value={formData.returnAddress}
                  onChange={(e) => setFormData({ ...formData, returnAddress: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
            
            {/* Items Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rental Items
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add products to this rental order
              </Typography>
              {/* For now, show a simple message - this would need more complex implementation */}
              <Alert severity="info">
                Product selection and pricing will be implemented in the next iteration.
                This creates a basic rental order structure.
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRentalDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateRental} 
            variant="contained"
            disabled={!formData.customerId || !formData.startDate || !formData.endDate}
          >
            {editingRental ? 'Update Rental' : 'Create Rental'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialog} onClose={() => setViewDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Rental Order Details
          {selectedRentalForView?.orderNumber && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Order: {selectedRentalForView.orderNumber}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedRentalForView && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedRentalForView.customer?.firstName || 'Unknown'} {selectedRentalForView.customer?.lastName || 'Customer'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedRentalForView.customer?.email || 'No email'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedRentalForView.customer?.phone || 'No phone'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Rental Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Rental Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedRentalForView.status || 'Unknown'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Start Date:</strong> {selectedRentalForView.startDate ? formatDate(selectedRentalForView.startDate) : 'TBD'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>End Date:</strong> {selectedRentalForView.endDate ? formatDate(selectedRentalForView.endDate) : 'TBD'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {selectedRentalForView.startDate && selectedRentalForView.endDate ? calculateDuration(selectedRentalForView.startDate, selectedRentalForView.endDate) : 'TBD'} days
                    </Typography>
                  </Box>
                </Grid>

                {/* Address Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Address Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Pickup Address:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 2 }}>
                        {selectedRentalForView.pickupAddress || 'To be determined'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Return Address:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 2 }}>
                        {selectedRentalForView.returnAddress || 'To be determined'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Financial Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Financial Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Subtotal:</strong> {formatCurrency(selectedRentalForView.subtotal || 0)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tax:</strong> {formatCurrency(selectedRentalForView.tax || 0)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Amount:</strong> {formatCurrency(selectedRentalForView.totalAmount || 0)}
                    </Typography>
                    {(selectedRentalForView.securityDeposit || 0) > 0 && (
                      <Typography variant="body2">
                        <strong>Security Deposit:</strong> {formatCurrency(selectedRentalForView.securityDeposit || 0)}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Items Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Rental Items
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {selectedRentalForView.items && selectedRentalForView.items.length > 0 ? (
                      selectedRentalForView.items.map((item, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Product:</strong> {item.product?.name || item.productName || 'Unknown Product'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Quantity:</strong> {item.quantity || 0}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Unit Price:</strong> {formatCurrency(item.unitPrice || 0)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total Price:</strong> {formatCurrency(item.totalPrice || 0)}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No items added yet
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Notes */}
                {selectedRentalForView.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>
                      {selectedRentalForView.notes}
                    </Typography>
                  </Grid>
                )}

                {/* Timestamps */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Timestamps
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Created:</strong> {selectedRentalForView.createdAt ? formatDate(selectedRentalForView.createdAt) : 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Last Updated:</strong> {selectedRentalForView.updatedAt ? formatDate(selectedRentalForView.updatedAt) : 'Unknown'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onClose={() => setStatusUpdateDialog(false)}>
        <DialogTitle>Update Rental Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="QUOTATION">Quotation</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="PICKED_UP">Picked Up</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete rental "{rentalToDelete?.orderNumber}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            // Handle delete logic here
            setDeleteDialog(false);
            setRentalToDelete(null);
          }} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AdminRentals; 