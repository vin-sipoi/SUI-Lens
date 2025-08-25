import express from 'express';
import validator from 'validator';
import { Registration, Event, User } from '../models/index.js';
import emailService from '../lib/emailService.js';

const router = express.Router();

// Unified email registration endpoint
router.post('/register-email-unified', async (req, res) => {
  try {
    const { 
      email, 
      name, 
      eventId, 
      authenticationMethod, 
      walletAddress, 
      userId,
      emailConsent = true 
    } = req.body;

    // Validate input
    if (!email || !eventId || !authenticationMethod) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    if (!['web2', 'web3'].includes(authenticationMethod)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid authentication method' 
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

    // Check if already registered based on authentication method
    let existingRegistration;
    
    if (authenticationMethod === 'web2') {
      existingRegistration = await Registration.findOne({
        where: {
          email: email,
          eventId: eventId
        }
      });
    } else if (authenticationMethod === 'web3' && walletAddress) {
      existingRegistration = await Registration.findOne({
        where: {
          walletAddress: walletAddress,
          eventId: eventId
        }
      });
    }

    if (existingRegistration) {
      return res.status(409).json({ 
        success: false,
        message: 'Already registered for this event',
        registration: existingRegistration
      });
    }

    // Create registration
    const registration = await Registration.create({
      email,
      name,
      eventId,
      userId,
      walletAddress,
      authenticationMethod,
      emailConsent
    });

    // Send confirmation email
    try {
      await sendRegistrationConfirmation(email, name, event.title);
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

// Get registrations for an event
router.get('/registrations/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const registrations = await Registration.findAll({
      where: { eventId },
      include: [{
        model: Event,
        attributes: ['title', 'date', 'location']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Get registrations for email blast
router.get('/registrations-blast/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const registrations = await Registration.findAll({
      where: { 
        eventId,
        emailConsent: true 
      },
      attributes: ['email', 'name', 'authenticationMethod', 'createdAt']
    });

    const emailList = registrations.map(reg => ({
      email: reg.email,
      name: reg.name,
      source: reg.authenticationMethod
    }));

    res.json({
      success: true,
      emailList,
      count: emailList.length
    });
  } catch (error) {
    console.error('Error fetching email list:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

export default router;
