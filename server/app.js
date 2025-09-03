const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const eventRoutes = require('./routes/eventRoutes');
const verifyToken = require('./middleware/authenticateToken');
const { csrfProtection, csrfTokenHandler } = require('./middleware/csrfMiddleware');
// Load environment variables from client/.env first, then server/.env as fallback
require('dotenv').config({ path: '../client/.env' });
require('dotenv').config(); // Load server/.env if it exists

// Debug logging for environment variables
console.log('Environment variables loaded:');
console.log('- NEXT_PUBLIC_PACKAGE_ID:', process.env.NEXT_PUBLIC_PACKAGE_ID ? '✅ Set' : '❌ Not set');
console.log('- NEXT_PUBLIC_EVENT_REGISTRY_ID:', process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID ? '✅ Set' : '❌ Not set');
console.log('- ENOKI_PRIVATE_KEY:', process.env.ENOKI_PRIVATE_KEY ? '✅ Set' : '❌ Not set');

// Show which values will actually be used (with fallbacks)
const effectivePackageId = process.env.PACKAGE_ID || process.env.NEXT_PUBLIC_PACKAGE_ID;
const effectiveRegistryId = process.env.EVENT_REGISTRY_ID || process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID;
console.log('\nEffective configuration:');
console.log('- Package ID (effective):', effectivePackageId ? `✅ ${effectivePackageId.substring(0, 10)}...` : '❌ Not configured');
console.log('- Registry ID (effective):', effectiveRegistryId ? `✅ ${effectiveRegistryId.substring(0, 10)}...` : '❌ Not configured');

// Polyfill for crypto in Node.js environment
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto');
}

const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Configure CORS to allow requests from the frontend with credentials
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'https://accounts.google.com'],  // Allow frontend and Google
  credentials: true,   // Allow cookies to be sent in cross-origin requests
}));

// CSRF token endpoint (apply csrfProtection to make req.csrfToken available)
app.get('/csrf-token', csrfProtection, csrfTokenHandler);

// Apply CSRF protection and authentication only to protected routes
app.use('/account', csrfProtection, verifyToken, userRoutes);

// Public user routes (no authentication required)
app.use('/api/user', userRoutes);

// Authentication routes (e.g., login, registration)
app.use('/auth', authRoutes);
app.use('/api/sponsor', sponsorRoutes);

// Events routes
app.use('/api/events', eventRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Server is Active and Running!');
});

// Test JSON endpoint
app.get('/test-json', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Test JSON response',
    test: true 
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
