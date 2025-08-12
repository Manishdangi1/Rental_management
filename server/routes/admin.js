const express = require('express');
const router = express.Router();
const { prisma } = require('../config/prisma');
const auth = require('../middleware/auth');

// Admin middleware - ensure user is admin
const adminAuth = [
  auth.authenticateToken,
  auth.requireRole(['ADMIN'])
];

// Test endpoint to verify database connection (no auth required)
router.get('/test-db', async (req, res) => {
  try {
    const rentalCount = await prisma.rental.count();
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    
    res.json({
      message: 'Database connection successful',
      counts: {
        rentals: rentalCount,
        users: userCount,
        products: productCount
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// Debug endpoint to test consolidated endpoint step by step (no auth required)
router.get('/debug-dashboard', async (req, res) => {
  try {
    console.log('Debug: Starting dashboard data fetch...');
    
    // Test basic counts
    const totalRentals = await prisma.rental.count();
    console.log('Debug: Total rentals:', totalRentals);
    
    const totalUsers = await prisma.user.count();
    console.log('Debug: Total users:', totalUsers);
    
    const totalProducts = await prisma.product.count();
    console.log('Debug: Total products:', totalProducts);
    
    // Test recent rentals
    const recentRentals = await prisma.rental.findMany({
      take: 2,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Debug: Recent rentals:', recentRentals.length);
    
    res.json({
      message: 'Debug completed successfully',
      basicCounts: { totalRentals, totalUsers, totalProducts },
      recentRentalsCount: recentRentals.length,
      sampleRental: recentRentals[0] || null
    });
    
  } catch (error) {
    console.error('Debug failed:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    });
  }
});

// Apply admin auth to all routes
router.use(adminAuth);

// Get comprehensive admin dashboard data (all-in-one endpoint)
router.get('/dashboard-data', async (req, res) => {
  try {
    console.log('Admin dashboard data request received');
    
    // Get basic counts first
    console.log('Fetching basic counts...');
    // Get basic counts first
    const totalRentals = await prisma.rental.count();
    console.log('Total rentals:', totalRentals);
    
    const activeRentals = await prisma.rental.count({
      where: {
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS', 'PICKED_UP']
        }
      }
    });
    console.log('Active rentals:', activeRentals);
    
    const revenueResult = await prisma.rental.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: {
          in: ['COMPLETED', 'PICKED_UP', 'IN_PROGRESS']
        }
      }
    });
    console.log('Revenue result:', revenueResult);
    
    const pendingDeliveries = await prisma.delivery.count({
      where: { status: 'PENDING' }
    });
    console.log('Pending deliveries:', pendingDeliveries);
    
    const overdueReturns = await prisma.rental.count({
      where: {
        status: 'PICKED_UP',
        endDate: { lt: new Date() }
      }
    });
    console.log('Overdue returns:', overdueReturns);
    
    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    });
    console.log('Total products:', totalProducts);
    
    const availableProducts = await prisma.product.count({
      where: {
        isActive: true,
        isRentable: true,
        availableQuantity: { gt: 0 }
      }
    });
    console.log('Available products:', availableProducts);
    
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        isActive: true
      }
    });
    console.log('Total customers:', totalCustomers);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newCustomersThisMonth = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        isActive: true,
        createdAt: {
          gte: startOfMonth
        }
      }
    });
    console.log('New customers this month:', newCustomersThisMonth);
    
    // Get recent rentals
    console.log('Fetching recent rentals...');
    const recentRentals = await prisma.rental.findMany({
      take: 5,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Recent rentals count:', recentRentals.length);
    
    // Get top products (simplified - avoid groupBy with include)
    console.log('Fetching top products...');
    const topProductsRaw = await prisma.rentalItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5
    });
    console.log('Top products raw count:', topProductsRaw.length);
    
    // Get product details separately to avoid groupBy include issues
    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, categoryId: true }
        });
        return {
          id: item.productId,
          name: product?.name || `Product ${item.productId}`,
          totalRentals: item._count.productId,
          category: 'General',
          averageRating: 4.5
        };
      })
    );
    console.log('Top products processed:', topProducts.length);
    
    // Get top customers (simplified - avoid groupBy with include)
    console.log('Fetching top customers...');
    const topCustomersRaw = await prisma.rental.groupBy({
      by: ['customerId'],
      _count: { customerId: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { customerId: 'desc' } },
      take: 5
    });
    console.log('Top customers raw count:', topCustomersRaw.length);
    
    // Get customer details separately to avoid groupBy include issues
    const topCustomers = await Promise.all(
      topCustomersRaw.map(async (item) => {
        const customer = await prisma.user.findUnique({
          where: { id: item.customerId },
          select: { firstName: true, lastName: true, email: true }
        });
        return {
          id: item.customerId,
          name: customer ? `${customer.firstName} ${customer.lastName}` : `Customer ${item.customerId}`,
          email: customer?.email || 'customer@example.com',
          totalRentals: item._count.customerId,
          totalSpent: item._sum.totalAmount || 0,
          lastRentalDate: new Date().toISOString()
        };
      })
    );
    console.log('Top customers processed:', topCustomers.length);
    
    // Get overdue rentals
    console.log('Fetching overdue rentals...');
    const overdueRentals = await prisma.rental.findMany({
      where: {
        status: 'PICKED_UP',
        endDate: { lt: new Date() }
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      take: 5
    });
    console.log('Overdue rentals count:', overdueRentals.length);

    // Transform recent rentals
    const transformedRentals = recentRentals.map(rental => ({
      id: rental.id,
      orderNumber: rental.orderNumber,
      customerName: `${rental.customer.firstName} ${rental.customer.lastName}`,
      status: rental.status,
      totalAmount: rental.totalAmount,
      startDate: rental.startDate,
      endDate: rental.endDate,
      items: [],
      createdAt: rental.createdAt
    }));

    // Transform top products (simplified)
    console.log('Top products raw data:', JSON.stringify(topProducts, null, 2));
    const transformedTopProducts = (topProducts || []).filter(item => item && item.productId).map(item => ({
      id: item.productId,
      name: `Product ${item.productId}`,
      totalRentals: item._count?.productId || 0,
      category: 'General',
      averageRating: 4.5
    }));

    // Transform top customers (simplified)
    console.log('Top customers raw data:', JSON.stringify(topCustomers, null, 2));
    const transformedTopCustomers = (topCustomers || []).filter(item => item && item.customerId).map(item => ({
      id: item.customerId,
      name: `Customer ${item.customerId}`,
      email: 'customer@example.com',
      totalRentals: item._count?.customerId || 0,
      totalSpent: item._sum?.totalAmount || 0,
      lastRentalDate: new Date().toISOString()
    }));

    // Transform overdue rentals
    const transformedOverdueRentals = (overdueRentals || []).map(rental => ({
      id: rental.id,
      orderNumber: rental.orderNumber,
      customerName: rental.customer ? `${rental.customer.firstName || 'Unknown'} ${rental.customer.lastName || 'Customer'}` : 'Unknown Customer',
      status: rental.status,
      totalAmount: rental.totalAmount,
      startDate: rental.startDate,
      endDate: rental.endDate,
      items: [],
      createdAt: rental.createdAt
    }));

    res.json({
      stats: {
        totalRentals,
        activeRentals,
        totalRevenue: revenueResult._sum.totalAmount || 0,
        pendingDeliveries,
        overdueReturns,
        totalProducts,
        availableProducts,
        totalCustomers,
        newCustomersThisMonth
      },
      recentRentals: transformedRentals,
      topProducts: transformedTopProducts,
      topCustomers: transformedTopCustomers,
      overdueRentals: transformedOverdueRentals
    });

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch admin dashboard data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get admin dashboard stats (legacy endpoint - kept for backward compatibility)
router.get('/stats', async (req, res) => {
  try {
    // Get total rentals
    const totalRentals = await prisma.rental.count();
    
    // Get active rentals (status: CONFIRMED, IN_PROGRESS, PICKED_UP)
    const activeRentals = await prisma.rental.count({
      where: {
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS', 'PICKED_UP']
        }
      }
    });

    // Get total revenue
    const revenueResult = await prisma.rental.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: {
          in: ['COMPLETED', 'PICKED_UP', 'IN_PROGRESS']
        }
      }
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Get pending deliveries
    const pendingDeliveries = await prisma.delivery.count({
      where: {
        status: 'PENDING'
      }
    });

    // Get overdue returns
    const overdueReturns = await prisma.rental.count({
      where: {
        status: 'PICKED_UP',
        endDate: {
          lt: new Date()
        }
      }
    });

    // Get total products
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true
      }
    });

    // Get available products
    const availableProducts = await prisma.product.count({
      where: {
        isActive: true,
        isRentable: true,
        availableQuantity: {
          gt: 0
        }
      }
    });

    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        isActive: true
      }
    });

    // Get new customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newCustomersThisMonth = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        isActive: true,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    res.json({
      totalRentals,
      activeRentals,
      totalRevenue,
      pendingDeliveries,
      overdueReturns,
      totalProducts,
      availableProducts,
      totalCustomers,
      newCustomersThisMonth
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get recent rentals
router.get('/rentals', async (req, res) => {
  try {
    const { limit = 10, status } = req.query;
    
    let whereClause = {};
    if (status && status !== 'all') {
      if (status === 'OVERDUE') {
        whereClause = {
          status: 'PICKED_UP',
          endDate: {
            lt: new Date()
          }
        };
      } else {
        whereClause = { status };
      }
    }

    const rentals = await prisma.rental.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                basePrice: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Transform data for frontend
    const transformedRentals = rentals.map(rental => ({
      id: rental.id,
      orderNumber: rental.orderNumber,
      customerName: `${rental.customer.firstName} ${rental.customer.lastName}`,
      status: rental.status,
      totalAmount: rental.totalAmount,
      startDate: rental.startDate,
      endDate: rental.endDate,
      pickupDate: rental.pickupDate,
      returnDate: rental.returnDate,
      items: rental.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      createdAt: rental.createdAt
    }));

    res.json({ rentals: transformedRentals });

  } catch (error) {
    console.error('Error fetching admin rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Get pending deliveries
router.get('/deliveries', async (req, res) => {
  try {
    const { status } = req.query;
    
    let whereClause = {};
    if (status && status !== 'all') {
      whereClause = { status };
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      include: {
        rental: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    // Transform data for frontend
    const transformedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      rentalId: delivery.rentalId,
      customerName: delivery.rental?.customer ? `${delivery.rental.customer.firstName || 'Unknown'} ${delivery.rental.customer.lastName || 'Customer'}` : 'Unknown Customer',
      productName: 'Product', // Simplified since product is not directly related to delivery
      quantity: 1, // Default quantity
      status: delivery.status,
      scheduledDate: delivery.scheduledAt,
      actualDate: delivery.completedAt,
      driverName: delivery.contactName,
      notes: delivery.notes
    }));

    res.json({ deliveries: transformedDeliveries });

  } catch (error) {
    console.error('Error fetching admin deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// Get top products report
router.get('/reports/top-products', async (req, res) => {
  try {
    const topProducts = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        category: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            rentalItems: true
          }
        }
      },
      orderBy: {
        rentalItems: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Transform data for frontend
    const transformedProducts = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      totalRentals: product._count.rentalItems,
      totalRevenue: 0, // This would need to be calculated from rental data
      averageRating: 0, // This would need to be calculated from reviews
      category: product.category.name
    }));

    res.json({ products: transformedProducts });

  } catch (error) {
    console.error('Error fetching top products report:', error);
    res.status(500).json({ error: 'Failed to fetch top products report' });
  }
});

// Get top customers report
router.get('/reports/top-customers', async (req, res) => {
  try {
    const topCustomers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        isActive: true
      },
      include: {
        _count: {
          select: {
            rentals: true
          }
        },
        rentals: {
          select: {
            totalAmount: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        rentals: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Transform data for frontend
    const transformedCustomers = topCustomers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      totalRentals: customer._count.rentals,
      totalSpent: customer.rentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0),
      lastRentalDate: customer.rentals[0]?.createdAt || null
    }));

    res.json({ customers: transformedCustomers });

  } catch (error) {
    console.error('Error fetching top customers report:', error);
    res.status(500).json({ error: 'Failed to fetch top customers report' });
  }
});

