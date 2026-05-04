'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/**
 * @param {number} totalItems - Total count of items
 * @param {number} itemsPerPage - Number of items per page
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {Function} onPageChange - Callback for page change
 */
export default function Pagination({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange 
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end === totalPages) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={twMerge(
            "w-10 h-10 rounded-xl font-bold text-xs transition-all duration-200 border",
            currentPage === i 
              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
              : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-400 hover:text-indigo-400 bg-[var(--surface)]"
          )}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">
        Showing <span className="text-[var(--foreground)]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[var(--foreground)]">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-[var(--foreground)]">{totalItems}</span> entries
      </p>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-400 transition-all bg-[var(--surface)]"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1.5 mx-1">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-400 transition-all bg-[var(--surface)]"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
