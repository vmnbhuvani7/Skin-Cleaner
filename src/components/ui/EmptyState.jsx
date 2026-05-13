import React from 'react';
import { twMerge } from 'tailwind-merge';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing here yet',
  description,
  action,
  className,
}) => (
  <div
    className={twMerge(
      'py-20 text-center space-y-4 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[2.5rem]',
      className,
    )}
  >
    {Icon && (
      <div className="bg-primary-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-primary-500">
        <Icon size={40} />
      </div>
    )}
    <div className="space-y-1.5 max-w-md mx-auto">
      <h3 className="text-base font-black text-[var(--foreground)] tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] font-medium">{description}</p>
      )}
    </div>
    {action && <div className="pt-2 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
