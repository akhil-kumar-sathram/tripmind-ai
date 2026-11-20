# TripMind AI

**TripMind AI** is a modern, lightweight AI travel planner built with React, TypeScript, Vite, Tailwind CSS, and the Google Gemini API. Travelers enter their destination, starting city, dates or trip length, budget, currency, travel style, pace, interests, accommodation preference, and dietary preferences to generate structured day-by-day itineraries—stored privately in the browser with `localStorage` and deployed serverlessly on Vercel with zero database required.

---

## Features

- **Editorial Landing Page**: Cinematic hero section, featured curated destinations, numbered product highlights, 3-step workflow guide, and travel inspiration cards.
- **Comprehensive Trip Planning Form**:
  - Destination & starting location
  - Exact travel dates **or** flexible number of days (1–21)
  - Number of travelers (1–20), total budget, and currency selector (`USD`, `EUR`, `GBP`, `INR`, `JPY`, `AUD`, `CAD`)
  - 8 travel styles (`Adventure`, `Relaxation`, `Luxury`, `Budget`, `Cultural`, `Romantic`, `Family`, `Solo`)
  - 10 travel interests (`Nature`, `Food`, `History`, `Shopping`, `Beaches`, `Mountains`, `Photography`, `Nightlife`, `Architecture`, `Local experiences`)
  - 3 itinerary paces (`Relaxed`, `Balanced`, `Packed itinerary`), accommodation preference, dietary preferences, and custom notes
  - Full client-side and server-side input validation
- **AI Itinerary Dashboard (Gemini-Powered)**:
  - Destination banner with AI-generated trip title and trip overview
  - Day-by-day vertical timeline (Morning, Afternoon, Evening) with day filter tabs, approximate timings, attractions, local food notes, day transit suggestions, and estimated daily expenses
  - 6-category AI-estimated budget breakdown (`Accommodation`, `Food & Dining`, `Transportation`, `Activities & Entry`, `Shopping`, `Miscellaneous`) clearly labeled as estimates
  - Accommodation types & recommended neighborhoods (clearly distinguished from live booking availability)
  - Local food recommendations tailored to dietary preferences
  - Interactive packing checklist with custom item additions and progress tracking
  - One-click **Regenerate** for alternative plans, **Customize Trip**, and **Copy Summary**
- **Explore Destinations**: Searchable and filterable curated destination catalog by keyword, region, and travel style, with quick-view destination modals to generate an AI plan or customize in the planner.
- **My Trips (`localStorage`)**: Save generated itineraries locally, reopen saved plans across page refreshes (including checked packing items), and delete saved trips with an accessible confirmation dialog.
- **Resilient UX & Error Recovery**: Loading skeletons (`"Planning your adventure..."`), duplicate-submission prevention, offline/network detection, rate-limit and timeout error messages with one-click **Retry**, toast notifications, and responsive mobile navigation.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Serverless Backend**: Vercel Serverless Function (`/api/generate-itinerary.ts`) + Express local dev bridge (`server.ts`)
- **AI Engine**: Google Gemini API (`@google/genai` SDK, `gemini-4-hydrogen`) — **Gemini API only**
- **Persistence**: Browser `localStorage` — **No database**

---

## Architecture

```
Browser (React + TypeScript + Tailwind CSS)
  ├── Local Persistence ──► window.localStorage (My Trips & packing checklists)
  └── POST /api/generate-itinerary
        │
        ▼
Serverless Function (/api/generate-itinerary.ts)
  ├── Validates HTTP method, payload size (<= 32 KB), and form fields
  ├── Reads process.env.GEMINI_API_KEY (server-side only)
  ├── Calls Google Gemini API (@google/genai) with structured JSON instructions
  └── Validates & normalizes JSON response before returning to the frontend
```

> **Security Note**: `GEMINI_API_KEY` is never bundled into frontend JavaScript, never prefixed with `VITE_`, and never exposed in browser network requests.

---

## Screenshots

> Add screenshots of your running application here before final college submission.

- **Home & Hero**: `docs/screenshots/home.png` *(placeholder)*
- **Trip Planning Studio**: `docs/screenshots/planner.png` *(placeholder)*
- **AI Itinerary Timeline & Budget**: `docs/screenshots/itinerary.png` *(placeholder)*
- **Explore Destinations & My Trips**: `docs/screenshots/explore.png` *(placeholder)*

---

## Installation & Local Development

### Prerequisites

- Node.js `20+` (recommended `22+`)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/<your-username>/tripmind-ai.git
cd tripmind-ai
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your Gemini API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_real_gemini_api_key
```

> Never commit `.env` to Git. `.gitignore` automatically excludes `.env` and `.env.local`.

### 3. Start the Local Development Server

```bash
npm run dev
```

Open `http://localhost:3000`. The local server (`server.ts`) serves both the Vite React app and the `/api/generate-itinerary` endpoint.

### 4. Production Build & Type Check

```bash
npm run lint   # TypeScript typecheck (tsc --noEmit)
npm run build  # Vite production bundle into dist/
```

To preview the compiled production build locally:

```bash
NODE_ENV=production npm start
```

---

## Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/apikey) and create a Gemini API key.
2. Place the key in your local `.env` file as `GEMINI_API_KEY=...` (for local development) and in Vercel Project Settings (for deployment).
3. All requests to Gemini happen strictly on the server inside `api/lib/geminiPlanner.ts` using `@google/genai`.

---

## Deploying to Vercel

1. Push this repository to GitHub (confirm `.env` is **not** committed).
2. Sign in to [Vercel](https://vercel.com) and click **Add New → Project**.
3. Import your GitHub repository.
4. Confirm build settings (Vercel detects Vite automatically):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Open **Environment Variables** and add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: your Gemini API key
   - **Environments**: Production, Preview, Development
6. Click **Deploy**.
7. Visit the deployed Vercel URL, submit a trip in **Plan My Trip**, and verify itinerary generation, regeneration, saving to **My Trips**, and reload persistence.

> `vercel.json` is pre-configured with `maxDuration: 60` for `api/generate-itinerary.ts` so multi-day Gemini itineraries do not hit the default 10-second serverless timeout, and includes clean SPA/API rewrites.

---

## Limitations

- **AI-Generated Estimates**: Costs, daily budgets, and accommodation suggestions are AI-generated estimates—not real-time prices, live flight fares, weather forecasts, or confirmed hotel availability.
- **No External Maps/Places/Photo APIs**: By design, TripMind AI uses only the Gemini API. Curated local travel photography is matched to featured destinations, with a default editorial hero image for other cities.
- **Browser-Local Storage**: Saved trips and packing checklist progress persist in `localStorage` per browser and do not sync across devices.

---

## Future Improvements

- PDF itinerary export and shareable read-only trip snapshots
- Drag-and-drop reordering or inline editing of individual timeline activities
- Multi-language itinerary generation directly from a language selector
- Optional user authentication and cloud trip sync in a future release
