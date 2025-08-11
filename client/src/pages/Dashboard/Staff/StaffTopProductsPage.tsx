import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, List, ListItem, ListItemText } from '@mui/material';
import api from '../../../config/axios';
import StaffNavigation from '../../../components/Layout/StaffNavigation';

interface ProductPopularityItem { productId: string; productName: string; sku: string; totalQuantity: number; rentalCount: number; }

const StaffTopProductsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductPopularityItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ProductPopularityItem[]>('/reports/product-popularity');
        if (!isMounted) return;
        setItems(res.data || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load products');
      } finally {
        if (!isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <StaffNavigation />
      <Typography variant="h5" sx={{ mb: 2 }}>Top Products</Typography>
      {loading && <LinearProgress />}
      {error && <Chip color="error" label={error} sx={{ mt: 2 }} />}

      {!loading && (
        <Card>
          <CardContent>
            <List dense>
              {items.map((p) => (
                <ListItem key={p.productId}>
                  <ListItemText primary={p.productName} secondary={`SKU: ${p.sku} · Qty: ${p.totalQuantity} · Rentals: ${p.rentalCount}`} />
                </ListItem>
              ))}
              {items.length === 0 && (
                <ListItem>
                  <ListItemText primary="No product data" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StaffTopProductsPage; 