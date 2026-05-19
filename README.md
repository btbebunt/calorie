# Calorie Tracker

Private, mobile-first calorie and macro tracker for two users. Built with Next.js, Supabase, and Google Gemini.

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, and `SESSION_SECRET`.

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Login

| Username | Password |
|----------|----------|
| tutu     | qwe123   |
| bolor    | qwe123   |

Sessions last 30 days via secure HTTP-only cookie.

## Features

- Daily calorie ring (target vs consumed vs remaining)
- Protein, fats, and carbs totals
- Log food via camera/image or text (Gemini nutrition analysis)
- Today's timeline with delete
- Per-user data isolated by profile

## Database

Schema is managed in Supabase:

- `users_profile` — username, calorie target
- `daily_logs` — food entries with macros
