import axios from 'axios';
import config from '../config/env.js';
import logger from '../config/logger.js';

// Static fallback movies for when TMDB is unavailable
const FALLBACK_MOVIES = [
  { id: 'fallback-1', title: 'Fighter', overview: 'Action thriller about IAF officers.', poster_path: null, release_date: '2024-01-25' },
  { id: 'fallback-2', title: 'Kalki 2898 AD', overview: 'Mythological sci-fi action epic.', poster_path: null, release_date: '2024-06-27' },
  { id: 'fallback-3', title: 'Stree 2', overview: 'Horror comedy sequel.', poster_path: null, release_date: '2024-08-15' },
  { id: 'fallback-4', title: 'Sky Force', overview: 'Action drama based on true events.', poster_path: null, release_date: '2025-01-24' },
  { id: 'fallback-5', title: 'Chhaava', overview: 'Epic historical drama.', poster_path: null, release_date: '2025-02-14' },
];

/**
 * Fetch upcoming movies from TMDB with Indian region settings.
 * Falls back to static list on API failure.
 */
const getUpcomingMovies = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    const { data } = await axios.get(`${config.tmdb.baseUrl}/discover/movie`, {
      params: {
        api_key: config.tmdb.apiKey,
        region: 'IN',
        language: 'en-IN',
        'primary_release_date.gte': today,
        'primary_release_date.lte': nextMonthStr,
        sort_by: 'primary_release_date.asc',
        with_origin_country: 'IN',
        with_release_type: '2|3', // Theatrical releases
        page: 1,
      },
      timeout: 8000,
    });

    const movies = data.results.map((m) => ({
      id: String(m.id),
      title: m.title,
      overview: m.overview,
      poster_path: m.poster_path
        ? `${config.tmdb.imageBaseUrl}${m.poster_path}`
        : null,
      release_date: m.release_date,
      vote_average: m.vote_average,
    }));

    logger.info(`[MovieService] Fetched ${movies.length} movies (Release: ${today} to ${nextMonthStr})`);
    return movies;
  } catch (err) {
    logger.error(`[MovieService] TMDB API error: ${err.message} — using correctly sorted fallback list`);
    return FALLBACK_MOVIES.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
  }
};

export default { getUpcomingMovies };