// Get revenue report
router.get('/reports/revenue', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    const revenueData = await prisma.rental.findMany({
      where: {
        ...dateFilter,
        status: {
          in: ['COMPLETED', 'PICKED_UP', 'IN_PROGRESS']
        }
      },
      select: {
        totalAmount: true,
        createdAt: true,
        status: true
      }
    });

    // Group by month, week, or day
    const groupedRevenue = {};
    revenueData.forEach(rental => {
      let key;
      if (groupBy === 'month') {
        key = rental.createdAt.toISOString().slice(0, 7); // YYYY-MM
      } else if (groupBy === 'week') {
        const weekStart = new Date(rental.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = rental.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      }

      if (!groupedRevenue[key]) {
        groupedRevenue[key] = {
          total: 0,
          count: 0,
          completed: 0,
          inProgress: 0
        };
      }

      groupedRevenue[key].total += rental.totalAmount || 0;
      groupedRevenue[key].count += 1;

      if (rental.status === 'COMPLETED') {
        groupedRevenue[key].completed += 1;
      } else if (rental.status === 'IN_PROGRESS' || rental.status === 'PICKED_UP') {
        groupedRevenue[key].inProgress += 1;
      }
    });

    res.json({
      groupedRevenue,
      totalRevenue: revenueData.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0),
      totalRentals: revenueData.length
    });

  } catch (error) {
    console.error('Error fetching revenue report:', error);
    res.status(500).json({ error: 'Failed to fetch revenue report' });
  }
});

