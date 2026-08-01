import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import resumeRoutes from './routes/resumeRoutes';
import interviewRoutes from './routes/interviewRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import codingRoutes from './routes/codingRoutes';
import adminCodingRoutes from './routes/adminCodingRoutes';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'https://interview-forge-wine.vercel.app',
    'http://localhost:5173',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// MUST be before any other middleware or routes to handle preflight correctly
app.use(cors(corsOptions));

// Middleware
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/reports', analyticsRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/admin/coding', adminCodingRoutes);

// Health check route
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
