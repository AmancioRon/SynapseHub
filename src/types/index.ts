export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'due_soon' | 'overdue' | 'delivered' | 'done' | 'scheduled' | 'completed' | 'canceled' | 'on_hold';

export interface Customer {
  id: string;
  name: string;
  contact: string;
  products: string;
  dueDate: string;
  status: 'pending' | 'delivered' | 'on_hold';
  notes?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: Priority;
  customerId?: string;
  status: 'pending' | 'due_soon' | 'overdue' | 'done';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  customerId?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  title: string;
  datetime: string;
  duration: number; // minutes
  location: string;
  customerId?: string;
  status: 'scheduled' | 'completed' | 'canceled';
  notes?: string;
}

export interface HealthEntry {
  id: string;
  type: 'protein' | 'creatine';
  date: string;
  amount: number; // grams
  name?: string; // for protein
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  notes?: string;
  imageUrl?: string;
}

export interface WorkoutDay {
  id: string;
  day: string; // Monday, Tuesday, etc.
  focus: string;
  isCompleted: boolean;
  notes?: string;
  isRestDay: boolean;
}

export interface HealthProfile {
  goal: 'lean' | 'bulk' | 'lose_weight' | 'maintain' | 'recomp' | 'other';
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  proteinTarget: number;
  creatineTarget: number;
  workoutPlan: WorkoutDay[];
  hasCompletedSetup: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  enabledModules: string[];
  healthProfile?: HealthProfile;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'customer' | 'activity' | 'appointment' | 'system';
  timestamp: string;
  isRead: boolean;
  urgency: 'low' | 'medium' | 'high';
}
