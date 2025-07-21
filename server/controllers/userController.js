const db = require('../config/db');
const { decrypt } = require('../utils/encryption');

// Fetch credentials for a specific domain (protected by JWT)
exports.getCredentials = async (req, res, next) => {
  const { domain } = req.body;

  try {
    const credentialsResult = await db.query('SELECT * FROM app_data.passwords WHERE site_name = $1', [domain]);
    if (credentialsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No credentials found for this site' });
    }

    const credentials = credentialsResult.rows[0];

    return res.json({
      siteName: credentials.site_name,
      username: credentials.username,
      password: decrypt(credentials.encrypted_password),
    });
  } catch (err) {
    next(err);
  }
};

// Protected Route for user (Example)
// userController.js
exports.protectedRoute = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized access: User is not logged in.' });
  }

  res.json({ message: 'This is a protected route', user: req.user });
};


module.exports = {
  getCredentials: exports.getCredentials,
  protectedRoute: exports.protectedRoute,
};
