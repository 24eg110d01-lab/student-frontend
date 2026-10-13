import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-500/40',
      gradient: 'from-indigo-500/10 to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-500/40',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-500/40',
      gradient: 'from-blue-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-500/40',
      gradient: 'from-amber-500/10 to-transparent',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm ${scheme.border} transition-all duration-200 group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.gradient} rounded-bl-full pointer-events-none`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {title}
          </p>
          <h4 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h4>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl ${scheme.bg} ${scheme.icon} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
