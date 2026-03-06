import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Sheet } from '../components/UI';
import { 
  Activity, Plus, ChevronLeft, ChevronRight, Utensils, Zap, Camera, 
  MoreVertical, Trash2, Dumbbell, CheckCircle2, Circle, ArrowRight, 
  ArrowLeft, Info, Sparkles, Loader2, Scale, Target, Ruler, User, Settings as SettingsIcon, X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { format, parseISO, startOfWeek, addDays, isSameDay, isToday, startOfToday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { HealthProfile, WorkoutDay } from '../types';
import { useLocation } from 'react-router-dom';

type OnboardingStep = 'goal' | 'bodyInfo' | 'targets' | 'calculating' | 'recommendation' | 'workoutSetup';

export default function HealthTracker() {
  const { user, healthEntries, workoutPlan, updateHealthProfile, addHealthEntry, deleteHealthEntry, updateWorkoutPlan } = useStore();
  const location = useLocation();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('goal');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Partial<HealthProfile>>({
    goal: 'Maintain',
    gender: 'Male',
    age: 25,
    height: 175,
    weight: 70,
    targetWeight: 70,
    pace: 'Normal',
    proteinTarget: 140,
    creatineTarget: 5,
  });

  // Dashboard States
  const today = startOfToday();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [isLogging, setIsLogging] = useState<'protein' | 'creatine' | null>(null);
  const [logAmount, setLogAmount] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const addType = params.get('add');
    if (addType === 'protein') setIsLogging('protein');
    if (addType === 'creatine') setIsLogging('creatine');
  }, [location]);

  useEffect(() => {
    if (user?.healthProfile) {
      setProfile(user.healthProfile);
    }
  }, [user?.healthProfile]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayProtein = healthEntries
    .filter(h => h.type === 'protein' && isToday(parseISO(h.date)))
    .reduce((sum, h) => sum + h.amount, 0);
  
  const todayCreatine = healthEntries
    .filter(h => h.type === 'creatine' && isToday(parseISO(h.date)))
    .reduce((sum, h) => sum + h.amount, 0);

  const proteinGoalReached = todayProtein >= (user?.healthProfile?.proteinTarget || 0);
  const creatineGoalReached = todayCreatine >= (user?.healthProfile?.creatineTarget || 0);

  const todayWorkout = workoutPlan.find(w => w.day === format(today, 'EEEE'));
  const workoutDone = todayWorkout?.isCompleted;

  const selectedDayEntries = healthEntries.filter(h => isSameDay(parseISO(h.date), selectedDay));
  const [editingWorkout, setEditingWorkout] = useState<WorkoutDay | null>(null);
  const [entryMenuOpen, setEntryMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (onboardingStep === 'calculating') {
      const timer = setTimeout(() => setOnboardingStep('recommendation'), 2500);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep]);

  const handleLog = () => {
    if (!isLogging || !logAmount) return;
    const amount = parseInt(logAmount);
    if (isNaN(amount)) return;
    
    addHealthEntry({
      type: isLogging,
      amount: amount,
      date: new Date().toISOString(),
      name: isLogging === 'protein' ? 'Protein Intake' : 'Creatine Intake',
    });
    setIsLogging(null);
    setLogAmount('');
  };

  if (!user?.healthProfile || isEditingProfile) {
    return (
      <div className="min-h-[80vh] flex flex-col">
        <AnimatePresence mode="wait">
          {onboardingStep === 'goal' && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                {isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20 mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black">What's your primary goal?</h2>
                  <p className="text-slate-500 text-sm">We'll tailor your targets based on this.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {['Lean', 'Bulk', 'Lose Weight', 'Maintain', 'Recomp', 'Other'].map((goal) => (
                  <Card 
                    key={goal}
                    onClick={() => setProfile({ ...profile, goal: goal as any })}
                    className={cn(
                      "p-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]",
                      profile.goal === goal ? "border-rose-500 bg-rose-50/50 dark:bg-rose-900/10 ring-1 ring-rose-500" : ""
                    )}
                  >
                    <span className="font-bold">{goal}</span>
                    {profile.goal === goal && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
                  </Card>
                ))}
              </div>

              <Button className="w-full py-4 rounded-2xl font-bold" onClick={() => setOnboardingStep('bodyInfo')}>
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {onboardingStep === 'bodyInfo' && (
            <motion.div
              key="bodyInfo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setOnboardingStep('goal')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">About You</h2>
              </div>

              <Card className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Gender</label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        onClick={() => setProfile({ ...profile, gender: g as any })}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                          profile.gender === g ? "bg-rose-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Age</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        value={profile.age || ''}
                        onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Weight (kg)</label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        value={profile.weight || ''}
                        onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={profile.height || ''}
                      onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </Card>

              <Button className="w-full py-4 rounded-2xl font-bold" onClick={() => setOnboardingStep('targets')}>
                Next Step <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {onboardingStep === 'targets' && (
            <motion.div
              key="targets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setOnboardingStep('bodyInfo')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">Set Your Targets</h2>
              </div>

              <Card className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Target Weight (kg)</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={profile.targetWeight || ''}
                      onChange={(e) => setProfile({ ...profile, targetWeight: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pace</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Slow', 'Normal', 'Aggressive'].map(p => (
                      <button
                        key={p}
                        onClick={() => setProfile({ ...profile, pace: p as any })}
                        className={cn(
                          "py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all",
                          profile.pace === p ? "bg-rose-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Button className="w-full py-4 rounded-2xl font-bold" onClick={() => setOnboardingStep('calculating')}>
                Calculate Plan <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {onboardingStep === 'calculating' && (
            <motion.div
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6 py-12"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-rose-100 dark:border-rose-900/30 rounded-full"></div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full"
                ></motion.div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-rose-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Analyzing your data...</h3>
                <p className="text-slate-500 text-sm">Crafting your personalized nutrition plan.</p>
              </div>
            </motion.div>
          )}

          {onboardingStep === 'recommendation' && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Badge variant="success" className="px-3 py-1">Plan Ready!</Badge>
                <h2 className="text-2xl font-black">Your Recommendations</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center space-y-2 border-rose-100 dark:border-rose-900/30">
                  <Utensils className="w-6 h-6 text-rose-500 mx-auto" />
                  <p className="text-[10px] font-bold uppercase text-slate-400">Daily Protein</p>
                  <p className="text-3xl font-black text-rose-600 dark:text-rose-400">140g</p>
                </Card>
                <Card className="p-4 text-center space-y-2 border-indigo-100 dark:border-indigo-900/30">
                  <Zap className="w-6 h-6 text-indigo-500 mx-auto" />
                  <p className="text-[10px] font-bold uppercase text-slate-400">Daily Creatine</p>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">5g</p>
                </Card>
              </div>

              <Card className="p-4 bg-slate-900 text-white border-none space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold">Personalized Guidance</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on your goal to <strong>{profile.goal}</strong>, you should focus on high-protein meals distributed throughout the day. 5g of creatine daily will help with muscle recovery and performance.
                </p>
              </Card>

              <Button className="w-full py-4 rounded-2xl font-bold" onClick={() => setOnboardingStep('workoutSetup')}>
                Setup Workout Plan <Dumbbell className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {onboardingStep === 'workoutSetup' && (
            <motion.div
              key="workoutSetup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black">Workout Strategy</h2>
                <p className="text-slate-500 text-sm">How would you like to build your plan?</p>
              </div>

              <div className="space-y-3">
                <Card 
                  onClick={() => {
                    updateHealthProfile(profile as HealthProfile);
                    setIsEditingProfile(false);
                  }}
                  className="p-5 flex items-center gap-4 cursor-pointer hover:border-rose-500 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">AI Suggested Plan</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Generate a plan based on your goals</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </Card>

                <Card 
                  onClick={() => {
                    updateHealthProfile(profile as HealthProfile);
                    setIsEditingProfile(false);
                  }}
                  className="p-5 flex items-center gap-4 cursor-pointer hover:border-slate-400 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">Manual Setup</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Define your own daily focus</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Health Tracker</h2>
        <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => {
          setIsEditingProfile(true);
          setOnboardingStep('goal');
        }}>
          <SettingsIcon className="w-4 h-4 mr-1" /> Settings
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={cn(
          "text-white border-none shadow-lg transition-colors duration-500",
          proteinGoalReached ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
        )}>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Protein Today</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{todayProtein}g</span>
            <span className="text-[10px] opacity-60">/ {user.healthProfile.proteinTarget || 0}g</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((todayProtein / (user.healthProfile.proteinTarget || 1)) * 100, 100)}%` }}
            ></div>
          </div>
          {proteinGoalReached && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </Card>
        <Card className={cn(
          "text-white border-none shadow-lg transition-colors duration-500",
          creatineGoalReached ? "bg-emerald-500 shadow-emerald-500/20" : "bg-indigo-500 shadow-indigo-500/20"
        )}>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Creatine Today</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{todayCreatine}g</span>
            <span className="text-[10px] opacity-60">/ {user.healthProfile.creatineTarget || 0}g</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((todayCreatine / (user.healthProfile.creatineTarget || 1)) * 100, 100)}%` }}
            ></div>
          </div>
          {creatineGoalReached && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </Card>
        <Card className={cn(
          "text-white border-none col-span-2 overflow-hidden relative transition-colors duration-500",
          workoutDone ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-900"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Today's Workout</p>
              <h4 className="text-lg font-bold">{todayWorkout?.focus || 'Rest Day'}</h4>
              <p className={cn("text-[10px] mt-1", workoutDone ? "text-white/70" : "text-slate-400")}>
                {todayWorkout?.notes || 'Recovery & Mobility'}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <Dumbbell className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="secondary" 
          onClick={() => setIsLogging('protein')}
          className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 py-4 rounded-2xl"
        >
          <Plus className="w-4 h-4" /> Add Protein
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setIsLogging('creatine')}
          className="bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 py-4 rounded-2xl"
        >
          <Plus className="w-4 h-4" /> Add Creatine
        </Button>
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {isLogging && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold capitalize">Log {isLogging}</h3>
                <button onClick={() => setIsLogging(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center py-8">
                  <input 
                    type="number" 
                    autoFocus
                    placeholder="0"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    className="text-6xl font-black text-center bg-transparent focus:outline-none w-full"
                  />
                  <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Grams</p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 20, 30, 40, 50].map(val => (
                    <button 
                      key={val}
                      onClick={() => setLogAmount(val.toString())}
                      className="py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      +{val}
                    </button>
                  ))}
                </div>

                <Button className="w-full py-4 rounded-2xl font-bold text-lg" onClick={handleLog}>
                  Confirm Log
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weekly Calendar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Weekly Progress</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between gap-1">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDay);
            const dayEntries = healthEntries.filter(h => isSameDay(parseISO(h.date), day));
            const dayProtein = dayEntries.filter(h => h.type === 'protein').reduce((sum, h) => sum + h.amount, 0);
            const dayCreatine = dayEntries.filter(h => h.type === 'creatine').reduce((sum, h) => sum + h.amount, 0);
            
            const proteinTarget = user?.healthProfile?.proteinTarget || 0;
            const creatineTarget = user?.healthProfile?.creatineTarget || 0;
            
            const proteinMet = dayProtein >= proteinTarget && proteinTarget > 0;
            const creatineMet = dayCreatine >= creatineTarget && creatineTarget > 0;
            const allMet = proteinMet && creatineMet;

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex-1 flex flex-col items-center py-3 rounded-xl transition-all border",
                  isSelected 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105 z-10" 
                    : allMet 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800"
                )}
              >
                <span className="text-[8px] font-bold uppercase opacity-60 mb-0.5">{format(day, 'EEE')}</span>
                <span className="text-xs font-black">{format(day, 'dd')}</span>
                <div className="mt-1.5 flex gap-0.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    proteinMet ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  )} />
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    creatineMet ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Workout Plan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Workout Plan</h3>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 dark:text-indigo-400" onClick={() => {
            setIsEditingProfile(true);
            setOnboardingStep('workoutSetup');
          }}>
            Edit Plan
          </Button>
        </div>
        <div className="space-y-2">
          {workoutPlan.map(workout => {
            const isTodayWorkout = workout.day === format(today, 'EEEE');
            let timer: any;
            
            return (
              <motion.div
                key={workout.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setEditingWorkout(workout);
                }}
                onTouchStart={() => {
                  timer = setTimeout(() => setEditingWorkout(workout), 600);
                }}
                onTouchEnd={() => {
                  clearTimeout(timer);
                }}
              >
                <Card 
                  className={cn(
                    "py-4 px-4 flex items-center justify-between transition-all duration-300",
                    isTodayWorkout ? "border-l-4 border-l-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10" : "",
                    workout.isCompleted ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" : "",
                    workout.isRestDay ? "opacity-60 bg-slate-50 dark:bg-slate-800/50" : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      workout.isCompleted 
                        ? "bg-emerald-500 text-white" 
                        : workout.isRestDay 
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-500" 
                          : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    )}>
                      {workout.isRestDay ? <Circle className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{workout.day}</span>
                        {isTodayWorkout && <Badge variant="info" className="text-[8px]">Today</Badge>}
                      </div>
                      <p className={cn(
                        "text-xs font-medium",
                        workout.isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
                      )}>{workout.focus}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateWorkoutPlan(workoutPlan.map(w => w.id === workout.id ? { ...w, isCompleted: !w.isCompleted } : w))}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
                      workout.isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "border-2 border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {workout.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />}
                  </button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Daily Entries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{isToday(selectedDay) ? 'Today\'s Entries' : format(selectedDay, 'MMMM dd')}</h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="rounded-full h-10 w-10 p-0">
              <Camera className="w-4 h-4 text-indigo-500" />
            </Button>
          </div>
        </div>

        {selectedDayEntries.length === 0 ? (
          <Card variant="flat" className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No entries for this day.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedDayEntries.map(entry => (
              <Card key={entry.id} className="flex items-center gap-4 relative overflow-visible">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  entry.type === 'protein' ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                )}>
                  {entry.type === 'protein' ? <Utensils className="w-5 h-5" /> : <Zap className="w-5 h-5" /> }
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm">{entry.name || (entry.type === 'protein' ? 'Protein Intake' : 'Creatine Intake')}</h4>
                    <span className="text-sm font-black">{entry.amount}g</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.mealType && <Badge variant="info" className="text-[8px]">{entry.mealType}</Badge>}
                    <span className="text-[10px] text-slate-400 font-medium">Logged at {format(parseISO(entry.date), 'HH:mm')}</span>
                  </div>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-8 w-8 rounded-lg"
                    onClick={() => setEntryMenuOpen(entryMenuOpen === entry.id ? null : entry.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  
                  <AnimatePresence>
                    {entryMenuOpen === entry.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-10 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden"
                      >
                        <button 
                          onClick={() => {
                            deleteHealthEntry(entry.id);
                            setEntryMenuOpen(null);
                          }}
                          className="w-full px-4 py-3 text-left text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Edit Workout Sheet */}
      <Sheet
        isOpen={!!editingWorkout}
        onClose={() => setEditingWorkout(null)}
        title={`Edit ${editingWorkout?.day}`}
        footer={
          <Button 
            onClick={() => {
              if (editingWorkout) {
                updateWorkoutPlan(workoutPlan.map(w => w.id === editingWorkout.id ? editingWorkout : w));
                setEditingWorkout(null);
              }
            }} 
            className="w-full py-4 rounded-2xl font-bold"
          >
            Save Changes
          </Button>
        }
      >
        {editingWorkout && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Workout Focus</label>
              <input 
                value={editingWorkout.focus}
                onChange={e => setEditingWorkout({...editingWorkout, focus: e.target.value, isRestDay: false})}
                placeholder="e.g. Chest & Shoulders"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Notes / Exercises</label>
              <textarea 
                value={editingWorkout.notes || ''}
                onChange={e => setEditingWorkout({...editingWorkout, notes: e.target.value})}
                placeholder="List your exercises here..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] font-medium"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                  <Circle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Rest Day</h4>
                  <p className="text-[10px] text-slate-500 font-medium">No workout scheduled</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingWorkout({...editingWorkout, isRestDay: !editingWorkout.isRestDay, focus: !editingWorkout.isRestDay ? 'Rest Day' : editingWorkout.focus})}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors",
                  editingWorkout.isRestDay ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  editingWorkout.isRestDay ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
