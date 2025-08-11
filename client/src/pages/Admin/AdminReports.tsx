import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  LocalShipping,
  Receipt
} from '@mui/icons-material';

interface ReportData {
  period: string;
  revenue: number;
  rentals: number;
  customers: number;
  products: number;
  growth: number;
}

interface TopProduct {
  name: string;
  category: string;
  rentals: number;
  revenue: number;
  growth: number;
}

interface TopCustomer {
  name: string;
  email: string;
  rentals: number;
  totalSpent: number;
  lastRental: string;
}

const AdminReports: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      // Simulate API call
      const mockReportData: ReportData[] = [
        {
          period: 'Jan 2024',
          revenue: 45678,
          rentals: 63,
          customers: 25,
          products: 60,
          growth: 12.5
        },
        {
          period: 'Dec 2023',
          revenue: 40567,
          rentals: 58,
          customers: 23,
          products: 58,
          growth: 8.2
        },
        {
          period: 'Nov 2023',
          revenue: 37489,
          rentals: 52,
          customers: 21,
          products: 55,
          growth: 15.7
        }
      ];

      const mockTopProducts: TopProduct[] = [
        {
          name: 'Camping Tent Set',
          category: 'Outdoor & Camping',
          rentals: 127,
          revenue: 5715,
          growth: 23.4
        },
        {
          name: 'BBQ Grill Set',
          category: 'Outdoor & Camping',
          rentals: 156,
          revenue: 5460,
          growth: 18.7
        },
        {
          name: 'Party Tent 20x30',
          category: 'Party & Events',
          rentals: 67,
          revenue: 10050,
          growth: 31.2
        },
        {
          name: 'Portable Generator',
          category: 'Outdoor & Camping',
          rentals: 89,
          revenue: 7565,
          growth: 12.8
        },
        {
          name: 'LED Dance Floor',
          category: 'Party & Events',
          rentals: 45,
          revenue: 1125,
          growth: -5.2
        }
      ];

      const mockTopCustomers: TopCustomer[] = [
        {
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          rentals: 8,
          totalSpent: 2847,
          lastRental: '2024-01-15'
        },
        {
          name: 'Bob Smith',
          email: 'bob.smith@example.com',
          rentals: 5,
          totalSpent: 1890,
          lastRental: '2024-01-12'
        },
        {
          name: 'Carol Davis',
          email: 'carol.davis@example.com',
          rentals: 3,
          totalSpent: 945,
          lastRental: '2024-01-01'
        },
        {
          name: 'David Wilson',
          email: 'david.wilson@example.com',
          rentals: 7,
          totalSpent: 2340,
          lastRental: '2024-01-10'
        },
        {
          name: 'Eva Brown',
          email: 'eva.brown@example.com',
          rentals: 4,
          totalSpent: 1567,
          lastRental: '2024-01-08'
        }
      ];

      setReportData(mockReportData);
      setTopProducts(mockTopProducts);
      setTopCustomers(mockTopCustomers);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setSelectedPeriod(event.target.value);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'success' : 'error';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading reports...</Typography>
      </Box>
      );
  }

  const currentData = reportData[0];
  const previousData = reportData[1];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics & Reports</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Period"
            onChange={handlePeriodChange}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${currentData?.revenue.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getGrowthIcon(currentData?.growth || 0)}
                    <Typography 
                      variant="body2" 
                      color={getGrowthColor(currentData?.growth || 0)}
                      sx={{ ml: 0.5 }}
                    >
                      {currentData?.growth}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Rentals
                  </Typography>
                  <Typography variant="h4">
                    {currentData?.rentals}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getGrowthIcon(currentData?.growth || 0)}
                    <Typography 
                      variant="body2" 
                      color={getGrowthColor(currentData?.growth || 0)}
                      sx={{ ml: 0.5 }}
                    >
                      {currentData?.growth}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Customers
                  </Typography>
                  <Typography variant="h4">
                    {currentData?.customers}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getGrowthIcon(currentData?.growth || 0)}
                    <Typography 
                      variant="body2" 
                      color={getGrowthColor(currentData?.growth || 0)}
                      sx={{ ml: 0.5 }}
                    >
                      {currentData?.growth}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Available Products
                  </Typography>
                  <Typography variant="h4">
                    {currentData?.products}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getGrowthIcon(currentData?.growth || 0)}
                    <Typography 
                      variant="body2" 
                      color={getGrowthColor(currentData?.growth || 0)}
                      sx={{ ml: 0.5 }}
                    >
                      {currentData?.growth}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Inventory />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Trend */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Chart visualization would go here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Avg. Rental Value</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${Math.round((currentData?.revenue || 0) / (currentData?.rentals || 1))}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Customer Retention</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round((currentData?.customers || 0) / (previousData?.customers || 1) * 100)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Product Utilization</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round((currentData?.rentals || 0) / (currentData?.products || 1) * 100)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products and Customers */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Products
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Rentals</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.category} size="small" />
                      </TableCell>
                      <TableCell>{product.rentals}</TableCell>
                      <TableCell>${product.revenue}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getGrowthIcon(product.growth)}
                          <Typography 
                            variant="body2" 
                            color={getGrowthColor(product.growth)}
                            sx={{ ml: 0.5 }}
                          >
                            {product.growth}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Customers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Rentals</TableCell>
                    <TableCell>Total Spent</TableCell>
                    <TableCell>Last Rental</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{customer.rentals}</TableCell>
                      <TableCell>${customer.totalSpent}</TableCell>
                      <TableCell>{customer.lastRental}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Category Performance */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Category Performance
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Category performance chart would go here
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminReports; 