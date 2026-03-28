import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: BASE, timeout: 10000 });

export const getMovies = () =>
  api.get('/api/movies').then((r) => r.data.data);

export const getTracked = (userId) =>
  api.get('/api/track', { params: { userId } }).then((r) => r.data.data);

export const createTrack = (payload) =>
  api.post('/api/track', payload).then((r) => r.data.data);

export const deleteTrack = (id) =>
  api.delete(`/api/track/${id}`).then((r) => r.data);
