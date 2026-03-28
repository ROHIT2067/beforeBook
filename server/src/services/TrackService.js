import Track from '../models/Track.js';
import logger from '../config/logger.js';

/**
 * Create a new tracking entry.
 * Also computes estimatedAvailableAt from historical detection logs.
 */
const createTrack = async ({ userId, movieId, movieName, posterPath, city }) => {
  // Prevent duplicate: handled by DB unique index, but check first for a cleaner error
  const existing = await Track.findOne({ userId, movieId, city });
  if (existing) {
    const err = new Error('Already tracking this movie in this city');
    err.status = 409;
    throw err;
  }

  // ── Estimate availability from historical data ───────────────────────────
  let estimatedAvailableAt = null;
  try {
    const historicalTracks = await Track.find({
      movieId,
      notified: true,
      'detectionLog.0': { $exists: true },
    }).select('createdAt detectionLog').lean();

    if (historicalTracks.length > 0) {
      const durations = historicalTracks.map((t) => {
        const firstSuccess = t.detectionLog.find((log) => log.result === 'available');
        if (firstSuccess) {
          return new Date(firstSuccess.timestamp) - new Date(t.createdAt);
        }
        return null;
      }).filter(Boolean);

      if (durations.length > 0) {
        const avgMs = durations.reduce((a, b) => a + b, 0) / durations.length;
        estimatedAvailableAt = new Date(Date.now() + avgMs);
        logger.info(
          `[TrackService] Estimated availability for movieId=${movieId}: ${estimatedAvailableAt.toISOString()}`
        );
      }
    }
  } catch (err) {
    logger.warn(`[TrackService] Could not compute estimated availability: ${err.message}`);
  }

  const track = new Track({
    userId,
    movieId,
    movieName,
    posterPath,
    city,
    estimatedAvailableAt,
  });

  await track.save();
  logger.info(`[TrackService] Created track: ${movieName} in ${city} for user ${userId}`);
  return track;
};

/**
 * Get all tracks for a user.
 */
const getTracksForUser = async (userId) => {
  return Track.find({ userId }).sort({ createdAt: -1 }).lean();
};

/**
 * Delete a track by ID.
 */
const deleteTrack = async (id) => {
  const result = await Track.findByIdAndDelete(id);
  if (!result) {
    const err = new Error('Track not found');
    err.status = 404;
    throw err;
  }
  return result;
};

/**
 * Get all un-notified, non-errored tracks (used by scheduler).
 */
const getPendingTracks = async () => {
  return Track.find({ notified: false, scraperError: false });
};

/**
 * Mark a track as notified with showtime details.
 */
const markNotified = async (trackId, showtimeDetails) => {
  return Track.findByIdAndUpdate(
    trackId,
    {
      notified: true,
      lastCheckedAt: new Date(),
      firstShowtimeDetails: showtimeDetails,
      $push: {
        detectionLog: { timestamp: new Date(), result: 'available' },
      },
    },
    { new: true }
  );
};

/**
 * Log a "not available" detection event.
 */
const logNotAvailable = async (trackId) => {
  return Track.findByIdAndUpdate(trackId, {
    lastCheckedAt: new Date(),
    $push: { detectionLog: { timestamp: new Date(), result: 'not_available' } },
  });
};

/**
 * Increment failure count; set scraperError if threshold reached.
 */
const incrementFailure = async (trackId, maxFailures) => {
  const track = await Track.findById(trackId);
  if (!track) return;

  track.failureCount += 1;
  track.lastCheckedAt = new Date();
  track.detectionLog.push({ timestamp: new Date(), result: 'error' });

  if (track.failureCount >= maxFailures) {
    track.scraperError = true;
    logger.warn(
      `[TrackService] Track ${trackId} (${track.movieName}) marked as scraperError after ${track.failureCount} failures`
    );
  }

  await track.save();
  return track;
};

export default {
  createTrack,
  getTracksForUser,
  deleteTrack,
  getPendingTracks,
  markNotified,
  logNotAvailable,
  incrementFailure,
};
