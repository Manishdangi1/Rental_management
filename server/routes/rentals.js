const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all rentals (with pagination and filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    
    // If user is not admin, they can only see their own rentals
    if (req.user.role !== 'ADMIN') {
      where.customerId = req.user.id;
    } else if (customerId) {
      // Admin can filter by specific customer
      where.customerId = customerId;
    }
    
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
router.get('/:id', authenticateToken, requireOwnershipOrAdmin('rental'), async (req, res) => {
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
  body('orderNumber').isString().notEmpty(),
  body('customerId').isString().notEmpty(),
  body('customerName').isString().notEmpty(),
  body('status').isIn(['QUOTATION', 'QUOTATION_SENT', 'PICKED_UP', 'RETURNED', 'RESERVED']),
  body('items').isArray().notEmpty(),
  body('subtotal').isFloat({ min: 0 }),
  body('tax').isFloat({ min: 0 }),
  body('totalAmount').isFloat({ min: 0 }),
  body('notes').optional().isString(),
  body('invoiceStatus').optional().isIn(['FULLY_INVOICED', 'NOTHING_TO_INVOICE', 'TO_INVOICE'])
], async (req, res) => {
  try {
    console.log('Received rental creation request:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }
    
    const { 
      orderNumber,
      customerId, 
      customerName,
      status,
      items, 
      subtotal,
      tax,
      totalAmount,
      notes,
      invoiceStatus = 'NOTHING_TO_INVOICE'
    } = req.body;
    
    console.log('Extracted data:', { orderNumber, customerId, customerName, status, subtotal, tax, totalAmount, itemsCount: items?.length, invoiceStatus });
    
    // Validate that the user is creating a rental for themselves or has admin privileges
    if (req.user.id !== customerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only create rentals for yourself' 
      });
    }

    // Check if order number already exists
    const existingOrder = await prisma.rental.findUnique({
      where: { orderNumber }
    });

    if (existingOrder) {
      return res.status(400).json({ 
        error: 'Order number already exists',
        message: 'Please generate a new order number' 
      });
    }
    
    // Create the rental order
    const rental = await prisma.rental.create({
      data: {
        orderNumber,
        customerId,
        customerName,
        status,
        subtotal,
        tax,
        totalAmount,
        notes,
        invoiceStatus,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            startDate: item.startDate ? new Date(item.startDate) : null,
            endDate: item.endDate ? new Date(item.endDate) : null,
            quantity: item.quantity,
            rentalType: item.rentalType,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
            invoiceStatus: item.invoiceStatus || 'NOTHING_TO_INVOICE'
          }))
        }
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log('Rental created successfully:', rental.id);
    
    res.status(201).json({
      message: 'Rental order created successfully',
      rental
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ error: 'Failed to create rental order' });
  }
});

// Update rental status
router.patch('/:id/status', [
  authenticateToken,
  requireOwnershipOrAdmin('rental'),
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

// Update rental order
router.put('/:id', [
  authenticateToken,
  requireOwnershipOrAdmin('rental'),
  body('orderNumber').optional().isString(),
  body('customerName').optional().isString(),
  body('status').optional().isIn(['DRAFT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('items').optional().isArray(),
  body('subtotal').optional().isFloat({ min: 0 }),
  body('tax').optional().isFloat({ min: 0 }),
  body('totalAmount').optional().isFloat({ min: 0 }),
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
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if rental exists
    const existingRental = await prisma.rental.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!existingRental) {
      return res.status(404).json({ error: 'Rental order not found' });
    }
    
    // Check if order number is being changed and if it already exists
    if (updateData.orderNumber && updateData.orderNumber !== existingRental.orderNumber) {
      const duplicateOrder = await prisma.rental.findUnique({
        where: { orderNumber: updateData.orderNumber }
      });
      
      if (duplicateOrder) {
        return res.status(400).json({ 
          error: 'Order number already exists',
          message: 'Please use a different order number' 
        });
      }
    }
    
    // Update the rental order
    const updatedRental = await prisma.rental.update({
      where: { id },
      data: {
        orderNumber: updateData.orderNumber,
        customerName: updateData.customerName,
        status: updateData.status,
        subtotal: updateData.subtotal,
        tax: updateData.tax,
        totalAmount: updateData.totalAmount,
        notes: updateData.notes,
        // Update items if provided
        ...(updateData.items && {
          items: {
            deleteMany: {}, // Delete all existing items
            create: updateData.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              startDate: item.startDate ? new Date(item.startDate) : null,
              endDate: item.endDate ? new Date(item.endDate) : null,
              quantity: item.quantity,
              rentalType: item.rentalType,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes
            }))
          }
        })
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      message: 'Rental order updated successfully',
      rental: updatedRental
    });
  } catch (error) {
    console.error('Error updating rental:', error);
    res.status(500).json({ error: 'Failed to update rental order' });
  }
});

