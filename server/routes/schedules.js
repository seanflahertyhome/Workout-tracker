const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/schedules/:user - get schedule for user
router.get('/:user', async (req, res) => {
    const user = req.params.user;
    try {
        const result = await db.query('SELECT schedule_data FROM schedules WHERE user_name = $1', [user]);
        if (result.rows.length === 0) {
            return res.json(null); // No schedule found
        }
        res.json(result.rows[0].schedule_data);
    } catch (err) {
        console.error('GET /api/schedules/:user error', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/schedules/:user - save schedule for user
router.post('/:user', async (req, res) => {
    const user = req.params.user;
    const scheduleData = req.body;
    try {
        const result = await db.query(`
            INSERT INTO schedules (user_name, schedule_data, updated_at)
            VALUES ($1, $2, now())
            ON CONFLICT (user_name)
            DO UPDATE SET schedule_data = EXCLUDED.schedule_data, updated_at = now()
            RETURNING id
        `, [user, JSON.stringify(scheduleData)]);
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('POST /api/schedules/:user error', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;