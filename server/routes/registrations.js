const express = require('express');
const { Event, Registration, EmailBlast } = require('../models/index.js');
const EventSyncService = require('../services/eventSyncService.js');
const emailService = require('../lib/emailService.js');
const { generateEventQRCode } = require('../utils/qrCodeUtils.js');

const router = express.Router();

// Create registration with blockchain sync
router.post('/', async (req, res) => {
  try {
    const { eventId, email, name, userId } = req.body;

    if (!eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event ID is required' 
      });
    }

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'User email is required' 
      });
    }

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'User name is required' 
      });
    }

    // Normalize eventId to remove "0x" prefix if present
    const normalizedEventId = eventId;

    // Try to find event in database by UUID (direct ID)
    let event = await Event.findByPk(normalizedEventId);
    
    // If not found by UUID, try to find by blockchain event ID
    if (!event) {
      console.log(`Event ${normalizedEventId} not found by UUID, trying blockchain ID...`);
      event = await Event.findOne({ where: { suiEventId: normalizedEventId } });
    }
    
    // If event still not found, sync from blockchain
    if (!event) {
      console.log(`Event ${normalizedEventId} not found in DB, syncing from blockchain...`);
      
      const syncService = new EventSyncService();
      await syncService.syncSingleEvent({ id: normalizedEventId });
      
      // Try to find again after sync
      event = await Event.findOne({ where: { suiEventId: normalizedEventId } });
      
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found on blockchain',
          eventId 
        });
      }
    }

    // Check if the user is the event creator
    if (event.createdBy === userId) {
      return res.status(403).json({
        success: false,
        message: 'Event creator cannot register for their own event'
      });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      where: { eventId: event.id, email: email }
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
      email: email,
      name: name,
      registeredAt: new Date()
    });

    // Send email with event information and QR code
    try {
      // Generate QR code for the event
      const qrCodeDataUrl = await generateEventQRCode(event.id);
      
      // Send email with event details and QR code
      await emailService.sendEventRegistrationEmailWithQR(
        email,
        {
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          isVirtual: event.isVirtual,
          capacity: event.capacity,
          ticketPrice: event.ticketPrice,
          isFree: event.isFree,
          startTimestamp: event.startTimestamp,
          endTimestamp: event.endTimestamp
        },
        {
          name: name,
          email: email
        },
        qrCodeDataUrl
      );
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't fail the registration if email sending fails
    }

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
    
    // Normalize eventId to remove "0x" prefix if present
    const normalizedEventId = eventId.startsWith('0x') ? eventId.slice(2) : eventId;
    
    const event = await Event.findOne({ where: { suiEventId: normalizedEventId } });
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

    // Normalize eventId to remove "0x" prefix if present
    const normalizedEventId = eventId.startsWith('0x') ? eventId.slice(2) : eventId;

    const syncService = new EventSyncService();
    const ok = await syncService.syncEventById(normalizedEventId);

    if (!ok) return res.status(404).json({ success: false, message: 'Event not found on chain' });

    res.json({ success: true, message: 'Event synced', eventId });
  } catch (error) {
    console.error('Error syncing single event:', error);
    res.status(500).json({ success: false, message: 'Failed to sync single event' });
  }
});

// Send email blast to all registered users for an event
router.post('/email-blast', async (req, res) => {
  try {
    const { eventId, subject, content, userId } = req.body;

    if (!eventId || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'eventId, subject, and content are required'
      });
    }

    // Find the event
    const event = await Event.findOne({ where: { suiEventId: eventId } });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get all registrations for the event
    const registrations = await Registration.findAll({
      where: { eventId: event.id }
    });

    if (registrations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No registered users found for this event'
      });
    }

    // Extract email addresses
    const recipients = registrations.map(reg => reg.email);

    // Create email blast record
    const emailBlast = await EmailBlast.create({
      title: `Blast: ${subject}`,
      subject,
      content,
      eventId: event.id,
      userId: userId || null,
      recipientCount: recipients.length,
      status: 'draft'
    });

    // Send the email blast
    try {
      const results = await emailService.sendEmailBlast(recipients, {
        subject,
        content
      });

      // Update email blast status
      await emailBlast.update({
        status: 'sent',
        sentAt: new Date()
      });

      res.json({
        success: true,
        message: `Email blast sent to ${recipients.length} recipients`,
        emailBlastId: emailBlast.id,
        recipientCount: recipients.length
      });
    } catch (emailError) {
      console.error('Error sending email blast:', emailError);

      // Update email blast status to failed
      await emailBlast.update({
        status: 'failed'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to send email blast',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Error creating email blast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create email blast'
    });
  }
});

module.exports = router;
