const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
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
  body('scheduledAt').isISO8601(),
  body('address').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { rentalId, type, scheduledAt, address, contactName, contactPhone, notes } = req.body;
    
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
    }
    
    const delivery = await prisma.delivery.create({
      data: {
        rentalId,
        type,
        scheduledAt: new Date(scheduledAt),
        address,
        contactName,
        contactPhone,
        notes
      },
      include: {
        rental: {
          include: {
            customer: true
          }
        }
      }
    });
    
    res.status(201).json(delivery);
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
});

module.exports = router; 