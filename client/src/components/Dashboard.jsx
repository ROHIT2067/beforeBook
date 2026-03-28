import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTrack } from '../api/index';
import StatusBadge from './StatusBadge';

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Dashboard = ({ tracks, isLoading, userId }) => {
  const queryClient = useQueryClient();

  const { mutate: remove } = useMutation({
    mutationFn: deleteTrack,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracked', userId] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!tracks?.length) {
    return (
      <div className="card text-center py-12 border-dashed border-white/10">
        <p className="text-3xl mb-3">📭</p>
        <p className="text-white/50 text-sm">
          No movies tracked yet. Select a movie above and click <strong>Remind Me</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <div
          key={track._id}
          id={`track-row-${track._id}`}
          className="card flex items-center gap-4 animate-slide-up group"
        >
          {/* Poster thumbnail */}
          {track.posterPath ? (
            <img
              src={track.posterPath}
              alt={track.movieName}
              className="w-10 h-14 object-cover rounded-lg shrink-0"
            />
          ) : (
            <div className="w-10 h-14 bg-surface-700 rounded-lg shrink-0 flex items-center justify-center text-xs text-white/30">
              🎬
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-white truncate">{track.movieName}</p>
                <p className="text-xs text-white/40 mt-0.5">📍 {track.city}</p>
              </div>
              <button
                id={`delete-track-${track._id}`}
                onClick={() => remove(track._id)}
                className="btn-ghost text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0 p-1.5"
                title="Remove tracker"
              >
                <TrashIcon />
              </button>
            </div>
            <div className="mt-2">
              <StatusBadge track={track} />
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/25">
              {track.lastCheckedAt && (
                <span>
                  Checked {new Date(track.lastCheckedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {track.detectionLog?.length > 0 && (
                <span>{track.detectionLog.length} detection event{track.detectionLog.length !== 1 ? 's' : ''}</span>
              )}
              {track.failureCount > 0 && (
                <span className="text-amber-500/60">{track.failureCount} failure{track.failureCount !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
