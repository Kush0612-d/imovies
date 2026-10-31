import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true
    },
    seats: {
      type: [bookedSeatSchema],
      required: true
    },
    baseAmount: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 30
    },
    taxAmount: {
      type: Number,
      default: 15
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid'
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    qrCodeDataUrl: {
      type: String,
      default: ''
    },
    secureVerificationCode: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

