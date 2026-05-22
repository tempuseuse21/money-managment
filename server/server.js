import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import dayRoutes from './routes/day.js';

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api', dayRoutes);

app.get('/', (_req, res) => {
  res.send({ status: 'Finance API is running' });
});

// connect DB and start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();