// Get rental analytics
router.get('/reports/rentals', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    const rentals = await prisma.rental.findMany({
      where: dateFilter,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Calculate analytics
    const analytics = {
      totalRentals: rentals.length,
      totalRevenue: rentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0),
      averageRentalValue: rentals.length > 0 ? 
        rentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0) / rentals.length : 0,
      statusBreakdown: {},
      categoryBreakdown: {},
      customerBreakdown: {}
    };

    // Status breakdown
    rentals.forEach(rental => {
      const status = rental.status;
      analytics.statusBreakdown[status] = (analytics.statusBreakdown[status] || 0) + 1;
    });

    // Category breakdown
    rentals.forEach(rental => {
      rental.items.forEach(item => {
        const category = item.product.category.name;
        analytics.categoryBreakdown[category] = (analytics.categoryBreakdown[category] || 0) + 1;
      });
    });

    // Customer breakdown
    rentals.forEach(rental => {
      const customerName = `${rental.customer.firstName} ${rental.customer.lastName}`;
      analytics.customerBreakdown[customerName] = (analytics.customerBreakdown[customerName] || 0) + 1;
    });

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching rental analytics:', error);
    res.status(500).json({ error: 'Failed to fetch rental analytics' });
  }
});

// Get products report
router.get('/reports/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        category: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            rentalItems: true
          }
        }
      }
    });

    const report = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category.name,
      totalQuantity: product.totalQuantity,
      availableQuantity: product.availableQuantity,
      totalRentals: product._count.rentalItems,
      isRentable: product.isRentable,
      isActive: product.isActive
    }));

    res.json({ products: report });

  } catch (error) {
    console.error('Error fetching products report:', error);
    res.status(500).json({ error: 'Failed to fetch products report' });
  }
});

