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
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  InputAdornment,
  Pagination,
  Checkbox,
  Toolbar,
  alpha
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Refresh,
  Inventory,
  Category,
  LocalOffer,
  Settings,
  CheckCircle,
  Warning,
  Block
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: {
    id: string;
    name: string;
  };
  totalQuantity: number;
  availableQuantity: number;
  basePrice: number;
  minimumRentalDays: number;
  maximumRentalDays: number;
  isRentable: boolean;
  isActive: boolean;
  isSeasonal: boolean;
  rentalInstructions?: string;
  setupRequirements?: string;
  returnRequirements?: string;
  damagePolicy?: string;
  insuranceRequired?: boolean;
  insuranceAmount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Dialog states
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    categoryId: '',
    totalQuantity: 1,
    availableQuantity: 1,
    basePrice: 0,
    minimumRentalDays: 1,
    maximumRentalDays: 30,
    isRentable: true,
    isActive: true,
    isSeasonal: false,
    rentalInstructions: '',
    setupRequirements: '',
    returnRequirements: '',
    damagePolicy: '',
    insuranceRequired: false,
    insuranceAmount: 0
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalProducts(data.products?.length || 0);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive) ||
                         (statusFilter === 'rentable' && product.isRentable) ||
                         (statusFilter === 'non-rentable' && !product.isRentable);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Open product dialog
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,
        categoryId: product.category.id,
        totalQuantity: product.totalQuantity,
        availableQuantity: product.availableQuantity,
        basePrice: product.basePrice,
        minimumRentalDays: product.minimumRentalDays,
        maximumRentalDays: product.maximumRentalDays,
        isRentable: product.isRentable,
        isActive: product.isActive,
        isSeasonal: product.isSeasonal,
        rentalInstructions: '',
        setupRequirements: '',
        returnRequirements: '',
        damagePolicy: '',
        insuranceRequired: false,
        insuranceAmount: 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        sku: '',
        categoryId: '',
        totalQuantity: 1,
        availableQuantity: 1,
        basePrice: 0,
        minimumRentalDays: 1,
        maximumRentalDays: 30,
        isRentable: true,
        isActive: true,
        isSeasonal: false,
        rentalInstructions: '',
        setupRequirements: '',
        returnRequirements: '',
        damagePolicy: '',
        insuranceRequired: false,
        insuranceAmount: 0
      });
    }
    setProductDialog(true);
  };

  // Save product
  const handleSaveProduct = async () => {
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setProductDialog(false);
        fetchProducts();
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setDeleteDialog(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.length === 0) return;

    try {
      if (action === 'delete') {
        // Handle bulk delete
        const deletePromises = selectedProducts.map(id =>
          fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        );
        
        await Promise.all(deletePromises);
      } else {
        // Handle bulk activate/deactivate
        const updatePromises = selectedProducts.map(id =>
          fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              isActive: action === 'activate'
            })
          })
        );
        
        await Promise.all(updatePromises);
      }
      
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action');
    }
  };

  // Select all products
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Select individual product
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
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
            Product Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your rental product catalog, inventory, and pricing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenProductDialog()}
        >
          Add New Product
        </Button>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="rentable">Rentable</MenuItem>
                  <MenuItem value="non-rentable">Non-Rentable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchProducts}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedProducts.length > 0 && (
        <Paper sx={{ mb: 2, p: 2, bgcolor: alpha('#1976d2', 0.1) }}>
          <Toolbar>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {selectedProducts.length} product(s) selected
            </Typography>
            <Button
              size="small"
              onClick={() => handleBulkAction('activate')}
              sx={{ mr: 1 }}
            >
              Activate
            </Button>
            <Button
              size="small"
              onClick={() => handleBulkAction('deactivate')}
              sx={{ mr: 1 }}
            >
              Deactivate
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </Button>
          </Toolbar>
        </Paper>
      )}

      {/* Products Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProducts.length === paginatedProducts.length}
                      indeterminate={selectedProducts.length > 0 && selectedProducts.length < paginatedProducts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Inventory</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Rental Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                          {product.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.sku} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.category.name} 
                        size="small" 
                        icon={<Category />}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {product.availableQuantity} / {product.totalQuantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Available / Total
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${product.basePrice}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {product.minimumRentalDays}-{product.maximumRentalDays} days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip
                          label={product.isActive ? 'Active' : 'Inactive'}
                          color={product.isActive ? 'success' : 'default'}
                          size="small"
                          icon={product.isActive ? <CheckCircle /> : <Block />}
                        />
                        <Chip
                          label={product.isRentable ? 'Rentable' : 'Non-Rentable'}
                          color={product.isRentable ? 'primary' : 'default'}
                          size="small"
                          icon={product.isRentable ? <LocalOffer /> : <Warning />}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => {
                            setSelectedProductForView(product);
                            setViewDetailsDialog(true);
                          }}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Product">
                          <IconButton size="small" onClick={() => handleOpenProductDialog(product)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Product">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setProductToDelete(product);
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
              count={Math.ceil(filteredProducts.length / rowsPerPage)}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialog} onClose={() => setViewDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Product Details
          {selectedProductForView?.name && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              {selectedProductForView.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedProductForView && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedProductForView.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>SKU:</strong> {selectedProductForView.sku}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Category:</strong> {selectedProductForView.category?.name || 'Uncategorized'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Description:</strong> {selectedProductForView.description || 'No description available'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Inventory Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Inventory Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Total Quantity:</strong> {selectedProductForView.totalQuantity || 0}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Available Quantity:</strong> {selectedProductForView.availableQuantity || 0}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Base Price:</strong> ${selectedProductForView.basePrice?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Rental Configuration */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Rental Configuration
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Minimum Rental Days:</strong> {selectedProductForView.minimumRentalDays || 1}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Maximum Rental Days:</strong> {selectedProductForView.maximumRentalDays || 30}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Rentable:</strong> {selectedProductForView.isRentable ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Status Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Status Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Active:</strong> {selectedProductForView.isActive ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Seasonal:</strong> {selectedProductForView.isSeasonal ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Created:</strong> {selectedProductForView.createdAt ? new Date(selectedProductForView.createdAt).toLocaleDateString() : 'Unknown'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Last Updated:</strong> {selectedProductForView.updatedAt ? new Date(selectedProductForView.updatedAt).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Additional Details */}
                {selectedProductForView.rentalInstructions && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Rental Instructions
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>
                      {selectedProductForView.rentalInstructions}
                    </Typography>
                  </Grid>
                )}

                {selectedProductForView.setupRequirements && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Setup Requirements
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>
                      {selectedProductForView.setupRequirements}
                    </Typography>
                  </Grid>
                )}

                {selectedProductForView.returnRequirements && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Return Requirements
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>
                      {selectedProductForView.returnRequirements}
                    </Typography>
                  </Grid>
                )}

                {selectedProductForView.damagePolicy && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Damage Policy
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>
                      {selectedProductForView.damagePolicy}
                    </Typography>
                  </Grid>
                )}

                {/* Insurance Information */}
                {selectedProductForView.insuranceRequired && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Insurance Information
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2">
                        <strong>Insurance Required:</strong> Yes
                      </Typography>
                      <Typography variant="body2">
                        <strong>Insurance Amount:</strong> ${selectedProductForView.insuranceAmount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Product Dialog */}
      <Dialog 
        open={productDialog} 
        onClose={() => setProductDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  label="Category"
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Price"
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Quantity"
                type="number"
                value={formData.totalQuantity}
                onChange={(e) => handleInputChange('totalQuantity', parseInt(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Available Quantity"
                type="number"
                value={formData.availableQuantity}
                onChange={(e) => handleInputChange('availableQuantity', parseInt(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Rental Days"
                type="number"
                value={formData.minimumRentalDays}
                onChange={(e) => handleInputChange('minimumRentalDays', parseInt(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Rental Days"
                type="number"
                value={formData.maximumRentalDays}
                onChange={(e) => handleInputChange('maximumRentalDays', parseInt(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isRentable}
                      onChange={(e) => handleInputChange('isRentable', e.target.checked)}
                    />
                  }
                  label="Rentable"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isSeasonal}
                      onChange={(e) => handleInputChange('isSeasonal', e.target.checked)}
                    />
                  }
                  label="Seasonal"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editingProduct ? 'Update' : 'Create'} Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
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

export default AdminProducts; 