import React, { useEffect, useState } from 'react';
import { Filter, X, Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';

export default function FilterDrawer({
  isOpen,
  onClose,
  title = "Filters",
  subtitle = "Refine results",
  onApply,
  onReset,
  filtersConfig = [],
  activeFilters = {},
  children
}) {
  const [draftFilters, setDraftFilters] = useState(activeFilters);

  // Prevent body scroll when drawer is open and sync filters
  useEffect(() => {
    if (isOpen) {
      setDraftFilters(activeFilters);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, activeFilters]);

  const handleApply = () => {
    if (onApply) onApply(draftFilters);
  };

  return (
    <>
      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Filter Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[var(--surface)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-[var(--border)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
              <Filter size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--foreground)] leading-none mb-1">{title}</h2>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-danger-500/10 text-[var(--text-muted)] hover:text-danger-500 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {filtersConfig.map((field, idx) => {
            if (field.hidden) return null;
            
            if (field.type === 'search') {
              return (
                <div key={idx} className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{field.label}</label>
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                    <Input
                      placeholder={field.placeholder || 'Search...'}
                      value={draftFilters[field.key] || ''}
                      onChange={(e) => setDraftFilters(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="pl-10 h-12 rounded-xl border border-[var(--border)] focus:ring-2 focus:ring-primary-500/10 bg-[var(--surface-hover)] text-sm font-bold w-full"
                    />
                  </div>
                </div>
              );
            }
            
            if (field.type === 'select') {
              return (
                <div key={idx} className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{field.label}</label>
                  <Select value={draftFilters[field.key] || 'all'} onValueChange={(val) => setDraftFilters(prev => ({ ...prev, [field.key]: val }))}>
                    <SelectTrigger className="h-12 bg-[var(--surface-hover)] border-[var(--border)] rounded-xl font-bold text-sm w-full">
                      <SelectValue placeholder={field.placeholder || 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{field.placeholder || 'All'}</SelectItem>
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            
            if (field.type === 'dateRange') {
              return (
                <div key={idx} className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{field.label}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <DatePicker 
                      placeholder="From Date"
                      date={draftFilters[field.keyFrom]}
                      setDate={(d) => setDraftFilters(prev => ({ ...prev, [field.keyFrom]: d }))}
                    />
                    <DatePicker 
                      placeholder="To Date"
                      date={draftFilters[field.keyTo]}
                      setDate={(d) => setDraftFilters(prev => ({ ...prev, [field.keyTo]: d }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => {
                        const t = new Date();
                        const tStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                        setDraftFilters(prev => ({ ...prev, [field.keyFrom]: tStr, [field.keyTo]: tStr }));
                      }}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${draftFilters[field.keyFrom] && draftFilters[field.keyTo] && draftFilters[field.keyFrom] === draftFilters[field.keyTo] ? 'bg-success-500 text-white shadow-md' : 'bg-[var(--surface-hover)] hover:bg-success-500/10 text-[var(--text-muted)] hover:text-success-500 border border-[var(--border)]'}`}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => {
                        const t = new Date();
                        const tStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                        const n = new Date(t);
                        n.setDate(n.getDate() + 1);
                        const nStr = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
                        setDraftFilters(prev => ({ ...prev, [field.keyFrom]: tStr, [field.keyTo]: nStr }));
                      }}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${draftFilters[field.keyFrom] && draftFilters[field.keyTo] && draftFilters[field.keyFrom] !== draftFilters[field.keyTo] ? 'bg-primary-500 text-white shadow-md' : 'bg-[var(--surface-hover)] hover:bg-primary-500/10 text-[var(--text-muted)] hover:text-primary-500 border border-[var(--border)]'}`}
                    >
                      Upcoming
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
          {children}
        </div>

        <div className="p-6 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
          <div className="flex gap-3">
            <button 
              onClick={onReset}
              className="flex-1 py-3.5 px-4 bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-danger-500 font-bold rounded-xl border border-[var(--border)] transition-colors text-xs uppercase tracking-wider"
            >
              Reset
            </button>
            <button 
              onClick={handleApply}
              className="flex-[2] py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
