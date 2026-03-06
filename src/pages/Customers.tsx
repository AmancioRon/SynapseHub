import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Sheet } from '../components/UI';
import { Search, Filter, MoreVertical, Phone, Mail, Calendar, Trash2, CheckCircle2, Plus, X, XCircle, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'pending' | 'delivered' | 'on_hold'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAdding(true);
    }
  }, [location]);
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', products: '', dueDate: '', notes: '' });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const filteredCustomers = customers
    .filter(c => c.status === activeTab)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'on_hold', label: 'On Hold' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      ...newCustomer,
      status: 'pending',
    });
    setIsAdding(false);
    setNewCustomer({ name: '', contact: '', products: '', dueDate: '', notes: '' });
  };

  const handleStatusChange = (id: string, status: 'pending' | 'delivered' | 'on_hold') => {
    updateCustomer(id, { status });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    updateCustomer(id, { notes });
    setEditingNotes(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAdding(true)} className="rounded-2xl px-4">
            <Plus className="w-5 h-5" />
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
      </div>

      {/* Add Customer Sheet */}
      <Sheet
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="New Customer"
        footer={
          <Button onClick={handleAdd} className="w-full py-4 rounded-2xl font-bold text-lg">
            Save Customer
          </Button>
        }
      >
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input 
              required
              placeholder="e.g. John Doe"
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Contact Info (Phone/Email)</label>
            <input 
              required
              placeholder="e.g. +63 912 345 6789"
              value={newCustomer.contact}
              onChange={e => setNewCustomer({...newCustomer, contact: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Products / Services</label>
            <input 
              required
              placeholder="e.g. Web Design, SEO"
              value={newCustomer.products}
              onChange={e => setNewCustomer({...newCustomer, products: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Due Date</label>
            <input 
              type="date"
              required
              value={newCustomer.dueDate}
              onChange={e => setNewCustomer({...newCustomer, dueDate: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Notes</label>
            <textarea 
              placeholder="Add any specific details..."
              value={newCustomer.notes}
              onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] font-medium"
            />
          </div>
        </form>
      </Sheet>

      {/* List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No customers found in this category.</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <Card key={customer.id} className="space-y-4 group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">{customer.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {customer.contact}
                  </p>
                </div>
                <Badge 
                  variant={
                    customer.status === 'on_hold' ? 'warning' : 
                    customer.status === 'delivered' ? 'success' : 'info'
                  }
                >
                  {customer.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Products</p>
                <p className="text-sm font-medium">{customer.products}</p>
              </div>

              {customer.notes && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Notes</p>
                  {editingNotes === customer.id ? (
                    <div className="space-y-2">
                      <textarea 
                        autoFocus
                        defaultValue={customer.notes}
                        onBlur={(e) => handleUpdateNotes(customer.id, e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                  ) : (
                    <p 
                      className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                      onClick={() => setEditingNotes(customer.id)}
                    >
                      {customer.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {customer.dueDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === 'pending' && (
                    <>
                      <Button variant="secondary" size="sm" className="p-2 rounded-lg" onClick={() => handleStatusChange(customer.id, 'on_hold')}>
                        <XCircle className="w-4 h-4 text-amber-500" />
                      </Button>
                      <Button variant="secondary" size="sm" className="p-2 rounded-lg" onClick={() => handleStatusChange(customer.id, 'delivered')}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </Button>
                    </>
                  )}
                  {activeTab === 'on_hold' && (
                    <Button variant="secondary" size="sm" className="p-2 rounded-lg" onClick={() => handleStatusChange(customer.id, 'pending')}>
                      <Clock className="w-4 h-4 text-indigo-500" />
                    </Button>
                  )}
                  {activeTab === 'delivered' && (
                    <Button variant="danger" size="sm" className="p-2 rounded-lg" onClick={() => deleteCustomer(customer.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="p-2 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
