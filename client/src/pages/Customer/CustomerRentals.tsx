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
  Alert,
  Avatar
} from '@mui/material';
import {
  Search,
  FilterList,
  Receipt,
  LocalShipping,
  Payment,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';


interface CustomerRental {
  id: string;
  orderNumber: string;
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
  deliveryAddress: string;
  paymentStatus: string;
}

const CustomerRentals: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [rentals, setRentals] = useState<CustomerRental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<CustomerRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadRentals();
  }, []);

  useEffect(() => {
    filterRentals();
  }, [rentals, searchTerm, statusFilter, dateFilter]);

  const loadRentals = async () => {
    try {
      // Simulate API call
      const mockRentals: CustomerRental[] = [
        {
          id: '1',
          orderNumber: 'RO-1754916845853-006',
          status: 'IN_PROGRESS',
          totalAmount: 395,
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          createdAt: '2024-01-10',
          items: [
            { productName: 'Camping Tent Set', quantity: 1, unitPrice: 200 },
            { productName: 'Portable Generator', quantity: 1, unitPrice: 195 }
          ],
          deliveryAddress: '123 Main St, City, State 12345',
          paymentStatus: 'PAID'
        },
        {
          id: '2',
          orderNumber: 'RO-1754916845854-036',
          status: 'CONFIRMED',
          totalAmount: 528,
          startDate: '2024-01-22',
          endDate: '2024-01-25',
          createdAt: '2024-01-12',
          items: [
            { productName: 'BBQ Grill Set', quantity: 1, unitPrice: 150 },
            { productName: 'Outdoor Furniture Set', quantity: 1, unitPrice: 378 }
          ],
          deliveryAddress: '123 Main St, City, State 12345',
          paymentStatus: 'PAID'
        },
        {
          id: '3',
          orderNumber: 'RO-1754916845853-024',
          status: 'COMPLETED',
          totalAmount: 711,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          createdAt: '2023-12-28',
          items: [
            { productName: 'Party Tent 10x15', quantity: 1, unitPrice: 400 },
            { productName: 'Table & Chair Set', quantity: 1, unitPrice: 311 }
          ],
          deliveryAddress: '123 Main St, City, State 12345',
          paymentStatus: 'PAID'
        },
        {
          id: '4',
          orderNumber: 'RO-1754916845853-019',
          status: 'COMPLETED',
          totalAmount: 131,
          startDate: '2023-12-15',
          endDate: '2023-12-17',
          createdAt: '2023-12-10',
          items: [
            { productName: 'Camping Equipment Kit', quantity: 1, unitPrice: 131 }
          ],
          deliveryAddress: '123 Main St, City, State 12345',
          paymentStatus: 'PAID'
        },
        {
          id: '5',
          orderNumber: 'RO-1754916845853-026',
          status: 'CANCELLED',
          totalAmount: 899,
          startDate: '2023-12-20',
          endDate: '2023-12-23',
          createdAt: '2023-12-15',
          items: [
            { productName: 'Mini Excavator', quantity: 1, unitPrice: 899 }
          ],
          deliveryAddress: '123 Main St, City, State 12345',
          paymentStatus: 'REFUNDED'
        }
      ];
      
      setRentals(mockRentals);
    } catch (error) {
      console.error('Error loading rentals:', error);
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
        rental.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rental => rental.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(rental => {
        const rentalDate = new Date(rental.createdAt);
        if (dateFilter === '30') return rentalDate >= thirtyDaysAgo;
        if (dateFilter === '90') return rentalDate >= ninetyDaysAgo;
        return true;
      });
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

  const handleDateFilterChange = (event: SelectChangeEvent) => {
    setDateFilter(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusCount = (status: string) => {
    return rentals.filter(rental => rental.status === status).length;
  };

  const getTotalSpent = () => {
    return rentals
      .filter(rental => rental.status === 'COMPLETED')
      .reduce((sum, rental) => sum + rental.totalAmount, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading rentals...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Rentals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your rental orders
        </Typography>
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
                Active Rentals
              </Typography>
              <Typography variant="h4">
                {getStatusCount('IN_PROGRESS') + getStatusCount('CONFIRMED')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Completed
              </Typography>
              <Typography variant="h4">
                {getStatusCount('COMPLETED')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Spent
              </Typography>
              <Typography variant="h4">
                ${getTotalSpent()}
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
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                label="Date Range"
                onChange={handleDateFilterChange}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
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

      {/* Rentals Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment</TableCell>
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
                      <Typography variant="caption" color="text.secondary">
                        {rental.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {rental.items.map((item, index) => (
                          <Typography key={index} variant="body2">
                            {item.productName} (x{item.quantity})
                          </Typography>
                        ))}
                      </Box>
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
                      <Chip
                        label={rental.status}
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
                      <Chip
                        label={rental.paymentStatus}
                        color={getPaymentStatusColor(rental.paymentStatus) as any}
                        size="small"
                      />
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

      {filteredRentals.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No rentals found matching your criteria
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/products'}
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CustomerRentals; 