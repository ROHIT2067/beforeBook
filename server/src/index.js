import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startScheduler } from './scheduler/index.js';
import config from './config/env.js';
import logger from './config/logger.js';

const start = async () => {
  await connectDB();
  startScheduler();

  app.listen(config.port, () => {
    logger.info(`🚀 BeforeBook server running on http://localhost:${config.port}`);
    logger.info(`   Environment: ${config.nodeEnv}`);
  });
};

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
