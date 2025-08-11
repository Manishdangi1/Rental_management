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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Avatar,
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
  Category,
  Inventory,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  productCount: number;
  totalRevenue: number;
  createdAt: string;
  imageUrl?: string;
}

const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, statusFilter]);

  const loadCategories = async () => {
    try {
      // Simulate API call
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Outdoor & Camping',
          description: 'Camping gear, tents, outdoor equipment',
          slug: 'outdoor-camping',
          isActive: true,
          productCount: 25,
          totalRevenue: 15680,
          createdAt: '2023-01-01',
          imageUrl: 'outdoor.jpg'
        },
        {
          id: '2',
          name: 'Party & Events',
          description: 'Party supplies, decorations, event equipment',
          slug: 'party-events',
          isActive: true,
          productCount: 18,
          totalRevenue: 23450,
          createdAt: '2023-01-15',
          imageUrl: 'party.jpg'
        },
        {
          id: '3',
          name: 'Kitchen & Catering',
          description: 'Kitchen equipment, catering supplies',
          slug: 'kitchen-catering',
          isActive: true,
          productCount: 12,
          totalRevenue: 8920,
          createdAt: '2023-02-01',
          imageUrl: 'kitchen.jpg'
        },
        {
          id: '4',
          name: 'Office & Business',
          description: 'Office furniture, business equipment',
          slug: 'office-business',
          isActive: false,
          productCount: 8,
          totalRevenue: 3450,
          createdAt: '2023-02-15',
          imageUrl: 'office.jpg'
        },
        {
          id: '5',
          name: 'Tools & Equipment',
          description: 'Construction tools, power equipment',
          slug: 'tools-equipment',
          isActive: true,
          productCount: 15,
          totalRevenue: 12340,
          createdAt: '2023-03-01',
          imageUrl: 'tools.jpg'
        }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(category => 
        statusFilter === 'active' ? category.isActive : !category.isActive
      );
    }

    setFilteredCategories(filtered);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, category: Category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleViewCategory = () => {
    if (selectedCategory) {
      navigate(`/admin/categories/${selectedCategory.id}`);
    }
    handleMenuClose();
  };

  const handleEditCategory = () => {
    if (selectedCategory) {
      navigate(`/admin/categories/${selectedCategory.id}/edit`);
    }
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    setStatusChangeDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCategory = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmStatusChange = () => {
    if (selectedCategory) {
      setCategories(categories.map(category => 
        category.id === selectedCategory.id 
          ? { ...category, isActive: !category.isActive }
          : category
      ));
      setStatusChangeDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      setCategories(categories.filter(c => c.id !== selectedCategory.id));
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const getActiveCategoryCount = () => {
    return categories.filter(category => category.isActive).length;
  };

  const getTotalProducts = () => {
    return categories.reduce((sum, category) => sum + category.productCount, 0);
  };

  const getTotalRevenue = () => {
    return categories.reduce((sum, category) => sum + category.totalRevenue, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Category Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/categories/new')}
        >
          Add New Category
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Categories
              </Typography>
              <Typography variant="h4">
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Active Categories
              </Typography>
              <Typography variant="h4">
                {getActiveCategoryCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Products
              </Typography>
              <Typography variant="h4">
                {getTotalProducts()}
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search categories..."
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
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Categories Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Category />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {category.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.slug}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Inventory sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {category.productCount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                        <Typography variant="body2" fontWeight="bold">
                          ${category.totalRevenue.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Active' : 'Inactive'}
                        color={category.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, category)}
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
          count={filteredCategories.length}
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
        <MenuItem onClick={handleViewCategory}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditCategory}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Category
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedCategory?.isActive ? (
            <>
              <Category fontSize="small" sx={{ mr: 1 }} />
              Deactivate Category
            </>
          ) : (
            <>
              <TrendingUp fontSize="small" sx={{ mr: 1 }} />
              Activate Category
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDeleteCategory} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Category
        </MenuItem>
      </Menu>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusChangeDialogOpen} onClose={() => setStatusChangeDialogOpen(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {selectedCategory?.isActive ? 'deactivate' : 'activate'} category {selectedCategory?.name}?
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
            Are you sure you want to delete category {selectedCategory?.name}? This action cannot be undone.
          </Typography>
          {selectedCategory && selectedCategory.productCount > 0 && (
            <Typography color="error" sx={{ mt: 1 }}>
              Warning: This category contains {selectedCategory.productCount} products that will be affected.
            </Typography>
          )}
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

export default AdminCategories; 