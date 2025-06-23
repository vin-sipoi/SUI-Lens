const pool = require('../config/db');
const OTPService = require('../services/otpService');
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

// Class to handle login
class AuthController {
    // Handle otp req
    static async requestOTP(req, res) {
        const { email } = req.body;
        try{
            // Check if user exists
            const [users] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
            if(users.length === 0) {
                logger.warn(`No user found for ${email}`);
                return res.status(404).json({ error: 'User not found'});
            }

            // Create and save otp
            const otp = OTPService.generateOTP();
            await OTPService.storeOTP(email, otp);
            await EmailService.sendOTP(email, otp);
            res.status(200).json({ message: 'OTP sent to your email'});
        } catch (err) {
            logger.error('Error in requestOTP:', err);
            res.status(500).json({ error: 'Could not send OTP'});
        }
    }

    // Handle otp verification
    static async verifyOTP(req, res) {
        const { email, otp } = req.body;
        try{
            // Check otp is valid
            const isValid = await OTPService.verifyOTP(email, otp);
            if(!isValid) {
                return res.status(400).json({error: 'Invalid or expired OTP'});
            }

            // Get user's id
            const [users] = await pool.query('SELECT id FROM User WHERE email = ?', [email]);
            if(users.length === 0) {
                logger.warn(`No user found after OTP check: ${email}`);
                return res.status(404).json({ error: 'User not found'});
            }

            // Save user info in the session to log them in
            req.session.userId = users[0].id;
            req.session.email = email;
            logger.info(`Logged in user: ${email}`);
            res.status(200).json({ message: 'Logged in successfully'});
        } catch (err) {
            logger.error('Error in VerifyOTP:', err);
            res.status(500).json({ error: 'Could not verify OTP'});
        }
    }
    // Handle user's profile
    static async getProfile(req, res) {
        try{
            // Send welcome message with user's email
            res.status(200).json({message: `Welcome, ${req.session.email}`});
        } catch (err) {
            logger.error('Error in getProfile:', err);
            res.status(500).json({ error: 'Could not get profile'});
        }
    }
}

module.exports = AuthController;
