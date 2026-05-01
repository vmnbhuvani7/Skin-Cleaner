'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home, Terminal } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-900/10 blur-[150px] rounded-full" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-xl w-full">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[3rem] p-10 md:p-12 shadow-2xl backdrop-blur-xl space-y-10">
          {/* Icon Header */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
              <AlertTriangle size={48} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">System Malfunction</h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto font-medium">
                Our core processors encountered an unexpected anomaly during execution.
              </p>
            </div>
          </div>

          {/* Technical Details (Collapsible or subtle) */}
          <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <Terminal size={12} />
              Diagnostic Data
            </div>
            <p className="text-[11px] font-mono text-rose-400/80 break-all leading-relaxed bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
              {error?.message || 'Unknown kernel panic occurred in clinical module.'}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => reset()}
              className="h-14 rounded-2xl bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/5 font-black text-xs uppercase tracking-widest"
              icon={RefreshCcw}
            >
              Retry Sync
            </Button>
            <Link href="/" className="w-full">
              <Button 
                variant="outline"
                className="h-14 w-full rounded-2xl border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest"
                icon={Home}
              >
                Return Base
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            Need assistance? <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">Contact System Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
