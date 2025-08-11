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
  Alert
} from '@mui/material';
import {
  Receipt,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { getInvoiceStatusColor, getInvoiceStatusLabel } from '../utils/invoiceStatusUtils';
import api from '../config/axios';

interface InvoiceStatusStats {
  fullyInvoicedRentals: number;
  nothingToInvoiceRentals: number;
  toInvoiceRentals: number;
  totalRentals: number;
}

interface Rental {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  invoiceStatus: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const AdminInvoiceStatusDashboard: React.FC = () => {
  const [stats, setStats] = useState<InvoiceStatusStats | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedStatus !== 'all') {
      loadRentalsByStatus(selectedStatus);
    } else {
      setRentals([]);
    }
  }, [selectedStatus]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/rentals/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error loading invoice status stats:', error);
      setError(error.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadRentalsByStatus = async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/admin/rentals/invoice-status/${status}`);
      setRentals(response.data.rentals);
    } catch (error: any) {
      console.error('Error loading rentals by invoice status:', error);
      setError(error.response?.data?.error || 'Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FULLY_INVOICED':
        return <CheckCircle color="success" />;
      case 'TO_INVOICE':
        return <Warning color="warning" />;
      case 'NOTHING_TO_INVOICE':
        return <Info color="info" />;
      default:
        return <Info color="info" />;
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Invoice Status Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle color="success" />
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Fully Invoiced
                  </Typography>
                  <Typography variant="h4">
                    {stats?.fullyInvoicedRentals || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning color="warning" />
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    To Invoice
                  </Typography>
                  <Typography variant="h4">
                    {stats?.toInvoiceRentals || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Info color="info" />
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Nothing to Invoice
                  </Typography>
                  <Typography variant="h4">
                    {stats?.nothingToInvoiceRentals || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Receipt color="primary" />
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Rentals
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalRentals || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Table */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6">Filter by Invoice Status</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Invoice Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Invoice Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="FULLY_INVOICED">Fully Invoiced</MenuItem>
              <MenuItem value="TO_INVOICE">To Invoice</MenuItem>
              <MenuItem value="NOTHING_TO_INVOICE">Nothing to Invoice</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {selectedStatus !== 'all' && rentals.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Rental Status</TableCell>
                  <TableCell>Invoice Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow key={rental.id} hover>
                    <TableCell>{rental.orderNumber}</TableCell>
                    <TableCell>{rental.customerName}</TableCell>
                    <TableCell>
                      <Chip
                        label={rental.status}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getInvoiceStatusLabel(rental.invoiceStatus)}
                        color={getInvoiceStatusColor(rental.invoiceStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${rental.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(rental.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(rental.endDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedStatus !== 'all' && rentals.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No rentals found with this invoice status
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminInvoiceStatusDashboard; 