'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Users, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Active Doctors', value: '12', icon: Users, color: 'text-indigo-400' },
    { label: 'Analyses Done', value: '1,284', icon: Activity, color: 'text-emerald-400' },
    { label: 'System Status', value: 'Secure', icon: ShieldCheck, color: 'text-purple-400' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0c10]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10 relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-0 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} />
              Admin Portal
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Skin Cleaner</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
              Your intelligent companion for professional skincare management. Monitor analyses, manage medical staff, and leverage AI insights to deliver premium care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/[0.07] transition-all group"
              >
                <div className={twMerge("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/10 rounded-[2.5rem] p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4">Start your daily review</h2>
              <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
                Check recent AI analysis reports or manage your clinical team through the sidebar navigation.
              </p>
              <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm">
                View Reports
              </button>
            </div>
            <Sparkles className="absolute right-[-20px] bottom-[-20px] text-white/5 w-64 h-64 rotate-12" />
          </div>
        </div>
      </main>
    </div>
  );
}

import { twMerge } from 'tailwind-merge';
