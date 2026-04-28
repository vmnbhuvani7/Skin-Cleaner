'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function Loader({ className, fullScreen = false }) {
  const content = (
    <div className={twMerge("flex flex-col items-center", className)}>
      <div className="relative mb-6">
        {/* Outer Spinning Ring */}
        <div className="w-16 h-16 border-2 border-indigo-500/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
        
        {/* Center Logo/Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Loading...</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        {content}
      </div>
    );
  }

  return content;
}
