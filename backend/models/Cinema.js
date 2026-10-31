import mongoose from 'mongoose';

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cinema name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: ['Indore', 'Bhopal', 'Mumbai', 'Delhi', 'Pune', 'Bengaluru'],
      index: true
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'Food Court', 'Wheelchair Accessible', 'Parking']
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80'
    },
    screens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

cinemaSchema.index({ city: 1, isActive: 1 });

const Cinema = mongoose.model('Cinema', cinemaSchema);
export default Cinema;

