const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get rental statistics
router.get('/rental-stats', authenticateToken, async (req, res) => {
  try {
    const totalRentals = await prisma.rental.count();
    const activeRentals = await prisma.rental.count({
      where: {
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        }
      }
    });
    const completedRentals = await prisma.rental.count({
      where: { status: 'COMPLETED' }
    });
    
    const totalRevenue = await prisma.rental.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true }
    });
    
    res.json({
      totalRentals,
      activeRentals,
      completedRentals,
      totalRevenue: totalRevenue._sum.totalAmount || 0
    });
  } catch (error) {
    console.error('Error fetching rental stats:', error);
    res.status(500).json({ error: 'Failed to fetch rental statistics' });
  }
});

// Get product popularity
router.get('/product-popularity', authenticateToken, async (req, res) => {
  try {
    const productStats = await prisma.rentalItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      _count: {
        rentalId: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });
    
    const productsWithDetails = await Promise.all(
      productStats.map(async (stat) => {
        const product = await prisma.product.findUnique({
          where: { id: stat.productId },
          select: { name: true, sku: true }
        });
        
        return {
          productId: stat.productId,
          productName: product?.name || 'Unknown',
          sku: product?.sku || 'Unknown',
          totalQuantity: stat._sum.quantity,
          rentalCount: stat._count.rentalId
        };
      })
    );
    
    res.json(productsWithDetails);
  } catch (error) {
    console.error('Error fetching product popularity:', error);
    res.status(500).json({ error: 'Failed to fetch product popularity' });
  }
});

module.exports = router; 