const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// OAuth2 client setup
const { OAuth2 } = google.auth;
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID, 
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URL
);

// Set the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Create Nodemailer transporter
const createTransporter = async () => {
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USERNAME,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
};

// Function to send a recovery email
const sendRecoveryEmail = async (email, token) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: 'no-reply@passwordmanager.com',
    to: email,
    subject: 'Password Recovery',
    text: `To reset your password, use this token: ${token}`,
    html: `<p>To reset your password, use this token: <strong>${token}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Recovery email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send recovery email to ${email}:`, error);
    throw new Error('Error sending email');
  }
};

module.exports = { sendRecoveryEmail };
