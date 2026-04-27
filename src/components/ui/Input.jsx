import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Input = React.forwardRef(({ className, icon: Icon, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon size={18} className="text-[var(--text-muted)] group-focus-within:text-indigo-400 transition-colors" />
          </div>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              "w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-[var(--foreground)] placeholder:text-[var(--text-muted)]",
              "focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm shadow-sm",
              Icon && "pl-12",
              error && "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500"
            ),
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
