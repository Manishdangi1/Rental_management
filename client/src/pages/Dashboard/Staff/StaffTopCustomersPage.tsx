import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import StaffNavigation from '../../../components/Layout/StaffNavigation';

interface TopCustomerItem { customerId: string; name: string; email: string; totalRevenue: number; rentalCount: number; }

const StaffTopCustomersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<TopCustomerItem[]>([]);
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }), []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<TopCustomerItem[]>('/api/reports/top-customers');
        if (!isMounted) return;
        setItems(res.data || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load top customers');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <StaffNavigation />
      <Typography variant="h5" sx={{ mb: 2 }}>Top Customers</Typography>
      {loading && <LinearProgress />}
      {error && <Chip color="error" label={error} sx={{ mt: 2 }} />}

      {!loading && (
        <Card>
          <CardContent>
            <List dense>
              {items.map((c) => (
                <ListItem key={c.customerId}>
                  <ListItemText primary={c.name} secondary={`${c.email} · Revenue: ${currency.format(c.totalRevenue)} · Rentals: ${c.rentalCount}`} />
                </ListItem>
              ))}
              {items.length === 0 && (
                <ListItem>
                  <ListItemText primary="No customer data" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StaffTopCustomersPage; 