import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmail(recipients, subject, html, text = null) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendEmail(recipient, subject, html, text);
      results.push({ recipient, ...result });
    }
    
    return results;
  }

  async sendEventRegistrationEmail(to, eventDetails, registrationDetails) {
    const subject = `Registration confirmed: ${eventDetails.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Registration Confirmed!</h2>
        <p>Hi ${registrationDetails.name},</p>
        <p>Your registration for <strong>${eventDetails.title}</strong> has been confirmed.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>Title:</strong> ${eventDetails.title}</p>
          <p><strong>Date:</strong> ${new Date(eventDetails.date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${eventDetails.location || 'TBD'}</p>
        </div>
        
        <p>We'll send you more details closer to the event date.</p>
        <p>Best regards,<br>The SUI Lens Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendEmailBlast(recipients, emailBlast) {
    const subject = emailBlast.subject;
    const html = emailBlast.content;

    return this.sendBulkEmail(recipients, subject, html);
  }
}

export default new EmailService();