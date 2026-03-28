import mongoose from 'mongoose';
import logger from './logger.js';
import config from './env.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};
