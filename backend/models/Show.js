import mongoose from 'mongoose';

const seatStatusSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true
    },
    row: {
      type: String,
      required: true
    },
    col: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['Premium', 'Regular'],
      default: 'Regular'
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available'
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required'],
      index: true
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required']
    },
    showDate: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Show date is required (YYYY-MM-DD)'],
      index: true
    },
    startTime: {
      type: String, // e.g. '06:30 PM'
      required: [true, 'Start time is required']
    },
    ticketPrice: {
      premium: { type: Number, default: 350 },
      regular: { type: Number, default: 220 }
    },
    seats: {
      type: [seatStatusSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent schedule conflicts on the same screen, date, and time
showSchema.index({ screenId: 1, showDate: 1, startTime: 1 }, { unique: true });
showSchema.index({ movieId: 1, cinemaId: 1, showDate: 1 });

const Show = mongoose.model('Show', showSchema);
export default Show;

