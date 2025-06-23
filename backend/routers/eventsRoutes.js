const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');
const { validateCreateEvent, checkValidationResult} = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

// Routes
router.post('/create', validateCreateEvent, checkValidationResult, requireAuth, EventController.createEvent);
router.get('/', requireAuth,EventController.getUserEvents);

module.exports = router;