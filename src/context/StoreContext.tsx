import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Customer, Activity, Expense, Appointment, HealthEntry, Notification, WorkoutDay, HealthProfile, ChatMessage, AssistantSettings } from '../types';
import { MOCK_CUSTOMERS, MOCK_ACTIVITIES, MOCK_EXPENSES, MOCK_APPOINTMENTS, MOCK_HEALTH, MOCK_WORKOUTS, MOCK_NOTIFICATIONS } from '../data/mockData';

interface StoreContextType {
  user: User | null;
  customers: Customer[];
  activities: Activity[];
  expenses: Expense[];
  appointments: Appointment[];
  healthEntries: HealthEntry[];
  workoutPlan: WorkoutDay[];
  notifications: Notification[];
  expenseCategories: string[];
  chatHistory: ChatMessage[];
  
  // Auth actions
  login: (email: string) => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Onboarding actions
  completeOnboarding: (modules: string[]) => void;
  
  // Health actions
  completeHealthSetup: (profile: HealthProfile) => void;
  updateHealthProfile: (profile: Partial<HealthProfile>) => void;
  addHealthEntry: (entry: Omit<HealthEntry, 'id'>) => void;
  deleteHealthEntry: (id: string) => void;
  updateWorkoutPlan: (plan: WorkoutDay[]) => void;
  
  // Module actions
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addExpenseCategory: (category: string) => void;
  deleteExpenseCategory: (category: string) => void;
  
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  deleteActivity: (id: string) => void;
  
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  deleteAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  
  updateModuleSettings: (modules: string[]) => void;
  
  // Assistant actions
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  updateAssistantSettings: (settings: Partial<AssistantSettings>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>(MOCK_HEALTH);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>(MOCK_WORKOUTS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(['Materials', 'Food', 'Delivery', 'Bills', 'Equipment', 'Misc']);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Load from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem('synapse_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedWorkout = localStorage.getItem('synapse_workout');
    if (savedWorkout) {
      setWorkoutPlan(JSON.parse(savedWorkout));
    }
    const savedNotifications = localStorage.getItem('synapse_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    const savedCategories = localStorage.getItem('synapse_expense_categories');
    if (savedCategories) {
      setExpenseCategories(JSON.parse(savedCategories));
    }
    const savedExpenses = localStorage.getItem('synapse_expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    const savedHealth = localStorage.getItem('synapse_health');
    if (savedHealth) {
      setHealthEntries(JSON.parse(savedHealth));
    }
    const savedChat = localStorage.getItem('synapse_chat');
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('synapse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('synapse_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('synapse_workout', JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem('synapse_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('synapse_expense_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('synapse_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('synapse_health', JSON.stringify(healthEntries));
  }, [healthEntries]);

  useEffect(() => {
    localStorage.setItem('synapse_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const login = (email: string) => {
    setUser({
      id: '1',
      email,
      name: email.split('@')[0],
      isAuthenticated: true,
      hasCompletedOnboarding: true, // For demo, assume existing users are onboarded
      enabledModules: ['customers', 'activities', 'expenses', 'appointments', 'health'],
      assistantSettings: {
        enabled: true,
        showWidget: true,
        suggestionsEnabled: true,
        tone: 'assistant'
      }
    });
  };

  const signup = (email: string, name: string) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      isAuthenticated: true,
      hasCompletedOnboarding: false,
      enabledModules: [],
      assistantSettings: {
        enabled: true,
        showWidget: true,
        suggestionsEnabled: true,
        tone: 'assistant'
      }
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const completeOnboarding = (modules: string[]) => {
    if (user) {
      setUser({ ...user, enabledModules: modules, hasCompletedOnboarding: true });
    }
  };

  const completeHealthSetup = (profile: HealthProfile) => {
    if (user) {
      setUser({ ...user, healthProfile: profile });
    }
  };

  const updateHealthProfile = (profile: Partial<HealthProfile>) => {
    if (user) {
      const currentProfile = user.healthProfile || {} as HealthProfile;
      setUser({ ...user, healthProfile: { ...currentProfile, ...profile } as HealthProfile });
    }
  };

  const addHealthEntry = (entry: Omit<HealthEntry, 'id'>) => {
    const newEntry = { ...entry, id: Math.random().toString(36).substr(2, 9) };
    setHealthEntries([...healthEntries, newEntry]);
  };

  const deleteHealthEntry = (id: string) => {
    setHealthEntries(healthEntries.filter(e => e.id !== id));
  };

  const updateWorkoutPlan = (plan: WorkoutDay[]) => {
    setWorkoutPlan(plan);
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: Math.random().toString(36).substr(2, 9) };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity = { ...activity, id: Math.random().toString(36).substr(2, 9) };
    setActivities([...activities, newActivity]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(activities.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Math.random().toString(36).substr(2, 9) };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addExpenseCategory = (category: string) => {
    if (!expenseCategories.includes(category)) {
      setExpenseCategories([...expenseCategories, category]);
    }
  };

  const deleteExpenseCategory = (category: string) => {
    setExpenseCategories(expenseCategories.filter(c => c !== category));
    // Optionally reassign expenses to 'Misc'
    setExpenses(expenses.map(e => e.category === category ? { ...e, category: 'Misc' } : e));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = { ...appointment, id: Math.random().toString(36).substr(2, 9) };
    setAppointments([...appointments, newAppointment]);
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const updateModuleSettings = (modules: string[]) => {
    if (user) {
      setUser({ ...user, enabledModules: modules });
    }
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  const updateAssistantSettings = (settings: Partial<AssistantSettings>) => {
    if (user) {
      const currentSettings = user.assistantSettings || {
        enabled: true,
        showWidget: true,
        suggestionsEnabled: true,
        tone: 'assistant'
      };
      setUser({ ...user, assistantSettings: { ...currentSettings, ...settings } as AssistantSettings });
    }
  };

  return (
    <StoreContext.Provider value={{
      user, customers, activities, expenses, appointments, healthEntries, workoutPlan, notifications, expenseCategories, chatHistory,
      login, signup, logout, updateUser, completeOnboarding, completeHealthSetup, updateHealthProfile,
      addHealthEntry, deleteHealthEntry, updateWorkoutPlan, addCustomer, updateCustomer, deleteCustomer, addActivity, updateActivity, deleteActivity,
      addExpense, updateExpense, deleteExpense, addExpenseCategory, deleteExpenseCategory, addAppointment, updateAppointment, deleteAppointment,
      markAllNotificationsAsRead, markNotificationAsRead, deleteAllNotifications, deleteNotification, updateModuleSettings,
      addChatMessage, clearChatHistory, updateAssistantSettings
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
