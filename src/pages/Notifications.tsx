import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { Bell, Check, Clock, Trash2, MoreHorizontal, User, Calendar, CheckSquare, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';

export default function Notifications() {
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead, deleteAllNotifications, deleteNotification } = useStore();

  const sortedNotifications = [...notifications].sort((a, b) => 
    parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Recent Notifications</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 text-xs font-bold" onClick={markAllNotificationsAsRead}>
            Mark all read
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-600 dark:text-rose-400 text-xs font-bold" onClick={deleteAllNotifications}>
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No notifications found.</p>
          </div>
        ) : (
          sortedNotifications.map(notification => (
            <Card 
              key={notification.id} 
              onClick={() => markNotificationAsRead(notification.id)}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all active:scale-[0.98]",
                !notification.isRead && "border-l-4 border-l-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10"
              )}
            >
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  notification.type === 'customer' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                  notification.type === 'appointment' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {notification.type === 'customer' ? <User className="w-5 h-5" /> :
                   notification.type === 'appointment' ? <Calendar className="w-5 h-5" /> :
                   <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm">{notification.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {format(parseISO(notification.timestamp), 'HH:mm')}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
