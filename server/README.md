# Workout-tracker Server (Postgres)

This small Express API provides endpoints for the PWA to persist workouts in Postgres.

Environment
- DATABASE_URI (required) — PostgreSQL connection string, e.g. `postgres://user:pass@host:5432/dbname`
  - In your repository, set this using the repository secret named `DATABASE_URI`.
  - PORT (optional) — port to listen on, default 3000

  Install & run (locally)
  1. cd server
  2. npm install
  3. Create a local `.env` file or export `DATABASE_URI` (do not commit secrets).
  4. Initialize DB: `npm run init-db`
  5. Start server: `npm start`

  Endpoints
  - GET /api/workouts — list workouts
  - GET /api/workouts/:id — get workout and associated exercises
  - POST /api/workouts — create workout (see routes/workouts.js for payload shape)