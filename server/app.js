import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sponsorRoutes from './routes/sponsorRoutes.js';
import registrationsRouter from './routes/registrations.js';
import sendBlastEmailRouter from './routes/send-blast-email.js';
import eventsRouter from './routes/events.js';
import dotenv from 'dotenv';

dotenv.config();

// Polyfill for crypto in Node.js environment
if (typeof globalThis.crypto === 'undefined') {
  import('crypto').then((crypto) => {
    globalThis.crypto = crypto;
  });
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


// Authentication routes (e.g., login, registration)
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/registrations', registrationsRouter);
app.use('/api/send-blast-email', sendBlastEmailRouter);
app.use('/api/events', eventsRouter);

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
