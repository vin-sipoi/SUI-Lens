#!/usr/bin/env node

import sequelize from '../config/db.js';
import { User, Event, Registration, EmailBlast, EmailTemplate } from '../models/index.js';

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ force: true }); // force: true will drop existing tables
    
    console.log('✅ Database models synced successfully');
    
    // Optional: Create some initial data
    console.log('🔄 Creating initial data...');
    
    // Create a sample user
    const sampleUser = await User.create({
      email: 'admin@example.com',
      walletAddress: '0x1234567890abcdef',
      name: 'Admin User',
      isEmailVerified: true
    });
    
    // Create a sample event
    const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
    
    const sampleEvent = await Event.create({
      title: 'Sample Event',
      description: 'This is a sample event for testing',
      startDate: startDate,
      endDate: endDate,
      location: 'Virtual',
      capacity: 100,
      isFree: true,
      createdBy: sampleUser.id
    });
    
    // Create a sample email template
    const sampleTemplate = await EmailTemplate.create({
      name: 'Welcome Template',
      subject: 'Welcome to SUI Lens!',
      htmlContent: '<h1>Welcome!</h1><p>Thank you for registering.</p>',
      textContent: 'Welcome! Thank you for registering.',
      createdBy: sampleUser.id
    });
    
    console.log('✅ Initial data created successfully');
    console.log('📊 Database initialization complete!');
    
    // Display summary
    const userCount = await User.count();
    const eventCount = await Event.count();
    const templateCount = await EmailTemplate.count();
    
    console.log('\n📈 Database Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Events: ${eventCount}`);
    console.log(`- Email Templates: ${templateCount}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the initialization
initDatabase();
