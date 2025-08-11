import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Avatar,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  Inventory,
  Category,
  AttachMoney,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  isRentable: boolean;
  isActive: boolean;
  totalQuantity: number;
  availableQuantity: number;
  unitPrice: number;
  images: string[];
  createdAt: string;
  totalRentals: number;
  revenue: number;
}

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    try {
      // Simulate API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Camping Tent Set',
          sku: 'OUT-001',
          description: 'Complete camping tent setup with poles and stakes',
          category: 'Outdoor & Camping',
          isRentable: true,
          isActive: true,
          totalQuantity: 15,
          availableQuantity: 8,
          unitPrice: 45,
          images: ['tent1.jpg', 'tent2.jpg'],
          createdAt: '2023-01-01',
          totalRentals: 127,
          revenue: 5715
        },
        {
          id: '2',
          name: 'Portable Generator',
          sku: 'OUT-002',
          description: '5000W portable generator for outdoor events',
          category: 'Outdoor & Camping',
          isRentable: true,
          isActive: true,
          totalQuantity: 8,
          availableQuantity: 3,
          unitPrice: 85,
          images: ['generator1.jpg'],
          createdAt: '2023-01-15',
          totalRentals: 89,
          revenue: 7565
        },
        {
          id: '3',
          name: 'BBQ Grill Set',
          sku: 'OUT-005',
          description: 'Professional BBQ grill with accessories',
          category: 'Outdoor & Camping',
          isRentable: true,
          isActive: true,
          totalQuantity: 12,
          availableQuantity: 5,
          unitPrice: 35,
          images: ['grill1.jpg', 'grill2.jpg'],
          createdAt: '2023-02-01',
          totalRentals: 156,
          revenue: 5460
        },
        {
          id: '4',
          name: 'Party Tent 20x30',
          sku: 'PARTY-001',
          description: 'Large party tent for events and celebrations',
          category: 'Party & Events',
          isRentable: true,
          isActive: true,
          totalQuantity: 6,
          availableQuantity: 2,
          unitPrice: 150,
          images: ['tent-party1.jpg'],
          createdAt: '2023-01-20',
          totalRentals: 67,
          revenue: 10050
        },
        {
          id: '5',
          name: 'LED Dance Floor',
          sku: 'PARTY-003',
          description: 'Interactive LED dance floor panels',
          category: 'Party & Events',
          isRentable: true,
          isActive: false,
          totalQuantity: 20,
          availableQuantity: 0,
          unitPrice: 25,
          images: ['dance-floor1.jpg'],
          createdAt: '2023-03-01',
          totalRentals: 45,
          revenue: 1125
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.isActive : !product.isActive
      );
    }

    setFilteredProducts(filtered);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleViewProduct = () => {
    if (selectedProduct) {
      navigate(`/admin/products/${selectedProduct.id}`);
    }
    handleMenuClose();
  };

  const handleEditProduct = () => {
    if (selectedProduct) {
      navigate(`/admin/products/${selectedProduct.id}/edit`);
    }
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    setStatusChangeDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteProduct = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmStatusChange = () => {
    if (selectedProduct) {
      setProducts(products.map(product => 
        product.id === selectedProduct.id 
          ? { ...product, isActive: !product.isActive }
          : product
      ));
      setStatusChangeDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
    const index = category.length % colors.length;
    return colors[index];
  };

  const getCategoryCount = (category: string) => {
    return products.filter(product => product.category === category).length;
  };

  const getActiveProductCount = () => {
    return products.filter(product => product.isActive).length;
  };

  const getTotalRevenue = () => {
    return products.reduce((sum, product) => sum + product.revenue, 0);
  };

  const getTotalRentals = () => {
    return products.reduce((sum, product) => sum + product.totalRentals, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Product Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/products/new')}
        >
          Add New Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Products
              </Typography>
              <Typography variant="h4">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Active Products
              </Typography>
              <Typography variant="h4">
                {getActiveProductCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Rentals
              </Typography>
              <Typography variant="h4">
                {getTotalRentals()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${getTotalRevenue().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Outdoor & Camping">Outdoor & Camping</MenuItem>
                <MenuItem value="Party & Events">Party & Events</MenuItem>
                <MenuItem value="Kitchen & Catering">Kitchen & Catering</MenuItem>
                <MenuItem value="Office & Business">Office & Business</MenuItem>
                <MenuItem value="Tools & Equipment">Tools & Equipment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
            >
              More
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {product.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.description.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category}
                        color={getCategoryColor(product.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {product.availableQuantity}/{product.totalQuantity}
                        </Typography>
                        <Chip
                          label={product.isRentable ? 'Rentable' : 'Not Rentable'}
                          color={product.isRentable ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${product.unitPrice}/day
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'Active' : 'Inactive'}
                        color={product.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {product.totalRentals} rentals
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${product.revenue} revenue
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProduct}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditProduct}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Product
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedProduct?.isActive ? (
            <>
              <Inventory fontSize="small" sx={{ mr: 1 }} />
              Deactivate Product
            </>
          ) : (
            <>
              <TrendingUp fontSize="small" sx={{ mr: 1 }} />
              Activate Product
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDeleteProduct} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Product
        </MenuItem>
      </Menu>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusChangeDialogOpen} onClose={() => setStatusChangeDialogOpen(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {selectedProduct?.isActive ? 'deactivate' : 'activate'} product {selectedProduct?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusChangeDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmStatusChange} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete product {selectedProduct?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts; 