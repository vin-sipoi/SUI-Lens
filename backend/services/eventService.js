const pool = require('../config/db');
const logger = require('../utils/logger');

class EventService {
    // Creating an event
    static async createEvent(userId, eventData){
        try{
            const {
                title, description, data, time, endTime, location, category,
                capacity, ticketPrice, isFree, requiresApproval, isPrivate, timezone
            } = eventData;

            const [result] = await pool.query(
                `INSERT INTO Event (
                userId, title, description, date, time, endTime, location, category,
                capacity, ticketPrice, isFree, requiresApproval, isPrivate, timezone
            ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
             [
                userId, title, description, date, time, endTime || null, location || null, category || null,
                capacity || null, ticketPrice || null, isFree, requiresApproval, isPrivate, timezone
             ]
            );

            logger.info(`Create event ID ${result.insertId} for user ${userId}`);
            return {id: result.insertId, ...eventData, userId};
        } catch (err) {
            logger.error('Error creating event:', err);
            throw new Error('Could not create event');
        }
    }

    // Get events user
    static async getUserEvents(userId){
        try{
            const [events] = await pool.query(
                'SELECT * FROM Event WHERE userId = ? ORDER BY createAt DESC',
                [userId]
            );
            logger.info(`Retrieved ${events.length} events for user ${userId}`);
            return events;
        } catch (err){
            logger.error('Error retrieving events:', err);
            throw new Error('Could not retrieve events');
        }
    }
}

module.exports = EventService;