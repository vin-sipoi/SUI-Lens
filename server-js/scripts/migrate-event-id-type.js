import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';

async function migrateEventIdType() {
  try {
    console.log('Starting migration to change Event.id from BIGINT to STRING...');
    
    // Drop foreign key constraints first
    await sequelize.query(`
      ALTER TABLE "registrations" 
      DROP CONSTRAINT IF EXISTS "registrations_eventId_fkey";
    `);
    
    // Change Event.id type
    await sequelize.query(`
      ALTER TABLE "Event" 
      ALTER COLUMN id TYPE VARCHAR(255);
    `);
    
    // Change registrations.eventId type
    await sequelize.query(`
      ALTER TABLE "registrations" 
      ALTER COLUMN "eventId" TYPE VARCHAR(255);
    `);
    
    // Recreate foreign key constraint
    await sequelize.query(`
      ALTER TABLE "registrations" 
      ADD CONSTRAINT "registrations_eventId_fkey" 
      FOREIGN KEY ("eventId") REFERENCES "Event"(id);
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrateEventIdType();
