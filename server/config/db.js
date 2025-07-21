const { Sequelize } = require('sequelize');
require('dotenv').config();

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Set up the Sequelize instance for PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  logging: false, // Disable logging queries in the console
  dialectOptions: {
    ssl: {
      require: process.env.DB_SSLMODE === 'require',
      rejectUnauthorized: false, // Neon uses self-signed certificates
    },
  },
  pool: {
    max: 5, // Maximum number of connections in pool
    min: 0, // Minimum number of connections in pool
    acquire: 30000, // Maximum time (ms) to acquire a connection
    idle: 10000, // Maximum time (ms) a connection can be idle
  },
});

// Test the connection
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connected to the PostgreSQL database with Sequelize');
  } catch (err) {
    console.error('Unable to connect to the PostgreSQL database:', err);
    process.exit(1);
  }
}

connectToDatabase();

// Export the Sequelize instance for use in other parts of the app
module.exports = sequelize;