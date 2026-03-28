/**
 * Seed script: populates sample movies into MongoDB.
 * Run with: node scripts/seed.js (from /server directory)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import axios from 'axios';

const MONGO_URI = process.env.MONGO_URI;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!MONGO_URI) {
  console.error('[Seed] MONGO_URI not set in .env');
  process.exit(1);
}

// ── Inline Movie schema for seed script ─────────────────────────────────
const movieSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: String,
  overview: String,
  poster_path: String,
  release_date: String,
  vote_average: Number,
  seeded: { type: Boolean, default: true },
});

const Movie = mongoose.model('Movie', movieSchema);

const FALLBACK_MOVIES = [
  { id: 'seed-1', title: 'Fighter', overview: 'Action drama about IAF officers in Kargil.', poster_path: null, release_date: '2024-01-25', vote_average: 6.8 },
  { id: 'seed-2', title: 'Kalki 2898 AD', overview: 'Epic mythological sci-fi set in the future.', poster_path: null, release_date: '2024-06-27', vote_average: 7.2 },
  { id: 'seed-3', title: 'Stree 2', overview: 'Horror-comedy sequel — the stree returns.', poster_path: null, release_date: '2024-08-15', vote_average: 7.9 },
  { id: 'seed-4', title: 'Sky Force', overview: 'India\'s first ever air strike revisited.', poster_path: null, release_date: '2025-01-24', vote_average: 7.1 },
  { id: 'seed-5', title: 'Chhaava', overview: 'The untold story of Chhatrapati Sambhaji Maharaj.', poster_path: null, release_date: '2025-02-14', vote_average: 8.0 },
  { id: 'seed-6', title: 'Sikandar', overview: 'Salman Khan starrer action blockbuster.', poster_path: null, release_date: '2025-03-30', vote_average: null },
  { id: 'seed-7', title: 'War 2', overview: 'Action sequel with Hrithik Roshan and Jr NTR.', poster_path: null, release_date: '2025-05-01', vote_average: null },
  { id: 'seed-8', title: 'Sitare Zameen Par', overview: 'Aamir Khan\'s much-awaited comedy drama.', poster_path: null, release_date: '2025-06-13', vote_average: null },
];

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('[Seed] Connected to MongoDB');

  let movies = FALLBACK_MOVIES;

  // Try TMDB first
  if (TMDB_API_KEY) {
    try {
      const { data } = await axios.get('https://api.themoviedb.org/3/movie/upcoming', {
        params: { api_key: TMDB_API_KEY, region: 'IN', language: 'en-IN', page: 1 },
        timeout: 8000,
      });
      movies = data.results.slice(0, 10).map((m) => ({
        id: String(m.id),
        title: m.title,
        overview: m.overview,
        poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        release_date: m.release_date,
        vote_average: m.vote_average,
      }));
      console.log(`[Seed] Fetched ${movies.length} movies from TMDB (region=IN)`);
    } catch (err) {
      console.warn(`[Seed] TMDB fetch failed (${err.message}), using fallback list`);
    }
  } else {
    console.warn('[Seed] TMDB_API_KEY not set — using fallback static movies');
  }

  // Upsert movies
  let inserted = 0;
  for (const movie of movies) {
    await Movie.findOneAndUpdate({ id: movie.id }, movie, { upsert: true, new: true });
    inserted++;
  }

  console.log(`[Seed] ✅ Seeded ${inserted} movies successfully`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed] Error:', err.message);
  process.exit(1);
});
