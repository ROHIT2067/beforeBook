import logger from '../config/logger.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    logger.error(`[ErrorHandler] ${req.method} ${req.path} — ${message}`, { stack: err.stack });
  } else {
    logger.warn(`[ErrorHandler] ${req.method} ${req.path} — ${status}: ${message}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;
