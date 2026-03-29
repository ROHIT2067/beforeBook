import mongoose from 'mongoose';
import Track from '../src/models/Track.js';
import config from '../src/config/env.js';

async function resetTracks() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected.');

    const result = await Track.updateMany(
      { scraperError: true },
      { 
        $set: { 
          scraperError: false, 
          failureCount: 0 
        } 
      }
    );
    console.log(`Reset ${result.modifiedCount} tracks.`);
  } catch (err) {
    console.error('Reset failed:', err.message);
  } finally {
    process.exit(0);
  }
}

resetTracks();
