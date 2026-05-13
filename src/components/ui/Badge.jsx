import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const TONES = {
  primary: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
  success: 'bg-success-500/10 text-success-600 border-success-500/20',
  danger:  'bg-danger-500/10  text-danger-600  border-danger-500/20',
  warning: 'bg-warning-500/10 text-warning-600 border-warning-500/20',
  neutral: 'bg-[var(--surface-hover)] text-[var(--text-muted)] border-[var(--border)]',
};

const SOLID = {
  primary: 'bg-primary-500 text-white border-transparent',
  success: 'bg-success-500 text-white border-transparent',
  danger:  'bg-danger-500  text-white border-transparent',
  warning: 'bg-warning-500 text-white border-transparent',
  neutral: 'bg-[var(--text-muted)] text-white border-transparent',
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-[11px] px-2.5 py-1',
  lg: 'text-xs px-3 py-1.5',
};

const Badge = ({
  children,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  icon: Icon,
  className,
  ...props
}) => {
  const palette = variant === 'solid' ? SOLID : TONES;
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 font-bold uppercase tracking-widest rounded-full border',
          palette[tone] || palette.neutral,
          SIZES[size] || SIZES.md,
        ),
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={12} className="-ml-0.5" />}
      {children}
    </span>
  );
};

export default Badge;
