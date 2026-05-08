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
          "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
          mode === 'list' 
            ? "bg-teal-600 text-white shadow-xl shadow-teal-600/20 active:scale-95" 
            : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
        )}
      >
        <List size={16} />
        <span className="hidden sm:inline">List View</span>
      </button>
      <button
        onClick={() => setMode('grid')}
        className={twMerge(
          "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
          mode === 'grid' 
            ? "bg-teal-600 text-white shadow-xl shadow-teal-600/20 active:scale-95" 
            : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
        )}
      >
        <LayoutGrid size={16} />
        <span className="hidden sm:inline">Card View</span>
      </button>
    </div>
  );
}
