import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  LinearProgress,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  LocalShipping,
  Inventory,
  TrendingUp,
  Person,
  Category as CategoryIcon,
  Assessment,
  ListAlt
} from '@mui/icons-material';
import api from '../../config/axios';

interface RentalStatsResponse {
  totalRentals: number;
  activeRentals: number;
  completedRentals: number;
  totalRevenue: number;
}

interface ProductPopularityItem {
  productId: string;
  productName: string;
  sku: string;
  totalQuantity: number;
  rentalCount: number;
}

interface CategoryPopularityItem {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
}

interface TopCustomerItem {
  customerId: string;
  name: string;
  email: string;
  totalRevenue: number;
  rentalCount: number;
}

interface RevenueTrendItem {
  month: string; // YYYY-MM
  total: number;
}

const EndUserDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<RentalStatsResponse | null>(null);
  const [topProducts, setTopProducts] = useState<ProductPopularityItem[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryPopularityItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerItem[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => setTabIndex(newValue);

  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }), []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, prodRes, catRes, custRes, revRes] = await Promise.all([
          api.get<RentalStatsResponse>('/reports/rental-stats'),
          api.get<ProductPopularityItem[]>('/reports/product-popularity'),
          api.get<CategoryPopularityItem[]>('/reports/category-popularity'),
          api.get<TopCustomerItem[]>('/reports/top-customers'),
          api.get<RevenueTrendItem[]>('/reports/revenue-trend?months=6'),
        ]);
        if (!isMounted) return;
        setStats(statsRes.data);
        setTopProducts(prodRes.data);
        setTopCategories(catRes.data);
        setTopCustomers(custRes.data);
        setRevenueTrend(revRes.data);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        if (!isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Staff Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview and insights for staff members
        </Typography>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={handleChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Dashboard" icon={<Assessment fontSize="small" />} iconPosition="start" />
        <Tab label="Quotations" icon={<ListAlt fontSize="small" />} iconPosition="start" />
        <Tab label="Rentals" icon={<LocalShipping fontSize="small" />} iconPosition="start" />
        <Tab label="Revenue" icon={<TrendingUp fontSize="small" />} iconPosition="start" />
        <Tab label="Top Categories" icon={<CategoryIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Top Products" icon={<Inventory fontSize="small" />} iconPosition="start" />
        <Tab label="Top Customers" icon={<Person fontSize="small" />} iconPosition="start" />
      </Tabs>

      {loading && (
        <Box sx={{ py: 6 }}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2 }}>
          <Chip color="error" label={error} />
        </Box>
      )}

      {/* Tab: Dashboard - summary cards */}
      {!loading && tabIndex === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {stats?.activeRentals ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Active Rentals</Typography>
                  </Box>
                  <Avatar>
                    <LocalShipping />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {stats?.totalRentals ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Rentals</Typography>
                  </Box>
                  <Avatar>
                    <Inventory />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {currency.format(stats?.totalRevenue ?? 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Revenue (Completed)</Typography>
                  </Box>
                  <Avatar>
                    <TrendingUp />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {stats?.completedRentals ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Completed Rentals</Typography>
                  </Box>
                  <Avatar>
                    <Assessment />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Top products snapshot */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Top Products</Typography>
                <List dense>
                  {topProducts.slice(0, 5).map(item => (
                    <React.Fragment key={item.productId}>
                      <ListItem>
                        <ListItemText
                          primary={item.productName}
                          secondary={`SKU: ${item.sku} · Qty: ${item.totalQuantity} · Rentals: ${item.rentalCount}`}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                  {topProducts.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No product data yet" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Top customers snapshot */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Top Customers</Typography>
                <List dense>
                  {topCustomers.slice(0, 5).map(item => (
                    <React.Fragment key={item.customerId}>
                      <ListItem>
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.email} · Revenue: ${currency.format(item.totalRevenue)} · Rentals: ${item.rentalCount}`}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                  {topCustomers.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No customer data yet" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab: Quotations - placeholder wired to backend once model exists */}
      {!loading && tabIndex === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Quotations</Typography>
            <QuotationsList />
          </CardContent>
        </Card>
      )}

      {/* Tab: Rentals - list latest rentals */}
      {!loading && tabIndex === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Rentals</Typography>
            <RentalsList />
          </CardContent>
        </Card>
      )}

      {/* Tab: Revenue - simple trend list */}
      {!loading && tabIndex === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Revenue Trend (last 6 months)</Typography>
            <List dense>
              {revenueTrend.map(row => (
                <ListItem key={row.month}>
                  <ListItemText primary={row.month} secondary={currency.format(row.total)} />
                </ListItem>
              ))}
              {revenueTrend.length === 0 && (
                <ListItem>
                  <ListItemText primary="No revenue data yet" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Tab: Top Categories */}
      {!loading && tabIndex === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Product Categories</Typography>
            <List dense>
              {topCategories.map(cat => (
                <ListItem key={cat.categoryId}>
                  <ListItemText primary={cat.categoryName} secondary={`Total Qty: ${cat.totalQuantity}`} />
                </ListItem>
              ))}
              {topCategories.length === 0 && (
                <ListItem>
                  <ListItemText primary="No category data yet" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Tab: Top Products */}
      {!loading && tabIndex === 5 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Products</Typography>
            <List dense>
              {topProducts.map(item => (
                <ListItem key={item.productId}>
                  <ListItemText
                    primary={item.productName}
                    secondary={`SKU: ${item.sku} · Qty: ${item.totalQuantity} · Rentals: ${item.rentalCount}`}
                  />
                </ListItem>
              ))}
              {topProducts.length === 0 && (
                <ListItem>
                  <ListItemText primary="No product data yet" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Tab: Top Customers */}
      {!loading && tabIndex === 6 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Customers</Typography>
            <List dense>
              {topCustomers.map(item => (
                <ListItem key={item.customerId}>
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.email} · Revenue: ${currency.format(item.totalRevenue)} · Rentals: ${item.rentalCount}`}
                  />
                </ListItem>
              ))}
              {topCustomers.length === 0 && (
                <ListItem>
                  <ListItemText primary="No customer data yet" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Rentals list component (uses existing rentals endpoint)
const RentalsList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/rentals?limit=10');
        if (!isMounted) return;
        setItems(res.data.rentals || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load rentals');
      } finally {
        if (!isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <LinearProgress />;
  if (error) return <Chip color="error" label={error} />;

  return (
    <List dense>
      {items.map((rental: any) => (
        <ListItem key={rental.id}>
          <ListItemText
            primary={`Rental #${rental.id} · ${rental.customer?.firstName || ''} ${rental.customer?.lastName || ''}`}
            secondary={`Status: ${rental.status} · Items: ${rental.items?.length || 0} · Total: ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(rental.totalAmount || 0)}`}
          />
        </ListItem>
      ))}
      {items.length === 0 && (
        <ListItem>
          <ListItemText primary="No recent rentals" />
        </ListItem>
      )}
    </List>
  );
};

// Quotations list component (uses reports/quotations endpoint)
const QuotationsList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/reports/quotations?limit=20');
        if (!isMounted) return;
        setItems(res.data || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load quotations');
      } finally {
        if (!isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <LinearProgress />;
  if (error) return <Chip color="error" label={error} />;

  return (
    <List dense>
      {items.map((q: any) => (
        <ListItem key={q.id}>
          <ListItemText
            primary={`Quotation ${q.invoiceNumber || q.id} · ${q.customer?.firstName || ''} ${q.customer?.lastName || ''}`}
            secondary={`Status: ${q.status} · Total: ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(q.total || 0)} · Due: ${q.dueDate ? new Date(q.dueDate).toLocaleDateString() : '-'}`}
          />
        </ListItem>
      ))}
      {items.length === 0 && (
        <ListItem>
          <ListItemText primary="No quotations" />
        </ListItem>
      )}
    </List>
  );
};

export default EndUserDashboard; 