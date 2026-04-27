'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Bot, User, Sparkles, ShieldCheck, Heart, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export default function ChatWindow() {
  const { chats, currentChatId, addMessage } = useChat();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const currentChat = chats.find(c => c.id === currentChatId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage(currentChatId, { role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');
      
      const data = await response.text();
      addMessage(currentChatId, { role: 'assistant', content: data });
    } catch (error) {
      addMessage(currentChatId, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fafaf9] text-stone-400 p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-32 h-32 rounded-[2.5rem] bg-white shadow-xl shadow-stone-200/50 flex items-center justify-center mb-10 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Bot size={56} className="text-stone-400 relative z-10 transition-transform group-hover:scale-110" />
        </motion.div>
        <h3 className="text-2xl font-bold text-stone-800 mb-3 tracking-tight">Your Skin Concierge</h3>
        <p className="text-sm text-stone-400 max-w-sm text-center leading-relaxed">
          Ask anything about skincare routines, hair health, or product recommendations. We're here to help you glow.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#fafaf9] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-stone-100/30 blur-[120px] rounded-full -z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-100/30 blur-[100px] rounded-full -z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="h-24 border-b border-stone-100 flex items-center justify-between px-10 shrink-0 bg-white/80 backdrop-blur-xl z-10 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center shadow-sm">
            <Sparkles size={22} className="text-stone-900" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 tracking-tight text-lg">{currentChat?.title || 'New Analysis'}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Expert AI Mode</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 text-stone-400 hover:text-stone-900 transition-all bg-stone-50 rounded-xl hover:shadow-md">
            <ShieldCheck size={20} />
          </button>
          <button className="p-3 text-stone-400 hover:text-stone-900 transition-all bg-stone-50 rounded-xl hover:shadow-md">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth z-10 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {currentChat?.messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-stone-50 flex items-center justify-center mb-6 text-stone-900">
                <Info size={32} />
              </div>
              <h4 className="text-xl font-bold text-stone-800 mb-3">Begin Your Consultation</h4>
              <p className="text-sm text-stone-400 max-w-xs leading-relaxed">
                Describe your concern or ask for a routine. For better results, be specific about your skin type.
              </p>
            </motion.div>
          )}
          {currentChat?.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={twMerge(
                "flex gap-6",
                message.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              <div className={twMerge(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform hover:scale-105",
                message.role === 'user' 
                  ? "bg-stone-900 border-stone-900 text-white" 
                  : "bg-white border-stone-100 text-stone-900"
              )}>
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={twMerge(
                "max-w-[70%] px-7 py-5 rounded-[2rem] text-[15px] leading-relaxed shadow-sm",
                message.role === 'user' 
                  ? "bg-stone-900 text-white rounded-tr-none" 
                  : "bg-white text-stone-700 rounded-tl-none border border-stone-100"
              )}>
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center shrink-0 text-stone-900 shadow-sm">
              <Bot size={20} />
            </div>
            <div className="bg-white px-7 py-5 rounded-[2rem] rounded-tl-none border border-stone-100 shadow-sm">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-10 shrink-0 bg-gradient-to-t from-[#fafaf9] via-[#fafaf9] to-transparent z-10">
        <form onSubmit={handleSubmit} className="relative max-w-5xl mx-auto group">
          <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[2.5rem]"></div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your skin concern or product question..."
            className="w-full bg-white border border-stone-100 rounded-[2.5rem] px-10 py-6 pr-20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-base text-stone-800 placeholder:text-stone-400 relative z-10 shadow-xl shadow-stone-200/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-50 disabled:text-stone-300 text-white rounded-[1.75rem] transition-all shadow-lg shadow-stone-900/20 z-10 group-active:scale-95"
          >
            <Send size={24} />
          </button>
        </form>
        <p className="text-[11px] text-center text-stone-400 mt-6 font-bold uppercase tracking-[0.2em]">
          Dermatologically Minded AI • Personal Care
        </p>
      </div>
    </div>
  );
}