// Get customers report
router.get('/reports/customers', async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        isActive: true
      },
      include: {
        _count: {
          select: {
            rentals: true
          }
        },
        rentals: {
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    });

    const report = customers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      totalRentals: customer._count.rentals,
      totalSpent: customer.rentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0),
      firstRental: customer.rentals.length > 0 ? 
        customer.rentals.reduce((earliest, rental) => 
          rental.createdAt < earliest.createdAt ? rental : earliest
        ).createdAt : null,
      lastRental: customer.rentals.length > 0 ? 
        customer.rentals.reduce((latest, rental) => 
          rental.createdAt > latest.createdAt ? rental : latest
        ).createdAt : null
    }));

    res.json({ customers: report });

  } catch (error) {
    console.error('Error fetching customers report:', error);
    res.status(500).json({ error: 'Failed to fetch customers report' });
  }
});

// Get deliveries report
router.get('/reports/deliveries', async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        rental: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        product: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    const report = deliveries.map(delivery => ({
      id: delivery.id,
      rentalId: delivery.rentalId,
      customerName: delivery.rental?.customer ? `${delivery.rental.customer.firstName || 'Unknown'} ${delivery.rental.customer.lastName || 'Customer'}` : 'Unknown Customer',
      productName: 'Product', // Simplified since product is not directly related to delivery
      quantity: 1, // Default quantity
      status: delivery.status,
      scheduledDate: delivery.scheduledAt,
      actualDate: delivery.completedAt,
      driverName: delivery.contactName,
      notes: delivery.notes
    }));

    res.json({ deliveries: report });

  } catch (error) {
    console.error('Error fetching deliveries report:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries report' });
  }
});

