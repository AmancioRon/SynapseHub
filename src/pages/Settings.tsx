import React, { useState } from 'react';
import { Card, Button, Badge, Sheet } from '../components/UI';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import { 
  Moon, Sun, Monitor, Bell, Shield, User as UserIcon, LogOut, 
  ChevronRight, Smartphone, Lock, LayoutGrid, Heart, Dumbbell, 
  X, Save, Trash2, Download, Upload, RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout, updateModuleSettings, updateHealthProfile, updateUser } = useStore();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', email: user?.email || '' });

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const modules = [
    { id: 'customers', label: 'Customers', icon: LayoutGrid },
    { id: 'activities', label: 'Activities', icon: LayoutGrid },
    { id: 'expenses', label: 'Expenses', icon: LayoutGrid },
    { id: 'appointments', label: 'Appointments', icon: LayoutGrid },
    { id: 'health', label: 'Health', icon: Heart },
  ];

  const toggleModule = (id: string) => {
    const current = user?.enabledModules || [];
    const updated = current.includes(id) 
      ? current.filter(m => m !== id) 
      : [...current, id];
    updateModuleSettings(updated);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(editForm);
    setIsEditingProfile(false);
  };

  const resetApp = () => {
    if (window.confirm('Are you sure? This will clear all your data and reset the app.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const resetHealth = () => {
    if (window.confirm('Are you sure you want to reset your health profile?')) {
      updateHealthProfile(null as any);
      navigate('/health');
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section className="flex flex-col items-center text-center space-y-3 py-4">
        <div className="w-24 h-24 rounded-full bg-indigo-600 p-1 relative group">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
            alt="Profile" 
            className="w-full h-full rounded-full border-4 border-white dark:border-slate-950 object-cover bg-slate-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold">{user?.name}</h3>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setIsEditingProfile(true)}>
          Edit Profile
        </Button>
      </section>

      {/* Enabled Modules */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Enabled Modules</h4>
        <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
          {modules.map(module => (
            <div key={module.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <module.icon className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-bold">{module.label}</span>
              </div>
              <button 
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  user?.enabledModules.includes(module.id) ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  user?.enabledModules.includes(module.id) ? "left-5" : "left-1"
                )}></div>
              </button>
            </div>
          ))}
        </Card>
      </section>

      {/* Health Settings */}
      {user?.enabledModules.includes('health') && (
        <section className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Health Settings</h4>
          <div className="space-y-2">
            <SettingsItem icon={Heart} label="Edit Goal & Body Info" onClick={() => navigate('/health')} />
            <SettingsItem icon={Dumbbell} label="Edit Workout Plan" onClick={() => navigate('/health')} />
            <SettingsItem icon={RotateCcw} label="Reset Health Onboarding" className="text-rose-500" onClick={resetHealth} />
          </div>
        </section>
      )}

      {/* Appearance */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Appearance</h4>
        <Card className="p-2 flex gap-2">
          {themeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id as any)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all",
                theme === option.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
              )}
            >
              <option.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{option.label}</span>
            </button>
          ))}
        </Card>
      </section>

      {/* Preferences & Security */}
      <section className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Security & Data</h4>
        <div className="space-y-2">
          <SettingsItem icon={Lock} label="Change Password" onClick={() => setIsChangingPassword(true)} />
          <SettingsItem icon={Download} label="Export Data (JSON)" onClick={() => alert('Data export started...')} />
          <SettingsItem icon={Trash2} label="Reset All Data" className="text-rose-500" onClick={resetApp} />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-4 pb-8">
        <Button variant="danger" className="w-full py-4 rounded-2xl flex items-center justify-center gap-2" onClick={logout}>
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium">
          SynapseHub v1.1.0 • Your data is protected
        </p>
      </section>

      {/* Sheets */}
      <Sheet
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        title="Edit Profile"
        footer={
          <Button onClick={handleProfileUpdate} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Save Changes
          </Button>
        }
      >
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input 
              required
              value={editForm.name}
              onChange={e => setEditForm({...editForm, name: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <input 
              type="email"
              required
              value={editForm.email}
              onChange={e => setEditForm({...editForm, email: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
        </form>
      </Sheet>

      <Sheet
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        title="Change Password"
        footer={
          <Button className="w-full py-4 rounded-2xl font-bold" onClick={() => setIsChangingPassword(false)}>
            Update Password
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function SettingsItem({ icon: Icon, label, className, onClick }: { icon: any, label: string, className?: string, onClick?: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className={cn("flex items-center justify-between py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group", className)}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </Card>
  );
}
