# 💪 Father & Son Workout Tracker

A Progressive Web App (PWA) for tracking bodyweight workouts with PostgreSQL database support for data persistence and sharing exercises between users.

## Features

- **Bodyweight-only exercises** - No equipment needed
- **Weekly schedule**: Mon/Wed/Fri strength training, Tue/Thu active recovery
- **Two user profiles** - Father and Son can track separately
- **Exercise sharing** - Share exercises and encouragement between users
- **Stats & Leaderboard** - Compare workout progress
- **Offline support** - Works without internet, syncs when connected
- **Deck of Cards Challenge** - Fun Friday workout game
- **Interval Timer** - Built-in work/rest timer
- **Video Links** - Quick access to exercise tutorials

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Setup Database

```bash
# Create the database
createdb workout_tracker

# Run the schema
psql -d workout_tracker -f schema.sql
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit with your database credentials
nano .env
```

Example `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/workout_tracker
PORT=3000
NODE_ENV=development
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### 4. Open the App

Navigate to `http://localhost:3000` in your browser.

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:name` - Get user by name

### Workouts
- `GET /api/workouts/:userName` - Get all workouts for a user
- `GET /api/workouts/:userName/:date` - Get workout for specific date
- `POST /api/workouts/exercise` - Save an exercise set
- `POST /api/workouts/complete` - Mark workout as complete
- `DELETE /api/workouts/:userName` - Clear user's workout history

### Sharing
- `POST /api/share` - Share an exercise with another user
- `GET /api/share/:userName` - Get exercises shared with user
- `GET /api/share/:userName/unread` - Get unread share count
- `PATCH /api/share/:id/read` - Mark share as read

### Stats
- `GET /api/stats/:userName` - Get user's workout statistics
- `GET /api/leaderboard` - Get leaderboard comparing users

### Schedule
- `GET /api/schedule/:userName` - Get custom schedule
- `POST /api/schedule/:userName` - Save custom schedule

## Database Schema

### Tables

- **users** - User profiles (Father, Son)
- **workouts** - Daily workout sessions
- **exercise_sets** - Individual exercise tracking
- **shared_exercises** - Exercises shared between users
- **custom_schedules** - Per-user schedule customizations
- **achievements** - Unlocked achievements/milestones

## Workout Schedule

| Day | Type | Focus |
|-----|------|-------|
| Monday | Strength | Upper Body Push & Core |
| Tuesday | Recovery | Walking + Stretching |
| Wednesday | Strength | Lower Body & Glutes |
| Thursday | Recovery | Walking + Mobility |
| Friday | Challenge | Deck of Cards (Full Body) |
| Weekend | Rest | Enjoy! |

## Offline Support

The app works offline by:
1. Storing data in localStorage when offline
2. Marking records with `needsSync` flag
3. Automatically syncing when connection is restored

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Features**: PWA, LocalStorage fallback, Real-time sync

## License

MIT
