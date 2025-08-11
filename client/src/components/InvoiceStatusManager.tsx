import React, { useState } from 'react';
import {
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { getInvoiceStatusColor, getInvoiceStatusLabel, getInvoiceStatusDescription, canUpdateInvoiceStatus, getNextInvoiceStatus } from '../utils/invoiceStatusUtils';
import api from '../config/axios';

interface InvoiceStatusManagerProps {
  rentalId: string;
  itemId?: string; // Optional - if provided, manages item-level status
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
  isAdmin?: boolean;
}

const InvoiceStatusManager: React.FC<InvoiceStatusManagerProps> = ({
  rentalId,
  itemId,
  currentStatus,
  onStatusUpdate,
  isAdmin = false
}) => {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewStatus(currentStatus);
    setError(null);
  };

  const handleStatusUpdate = async () => {
    if (!canUpdateInvoiceStatus(currentStatus, newStatus)) {
      setError('Invalid status transition');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let endpoint: string;
      if (itemId) {
        endpoint = `/api/rentals/${rentalId}/items/${itemId}/invoice-status`;
      } else {
        endpoint = `/api/rentals/${rentalId}/invoice-status`;
      }

      await api.patch(endpoint, { invoiceStatus: newStatus });
      
      onStatusUpdate(newStatus);
      handleClose();
    } catch (error: any) {
      console.error('Error updating invoice status:', error);
      setError(error.response?.data?.error || 'Failed to update invoice status');
    } finally {
      setLoading(false);
    }
  };

  const nextStatuses = getNextInvoiceStatus(currentStatus);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={getInvoiceStatusLabel(currentStatus)}
          color={getInvoiceStatusColor(currentStatus) as any}
          size="small"
          title={getInvoiceStatusDescription(currentStatus)}
        />
        {isAdmin && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={handleOpen}
            variant="outlined"
          >
            Update
          </Button>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Invoice Status
          {itemId && (
            <Typography variant="body2" color="text.secondary">
              for Rental Item
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Status: {getInvoiceStatusLabel(currentStatus)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getInvoiceStatusDescription(currentStatus)}
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {nextStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {getInvoiceStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {newStatus !== currentStatus && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                New Status: {getInvoiceStatusLabel(newStatus)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getInvoiceStatusDescription(newStatus)}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={loading || newStatus === currentStatus}
          >
            {loading ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceStatusManager; 