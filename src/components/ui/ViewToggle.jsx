'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/**
 * @param {string} mode - 'list' or 'grid'
 * @param {Function} setMode - Callback to change mode
 */
export default function ViewToggle({ mode, setMode }) {
  return (
    <div className="flex items-center gap-2 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)] shadow-sm">
      <button
        onClick={() => setMode('list')}
        className={twMerge(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest",
          mode === 'list' 
            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95" 
            : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        )}
      >
        <List size={16} />
        <span className="hidden sm:inline">List View</span>
      </button>
      <button
        onClick={() => setMode('grid')}
        className={twMerge(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest",
          mode === 'grid' 
            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95" 
            : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        )}
      >
        <LayoutGrid size={16} />
        <span className="hidden sm:inline">Card View</span>
      </button>
    </div>
  );
}
