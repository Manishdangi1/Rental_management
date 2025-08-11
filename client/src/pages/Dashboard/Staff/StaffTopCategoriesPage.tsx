import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import StaffNavigation from '../../../components/Layout/StaffNavigation';

interface CategoryPopularityItem { categoryId: string; categoryName: string; totalQuantity: number; }

const StaffTopCategoriesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CategoryPopularityItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<CategoryPopularityItem[]>('/api/reports/category-popularity');
        if (!isMounted) return;
        setItems(res.data || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || 'Failed to load categories');
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
      <Typography variant="h5" sx={{ mb: 2 }}>Top Product Categories</Typography>
      {loading && <LinearProgress />}
      {error && <Chip color="error" label={error} sx={{ mt: 2 }} />}

      {!loading && (
        <Card>
          <CardContent>
            <List dense>
              {items.map((c) => (
                <ListItem key={c.categoryId}>
                  <ListItemText primary={c.categoryName} secondary={`Total Qty: ${c.totalQuantity}`} />
                </ListItem>
              ))}
              {items.length === 0 && (
                <ListItem>
                  <ListItemText primary="No category data" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StaffTopCategoriesPage; 