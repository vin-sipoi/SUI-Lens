// Tools for random numbers and db access
const crypto = require('crypto');
const pool = require('../config/db');
const logger = require('../utils/logger');

// handle of otp and checks
class OTPService {
    // Creation of 6 digits
    static generateOTP(){
        return crypto.randomInt(100000, 999999).toString();
    }

    // Save OTP in db
    static async storeOTP(email, otp){
        try{
            // Set otp to expire in 5 mins
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            // Insert OTP into the OTP table
            await pool.query(
                'INSERT INTO OTP (email, otp, expiresAt) VALUES (?, ?, ?)',
                [email, otp, expiresAt]
            );
            logger.info(`Saved OTP for ${email}`);
        } catch (err){
            logger.error('Error Saving OTP:', err);
            throw new Error('Could not save OTP');
        }
    }

    // Check if otp is valid
    static async verifyOTP(email, otp){
        try {
            // Checking in the db
            const [otps] = await pool.query(
                'SELECT * FROM OTP WHERE email = ? AND otp = ? AND expiresAt > NOW()',
                [email, otp]
            );
            // Valid or expired
            if(otps.length === 0) {
                logger.warn(`Invalid or expired OTP for ${email}`);
                return false;
            }

            // Deleting otp so it can't be used again
            await pool.query('DELETE FROM OTP WHERE email =?', [email]);
            logger.info(`Verified and deleted OTP for ${email}`);
            return true;
        } catch (err) {
            logger.error('Error checking OTP:', err);
            throw new Error('Could not check OTP');
        }
    }
}

module.exports = OTPService;