import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import StaffNavigation from '../../../components/Layout/StaffNavigation';

const StaffRentalsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/rentals?limit=50');
        if (!isMounted) return;
        setItems(res.data.rentals || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load rentals');
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
      <Typography variant="h5" sx={{ mb: 2 }}>Rentals</Typography>
      {loading && <LinearProgress />}
      {error && <Chip color="error" label={error} sx={{ mt: 2 }} />}

      {!loading && (
        <Card>
          <CardContent>
            <List dense>
              {items.map((r: any) => (
                <ListItem key={r.id}>
                  <ListItemText
                    primary={`Rental #${r.id} · ${r.customer?.firstName || ''} ${r.customer?.lastName || ''}`}
                    secondary={`Status: ${r.status} · Items: ${r.items?.length || 0} · Total: ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(r.totalAmount || 0)}`}
                  />
                </ListItem>
              ))}
              {items.length === 0 && (
                <ListItem>
                  <ListItemText primary="No rentals found" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StaffRentalsPage; 