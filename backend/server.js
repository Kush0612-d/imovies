import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import cinemaRoutes from './routes/cinemaRoutes.js';
import screenRoutes from './routes/screenRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during local academic testing
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.status(200).json({
    status: 'UP',
    service: 'IMovies REST API Server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: states[mongoState] || 'Unknown',
      connected: mongoState === 1,
      name: mongoose.connection.name || 'imovies'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Welcome root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to IMovies API – Movie Ticket Booking Made Simple',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[IMovies API] Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

