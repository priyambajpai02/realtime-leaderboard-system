import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.js';
import initSocket from './socket/index.js';
import { startCronJobs } from './utils/cronJobs.js';
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
app.use(cors());
// Middleware
app.use(express.json());
app.use(compression()); // Enable response compression

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
initSocket(server);

// Start cron jobs
startCronJobs();

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});