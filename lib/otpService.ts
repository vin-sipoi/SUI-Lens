// Tools for random numbers and db access
import crypto from "crypto";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

class OTPService {
    static generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    static async storeOTP(email: string, otp: string) {
        try {
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            await prisma.oTP.create({
                data: { email, otp, expiresAt }
            });
            logger.info(`Saved OTP for ${email}`);
        } catch (err) {
            logger.error('Error Saving OTP:', err);
            throw new Error('Could not save OTP');
        }
    }

    static async verifyOTP(email: string, otp: string) {
        try {
            const found = await prisma.oTP.findFirst({
                where: { email, otp, expiresAt: { gt: new Date() } }
            });
            if (!found) {
                logger.warn(`Invalid or expired OTP for ${email}`);
                return false;
            }
            await prisma.oTP.deleteMany({ where: { email } });
            logger.info(`Verified and deleted OTP for ${email}`);
            return true;
        } catch (err) {
            logger.error('Error checking OTP:', err);
            throw new Error('Could not check OTP');
        }
    }
}


export const sendOtp = OTPService.storeOTP;
export const verifyOtp = OTPService.verifyOTP;
// If you have wallet login logic, export it similarly:
// export const walletLogin = OTPService.walletLogin;

export default OTPService;
