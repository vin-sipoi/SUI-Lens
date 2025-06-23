const express = require('express');
const session = require('express-session');

const sessionConfig = require('./config/session');
const authRoutes = require('./routers/authRoutes');
const eventRoutes = require('./routers/eventsRoutes');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());
app.use(session(sessionConfig));

// Log every req to the server
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

// Add auth routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong'});
});

module.exports = app;