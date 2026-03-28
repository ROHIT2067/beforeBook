import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startScheduler } from './scheduler/index.js';
import config from './config/env.js';
import logger from './config/logger.js';

const start = async () => {
  await connectDB();
  startScheduler();

  const PORT = process.env.PORT;
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 BeforeBook server running on port ${PORT}`);
    logger.info(`   Environment: ${config.nodeEnv}`);
  });
};

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
