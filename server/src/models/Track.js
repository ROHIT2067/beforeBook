import mongoose from 'mongoose';

const detectionLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    result: { type: String, required: true }, // 'available' | 'not_available' | 'error'
  },
  { _id: false }
);

const trackSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    movieId: { type: String, required: true },
    movieName: { type: String, required: true },
    posterPath: { type: String },
    city: { type: String, required: true },
    notified: { type: Boolean, default: false },
    lastCheckedAt: { type: Date },
    firstShowtimeDetails: {
      time: { type: String },
      theatre: { type: String },
    },
    detectionLog: [detectionLogSchema],
    failureCount: { type: Number, default: 0 },
    scraperError: { type: Boolean, default: false },
    estimatedAvailableAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate tracking entries
trackSchema.index({ userId: 1, movieId: 1, city: 1 }, { unique: true });

const Track = mongoose.model('Track', trackSchema);
export default Track;
