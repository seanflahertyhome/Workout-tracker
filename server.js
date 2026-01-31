const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/workout_tracker',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ===== USER ROUTES =====

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by name
app.get('/api/users/:name', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE name = $1', [req.params.name]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// ===== WORKOUT ROUTES =====

// Get all workouts for a user
app.get('/api/workouts/:userName', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const result = await pool.query(`
            SELECT 
                w.id,
                w.workout_date,
                w.day_completed,
                w.day_name,
                w.day_of_week,
                w.created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'exercise_name', es.exercise_name,
                            'set_index', es.set_index,
                            'weight', es.weight,
                            'reps', es.reps,
                            'completed', es.completed
                        )
                    ) FILTER (WHERE es.id IS NOT NULL),
                    '[]'
                ) as exercises
            FROM workouts w
            LEFT JOIN exercise_sets es ON w.id = es.workout_id
            WHERE w.user_id = $1
            GROUP BY w.id
            ORDER BY w.workout_date DESC
        `, [userId]);

        // Transform to the format expected by frontend
        const workouts = {};
        result.rows.forEach(row => {
            const dateKey = row.workout_date.toISOString().split('T')[0];
            const exercises = {};
            
            row.exercises.forEach(ex => {
                if (!exercises[ex.exercise_name]) {
                    exercises[ex.exercise_name] = [];
                }
                exercises[ex.exercise_name][ex.set_index] = {
                    weight: ex.weight,
                    reps: ex.reps,
                    completed: ex.completed
                };
            });

            workouts[dateKey] = {
                dayCompleted: row.day_completed,
                dayName: row.day_name,
                dayOfWeek: row.day_of_week,
                exercises: exercises
            };
        });

        res.json(workouts);
    } catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// Get workout for a specific date
app.get('/api/workouts/:userName/:date', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const result = await pool.query(`
            SELECT 
                w.id,
                w.workout_date,
                w.day_completed,
                w.day_name,
                w.day_of_week,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'exercise_name', es.exercise_name,
                            'set_index', es.set_index,
                            'weight', es.weight,
                            'reps', es.reps,
                            'completed', es.completed
                        )
                    ) FILTER (WHERE es.id IS NOT NULL),
                    '[]'
                ) as exercises
            FROM workouts w
            LEFT JOIN exercise_sets es ON w.id = es.workout_id
            WHERE w.user_id = $1 AND w.workout_date = $2
            GROUP BY w.id
        `, [userId, req.params.date]);

        if (result.rows.length === 0) {
            return res.json({ exercises: {} });
        }

        const row = result.rows[0];
        const exercises = {};
        
        row.exercises.forEach(ex => {
            if (!exercises[ex.exercise_name]) {
                exercises[ex.exercise_name] = [];
            }
            exercises[ex.exercise_name][ex.set_index] = {
                weight: ex.weight,
                reps: ex.reps,
                completed: ex.completed
            };
        });

        res.json({
            dayCompleted: row.day_completed,
            dayName: row.day_name,
            dayOfWeek: row.day_of_week,
            exercises: exercises
        });
    } catch (error) {
        console.error('Error fetching workout:', error);
        res.status(500).json({ error: 'Failed to fetch workout' });
    }
});

