import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import sequelize from './config/db.js';
import registrationsRouter from './routes/registrations.js';
import registerEmailRouter from './routes/register-email.js';
import registerEmailUnifiedRouter from './routes/register-email-unified.js';
import sendBlastEmailRouter from './routes/send-blast-email.js';
import eventsRouter from './routes/events.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/registrations', registrationsRouter);
app.use('/api/register-email', registerEmailRouter);
app.use('/api/register-email-unified', registerEmailUnifiedRouter);
app.use('/api/send-blast-email', sendBlastEmailRouter);
app.use('/api/events', eventsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
