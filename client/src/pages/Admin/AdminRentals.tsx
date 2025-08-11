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
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  LocalShipping,
  Receipt,
  Payment,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { formatStatusForDisplay, getStatusColor, getStatusCountByDisplayName } from '../../utils/statusUtils';

interface Rental {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

const AdminRentals: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadRentals();
  }, []);

  useEffect(() => {
    filterRentals();
  }, [rentals, searchTerm, statusFilter]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/rentals');
      setRentals(response.data.rentals);
    } catch (error: any) {
      console.error('Error loading rentals:', error);
      setError(error.response?.data?.message || 'Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const filterRentals = () => {
    let filtered = rentals;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(rental =>
        rental.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rental => rental.status === statusFilter);
    }

    setFilteredRentals(filtered);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rental: Rental) => {
    setAnchorEl(event.currentTarget);
    setSelectedRental(rental);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRental(null);
  };

  const handleViewRental = () => {
    if (selectedRental) {
      navigate(`/admin/rentals/${selectedRental.id}`);
    }
    handleMenuClose();
  };

  const handleEditRental = () => {
    if (selectedRental) {
      navigate(`/admin/rentals/${selectedRental.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteRental = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedRental) {
      setRentals(rentals.filter(r => r.id !== selectedRental.id));
      setDeleteDialogOpen(false);
      setSelectedRental(null);
    }
  };

  const getStatusCount = (status: string) => {
    return rentals.filter(rental => rental.status === status).length;
  };

  const totalRevenue = rentals.reduce((sum, rental) => sum + rental.totalAmount, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Rental Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/rentals/new')}
        >
          New Rental
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Rentals
              </Typography>
              <Typography variant="h4">
                {rentals.length}
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
                ${totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Active Rentals
              </Typography>
              <Typography variant="h4">
                {getStatusCount('QUOTATION_SENT') + getStatusCount('PICKED_UP')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pending
              </Typography>
              <Typography variant="h4">
                {getStatusCount('QUOTATION')}
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
              placeholder="Search rentals..."
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
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="QUOTATION">Quotation</MenuItem>
                <MenuItem value="QUOTATION_SENT">Quotation Sent</MenuItem>
                <MenuItem value="PICKED_UP">Picked Up</MenuItem>
                <MenuItem value="RETURNED">Returned</MenuItem>
                <MenuItem value="RESERVED">Reserved</MenuItem>
              </Select>
            </FormControl>
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

      {/* Rentals Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRentals
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((rental) => (
                  <TableRow key={rental.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {rental.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {rental.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rental.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatusForDisplay(rental.status)}
                        color={getStatusColor(rental.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${rental.totalAmount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {rental.startDate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          to {rental.endDate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rental.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, rental)}
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
          count={filteredRentals.length}
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
        <MenuItem onClick={handleViewRental}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditRental}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Rental
        </MenuItem>
        <MenuItem onClick={handleDeleteRental} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Rental
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete rental {selectedRental?.orderNumber}? This action cannot be undone.
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

export default AdminRentals; 