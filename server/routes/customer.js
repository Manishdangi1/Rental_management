const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all customer routes
router.use(authenticateToken);
router.use(requireRole(['CUSTOMER']));

// Get customer deliveries
router.get('/deliveries', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const deliveries = await prisma.delivery.findMany({
      where: {
        rental: {
          customerId: userId
        }
      },
      include: {
        rental: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      rentalId: delivery.rentalId,
      orderNumber: delivery.rental?.id || 'N/A',
      status: delivery.status,
      type: delivery.type,
      scheduledDate: delivery.scheduledAt.toISOString().split('T')[0],
      scheduledTime: delivery.scheduledAt.toTimeString().split(' ')[0],
      actualDate: delivery.completedAt ? delivery.completedAt.toISOString().split('T')[0] : undefined,
      actualTime: delivery.completedAt ? delivery.completedAt.toTimeString().split(' ')[0] : undefined,
      driver: {
        name: 'Driver Name', // Placeholder - not in current schema
        phone: 'N/A',
        vehicle: 'N/A',
        licensePlate: 'N/A'
      },
      address: {
        street: delivery.address || 'N/A',
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        type: 'HOME'
      },
      items: delivery.rental?.items?.map(item => ({
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity || 1,
        image: item.product?.images?.[0]
      })) || [],
      specialInstructions: delivery.notes,
      estimatedDuration: '2-4 hours', // Placeholder
      trackingNumber: delivery.id // Using delivery ID as tracking number
    }));

    res.json(transformedDeliveries);
  } catch (error) {
    console.error('Error fetching customer deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// Get customer invoices
router.get('/invoices', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId: userId
      },
      include: {
        rental: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        },
        customer: true
      },
      orderBy: {
        issueDate: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      rentalId: invoice.rentalId,
      orderNumber: invoice.rentalId, // Using rental ID as order number
      status: invoice.status,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidDate: invoice.paidAt?.toISOString(),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      discount: invoice.discount,
      total: invoice.total,
      currency: invoice.currency,
      paymentMethod: invoice.paymentMethod,
      items: invoice.rental?.items?.map(item => ({
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity || 1,
        unitPrice: item.product?.basePrice || 0,
        totalPrice: (item.product?.basePrice || 0) * (item.quantity || 1),
        description: item.product?.description
      })) || [],
      customer: {
        name: `${invoice.customer?.firstName || ''} ${invoice.customer?.lastName || ''}`.trim() || 'N/A',
        email: invoice.customer?.email || 'N/A',
        address: invoice.customer?.address || 'N/A'
      },
      notes: invoice.notes,
      terms: invoice.terms
    }));

    res.json(transformedInvoices);
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get customer payments
router.get('/payments', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const payments = await prisma.payment.findMany({
      where: {
        customerId: userId
      },
      include: {
        rental: true,
        users: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      paymentNumber: payment.id, // Using ID as payment number
      invoiceId: payment.rentalId, // Using rental ID as invoice ID
      invoiceNumber: `INV-${payment.rentalId}`, // Generating invoice number
      rentalId: payment.rentalId,
      orderNumber: payment.rentalId, // Using rental ID as order number
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      methodDetails: {
        type: payment.method,
        last4: '****',
        brand: payment.method,
        accountNumber: payment.transactionId,
        bankName: 'N/A'
      },
      transactionId: payment.transactionId,
      authorizationCode: payment.stripeIntentId,
      processedDate: payment.createdAt,
      failureReason: payment.status === 'FAILED' ? 'Payment failed' : undefined,
      refundReason: payment.status === 'REFUNDED' ? 'Refunded' : undefined,
      refundDate: payment.status === 'REFUNDED' ? payment.updatedAt : undefined,
      securityDeposit: false,
      description: payment.description || `Payment for rental ${payment.rentalId}`,
      metadata: {}
    }));

    res.json(transformedPayments);
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get customer notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: 'MEDIUM', // Default priority
      status: notification.isRead ? 'READ' : 'UNREAD',
      category: notification.rentalId ? 'RENTAL' : 'SYSTEM',
      createdAt: notification.sentAt.toISOString(),
      readAt: notification.readAt?.toISOString(),
      actionUrl: notification.rentalId ? `/rentals/${notification.rentalId}` : undefined,
      actionText: notification.rentalId ? 'View Rental' : undefined,
      metadata: {}
    }));

    res.json(transformedNotifications);
  } catch (error) {
    console.error('Error fetching customer notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get customer notification settings
router.get('/notification-settings', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Return default settings since notificationSettings table doesn't exist
    const defaultSettings = {
      email: true,
      sms: false,
      push: true,
      rentalReminders: true,
      deliveryUpdates: true,
      paymentReminders: true,
      promotionalOffers: false,
      systemUpdates: true
    };

    res.json({ settings: defaultSettings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update customer notification settings
router.patch('/notification-settings', [
  body('email').optional().isBoolean(),
  body('sms').optional().isBoolean(),
  body('push').optional().isBoolean(),
  body('rentalReminders').optional().isBoolean(),
  body('deliveryUpdates').optional().isBoolean(),
  body('paymentReminders').optional().isBoolean(),
  body('promotionalOffers').optional().isBoolean(),
  body('systemUpdates').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    
    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: req.body,
      create: {
        userId,
        ...req.body
      }
    });

    res.json({ settings });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ notification: updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/notifications/mark-all-read', async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router; 