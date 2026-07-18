# Memora — remember smarter

A flashcard app with manual decks and an AI teacher (quiz mode), full SM-2
spaced repetition, tags, quiz history, and Google or email/password login.

## Stack
- **Frontend:** React + Vite, React Router, Tailwind, Framer Motion
- **Backend:** Node/Express, MongoDB (Mongoose), JWT auth, Passport (Google OAuth)
- **AI:** Google Gemini (primary) with Groq (fallback) for quiz generation

## Setup

### 1. MongoDB
Install locally or use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
Copy your connection string for the next step.

### 2. Backend
```bash
cd server
npm install
cp .env.example .env
```
Fill in `.env`:
- `MONGODB_URI` — your connection string
- `JWT_SECRET` — any long random string
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey) (free tier)
- `GROQ_API_KEY` — from [console.groq.com](https://console.groq.com/keys) (free tier)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — see below

Then run:
```bash
npm run dev
```
Server runs on `http://localhost:5000`.

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
App runs on `http://localhost:5173`.

## Setting up Google OAuth ("Continue with Google")

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a **new project** (use a separate project from any other app you own — see note below).
2. Go to **APIs & Services → OAuth consent screen** → set it up as "External," add an app name ("Memora") and your email.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Add an **Authorized redirect URI**: `http://localhost:5000/api/auth/google/callback`
6. Copy the generated **Client ID** and **Client Secret** into `server/.env`.

> Use a dedicated Google Cloud project for Memora rather than reusing credentials
> from another app — it keeps redirect URIs, consent-screen branding, and secret
> rotation isolated between projects.

When you deploy, add your production callback URL (e.g.
`https://yourdomain.com/api/auth/google/callback`) as an additional authorized
redirect URI on the same credential, and update `GOOGLE_CALLBACK_URL` and
`CLIENT_URL` in your production environment.

## Project structure
```
memora/
├── client/                  # React frontend
│   └── src/
│       ├── pages/           # Landing, Login, Signup, Dashboard, Study, AI Teacher, History...
│       ├── components/      # AppShell (sidebar layout), shared UI
│       └── App.jsx          # Routes
└── server/                  # Express backend
    ├── models/              # User, Deck, QuizSession
    ├── routes/               # auth, decks, study, ai
    ├── middleware/           # requireAuth (JWT)
    ├── utils/                # srs.js (SM-2 algorithm), aiQuiz.js (Gemini/Groq), jwt.js
    └── config/               # db.js, passport.js
```

## Deploying to production

This uses three free-tier services: **MongoDB Atlas** (database), **Render**
(backend), and **Vercel** (frontend). Total cost: $0.

Deploy in this order — backend first, then frontend, then a quick backend
update — because each side needs to know the other's URL.

### 1. MongoDB Atlas (database)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster.
3. Under **Database Access**, create a user with a password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — Render's IPs aren't static, so this is the simplest option for a small project.
5. Click **Connect → Drivers**, copy the connection string (looks like `mongodb+srv://user:password@cluster.../...`). You'll paste this into Render next.

### 2. Render (backend)
1. Push this project to a GitHub repo.
2. At [render.com](https://render.com), click **New → Blueprint**, connect your repo. Render will detect `render.yaml` at the repo root and configure the service automatically.
3. Fill in the environment variables it prompts for (from `server/.env.example`): `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
4. For `CLIENT_URL` and `GOOGLE_CALLBACK_URL`, use placeholder values for now (e.g. `https://placeholder.com`) — you'll fix these in step 4.
5. Deploy. Once live, note your backend URL, e.g. `https://memora-api.onrender.com`.

> Free Render web services spin down after 15 minutes of inactivity and take
> ~30–60 seconds to wake back up on the next request. Fine for personal use;
> worth knowing if the first login after a while feels slow.

### 3. Vercel (frontend)
1. At [vercel.com](https://vercel.com), import the same GitHub repo.
2. Set **Root Directory** to `client`.
3. Framework preset: Vite (Vercel usually detects this automatically).
4. Add an environment variable: `VITE_API_URL` = `https://memora-api.onrender.com/api` (your Render URL + `/api`).
5. Deploy. Note your frontend URL, e.g. `https://memora.vercel.app`.

### 4. Go back and fix the backend's CORS + OAuth settings
1. In Render, update your service's env vars:
   - `CLIENT_URL` → `https://memora.vercel.app` (your real Vercel URL)
   - `GOOGLE_CALLBACK_URL` → `https://memora-api.onrender.com/api/auth/google/callback`
2. In [Google Cloud Console](https://console.cloud.google.com/) → your OAuth client → **Authorized redirect URIs**, add that same callback URL.
3. Redeploy the Render service so the new env vars take effect.

### Done
Visit your Vercel URL — signup, login, decks, AI Teacher, and Google sign-in should all work end-to-end.

**Alternatives:** Railway or Fly.io work fine in place of Render if you'd rather avoid the free-tier sleep behavior (both have small paid tiers with no sleep). Netlify is a fine Vercel alternative for the frontend — just add an equivalent `_redirects` file (`/* /index.html 200`) instead of `vercel.json`.

## Notes on the spaced repetition system
Each card tracks its own `srs` state (`status`, `interval`, `repetition`,
`easeFactor`, `nextReviewDate`). `GET /api/study/due` returns all due
review cards (uncapped, since they're time-sensitive) plus new cards up to
the user's `dailyNewCardLimit` (defaults to 20/day). Rating a card via
`POST /api/study/review` with `again` / `hard` / `good` / `easy` reschedules
it using the SM-2 logic in `server/utils/srs.js`.
