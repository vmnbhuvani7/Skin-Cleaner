'use client';

import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const PLACEMENT = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const Tooltip = ({
  content,
  children,
  placement = 'top',
  delay = 100,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState(null);

  const show = () => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => setOpen(true), delay));
  };
  const hide = () => {
    if (timer) clearTimeout(timer);
    setTimer(null);
    setOpen(false);
  };

  if (!content) return children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        role="tooltip"
        className={twMerge(
          clsx(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all',
            'bg-[var(--foreground)] text-[var(--background)]',
            PLACEMENT[placement] || PLACEMENT.top,
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          ),
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
