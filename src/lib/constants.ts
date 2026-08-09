export const formatHoldTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
};

export const defaultWorkoutSchedule = [
  {
    day: 1,
    dayOfWeek: "Monday",
    name: "Upper Body Push & Core",
    emoji: "💪",
    exercises: [
      { name: "Push-ups", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=perfect+push+up+form+tutorial+shorts" },
      { name: "Pike Push-ups", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=pike+push+up+shoulders+tutorial+shorts" },
      { name: "Diamond Push-ups", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=diamond+push+ups+triceps+form+shorts" },
      { name: "Plank Hold", type: "strength", sets: 3, isHold: true, holdTime: 45, videoLink: "https://www.youtube.com/results?search_query=plank+proper+form+tutorial+shorts" },
      { name: "High Knees", type: "cardio", duration: 10, work: 30, rest: 30, videoLink: "https://www.youtube.com/results?search_query=high+knees+exercise+shorts" }
    ]
  },
  {
    day: 2,
    dayOfWeek: "Tuesday",
    name: "Active Recovery",
    emoji: "🚶",
    isRecovery: true,
    exercises: [
      { name: "Brisk Walking", type: "recovery", duration: 30, description: "30-minute walk at a comfortable pace", videoLink: "https://www.youtube.com/results?search_query=benefits+of+walking+shorts" },
      { name: "Standing Quad Stretch", type: "stretch", sets: 2, isHold: true, holdTime: 30, videoLink: "https://www.youtube.com/results?search_query=standing+quad+stretch+shorts" },
      { name: "Standing Hamstring Stretch", type: "stretch", sets: 2, isHold: true, holdTime: 30, videoLink: "https://www.youtube.com/results?search_query=standing+hamstring+stretch+shorts" },
      { name: "Arm Circles", type: "stretch", sets: 2, isHold: true, holdTime: 30, videoLink: "https://www.youtube.com/results?search_query=arm+circles+stretch+shorts" },
      { name: "Cat-Cow Stretch", type: "stretch", sets: 2, isHold: true, holdTime: 30, videoLink: "https://www.youtube.com/results?search_query=cat+cow+stretch+tutorial+shorts" }
    ]
  },
  {
    day: 3,
    dayOfWeek: "Wednesday",
    name: "Lower Body & Glutes",
    emoji: "🦵",
    exercises: [
      { name: "Bodyweight Squats", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=bodyweight+squat+proper+form+shorts" },
      { name: "Reverse Lunges", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=reverse+lunge+form+tutorial+shorts" },
      { name: "Glute Bridges", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=glute+bridge+proper+form+shorts" },
      { name: "Wall Sit", type: "strength", sets: 3, isHold: true, holdTime: 45, videoLink: "https://www.youtube.com/results?search_query=wall+sit+proper+form+shorts" },
      { name: "Calf Raises", type: "strength", sets: 3, videoLink: "https://www.youtube.com/results?search_query=calf+raises+bodyweight+shorts" },
      { name: "Jump Squats", type: "cardio", duration: 10, work: 30, rest: 30, videoLink: "https://www.youtube.com/results?search_query=jump+squat+form+shorts" }
    ]
  },
  {
    day: 4,
    dayOfWeek: "Thursday",
    name: "Active Recovery",
    emoji: "🧘",
    isRecovery: true,
    exercises: [
      { name: "Easy Walking", type: "recovery", duration: 20, description: "20-minute relaxed walk", videoLink: "https://www.youtube.com/results?search_query=walking+for+recovery+shorts" },
      { name: "Child's Pose", type: "stretch", sets: 2, isHold: true, holdTime: 45, videoLink: "https://www.youtube.com/results?search_query=childs+pose+stretch+shorts" },
      { name: "Downward Dog", type: "stretch", sets: 2, isHold: true, holdTime: 30, videoLink: "https://www.youtube.com/results?search_query=downward+dog+stretch+shorts" },
      { name: "Hip Flexor Stretch", type: "stretch", sets: 2, isHold: true, holdTime: 30, videoLink: "https://www.youtube.com/results?search_query=hip+flexor+stretch+shorts" },
      { name: "Seated Spinal Twist", type: "stretch", sets: 2, isHold: true, holdTime: 30, videoLink: "https://www.youtube.com/results?search_query=seated+spinal+twist+stretch+shorts" },
      { name: "Deep Breathing", type: "stretch", sets: 1, isHold: true, holdTime: 120, videoLink: "https://www.youtube.com/results?search_query=deep+breathing+exercise+relaxation+shorts" }
    ]
  },
  {
    day: 5,
    dayOfWeek: "Friday",
    name: "Full Body Challenge",
    emoji: "🃏",
    isCardGame: true,
    duration: 20,
    rules: {
      hearts: { exercise: "Squats", emoji: "❤️", videoLink: "https://www.youtube.com/results?search_query=bodyweight+squat+form+shorts" },
      diamonds: { exercise: "Push-ups", emoji: "♦️", videoLink: "https://www.youtube.com/results?search_query=perfect+push+up+form+shorts" },
      spades: { exercise: "Lunges (each leg)", emoji: "♠️", videoLink: "https://www.youtube.com/results?search_query=lunge+form+shorts" },
      clubs: { exercise: "Burpees", emoji: "♣️", videoLink: "https://www.youtube.com/results?search_query=burpee+form+tutorial+shorts" }
    }
  }
];
