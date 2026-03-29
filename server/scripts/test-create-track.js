import mongoose from 'mongoose';
import TrackService from '../src/services/TrackService.js';
import config from '../src/config/env.js';

async function testCreate() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected.');

    const userId = 'test-user-' + Date.now();
    const movieData = {
      userId,
      email: config.email.user, // Send to self for testing
      movieId: '123456',
      movieName: 'Test Movie ' + Date.now(),
      posterPath: '/test.jpg',
      city: 'Kochi'
    };

    console.log('Creating track and expecting confirmation email...');
    const track = await TrackService.createTrack(movieData);
    console.log('Track created successfully:', track._id);
    
    // Wait a bit for async email sending
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Test complete.');
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    process.exit(0);
  }
}

testCreate();
