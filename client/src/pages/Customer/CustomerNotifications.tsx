import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Badge,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Email,
  Sms,
  PushPin,
  Delete,
  Visibility,
  Settings,
  Info,
  Warning,
  Error,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'REMINDER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  category: 'RENTAL' | 'DELIVERY' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION';
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  rentalReminders: boolean;
  deliveryUpdates: boolean;
  paymentReminders: boolean;
  promotionalOffers: boolean;
  systemUpdates: boolean;
}

const CustomerNotifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    rentalReminders: true,
    deliveryUpdates: true,
    paymentReminders: true,
    promotionalOffers: false,
    systemUpdates: true
  });

  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      setError(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const response = await api.get('/notifications/settings');
      setSettings(response.data.settings || settings);
    } catch (error: any) {
      console.error('Error loading notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'READ' as const, readAt: new Date().toISOString() }))
      );
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error: any) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateNotificationSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const response = await api.patch('/notifications/settings', newSettings);
      setSettings(response.data.settings);
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'info';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      case 'SUCCESS': return 'success';
      case 'REMINDER': return 'primary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INFO': return <Info />;
      case 'WARNING': return <Warning />;
      case 'ERROR': return <Error />;
      case 'SUCCESS': return <CheckCircle />;
      case 'REMINDER': return <Schedule />;
      default: return <Notifications />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'default';
      case 'MEDIUM': return 'info';
      case 'HIGH': return 'warning';
      case 'URGENT': return 'error';
      default: return 'default';
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply status filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => n.status === 'UNREAD');
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.status === 'READ');
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id);
    }
  };

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setDetailDialogOpen(false);
  };

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay updated with your rental activities and important messages
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Notifications />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {(notifications || []).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Notifications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <NotificationsActive />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {unreadCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unread
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {(notifications || []).filter(n => n.status === 'READ').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Read
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Settings />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {Object.values(settings).filter(Boolean).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Channels
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Notifications sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filter}
                label="Filter by Status"
                onChange={(e: SelectChangeEvent) => setFilter(e.target.value as any)}
              >
                <MenuItem value="all">All ({(notifications || []).length})</MenuItem>
                <MenuItem value="unread">Unread ({unreadCount})</MenuItem>
                <MenuItem value="read">Read ({(notifications || []).filter(n => n.status === 'READ').length})</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All as Read
              </Button>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setSettingsDialogOpen(true)}
              >
                Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications List */}
      <Grid container spacing={3}>
        {getFilteredNotifications().map((notification) => (
          <Grid item xs={12} key={notification.id}>
            <Card 
              sx={{ 
                borderLeft: 4, 
                borderColor: `${getTypeColor(notification.type)}.main`,
                opacity: notification.status === 'READ' ? 0.7 : 1
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  {/* Notification Icon and Type */}
                  <Grid item xs={12} sm={1}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: `${getTypeColor(notification.type)}.main`,
                          width: 48,
                          height: 48
                        }}
                      >
                        {getTypeIcon(notification.type)}
                      </Avatar>
                      <Chip
                        label={notification.priority}
                        color={getPriorityColor(notification.priority) as any}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>

                  {/* Notification Content */}
                  <Grid item xs={12} sm={8}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={notification.category}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={notification.status}
                          color={notification.status === 'UNREAD' ? 'primary' : 'default'}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Actions */}
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewNotification(notification)}
                        fullWidth
                      >
                        View Details
                      </Button>
                      {notification.actionUrl && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleActionClick(notification)}
                          fullWidth
                        >
                          {notification.actionText || 'Take Action'}
                        </Button>
                      )}
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Notifications */}
      {getFilteredNotifications().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {filter === 'all' ? '' : filter} notifications found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'unread' 
              ? 'You have no unread notifications.'
              : filter === 'read'
              ? 'You have no read notifications yet.'
              : 'You have no notifications yet.'
            }
          </Typography>
        </Box>
      )}

      {/* Notification Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getTypeIcon(selectedNotification.type)}
                <Typography variant="h6">
                  {selectedNotification.title}
                </Typography>
                <Chip
                  label={selectedNotification.type}
                  color={getTypeColor(selectedNotification.type) as any}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedNotification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={selectedNotification.category}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={selectedNotification.priority}
                        color={getPriorityColor(selectedNotification.priority) as any}
                        size="small"
                      />
                      <Chip
                        label={selectedNotification.status}
                        color={selectedNotification.status === 'UNREAD' ? 'primary' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Notification Details
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Created:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
                    </Typography>
                    {selectedNotification.readAt && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Read:</strong> {new Date(selectedNotification.readAt).toLocaleString()}
                      </Typography>
                    )}
                    {selectedNotification.metadata && (
                      <Typography variant="body2">
                        <strong>Additional Info:</strong> {JSON.stringify(selectedNotification.metadata, null, 2)}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {selectedNotification.actionUrl && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                      <Typography variant="h6" gutterBottom>
                        Action Required
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        This notification requires your attention.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => handleActionClick(selectedNotification)}
                        fullWidth
                      >
                        {selectedNotification.actionText || 'Take Action'}
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              {selectedNotification.status === 'UNREAD' && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    markAsRead(selectedNotification.id);
                    setDetailDialogOpen(false);
                  }}
                >
                  Mark as Read
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Settings />
            <Typography variant="h6">
              Notification Settings
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notification Channels
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email}
                        onChange={(e) => {
                          const newSettings = { ...settings, email: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sms}
                        onChange={(e) => {
                          const newSettings = { ...settings, sms: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.push}
                        onChange={(e) => {
                          const newSettings = { ...settings, push: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notification Types
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.rentalReminders}
                        onChange={(e) => {
                          const newSettings = { ...settings, rentalReminders: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="Rental Reminders"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.deliveryUpdates}
                        onChange={(e) => {
                          const newSettings = { ...settings, deliveryUpdates: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="Delivery Updates"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.paymentReminders}
                        onChange={(e) => {
                          const newSettings = { ...settings, paymentReminders: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="Payment Reminders"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.promotionalOffers}
                        onChange={(e) => {
                          const newSettings = { ...settings, promotionalOffers: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="Promotional Offers"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.systemUpdates}
                        onChange={(e) => {
                          const newSettings = { ...settings, systemUpdates: e.target.checked };
                          setSettings(newSettings);
                          updateNotificationSettings(newSettings);
                        }}
                      />
                    }
                    label="System Updates"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerNotifications; 