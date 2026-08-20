# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Global rules:** `~/.claude/CLAUDE.md` applies to every repo and is loaded automatically each session — this file only covers what's specific to *this* repo. A rule that should hold everywhere belongs in the global file, not copy-pasted here.

## What this is

A Next.js (App Router) workout tracker: log daily workouts and manage a recurring schedule,
per-user, backed by Postgres via Drizzle ORM with credentials-based auth (NextAuth v5 beta +
bcrypt).

## Commands

```bash
npm run dev         # start dev server
npm run build         # production build
npm run start          # run production build
npm run lint             # eslint .
npm run typecheck          # tsc --noEmit
npx drizzle-kit push         # push schema.ts changes to the database (no migration files in-repo)
```

There is no test suite configured. Before delivering a change, run `lint` and `typecheck` — both
are cheap and this is the closest thing to a validation loop this repo has.

## Architecture

- `src/db/schema.ts` — the entire schema: `users` (email/password/bcrypt hash), `workouts`
  (one row per user per date, exercises/sets stored as a `jsonb` blob rather than normalized
  tables), `schedules` (one `jsonb` blob per user for the recurring plan). `drizzle.config.json`
  points at a local Postgres (`postgresql://postgres:postgres@127.0.0.1:5432/app_db`) — there's
  no migrations directory, schema changes are pushed directly with `drizzle-kit push`.
- `src/auth.ts` — NextAuth `Credentials` provider; `authorize()` looks up the user by email,
  compares the password with bcrypt, and the `session` callback copies `token.sub` onto
  `session.user.id` (Drizzle's UUID `id`, not NextAuth's default). Any code needing the current
  user's id must go through this session, not `token.sub` directly.
- `src/app/actions.ts` — server actions (`"use server"`) are the only way the UI reads/writes
  workouts and schedules; each one calls `auth()` first and throws/returns null if there's no
  session. `saveWorkout`/schedule actions do a manual select-then-update-or-insert (no upsert) —
  keep that pattern if adding similar actions, since there's no unique constraint enforcing one
  row per user+date at the DB level.
- `src/app/WorkoutTracker.tsx` — the main client component driving the tracker UI; `src/app/page.tsx`,
  `login/`, `register/` are the route entry points. `src/app/api/health/route.ts` is a plain
  liveness check, `src/app/api/register/route.ts` handles account creation (hashes the password
  before inserting into `users`).

## Working in this repo

- **Validate before delivering.** Always run `npm run lint && npm run typecheck` after a change
  and self-correct on failures — this repo has no CI to catch it otherwise.
- Workout/schedule data is untyped `jsonb` (`data: any` in `actions.ts`) — when changing the shape
  written by the UI, check `WorkoutTracker.tsx` and the corresponding action together; nothing
  else enforces the shape stays consistent.
