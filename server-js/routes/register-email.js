import express from 'express';
import validator from 'validator';
import { Registration, Event } from '../models/index.js';
import emailService from '../lib/emailService.js';

const router = express.Router();

// POST /api/register-email
router.post('/', async (req, res) => {
  try {
    const { email, name, eventId } = req.body;

    // Validate input
    if (!email || !name || !eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: email, name, eventId' 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
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

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      where: {
        email,
        eventId
      }
    });

    if (existingRegistration) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered for this event' 
      });
    }

    // Create registration
    const registration = await Registration.create({
      email,
      name,
      eventId
    });

    // Send confirmation email
    try {
      await emailService.sendEventRegistrationEmail(email, event, { name });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      registration,
      message: 'Email registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;
