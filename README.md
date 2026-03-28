# BeforeBook 🎬

> **Movie Showtime Notification App** — Get notified the moment tickets go live, without any automated booking.

---

## What It Does

BeforeBook tracks upcoming movies in your city and sends you an email notification the moment showtimes appear on BookMyShow. It does **not** book tickets, select seats, or make any payments on your behalf.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Query, Zustand |
| Backend | Node.js, Express, Mongoose (MongoDB) |
| Scraper | Playwright Extra + Stealth Plugin |
| Scheduler | node-cron |
| Notifications | Nodemailer (Gmail SMTP) |

---

## Prerequisites

- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas URI
- A Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled
- A [TMDB API key](https://www.themoviedb.org/settings/api) (free)

---

## Setup

### 1. Clone & Install

```bash
git clone <repo-url> beforebook
cd beforebook

# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure Environment

```bash
cp .env.example server/.env
# Edit server/.env and fill in all required values
```

Required values to fill in:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `TMDB_API_KEY` | Free key from themoviedb.org |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password (16 chars) |
| `NOTIFICATION_TO_EMAIL` | Where to send notifications |

### 3. Install Playwright Browser

```bash
cd server
npx playwright install chromium
cd ..
```

### 4. Seed Sample Movies

```bash
npm run seed
```

### 5. Run Locally

```bash
npm run dev
```

- **Frontend**: http://localhost:5173  
- **Backend API**: http://localhost:3000

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/movies` | Fetch upcoming movies (TMDB, region=IN) |
| `POST` | `/api/track` | Start tracking a movie in a city |
| `GET` | `/api/tracked?userId=<id>` | Get all tracked movies for a user |
| `DELETE` | `/api/track/:id` | Remove a tracking entry |

### POST /api/track — Body

```json
{
  "userId": "browser-generated-uuid",
  "movieId": "tmdb-movie-id",
  "movieName": "Movie Title",
  "city": "Mumbai"
}
```

---

## How the Scheduler Works

1. Runs every 5 minutes (configurable via `CRON_SCHEDULE`)
2. Fetches all un-notified, non-errored tracked movies
3. For each, launches a headless Playwright browser (with stealth) targeting BookMyShow
4. **Double-confirms** availability: checks twice, ~7 seconds apart
5. On confirmation: sends email, marks `notified: true`, saves showtime details
6. On failure: increments `failureCount`; after 10 failures marks `scraperError: true`

---

## Adding a New Notification Provider

1. Create `server/src/services/YourProvider.js`
2. Extend `NotificationService`:

```js
import NotificationService from './NotificationService.js';

class YourProvider extends NotificationService {
  async send({ to, subject, body }) {
    // Your implementation here
  }
}

export default YourProvider;
```

3. In `server/src/scheduler/index.js`, swap the import:

```js
// Before:
import notifier from '../services/EmailProvider.js';
// After:
import notifier from '../services/YourProvider.js';
```

### Built-in Providers

| Provider | File | Status |
|---|---|---|
| Gmail SMTP | `EmailProvider.js` | ✅ Active |
| WhatsApp (Twilio) | `WhatsAppProvider.js` | 🔧 Stub — fill Twilio env vars to activate |

---

## Dashboard Status Guide

| Badge | Meaning |
|---|---|
| 🔵 Checking | Scheduler is actively polling |
| 🟡 Not Available | No showtimes found yet |
| 🟢 Notified | Showtimes detected, email sent |
| 🔴 Check Failed | Scraper failed 10+ times — may need manual review |

---

## Environment Variables Reference

See [`.env.example`](./.env.example) for the full list with comments.

---

## ⚠️ Disclaimer

This tool is for personal, informational use only. It does **not** bypass CAPTCHAs, automate purchases, or violate platform ToS. Use responsibly and at your own risk.
