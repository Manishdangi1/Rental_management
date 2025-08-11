import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar
} from '@mui/material';
import { 
  DatePicker 
} from '@mui/x-date-pickers/DatePicker';
import { 
  LocalOffer, 
  CalendarToday, 
  AccessTime, 
  ShoppingCart,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import { format, differenceInDays, addDays } from 'date-fns';

interface RentalProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  pricelistItems: Array<{
    rentalType: string;
    price: number;
    currency: string;
    discount: number;
  }>;
  specifications: any;
  totalQuantity: number;
  availableQuantity: number;
  minimumRentalDays: number;
  maximumRentalDays: number;
}

interface RentalOrderItem {
  id: string;
  productId: string;
  productName: string;
  startDate: Date | null;
  endDate: Date | null;
  quantity: number;
  rentalType: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface RentalOrder {
  id?: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  items: RentalOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RentalOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<RentalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRentalProducts();
    fetchRentalOrders();
  }, []);

  useEffect(() => {
    if (currentOrder) {
      calculateOrderTotal();
    }
  }, [currentOrder?.items]);

  const fetchRentalProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.get('/products?limit=50&rentable=true');
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch rental products:', error);
      setError('Failed to load rental products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalOrders = async () => {
    try {
      const response = await api.get('/rentals?limit=100');
      if (response.data && response.data.rentals) {
        // Transform backend data to match frontend interface
        const transformedOrders: RentalOrder[] = response.data.rentals.map((rental: any) => ({
          id: rental.id,
          orderNumber: rental.orderNumber || `RO-${rental.id.slice(-6)}`,
          customerId: rental.customerId,
          customerName: rental.customerName || `${rental.customer?.firstName || ''} ${rental.customer?.lastName || ''}`.trim(),
          status: rental.status,
          items: rental.items?.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName || item.product?.name || 'Unknown Product',
            startDate: item.startDate ? new Date(item.startDate) : null,
            endDate: item.endDate ? new Date(item.endDate) : null,
            quantity: item.quantity,
            rentalType: item.rentalType || 'DAILY',
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes
          })) || [],
          subtotal: rental.subtotal || 0,
          tax: rental.tax || 0,
          total: rental.totalAmount || 0,
          notes: rental.notes,
          createdAt: rental.createdAt ? new Date(rental.createdAt) : undefined,
          updatedAt: rental.updatedAt ? new Date(rental.updatedAt) : undefined
        }));
        setRentalOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch rental orders:', error);
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RO-${timestamp}-${random}`;
  };

  const createNewOrder = () => {
    const newOrder: RentalOrder = {
      orderNumber: generateOrderNumber(),
      customerId: user?.id || '',
      customerName: `${user?.firstName} ${user?.lastName}`,
      status: 'DRAFT',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: ''
    };
    setCurrentOrder(newOrder);
    setEditMode(true);
  };

  const calculateOrderTotal = () => {
    if (!currentOrder) return;
    
    const subtotal = currentOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    setCurrentOrder({
      ...currentOrder,
      subtotal,
      tax,
      total
    });
  };

  const addProductToOrder = (product: RentalProduct) => {
    if (!currentOrder) return;
    
    const defaultPricing = product.pricelistItems[0] || { price: 100, rentalType: 'DAILY' };
    const newItem: RentalOrderItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      startDate: null,
      endDate: null,
      quantity: 1,
      rentalType: defaultPricing.rentalType,
      unitPrice: defaultPricing.price,
      totalPrice: defaultPricing.price,
      notes: ''
    };
    
    setCurrentOrder({
      ...currentOrder,
      items: [...currentOrder.items, newItem]
    });
  };

  const updateOrderItem = (itemId: string, field: keyof RentalOrderItem, value: any) => {
    if (!currentOrder) return;
    
    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price if dates, quantity, or unit price changed
        if (field === 'startDate' || field === 'endDate' || field === 'quantity' || field === 'unitPrice') {
          if (updatedItem.startDate && updatedItem.endDate) {
            const days = differenceInDays(updatedItem.endDate, updatedItem.startDate) + 1;
            updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity * days;
          } else {
            updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity;
          }
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setCurrentOrder({
      ...currentOrder,
      items: updatedItems
    });
  };

  const removeOrderItem = (itemId: string) => {
    if (!currentOrder) return;
    
    setCurrentOrder({
      ...currentOrder,
      items: currentOrder.items.filter(item => item.id !== itemId)
    });
  };

  const duplicateOrder = (order: RentalOrder) => {
    const duplicatedOrder: RentalOrder = {
      ...order,
      id: undefined,
      orderNumber: generateOrderNumber(),
      status: 'DRAFT',
      createdAt: undefined,
      updatedAt: undefined
    };
    setCurrentOrder(duplicatedOrder);
    setEditMode(true);
  };

  const saveOrder = async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Transform frontend data to match backend expectations
      const orderData = {
        orderNumber: currentOrder.orderNumber,
        customerId: currentOrder.customerId,
        customerName: currentOrder.customerName,
        status: currentOrder.status,
        items: currentOrder.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          startDate: item.startDate,
          endDate: item.endDate,
          quantity: item.quantity,
          rentalType: item.rentalType,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes || '' // Ensure notes is never undefined
        })),
        subtotal: currentOrder.subtotal,
        tax: currentOrder.tax,
        totalAmount: currentOrder.total, // Map 'total' to 'totalAmount' for backend
        notes: currentOrder.notes || '' // Ensure notes is never undefined
      };
      
      console.log('Sending order data:', orderData); // Debug log
      
      if (currentOrder.id) {
        // Update existing order
        await api.put(`/rentals/${currentOrder.id}`, orderData);
        setSuccess('Rental order updated successfully');
      } else {
        // Create new order
        await api.post('/rentals', orderData);
        setSuccess('Rental order created successfully');
      }
      
      await fetchRentalOrders();
      setEditMode(false);
      setCurrentOrder(null);
    } catch (error: any) {
      console.error('Save order error:', error.response?.data); // Debug log
      setError(error.response?.data?.message || 'Failed to save rental order');
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await api.delete(`/rentals/${orderId}`);
      setSuccess('Rental order deleted successfully');
      await fetchRentalOrders();
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete rental order');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'DRAFT': 'default',
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'IN_PROGRESS': 'primary',
      'COMPLETED': 'success',
      'CANCELLED': 'error'
    };
    return colors[status] || 'default';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Rental Order Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={createNewOrder}
          disabled={editMode}
        >
          Create New Order
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Product Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Products
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {products.map((product) => (
                <Box key={product.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Available: {product.availableQuantity} / {product.totalQuantity}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    From ${product.pricelistItems[0]?.price || 0}/day
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => addProductToOrder(product)}
                    disabled={editMode && !currentOrder}
                    sx={{ mt: 1 }}
                  >
                    Add to Order
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Form */}
        <Grid item xs={12} md={8}>
          {currentOrder ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Order: {currentOrder.orderNumber}
                  </Typography>
                  <Box>
                    {editMode ? (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={saveOrder}
                          disabled={saving}
                          sx={{ mr: 1 }}
                        >
                          {saving ? 'Saving...' : 'Save Order'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setCurrentOrder(null);
                            setEditMode(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        Edit Order
                      </Button>
                    )}
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Customer Name"
                      value={currentOrder.customerName}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={currentOrder.status}
                        onChange={(e) => setCurrentOrder({
                          ...currentOrder,
                          status: e.target.value as any
                        })}
                        disabled={!editMode}
                      >
                        <MenuItem value="DRAFT">Draft</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Order Items */}
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                
                {currentOrder.items.map((item) => (
                  <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.productName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <DatePicker
                          label="Start Date"
                          value={item.startDate}
                          onChange={(date) => updateOrderItem(item.id, 'startDate', date)}
                          disabled={!editMode}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <DatePicker
                          label="End Date"
                          value={item.endDate}
                          onChange={(date) => updateOrderItem(item.id, 'endDate', date)}
                          disabled={!editMode}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <TextField
                          size="small"
                          label="Qty"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          disabled={!editMode}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          size="small"
                          label="Unit Price"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          disabled={!editMode}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {formatPrice(item.totalPrice)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={1}>
                        {editMode && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeOrderItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                {/* Order Summary */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontWeight="bold">{formatPrice(currentOrder.subtotal)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>Tax (8%):</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontWeight="bold">{formatPrice(currentOrder.tax)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">Total:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatPrice(currentOrder.total)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" align="center">
                  Create a new rental order or select an existing one to edit
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Existing Orders Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Existing Rental Orders
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentalOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit Order">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCurrentOrder(order);
                            setEditMode(false);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate Order">
                        <IconButton
                          size="small"
                          onClick={() => duplicateOrder(order)}
                        >
                          <DuplicateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Order">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setOrderToDelete(order.id!);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this rental order? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => orderToDelete && deleteOrder(orderToDelete)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Container>
  );
};

export default RentalOrderForm; 