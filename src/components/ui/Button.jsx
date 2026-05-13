import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Button = ({ className, variant = 'primary', size = 'md', isLoading, loading, children, icon: Icon, ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-400 hover:via-primary-500 hover:to-primary-600 text-white shadow-lg shadow-primary-500/25",
    secondary: "bg-[var(--sidebar)] hover:bg-primary-500/10 text-[var(--foreground)] border border-[var(--border)]",
    outline: "bg-transparent border border-[var(--border)] hover:border-primary-500/50 text-[var(--text-muted)] hover:text-primary-600",
    ghost: "bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--foreground)]",
    danger: "bg-danger-500 hover:bg-danger-600 text-white shadow-lg shadow-danger-500/20",
  };

  const sizes = {
    icon: "p-2 rounded-xl",
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
