import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import Card from './Card';

const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
  variant = 'surface',
  padding = 'md',
  radius = 'md',
  ...props
}) => (
  <Card
    variant={variant}
    padding={padding}
    radius={radius}
    className={twMerge('flex flex-col gap-4', className)}
    {...props}
  >
    {(title || action) && (
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <span className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </span>
          )}
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-black text-[var(--foreground)] tracking-tight leading-none">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    <div className={twMerge('flex-1', bodyClassName)}>{children}</div>
  </Card>
);

export default SectionCard;
