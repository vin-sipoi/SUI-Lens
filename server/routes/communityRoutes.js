const express = require('express');
const { Community } = require('../models/index.js');

const router = express.Router();

// GET /api/communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.findAll({
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      communities,
      count: communities.length,
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/communities/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    res.json({
      success: true,
      community,
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
