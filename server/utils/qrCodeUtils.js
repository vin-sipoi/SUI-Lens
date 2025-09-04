const QRCode = require('qrcode');

/**
 * Generate a QR code for event check-in
 * Format: suilens://checkin/{eventId}/{verificationCode}/{timestamp}
 */
async function generateEventQRCode(eventId) {
  // Generate a unique verification code
  const verificationCode = generateVerificationCode();
  const timestamp = Date.now();
  
  // Create the QR data URL format
  const qrData = `suilens://checkin/${eventId}/${verificationCode}/${timestamp}`;
  
  try {
    // Generate QR code as data URL (base64 encoded image)
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a random verification code
 */
function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = {
  generateEventQRCode
};
