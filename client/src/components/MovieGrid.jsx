import MovieCard from './MovieCard';

const MovieGrid = ({ movies, selectedMovieId, trackedMovieIds, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-fade-in">
            <div className="shimmer aspect-[2/3] rounded-xl mb-3" />
            <div className="shimmer h-4 rounded mb-2" />
            <div className="shimmer h-3 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!movies?.length) {
    return (
      <div className="text-center py-16 text-white/40">
        <p className="text-4xl mb-3">🎬</p>
        <p>No upcoming movies found. Make sure your TMDB API key is configured.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <div key={movie.id} className="animate-fade-in">
          <MovieCard
            movie={movie}
            isSelected={selectedMovieId === movie.id}
            isTracked={trackedMovieIds.has(String(movie.id))}
            onClick={() => onSelect(movie)}
          />
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;
