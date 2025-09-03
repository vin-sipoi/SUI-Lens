const sequelize = require('./config/db');
const User = require('./models/userSchema');
const Event = require('./models/eventSchema');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    
    // First, create the schema if it doesn't exist
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS app_data');
    console.log('Schema app_data created or already exists');
    
    // Sync all models
    await sequelize.sync({ force: false }); // Use { force: true } to drop and recreate tables
    
    console.log('Database synchronized successfully!');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection test successful!');
    
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDatabase();
