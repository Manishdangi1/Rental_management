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
  SelectChangeEvent
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Schedule,
  LocationOn,
  Phone,
  Email,
  Visibility,
  DirectionsCar,
  Home,
  Business,
  AccessTime,
  CalendarToday,
  Search,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';

interface Delivery {
  id: string;
  rentalId: string;
  orderNumber: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'PICKED_UP' | 'RETURNED';
  type: 'DELIVERY' | 'PICKUP' | 'RETURN';
  scheduledDate: string;
  scheduledTime: string;
  actualDate?: string;
  actualTime?: string;
  driver: {
    name: string;
    phone: string;
    vehicle: string;
    licensePlate: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    type: 'HOME' | 'BUSINESS' | 'EVENT';
  };
  items: Array<{
    productName: string;
    quantity: number;
    image?: string;
  }>;
  specialInstructions?: string;
  estimatedDuration: string;
  trackingNumber: string;
}

const CustomerDeliveries: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/deliveries');
      setDeliveries(response.data || []);
    } catch (error: any) {
      console.error('Error loading deliveries:', error);
      setError(error.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'info';
      case 'IN_TRANSIT': return 'warning';
      case 'DELIVERED': return 'success';
      case 'PICKED_UP': return 'primary';
      case 'RETURNED': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Scheduled';
      case 'IN_TRANSIT': return 'In Transit';
      case 'DELIVERED': return 'Delivered';
      case 'PICKED_UP': return 'Picked Up';
      case 'RETURNED': return 'Returned';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY': return <LocalShipping />;
      case 'PICKUP': return <DirectionsCar />;
      case 'RETURN': return <Home />;
      default: return <LocalShipping />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DELIVERY': return 'primary';
      case 'PICKUP': return 'warning';
      case 'RETURN': return 'info';
      default: return 'default';
    }
  };

  const getFilteredDeliveries = () => {
    let filtered = deliveries || [];

    // Apply status filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(d => ['SCHEDULED', 'IN_TRANSIT'].includes(d.status));
    } else if (filter === 'completed') {
      filtered = filtered.filter(d => ['DELIVERED', 'PICKED_UP', 'RETURNED'].includes(d.status));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.address?.street.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailDialogOpen(true);
  };

  const handleContactDriver = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const upcomingCount = (deliveries || []).filter(d => ['SCHEDULED', 'IN_TRANSIT'].includes(d.status)).length;
  const completedCount = (deliveries || []).filter(d => ['DELIVERED', 'PICKED_UP', 'RETURNED'].includes(d.status)).length;

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
          My Deliveries
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your rental deliveries, pickups, and returns
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
          <Card sx={{ 
            bgcolor: 'primary.50',
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <LocalShipping />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {(deliveries || []).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Deliveries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'info.50',
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {upcomingCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'success.50',
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {completedCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'warning.50',
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {(deliveries || []).filter(d => d.type === 'PICKUP').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pickups
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
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
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
                <MenuItem value="all">All ({(deliveries || []).length})</MenuItem>
                <MenuItem value="upcoming">Upcoming ({upcomingCount})</MenuItem>
                <MenuItem value="completed">Completed ({completedCount})</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilter('all')}
              >
                Clear Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Deliveries List */}
      <Grid container spacing={3}>
        {getFilteredDeliveries().map((delivery) => (
          <Grid item xs={12} key={delivery.id}>
            <Card 
              sx={{ 
                borderLeft: 4, 
                borderColor: `${getStatusColor(delivery.status)}.main`,
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  {/* Status and Type */}
                  <Grid item xs={12} sm={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: `${getStatusColor(delivery.status)}.main`,
                          width: 56,
                          height: 56,
                          mb: 1
                        }}
                      >
                        {getTypeIcon(delivery.type)}
                      </Avatar>
                      <Chip
                        label={getStatusLabel(delivery.status)}
                        color={getStatusColor(delivery.status) as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Chip
                        label={delivery.type}
                        color={getTypeColor(delivery.type) as any}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Grid>

                  {/* Delivery Info */}
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" gutterBottom>
                      {delivery.type} - {delivery.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <CalendarToday sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {delivery.scheduledDate} at {delivery.scheduledTime}
                    </Typography>
                    {delivery.actualDate && (
                      <Typography variant="body2" color="success.main" gutterBottom>
                        <CheckCircle sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Actual: {delivery.actualDate} at {delivery.actualTime}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Est. Duration: {delivery.estimatedDuration}
                    </Typography>
                  </Grid>

                  {/* Items */}
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Items ({(delivery.items || []).length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(delivery.items || []).map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={item.image}
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography variant="body2">
                            {item.productName} x{item.quantity}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>

                  {/* Driver Info */}
                  <Grid item xs={12} sm={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Driver:
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {delivery.driver?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {delivery.driver?.vehicle || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {delivery.driver?.licensePlate || 'N/A'}
                    </Typography>
                  </Grid>

                  {/* Actions */}
                  <Grid item xs={12} sm={1}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(delivery)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Phone />}
                        onClick={() => delivery.driver?.phone && handleContactDriver(delivery.driver.phone)}
                        disabled={!delivery.driver?.phone}
                      >
                        Contact Driver
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Deliveries */}
      {getFilteredDeliveries().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {filter === 'all' ? '' : filter} deliveries found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'upcoming' 
              ? 'You have no upcoming deliveries scheduled.'
              : filter === 'completed'
              ? 'You have no completed deliveries yet.'
              : 'You have no deliveries yet.'
            }
          </Typography>
        </Box>
      )}

      {/* Delivery Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDelivery && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getTypeIcon(selectedDelivery.type)}
                <Typography variant="h6">
                  {selectedDelivery.type} Details - {selectedDelivery.orderNumber}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Status Timeline */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Delivery Status
                  </Typography>
                  <Stepper orientation={isMobile ? 'vertical' : 'horizontal'} activeStep={1}>
                    <Step>
                      <StepLabel>Order Confirmed</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Scheduled</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>In Transit</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Delivered</StepLabel>
                    </Step>
                  </Stepper>
                </Grid>

                {/* Driver Information */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Driver Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>{selectedDelivery.driver?.name?.charAt(0) || '?'}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={selectedDelivery.driver?.name || 'N/A'}
                          secondary="Driver"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Phone />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={selectedDelivery.driver?.phone || 'N/A'}
                          secondary="Phone"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <DirectionsCar />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={selectedDelivery.driver?.vehicle || 'N/A'}
                          secondary={`License: ${selectedDelivery.driver?.licensePlate || 'N/A'}`}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                {/* Delivery Details */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Delivery Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <LocationOn />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${selectedDelivery.address?.street || 'N/A'}`}
                          secondary={`${selectedDelivery.address?.city || 'N/A'}, ${selectedDelivery.address?.state || 'N/A'} ${selectedDelivery.address?.zipCode || 'N/A'}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <CalendarToday />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${selectedDelivery.scheduledDate} at ${selectedDelivery.scheduledTime}`}
                          secondary="Scheduled Time"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <AccessTime />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={selectedDelivery.estimatedDuration}
                          secondary="Estimated Duration"
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                {/* Items */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Items Being Delivered
                    </Typography>
                    <Grid container spacing={2}>
                      {(selectedDelivery.items || []).map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Avatar
                              src={item.image}
                              sx={{ width: 48, height: 48 }}
                            />
                            <Box>
                              <Typography variant="subtitle1">
                                {item.productName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Quantity: {item.quantity}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>

                {/* Special Instructions */}
                {selectedDelivery.specialInstructions && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                      <Typography variant="h6" gutterBottom>
                        Special Instructions
                      </Typography>
                      <Typography variant="body1">
                        {selectedDelivery.specialInstructions}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Tracking */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Tracking Information
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Tracking Number:</strong> {selectedDelivery.trackingNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use this number to track your delivery status and get real-time updates.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Phone />}
                onClick={() => handleContactDriver(selectedDelivery.driver.phone)}
              >
                Contact Driver
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CustomerDeliveries; 