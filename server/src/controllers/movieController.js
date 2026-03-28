import MovieService from '../services/MovieService.js';

export const getMovies = async (req, res, next) => {
  try {
    const movies = await MovieService.getUpcomingMovies();
    res.json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};
