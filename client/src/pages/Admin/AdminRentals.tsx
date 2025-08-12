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
    const customerName = rental.customer ? `${rental.customer.firstName || ''} ${rental.customer.lastName || ''}`.trim() : '';
    const matchesSearch = rental.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          onClick={() => navigate('/admin/rentals/new')}
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
                        {rental.orderNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(rental.createdAt)}
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
                        label={rental.status}
                        color={getStatusColor(rental.status) as any}
                        size="small"
                        icon={getStatusIcon(rental.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {calculateDuration(rental.startDate, rental.endDate)} days
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {rental.items.length} item(s)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rental.items?.map(item => item.product?.name || 'Unknown Product').join(', ') || 'No items'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(rental.totalAmount)}
                      </Typography>
                      {rental.securityDeposit > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          + {formatCurrency(rental.securityDeposit)} deposit
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => navigate(`/admin/rentals/${rental.id}`)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setRentalForStatusUpdate(rental);
                              setNewStatus(rental.status);
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