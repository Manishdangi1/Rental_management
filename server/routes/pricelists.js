const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all pricelists
router.get('/', async (req, res) => {
  try {
    const pricelists = await prisma.pricelist.findMany({
      where: { isActive: true },
      include: {
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
      orderBy: { validFrom: 'desc' }
    });
    
    res.json(pricelists);
  } catch (error) {
    console.error('Error fetching pricelists:', error);
    res.status(500).json({ error: 'Failed to fetch pricelists' });
  }
});

module.exports = router; 