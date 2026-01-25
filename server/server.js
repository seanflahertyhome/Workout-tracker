// Minimal Express server exposing /api/workouts endpoints
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const workoutsRouter = require('./routes/workouts');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/workouts', workoutsRouter);

const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URI) {
  console.warn('Warning: DATABASE_URI is not set. Set it as an environment variable or via GitHub secret DATABASE_URI.');
  }

  app.listen(PORT, () => {
    console.log(`Workout-tracker API listening on port ${PORT}`);
    });