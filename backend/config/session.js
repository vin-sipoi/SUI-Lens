// Toools for managing user sessions
const session = require('express-session');
const MySQLStore = require('express-mysql-session') (session);

const pool = require('../config/db');

// Setup
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({}, pool), // Saved in db
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) // 1 day
    }
};

module.exports = sessionConfig;