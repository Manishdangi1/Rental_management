const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all payments (Admin only, or customer can see their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = {};
    
    // If user is not admin, they can only see their own payments
    if (req.user.role !== 'ADMIN') {
      where.customerId = req.user.id;
    }
    
    const payments = await prisma.payment.findMany({
      where,
      include: {
        rental: true,
        users: {
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

    // Transform the data to match frontend expectations and ensure all required fields are present
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      paymentNumber: payment.id, // Using ID as payment number
      invoiceId: payment.rentalId, // Using rental ID as invoice ID
      invoiceNumber: `INV-${payment.rentalId}`, // Generating invoice number
      rentalId: payment.rentalId,
      orderNumber: payment.rentalId, // Using rental ID as order number
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      status: payment.status || 'PENDING',
      method: payment.method || 'CREDIT_CARD',
      methodDetails: {
        type: payment.method || 'CREDIT_CARD',
        last4: '****',
        brand: payment.method || 'CREDIT_CARD',
        accountNumber: payment.transactionId || 'N/A',
        bankName: 'N/A'
      },
      transactionId: payment.transactionId || null,
      authorizationCode: payment.stripeIntentId || null,
      processedDate: payment.createdAt,
      failureReason: payment.status === 'FAILED' ? 'Payment failed' : null,
      refundReason: payment.status === 'REFUNDED' ? 'Refunded' : null,
      refundDate: payment.status === 'REFUNDED' ? payment.updatedAt : null,
      securityDeposit: false,
      description: payment.description || `Payment for rental ${payment.rentalId}`,
      metadata: {}
    }));
    
    res.json(transformedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment by ID (Admin only, or customer can see their own)
router.get('/:id', [
  authenticateToken,
  requireOwnershipOrAdmin('payment', 'id')
], async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        rental: true,
        users: true
      }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Transform the data to match frontend expectations
    const transformedPayment = {
      id: payment.id,
      paymentNumber: payment.id,
      invoiceId: payment.rentalId,
      invoiceNumber: `INV-${payment.rentalId}`,
      rentalId: payment.rentalId,
      orderNumber: payment.rentalId,
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      status: payment.status || 'PENDING',
      method: payment.method || 'CREDIT_CARD',
      methodDetails: {
        type: payment.method || 'CREDIT_CARD',
        last4: '****',
        brand: payment.method || 'CREDIT_CARD',
        accountNumber: payment.transactionId || 'N/A',
        bankName: 'N/A'
      },
      transactionId: payment.transactionId || null,
      authorizationCode: payment.stripeIntentId || null,
      processedDate: payment.createdAt,
      failureReason: payment.status === 'FAILED' ? 'Payment failed' : null,
      refundReason: payment.status === 'REFUNDED' ? 'Refunded' : null,
      refundDate: payment.status === 'REFUNDED' ? payment.updatedAt : null,
      securityDeposit: false,
      description: payment.description || `Payment for rental ${payment.rentalId}`,
      metadata: {}
    };
    
    res.json(transformedPayment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Create new payment (Admin only, or customer can create for themselves)
router.post('/', [
  authenticateToken,
  body('rentalId').isString().notEmpty(),
  body('customerId').isString().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('method').isIn(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHECK', 'STRIPE', 'PAYPAL'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { rentalId, customerId, amount, method, description, transactionId } = req.body;
    
    // Validate that the user is creating a payment for themselves or has admin privileges
    if (req.user.id !== customerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only create payments for yourself' 
      });
    }
    
    const payment = await prisma.payment.create({
      data: {
        rentalId,
        customerId,
        amount,
        method,
        description,
        transactionId
      },
      include: {
        rental: true,
        users: true
      }
    });

    // Transform the data to match frontend expectations
    const transformedPayment = {
      id: payment.id,
      paymentNumber: payment.id,
      invoiceId: payment.rentalId,
      invoiceNumber: `INV-${payment.rentalId}`,
      rentalId: payment.rentalId,
      orderNumber: payment.rentalId,
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      status: payment.status || 'PENDING',
      method: payment.method || 'CREDIT_CARD',
      methodDetails: {
        type: payment.method || 'CREDIT_CARD',
        last4: '****',
        brand: payment.method || 'CREDIT_CARD',
        accountNumber: payment.transactionId || 'N/A',
        bankName: 'N/A'
      },
      transactionId: payment.transactionId || null,
      authorizationCode: payment.stripeIntentId || null,
      processedDate: payment.createdAt,
      failureReason: payment.status === 'FAILED' ? 'Payment failed' : null,
      refundReason: payment.status === 'REFUNDED' ? 'Refunded' : null,
      refundDate: payment.status === 'REFUNDED' ? payment.updatedAt : null,
      securityDeposit: false,
      description: payment.description || `Payment for rental ${payment.rentalId}`,
      metadata: {}
    };
    
    res.status(201).json(transformedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Update payment status (Admin only, or customer can update their own)
router.patch('/:id/status', [
  authenticateToken,
  requireOwnershipOrAdmin('payment', 'id'),
  body('status').isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: {
        rental: true,
        customer: true
      }
    });
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

module.exports = router; 