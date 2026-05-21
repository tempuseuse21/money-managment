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

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
