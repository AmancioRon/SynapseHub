import React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'flat' | 'outline';
  [key: string]: any;
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "rounded-2xl p-4 transition-all duration-200",
        variant === 'default' && "bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800",
        variant === 'flat' && "bg-slate-100 dark:bg-slate-800",
        variant === 'outline' && "border border-slate-200 dark:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  [key: string]: any;
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    info: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };

  return (
    <span 
      className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}

export function Button({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-500/20",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 active:scale-95",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 active:scale-95",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-sm shadow-rose-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg font-semibold",
  };

  return (
    <button 
      className={cn("rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({ isOpen, onClose, title, children, footer }: SheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-slate-950 md:left-1/2 md:-translate-x-1/2 md:max-w-md md:shadow-2xl animate-in slide-in-from-bottom duration-300">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <div className="pb-32">
          {children}
        </div>
      </div>

      {footer && (
        <footer className="sticky bottom-0 z-10 p-6 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 pb-safe-bottom">
          {footer}
        </footer>
      )}
    </div>
  );
}

export function CountUp({ value, prefix = '' }: { value: number, prefix?: string }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (end - start) * easeProgress);
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <>{prefix}{displayValue.toLocaleString()}</>;
}
