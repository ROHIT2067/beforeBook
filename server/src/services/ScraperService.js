import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import logger from '../config/logger.js';
import config from '../config/env.js';

// Apply stealth plugin to avoid bot detection
chromium.use(StealthPlugin());

/**
 * Maps city names to BookMyShow city URL slugs.
 * Extend this map as needed.
 */
const CITY_SLUGS = {
  mumbai: 'mumbai',
  delhi: 'delhi-ncr',
  'delhi ncr': 'delhi-ncr',
  bangalore: 'bangalore',
  bengaluru: 'bangalore',
  hyderabad: 'hyderabad',
  chennai: 'chennai',
  kolkata: 'kolkata',
  pune: 'pune',
  ahmedabad: 'ahmedabad',
  jaipur: 'jaipur',
  lucknow: 'lucknow',
  chandigarh: 'chandigarh',
  kochi: 'kochi',
  goa: 'goa',
};

/**
 * Returns a BookMyShow movie search URL for a given movie name and city.
 */
const buildUrl = (movieName, city) => {
  const citySlug = CITY_SLUGS[city.toLowerCase()] || city.toLowerCase().replace(/\s+/g, '-');
  const movieSlug = movieName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `https://in.bookmyshow.com/explore/movies-${citySlug}`;
};

/**
 * Scrapes BookMyShow to check if showtimes are available for a given movie+city.
 * Confirms availability twice before returning true.
 *
 * @param {string} movieName
 * @param {string} city
 * @returns {Promise<{ available: boolean, showtime?: { time: string, theatre: string } }>}
 */
const checkShowtimes = async (movieName, city) => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const ctx = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      locale: 'en-IN',
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });

    const page = await ctx.newPage();

    const citySlug =
      CITY_SLUGS[city.toLowerCase()] || city.toLowerCase().replace(/\s+/g, '-');
    const url = `https://in.bookmyshow.com/explore/movies-${citySlug}`;

    logger.debug(`[Scraper] Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Use DOM content — search for movie by name (case-insensitive)
    // We look for any anchor/link/card whose text matches the movie name
    const movieNameLower = movieName.toLowerCase();

    const foundMovie = await page.evaluate((movieNameLower) => {
      const allLinks = Array.from(document.querySelectorAll('a, [data-testid]'));
      return allLinks.some(
        (el) => el.textContent && el.textContent.toLowerCase().includes(movieNameLower)
      );
    }, movieNameLower);

    if (!foundMovie) {
      logger.debug(`[Scraper] Movie "${movieName}" not found in ${city} listing.`);
      return { available: false };
    }

    // Find and click the movie to go to its showtime page
    const movieLink = await page
      .locator(`a:has-text("${movieName}")`)
      .first()
      .getAttribute('href')
      .catch(() => null);

    let showtimesFound = false;
    let showtimeDetails = null;

    if (movieLink) {
      const moviePageUrl = movieLink.startsWith('http')
        ? movieLink
        : `https://in.bookmyshow.com${movieLink}`;

      logger.debug(`[Scraper] Navigating to movie page: ${moviePageUrl}`);
      await page.goto(moviePageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait briefly for dynamic content
      await page.waitForTimeout(3000);

      // Count showtime items — look for elements containing time-like patterns
      const showtimeData = await page.evaluate(() => {
        // Try to find showtime entries by looking for time-pattern text nodes
        const allText = Array.from(document.querySelectorAll('*'));
        const timePattern = /\d{1,2}:\d{2}\s*(AM|PM)/i;

        let theatreName = null;
        let showtime = null;

        for (const el of allText) {
          const text = el.textContent?.trim() || '';
          if (timePattern.test(text) && text.length < 30) {
            showtime = text.match(timePattern)?.[0] || null;
            // Walk up DOM to find theatre name
            let parent = el.parentElement;
            for (let i = 0; i < 8 && parent; i++) {
              const h = parent.querySelector('h2, h3, h4, [class*="theatre"], [class*="venue"], [class*="cinema"]');
              if (h && h.textContent.trim().length > 3) {
                theatreName = h.textContent.trim();
                break;
              }
              parent = parent.parentElement;
            }
            break;
          }
        }

        return { showtimeCount: showtime ? 1 : 0, showtime, theatreName };
      });

      showtimesFound = showtimeData.showtimeCount > 0;
      if (showtimesFound) {
        showtimeDetails = {
          time: showtimeData.showtime || 'See website',
          theatre: showtimeData.theatreName || 'See website',
        };
      }
    } else {
      // If no direct movie link found by href, check current page for showtimes
      showtimesFound = foundMovie;
    }

    if (!showtimesFound) {
      return { available: false };
    }

    // ── Double-confirm: wait, then check again ──────────────────────────────
    const delayMs = config.scheduler.confirmDelaySeconds * 1000;
    logger.debug(`[Scraper] First check positive — waiting ${delayMs}ms to confirm…`);
    await page.waitForTimeout(delayMs);

    // Re-check on current page
    const reConfirm = await page.evaluate(() => {
      const timePattern = /\d{1,2}:\d{2}\s*(AM|PM)/i;
      const allNodes = Array.from(document.querySelectorAll('*'));
      return allNodes.some(
        (el) => el.textContent && timePattern.test(el.textContent.trim()) && el.textContent.trim().length < 30
      );
    });

    if (!reConfirm) {
      logger.warn(`[Scraper] Second check failed — showtimes may have disappeared (transient). Treating as not available.`);
      return { available: false };
    }

    logger.info(`[Scraper] ✅ Showtimes confirmed for "${movieName}" in ${city}`);
    return { available: true, showtime: showtimeDetails };
  } catch (err) {
    logger.error(`[Scraper] Error checking showtimes for "${movieName}" in ${city}: ${err.message}`);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
};

export default { checkShowtimes };
