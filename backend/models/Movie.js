import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required']
    },
    poster: {
      type: String,
      required: [true, 'Movie poster URL is required']
    },
    backdrop: {
      type: String,
      default: ''
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required']
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'Hindi'
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'UA 13+', 'UA 16+', 'A', 'PG-13', 'R'],
      default: 'UA'
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    cast: {
      type: [String],
      default: []
    },
    director: {
      type: String,
      default: 'N/A'
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['now-showing', 'coming-soon', 'archived'],
      default: 'now-showing'
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    bookingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'textSearchLanguage' });
movieSchema.index({ status: 1 });
movieSchema.index({ releaseDate: 1 });

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;

