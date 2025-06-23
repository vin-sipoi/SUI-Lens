// A tool for log messages
const winston = require('winston');

// creating a logger to save messages to files
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Save errors 
        new winston.transports.File({ filename: 'logs/error.log', level: 'error'}),
        // Save the logs
        new winston.transports.File({ filename: 'logs/combined.log'})
    ]
});

// SHowing logs in the console
if(process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;