// Save exercise set
app.post('/api/workouts/exercise', async (req, res) => {
    const { userName, date, exerciseName, setIndex, weight, reps, completed } = req.body;
    
    try {
        // Get user ID
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        // Get or create workout for the date
        let workoutResult = await pool.query(
            'SELECT id FROM workouts WHERE user_id = $1 AND workout_date = $2',
            [userId, date]
        );

        let workoutId;
        if (workoutResult.rows.length === 0) {
            const insertResult = await pool.query(
                'INSERT INTO workouts (user_id, workout_date) VALUES ($1, $2) RETURNING id',
                [userId, date]
            );
            workoutId = insertResult.rows[0].id;
        } else {
            workoutId = workoutResult.rows[0].id;
        }

        // Upsert exercise set
        await pool.query(`
            INSERT INTO exercise_sets (workout_id, exercise_name, set_index, weight, reps, completed)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (workout_id, exercise_name, set_index) 
            DO UPDATE SET weight = $4, reps = $5, completed = $6
        `, [workoutId, exerciseName, setIndex, weight || 0, reps || 0, completed]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving exercise:', error);
        res.status(500).json({ error: 'Failed to save exercise' });
    }
});

// Complete workout
app.post('/api/workouts/complete', async (req, res) => {
    const { userName, date, dayCompleted, dayName, dayOfWeek } = req.body;
    
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        await pool.query(`
            INSERT INTO workouts (user_id, workout_date, day_completed, day_name, day_of_week)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, workout_date) 
            DO UPDATE SET day_completed = $3, day_name = $4, day_of_week = $5
        `, [userId, date, dayCompleted, dayName, dayOfWeek]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error completing workout:', error);
        res.status(500).json({ error: 'Failed to complete workout' });
    }
});

// Clear user history
app.delete('/api/workouts/:userName', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        await pool.query('DELETE FROM workouts WHERE user_id = $1', [userId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

// ===== SHARING ROUTES =====

// Share an exercise with another user
app.post('/api/share', async (req, res) => {
    const { fromUserName, toUserName, exerciseName, reps, message, workoutDate } = req.body;
    
    try {
        const fromUserResult = await pool.query('SELECT id FROM users WHERE name = $1', [fromUserName]);
        const toUserResult = await pool.query('SELECT id FROM users WHERE name = $1', [toUserName]);
        
        if (fromUserResult.rows.length === 0 || toUserResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await pool.query(`
            INSERT INTO shared_exercises (from_user_id, to_user_id, exercise_name, reps, message, workout_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [fromUserResult.rows[0].id, toUserResult.rows[0].id, exerciseName, reps, message, workoutDate]);

        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Error sharing exercise:', error);
        res.status(500).json({ error: 'Failed to share exercise' });
    }
});

// Get shared exercises for a user
app.get('/api/share/:userName', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const result = await pool.query(`
            SELECT 
                se.id,
                u.name as from_user,
                u.icon as from_icon,
                se.exercise_name,
                se.reps,
                se.message,
                se.workout_date,
                se.is_read,
                se.created_at
            FROM shared_exercises se
            JOIN users u ON se.from_user_id = u.id
            WHERE se.to_user_id = $1
            ORDER BY se.created_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching shared exercises:', error);
        res.status(500).json({ error: 'Failed to fetch shared exercises' });
    }
});

// Mark shared exercise as read
app.patch('/api/share/:id/read', async (req, res) => {
    try {
        await pool.query('UPDATE shared_exercises SET is_read = true WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Get unread count for a user
app.get('/api/share/:userName/unread', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const result = await pool.query(
            'SELECT COUNT(*) as count FROM shared_exercises WHERE to_user_id = $1 AND is_read = false',
            [userId]
        );

        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// ===== SCHEDULE ROUTES =====

// Get custom schedule for a user
app.get('/api/schedule/:userName', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const result = await pool.query(
            'SELECT schedule_data FROM custom_schedules WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json(null);
        }

        res.json(result.rows[0].schedule_data);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Save custom schedule for a user
app.post('/api/schedule/:userName', async (req, res) => {
    const { schedule } = req.body;
    
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        await pool.query(`
            INSERT INTO custom_schedules (user_id, schedule_data)
            VALUES ($1, $2)
            ON CONFLICT (user_id) 
            DO UPDATE SET schedule_data = $2, updated_at = CURRENT_TIMESTAMP
        `, [userId, JSON.stringify(schedule)]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving schedule:', error);
        res.status(500).json({ error: 'Failed to save schedule' });
    }
});

// ===== STATS ROUTES =====

// Get workout stats for a user
app.get('/api/stats/:userName', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [req.params.userName]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        // Total workouts
        const totalWorkouts = await pool.query(
            'SELECT COUNT(*) as count FROM workouts WHERE user_id = $1 AND day_completed IS NOT NULL',
            [userId]
        );

        // Current streak
        const streakResult = await pool.query(`
            WITH dates AS (
                SELECT DISTINCT workout_date 
                FROM workouts 
                WHERE user_id = $1 AND day_completed IS NOT NULL
                ORDER BY workout_date DESC
            ),
            streaks AS (
                SELECT 
                    workout_date,
                    workout_date - (ROW_NUMBER() OVER (ORDER BY workout_date DESC))::int AS streak_group
                FROM dates
            )
            SELECT COUNT(*) as streak
            FROM streaks
            WHERE streak_group = (SELECT streak_group FROM streaks LIMIT 1)
        `, [userId]);

        // Total exercises completed
        const totalExercises = await pool.query(`
            SELECT COUNT(*) as count 
            FROM exercise_sets es
            JOIN workouts w ON es.workout_id = w.id
            WHERE w.user_id = $1 AND es.completed = true
        `, [userId]);

        // This week's workouts
        const thisWeek = await pool.query(`
            SELECT COUNT(*) as count 
            FROM workouts 
            WHERE user_id = $1 
            AND day_completed IS NOT NULL
            AND workout_date >= date_trunc('week', CURRENT_DATE)
        `, [userId]);

        res.json({
            totalWorkouts: parseInt(totalWorkouts.rows[0].count),
            currentStreak: parseInt(streakResult.rows[0]?.streak || 0),
            totalExercises: parseInt(totalExercises.rows[0].count),
            thisWeek: parseInt(thisWeek.rows[0].count)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ===== LEADERBOARD =====

// Get leaderboard comparing users
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.name,
                u.icon,
                COUNT(DISTINCT w.id) FILTER (WHERE w.day_completed IS NOT NULL) as total_workouts,
                COUNT(es.id) FILTER (WHERE es.completed = true) as total_sets,
                COUNT(DISTINCT w.workout_date) FILTER (
                    WHERE w.day_completed IS NOT NULL 
                    AND w.workout_date >= date_trunc('week', CURRENT_DATE)
                ) as this_week
            FROM users u
            LEFT JOIN workouts w ON u.id = w.user_id
            LEFT JOIN exercise_sets es ON w.id = es.workout_id
            GROUP BY u.id, u.name, u.icon
            ORDER BY total_workouts DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Add unique constraint for exercise sets if not exists
pool.query(`
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'exercise_sets_unique'
        ) THEN
            ALTER TABLE exercise_sets 
            ADD CONSTRAINT exercise_sets_unique 
            UNIQUE (workout_id, exercise_name, set_index);
        END IF;
    END $$;
`).catch(err => console.log('Constraint may already exist'));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🏋️ Workout Tracker server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DATABASE_URL || 'postgresql://localhost:5432/workout_tracker'}`);
});

module.exports = app;
