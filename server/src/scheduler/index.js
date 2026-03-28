import cron from 'node-cron';
import ScraperService from '../services/ScraperService.js';
import TrackService from '../services/TrackService.js';
import notifier from '../services/EmailProvider.js';
import config from '../config/env.js';
import logger from '../config/logger.js';

// ── Concurrency guard ──────────────────────────────────────────────────────
let isRunning = false;

const buildNotificationEmail = (track, showtime) => ({
  to: track.email,
  subject: `🎬 Showtimes Available — ${track.movieName} in ${track.city}!`,
  body: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">🎬 Showtimes Available!</h2>
      <p><strong>${track.movieName}</strong> now has showtimes in <strong>${track.city}</strong>.</p>
      ${
        showtime
          ? `<p>First detected showtime:</p>
             <ul>
               <li><strong>Time:</strong> ${showtime.time}</li>
               <li><strong>Theatre:</strong> ${showtime.theatre}</li>
             </ul>`
          : ''
      }
      <a href="https://in.bookmyshow.com" 
         style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin-top:12px;">
        Book Now on BookMyShow
      </a>
      <p style="margin-top:24px;font-size:12px;color:#888;">
        Sent by BeforeBook — this is an informational notification only.
        We do not book tickets on your behalf.
      </p>
    </div>
  `,
});

const runChecks = async () => {
  // ── Skip if already running ────────────────────────────────────────────
  if (isRunning) {
    logger.debug('[Scheduler] Previous tick still running — skipping this tick.');
    return;
  }

  isRunning = true;
  logger.info('[Scheduler] Starting showtime checks…');

  try {
    const pendingTracks = await TrackService.getPendingTracks();
    logger.info(`[Scheduler] Checking ${pendingTracks.length} pending track(s)`);

    for (const track of pendingTracks) {
      try {
        logger.debug(`[Scheduler] Checking: "${track.movieName}" in ${track.city}`);

        const result = await ScraperService.checkShowtimes(track.movieName, track.city);

        if (result.available) {
          // Notify user
          await notifier.send(buildNotificationEmail(track, result.showtime));
          await TrackService.markNotified(track._id, result.showtime);
          logger.info(
            `[Scheduler] ✅ Notified for "${track.movieName}" in ${track.city}`
          );
        } else {
          await TrackService.logNotAvailable(track._id);
          logger.debug(`[Scheduler] Not yet available: "${track.movieName}" in ${track.city}`);
        }
      } catch (err) {
        logger.error(
          `[Scheduler] Scraper error for "${track.movieName}" in ${track.city}: ${err.message}`
        );
        await TrackService.incrementFailure(track._id, config.scheduler.maxScraperFailures);
      }
    }
  } catch (err) {
    logger.error(`[Scheduler] Fatal error during tick: ${err.message}`);
  } finally {
    isRunning = false;
    logger.info('[Scheduler] Tick complete.');
  }
};

export const startScheduler = () => {
  const schedule = config.scheduler.cronSchedule;
  logger.info(`[Scheduler] Starting with schedule: "${schedule}"`);

  cron.schedule(schedule, runChecks, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  });
};
