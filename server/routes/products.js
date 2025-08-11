const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').optional().trim(),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('totalQuantity').isInt({ min: 1 }).withMessage('Total quantity must be at least 1'),
  body('minimumRentalDays').isInt({ min: 1 }).withMessage('Minimum rental days must be at least 1'),
  body('maximumRentalDays').optional().isInt({ min: 1 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('dimensions').optional().isObject()
];

// Get all products (with filtering and pagination)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('available').optional().isBoolean(),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'popularity']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      available,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      isActive: true,
      isRentable: true
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (available !== undefined) {
      if (available === 'true') {
        where.availableQuantity = { gt: 0 };
      } else {
        where.availableQuantity = { lte: 0 };
      }
    }

    // Get products with category and pricing info
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, description: true }
        },
        productImages: {
          where: { isPrimary: true },
          select: { imageUrl: true, altText: true }
        },
        pricelistItems: {
          where: {
            pricelist: { isActive: true }
          },
          select: {
            rentalType: true,
            price: true,
            currency: true,
            discount: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit)
    });

    // Get total count for pagination
    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);

    // Apply price filtering after fetching (since pricing is in separate table)
    let filteredProducts = products;
    if (minPrice || maxPrice) {
      filteredProducts = products.filter(product => {
        const prices = product.pricelistItems.map(item => {
          const finalPrice = item.price - (item.discount || 0);
          return finalPrice;
        });
        
        if (prices.length === 0) return false;
        
        const minProductPrice = Math.min(...prices);
        const maxProductPrice = Math.max(...prices);
        
        if (minPrice && minProductPrice < parseFloat(minPrice)) return false;
        if (maxPrice && maxProductPrice > parseFloat(maxPrice)) return false;
        
        return true;
      });
    }

    res.json({
      products: filteredProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      error: 'Products fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, description: true }
        },
        productImages: {
          orderBy: { order: 'asc' },
          select: { imageUrl: true, altText: true, isPrimary: true }
        },
        pricelistItems: {
          where: {
            pricelist: { isActive: true }
          },
          select: {
            rentalType: true,
            price: true,
            currency: true,
            discount: true,
            minimumDays: true,
            maximumDays: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product with this ID does not exist'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product is not available'
      });
    }

    res.json({ product });

  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({
      error: 'Product fetch failed',
      message: 'Internal server error'
    });
  }
});

// Create new product (Admin/Staff only)
router.post('/', authenticateToken, requireRole(['ADMIN', 'STAFF']), productValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name,
      description,
      sku,
      categoryId,
      totalQuantity,
      availableQuantity,
      minimumRentalDays,
      maximumRentalDays,
      weight,
      dimensions,
      specifications
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingProduct) {
      return res.status(400).json({
        error: 'Product creation failed',
        message: 'Product with this SKU already exists'
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({
        error: 'Product creation failed',
        message: 'Selected category does not exist'
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        categoryId,
        totalQuantity: parseInt(totalQuantity),
        availableQuantity: parseInt(availableQuantity || totalQuantity),
        minimumRentalDays: parseInt(minimumRentalDays),
        maximumRentalDays: maximumRentalDays ? parseInt(maximumRentalDays) : null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        specifications: specifications || null
      },
      include: {
        category: {
          select: { id: true, name: true, description: true }
        }
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      error: 'Product creation failed',
      message: 'Internal server error'
    });
  }
});

// Update product (Admin/Staff only)
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'STAFF']), productValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product with this ID does not exist'
      });
    }

    // Check if SKU is being changed and if it already exists
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: updateData.sku }
      });

      if (skuExists) {
        return res.status(400).json({
          error: 'Product update failed',
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, description: true }
        }
      }
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({
      error: 'Product update failed',
      message: 'Internal server error'
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product with this ID does not exist'
      });
    }

    // Check if product has active rentals
    const activeRentals = await prisma.rentalItem.findFirst({
      where: {
        productId: id,
        rental: {
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
        }
      }
    });

    if (activeRentals) {
      return res.status(400).json({
        error: 'Product deletion failed',
        message: 'Cannot delete product with active rentals'
      });
    }

    // Soft delete (mark as inactive)
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({
      error: 'Product deletion failed',
      message: 'Internal server error'
    });
  }
});

// Get product availability for a date range
router.get('/:id/availability', [
  query('startDate').isISO8601().withMessage('Start date is required and must be valid'),
  query('endDate').isISO8601().withMessage('End date is required and must be valid')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product with this ID does not exist'
      });
    }

    // Get overlapping rentals for this product
    const overlappingRentals = await prisma.rentalItem.findMany({
      where: {
        productId: id,
        rental: {
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(startDate) } }
              ]
            }
          ]
        }
      },
      select: {
        quantity: true,
        rental: {
          select: {
            startDate: true,
            endDate: true
          }
        }
      }
    });

    // Calculate unavailable quantity
    const unavailableQuantity = overlappingRentals.reduce((sum, item) => sum + item.quantity, 0);
    const availableQuantity = Math.max(0, product.totalQuantity - unavailableQuantity);

    res.json({
      productId: id,
      totalQuantity: product.totalQuantity,
      availableQuantity,
      unavailableQuantity,
      overlappingRentals: overlappingRentals.map(item => ({
        quantity: item.quantity,
        startDate: item.rental.startDate,
        endDate: item.rental.endDate
      }))
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      error: 'Availability check failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router; 