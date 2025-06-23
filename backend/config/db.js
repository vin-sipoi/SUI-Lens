const mysql = require('mysql2/promise');
require('dotenv').config();

const logger = require('../utils/logger');

// ✅ **MySQL Connection Pool (MISSING IN YOUR CODE)**
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0
})

pool.getConnection()
  .then(() => logger.info('Connected to MySql database'))
  .catch(err => logger.error('MySql connection error:', err));

module.exports = pool;
