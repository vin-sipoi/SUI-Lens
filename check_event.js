import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import Event from './server/models/Event.js';
import sequelize from './server/config/db.js';

dotenv.config();

async function checkEvent() {
  try {
    console.log('Connecting to the database...');
    await sequelize.authenticate();
    console.log('Connected to the PostgreSQL database.');

    // Sync models to ensure they exist
    await sequelize.sync({ alter: true });

    const eventId = '0x54a3e76fd1ce640f3d1b0f47b8e6b1a26d62e6590f7ecc3e5000bc25d4803d3e';
    
    console.log(`Checking for event with suiEventId: ${eventId}`);
    
    // Find the event by suiEventId
    const event = await Event.findOne({
      where: {
        suiEventId: eventId
      }
    });

    if (!event) {
      console.log('Event not found in the database.');
      return;
    }

    console.log('Event found in database:');
    console.log('ID:', event.id);
    console.log('Title:', event.title);
    console.log('suiEventId:', event.suiEventId);
    console.log('Created by:', event.createdBy);
    console.log('Created at:', event.createdAt);

  } catch (error) {
    console.error('Error querying the database:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkEvent();
