-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      type VARCHAR(100),
        duration INTEGER,     -- seconds (or store client units)
          distance NUMERIC,     -- kilometers/miles as float; keep units in metadata if needed
            calories INTEGER,
              notes TEXT,
                metadata JSONB,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
                  );

                  -- Create exercises table
                  CREATE TABLE IF NOT EXISTS exercises (
                    id SERIAL PRIMARY KEY,
                      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
                        name VARCHAR(200),
                          reps INTEGER,
                            sets INTEGER,
                              weight NUMERIC,
                                duration INTEGER,
                                  notes TEXT
                                  );

                                  -- Useful indexes
                                  CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts (date DESC);
                                  CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises (workout_id);