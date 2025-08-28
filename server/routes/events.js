import express from 'express';
import { Event } from '../models/index.js';

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['startDate', 'ASC']],
    });

    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { 
      id,
      title,
      description,
      bannerUrl,
      nftImageUrl,
      poapImageUrl,
      location,
      latitude,
      longitude,
      category,
      startDate,
      endDate,
      capacity,
      ticketPrice,
      isFree,
      requiresApproval,
      isPrivate,
      timezone,
      qrCode,
      eventUrl,
      poapEnabled,
      poapName,
      poapDescription,
      createdBy,
      suiEventId
    } = req.body;

    if (!id || !title || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: id, title, startDate, endDate' 
      });
    }

    // Validate blockchain transaction ID format (Sui transaction format)
    const suiTxPattern = /^0x[a-fA-F0-9]{64}$/; // 0x + 64 hex characters
    if (!suiTxPattern.test(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid blockchain transaction ID format' 
      });
    }

    const event = await Event.create({
      id,
      title,
      description,
      bannerUrl,
      nftImageUrl,
      poapImageUrl,
      location,
      latitude,
      longitude,
      category,
      startDate,
      endDate,
      capacity: capacity || 100,
      ticketPrice: ticketPrice || 0,
      isFree: isFree !== undefined ? isFree : true,
      requiresApproval: requiresApproval || false,
      isPrivate: isPrivate || false,
      timezone,
      qrCode,
      eventUrl,
      poapEnabled: poapEnabled || false,
      poapName,
      poapDescription,
      createdBy,
      suiEventId
    });

    res.status(201).json({
      success: true,
      event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title,
      description,
      bannerUrl,
      nftImageUrl,
      poapImageUrl,
      location,
      latitude,
      longitude,
      category,
      startDate,
      endDate,
      capacity,
      ticketPrice,
      isFree,
      requiresApproval,
      isPrivate,
      timezone,
      qrCode,
      eventUrl,
      poapEnabled,
      poapName,
      poapDescription,
      createdBy,
      suiEventId
    } = req.body;

    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    await event.update({
      title,
      description,
      bannerUrl,
      nftImageUrl,
      poapImageUrl,
      location,
      latitude,
      longitude,
      category,
      startDate,
      endDate,
      capacity,
      ticketPrice,
      isFree,
      requiresApproval,
      isPrivate,
      timezone,
      qrCode,
      eventUrl,
      poapEnabled,
      poapName,
      poapDescription,
      createdBy,
      suiEventId
    });

    res.json({
      success: true,
      event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;