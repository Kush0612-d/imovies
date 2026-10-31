import mongoose from 'mongoose';

const seatCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Premium', 'Regular'],
    default: 'Regular'
  },
  price: {
    type: Number,
    required: true
  },
  rows: {
    type: [String],
    required: true
  }
}, { _id: false });

const screenSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required'],
      index: true
    },
    screenName: {
      type: String,
      required: [true, 'Screen name/number is required'],
      trim: true
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats count is required'],
      default: 80
    },
    seatCategories: {
      type: [seatCategorySchema],
      default: [
        { name: 'Premium', price: 350, rows: ['A', 'B'] },
        { name: 'Regular', price: 220, rows: ['C', 'D', 'E', 'F', 'G', 'H'] }
      ]
    },
    rowsCount: {
      type: Number,
      default: 8
    },
    seatsPerRow: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
);

const Screen = mongoose.model('Screen', screenSchema);
export default Screen;

