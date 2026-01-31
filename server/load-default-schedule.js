require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

const defaultWorkoutSchedule = [
    {
        day: 1,
        name: "Legs & Push",
        emoji: "🦵",
        exercises: [
            { name: "Resistance Band Squats", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=resistance+band+squats+form+shorts" },
            { name: "Push-ups", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=perfect+push+up+form+shorts" },
            { name: "Dot Drills", type: "cardio", duration: 15, work: 45, rest: 15, videoLink: "https://www.youtube.com/results?search_query=dot+drill+agility+shorts" }
        ]
    },
    {
        day: 2,
        name: "Hinge & Pull",
        emoji: "🏋️",
        exercises: [
            { name: "Deadlift / Band Pull-Through", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=resistance+band+deadlift+proper+form+shorts" },
            { name: "Bent Over Rows", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=resistance+band+bent+over+row+proper+form+shorts" },
            { name: "Shadow Boxing", type: "cardio", duration: 15, work: 60, rest: 60, videoLink: "https://www.youtube.com/results?search_query=shadow+boxing+workout+shorts" }
        ]
    },
    {
        day: 3,
        name: "Shoulders & Core",
        emoji: "💪",
        exercises: [
            { name: "Overhead Press", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=resistance+band+overhead+press+form+shorts" },
            { name: "Plank High-Fives", type: "strength", sets: 3, isHold: true, holdTime: 45, videoLink: "https://www.youtube.com/results?search_query=plank+partner+high+five+shorts" },
            { name: "Jumping Jacks / Seal Jacks", type: "cardio", duration: 15, work: 30, rest: 30, videoLink: "https://www.youtube.com/results?search_query=seal+jacks+exercise+shorts" }
        ]
    },
    {
        day: 4,
        name: "Arms & Accessories",
        emoji: "💪",
        exercises: [
            { name: "Bicep Curls", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=resistance+band+bicep+curl+form+shorts" },
            { name: "Tricep Extensions", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=resistance+band+tricep+extension+form+shorts" },
            { name: "Mountain Climbers", type: "cardio", duration: 15, work: 30, rest: 30, videoLink: "https://www.youtube.com/results?search_query=mountain+climbers+form+shorts" }
        ]
    },
    {
        day: 5,
        name: "Deck of Cards Challenge",
        emoji: "🃏",
        isCardGame: true,
        duration: 20,
        rules: {
            hearts: { exercise: "Squats", emoji: "❤️", videoLink: "https://www.youtube.com/results?search_query=resistance+band+squat+form+shorts" },
            diamonds: { exercise: "Push-ups", emoji: "♦️", videoLink: "https://www.youtube.com/results?search_query=perfect+push+up+form+shorts" },
            spades: { exercise: "Lunges", emoji: "♠️", videoLink: "https://www.youtube.com/results?search_query=lunge+form+shorts" },
            clubs: { exercise: "Sit-ups", emoji: "♣️", videoLink: "https://www.youtube.com/results?search_query=sit+up+form+shorts" }
        }
    }
];

async function loadDefaultSchedule() {
  const client = await pool.connect();
  try {
    console.log('Loading default workout schedule...');
    const query = `
      INSERT INTO schedules (user_name, schedule_data, updated_at)
      VALUES ($1, $2, now())
      ON CONFLICT (user_name)
      DO UPDATE SET schedule_data = EXCLUDED.schedule_data, updated_at = now()
    `;
    await client.query(query, ['default', JSON.stringify(defaultWorkoutSchedule)]);
    console.log('Default schedule loaded successfully for user "default"');
  } catch (err) {
    console.error('Error loading default schedule:', err);
  } finally {
    client.release();
    pool.end();
  }
}

loadDefaultSchedule();