import express from 'express';
import Day from '../models/Day.js';

const router = express.Router();

const parseEntry = (body) => ({
  description: String(body.description || '').trim(),
  amount: Number(body.amount),
  type: String(body.type || 'income').trim().toLowerCase(),
  category: String(body.category || 'General').trim(),
});

const validateEntry = ({ description, amount, type }) => {
  if (!description || amount === undefined || type === undefined) {
    return 'Note, amount, and type are required';
  }

  if (Number.isNaN(Number(amount)) || amount < 0) {
    return 'Amount must be a valid non-negative number';
  }

  if (!['income', 'expenses', 'extra expenses'].includes(type)) {
    return 'Type must be income, expenses, or extra expenses';
  }

  return null;
};

router.post('/day', async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().slice(0, 10);

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const existing = await Day.findOne({ date });
    if (existing) {
      return res.status(409).json({ message: 'A record for this date already exists' });
    }

    const day = await Day.create({ date, entries: [] });
    res.status(201).json(day);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create new day' });
  }
});

router.get('/days', async (_req, res) => {
  try {
    const days = await Day.find().sort({ date: -1 });
    res.json(days);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load days' });
  }
});

router.get('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const day = await Day.findOne({ date });

    if (!day) {
      return res.status(404).json({ message: 'Day not found' });
    }

    res.json(day);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load day' });
  }
});

router.post('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const entry = parseEntry(req.body);
    const validationError = validateEntry(entry);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const day = await Day.findOne({ date });
    if (!day) {
      return res.status(404).json({ message: 'Day not found' });
    }

    day.entries.push(entry);
    await day.save();
    res.status(201).json(day);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to add entry to day' });
  }
});

router.delete('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const day = await Day.findOneAndDelete({ date });

    if (!day) {
      return res.status(404).json({ message: 'Day not found' });
    }

    res.json({ message: 'Day deleted', day });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete day' });
  }
});

router.delete('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const day = await Day.findOneAndUpdate(
      { 'entries._id': id },
      { $pull: { entries: { _id: id } } },
      { new: true }
    );

    if (!day) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted', day });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete entry' });
  }
});

export default router;
