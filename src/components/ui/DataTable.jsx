'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';
import Loader from './Loader';

/**
 * @param {Array} columns - [{ header: string, accessor: string|function, className: string, align: 'left'|'center'|'right' }]
 * @param {Array} data - Data to render
 * @param {Function} onRowClick - Callback for row click
 * @param {boolean} isLoading - Loading state
 * @param {string} emptyMessage - Message to show when no data
 */
export default function DataTable({ 
  columns, 
  data = [], 
  onRowClick, 
  isLoading = false, 
  emptyMessage = "No data found" 
}) {
  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[var(--surface-hover)]/50 border-b border-[var(--border)]">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={twMerge(
                  "px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]",
                  col.align === 'right' && "text-right",
                  col.align === 'center' && "text-center",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr 
                key={row.id || rowIdx} 
                onClick={() => onRowClick && onRowClick(row)}
                className={twMerge(
                  "group transition-all duration-200",
                  onRowClick ? "cursor-pointer hover:bg-indigo-500/[0.03]" : "hover:bg-[var(--surface-hover)]/30"
                )}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx} 
                    className={twMerge(
                      "px-6 py-4 text-sm font-medium text-[var(--foreground)] transition-all",
                      col.align === 'right' && "text-right",
                      col.align === 'center' && "text-center",
                      col.className
                    )}
                  >
                    {typeof col.accessor === 'function' 
                      ? col.accessor(row) 
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-20 text-center">
                <p className="text-[var(--text-muted)] font-medium italic opacity-60">{emptyMessage}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
