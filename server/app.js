const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const verifyToken = require('./middleware/authenticateToken');
const { csrfProtection, csrfTokenHandler } = require('./middleware/csrfMiddleware');
require('dotenv').config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Configure CORS to allow requests from the frontend with credentials
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'https://accounts.google.com'],  // Allow frontend and Google
  credentials: true,   // Allow cookies to be sent in cross-origin requests
}));

// CSRF token endpoint (apply csrfProtection to make req.csrfToken available)
app.get('/csrf-token', csrfProtection, csrfTokenHandler);

// Apply CSRF protection and authentication only to protected routes
app.use('/account', csrfProtection, verifyToken, userRoutes);

// Authentication routes (e.g., login, registration)
app.use('/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Server is Active and Running!');
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
