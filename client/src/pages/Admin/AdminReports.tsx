import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Download,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  BarChart,
  PieChart,
  Timeline,
  CalendarToday,
  Refresh,
  FileDownload,
  Assessment,
  Analytics
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ReportData {
  overview: {
    totalRentals: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
  };
  revenueData: {
    groupedRevenue: Record<string, any>;
    totalRevenue: number;
    totalRentals: number;
  };
  rentalAnalytics: {
    totalRentals: number;
    totalRevenue: number;
    averageRentalValue: number;
    statusBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
    customerBreakdown: Record<string, number>;
  };
  topProducts: Array<{
    id: string;
    name: string;
    totalRentals: number;
    totalRevenue: number;
    averageRating: number;
    category: string;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalRentals: number;
    totalSpent: number;
    lastRentalDate: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    rentals: number;
    revenue: number;
  }>;
}

const AdminReports: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  // Date range for reports
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [groupBy, setGroupBy] = useState('month');

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDateStr = startDate?.toISOString().split('T')[0];
      const endDateStr = endDate?.toISOString().split('T')[0];

      // Fetch all report data in parallel
      const [overviewResponse, revenueResponse, rentalsResponse, topProductsResponse, topCustomersResponse, analyticsResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/admin/reports/revenue?startDate=${startDateStr}&endDate=${endDateStr}&groupBy=${groupBy}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/admin/reports/rentals?startDate=${startDateStr}&endDate=${endDateStr}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/reports/top-products', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/reports/top-customers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/admin/reports/analytics?startDate=${startDateStr}&endDate=${endDateStr}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (overviewResponse.ok && revenueResponse.ok && rentalsResponse.ok && 
          topProductsResponse.ok && topCustomersResponse.ok && analyticsResponse.ok) {
        
        const [overview, revenue, rentals, topProducts, topCustomers, analytics] = await Promise.all([
          overviewResponse.json(),
          revenueResponse.json(),
          rentalsResponse.json(),
          topProductsResponse.json(),
          topCustomersResponse.json(),
          analyticsResponse.json()
        ]);

        setReportData({
          overview,
          revenueData: revenue,
          rentalAnalytics: rentals,
          topProducts: topProducts.products || [],
          topCustomers: topCustomers.customers || [],
          monthlyTrends: analytics.monthlyTrends || []
        });
      } else {
        setError('Failed to fetch report data');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, groupBy]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Export report data
  const exportReport = async (reportType: string) => {
    try {
      const startDateStr = startDate?.toISOString().split('T')[0];
      const endDateStr = endDate?.toISOString().split('T')[0];
      
      const response = await fetch(`/api/admin/reports/${reportType}?startDate=${startDateStr}&endDate=${endDateStr}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create CSV content
        let csvContent = '';
        
        switch (reportType) {
          case 'revenue':
            csvContent = 'Month,Total Revenue,Rentals,Completed,In Progress\n';
            Object.entries(data.groupedRevenue).forEach(([month, stats]: [string, any]) => {
              csvContent += `${month},${stats.total},${stats.count},${stats.completed},${stats.inProgress}\n`;
            });
            break;
          case 'rentals':
            csvContent = 'Status,Count\n';
            Object.entries(data.statusBreakdown).forEach(([status, count]) => {
              csvContent += `${status},${count}\n`;
            });
            break;
          case 'products':
            csvContent = 'Product Name,Category,Total Rentals,SKU,Status\n';
            data.products.forEach((product: any) => {
              csvContent += `${product.name},${product.category},${product.totalRentals},${product.sku},${product.isActive ? 'Active' : 'Inactive'}\n`;
            });
            break;
          case 'customers':
            csvContent = 'Customer Name,Email,Total Rentals,Total Spent,Last Rental\n';
            data.customers.forEach((customer: any) => {
              csvContent += `${customer.name},${customer.email},${customer.totalRentals},${customer.totalSpent},${customer.lastRental || 'N/A'}\n`;
            });
            break;
        }

        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${startDateStr}_to_${endDateStr}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !reportData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive business insights and performance metrics
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchReportData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Date Range and Grouping Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                  />
              </Grid>
              <Grid item xs={12} md={3}>
                                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                  />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Group By</InputLabel>
                  <Select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    label="Group By"
                  >
                    <MenuItem value="day">Day</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={fetchReportData}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        {reportData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" component="div">
                        {formatCurrency(reportData.overview.totalRevenue)}
                      </Typography>
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
                      <Typography color="text.secondary" gutterBottom>
                        Total Rentals
                      </Typography>
                      <Typography variant="h4" component="div">
                        {reportData.overview.totalRentals}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
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
                      <Typography color="text.secondary" gutterBottom>
                        Total Customers
                      </Typography>
                      <Typography variant="h4" component="div">
                        {reportData.overview.totalCustomers}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                      <Typography color="text.secondary" gutterBottom>
                        Total Products
                      </Typography>
                      <Typography variant="h4" component="div">
                        {reportData.overview.totalProducts}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <Inventory />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="reports tabs">
            <Tab label="Revenue Analytics" />
            <Tab label="Rental Reports" />
            <Tab label="Product Performance" />
            <Tab label="Customer Insights" />
            <Tab label="Monthly Trends" />
          </Tabs>
        </Box>

        {/* Revenue Analytics Tab */}
        {activeTab === 0 && reportData && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Revenue Analytics</Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportReport('revenue')}
              >
                Export Revenue Report
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue Summary
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" color="primary">
                        {formatCurrency(reportData.revenueData.totalRevenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue ({reportData.revenueData.totalRentals} rentals)
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue by {groupBy}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Period</TableCell>
                            <TableCell>Revenue</TableCell>
                            <TableCell>Rentals</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(reportData.revenueData.groupedRevenue).map(([period, stats]: [string, any]) => (
                            <TableRow key={period}>
                              <TableCell>{period}</TableCell>
                              <TableCell>{formatCurrency(stats.total)}</TableCell>
                              <TableCell>{stats.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Rental Reports Tab */}
        {activeTab === 1 && reportData && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Rental Reports</Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportReport('rentals')}
              >
                Export Rental Report
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Rental Status Breakdown
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {Object.entries(reportData.rentalAnalytics.statusBreakdown).map(([status, count]) => (
                        <Box key={status} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{status}</Typography>
                            <Typography variant="body2" fontWeight="bold">{count}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(count / reportData.rentalAnalytics.totalRentals) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Rental Analytics
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Total Rentals"
                          secondary={reportData.rentalAnalytics.totalRentals}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Revenue"
                          secondary={formatCurrency(reportData.rentalAnalytics.totalRevenue)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Average Rental Value"
                          secondary={formatCurrency(reportData.rentalAnalytics.averageRentalValue)}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Product Performance Tab */}
        {activeTab === 2 && reportData && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Product Performance</Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportReport('products')}
              >
                Export Products Report
              </Button>
            </Box>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Products
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Total Rentals</TableCell>
                        <TableCell>Total Revenue</TableCell>
                        <TableCell>Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.topProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {product.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={product.category} size="small" />
                          </TableCell>
                          <TableCell>{product.totalRentals}</TableCell>
                          <TableCell>{formatCurrency(product.totalRevenue)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                              <Typography variant="body2" color="success.main">
                                {((product.totalRentals / Math.max(...reportData.topProducts.map(p => p.totalRentals))) * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Customer Insights Tab */}
        {activeTab === 3 && reportData && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Customer Insights</Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportReport('customers')}
              >
                Export Customers Report
              </Button>
            </Box>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Customers
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Total Rentals</TableCell>
                        <TableCell>Total Spent</TableCell>
                        <TableCell>Last Rental</TableCell>
                        <TableCell>Customer Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.topCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {customer.name}
                            </Typography>
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.totalRentals}</TableCell>
                          <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                          <TableCell>
                            {customer.lastRentalDate ? formatDate(customer.lastRentalDate) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={customer.totalSpent > 1000 ? 'VIP' : customer.totalSpent > 500 ? 'Regular' : 'New'}
                              color={customer.totalSpent > 1000 ? 'success' : customer.totalSpent > 500 ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Monthly Trends Tab */}
        {activeTab === 4 && reportData && (
          <Box>
            <Typography variant="h5" gutterBottom>Monthly Trends</Typography>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue & Rental Trends
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell>Rentals</TableCell>
                        <TableCell>Revenue</TableCell>
                        <TableCell>Trend</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.monthlyTrends.map((trend, index) => {
                        const prevRevenue = index > 0 ? reportData.monthlyTrends[index - 1].revenue : trend.revenue;
                        const revenueChange = ((trend.revenue - prevRevenue) / prevRevenue) * 100;
                        
                        return (
                          <TableRow key={trend.month}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {trend.month}
                              </Typography>
                            </TableCell>
                            <TableCell>{trend.rentals}</TableCell>
                            <TableCell>{formatCurrency(trend.revenue)}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {revenueChange >= 0 ? (
                                  <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                                ) : (
                                  <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                                )}
                                <Typography
                                  variant="body2"
                                  color={revenueChange >= 0 ? 'success.main' : 'error.main'}
                                >
                                  {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AdminReports; 