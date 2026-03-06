import { Customer, Activity, Expense, Appointment, HealthEntry, Notification, WorkoutDay } from '../types';
import { addDays, subDays, format, startOfToday } from 'date-fns';

const today = startOfToday();

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Acme Corp',
    contact: 'John Doe (john@acme.com)',
    products: 'Q1 Marketing Strategy',
    dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    status: 'pending',
    notes: 'Key account for Q1.',
  },
  {
    id: '2',
    name: 'Globex Corporation',
    contact: 'Hank Scorpio (hank@globex.com)',
    products: 'Volcano Base Blueprint',
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    status: 'pending',
    notes: 'Very demanding client.',
  },
  {
    id: '3',
    name: 'Initech',
    contact: 'Peter Gibbons (peter@initech.com)',
    products: 'TPS Reports',
    dueDate: format(addDays(today, 10), 'yyyy-MM-dd'),
    status: 'pending',
  },
  {
    id: '4',
    name: 'Soylent Corp',
    contact: 'Sol Roth (sol@soylent.com)',
    products: 'New Recipe Analysis',
    dueDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    status: 'delivered',
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Call John from Acme',
    deadline: format(today, "yyyy-MM-dd'T'14:00"),
    priority: 'high',
    customerId: '1',
    status: 'pending',
    description: 'Discuss marketing strategy details.',
  },
  {
    id: '2',
    title: 'Review Globex blueprints',
    deadline: format(subDays(today, 1), "yyyy-MM-dd'T'10:00"),
    priority: 'high',
    customerId: '2',
    status: 'overdue',
  },
  {
    id: '3',
    title: 'Update TPS report templates',
    deadline: format(addDays(today, 3), "yyyy-MM-dd'T'16:00"),
    priority: 'medium',
    customerId: '3',
    status: 'pending',
  },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    title: 'Business Lunch',
    amount: 2500.50,
    currency: 'PHP',
    category: 'Food',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    customerId: '1',
    notes: 'Lunch with Acme team.',
  },
  {
    id: '2',
    title: 'Cloud Hosting',
    amount: 6000.00,
    currency: 'PHP',
    category: 'Bills',
    date: format(subDays(today, 10), 'yyyy-MM-dd'),
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    title: 'Acme Strategy Sync',
    datetime: format(addDays(today, 1), "yyyy-MM-dd'T'11:00"),
    duration: 60,
    location: 'Zoom',
    customerId: '1',
    status: 'scheduled',
    notes: 'Prepare the slide deck.',
  },
  {
    id: '2',
    title: 'Initech Onboarding',
    datetime: format(today, "yyyy-MM-dd'T'15:30"),
    duration: 45,
    location: 'Office 402',
    customerId: '3',
    status: 'scheduled',
  },
];

export const MOCK_HEALTH: HealthEntry[] = [
  {
    id: '1',
    type: 'protein',
    date: format(today, 'yyyy-MM-dd'),
    amount: 30,
    name: 'Whey Shake',
    mealType: 'snack',
  },
  {
    id: '2',
    type: 'creatine',
    date: format(today, 'yyyy-MM-dd'),
    amount: 5,
  },
  {
    id: '3',
    type: 'protein',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    amount: 120,
    name: 'Chicken and Rice',
    mealType: 'lunch',
  },
  {
    id: '4',
    type: 'protein',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    amount: 80,
    name: 'Steak Dinner',
    mealType: 'dinner',
  },
  {
    id: '5',
    type: 'creatine',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    amount: 5,
  },
];

export const MOCK_WORKOUTS: WorkoutDay[] = [
  { id: '1', day: 'Monday', focus: 'CHEST, Shoulder, Tricep', isCompleted: true, isRestDay: false },
  { id: '2', day: 'Tuesday', focus: 'Back, Bicep', isCompleted: true, isRestDay: false },
  { id: '3', day: 'Wednesday', focus: 'Leg, Arm', isCompleted: false, isRestDay: false },
  { id: '4', day: 'Thursday', focus: 'Chest and Back', isCompleted: false, isRestDay: false },
  { id: '5', day: 'Friday', focus: 'Shoulder, Whole Arm', isCompleted: false, isRestDay: false },
  { id: '6', day: 'Saturday', focus: 'Rest', isCompleted: false, isRestDay: true },
  { id: '7', day: 'Sunday', focus: 'Rest', isCompleted: false, isRestDay: true },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Overdue Customer',
    message: 'Globex Corporation deliverable is 1 day overdue.',
    type: 'customer',
    timestamp: format(subDays(today, 0), "yyyy-MM-dd'T'09:00"),
    isRead: false,
    urgency: 'high',
  },
  {
    id: '2',
    title: 'Upcoming Appointment',
    message: 'Acme Strategy Sync starts in 24 hours.',
    type: 'appointment',
    timestamp: format(subDays(today, 0), "yyyy-MM-dd'T'11:00"),
    isRead: true,
    urgency: 'medium',
  },
];
