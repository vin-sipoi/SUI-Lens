import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
    const isSecure = process.env.EMAIL_SECURE === 'true';
    
    // For port 587, we typically use STARTTLS which requires secure: false
    const secure = smtpPort === 465 ? isSecure : false;
    
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
      // Enable STARTTLS for port 587 if needed
      ...(smtpPort === 587 && { requireTLS: true })
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

  async sendEventRegistrationEmailWithQR(to, eventDetails, registrationDetails, qrCodeDataUrl) {
    const subject = `Registration confirmed: ${eventDetails.title}`;
    const eventDate = eventDetails.date ? new Date(eventDetails.date).toLocaleDateString() : 'TBD';
    const eventTime = eventDetails.startTimestamp ? new Date(eventDetails.startTimestamp).toLocaleTimeString() : 'TBD';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Registration Confirmed!</h2>
        <p>Hi ${registrationDetails.name},</p>
        <p>Your registration for <strong>${eventDetails.title}</strong> has been confirmed.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>Title:</strong> ${eventDetails.title}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          ${eventDetails.location ? `<p><strong>Location:</strong> ${eventDetails.location}</p>` : ''}
          ${!eventDetails.isFree ? `<p><strong>Ticket Price:</strong> ${eventDetails.ticketPrice} SUI</p>` : '<p><strong>Ticket Type:</strong> Free</p>'}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <h3>Your Event QR Code</h3>
          <p>Use this QR code for check-in at the event:</p>
          <img src="${qrCodeDataUrl}" alt="Event QR Code" style="max-width: 200px; height: auto;" />
        </div>
        
        <p>Please save this email or screenshot the QR code for check-in at the event.</p>
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