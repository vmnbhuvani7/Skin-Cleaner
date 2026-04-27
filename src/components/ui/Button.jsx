import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Button = ({ className, variant = 'primary', size = 'md', isLoading, children, icon: Icon, ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10",
    outline: "bg-transparent border border-white/10 hover:border-white/20 text-gray-400 hover:text-white",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
  };

  const sizes = {
    sm: "py-2 px-4 text-xs rounded-xl",
    md: "py-3.5 px-6 text-sm rounded-2xl",
    lg: "py-4 px-8 text-base rounded-2xl",
  };

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
