import express from 'express';
import { Event, Registration, EmailBlast } from '../models/index.js';
import emailService from '../lib/emailService.js';

const router = express.Router();

// POST /api/send-blast-email
router.post('/', async (req, res) => {
  try {
    const { eventId, subject, content, title } = req.body;

    // Validate input
    if (!eventId || !subject || !content || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: eventId, subject, content, title' 
      });
    }

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Get all registered emails for the event
    const registrations = await Registration.findAll({
      where: { eventId },
      attributes: ['email', 'name'],
    });

    if (registrations.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No registrations found for this event' 
      });
    }

    // Create email blast record
    const emailBlast = await EmailBlast.create({
      title,
      subject,
      content,
      eventId,
      userId: req.user?.id || '00000000-0000-0000-0000-000000000000', // Default system user
      recipientCount: registrations.length,
    });

    // Send emails to all recipients
    const recipients = registrations.map(reg => reg.email);
    const emailResults = await emailService.sendEmailBlast(recipients, {
      subject,
      content,
    });

    // Update email blast status
    const successfulSends = emailResults.filter(result => result.success).length;
    const failedSends = emailResults.filter(result => !result.success).length;

    await emailBlast.update({
      status: failedSends === 0 ? 'sent' : 'failed',
      sentAt: new Date(),
    });

    res.json({
      success: true,
      emailBlast,
      results: {
        total: recipients.length,
        successful: successfulSends,
        failed: failedSends,
      },
      message: `Email blast sent to ${successfulSends} recipients`
    });
  } catch (error) {
    console.error('Send blast email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// GET /api/send-blast-email
router.get('/', async (req, res) => {
  try {
    const { eventId } = req.query;
    
    const whereClause = eventId ? { eventId } : {};
    
    const emailBlasts = await EmailBlast.findAll({
      where: whereClause,
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      emailBlasts,
      count: emailBlasts.length,
    });
  } catch (error) {
    console.error('Error fetching email blasts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;