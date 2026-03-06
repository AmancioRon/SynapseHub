import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Sheet, CountUp } from '../components/UI';
import { 
  Wallet, TrendingUp, TrendingDown, Filter, Calendar, 
  DollarSign, MoreVertical, Tag, Plus, X, Trash2, Search,
  PlusCircle, Settings2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { format, parseISO, isToday, isThisWeek, isThisMonth, startOfToday, endOfToday, startOfYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export default function Expenses() {
  const { 
    expenses, customers, addExpense, deleteExpense, 
    expenseCategories, addExpenseCategory, deleteExpenseCategory 
  } = useStore();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAdding(true);
    }
  }, [location]);

  const [newExpense, setNewExpense] = useState({ 
    title: '', 
    amount: '', 
    category: expenseCategories[0] || 'Business', 
    customerId: '', 
    date: new Date().toISOString().split('T')[0], 
    notes: '' 
  });

  const filteredExpenses = expenses
    .filter(e => activeCategory === 'All' ? true : e.category === activeCategory)
    .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const todayTotal = expenses
    .filter(e => isToday(parseISO(e.date)))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const weekTotal = expenses
    .filter(e => isThisWeek(parseISO(e.date)))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const monthTotal = expenses
    .filter(e => isThisMonth(parseISO(e.date)))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      ...newExpense,
      amount: parseFloat(newExpense.amount) || 0,
      currency: '₱'
    });
    setIsAdding(false);
    setNewExpense({ 
      title: '', 
      amount: '', 
      category: expenseCategories[0] || 'Business', 
      customerId: '', 
      date: new Date().toISOString().split('T')[0], 
      notes: '' 
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addExpenseCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">Expenses</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsManagingCategories(true)} variant="secondary" size="sm" className="rounded-xl">
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-xl">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-xl shadow-rose-500/20 overflow-hidden relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            className="absolute -right-4 -top-4"
          >
            <TrendingDown className="w-32 h-32" />
          </motion.div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Today's Spending</span>
              <Badge className="bg-white/20 text-white border-none">Daily</Badge>
            </div>
            <p className="text-4xl font-black tracking-tighter">
              <CountUp value={todayTotal} prefix="₱" />
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Weekly</span>
            <p className="text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              <CountUp value={weekTotal} prefix="₱" />
            </p>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Monthly</span>
            <p className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
              <CountUp value={monthTotal} prefix="₱" />
            </p>
          </Card>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-xs"
          >
            <option value="All">All</option>
            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.map((expense, index) => {
            const customer = customers.find(c => c.id === expense.customerId);
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex items-center gap-4 group hover:shadow-md transition-all border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate">{expense.title}</h4>
                      <p className="font-black text-sm text-slate-900 dark:text-white">
                        ₱{expense.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] flex items-center gap-1 text-slate-400 font-bold uppercase tracking-wider">
                        <Tag className="w-3 h-3" /> {expense.category}
                      </span>
                      <span className="text-[10px] flex items-center gap-1 text-slate-400 font-bold uppercase tracking-wider">
                        <Calendar className="w-3 h-3" /> {format(parseISO(expense.date), 'MMM dd')}
                      </span>
                    </div>
                    {expense.notes && (
                      <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                        "{expense.notes}"
                      </p>
                    )}
                    {customer && (
                      <p className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-widest">
                        {customer.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="p-2 h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => deleteExpense(expense.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold">No expenses found</p>
          </div>
        )}
      </div>

      {/* Add Expense Sheet */}
      <Sheet 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        title="New Expense"
        footer={
          <Button onClick={handleAdd} className="w-full py-4 rounded-2xl font-bold text-lg">
            Save Expense
          </Button>
        }
      >
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Title</label>
            <input 
              required
              placeholder="e.g. Office Supplies"
              value={newExpense.title}
              onChange={e => setNewExpense({...newExpense, title: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Amount (₱)</label>
              <input 
                type="number"
                required
                placeholder="0.00"
                value={newExpense.amount}
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <select 
                value={newExpense.category}
                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Date</label>
            <input 
              type="date"
              required
              value={newExpense.date}
              onChange={e => setNewExpense({...newExpense, date: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Customer (Optional)</label>
            <select 
              value={newExpense.customerId}
              onChange={e => setNewExpense({...newExpense, customerId: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">None</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Notes</label>
            <textarea 
              placeholder="Add some details..."
              value={newExpense.notes}
              onChange={e => setNewExpense({...newExpense, notes: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] font-medium"
            />
          </div>
        </form>
      </Sheet>

      {/* Categories Management Sheet */}
      <Sheet
        isOpen={isManagingCategories}
        onClose={() => setIsManagingCategories(false)}
        title="Manage Categories"
      >
        <div className="space-y-8">
          <form onSubmit={handleAddCategory} className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Add New Category</label>
            <div className="flex gap-2">
              <input 
                placeholder="Category name..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
              <Button type="submit" className="px-6 rounded-2xl">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Existing Categories</label>
            <div className="grid grid-cols-1 gap-2">
              {expenseCategories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="font-bold">{cat}</span>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Delete category "${cat}"? Expenses in this category will be moved to "Misc".`)) {
                        deleteExpenseCategory(cat);
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
