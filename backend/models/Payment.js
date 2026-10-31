import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['mock_upi', 'mock_card', 'mock_netbanking', 'razorpay'],
      default: 'mock_upi'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentStatus: {
      type: String,
      enum: ['created', 'successful', 'failed', 'refunded'],
      default: 'successful'
    },
    razorpayOrderId: {
      type: String,
      default: ''
    },
    razorpayPaymentId: {
      type: String,
      default: ''
    },
    razorpaySignature: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

