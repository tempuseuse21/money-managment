import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expenses', 'extra expenses'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const daySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    entries: {
      type: [entrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Day = mongoose.models.Day || mongoose.model('Day', daySchema);
export default Day;
