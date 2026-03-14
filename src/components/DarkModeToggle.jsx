import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  // Stări: 'light', 'dark', 'auto'
  const [theme, setTheme] = useState('auto');

  const applyTheme = (themeMode) => {
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Verifică preferința salvată - TEMA DEFAULT: AUTO
    const savedTheme = localStorage.getItem('rowood-theme');
    const initialTheme = savedTheme || 'light'; // Default: light
    
    setTheme(initialTheme);
    applyTheme(initialTheme);

    // Listener pentru schimbarea preferințelor sistemului (doar în modul auto)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = localStorage.getItem('rowood-theme') || 'auto';
      if (currentTheme === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const cycleTheme = () => {
    // Ciclare: auto → light → dark → auto
    let newTheme;
    if (theme === 'auto') {
      newTheme = 'light';
    } else if (theme === 'light') {
      newTheme = 'dark';
    } else {
      newTheme = 'auto';
    }
    
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('rowood-theme', newTheme);
  };

  const getLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'Auto';
  };

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="w-4 h-4 text-yellow-500" />;
    } else if (theme === 'dark') {
      return <Moon className="w-4 h-4 text-blue-400" />;
    } else {
      return null; // Pentru auto, doar text
    }
  };

  const getTooltip = () => {
    if (theme === 'light') return 'Temă Luminoasă';
    if (theme === 'dark') return 'Temă Întunecată';
    return 'Temă Auto (Sistem)';
  };

  return (
    <div className="relative group">
      <button
        onClick={cycleTheme}
        className="
          relative
          h-8
          px-3
          min-w-[70px]
          rounded-full
          border border-white/20 dark:border-slate-700/50
          bg-white/60 dark:bg-slate-800/60
          backdrop-blur-2xl backdrop-saturate-[180%]
          hover:bg-white/80 dark:hover:bg-slate-800/80
          hover:border-white/30 dark:hover:border-slate-600/50
          hover:scale-105
          active:scale-95
          transition-all duration-300 ease-out
          shadow-[0_4px_16px_rgba(0,0,0,0.06)]
          dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]
          hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)]
          dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.5)]
          before:absolute
          before:inset-0
          before:rounded-full
          before:bg-gradient-to-b
          before:from-white/30
          before:to-transparent
          before:opacity-0
          before:hover:opacity-100
          before:transition-opacity
          before:duration-300
          before:pointer-events-none
          overflow-hidden
          flex items-center justify-center gap-1.5
        "
        title={getTooltip()}
      >
        {/* Icon (doar pentru light și dark) */}
        {getIcon() && (
          <div className="relative z-10 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
        
        {/* Text label */}
        <span className="relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {getLabel()}
        </span>
        
        {/* Shimmer effect on hover */}
        <div className="
          absolute inset-0 
          opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          translate-x-[-200%] group-hover:translate-x-[200%]
          transition-all duration-700 ease-in-out
          pointer-events-none
        "></div>
      </button>
      
      {/* Tooltip badge iOS style */}
      <div className="
        absolute -bottom-12 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        scale-95 group-hover:scale-100
        transition-all duration-200 ease-out
        pointer-events-none
        whitespace-nowrap
        px-3 py-1.5
        rounded-full
        bg-slate-900/90 dark:bg-slate-800/90
        backdrop-blur-xl backdrop-saturate-[180%]
        text-white text-xs font-medium
        shadow-lg
        border border-slate-700/50
      ">
        {getTooltip()}
      </div>
    </div>
  );
}