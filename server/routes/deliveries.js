const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all deliveries (Admin only, or customer can see their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = {};
    
    // If user is not admin, they can only see their own deliveries
    if (req.user.role !== 'ADMIN') {
      where.rental = {
        customerId: req.user.id
      };
    }
    
    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        rental: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// Create new delivery (Admin only, or customer can create for their own rentals)
router.post('/', [
  authenticateToken,
  body('rentalId').isString().notEmpty(),
  body('type').isIn(['PICKUP', 'RETURN']),
  body('scheduledAt').notEmpty().withMessage('Scheduled date is required'),
  body('address').isString().notEmpty()
], async (req, res) => {
  try {
    console.log('Creating delivery with data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { rentalId, type, scheduledAt, address, contactName, contactPhone, notes } = req.body;
    
    console.log('Received scheduledAt:', scheduledAt, 'Type:', typeof scheduledAt);
    
    // Check if user has access to this rental
    if (req.user.role !== 'ADMIN') {
      const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        select: { customerId: true }
      });
      
      if (!rental || rental.customerId !== req.user.id) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You can only create deliveries for your own rentals' 
        });
      }
    } else {
      console.log('User is admin, skipping rental access check');
    }
    
    // Parse the scheduled date
    let parsedScheduledAt;
    try {
      // Handle both ISO string and HTML datetime-local format
      if (typeof scheduledAt === 'string') {
        // If it's already an ISO string, use it directly
        if (scheduledAt.includes('T') && scheduledAt.includes('Z')) {
          parsedScheduledAt = new Date(scheduledAt);
        } else {
          // Handle HTML datetime-local format (e.g., "2024-01-15T10:30")
          parsedScheduledAt = new Date(scheduledAt);
        }
      } else {
        parsedScheduledAt = new Date(scheduledAt);
      }
      
      if (isNaN(parsedScheduledAt.getTime())) {
        console.error('Invalid date format received:', scheduledAt);
        return res.status(400).json({ error: 'Invalid scheduled date format' });
      }
      
      console.log('Successfully parsed date:', scheduledAt, 'to:', parsedScheduledAt);
    } catch (error) {
      console.error('Error parsing scheduled date:', error);
      return res.status(400).json({ error: 'Invalid scheduled date format' });
    }
    
    console.log('Creating delivery in database with data:', {
      rentalId,
      type,
      scheduledAt: parsedScheduledAt,
      address,
      contactName,
      contactPhone,
      notes
    });
    
    const delivery = await prisma.delivery.create({
      data: {
        rentalId,
        type,
        scheduledAt: parsedScheduledAt,
        address,
        contactName,
        contactPhone,
        notes
      },
      include: {
        rental: {
          include: {
            customer: true,
            items: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    console.log('Delivery created successfully:', delivery);
    res.status(201).json(delivery);
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
});

// Update delivery status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Check if user has access to this delivery
    if (req.user.role !== 'ADMIN') {
      const delivery = await prisma.delivery.findUnique({
        where: { id },
        include: {
          rental: {
            select: { customerId: true }
          }
        }
      });
      
      if (!delivery || delivery.rental.customerId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: { 
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      },
      include: {
        rental: {
          include: {
            customer: true,
            items: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    res.json(updatedDelivery);
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

// Bulk update delivery statuses
router.patch('/bulk', authenticateToken, async (req, res) => {
  try {
    const { deliveryIds, action } = req.body;
    
    if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
      return res.status(400).json({ error: 'Invalid delivery IDs' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let updateData = {};
    
    switch (action) {
      case 'mark_in_transit':
        updateData = { status: 'IN_TRANSIT' };
        break;
      case 'mark_completed':
        updateData = { 
          status: 'COMPLETED',
          completedAt: new Date()
        };
        break;
      case 'mark_cancelled':
        updateData = { status: 'CANCELLED' };
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    const updatedDeliveries = await prisma.delivery.updateMany({
      where: {
        id: { in: deliveryIds }
      },
      data: updateData
    });
    
    res.json({ 
      message: `Updated ${updatedDeliveries.count} deliveries`,
      count: updatedDeliveries.count 
    });
  } catch (error) {
    console.error('Error performing bulk delivery update:', error);
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
});

module.exports = router; 