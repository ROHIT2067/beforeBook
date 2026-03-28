import { useQuery } from '@tanstack/react-query';
import { getMovies, getTracked } from '../api/index';
import useStore from '../store/useStore';
import MovieGrid from '../components/MovieGrid';
import CitySelector from '../components/CitySelector';
import TrackButton from '../components/TrackButton';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { userId, selectedMovie, selectedCity, setSelectedMovie, setSelectedCity } = useStore();

  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: getMovies,
    staleTime: 1000 * 60 * 10,
  });

  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['tracked', userId],
    queryFn: () => getTracked(userId),
    refetchInterval: 30000,
  });

  // Set of "movieId::city" for duplicate detection
  const trackedSet = new Set((tracks || []).map((t) => `${t.movieId}::${t.city}`));
  // Set of movieIds for "Tracking" badge on movie cards
  const trackedMovieIds = new Set((tracks || []).map((t) => String(t.movieId)));

  return (
    <div className="min-h-screen">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="text-lg font-bold text-gradient">BeforeBook</h1>
              <p className="text-[10px] text-white/30 leading-none">Movie Showtime Notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Scheduler active
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="text-center space-y-3 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient">
            Never miss a ticket drop
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-base">
            Select a movie, choose your city, and we'll notify you the moment showtimes appear on BookMyShow.
          </p>
        </section>

        {/* ── Movie Selection ──────────────────────────────────────────── */}
        <section className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/80">
              Upcoming Movies
              {selectedMovie && (
                <span className="ml-2 text-sm font-normal text-brand-400">
                  — {selectedMovie.title} selected
                </span>
              )}
            </h2>
            {selectedMovie && (
              <button
                onClick={() => setSelectedMovie(null)}
                className="btn-ghost text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <MovieGrid
            movies={movies}
            isLoading={moviesLoading}
            selectedMovieId={selectedMovie?.id}
            trackedMovieIds={trackedMovieIds}
            onSelect={(movie) =>
              setSelectedMovie(selectedMovie?.id === movie.id ? null : movie)
            }
          />
        </section>

        {/* ── Track Panel ──────────────────────────────────────────────── */}
        <section className="animate-slide-up">
          <div className="card max-w-sm mx-auto space-y-4 border-white/10">
            <h2 className="text-base font-semibold text-white/80">Set a Reminder</h2>

            {selectedMovie && (
              <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-sm">
                {selectedMovie.poster_path && (
                  <img
                    src={selectedMovie.poster_path}
                    alt={selectedMovie.title}
                    className="w-10 h-14 object-cover rounded-lg shrink-0"
                  />
                )}
                <div>
                  <p className="font-semibold">{selectedMovie.title}</p>
                  {selectedMovie.release_date && (
                    <p className="text-xs text-white/40">
                      {new Date(selectedMovie.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="city-selector" className="text-xs text-white/50 font-medium">
                City
              </label>
              <CitySelector value={selectedCity} onChange={setSelectedCity} />
            </div>

            <TrackButton trackedSet={trackedSet} />
          </div>
        </section>

        {/* ── Dashboard ────────────────────────────────────────────────── */}
        <section className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/80">
              Tracking Dashboard
              {tracks?.length > 0 && (
                <span className="ml-2 text-sm font-normal text-white/40">
                  {tracks.length} movie{tracks.length !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <span className="text-xs text-white/30">Auto-refreshes every 30s</span>
          </div>
          <Dashboard tracks={tracks} isLoading={tracksLoading} userId={userId} />
        </section>
      </main>

      <footer className="mt-16 border-t border-white/5 py-8 text-center text-xs text-white/20">
        <p>BeforeBook — for personal use only · Does not automate ticket purchases</p>
      </footer>
    </div>
  );
}
