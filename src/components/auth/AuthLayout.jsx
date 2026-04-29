'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  description, 
  illustrationSrc = '/medical-auth.png' 
}) {
  const { activeTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] dark:bg-[#0a0c10] transition-colors duration-500 overflow-hidden relative">
      
      {/* Global Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Theme Toggle (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
        >
          {activeTheme === 'dark' ? (
            <Sun className="text-yellow-400" size={22} />
          ) : (
            <Moon className="text-indigo-600" size={22} />
          )}
        </button>
      </div>

      {/* Left Section: Illustration & Branding */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 p-12 max-w-2xl text-center lg:text-left"
        >
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Zap size={26} className="text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Skin Cleaner</h2>
              <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Medical Aesthetic Clinic</p>
            </div>
          </div>

          <h1 className="text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            {title} <br />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {subtitle}
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-lg leading-relaxed">
            {description}
          </p>

          <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/5">
            <Image
              src={illustrationSrc}
              alt="Medical Care"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Right Section: Form Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          {children}
          
          <div className="mt-10 mb-10 text-center flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
            <span className="w-10 h-px bg-gray-200 dark:bg-white/10"></span>
            <span>Skin Cleaner AI • Secure Portal</span>
            <span className="w-10 h-px bg-gray-200 dark:bg-white/10"></span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
