import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const VARIANTS = {
  surface: 'bg-[var(--surface)] border border-[var(--border)] shadow-sm',
  glass:   'glass-card',
  dashed:  'bg-[var(--surface)] border border-dashed border-[var(--border)]',
  ghost:   'bg-transparent',
};

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

const RADIUS = {
  md:   'rounded-2xl',
  lg:   'rounded-[2rem]',
  xl:   'rounded-[2.5rem]',
};

const Card = ({
  as: Tag = 'div',
  variant = 'surface',
  padding = 'md',
  radius = 'md',
  interactive = false,
  className,
  children,
  ...props
}) => (
  <Tag
    className={twMerge(
      clsx(
        VARIANTS[variant] || VARIANTS.surface,
        PADDING[padding],
        RADIUS[radius] || RADIUS.md,
        interactive && 'transition-all hover:border-primary-500/30 hover:shadow-md cursor-pointer',
      ),
      className,
    )}
    {...props}
  >
    {children}
  </Tag>
);

export default Card;
