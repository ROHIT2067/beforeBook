import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrack } from '../api/index';
import useStore from '../store/useStore';
import { useEffect } from 'react';

const TrackButton = ({ trackedSet }) => {
  const { userId, userEmail, selectedMovie, selectedCity, clearSelection } = useStore();
  const queryClient = useQueryClient();

  const isDuplicate =
    selectedMovie && selectedCity
      ? trackedSet.has(`${selectedMovie.id}::${selectedCity}`)
      : false;

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: () =>
      createTrack({
        userId,
        email: userEmail,
        movieId: String(selectedMovie.id),
        movieName: selectedMovie.title,
        posterPath: selectedMovie.poster_path || null,
        city: selectedCity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked', userId] });
      clearSelection();
    },
  });

  // Reset error state when selection changes
  useEffect(() => {
    reset();
  }, [selectedMovie?.id, selectedCity, reset]);

  const canTrack = selectedMovie && selectedCity && userEmail && !isDuplicate;

  // Don't show red error if it's just a "duplicate" conflict (we already show a nice amber msg for that)
  const isConflict = error?.response?.status === 409;
  const shouldShowError = isError && !isConflict;

  return (
    <div className="space-y-2">
      <button
        id="remind-me-btn"
        className="btn-primary w-full justify-center text-base"
        disabled={!canTrack || isPending}
        onClick={() => mutate()}
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Setting reminder…
          </>
        ) : isDuplicate ? (
          '✓ Already Tracking'
        ) : (
          '🔔 Remind Me'
        )}
      </button>

      {!selectedMovie && (
        <p className="text-xs text-center text-white/30">Select a movie above to get started</p>
      )}
      {selectedMovie && !selectedCity && (
        <p className="text-xs text-center text-white/30">Now choose a city</p>
      )}
      {isDuplicate && (
        <p className="text-xs text-center text-amber-400/80">
          You&apos;re already tracking <strong>{selectedMovie.title}</strong> in{' '}
          <strong>{selectedCity}</strong>
        </p>
      )}
      {shouldShowError && (
        <p className="text-xs text-center text-red-400">
          {error?.response?.data?.message || 'Failed to add reminder. Wait and try again.'}
        </p>
      )}
    </div>
  );
};

export default TrackButton;
