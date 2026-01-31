// Simple script that runs db/init.sql to create tables
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function run() {
    try {
        const sqlPath = path.join(__dirname, '..', 'db', 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('Database initialized successfully.');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Failed to initialize database:', err);
        try { await pool.end(); } catch (e) {/*ignore*/ }
        process.exit(1);
    }
}

run();