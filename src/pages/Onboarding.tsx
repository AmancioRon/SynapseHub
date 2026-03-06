import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { Users, CheckSquare, Receipt, Calendar, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Onboarding() {
  const { completeOnboarding } = useStore();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const modules = [
    { id: 'customers', label: 'Customers', icon: Users, description: 'Manage your client base and deliverables' },
    { id: 'activities', label: 'Activities', icon: CheckSquare, description: 'Track tasks, priorities, and deadlines' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, description: 'Monitor spending and financial health' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, description: 'Schedule syncs and meetings' },
    { id: 'health', label: 'Health', icon: Activity, description: 'Track nutrition and workout progress' },
  ];

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (selectedModules.length > 0) {
      completeOnboarding(selectedModules);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Welcome!</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Which modules would you like to enable?</p>
        </div>

        <div className="space-y-3">
          {modules.map((module) => {
            const isSelected = selectedModules.includes(module.id);
            return (
              <Card 
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "p-4 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]",
                  isSelected 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-500" 
                    : "hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  <module.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{module.label}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{module.description}</p>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 dark:border-slate-700"
                )}>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </Card>
            );
          })}
        </div>

        <Button 
          className="w-full py-4 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/20"
          disabled={selectedModules.length === 0}
          onClick={handleFinish}
        >
          Get Started <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
