import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Sheet } from '../components/UI';
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, MoreVertical, Calendar, User, Plus, X, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Activity } from '../types';
import { cn } from '../lib/utils';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export default function Activities() {
  const { activities, customers, addActivity, updateActivity, deleteActivity } = useStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'due_soon' | 'overdue' | 'done'>('all');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAdding(true);
    }
  }, [location]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [newActivity, setNewActivity] = useState({ title: '', description: '', customerId: '', deadline: '', priority: 'medium' as any, status: 'pending' as any });

  const filteredActivities = activities
    .filter(a => {
      if (activeTab === 'all') return true;
      if (activeTab === 'done') return a.status === 'done';
      
      const isOverdue = isPast(parseISO(a.deadline)) && !isToday(parseISO(a.deadline)) && a.status !== 'done';
      const isDueSoon = !isOverdue && isToday(parseISO(a.deadline)) && a.status !== 'done';
      
      if (activeTab === 'overdue') return isOverdue;
      if (activeTab === 'due_soon') return isDueSoon;
      return a.status !== 'done'; // Default for other tabs is to hide done
    })
    .sort((a, b) => parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime());

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'due_soon', label: 'Due Soon' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'done', label: 'Done' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivity) {
      updateActivity(editingActivity.id, newActivity);
    } else {
      addActivity({
        ...newActivity,
      });
    }
    setIsAdding(false);
    setEditingActivity(null);
    setNewActivity({ title: '', description: '', customerId: '', deadline: '', priority: 'medium', status: 'pending' });
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivity({
      title: activity.title,
      description: activity.description || '',
      customerId: activity.customerId || '',
      deadline: activity.deadline,
      priority: activity.priority,
      status: activity.status,
    });
    setIsAdding(true);
  };

  const handleToggleDone = (id: string, currentStatus: string) => {
    updateActivity(id, { status: currentStatus === 'done' ? 'pending' : 'done' });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Tasks</h2>
        <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Add Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add/Edit Activity Sheet */}
      <Sheet
        isOpen={isAdding}
        onClose={() => { setIsAdding(false); setEditingActivity(null); }}
        title={editingActivity ? 'Edit Task' : 'New Task'}
        footer={
          <Button onClick={handleAdd} className="w-full py-4 rounded-2xl font-bold text-lg">
            {editingActivity ? 'Update Task' : 'Create Task'}
          </Button>
        }
      >
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Task Title</label>
            <input 
              required
              placeholder="e.g. Follow up with client"
              value={newActivity.title}
              onChange={e => setNewActivity({...newActivity, title: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
            <textarea 
              placeholder="What needs to be done?"
              value={newActivity.description}
              onChange={e => setNewActivity({...newActivity, description: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Status</label>
              <select 
                value={newActivity.status}
                onChange={e => setNewActivity({...newActivity, status: e.target.value as any})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="pending">Pending</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Priority</label>
              <select 
                value={newActivity.priority}
                onChange={e => setNewActivity({...newActivity, priority: e.target.value as any})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Customer (Optional)</label>
            <select 
              value={newActivity.customerId}
              onChange={e => setNewActivity({...newActivity, customerId: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">None</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Deadline</label>
            <input 
              type="datetime-local"
              required
              value={newActivity.deadline}
              onChange={e => setNewActivity({...newActivity, deadline: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
        </form>
      </Sheet>

      {/* List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <CheckSquare className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No activities found.</p>
          </div>
        ) : (
          filteredActivities.map(activity => {
            const customer = customers.find(c => c.id === activity.customerId);
            const isOverdue = isPast(parseISO(activity.deadline)) && !isToday(parseISO(activity.deadline)) && activity.status !== 'done';
            
            return (
              <Card key={activity.id} className={cn("space-y-3", isOverdue && "border-l-4 border-l-rose-500")}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => handleToggleDone(activity.id, activity.status)}
                      className={cn(
                        "mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                        activity.status === 'done' 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-slate-300 dark:border-slate-600"
                      )}
                    >
                      {activity.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <div className="space-y-1">
                      <h4 className={cn("font-bold text-base", activity.status === 'done' && "line-through text-slate-400")}>
                        {activity.title}
                      </h4>
                      {activity.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{activity.description}</p>
                      )}
                      {customer && (
                        <p className="text-xs text-indigo-500 font-bold flex items-center gap-1">
                          <User className="w-3 h-3" /> {customer.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      activity.priority === 'high' ? 'danger' : 
                      activity.priority === 'medium' ? 'warning' : 'default'
                    }
                  >
                    {activity.priority}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className={cn(
                    "flex items-center gap-2 text-xs font-medium",
                    isOverdue ? "text-rose-500" : "text-slate-500"
                  )}>
                    <Clock className="w-4 h-4" />
                    <span>{format(parseISO(activity.deadline), 'MMM dd, HH:mm')}</span>
                    {isOverdue && <AlertTriangle className="w-3 h-3" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-lg text-indigo-500" onClick={() => handleEdit(activity)}>
                      <Plus className="w-4 h-4 rotate-45" />
                    </Button>
                    {activity.status === 'done' && (
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-lg text-rose-500" onClick={() => deleteActivity(activity.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
