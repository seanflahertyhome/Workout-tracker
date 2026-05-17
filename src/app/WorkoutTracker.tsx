"use client";

import { useState, useEffect, useCallback } from "react";
import { defaultWorkoutSchedule } from "@/lib/constants";
import { 
  Home, 
  Timer as TimerIcon, 
  History, 
  Settings, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  User,
  LogOut,
  ArrowLeft,
  Video
} from "lucide-react";
import { signOut } from "next-auth/react";
import { getWorkout, saveWorkout, getSchedule, saveSchedule } from "./actions";

type View = "home" | "timer" | "history" | "settings" | "workout" | "cardGame";

export default function WorkoutTracker({ user }: { user: any }) {
  const [currentView, setCurrentView] = useState<View>("home");
  const [workoutSchedule, setWorkoutSchedule] = useState<any[]>(defaultWorkoutSchedule);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [workoutData, setWorkoutData] = useState<any>({ Father: { exercises: {} }, Son: { exercises: {} } });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<"Father" | "Son">("Father");

  // Timer State
  const [timerState, setTimerState] = useState({ running: false, timeLeft: 0, isWork: true, workTime: 30, restTime: 30 });
  
  // Card Game State
  const [cardGameState, setCardGameState] = useState({
    running: false,
    timeLeft: 20 * 60,
    deck: [] as any[],
    currentCard: null as any,
    cardsDrawn: 0
  });

  const todayKey = new Date().toISOString().split('T')[0];

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [dbSchedule, dbWorkout] = await Promise.all([
        getSchedule(),
        getWorkout(todayKey)
      ]);

      if (dbSchedule) setWorkoutSchedule(dbSchedule as any[]);
      if (dbWorkout) setWorkoutData(dbWorkout);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSaveWorkout = async (newData: any) => {
    setWorkoutData(newData);
    await saveWorkout(todayKey, newData);
  };

  const handleSaveSchedule = async (newSchedule: any[]) => {
    setWorkoutSchedule(newSchedule);
    await saveSchedule(newSchedule);
  };

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerState.running && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timerState.timeLeft === 0 && timerState.running) {
      // Toggle work/rest
      const nextIsWork = !timerState.isWork;
      setTimerState(prev => ({
        ...prev,
        isWork: nextIsWork,
        timeLeft: nextIsWork ? prev.workTime : prev.restTime
      }));
      // Play beep? (Skipping for now)
    }
    return () => clearInterval(interval);
  }, [timerState]);

  // Card Game Logic
  useEffect(() => {
    let interval: any;
    if (cardGameState.running && cardGameState.timeLeft > 0) {
      interval = setInterval(() => {
        setCardGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (cardGameState.timeLeft === 0 && cardGameState.running) {
      setCardGameState(prev => ({ ...prev, running: false }));
    }
    return () => clearInterval(interval);
  }, [cardGameState.running, cardGameState.timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimerState(prev => ({
      ...prev,
      running: true,
      timeLeft: prev.isWork ? prev.workTime : prev.restTime
    }));
  };

  const pauseTimer = () => setTimerState(prev => ({ ...prev, running: false }));
  const resetTimer = () => setTimerState(prev => ({ ...prev, running: false, timeLeft: prev.workTime, isWork: true }));

  const getTodayWorkoutIndex = () => {
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    const dayMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
    return dayMap[today] ?? -1;
  };

  const createDeck = () => {
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const startCardGame = () => {
    setCardGameState({
      running: true,
      timeLeft: 20 * 60,
      deck: createDeck(),
      currentCard: null,
      cardsDrawn: 0
    });
  };

  const drawCard = () => {
    setCardGameState(prev => {
      let newDeck = [...prev.deck];
      if (newDeck.length === 0) newDeck = createDeck();
      const card = newDeck.pop();
      return {
        ...prev,
        deck: newDeck,
        currentCard: card,
        cardsDrawn: prev.cardsDrawn + 1
      };
    });
  };

  const renderHome = () => {
    const todayIndex = getTodayWorkoutIndex();
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-400">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          <h2 className="text-2xl font-bold mt-2">Choose Your Workout</h2>
          {todayIndex >= 0 ? (
            <p className="text-green-400 text-sm mt-1">Today's workout: {workoutSchedule[todayIndex].name}</p>
          ) : (
            <p className="text-yellow-400 text-sm mt-1">Rest day - enjoy your weekend! 🎉</p>
          )}
        </div>
        <div className="space-y-4">
          {workoutSchedule.map((day, index) => (
            <button
              key={index}
              onClick={() => {
                if (day.isCardGame) setCurrentView("cardGame");
                else {
                  setSelectedDayIndex(index);
                  setCurrentView("workout");
                }
              }}
              className={`w-full bg-gradient-to-r ${getGradient(index, day)} p-5 rounded-2xl text-left shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98] ${todayIndex === index ? 'ring-2 ring-yellow-400' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl mr-3">{day.emoji}</span>
                  <span className="text-xl font-bold">{day.dayOfWeek}</span>
                  {todayIndex === index && (
                    <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">TODAY</span>
                  )}
                </div>
                <ChevronRight className="w-6 h-6" />
              </div>
              <p className="mt-2 text-lg opacity-90">{day.name}</p>
              <p className="text-sm opacity-75 mt-1">
                {day.isCardGame ? '20 min bodyweight challenge' : 
                 day.isRecovery ? 'Light movement & stretching' :
                 `${day.exercises.length} exercises • No equipment needed`}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getGradient = (index: number, day: any) => {
    if (day.isRecovery) return 'from-teal-600 to-teal-800';
    const gradients = [
      'from-blue-600 to-blue-800',
      'from-teal-600 to-teal-800',
      'from-green-600 to-green-800',
      'from-teal-600 to-teal-800',
      'from-red-600 to-red-800'
    ];
    return gradients[index % gradients.length];
  };

  const renderWorkout = () => {
    const day = workoutSchedule[selectedDayIndex];
    const currentProfileData = workoutData[profile] || { exercises: {} };

    return (
      <div className="space-y-6">
        <button onClick={() => setCurrentView("home")} className="flex items-center text-blue-400 hover:text-blue-300">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Days
        </button>

        <div className="text-center">
          <span className="text-4xl">{day.emoji}</span>
          <h2 className="text-2xl font-bold mt-2">{day.name}</h2>
          <p className="text-gray-400 mt-1">{day.dayOfWeek} Workout ({profile})</p>
        </div>

        <div className="space-y-4">
          {day.exercises.map((ex: any, exIdx: number) => {
            const exerciseData = currentProfileData.exercises[ex.name] || [];
            return (
              <div key={exIdx} className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{ex.name}</h3>
                    <p className="text-sm text-gray-400">
                      {ex.isHold ? `${ex.sets} sets • ${ex.holdTime}s hold` : 
                       ex.type === 'cardio' ? `${ex.duration} min • ${ex.work}s work / ${ex.rest}s rest` :
                       `${ex.sets} sets`}
                    </p>
                  </div>
                  {ex.videoLink && (
                    <a href={ex.videoLink} target="_blank" className="bg-red-600 p-2 rounded-full hover:bg-red-500 transition-colors">
                      <Video className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  {Array.from({ length: ex.sets || 1 }).map((_, setIdx) => {
                    const setData = exerciseData[setIdx] || { weight: '', reps: '', completed: false };
                    return (
                      <div key={setIdx} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                          {setIdx + 1}
                        </div>
                        <input
                          type="number"
                          placeholder={ex.type === 'cardio' ? 'Min' : 'Lbs'}
                          className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={setData.weight}
                          onChange={(e) => {
                            const newData = { ...workoutData };
                            if (!newData[profile]) newData[profile] = { exercises: {} };
                            if (!newData[profile].exercises[ex.name]) newData[profile].exercises[ex.name] = [];
                            newData[profile].exercises[ex.name][setIdx] = { ...setData, weight: e.target.value };
                            handleSaveWorkout(newData);
                          }}
                        />
                        <input
                          type="number"
                          placeholder={ex.isHold ? 'Sec' : 'Reps'}
                          className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={setData.reps}
                          onChange={(e) => {
                            const newData = { ...workoutData };
                            if (!newData[profile]) newData[profile] = { exercises: {} };
                            if (!newData[profile].exercises[ex.name]) newData[profile].exercises[ex.name] = [];
                            newData[profile].exercises[ex.name][setIdx] = { ...setData, reps: e.target.value };
                            handleSaveWorkout(newData);
                          }}
                        />
                        <button
                          onClick={() => {
                            const newData = { ...workoutData };
                            if (!newData[profile]) newData[profile] = { exercises: {} };
                            if (!newData[profile].exercises[ex.name]) newData[profile].exercises[ex.name] = [];
                            newData[profile].exercises[ex.name][setIdx] = { ...setData, completed: !setData.completed };
                            handleSaveWorkout(newData);
                          }}
                          className={`w-12 h-10 rounded-lg flex items-center justify-center transition-colors ${setData.completed ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                          {setData.completed ? '✓' : ''}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => {
            const newData = { ...workoutData };
            if (!newData[profile]) newData[profile] = { exercises: {} };
            newData[profile] = { ...newData[profile], dayCompleted: day.day, dayName: day.name, dayOfWeek: day.dayOfWeek };
            handleSaveWorkout(newData);
            alert("Workout progress saved!");
            setCurrentView("home");
          }}
          className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-bold text-xl transition-all transform active:scale-[0.98] shadow-lg mb-8"
        >
          Finish Workout
        </button>
      </div>
    );
  };

  const renderTimer = () => {
    return (
      <div className="space-y-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">HIIT Timer</h2>
          <p className="text-gray-400 mt-2">Perfect for cardio & planks</p>
        </div>

        <div className="relative w-64 h-64 mx-auto">
          <div className={`absolute inset-0 rounded-full border-8 ${timerState.isWork ? 'border-blue-500' : 'border-green-500'} opacity-20`}></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-sm font-bold uppercase tracking-widest ${timerState.isWork ? 'text-blue-400' : 'text-green-400'}`}>
              {timerState.isWork ? 'Work' : 'Rest'}
            </span>
            <span className="text-6xl font-black mt-2 tabular-nums">
              {formatTime(timerState.timeLeft || (timerState.isWork ? timerState.workTime : timerState.restTime))}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={timerState.running ? pauseTimer : startTimer}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${timerState.running ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {timerState.running ? <span className="text-2xl font-bold">||</span> : <Play className="w-8 h-8 fill-current" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 shadow-lg transition-transform active:scale-90"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
            <label className="block text-xs text-gray-400 uppercase font-bold mb-2">Work (sec)</label>
            <input 
              type="number" 
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={timerState.workTime}
              onChange={(e) => setTimerState(prev => ({ ...prev, workTime: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
            <label className="block text-xs text-gray-400 uppercase font-bold mb-2">Rest (sec)</label>
            <input 
              type="number" 
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-xl font-bold focus:ring-2 focus:ring-green-500 outline-none"
              value={timerState.restTime}
              onChange={(e) => setTimerState(prev => ({ ...prev, restTime: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCardGame = () => {
    const day5 = workoutSchedule[4];
    return (
      <div className="space-y-6">
        <button onClick={() => setCurrentView("home")} className="flex items-center text-blue-400 hover:text-blue-300">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Days
        </button>
        
        <div className="text-center">
          <span className="text-4xl">🃏</span>
          <h2 className="text-2xl font-bold mt-2">Deck of Cards Challenge</h2>
          <p className="text-gray-400 mt-1">20 minutes of bodyweight exercises!</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(day5.rules).map(([suit, data]: [string, any]) => (
              <div key={suit} className="flex items-center gap-2">
                <span className={`${['hearts', 'diamonds'].includes(suit) ? 'text-red-500' : 'text-white'} text-xl`}>{data.emoji}</span>
                <span>{data.exercise}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold">{formatTime(cardGameState.timeLeft)}</div>
          <div className="text-gray-400 mt-1">Cards drawn: {cardGameState.cardsDrawn}</div>
        </div>

        <div className="flex justify-center h-56">
          {cardGameState.currentCard ? (
            <div className="bg-white rounded-xl w-40 h-56 flex flex-col items-center justify-center shadow-xl border-4 border-gray-200">
              <span className={`${['hearts', 'diamonds'].includes(cardGameState.currentCard.suit) ? 'text-red-500' : 'text-gray-900'} text-6xl`}>
                {cardGameState.currentCard.suit === 'hearts' ? '♥' : cardGameState.currentCard.suit === 'diamonds' ? '♦' : cardGameState.currentCard.suit === 'spades' ? '♠' : '♣'}
              </span>
              <span className="text-gray-900 text-4xl font-bold mt-2">{cardGameState.currentCard.value}</span>
              <span className="text-gray-600 text-xs mt-2 text-center px-2">
                {['A'].includes(cardGameState.currentCard.value) ? 1 : ['J', 'Q', 'K'].includes(cardGameState.currentCard.value) ? 10 : cardGameState.currentCard.value} {day5.rules[cardGameState.currentCard.suit].exercise}
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl w-40 h-56 flex items-center justify-center shadow-xl border-4 border-white">
               <span className="text-4xl">🃏</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {cardGameState.running ? (
            <>
              <button onClick={drawCard} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-xl">
                🎴 Draw Card
              </button>
              <button onClick={() => setCardGameState(prev => ({ ...prev, running: false }))} className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-2xl font-semibold">
                Stop Game
              </button>
            </>
          ) : (
            <button onClick={startCardGame} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-bold text-xl">
              ▶️ Start Challenge
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const profileData = workoutData[profile] || {};
    const exercises = profileData.exercises || {};
    const hasData = Object.keys(exercises).length > 0;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Your Progress ({profile})</h2>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          {!hasData ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No workout data found for today yet.</p>
              <button onClick={() => setCurrentView("home")} className="mt-4 text-blue-400 font-bold">Start Workout</button>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {Object.entries(exercises).map(([name, sets]: [string, any]) => (
                <div key={name} className="border-b border-gray-700 pb-3 last:border-0">
                  <h4 className="font-bold text-blue-400">{name}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {sets.map((set: any, i: number) => (
                      <div key={i} className={`text-xs px-2 py-1 rounded ${set.completed ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        Set {i+1}: {set.weight || 0} x {set.reps || 0}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="p-4 bg-gray-700 rounded-xl text-center">
                <span className="block text-2xl font-bold text-blue-400">{hasData ? 1 : 0}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Today's Workouts</span>
             </div>
             <div className="p-4 bg-gray-700 rounded-xl text-center">
                <span className="block text-2xl font-bold text-green-400">1</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Day Streak</span>
             </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center italic">Currently viewing data for today ({todayKey})</p>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Settings</h2>
        
        <div className="bg-gray-800 rounded-2xl p-4 space-y-4 border border-gray-700">
           <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="font-bold">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                 </div>
              </div>
              <button onClick={() => signOut()} className="text-red-400 hover:text-red-300">
                 <LogOut className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => alert("Schedule editing coming soon in React version!")} className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl flex items-center justify-between border border-gray-700 transition-colors">
            <span className="font-semibold">Edit Workout Schedule</span>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={() => {}} className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl flex items-center justify-between border border-gray-700 transition-colors">
            <span className="font-semibold">Export My Data</span>
            <Download className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={() => {}} className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl flex items-center justify-between border border-gray-700 transition-colors">
            <span className="font-semibold">Import Data</span>
            <Upload className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <header className="flex justify-between items-center mb-8">
         <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">💪</span> Workout Tracker
         </h1>
         <button 
           onClick={() => setProfile(p => p === "Father" ? "Son" : "Father")}
           className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg"
         >
            <span className="text-lg">{profile === "Father" ? "👨" : "👦"}</span>
            <span>{profile}</span>
         </button>
      </header>

      <main>
        {currentView === "home" && renderHome()}
        {currentView === "workout" && renderWorkout()}
        {currentView === "timer" && renderTimer()}
        {currentView === "history" && renderHistory()}
        {currentView === "settings" && renderSettings()}
        {currentView === "cardGame" && renderCardGame()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          <button onClick={() => setCurrentView("home")} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-blue-400' : 'text-gray-500'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Home</span>
          </button>
          <button onClick={() => setCurrentView("timer")} className={`flex flex-col items-center gap-1 ${currentView === 'timer' ? 'text-blue-400' : 'text-gray-500'}`}>
            <TimerIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Timer</span>
          </button>
          <button onClick={() => setCurrentView("history")} className={`flex flex-col items-center gap-1 ${currentView === 'history' ? 'text-blue-400' : 'text-gray-500'}`}>
            <History className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">History</span>
          </button>
          <button onClick={() => setCurrentView("settings")} className={`flex flex-col items-center gap-1 ${currentView === 'settings' ? 'text-blue-400' : 'text-gray-500'}`}>
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
