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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Refresh,
  LocalShipping,
  CheckCircle,
  Schedule,
  Warning,
  Block,
  CalendarToday,
  Person,
  LocationOn,
  Phone,
  Email,
  Notes,
  Assignment,
  DirectionsCar,
  Inventory
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Delivery {
  id: string;
  rentalId: string;
  type: 'PICKUP' | 'RETURN';
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  completedAt?: string;
  address: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  rental: {
    orderNumber: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    items: Array<{
      productName: string;
      quantity: number;
    }>;
  };
}

const AdminDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [createDeliveryDialog, setCreateDeliveryDialog] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [createDeliveryForm, setCreateDeliveryForm] = useState({
    rentalId: '',
    type: 'PICKUP' as 'PICKUP' | 'RETURN',
    scheduledAt: '',
    address: '',
    contactName: '',
    contactPhone: '',
    notes: ''
  });

  // Fetch deliveries data
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('/api/admin/deliveries', { headers });
      
      if (response.ok) {
        const data = await response.json();
        if (data.deliveries && Array.isArray(data.deliveries)) {
          setDeliveries(data.deliveries);
        } else {
          console.error('Invalid deliveries data format:', data);
          setDeliveries([]);
          setError('Invalid data format received from server.');
        }
      } else {
        console.error('Failed to fetch deliveries:', response.status, response.statusText);
        setError('Failed to fetch deliveries. Please try again.');
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setError('Failed to load deliveries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch rentals for delivery creation
  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching rentals for delivery creation...');
      const response = await fetch('/api/admin/rentals', { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Rentals fetched:', data);
        if (data.rentals && Array.isArray(data.rentals)) {
          setRentals(data.rentals);
        } else {
          console.error('Invalid rentals data format:', data);
          setRentals([]);
        }
      } else {
        console.error('Failed to fetch rentals:', response.status, response.statusText);
        setRentals([]);
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setRentals([]);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchRentals();
  }, []);

  // Filter deliveries based on search and filters
  const filteredDeliveries = deliveries.filter(delivery => {
    const customerName = delivery.rental?.customer ? 
      `${delivery.rental.customer.firstName || ''} ${delivery.rental.customer.lastName || ''}`.trim() : '';
    
    const orderNumber = delivery.rental?.orderNumber || '';
    const address = delivery.address || '';
    
    const matchesSearch = 
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesType = typeFilter === 'all' || delivery.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const paginatedDeliveries = filteredDeliveries.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );



  // Handle create delivery
  const handleCreateDelivery = async () => {
    try {
      console.log('Form validation - rentalId:', createDeliveryForm.rentalId);
      console.log('Form validation - scheduledAt:', createDeliveryForm.scheduledAt);
      console.log('Form validation - address:', createDeliveryForm.address);
      
      // Validate form
      if (!createDeliveryForm.rentalId) {
        setError('Please select a rental order');
        return;
      }
      
      if (!createDeliveryForm.scheduledAt) {
        setError('Please select a scheduled date and time');
        return;
      }
      
      if (!createDeliveryForm.address || createDeliveryForm.address.trim() === '') {
        setError('Please enter a delivery address');
        return;
      }
      
      // Validate datetime format
      const scheduledDate = new Date(createDeliveryForm.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        setError('Please select a valid date and time');
        return;
      }
      
      // Check if the date is in the future
      if (scheduledDate <= new Date()) {
        setError('Scheduled date must be in the future');
        return;
      }

      setCreateLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setCreateLoading(false);
        return;
      }

      console.log('Submitting delivery form:', createDeliveryForm);
      console.log('Formatted scheduled date:', scheduledDate.toISOString());
      
      // Prepare the data to send
      const deliveryData = {
        ...createDeliveryForm,
        scheduledAt: scheduledDate.toISOString()
      };
      
      console.log('Sending delivery data:', deliveryData);
      
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deliveryData)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Delivery created successfully:', responseData);
        
        // Reset form and close dialog
        setCreateDeliveryForm({
          rentalId: '',
          type: 'PICKUP',
          scheduledAt: '',
          address: '',
          contactName: '',
          contactPhone: '',
          notes: ''
        });
        setCreateDeliveryDialog(false);
        
        // Refresh deliveries list
        fetchDeliveries();
        
        // Show success message
        setError(null);
        setSuccessMessage('Delivery scheduled successfully!');
        setTimeout(() => setSuccessMessage(null), 3000); // Auto-hide after 3 seconds
        console.log('Delivery scheduled successfully');
      } else {
        let errorMessage = `Failed to create delivery. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map((err: any) => err.msg).join(', ');
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        setError(errorMessage);
      }
        } catch (error) {
        console.error('Error creating delivery:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setError('Network error. Please check if the server is running and try again.');
        } else {
          setError('Failed to create delivery. Please try again.');
        }
      } finally {
        setCreateLoading(false);
      }
    };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedDeliveries.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/deliveries/bulk', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deliveryIds: selectedDeliveries,
          action
        })
      });

      if (response.ok) {
        fetchDeliveries(); // Refresh data
        setSelectedDeliveries([]);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Handle selection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedDeliveries(paginatedDeliveries.map(d => d.id));
    } else {
      setSelectedDeliveries([]);
    }
  };

  const handleSelectDelivery = (deliveryId: string) => {
    setSelectedDeliveries(prev => 
      prev.includes(deliveryId) 
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'warning';
      case 'IN_TRANSIT': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'PICKUP' ? 'primary' : 'secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && deliveries.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Safety check for deliveries data
  if (!Array.isArray(deliveries)) {
    console.error('Deliveries is not an array:', deliveries);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading deliveries data. Please refresh the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Delivery Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setCreateDeliveryDialog(true);
            setError(null);
            setSuccessMessage(null);
            // Reset form to initial state
            setCreateDeliveryForm({
              rentalId: '',
              type: 'PICKUP',
              scheduledAt: '',
              address: '',
              contactName: '',
              contactPhone: '',
              notes: ''
            });
          }}
        >
          Schedule New Delivery
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Display */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search deliveries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                  <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="PICKUP">Pickup</MenuItem>
                  <MenuItem value="RETURN">Return</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchDeliveries}
                disabled={loading}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedDeliveries.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
            <Typography variant="subtitle1" component="div" sx={{ flex: '1 1 100%' }}>
              {selectedDeliveries.length} delivery(ies) selected
            </Typography>
            <Button
              color="primary"
              onClick={() => handleBulkAction('mark_in_transit')}
              startIcon={<LocalShipping />}
            >
              Mark In Transit
            </Button>
            <Button
              color="success"
              onClick={() => handleBulkAction('mark_completed')}
              startIcon={<CheckCircle />}
            >
              Mark Completed
            </Button>
          </Toolbar>
        </Card>
      )}

      {/* Deliveries Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedDeliveries.length > 0 && selectedDeliveries.length < paginatedDeliveries.length}
                      checked={paginatedDeliveries.length > 0 && selectedDeliveries.length === paginatedDeliveries.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDeliveries.length > 0 ? (
                  paginatedDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDeliveries.includes(delivery.id)}
                        onChange={() => handleSelectDelivery(delivery.id)}
                      />
                    </TableCell>
                    <TableCell>{delivery.rental?.orderNumber || 'No Order Number'}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {delivery.rental?.customer ? 
                            `${delivery.rental.customer.firstName || 'Unknown'} ${delivery.rental.customer.lastName || 'Customer'}` : 
                            'Unknown Customer'
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {delivery.rental?.customer?.email || 'No email'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={delivery.type}
                        color={getTypeColor(delivery.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={delivery.status}
                        color={getStatusColor(delivery.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{delivery.address}</Typography>
                        {delivery.contactName && (
                          <Typography variant="caption" color="text.secondary">
                            Contact: {delivery.contactName}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(delivery.scheduledAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No deliveries found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredDeliveries.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredDeliveries.length / rowsPerPage)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create New Delivery Dialog */}
      <Dialog open={createDeliveryDialog} onClose={() => setCreateDeliveryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Schedule New Delivery
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Rental Order</InputLabel>
                <Select
                  value={createDeliveryForm.rentalId}
                  onChange={(e) => setCreateDeliveryForm(prev => ({ ...prev, rentalId: e.target.value }))}
                  label="Rental Order"
                  required
                >
                  <MenuItem value="">Select a rental order</MenuItem>
                  {Array.isArray(rentals) && rentals.length > 0 ? (
                    rentals.map((rental) => (
                      <MenuItem key={rental.id} value={rental.id}>
                        {rental.orderNumber || 'No Order Number'} - {rental.customer?.firstName || 'Unknown'} {rental.customer?.lastName || 'Customer'}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No rental orders available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Delivery Type</InputLabel>
                <Select
                  value={createDeliveryForm.type}
                  onChange={(e) => setCreateDeliveryForm(prev => ({ ...prev, type: e.target.value as 'PICKUP' | 'RETURN' }))}
                  label="Delivery Type"
                  required
                >
                  <MenuItem value="PICKUP">Pickup</MenuItem>
                  <MenuItem value="RETURN">Return</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Date & Time"
                type="datetime-local"
                value={createDeliveryForm.scheduledAt}
                onChange={(e) => setCreateDeliveryForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                required
                InputLabelProps={{ shrink: true }}
                helperText="Select date and time for delivery"
                error={!createDeliveryForm.scheduledAt}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={createDeliveryForm.address}
                onChange={(e) => setCreateDeliveryForm(prev => ({ ...prev, address: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={createDeliveryForm.contactName}
                onChange={(e) => setCreateDeliveryForm(prev => ({ ...prev, contactName: e.target.value }))}
                placeholder="Person to contact at location"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Contact Phone"
                value={createDeliveryForm.contactPhone}
                onChange={(e) => setCreateDeliveryForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="Contact phone number"
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={createDeliveryForm.notes}
                onChange={(e) => setCreateDeliveryForm(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
                placeholder="Additional delivery instructions or notes"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDeliveryDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateDelivery}
            disabled={!createDeliveryForm.rentalId || !createDeliveryForm.scheduledAt || !createDeliveryForm.address.trim() || createLoading}
            startIcon={createLoading ? <CircularProgress size={20} /> : null}
          >
            {createLoading ? 'Scheduling...' : 'Schedule Delivery'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delivery Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Delivery Details - {selectedDelivery?.rental?.orderNumber || 'Unknown Order'}
        </DialogTitle>
        <DialogContent>
          {selectedDelivery && selectedDelivery.rental ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Delivery Information</Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <LocalShipping />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Type"
                      secondary={selectedDelivery.type}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Schedule />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Status"
                      secondary={selectedDelivery.status}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <CalendarToday />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Scheduled"
                      secondary={formatDateTime(selectedDelivery.scheduledAt)}
                    />
                  </ListItem>
                  {selectedDelivery.completedAt && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <CheckCircle />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Completed"
                        secondary={formatDateTime(selectedDelivery.completedAt)}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Location & Contact</Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <LocationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Address"
                      secondary={selectedDelivery.address}
                    />
                  </ListItem>
                  {selectedDelivery.contactName && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Contact"
                        secondary={selectedDelivery.contactName}
                      />
                    </ListItem>
                  )}
                  {selectedDelivery.contactPhone && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Phone />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedDelivery.contactPhone}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Rental Items</Typography>
                <List>
                  {selectedDelivery.rental?.items && selectedDelivery.rental.items.length > 0 ? (
                    selectedDelivery.rental.items.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar>
                            <Inventory />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.productName || 'Unknown Product'}
                          secondary={`Quantity: ${item.quantity || 1}`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No items found"
                        secondary="No rental items available for this delivery"
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              {selectedDelivery.notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDelivery.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No rental information available for this delivery.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDeliveries;
