'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getMonth, getYear } from 'date-fns';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const years = Array.from(
  { length: new Date().getFullYear() + 21 - 1900 },
  (_, i) => 1900 + i
);

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';

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
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-3 h-14 bg-[var(--surface)]">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                type="button"
                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 text-indigo-500" />
              </button>

              <div className="flex items-center gap-1">
                <Select
                  value={getMonth(date).toString()}
                  onValueChange={(value) => changeMonth(parseInt(value))}
                >
                  <SelectTrigger className="h-7 border-none bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-0 w-auto gap-1 text-[11px] font-extrabold uppercase hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all focus:ring-0 shadow-none rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()} className="text-[11px] uppercase font-bold">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={getYear(date).toString()}
                  onValueChange={(value) => changeYear(parseInt(value))}
                >
                  <SelectTrigger className="h-7 border-none bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-0 w-auto gap-1 text-[11px] font-extrabold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all focus:ring-0 shadow-none rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-[11px] font-bold">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                type="button"
                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4 text-indigo-500" />
              </button>
            </div>
          )}
        />
        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
      </div>
      {error && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1 mt-1">{error}</p>}
    </div>
  );
}

// Keep the same export name as used in pages
export { CustomDatePicker as DatePicker };
