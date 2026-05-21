import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    income: {
      type: Number,
      required: true,
      min: 0,
    },
    expenses: {
      type: Number,
      required: true,
      min: 0,
    },
    otherExpenses: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Entry = mongoose.models.Entry || mongoose.model('Entry', entrySchema);
export default Entry;
