import mongoose from 'mongoose';
import config from '../src/config/env.js';
import { runChecks } from '../src/scheduler/index.js'; // I'll check if it's exported

async function manualRun() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected.');

    console.log('Running manual check...');
    await runChecks();
    console.log('Check completed.');
  } catch (err) {
    console.error('Manual check failed:', err.message);
  } finally {
    process.exit(0);
  }
}

manualRun();
