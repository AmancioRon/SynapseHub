import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2, Sparkles, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './UI';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AIAssistant() {
  const { 
    user, chatHistory, addChatMessage, 
    addCustomer, updateCustomer, deleteCustomer, customers,
    addActivity, updateActivity, deleteActivity, activities,
    addExpense, updateExpense, deleteExpense, addExpenseCategory, deleteExpenseCategory, expenses, expenseCategories,
    addAppointment, updateAppointment, deleteAppointment, appointments,
    addHealthEntry, updateWorkoutPlan, updateHealthProfile, healthEntries, workoutPlan,
    updateModuleSettings, updateAssistantSettings, clearChatHistory
  } = useStore();
  const { theme, setTheme } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const assistantSettings = user?.assistantSettings || { enabled: true, showWidget: true, suggestionsEnabled: true, tone: 'assistant' };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen, isLoading]);

  if (!user || !assistantSettings.enabled || !assistantSettings.showWidget) return null;

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    addChatMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const tools: FunctionDeclaration[] = [
        {
          name: 'addActivity',
          description: 'Create a new activity/task.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Title of the activity' },
              description: { type: Type.STRING, description: 'Optional description' },
              deadline: { type: Type.STRING, description: 'Deadline in ISO format (YYYY-MM-DD)' },
              priority: { type: Type.STRING, description: 'low, medium, or high' },
            },
            required: ['title', 'deadline', 'priority']
          }
        },
        {
          name: 'addCustomer',
          description: 'Create a new customer.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Customer name' },
              contact: { type: Type.STRING, description: 'Contact info (email/phone)' },
              products: { type: Type.STRING, description: 'Products interested in or bought' },
              dueDate: { type: Type.STRING, description: 'Due date in ISO format' },
              status: { type: Type.STRING, description: 'pending, delivered, or on_hold' },
              notes: { type: Type.STRING, description: 'Optional notes' }
            },
            required: ['name', 'contact', 'products', 'dueDate', 'status']
          }
        },
        {
          name: 'addExpense',
          description: 'Log a new expense.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Expense title' },
              amount: { type: Type.NUMBER, description: 'Expense amount' },
              category: { type: Type.STRING, description: 'Expense category' },
              date: { type: Type.STRING, description: 'Date in ISO format' }
            },
            required: ['title', 'amount', 'category', 'date']
          }
        },
        {
          name: 'addAppointment',
          description: 'Schedule a new appointment.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Appointment title' },
              datetime: { type: Type.STRING, description: 'Date and time in ISO format' },
              duration: { type: Type.NUMBER, description: 'Duration in minutes' },
              location: { type: Type.STRING, description: 'Location' }
            },
            required: ['title', 'datetime', 'duration', 'location']
          }
        },
        {
          name: 'logHealthEntry',
          description: 'Log protein or creatine intake.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'protein or creatine' },
              amount: { type: Type.NUMBER, description: 'Amount in grams' },
              date: { type: Type.STRING, description: 'Date in ISO format' }
            },
            required: ['type', 'amount', 'date']
          }
        },
        {
          name: 'updateActivity',
          description: 'Update an existing activity/task.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'ID of the activity' },
              status: { type: Type.STRING, description: 'pending, due_soon, overdue, or done' },
              title: { type: Type.STRING },
              deadline: { type: Type.STRING }
            },
            required: ['id']
          }
        },
        {
          name: 'deleteActivity',
          description: 'Delete an activity/task.',
          parameters: {
            type: Type.OBJECT,
            properties: { id: { type: Type.STRING } },
            required: ['id']
          }
        },
        {
          name: 'updateCustomer',
          description: 'Update an existing customer.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              status: { type: Type.STRING, description: 'pending, delivered, or on_hold' },
              notes: { type: Type.STRING }
            },
            required: ['id']
          }
        },
        {
          name: 'deleteCustomer',
          description: 'Delete a customer.',
          parameters: {
            type: Type.OBJECT,
            properties: { id: { type: Type.STRING } },
            required: ['id']
          }
        },
        {
          name: 'updateAppointment',
          description: 'Update an existing appointment.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              status: { type: Type.STRING, description: 'scheduled, completed, or canceled' }
            },
            required: ['id']
          }
        },
        {
          name: 'deleteAppointment',
          description: 'Delete an appointment.',
          parameters: {
            type: Type.OBJECT,
            properties: { id: { type: Type.STRING } },
            required: ['id']
          }
        },
        {
          name: 'updateWorkoutPlan',
          description: 'Update the workout plan for a specific day.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING, description: 'Monday, Tuesday, etc.' },
              focus: { type: Type.STRING },
              isCompleted: { type: Type.BOOLEAN },
              notes: { type: Type.STRING },
              isRestDay: { type: Type.BOOLEAN }
            },
            required: ['day']
          }
        },
        {
          name: 'addExpenseCategory',
          description: 'Add a new expense category.',
          parameters: {
            type: Type.OBJECT,
            properties: { category: { type: Type.STRING } },
            required: ['category']
          }
        },
        {
          name: 'deleteExpenseCategory',
          description: 'Delete an expense category.',
          parameters: {
            type: Type.OBJECT,
            properties: { category: { type: Type.STRING } },
            required: ['category']
          }
        },
        {
          name: 'clearChatHistory',
          description: 'Clear the chat history.',
          parameters: {
            type: Type.OBJECT,
            properties: {},
            required: []
          }
        },
        {
          name: 'changeTheme',
          description: 'Change the application theme.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING, description: 'light, dark, or system' }
            },
            required: ['theme']
          }
        },
        {
          name: 'updateModuleSettings',
          description: 'Enable or disable modules.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              modules: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of enabled modules: customers, activities, expenses, appointments, health' }
            },
            required: ['modules']
          }
        },
        {
          name: 'updateHealthProfile',
          description: 'Update health profile goals and targets.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              goal: { type: Type.STRING },
              targetWeight: { type: Type.NUMBER },
              proteinTarget: { type: Type.NUMBER },
              creatineTarget: { type: Type.NUMBER }
            }
          }
        }
      ];

      const systemInstruction = `You are the SynapseHub AI Assistant. Your tone is ${assistantSettings.tone}. You are helpful, clear, smart, calm, and versatile.
You can help the user manage their business, activities, expenses, appointments, and health tracker.
Current date/time: ${new Date().toISOString()}
User Name: ${user.name}
Enabled Modules: ${user.enabledModules.join(', ')}

Current App State (Read-Only Context):
- Customers: ${JSON.stringify(customers)}
- Activities: ${JSON.stringify(activities)}
- Expenses: ${JSON.stringify(expenses)}
- Appointments: ${JSON.stringify(appointments)}
- Health Entries: ${JSON.stringify(healthEntries)}
- Workout Plan: ${JSON.stringify(workoutPlan)}

When the user asks to perform an action, use the provided tools. If you need more information to complete a tool call, ask the user concisely.
If the user asks for information, use the Current App State provided above to answer them.
After a tool call is successful, confirm the action to the user naturally.`;

      // Convert chat history to Gemini format
      const contents = chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      contents.push({
        role: 'user',
        parts: [{ text }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: tools }],
          temperature: 0.7
        }
      });

      let finalResponseText = response.text || '';

      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];
        
        for (const call of response.functionCalls) {
          const { name, args } = call;
          let result = { success: true, message: '' };
          
          try {
            if (name === 'addActivity') {
              addActivity({ ...args as any, status: 'pending' });
              result.message = 'Activity added successfully.';
            } else if (name === 'addCustomer') {
              addCustomer(args as any);
              result.message = 'Customer added successfully.';
            } else if (name === 'addExpense') {
              addExpense({ ...args as any, currency: 'PHP' });
              result.message = 'Expense added successfully.';
            } else if (name === 'addAppointment') {
              addAppointment({ ...args as any, status: 'scheduled' });
              result.message = 'Appointment scheduled successfully.';
            } else if (name === 'logHealthEntry') {
              addHealthEntry(args as any);
              result.message = 'Health entry logged successfully.';
            } else if (name === 'updateActivity') {
              const { id, ...updates } = args as any;
              updateActivity(id, updates);
              result.message = 'Activity updated successfully.';
            } else if (name === 'deleteActivity') {
              deleteActivity(args.id as string);
              result.message = 'Activity deleted successfully.';
            } else if (name === 'updateCustomer') {
              const { id, ...updates } = args as any;
              updateCustomer(id, updates);
              result.message = 'Customer updated successfully.';
            } else if (name === 'deleteCustomer') {
              deleteCustomer(args.id as string);
              result.message = 'Customer deleted successfully.';
            } else if (name === 'updateAppointment') {
              const { id, ...updates } = args as any;
              updateAppointment(id, updates);
              result.message = 'Appointment updated successfully.';
            } else if (name === 'deleteAppointment') {
              deleteAppointment(args.id as string);
              result.message = 'Appointment deleted successfully.';
            } else if (name === 'updateWorkoutPlan') {
              const { day, ...updates } = args as any;
              const newPlan = workoutPlan.map(w => w.day.toLowerCase() === day.toLowerCase() ? { ...w, ...updates } : w);
              updateWorkoutPlan(newPlan);
              result.message = 'Workout plan updated successfully.';
            } else if (name === 'addExpenseCategory') {
              addExpenseCategory(args.category as string);
              result.message = 'Expense category added successfully.';
            } else if (name === 'deleteExpenseCategory') {
              deleteExpenseCategory(args.category as string);
              result.message = 'Expense category deleted successfully.';
            } else if (name === 'clearChatHistory') {
              clearChatHistory();
              result.message = 'Chat history cleared successfully.';
            } else if (name === 'changeTheme') {
              setTheme(args.theme as any);
              result.message = `Theme changed to ${args.theme}.`;
            } else if (name === 'updateModuleSettings') {
              updateModuleSettings(args.modules as any);
              result.message = 'Modules updated successfully.';
            } else if (name === 'updateHealthProfile') {
              updateHealthProfile(args as any);
              result.message = 'Health profile updated successfully.';
            } else {
              result = { success: false, message: 'Unknown function' };
            }
          } catch (e: any) {
            result = { success: false, message: e.message };
          }
          
          functionResponses.push({
            name,
            response: result
          });
        }

        // Send function responses back to get final text
        const followUpResponse = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: [
            ...contents,
            { role: 'model', parts: response.functionCalls.map(fc => ({ functionCall: fc })) },
            { role: 'user', parts: functionResponses.map(fr => ({ functionResponse: fr })) }
          ],
          config: { systemInstruction }
        });
        
        finalResponseText = followUpResponse.text || 'Action completed.';
      }

      if (finalResponseText) {
        addChatMessage({
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: finalResponseText,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('AI Assistant Error:', error);
      addChatMessage({
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "Add an activity",
    "Log today's protein",
    "Show me what I still need to do",
    "Help me organize my expenses"
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-colors z-50"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden
              ${isExpanded 
                ? 'inset-0 md:inset-4 md:rounded-3xl' 
                : 'bottom-0 right-0 left-0 top-20 rounded-t-3xl md:bottom-6 md:right-6 md:left-auto md:top-auto md:w-[400px] md:h-[600px] md:rounded-3xl border border-slate-200 dark:border-slate-800'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Synapse Assistant</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-900/50">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">How can I help you today?</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto">
                      I can help you manage tasks, track expenses, log health entries, and more.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-slate-200 dark:bg-slate-700' 
                      : 'bg-indigo-100 dark:bg-indigo-900/30'
                  }`}>
                    {msg.role === 'user' 
                      ? <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      : <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    }
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium tracking-wide">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-5 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
