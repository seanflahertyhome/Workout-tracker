// PG pool wrapper - uses DATABASE_URI env var
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URI;
if (!connectionString) {
  console.warn('DATABASE_URI is not set. Database operations will fail until it is provided.');
  }

  const pool = new Pool({
    connectionString,
      // If deploying to some managed PG platforms, you might need SSL:
        // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        module.exports = {
          pool,
            query: (text, params) => pool.query(text, params)
            };