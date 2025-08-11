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
  body('totalAmount').isFloat({ min: 0 }),
  body('securityDeposit').optional().isFloat({ min: 0 }),
  body('items').isArray().notEmpty(),
  body('pickupAddress').optional().isString(),
  body('returnAddress').optional().isString(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }
    
    const { 
      customerId, 
      startDate, 
      endDate, 
      totalAmount, 
      securityDeposit = 0,
      items, 
      pickupAddress, 
      returnAddress, 
      notes 
    } = req.body;
    
    // Validate that the user is creating a rental for themselves or has admin privileges
    if (req.user.id !== customerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only create rentals for yourself' 
      });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ 
        error: 'Invalid dates',
        message: 'End date must be after start date' 
      });
    }
    
    // Check product availability for the selected dates
    for (const item of items) {
      const existingRentals = await prisma.rental.findMany({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
          },
          items: {
            some: {
              productId: item.productId
            }
          },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start }
            }
          ]
        },
        include: {
          items: {
            where: {
              productId: item.productId
            }
          }
        }
      });
      
      // Calculate total quantity already rented for this product during the period
      let totalRented = 0;
      existingRentals.forEach(rental => {
        rental.items.forEach(rentalItem => {
          totalRented += rentalItem.quantity;
        });
      });
      
      // Check if requested quantity is available
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      
      if (!product) {
        return res.status(400).json({ 
          error: 'Product not found',
          message: `Product with ID ${item.productId} does not exist` 
        });
      }
      
      if (product.availableQuantity - totalRented < item.quantity) {
        return res.status(400).json({ 
          error: 'Insufficient quantity',
          message: `Only ${Math.max(0, product.availableQuantity - totalRented)} units of ${product.name} are available for the selected dates` 
        });
      }
    }
    
    const rental = await prisma.rental.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        securityDeposit,
        pickupAddress,
        returnAddress,
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
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
                sku: true,
                description: true
              }
            }
          }
        }
      }
    });
    
    res.status(201).json({
      message: 'Rental created successfully',
      rental
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ 
      error: 'Failed to create rental',
      message: 'Internal server error' 
    });
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