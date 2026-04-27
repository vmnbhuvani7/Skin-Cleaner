import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={twMerge(
        clsx(
          "relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl",
          "overflow-hidden animate-in fade-in zoom-in duration-300"
        ),
        className
      )}>
        {/* Header */}
        <div className="px-8 pt-8 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-xl text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
