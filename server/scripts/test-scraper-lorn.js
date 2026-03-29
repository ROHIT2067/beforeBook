import ScraperService from '../src/services/ScraperService.js';
import logger from '../src/config/logger.js';

async function test() {
  try {
    console.log('Testing scraper for "L o r n" (with spaces)...');
    const result = await ScraperService.checkShowtimes('L o r n', 'Kochi');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Scraper failed with error:', err.message);
  } finally {
    process.exit(0);
  }
}

test();
