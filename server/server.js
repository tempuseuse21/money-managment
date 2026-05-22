import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import dayRoutes from './routes/day.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', dayRoutes);

app.get('/', (_req, res) => {
  res.send({ status: 'Finance API is running' });
});

// CONNECT DB (important)
await connectDB();

// EXPORT instead of listen
export default app;
