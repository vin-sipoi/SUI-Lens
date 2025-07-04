import resend from '@/lib/email';
import logger from '@/lib/logger';

class EmailService {
    static async sendOTP(email: string, otp: string) {
        try {
            const { data, error } = await resend.emails.send({
                from: "dev@suilense.com",
                to: [email],
                subject: 'Your OTP Code',
                html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
            });
            if (error) {
                logger.error('Resend email error:', error);
                throw new Error('Could not send OTP email');
            }
            logger.info(`Sent OTP email to ${email}`);
            return data;
        } catch (err) {
            logger.error('Error sending OTP email:', err);
            throw new Error('Could not send OTP email');
        }
    }
}

export default EmailService;
