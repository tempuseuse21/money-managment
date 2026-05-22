import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import dayRoutes from './routes/day.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', dayRoutes);

app.get('/', (_req, res) => {
  res.send({ status: 'Finance API is running' });
});

// ✅ Connect DB (NO app.listen)
let isConnected = false;

async function connect() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

// ✅ Export handler for Vercel
export default async function handler(req, res) {
  await connect();
  return app(req, res);
}