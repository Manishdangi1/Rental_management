import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import StaffNavigation from '../../../components/Layout/StaffNavigation';

const StaffQuotationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/reports/quotations?limit=50');
        if (!isMounted) return;
        setItems(res.data || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load quotations');
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
      <Typography variant="h5" sx={{ mb: 2 }}>Quotations</Typography>
      {loading && <LinearProgress />}
      {error && <Chip color="error" label={error} sx={{ mt: 2 }} />}

      {!loading && (
        <Card>
          <CardContent>
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
                  <ListItemText primary="No quotations found" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StaffQuotationsPage; 