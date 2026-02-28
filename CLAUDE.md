# Storybook Dev Guide

## Stack
- Next.js 14+ (App Router), TypeScript, Tailwind CSS v4, Framer Motion, better-sqlite3, jsPDF

## Dev
```bash
npm run dev    # http://localhost:3000
npm run build  # Production build
```

## Structure
- `app/` — Pages and API routes (App Router)
- `lib/` — Shared utilities (db, story templates, types)
- `components/` — Reusable UI components
- `data/` — SQLite DB (auto-created, gitignored)

## Design System
- Warm cream bg (#FDF8F0), deep brown text (#2D1B0E), gold (#D4A754), purple (#7C3AED)
- Serif headings, readable body text

## API
- POST /api/generate — Create story (mock implementation)
- GET /api/stories/[id] — Fetch story
- GET /api/stats — Admin stats
- POST /api/events — Log analytics
