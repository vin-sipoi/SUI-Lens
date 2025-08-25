import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_PORT'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Initialize Sequelize instance for PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  logging: console.log, // Log SQL queries
  timezone: '+00:00', // Set timezone to UTC
  dialectOptions: {
    ssl: {
      require: process.env.DB_SSLMODE === 'require',
      rejectUnauthorized: false, // Neon uses self-signed certificates
    },
  },
  pool: {
    max: 5, // Maximum number of connections
    min: 0, // Minimum number of connections
    acquire: 30000, // Max time to acquire a connection (ms)
    idle: 10000, // Max time a connection can be idle (ms)
  },
});

// Test connection
export async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to the PostgreSQL database with Sequelize');
  } catch (err) {
    console.error('❌ Unable to connect to the PostgreSQL database:', err);
    process.exit(1);
  }
}

// Export Sequelize instance
export default sequelize;
