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
  const [error, setError] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

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
        setDeliveries(data.deliveries || []);
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

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Filter deliveries based on search and filters
  const filteredDeliveries = deliveries.filter(delivery => {
    const customerName = delivery.rental?.customer ? 
      `${delivery.rental.customer.firstName || ''} ${delivery.rental.customer.lastName || ''}`.trim() : '';
    
    const matchesSearch = 
      delivery.rental?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesType = typeFilter === 'all' || delivery.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const paginatedDeliveries = filteredDeliveries.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Handle status update
  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/admin/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setDeliveries(prev => prev.map(d => 
          d.id === deliveryId ? { ...d, status: newStatus as any } : d
        ));
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedDeliveries.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/admin/deliveries/bulk', {
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Delivery Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/rentals')}
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
                {paginatedDeliveries.map((delivery) => (
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
                        <Tooltip title="Update Status">
                          <IconButton
                            size="small"
                            onClick={() => handleStatusUpdate(delivery.id, 'IN_TRANSIT')}
                            disabled={delivery.status === 'COMPLETED'}
                          >
                            <LocalShipping />
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredDeliveries.length / rowsPerPage)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

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
          {selectedDelivery && (
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
                  {selectedDelivery.rental.items.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          <Inventory />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.productName}
                        secondary={`Quantity: ${item.quantity}`}
                      />
                    </ListItem>
                  ))}
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
