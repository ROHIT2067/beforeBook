import 'dotenv/config';

const required = [
  'MONGO_URI',
  'TMDB_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'NOTIFICATION_TO_EMAIL',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[Config] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export default {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',

  tmdb: {
    apiKey: process.env.TMDB_API_KEY,
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    fromName: process.env.EMAIL_FROM_NAME || 'BeforeBook Alerts',
    to: process.env.NOTIFICATION_TO_EMAIL,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: process.env.TWILIO_WHATSAPP_TO,
  },

  scheduler: {
    cronSchedule: process.env.CRON_SCHEDULE || '*/5 * * * *',
    maxScraperFailures: parseInt(process.env.MAX_SCRAPER_FAILURES || '10', 10),
    confirmDelaySeconds: parseInt(process.env.SCRAPER_CONFIRM_DELAY_SECONDS || '7', 10),
  },
};
