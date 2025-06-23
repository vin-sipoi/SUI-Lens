const { Resend } = require('resend');
require('dotenv').config();
const logger = require('../utils/logger');

// Resend client
const resend = new Resend(process.env.RESEND_API);

// Checks
resend.domains.list()
    .then(() => logger.info('Resend email setup is ready'))
    .catch(err => logger.error('Resend email setup failed:', err));

module.exports = resend;