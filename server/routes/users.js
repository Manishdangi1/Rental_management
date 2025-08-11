const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
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

// Get user by ID (Admin only, or user can see their own profile)
router.get('/:id', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req, res) => {
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

module.exports = router; 