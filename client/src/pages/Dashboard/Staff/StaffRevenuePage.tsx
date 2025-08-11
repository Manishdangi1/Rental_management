import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import StaffNavigation from '../../../components/Layout/StaffNavigation';

interface RevenueTrendItem { month: string; total: number; }

const StaffRevenuePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RevenueTrendItem[]>([]);
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }), []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<RevenueTrendItem[]>('/api/reports/revenue-trend?months=12');
        if (!isMounted) return;
        setItems(res.data || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load revenue');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const total = items.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      <StaffNavigation />
      <Typography variant="h5" sx={{ mb: 1 }}>Revenue</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Last 12 months total: {currency.format(total)}</Typography>
      {loading && <LinearProgress />}
      {error && <Chip color="error" label={error} sx={{ mt: 2 }} />}

      {!loading && (
        <Card>
          <CardContent>
            <List dense>
              {items.map((row) => (
                <ListItem key={row.month}>
                  <ListItemText primary={row.month} secondary={currency.format(row.total)} />
                </ListItem>
              ))}
              {items.length === 0 && (
                <ListItem>
                  <ListItemText primary="No revenue data" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StaffRevenuePage; 