import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Modal = ({ isOpen, onClose, title, children, footer, className }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

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
          "relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl",
          "overflow-hidden animate-in fade-in zoom-in duration-300",
          "flex flex-col max-h-[90vh]"
        ),
        className
      )}>
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] z-10">
          <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-xl text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {/* Footer - Fixed */}
        {footer && (
          <div className="px-8 py-6 border-t border-[var(--border)] bg-[var(--surface)] z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
