import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ListTodo, Wallet, CalendarDays, 
  HeartPulse, BellRing, Settings2, Plus, X, Beef, Zap 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, notifications } = useStore();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const allNavItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Home', path: '/' },
    { id: 'customers', icon: Users, label: 'Customers', path: '/customers' },
    { id: 'activities', icon: ListTodo, label: 'Activities', path: '/activities' },
    { id: 'expenses', icon: Wallet, label: 'Expenses', path: '/expenses' },
    { id: 'appointments', icon: CalendarDays, label: 'Appointments', path: '/appointments' },
    { id: 'health', icon: HeartPulse, label: 'Health', path: '/health' },
  ];

  const navItems = allNavItems.filter(item => 
    item.id === 'home' || user?.enabledModules.includes(item.id)
  );

  const quickActions = [
    { id: 'customer', icon: Users, label: 'Customer', path: '/customers?add=true', color: 'bg-blue-500' },
    { id: 'activity', icon: ListTodo, label: 'Activity', path: '/activities?add=true', color: 'bg-amber-500' },
    { id: 'expense', icon: Wallet, label: 'Expense', path: '/expenses?add=true', color: 'bg-emerald-500' },
    { id: 'appointment', icon: CalendarDays, label: 'Appointment', path: '/appointments?add=true', color: 'bg-indigo-500' },
    { id: 'protein', icon: Beef, label: 'Protein', path: '/health?add=protein', color: 'bg-rose-500' },
    { id: 'creatine', icon: Zap, label: 'Creatine', path: '/health?add=creatine', color: 'bg-purple-500' },
  ].filter(action => {
    if (action.id === 'protein' || action.id === 'creatine') return user?.enabledModules.includes('health');
    return user?.enabledModules.includes(action.id === 'customer' ? 'customers' : action.id === 'activity' ? 'activities' : action.id === 'expense' ? 'expenses' : action.id === 'appointment' ? 'appointments' : '');
  });

  const handleQuickAction = (path: string) => {
    setShowQuickMenu(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <BellRing className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </Link>
          <Link to="/settings" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings2 className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quick Create Menu */}
      <AnimatePresence>
        {showQuickMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickMenu(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-32 right-6 w-64 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-lg">Quick Create</h3>
                <button onClick={() => setShowQuickMenu(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10", action.color)}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowQuickMenu(!showQuickMenu)}
        className={cn(
          "fixed bottom-28 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center z-50 transition-all active:scale-90",
          showQuickMenu && "rotate-45 bg-slate-800 dark:bg-slate-700"
        )}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 pt-2 pb-safe-bottom z-40">
        <div className="max-w-md mx-auto flex justify-around items-center pb-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