// Get analytics report
router.get('/reports/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    // Get comprehensive analytics
    const [
      totalRentals,
      totalRevenue,
      totalCustomers,
      totalProducts,
      rentalStatusBreakdown,
      categoryBreakdown
    ] = await Promise.all([
      prisma.rental.count({ where: dateFilter }),
      prisma.rental.aggregate({
        where: { ...dateFilter, status: { in: ['COMPLETED', 'PICKED_UP', 'IN_PROGRESS'] } },
        _sum: { totalAmount: true }
      }),
      prisma.user.count({ where: { ...dateFilter, role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.rental.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true }
      }),
      prisma.rentalItem.groupBy({
        by: ['productId'],
        where: dateFilter,
        _count: { productId: true }
      })
    ]);

    // Calculate monthly trends
    const monthlyTrends = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        const monthRentals = await prisma.rental.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        });
        
        const monthRevenue = await prisma.rental.aggregate({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            },
            status: {
              in: ['COMPLETED', 'PICKED_UP', 'IN_PROGRESS']
            }
          },
          _sum: { totalAmount: true }
        });
        
        monthlyTrends.push({
          month: monthStart.toISOString().slice(0, 7),
          rentals: monthRentals,
          revenue: monthRevenue._sum.totalAmount || 0
        });
      }
    }

    const analytics = {
      overview: {
        totalRentals,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalCustomers,
        totalProducts
      },
      rentalStatusBreakdown: rentalStatusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
        const categoryName = 'General'; // Simplified since we can't include product details in groupBy
        acc[categoryName] = (acc[categoryName] || 0) + item._count.productId;
        return acc;
      }, {}),
      monthlyTrends
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics report:', error);
    res.status(500).json({ error: 'Failed to fetch analytics report' });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    
    let whereClause = {};
    
    // Filter by role
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }
    
    // Search by name or email
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            rentals: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      totalRentals: user._count.rentals,
      totalInvoices: user._count.invoices
    }));
    
    res.json({ users: transformedUsers });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router; 