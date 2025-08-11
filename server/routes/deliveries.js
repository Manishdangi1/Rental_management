const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all deliveries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany({
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

// Create new delivery
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