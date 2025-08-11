const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Admin dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalRentals, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.rental.count(),
      prisma.rental.aggregate({
        _sum: {
          totalAmount: true
        }
      })
    ]);

    // Get rental counts by status
    const rentalStats = await prisma.rental.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get rental counts by invoice status
    const invoiceStats = await prisma.rental.groupBy({
      by: ['invoiceStatus'],
      _count: {
        invoiceStatus: true
      }
    });

    // Convert to object for easier access
    const statusCounts = rentalStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    const invoiceStatusCounts = invoiceStats.reduce((acc, stat) => {
      acc[stat.invoiceStatus] = stat._count.invoiceStatus;
      return acc;
    }, {});

    res.json({
      totalUsers,
      totalProducts,
      totalRentals,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      quotationRentals: statusCounts.QUOTATION || 0,
      quotationSentRentals: statusCounts.QUOTATION_SENT || 0,
      pickedUpRentals: statusCounts.PICKED_UP || 0,
      returnedRentals: statusCounts.RETURNED || 0,
      reservedRentals: statusCounts.RESERVED || 0,
      fullyInvoicedRentals: invoiceStatusCounts.FULLY_INVOICED || 0,
      nothingToInvoiceRentals: invoiceStatusCounts.NOTHING_TO_INVOICE || 0,
      toInvoiceRentals: invoiceStatusCounts.TO_INVOICE || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get user count
router.get('/users/count', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});

// Get product count
router.get('/products/count', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const count = await prisma.product.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching product count:', error);
    res.status(500).json({ error: 'Failed to fetch product count' });
  }
});

// Get rental statistics
router.get('/rentals/stats', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [totalRentals, totalRevenue] = await Promise.all([
      prisma.rental.count(),
      prisma.rental.aggregate({
        _sum: {
          totalAmount: true
        }
      })
    ]);

    // Get rental counts by status
    const rentalStats = await prisma.rental.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get rental counts by invoice status
    const invoiceStats = await prisma.rental.groupBy({
      by: ['invoiceStatus'],
      _count: {
        invoiceStatus: true
      }
    });

    // Convert to object for easier access
    const statusCounts = rentalStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    const invoiceStatusCounts = invoiceStats.reduce((acc, stat) => {
      acc[stat.invoiceStatus] = stat._count.invoiceStatus;
      return acc;
    }, {});

    res.json({
      totalRentals,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      quotationRentals: statusCounts.QUOTATION || 0,
      quotationSentRentals: statusCounts.QUOTATION_SENT || 0,
      pickedUpRentals: statusCounts.PICKED_UP || 0,
      returnedRentals: statusCounts.RETURNED || 0,
      reservedRentals: statusCounts.RESERVED || 0,
      fullyInvoicedRentals: invoiceStatusCounts.FULLY_INVOICED || 0,
      nothingToInvoiceRentals: invoiceStatusCounts.NOTHING_TO_INVOICE || 0,
      toInvoiceRentals: invoiceStatusCounts.TO_INVOICE || 0
    });
  } catch (error) {
    console.error('Error fetching rental statistics:', error);
    res.status(500).json({ error: 'Failed to fetch rental statistics' });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            rentals: true
          }
        },
        rentals: {
          select: {
            totalAmount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total spent for each user
    const usersWithStats = users.map(user => ({
      ...user,
      totalRentals: user._count.rentals,
      totalSpent: user.rentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0),
      _count: undefined,
      rentals: undefined
    }));
    
    res.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (Admin only)
router.get('/users/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            rentals: true
          }
        },
        rentals: {
          select: {
            totalAmount: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate user statistics
    const userWithStats = {
      ...user,
      totalRentals: user._count.rentals,
      totalSpent: user.rentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0),
      _count: undefined,
      rentals: undefined
    };
    
    res.json({ user: userWithStats });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get recent rentals
router.get('/rentals/recent', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const rentals = await prisma.rental.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        totalAmount: true,
        createdAt: true
      }
    });

    res.json({ rentals });
  } catch (error) {
    console.error('Error fetching recent rentals:', error);
    res.status(500).json({ error: 'Failed to fetch recent rentals' });
  }
});

// Get all rentals for admin
router.get('/rentals', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const rentals = await prisma.rental.findMany({
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
            unitPrice: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ rentals });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Get rentals by invoice status
router.get('/rentals/invoice-status/:status', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const rentals = await prisma.rental.findMany({
      where: { invoiceStatus: status },
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
    
    const total = await prisma.rental.count({ where: { invoiceStatus: status } });
    
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
    console.error('Error fetching rentals by invoice status:', error);
    res.status(500).json({ error: 'Failed to fetch rentals by invoice status' });
  }
});

module.exports = router; 