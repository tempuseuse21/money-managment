import express from 'express';
import Entry from '../models/Entry.js';

const router = express.Router();

const parseEntry = (body) => {
  const date = new Date(body.date);
  return {
    date,
    income: Number(body.income),
    expenses: Number(body.expenses),
    otherExpenses: Number(body.otherExpenses),
  };
};

router.post('/add-entry', async (req, res) => {
  try {
    const { date, income, expenses, otherExpenses } = req.body;

    if (!date || income === undefined || expenses === undefined || otherExpenses === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const parsed = parseEntry(req.body);

    if (Number.isNaN(parsed.income) || Number.isNaN(parsed.expenses) || Number.isNaN(parsed.otherExpenses)) {
      return res.status(400).json({ message: 'Income and expense values must be numbers' });
    }

    if (parsed.income < 0 || parsed.expenses < 0 || parsed.otherExpenses < 0) {
      return res.status(400).json({ message: 'Values cannot be negative' });
    }

    const entry = await Entry.create(parsed);
    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to add entry' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    const filter = {};

    if (month) {
      const [year, monthIndex] = month.split('-').map(Number);
      if (!year || !monthIndex) {
        return res.status(400).json({ message: 'Invalid month filter' });
      }
      const start = new Date(year, monthIndex - 1, 1);
      const end = new Date(year, monthIndex, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const entries = await Entry.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to retrieve entries' });
  }
});

router.delete('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await Entry.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete entry' });
  }
});

export default router;
