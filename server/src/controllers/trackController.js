import TrackService from '../services/TrackService.js';

export const createTrack = async (req, res, next) => {
  try {
    const { userId, email, movieId, movieName, posterPath, city } = req.body;
    if (!userId || !email || !movieId || !movieName || !city) {
      return res.status(400).json({ success: false, message: 'Missing required fields: userId, email, movieId, movieName, city' });
    }
    const track = await TrackService.createTrack({ userId, email, movieId, movieName, posterPath, city });
    res.status(201).json({ success: true, data: track });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
};

export const getTracked = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing query param: userId' });
    }
    const tracks = await TrackService.getTracksForUser(userId);
    res.json({ success: true, data: tracks });
  } catch (err) {
    next(err);
  }
};

export const deleteTrack = async (req, res, next) => {
  try {
    await TrackService.deleteTrack(req.params.id);
    res.json({ success: true, message: 'Track removed' });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};
