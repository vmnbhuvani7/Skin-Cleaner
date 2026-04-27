import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Button = ({ className, variant = 'primary', size = 'md', isLoading, children, icon: Icon, ...props }) => {
  const variants = {
    primary: "bg-stone-900 hover:bg-stone-800 text-white shadow-lg shadow-stone-900/20",
    secondary: "bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200",
    outline: "bg-transparent border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900",
    ghost: "bg-transparent hover:bg-stone-100 text-stone-600 hover:text-stone-900",
  };

  const sizes = {
    sm: "py-2 px-4 text-xs",
    md: "py-3.5 px-6 text-sm",
    lg: "py-4 px-8 text-base",
  };

  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size]
        ),
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
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
