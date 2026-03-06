import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { Activity, Mail, Lock, ArrowRight, Chrome, User, ArrowLeft, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

type AuthView = 'login' | 'signup' | 'forgot';

export default function Login() {
  const { login, signup } = useStore();
  const [view, setView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (view === 'login') {
        login(email);
      } else if (view === 'signup') {
        signup(email, name);
      } else {
        setView('login');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    // Simulate redirect to OAuth provider
    setTimeout(() => {
      if (provider === 'google') {
        // In a real app, this would be window.location.href = googleAuthUrl;
        login('google.user@gmail.com');
      } else {
        // In a real app, this would be window.location.href = facebookAuthUrl;
        login('facebook.user@fb.com');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 mb-4">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">SynapseHub</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your Personal Operations Hub</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                {view !== 'login' && (
                  <button onClick={() => setView('login')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-xl font-bold">
                  {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
                </h2>
              </div>

              {view !== 'forgot' && (
                <div className="space-y-3">
                  <Button 
                    variant="secondary" 
                    className="w-full py-4 text-sm font-bold bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all" 
                    onClick={() => handleSocialLogin('google')} 
                    disabled={isLoading}
                  >
                    <Chrome className="w-5 h-5 mr-3 text-rose-500" /> Continue with Google
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full py-4 text-sm font-bold bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all" 
                    onClick={() => handleSocialLogin('facebook')} 
                    disabled={isLoading}
                  >
                    <Facebook className="w-5 h-5 mr-3 text-blue-600" /> Continue with Facebook
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                    OAuth requires valid Client IDs. Simulation active for demo.
                  </p>
                </div>
              )}

              {view !== 'forgot' && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or use email</span></div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {view !== 'forgot' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                      {view === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => setView('forgot')}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full py-4 rounded-xl text-lg font-bold mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <>
                      {view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Send Link'} 
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-sm text-slate-500">
          {view === 'login' ? (
            <>Don't have an account? <button onClick={() => setView('signup')} className="text-indigo-600 dark:text-indigo-400 font-bold">Sign Up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setView('login')} className="text-indigo-600 dark:text-indigo-400 font-bold">Sign In</button></>
          )}
        </p>
      </motion.div>
    </div>
  );
}
