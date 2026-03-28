import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrack } from '../api/index';
import useStore from '../store/useStore';

const TrackButton = ({ trackedSet }) => {
  const { userId, selectedMovie, selectedCity, clearSelection } = useStore();
  const queryClient = useQueryClient();

  const isDuplicate =
    selectedMovie && selectedCity
      ? trackedSet.has(`${selectedMovie.id}::${selectedCity}`)
      : false;

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () =>
      createTrack({
        userId,
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

  const canTrack = selectedMovie && selectedCity && !isDuplicate;

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
      {isError && (
        <p className="text-xs text-center text-red-400">
          {error?.response?.data?.message || 'Failed to add reminder. Try again.'}
        </p>
      )}
    </div>
  );
};

export default TrackButton;
