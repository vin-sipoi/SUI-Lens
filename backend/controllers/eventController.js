const EventService = require('../services/eventService');
const logger = require('../utils/logger');

class EventController {
    // Creating an event
    static async createEvent(req, res) {
        const userId = req.session.userId;
        const eventData = req.body;
        try{
            const event = await EventService.createEvent(userId, eventData);
            res.status(201).json({ message: 'Event created successfully', event});
        } catch (err) {
            logger.error('Create event error:', err);
            res.status(500).json({ error: 'Failed to create event'});
        }
    }

    // Get user events
    static async getUserEvents(req, res) {
        const userId = req.session.userId;
        try{
            const events = await EventService.getUserEvents(userId);
            res.status(200).json({events});
        } catch (err) {
            logger.error('Get events error:', err);
            res.status(500).json({ error: 'Failed to retrieve events'});
        }
    }
}

module.exports = EventController;