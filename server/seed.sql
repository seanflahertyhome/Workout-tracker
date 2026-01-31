-- Seed script for workout-tracker database
-- This script inserts sample workout data for testing

-- Insert sample workouts
INSERT INTO workouts (date, type, duration, notes, metadata) VALUES
('2026-01-20T10:00:00Z', 'Legs & Push', 1800, 'First workout of the week', '{"user": "Father"}'),
('2026-01-21T10:00:00Z', 'Hinge & Pull', 2100, 'Felt strong today', '{"user": "Father"}'),
('2026-01-22T10:00:00Z', 'Shoulders & Core', 1500, 'Quick session', '{"user": "Son"}');

-- Get the workout IDs (assuming they get IDs 1, 2, 3)
-- Insert exercises for workout 1 (Legs & Push)
INSERT INTO exercises (workout_id, name, sets, reps, weight, notes) VALUES
(1, 'Resistance Band Squats', 3, 12, 0, 'Good form'),
(1, 'Push-ups', 3, 10, 0, 'Standard push-ups'),
(1, 'Dot Drills', NULL, NULL, NULL, '45s work, 15s rest');

-- Insert exercises for workout 2 (Hinge & Pull)
INSERT INTO exercises (workout_id, name, sets, reps, weight, notes) VALUES
(2, 'Deadlift / Band Pull-Through', 3, 8, 0, 'Used resistance band'),
(2, 'Bent Over Rows', 3, 10, 50, 'Light dumbbells'),
(2, 'Shadow Boxing', NULL, NULL, NULL, '60s work, 60s rest');

-- Insert exercises for workout 3 (Shoulders & Core)
INSERT INTO exercises (workout_id, name, sets, reps, weight, notes) VALUES
(3, 'Overhead Press', 3, 8, 30, 'Dumbbell press'),
(3, 'Plank High-Fives', 3, NULL, NULL, '45s holds'),
(3, 'Jumping Jacks / Seal Jacks', NULL, NULL, NULL, '30s work, 30s rest');

-- Insert default schedule for 'default' user
INSERT INTO schedules (user_name, schedule_data, updated_at) VALUES
('default', '[
  {
    "day": 1,
    "name": "Legs & Push",
    "emoji": "🦵",
    "exercises": [
      { "name": "Resistance Band Squats", "type": "strength", "sets": 3, "videoLink": "https://www.youtube.com/results?search_query=resistance+band+squats+form+shorts" },
      { "name": "Push-ups", "type": "strength", "sets": 3, "videoLink": "https://www.youtube.com/results?search_query=perfect+push+up+form+shorts" },
      { "name": "Dot Drills", "type": "cardio", "duration": 15, "work": 45, "rest": 15, "videoLink": "https://www.youtube.com/results?search_query=dot+drill+agility+shorts" }
    ]
  },
  {
    "day": 2,
    "name": "Hinge & Pull",
    "emoji": "🏋️",
    "exercises": [
      { "name": "Deadlift / Band Pull-Through", "type": "strength", "sets": 3, "videoLink": "https://www.youtube.com/results?search_query=resistance+band+deadlift+proper+form+shorts" },
      { "name": "Bent Over Rows", "type": "strength", "sets": 3, "videoLink": "https://www.youtube.com/results?search_query=resistance+band+bent+over+row+proper+form+shorts" },
      { "name": "Shadow Boxing", "type": "cardio", "duration": 15, "work": 60, "rest": 60, "videoLink": "https://www.youtube.com/results?search_query=shadow+boxing+workout+shorts" }
    ]
  },
  {
    "day": 3,
    "name": "Shoulders & Core",
    "emoji": "💪",
    "exercises": [
      { "name": "Overhead Press", "type": "strength", "sets": 3, "videoLink": "https://www.youtube.com/results?search_query=resistance+band+overhead+press+form+shorts" },
      { "name": "Plank High-Fives", "type": "strength", "sets": 3, "isHold": true, "holdTime": 45, "videoLink": "https://www.youtube.com/results?search_query=plank+partner+high+five+shorts" },
      { "name": "Jumping Jacks / Seal Jacks", "type": "cardio", "duration": 15, "work": 30, "rest": 30, "videoLink": "https://www.youtube.com/results?search_query=seal+jacks+exercise+shorts" }
    ]
  },
  {
    "day": 4,
    "name": "Arms & Accessories",
    "emoji": "💪",
    "exercises": [
      { "name": "Bicep Curls", "type": "strength", "sets": 3, "videoLink": "https://www.youtube.com/results?search_query=resistance+band+bicep+curl+form+shorts" },
      { "name": "Tricep Extensions", "type": "strength", "sets": 3, "videoLink": "https://www.youtube.com/results?search_query=resistance+band+tricep+extension+form+shorts" },
      { "name": "Mountain Climbers", "type": "cardio", "duration": 15, "work": 30, "rest": 30, "videoLink": "https://www.youtube.com/results?search_query=mountain+climbers+form+shorts" }
    ]
  },
  {
    "day": 5,
    "name": "Deck of Cards Challenge",
    "emoji": "🃏",
    "isCardGame": true,
    "duration": 20,
    "rules": {
      "hearts": { "exercise": "Squats", "emoji": "❤️", "videoLink": "https://www.youtube.com/results?search_query=resistance+band+squat+form+shorts" },
      "diamonds": { "exercise": "Push-ups", "emoji": "♦️", "videoLink": "https://www.youtube.com/results?search_query=perfect+push+up+form+shorts" },
      "spades": { "exercise": "Lunges", "emoji": "♠️", "videoLink": "https://www.youtube.com/results?search_query=lunge+form+shorts" },
      "clubs": { "exercise": "Sit-ups", "emoji": "♣️", "videoLink": "https://www.youtube.com/results?search_query=sit+up+form+shorts" }
    }
  }
]', now())
ON CONFLICT (user_name) DO UPDATE SET schedule_data = EXCLUDED.schedule_data, updated_at = now();