// Delete rental order (Admin only)
router.delete('/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if rental exists
    const existingRental = await prisma.rental.findUnique({
      where: { id }
    });
    
    if (!existingRental) {
      return res.status(404).json({ error: 'Rental order not found' });
    }
    
    // Delete the rental order (this will cascade delete related items)
    await prisma.rental.delete({
      where: { id }
    });
    
    res.json({
      message: 'Rental order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rental:', error);
    res.status(500).json({ error: 'Failed to delete rental order' });
  }
});

// Get rental statistics (Admin only)
router.get('/stats/overview', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const totalRentals = await prisma.rental.count();
    const pendingRentals = await prisma.rental.count({ where: { status: 'PENDING' } });
    const inProgressRentals = await prisma.rental.count({ where: { status: 'IN_PROGRESS' } });
    const completedRentals = await prisma.rental.count({ where: { status: 'COMPLETED' } });
    const cancelledRentals = await prisma.rental.count({ where: { status: 'CANCELLED' } });
    
    // Calculate total revenue
    const revenueData = await prisma.rental.aggregate({
      where: { status: { in: ['COMPLETED', 'IN_PROGRESS'] } },
      _sum: { totalAmount: true }
    });
    
    const totalRevenue = revenueData._sum.totalAmount || 0;
    
    res.json({
      totalRentals,
      pendingRentals,
      inProgressRentals,
      completedRentals,
      cancelledRentals,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching rental statistics:', error);
    res.status(500).json({ error: 'Failed to fetch rental statistics' });
  }
});

// Get rentals by status (Admin only)
router.get('/status/:status', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const rentals = await prisma.rental.findMany({
      where: { status },
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
    
    const total = await prisma.rental.count({ where: { status } });
    
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
    console.error('Error fetching rentals by status:', error);
    res.status(500).json({ error: 'Failed to fetch rentals by status' });
  }
});

// Update rental invoice status
router.patch('/:id/invoice-status', [
  authenticateToken,
  requireOwnershipOrAdmin('rental'),
  body('invoiceStatus').isIn(['FULLY_INVOICED', 'NOTHING_TO_INVOICE', 'TO_INVOICE'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { invoiceStatus } = req.body;
    
    const rental = await prisma.rental.update({
      where: { id },
      data: { invoiceStatus },
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
    console.error('Error updating rental invoice status:', error);
    res.status(500).json({ error: 'Failed to update rental invoice status' });
  }
});

// Update rental item invoice status
router.patch('/:id/items/:itemId/invoice-status', [
  authenticateToken,
  requireOwnershipOrAdmin('rental'),
  body('invoiceStatus').isIn(['FULLY_INVOICED', 'NOTHING_TO_INVOICE', 'TO_INVOICE'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id, itemId } = req.params;
    const { invoiceStatus } = req.body;
    
    // Verify the item belongs to the rental
    const rentalItem = await prisma.rentalItem.findFirst({
      where: {
        id: itemId,
        rentalId: id
      }
    });
    
    if (!rentalItem) {
      return res.status(404).json({ error: 'Rental item not found' });
    }
    
    const updatedItem = await prisma.rentalItem.update({
      where: { id: itemId },
      data: { invoiceStatus },
      include: {
        product: true
      }
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating rental item invoice status:', error);
    res.status(500).json({ error: 'Failed to update rental item invoice status' });
  }
});

module.exports = router; 