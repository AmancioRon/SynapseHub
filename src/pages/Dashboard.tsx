import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { Users, CheckSquare, Receipt, Calendar, Activity, ChevronRight, AlertCircle, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { user, customers, activities, expenses, appointments, healthEntries } = useStore();
  const today = new Date();
  
  const pendingCustomers = customers.filter(c => c.status === 'pending' || c.status === 'due_soon').length;
  const overdueCustomers = customers.filter(c => c.status === 'overdue');
  
  const todayActivities = activities.filter(a => isToday(parseISO(a.deadline)));
  const overdueActivities = activities.filter(a => isPast(parseISO(a.deadline)) && !isToday(parseISO(a.deadline)) && a.status !== 'done');
  
  const todayAppointments = appointments.filter(app => isToday(parseISO(app.datetime)));
  
  const weekExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const todayProtein = healthEntries.filter(h => h.type === 'protein' && isToday(parseISO(h.date))).reduce((sum, h) => sum + (h.amount || 0), 0);
  const todayCreatine = healthEntries.filter(h => h.type === 'creatine' && isToday(parseISO(h.date))).reduce((sum, h) => sum + (h.amount || 0), 0);

  const isEnabled = (id: string) => user?.enabledModules.includes(id);

  return (
    <div className="space-y-8 pb-20">
      {/* Premium Header */}
      <section className="relative overflow-hidden rounded-[32px] bg-slate-900 text-white p-8 shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">
              Hello, <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              {format(today, 'EEEE, MMM dd')}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 p-0.5 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden">
            <img 
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-[14px] bg-slate-100"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Tasks</p>
            <p className="text-xl font-black">{todayActivities.length + overdueActivities.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Today's Appts</p>
            <p className="text-xl font-black">{todayAppointments.length}</p>
          </div>
        </div>
      </section>

      {/* Module Grid */}
      <section className="grid grid-cols-2 gap-4">
        {isEnabled('customers') && (
          <ModuleCard 
            to="/customers" 
            icon={Users} 
            label="Customers" 
            summary={`${pendingCustomers} Pending`} 
            color="bg-blue-500" 
          />
        )}
        {isEnabled('activities') && (
          <ModuleCard 
            to="/activities" 
            icon={CheckSquare} 
            label="Activities" 
            summary={`${todayActivities.length} Today`} 
            color="bg-amber-500" 
          />
        )}
        {isEnabled('expenses') && (
          <ModuleCard 
            to="/expenses" 
            icon={Receipt} 
            label="Expenses" 
            summary={`₱${weekExpenses.toLocaleString()}`} 
            color="bg-emerald-500" 
          />
        )}
        {isEnabled('appointments') && (
          <ModuleCard 
            to="/appointments" 
            icon={Calendar} 
            label="Appointments" 
            summary={`${todayAppointments.length} Today`} 
            color="bg-indigo-500" 
          />
        )}
        {isEnabled('health') && (
          <ModuleCard 
            to="/health" 
            icon={Activity} 
            label="Health Tracker" 
            summary={`${todayProtein}g Protein`} 
            color="bg-rose-500" 
            className="col-span-2"
          />
        )}
      </section>

      {/* Overdue Section */}
      {((isEnabled('customers') && overdueCustomers.length > 0) || (isEnabled('activities') && overdueActivities.length > 0)) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
            <AlertCircle className="w-5 h-5" />
            <h3>Overdue</h3>
          </div>
          <div className="space-y-2">
            {isEnabled('customers') && overdueCustomers.map(c => (
              <Card key={c.id} className="border-l-4 border-l-rose-500 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500">Deliverable overdue</p>
                  </div>
                  <Badge variant="danger">Customer</Badge>
                </div>
              </Card>
            ))}
            {isEnabled('activities') && overdueActivities.map(a => (
              <Card key={a.id} className="border-l-4 border-l-rose-500 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{a.title}</p>
                    <p className="text-xs text-slate-500">Task overdue</p>
                  </div>
                  <Badge variant="danger">Activity</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Today Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Today's Schedule</h3>
          <span className="text-xs font-medium text-slate-400">{format(today, 'MMM dd, yyyy')}</span>
        </div>
        
        {(isEnabled('appointments') && todayAppointments.length > 0) || (isEnabled('activities') && todayActivities.length > 0) ? (
          <div className="space-y-3">
            {isEnabled('appointments') && todayAppointments.map(app => (
              <Card key={app.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <span className="text-xs font-bold leading-none">{format(parseISO(app.datetime), 'HH:mm')}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{app.title}</p>
                  <p className="text-xs text-slate-500">{app.location}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Card>
            ))}
            {isEnabled('activities') && todayActivities.map(a => (
              <Card key={a.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{a.title}</p>
                  <p className="text-xs text-slate-500">Priority: {a.priority}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="flat" className="text-center py-8">
            <p className="text-slate-500 text-sm">Nothing scheduled for today.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

function ModuleCard({ to, icon: Icon, label, summary, color, className }: any) {
  return (
    <Link to={to} className={className}>
      <Card className="h-full hover:scale-[1.02] transition-transform active:scale-95">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm">{label}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{summary}</p>
      </Card>
    </Link>
  );
}
