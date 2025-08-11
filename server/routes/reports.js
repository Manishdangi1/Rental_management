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

// Add: Category popularity (top product categories)
router.get('/category-popularity', authenticateToken, async (req, res) => {
  try {
    // First, group rental items by product to get quantities
    const productStats = await prisma.rentalItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true }
    });

    if (productStats.length === 0) {
      return res.json([]);
    }

    // Fetch product category for involved products
    const productIds = productStats.map(s => s.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, categoryId: true }
    });

    const categoryMap = new Map(); // categoryId -> totalQuantity
    for (const stat of productStats) {
      const product = products.find(p => p.id === stat.productId);
      const categoryId = product?.categoryId || 'UNKNOWN';
      const current = categoryMap.get(categoryId) || 0;
      categoryMap.set(categoryId, current + (stat._sum.quantity || 0));
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: Array.from(categoryMap.keys()).filter(id => id !== 'UNKNOWN') } },
      select: { id: true, name: true }
    });

    const results = Array.from(categoryMap.entries()).map(([categoryId, totalQuantity]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        categoryName: category?.name || 'Unknown',
        totalQuantity
      };
    });

    // Sort desc and take top 10
    results.sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0));

    res.json(results.slice(0, 10));
  } catch (error) {
    console.error('Error fetching category popularity:', error);
    res.status(500).json({ error: 'Failed to fetch category popularity' });
  }
});

// Add: Top customers by revenue and rentals
router.get('/top-customers', authenticateToken, async (req, res) => {
  try {
    // Sum rentals by customer where completed
    const rentalAggregates = await prisma.rental.groupBy({
      by: ['customerId'],
      _sum: { totalAmount: true },
      _count: { _all: true },
      where: { status: 'COMPLETED' }
    });

    if (rentalAggregates.length === 0) {
      return res.json([]);
    }

    const customerIds = rentalAggregates.map(r => r.customerId);
    const users = await prisma.user.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    const results = rentalAggregates.map(agg => {
      const user = users.find(u => u.id === agg.customerId);
      return {
        customerId: agg.customerId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user?.email || 'Unknown',
        totalRevenue: agg._sum.totalAmount || 0,
        rentalCount: agg._count._all || 0
      };
    });

    results.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));

    res.json(results.slice(0, 10));
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

// Add: Revenue trend grouped by month (from paid invoices)
router.get('/revenue-trend', authenticateToken, async (req, res) => {
  try {
    const monthsParam = parseInt(req.query.months, 10);
    const months = Number.isFinite(monthsParam) && monthsParam > 0 && monthsParam <= 36 ? monthsParam : 6;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (months - 1));
    startDate.setDate(1);

    // Fetch paid invoices in range
    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: startDate, lte: endDate }
      },
      select: { total: true, paidAt: true }
    });

    // Build buckets for each month in range
    const buckets = new Map(); // key: YYYY-MM -> total
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, 0);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const inv of invoices) {
      const dt = inv.paidAt || inv.createdAt;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + (inv.total || 0));
      }
    }

    const trend = Array.from(buckets.entries()).map(([month, total]) => ({ month, total }));

    res.json(trend);
  } catch (error) {
    console.error('Error fetching revenue trend:', error);
    res.status(500).json({ error: 'Failed to fetch revenue trend' });
  }
});

// Add: Quotations (use invoices with DRAFT or SENT status as quotations)
router.get('/quotations', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const quotations = await prisma.invoice.findMany({
      where: { status: { in: ['DRAFT', 'SENT'] } },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        rental: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10) || 20,
    });

    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

module.exports = router; 