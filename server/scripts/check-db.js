import mongoose from 'mongoose';
import Track from '../src/models/Track.js';
import config from '../src/config/env.js';

async function checkDb() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected.');

    const tracks = await Track.find({});
    console.log('Total tracks:', tracks.length);

    tracks.forEach((t) => {
      console.log(`Movie: ${t.movieName}, City: ${t.city}`);
      console.log(`- failureCount: ${t.failureCount}`);
      console.log(`- scraperError: ${t.scraperError}`);
      console.log(`- notified: ${t.notified}`);
      console.log(`- lastCheckedAt: ${t.lastCheckedAt}`);
      console.log(`- detectionLog (last 5):`, t.detectionLog.slice(-5));
      console.log('---');
    });
  } catch (err) {
    console.error('Database query failed:', err.message);
  } finally {
    process.exit(0);
  }
}

checkDb();
