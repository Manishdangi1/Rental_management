const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all categories (public endpoint)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category (Admin only)
router.post('/', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name').isString().notEmpty(),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description } = req.body;
    
    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Get category by ID (Admin only)
router.get('/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Update category (Admin only)
router.put('/:id', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (Admin only)
router.delete('/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    if (!categoryWithProducts) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    if (categoryWithProducts._count.products > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing products',
        productCount: categoryWithProducts._count.products
      });
    }
    
    await prisma.category.delete({
      where: { id }
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Toggle category status (Admin only)
router.patch('/:id/toggle-status', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        isActive: !category.isActive
      }
    });
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({ error: 'Failed to toggle category status' });
  }
});

// Get admin categories with stats (Admin only)
router.get('/admin/list', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let whereClause = {};
    
    // Apply search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }
    
    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform data for frontend
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      isActive: category.isActive,
      productCount: category._count.products,
      totalRevenue: 0, // This would need a separate calculation if needed
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));
    
    res.json({ categories: transformedCategories });
    
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router; 