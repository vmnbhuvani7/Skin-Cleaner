'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] flex items-center justify-center p-6">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 scale-110 blur-[2px]"
        style={{
          backgroundImage: 'url("/not_found_abstract_1777630161759.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Content Card */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="space-y-4">
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-white opacity-10 select-none">
            404
          </h1>
          <div className="-mt-24 space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Void</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-md mx-auto leading-relaxed">
              The page you're looking for has vanished into thin air or moved to another dimension.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/">
            <Button 
              size="lg" 
              className="px-8 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 group"
              icon={Home}
            >
              Back to Safety
            </Button>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest px-6 h-14 group"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </div>

        {/* Floating Elements (Micro-animations) */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-2xl animate-pulse delay-700" />
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">
          Skin Cleaner AI • Diagnostic System Error
        </p>
      </div>
    </div>
  );
}
