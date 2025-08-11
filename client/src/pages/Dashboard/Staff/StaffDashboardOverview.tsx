import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, List, ListItem, ListItemText, Divider, Stack, LinearProgress, Chip, Alert, Button } from '@mui/material';
import { LocalShipping, Inventory, TrendingUp, Assessment, Add } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../config/axios';
import StaffNavigation from '../../../components/Layout/StaffNavigation';

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

interface TopCustomerItem {
  customerId: string;
  name: string;
  email: string;
  totalRevenue: number;
  rentalCount: number;
}

const StaffDashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RentalStatsResponse | null>(null);
  const [topProducts, setTopProducts] = useState<ProductPopularityItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerItem[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }), []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, prodRes, custRes] = await Promise.all([
          api.get<RentalStatsResponse>('/reports/rental-stats'),
          api.get<ProductPopularityItem[]>('/reports/product-popularity'),
          api.get<TopCustomerItem[]>('/reports/top-customers'),
        ]);
        if (!isMounted) return;
        setStats(statsRes.data);
        setTopProducts(prodRes.data);
        setTopCustomers(custRes.data);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load overview');
      } finally {
        if (!isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <StaffNavigation />
      
      {/* Welcome Message */}
      {location.state?.message && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {location.state.message}
        </Alert>
      )}
      
      <Typography variant="h5" sx={{ mb: 2 }}>Dashboard Overview</Typography>
      {error && <Chip color="error" label={error} sx={{ mb: 2 }} />}
      
      {/* Quick Access Section */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1e293b' }}>
          Quick Access - Rental Management
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/rentals/navigation')}
              startIcon={<LocalShipping />}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              Rental System
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/rentals/order-form')}
              startIcon={<Inventory />}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              Manage Orders
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/rentals/new')}
              startIcon={<Add />}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              New Rental
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/dashboard/rentals')}
              startIcon={<Assessment />}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              Rental Reports
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats?.activeRentals ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Active Rentals</Typography>
              </Box>
              <Avatar><LocalShipping /></Avatar>
            </Stack>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats?.totalRentals ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Total Rentals</Typography>
              </Box>
              <Avatar><Inventory /></Avatar>
            </Stack>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={700}>{currency.format(stats?.totalRevenue ?? 0)}</Typography>
                <Typography variant="body2" color="text.secondary">Revenue (Completed)</Typography>
              </Box>
              <Avatar><TrendingUp /></Avatar>
            </Stack>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats?.completedRentals ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Completed Rentals</Typography>
              </Box>
              <Avatar><Assessment /></Avatar>
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Top Products</Typography>
            <List dense>
              {topProducts.slice(0, 8).map(p => (
                <React.Fragment key={p.productId}>
                  <ListItem>
                    <ListItemText primary={p.productName} secondary={`SKU: ${p.sku} · Qty: ${p.totalQuantity} · Rentals: ${p.rentalCount}`} />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
              {topProducts.length === 0 && <ListItem><ListItemText primary="No product data" /></ListItem>}
            </List>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Top Customers</Typography>
            <List dense>
              {topCustomers.slice(0, 8).map(c => (
                <React.Fragment key={c.customerId}>
                  <ListItem>
                    <ListItemText primary={c.name} secondary={`${c.email} · Revenue: ${currency.format(c.totalRevenue)} · Rentals: ${c.rentalCount}`} />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
              {topCustomers.length === 0 && <ListItem><ListItemText primary="No customer data" /></ListItem>}
            </List>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffDashboardOverview; 