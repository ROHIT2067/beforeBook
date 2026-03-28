const FILM_ICON = (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx={12} cy={12} r={10} />
    <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StatusBadge = ({ track }) => {
  if (track.scraperError) {
    return (
      <span className="badge bg-red-500/15 text-red-400 border border-red-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
        Check Failed
      </span>
    );
  }

  if (track.notified) {
    return (
      <div className="flex flex-col gap-1">
        <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          Available — Notified
        </span>
        {track.firstShowtimeDetails?.time && (
          <span className="text-xs text-white/40">
            🎞 {track.firstShowtimeDetails.time} · {track.firstShowtimeDetails.theatre}
          </span>
        )}
      </div>
    );
  }

  if (track.lastCheckedAt) {
    return (
      <div className="flex flex-col gap-1">
        <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse-slow" />
          Checking…
        </span>
        {track.estimatedAvailableAt && (
          <span className="text-xs text-white/40">
            ⏳ Expected around{' '}
            {new Date(track.estimatedAvailableAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    );
  }

  return (
    <span className="badge bg-white/5 text-white/50 border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-white/30 inline-block" />
      Not Available
    </span>
  );
};

export default StatusBadge;
