const resend = require('../config/email');
require('dotenv').config();
const logger = require('../utils/logger');

// Class to send emails with resend
class EmailService {
    // Send an otp
    static async sendOTP(email, otp) {
        try{
            // Send email 
            const { data, error} = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL,
                to: [email],
                subject: 'Your OTP Code',
                html: `<p> YOur OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
            });

            if(error){
                logger.error('Resend email error:', error);
                throw new Error('Could not send OTP email');
            }

            logger.info(`Sent OTP email to ${email}`);
            return data;
        } catch (err){
            logger.error('Error sending OTP email:', err);
            throw new Error('Could not send OTP email');
        }
    }
}

module.exports = EmailService;