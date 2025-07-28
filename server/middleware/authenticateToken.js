require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
    req.user = decoded; // Attach decoded user info to request
    next(); // Proceed to the next middleware/route
  } catch (err) {
    console.error("JWT verification error:", err.message); // Log error for debugging
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

module.exports = verifyToken;
