const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all rentals (with pagination and filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    
    const rentals = await prisma.rental.findMany({
      where,
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
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.rental.count({ where });
    
    res.json({
      rentals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Get rental by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                description: true
              }
            }
          }
        },
        deliveries: true,
        payments: true
      }
    });
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    
    res.json(rental);
  } catch (error) {
    console.error('Error fetching rental:', error);
    res.status(500).json({ error: 'Failed to fetch rental' });
  }
});

// Create new rental
router.post('/', [
  authenticateToken,
  body('customerId').isString().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('items').isArray().notEmpty(),
  body('pickupAddress').optional().isString(),
  body('returnAddress').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { customerId, startDate, endDate, items, pickupAddress, returnAddress, notes } = req.body;
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.unitPrice;
    }
    
    const rental = await prisma.rental.create({
      data: {
        customerId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount,
        pickupAddress,
        returnAddress,
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    res.status(201).json(rental);
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ error: 'Failed to create rental' });
  }
});

// Update rental status
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const rental = await prisma.rental.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    res.json(rental);
  } catch (error) {
    console.error('Error updating rental status:', error);
    res.status(500).json({ error: 'Failed to update rental status' });
  }
});

module.exports = router; 