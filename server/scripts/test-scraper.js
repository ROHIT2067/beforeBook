import ScraperService from '../src/services/ScraperService.js';
import logger from '../src/config/logger.js';
import mongoose from 'mongoose';
import config from '../src/config/env.js';

async function test() {
  try {
    console.log('Testing scraper for "Vaazha II" in "Kochi"...');
    const result = await ScraperService.checkShowtimes('Vaazha II', 'Kochi');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Scraper failed with error:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    process.exit(0);
  }
}

test();
