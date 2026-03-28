import useStore from '../store/useStore';

const PLACEHOLDER_POSTER = (title) => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900 to-surface-700 text-white/30 text-center p-2 text-xs font-medium">
    {title}
  </div>
);

const MovieCard = ({ movie, isSelected, onClick, isTracked }) => {
  return (
    <button
      id={`movie-card-${movie.id}`}
      onClick={onClick}
      className={`group relative card card-hover text-left w-full cursor-pointer overflow-hidden
        ${isSelected ? 'border-brand-500 shadow-lg shadow-brand-500/20 ring-1 ring-brand-500/50' : ''}
        ${isTracked ? 'opacity-70' : ''}
      `}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-surface-700">
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          PLACEHOLDER_POSTER(movie.title)
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
            <span className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center shadow-lg">
              ✓
            </span>
          </div>
        )}
        {isTracked && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Tracking
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors">
          {movie.title}
        </h3>
        {movie.release_date && (
          <p className="text-xs text-white/40">
            {new Date(movie.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
        {movie.vote_average > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <span>★</span>
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default MovieCard;
