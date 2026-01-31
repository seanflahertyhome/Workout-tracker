-- Workout Tracker Database Schema
-- Run this script to set up the PostgreSQL database

-- Create database (run separately as superuser if needed)
-- CREATE DATABASE workout_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(10) DEFAULT '👤',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (name, icon) VALUES 
    ('Father', '👨'),
    ('Son', '👦')
ON CONFLICT (name) DO NOTHING;

-- Workouts table (daily workout sessions)
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    day_completed INTEGER,
    day_name VARCHAR(100),
    day_of_week VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workout_date)
);

-- Exercise sets table (individual exercise tracking)
CREATE TABLE IF NOT EXISTS exercise_sets (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100) NOT NULL,
    set_index INTEGER NOT NULL,
    weight DECIMAL(10,2) DEFAULT 0,
    reps INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shared exercises table (for sharing between users)
CREATE TABLE IF NOT EXISTS shared_exercises (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100) NOT NULL,
    reps INTEGER,
    message TEXT,
    workout_date DATE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout schedule customizations (per user)
CREATE TABLE IF NOT EXISTS custom_schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    schedule_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Achievements/Milestones table
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout ON exercise_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_shared_exercises_to_user ON shared_exercises(to_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for workouts table
DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for custom_schedules table
DROP TRIGGER IF EXISTS update_custom_schedules_updated_at ON custom_schedules;
CREATE TRIGGER update_custom_schedules_updated_at
    BEFORE UPDATE ON custom_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View for workout summary
CREATE OR REPLACE VIEW workout_summary AS
SELECT 
    u.name as user_name,
    w.workout_date,
    w.day_name,
    w.day_of_week,
    COUNT(DISTINCT es.exercise_name) as exercises_count,
    SUM(CASE WHEN es.completed THEN 1 ELSE 0 END) as completed_sets,
    COUNT(es.id) as total_sets
FROM users u
LEFT JOIN workouts w ON u.id = w.user_id
LEFT JOIN exercise_sets es ON w.id = es.workout_id
GROUP BY u.name, w.workout_date, w.day_name, w.day_of_week, w.id
ORDER BY w.workout_date DESC;

-- View for sharing activity
CREATE OR REPLACE VIEW sharing_activity AS
SELECT 
    se.id,
    fu.name as from_user,
    tu.name as to_user,
    se.exercise_name,
    se.reps,
    se.message,
    se.workout_date,
    se.is_read,
    se.created_at
FROM shared_exercises se
JOIN users fu ON se.from_user_id = fu.id
JOIN users tu ON se.to_user_id = tu.id
ORDER BY se.created_at DESC;
