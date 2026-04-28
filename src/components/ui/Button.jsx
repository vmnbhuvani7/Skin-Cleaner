import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Button = ({ className, variant = 'primary', size = 'md', isLoading, loading, children, icon: Icon, ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20",
    secondary: "bg-[var(--surface-hover)] hover:bg-indigo-500/10 text-[var(--foreground)] border border-[var(--border)]",
    outline: "bg-transparent border border-[var(--border)] hover:border-indigo-500/50 text-[var(--text-muted)] hover:text-indigo-500",
    ghost: "bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--foreground)]",
  };

  const sizes = {
    sm: "py-2 px-4 text-xs rounded-xl",
    md: "py-3.5 px-6 text-sm rounded-2xl",
    lg: "py-4 px-8 text-base rounded-2xl",
  };

  const isButtonLoading = isLoading || loading;

  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group",
          variants[variant],
          sizes[size]
        ),
        className
      )}
      disabled={isButtonLoading}
      {...props}
    >
      {isButtonLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {children}
          {Icon && <Icon size={18} className="transition-transform group-hover:translate-x-0.5" />}
        </>
      )}
    </button>
  );
};

export default Button;
