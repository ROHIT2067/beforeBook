import { create } from 'zustand';

// Generate or retrieve a persistent anonymous userId
const initUserId = () => {
  const stored = localStorage.getItem('beforebook_userId');
  if (stored) return stored;
  const newId = crypto.randomUUID();
  localStorage.setItem('beforebook_userId', newId);
  return newId;
};

const useStore = create((set, get) => ({
  userId: initUserId(),
  selectedMovie: null,
  selectedCity: '',

  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  clearSelection: () => set({ selectedMovie: null, selectedCity: '' }),
}));

export default useStore;
