import Track from '../models/Track.js';
import logger from '../config/logger.js';
import notifier from './EmailProvider.js';

/**
 * Create a new tracking entry.
 * Also computes estimatedAvailableAt from historical detection logs.
 */
const createTrack = async ({ userId, email, movieId, movieName, posterPath, city }) => {
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
    email,
    movieId,
    movieName,
    posterPath,
    city,
    estimatedAvailableAt,
  });

  await track.save();
  logger.info(`[TrackService] Created track: ${movieName} in ${city} for user ${userId}`);

  // ── Send confirmation email ───────────────────────────────────────────
  try {
    const confirmationEmail = buildConfirmationEmail(track);
    await notifier.send(confirmationEmail);
    logger.debug(`[TrackService] Sent confirmation email to ${email}`);
  } catch (err) {
    logger.error(`[TrackService] Failed to send confirmation email: ${err.message}`);
    // Non-fatal, we don't throw here to avoid failing the track creation
  }

  return track;
};

/**
 * Builds the confirmation email object.
 */
const buildConfirmationEmail = (track) => {
  const estimatedDateStyle = {
    color: '#6366f1',
    fontWeight: 'bold',
  };

  const estimatedInfo = track.estimatedAvailableAt
    ? `<p>Our current estimate for bookings to open is around: 
         <span style="color: #6366f1; font-weight: bold;">
           ${new Date(track.estimatedAvailableAt).toLocaleDateString('en-IN', {
             day: 'numeric',
             month: 'short',
             hour: '2-digit',
             minute: '2-digit',
           })}
         </span>
       </p>`
    : '<p>Our system is currently analyzing historical data to estimate when bookings might open.</p>';

  return {
    to: track.email,
    subject: `🔔 Reminder Set: ${track.movieName} in ${track.city}`,
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #6366f1;">🔔 Reminder Registered!</h2>
        <p>Hi there,</p>
        <p>We've successfully set a reminder for <strong>${track.movieName}</strong> in <strong>${track.city}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; font-size: 16px;">What happens next?</h3>
          <p style="margin-bottom: 0;">We'll keep a close eye on BookMyShow for you. As soon as we detect any available showtimes, we'll send you an immediate alert so you can book your tickets!</p>
        </div>

        ${estimatedInfo}

        <p style="margin-top: 24px; font-size: 12px; color: #888;">
          Sent by BeforeBook — we'll notify you as soon as bookings go live.
        </p>
      </div>
    `,
  };
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
      lastErrorMessage: null, // Clear error on success
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
    lastErrorMessage: null, // Clear error on successful check
    $push: { detectionLog: { timestamp: new Date(), result: 'not_available' } },
  });
};

/**
 * Increment failure count; set scraperError if threshold reached.
 */
const incrementFailure = async (trackId, maxFailures, errorMessage = 'Unknown scraper error') => {
  const track = await Track.findById(trackId);
  if (!track) return;

  track.failureCount += 1;
  track.lastCheckedAt = new Date();
  track.lastErrorMessage = errorMessage;
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
