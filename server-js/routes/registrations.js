import express from 'express';
import { Event, Registration } from '../models/index.js';
import EventSyncService from '../services/eventSyncService.js';

const router = express.Router();

// Create registration with blockchain sync
router.post('/', async (req, res) => {
  try {
    const { eventId, userAddress, userEmail, userName } = req.body;

    if (!eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event ID is required' 
      });
    }

    // Try to find event in database by UUID (direct ID)
    let event = await Event.findByPk(eventId);
    
    // If not found by UUID, try to find by blockchain event ID
    if (!event) {
      console.log(`Event ${eventId} not found by UUID, trying blockchain ID...`);
      event = await Event.findOne({ where: { suiEventId: eventId } });
    }
    
    // If event still not found, sync from blockchain
    if (!event) {
      console.log(`Event ${eventId} not found in DB, syncing from blockchain...`);
      
      const syncService = new EventSyncService();
      await syncService.syncSingleEvent({ id: eventId });
      
      // Try to find again after sync
      event = await Event.findOne({ where: { suiEventId: eventId } });
      
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found on blockchain',
          eventId 
        });
      }
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      where: { eventId: event.id, userAddress }
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already registered for this event' 
      });
    }

    // Create registration
    const registration = await Registration.create({
      eventId: event.id,
      userAddress,
      userEmail,
      userName,
      registeredAt: new Date()
    });

    res.json({ 
      success: true, 
      data: registration 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      eventId: req.body.eventId,
      message: 'Registration failed' 
    });
  }
});

// Get registrations for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ where: { suiEventId: eventId } });
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    const registrations = await Registration.findAll({
      where: { eventId: event.id },
      order: [['registeredAt', 'DESC']]
    });

    res.json({ 
      success: true, 
      data: registrations 
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch registrations' 
    });
  }
});

// Sync events from blockchain
router.post('/sync-events', async (req, res) => {
  try {
    const syncService = new EventSyncService();
    await syncService.syncEventsFromBlockchain();
    
    res.json({ 
      success: true, 
      message: 'Events synced successfully' 
    });
  } catch (error) {
    console.error('Error syncing events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync events' 
    });
  }
});

// Sync a single event by id (background-friendly)
router.post('/sync-event', async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId is required' });
    }

    const syncService = new EventSyncService();
    const ok = await syncService.syncEventById(eventId);
    
    if (!ok) return res.status(404).json({ success: false, message: 'Event not found on chain' });

    res.json({ success: true, message: 'Event synced', eventId });
  } catch (error) {
    console.error('Error syncing single event:', error);
    res.status(500).json({ success: false, message: 'Failed to sync single event' });
  }
});

export default router;
