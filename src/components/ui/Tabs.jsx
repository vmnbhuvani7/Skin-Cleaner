'use client';

import React, { createContext, useContext, useId, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const TabsContext = createContext(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subcomponents must be used inside <Tabs>');
  return ctx;
};

const Tabs = ({ value, defaultValue, onChange, children, className }) => {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internal;
  const groupId = useId();

  const setActive = (next) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ active, setActive, groupId }}>
      <div className={twMerge('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className }) => (
  <div
    role="tablist"
    className={twMerge(
      'inline-flex items-center gap-1 p-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl',
      className,
    )}
  >
    {children}
  </div>
);

const TabsTrigger = ({ value, children, icon: Icon, disabled, className }) => {
  const { active, setActive, groupId } = useTabs();
  const isActive = active === value;
  return (
    <button
      role="tab"
      id={`${groupId}-tab-${value}`}
      aria-controls={`${groupId}-panel-${value}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setActive(value)}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:pointer-events-none',
          isActive
            ? 'bg-[var(--surface)] text-primary-600 shadow-sm border border-[var(--border)]'
            : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
        ),
        className,
      )}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className }) => {
  const { active, groupId } = useTabs();
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${groupId}-panel-${value}`}
      aria-labelledby={`${groupId}-tab-${value}`}
      className={className}
    >
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
export { TabsList, TabsTrigger, TabsContent };
