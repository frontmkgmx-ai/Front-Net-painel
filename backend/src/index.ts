import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import storageRoutes from './routes/storage';
import systemRoutes from './routes/system';
import usersRoutes from './routes/users';
import dockerRoutes from './routes/docker';
import appsRoutes from './routes/apps';
import { errorHandler } from './middlewares/errorHandler';
import { setupInitialAdmin } from './services/setup';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

export const prisma = new PrismaClient();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Connect to Redis
export const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});
redisClient.connect()
  .then(() => console.log('Redis connected'))
  .catch(err => console.error('Redis connection error:', err));

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.DOMAIN ? [`https://${process.env.DOMAIN}`, `http://${process.env.DOMAIN}`] : '*',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api/apps', appsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const mongoStatus = mongoose.connection.readyState === 1;
    const redisStatus = redisClient.isReady;
    
    res.json({ 
      status: 'ok', 
      mysql: true,
      mongodb: mongoStatus,
      redis: redisStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database disconnected' });
  }
});

// Global Error Handler
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await setupInitialAdmin();
});
