const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all invoices (Admin only, or customer can see their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = {};
    
    // If user is not admin, they can only see their own invoices
    if (req.user.role !== 'ADMIN') {
      where.customerId = req.user.id;
    }
    
    const invoices = await prisma.invoice.findMany({
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
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        rental: {
          include: {
            items: {
              include: {
                product: true
              }
            },
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
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
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Check if user has access to this invoice
    if (req.user.role !== 'ADMIN' && req.user.id !== invoice.customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create new invoice
router.post('/', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('rentalId').isString().notEmpty(),
  body('customerId').isString().notEmpty(),
  body('invoiceNumber').isString().notEmpty(),
  body('subtotal').isFloat({ min: 0 }),
  body('tax').isFloat({ min: 0 }),
  body('discount').optional().isFloat({ min: 0 }),
  body('total').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('notes').optional().isString(),
  body('terms').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { rentalId, customerId, invoiceNumber, subtotal, tax, discount = 0, total, dueDate, notes, terms } = req.body;
    
    // Check if invoice number already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber }
    });
    
    if (existingInvoice) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }
    
    // Check if rental exists
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId }
    });
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    
    const invoice = await prisma.invoice.create({
      data: {
        rentalId,
        customerId,
        invoiceNumber,
        subtotal,
        tax,
        discount,
        total,
        dueDate: new Date(dueDate),
        notes,
        terms,
        status: 'DRAFT'
      },
      include: {
        rental: true,
        customer: true
      }
    });
    
    // Update rental invoice status
    await prisma.rental.update({
      where: { id: rentalId },
      data: { invoiceStatus: 'TO_INVOICE' }
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice status
router.patch('/:id/status', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('status').isIn(['DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status,
        paidAt: status === 'PAID' ? new Date() : null
      },
      include: {
        rental: true,
        customer: true
      }
    });
    
    // Update rental invoice status if invoice is paid
    if (status === 'PAID') {
      await prisma.rental.update({
        where: { id: invoice.rentalId },
        data: { invoiceStatus: 'FULLY_INVOICED' }
      });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// Get invoice statistics (Admin only)
router.get('/stats/overview', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const totalInvoices = await prisma.invoice.count();
    const draftInvoices = await prisma.invoice.count({ where: { status: 'DRAFT' } });
    const sentInvoices = await prisma.invoice.count({ where: { status: 'SENT' } });
    const paidInvoices = await prisma.invoice.count({ where: { status: 'PAID' } });
    const partiallyPaidInvoices = await prisma.invoice.count({ where: { status: 'PARTIALLY_PAID' } });
    const overdueInvoices = await prisma.invoice.count({ where: { status: 'OVERDUE' } });
    const disputedInvoices = await prisma.invoice.count({ where: { status: 'DISPUTED' } });
    const cancelledInvoices = await prisma.invoice.count({ where: { status: 'CANCELLED' } });
    
    // Calculate total revenue from paid invoices
    const revenueData = await prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { total: true }
    });
    
    // Calculate outstanding amount from unpaid invoices
    const outstandingData = await prisma.invoice.aggregate({
      where: { 
        status: { 
          in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID', 'DISPUTED'] 
        } 
      },
      _sum: { total: true }
    });
    
    const totalRevenue = revenueData._sum.total || 0;
    const outstandingAmount = outstandingData._sum.total || 0;
    
    res.json({
      totalInvoices,
      draftInvoices,
      sentInvoices,
      paidInvoices,
      partiallyPaidInvoices,
      overdueInvoices,
      disputedInvoices,
      cancelledInvoices,
      totalRevenue,
      outstandingAmount
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    res.status(500).json({ error: 'Failed to fetch invoice statistics' });
  }
});

module.exports = router; 