const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/workouts
router.get('/', async (req, res) => {
    try {
        const { user } = req.query;
        let query = 'SELECT * FROM workouts';
        let params = [];
        if (user) {
            query += ' WHERE metadata->>\'user\' = $1';
            params = [user];
        }
        query += ' ORDER BY date DESC';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('GET /api/workouts error', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/workouts/:id
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const workout = await db.query('SELECT * FROM workouts WHERE id = $1', [id]);
        if (workout.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const exercises = await db.query('SELECT * FROM exercises WHERE workout_id = $1 ORDER BY id', [id]);
        res.json({ ...workout.rows[0], exercises: exercises.rows });
    } catch (err) {
        console.error(`GET /api/workouts/${id} error`, err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/workouts
// Expected JSON body example:
// {
//   "date": "2026-01-25T17:00:00Z",
//   "type": "Run",
//   "duration": 3600,
//   "distance": 10.5,
//   "calories": 650,
//   "notes": "Felt good",
//   "metadata": { "hr_avg": 145 },
//   "exercises": [
//     { "name": "Squat", "sets": 3, "reps": 8, "weight": 100, "notes": "" }
//   ]
// }
router.post('/', async (req, res) => {
    const { date, type, duration, distance, calories, notes, metadata, exercises } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const insertWorkoutText = `
                                                                          INSERT INTO workouts (date, type, duration, distance, calories, notes, metadata)
                                                                                VALUES ($1,$2,$3,$4,$5,$6,$7)
                                                                                      RETURNING id
                                                                                          `;
        const insertWorkoutValues = [
            date || new Date(),
            type || null,
            duration || null,
            distance || null,
            calories || null,
            notes || null,
            metadata || null
        ];

        const result = await client.query(insertWorkoutText, insertWorkoutValues);
        const workoutId = result.rows[0].id;

        if (Array.isArray(exercises) && exercises.length > 0) {
            const insertExerciseText = `
                                                                                                                                                                      INSERT INTO exercises (workout_id, name, reps, sets, weight, duration, notes)
                                                                                                                                                                              VALUES ($1,$2,$3,$4,$5,$6,$7)
                                                                                                                                                                                    `;
            for (const ex of exercises) {
                await client.query(insertExerciseText, [
                    workoutId,
                    ex.name || null,
                    ex.reps || null,
                    ex.sets || null,
                    ex.weight || null,
                    ex.duration || null,
                    ex.notes || null
                ]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ id: workoutId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('POST /api/workouts error', err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

module.exports = router;