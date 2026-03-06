import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Sheet } from '../components/UI';
import { Calendar, Clock, MapPin, User, MoreVertical, ChevronRight, CheckCircle2, XCircle, Plus, X, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export default function Appointments() {
  const { appointments, customers, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'scheduled' | 'completed' | 'canceled'>('scheduled');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAdding(true);
    }
  }, [location]);
  const [newAppt, setNewAppt] = useState({ title: '', customerId: '', datetime: '', location: '', duration: 30, status: 'scheduled' as any, notes: '' });

  const filteredAppointments = appointments
    .filter(app => {
      if (activeTab === 'scheduled') return app.status === 'scheduled';
      if (activeTab === 'completed') return app.status === 'completed';
      if (activeTab === 'canceled') return app.status === 'canceled';
      return true;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const tabs = [
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'completed', label: 'Completed' },
    { id: 'canceled', label: 'Canceled' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      ...newAppt,
    });
    setIsAdding(false);
    setNewAppt({ title: '', customerId: '', datetime: '', location: '', duration: 30, status: 'scheduled', notes: '' });
  };

  const handleStatusChange = (id: string, status: any) => {
    updateAppointment(id, { status });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Appointments</h2>
        <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

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

      {/* New Appointment Sheet */}
      <Sheet
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="New Appointment"
        footer={
          <Button onClick={handleAdd} className="w-full py-4 rounded-2xl font-bold text-lg">
            Schedule Appointment
          </Button>
        }
      >
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Appointment Title</label>
            <input 
              required
              placeholder="e.g. Project Kickoff"
              value={newAppt.title}
              onChange={e => setNewAppt({...newAppt, title: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Customer</label>
            <select 
              required
              value={newAppt.customerId}
              onChange={e => setNewAppt({...newAppt, customerId: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Date & Time</label>
            <input 
              type="datetime-local"
              required
              value={newAppt.datetime}
              onChange={e => setNewAppt({...newAppt, datetime: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Status</label>
              <select 
                value={newAppt.status}
                onChange={e => setNewAppt({...newAppt, status: e.target.value as any})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Duration (min)</label>
              <input 
                type="number"
                required
                placeholder="30"
                value={newAppt.duration || ''}
                onChange={e => setNewAppt({...newAppt, duration: parseInt(e.target.value) || 0})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Location</label>
            <input 
              placeholder="e.g. Zoom, Office, Cafe"
              value={newAppt.location}
              onChange={e => setNewAppt({...newAppt, location: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Notes</label>
            <textarea 
              placeholder="Agenda or special instructions..."
              value={newAppt.notes}
              onChange={e => setNewAppt({...newAppt, notes: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] font-medium"
            />
          </div>
        </form>
      </Sheet>

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No appointments found.</p>
          </div>
        ) : (
          filteredAppointments.map(app => {
            const customer = customers.find(c => c.id === app.customerId);
            const date = parseISO(app.datetime);
            
            return (
              <Card key={app.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <span className="text-[10px] font-bold uppercase">{format(date, 'MMM')}</span>
                      <span className="text-lg font-black leading-none">{format(date, 'dd')}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base">{app.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] flex items-center gap-1 text-slate-400 font-bold uppercase">
                          <Clock className="w-3 h-3" /> {format(date, 'HH:mm')} ({app.duration}m)
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      app.status === 'completed' ? 'success' : 
                      app.status === 'canceled' ? 'danger' : 'info'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    <span className="truncate">{app.location}</span>
                  </div>
                  {customer && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                      <User className="w-3 h-3 text-indigo-500" />
                      <span className="truncate">{customer.name}</span>
                    </div>
                  )}
                </div>

                {app.notes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{app.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {(app.status === 'completed' || app.status === 'canceled') && (
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => deleteAppointment(app.id)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  )}
                  {app.status === 'scheduled' && (
                    <>
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => handleStatusChange(app.id, 'canceled')}>
                        <XCircle className="w-4 h-4" /> Cancel
                      </Button>
                      <Button variant="ghost" size="sm" className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => handleStatusChange(app.id, 'completed')}>
                        <CheckCircle2 className="w-4 h-4" /> Done
                      </Button>
                    </>
                  )}
                  <Button variant="secondary" size="sm" className="p-2 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
