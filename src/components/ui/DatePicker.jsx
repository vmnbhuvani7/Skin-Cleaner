'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function CustomDatePicker({ date, setDate, label, placeholder = "Pick a date", error }) {
  const selectedDate = date ? new Date(date) : null;

  return (
    <div className="space-y-1.5 w-full relative">
      {label && (
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <DatePicker
          selected={selectedDate}
          onChange={(newDate) => {
            if (newDate) {
              // Store as YYYY-MM-DD for birthdates
              setDate(newDate.toISOString().split('T')[0]);
            } else {
              setDate('');
            }
          }}
          placeholderText={placeholder}
          className={twMerge(
            "flex h-12 w-full items-center justify-start rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] pl-11 pr-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 shadow-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)]",
            error && "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500"
          )}
          dateFormat="MMMM d, yyyy"
          showPopperArrow={false}
          autoComplete="off"
        />
        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
      </div>
      {error && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1 mt-1">{error}</p>}
    </div>
  );
}

// Keep the same export name as used in pages
export { CustomDatePicker as DatePicker };
