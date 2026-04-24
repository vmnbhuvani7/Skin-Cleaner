'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Bot, User, Sparkles, ShieldCheck } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0c10] text-gray-500 p-8">
        <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 relative">
          <Bot size={48} className="text-indigo-500/50" />
          <div className="absolute inset-0 rounded-3xl border border-white/10 animate-pulse"></div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ready to assist you</h3>
        <p className="text-sm text-gray-500 max-w-xs text-center leading-relaxed">
          Select an existing conversation or start a new one to experience the power of Skin Cleaner AI.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0c10] overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 shrink-0 bg-[#0a0c10]/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Bot size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-tight">{currentChat?.title || 'New Chat'}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">AI Model Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-white transition-colors">
            <ShieldCheck size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth z-10 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {currentChat?.messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Sparkles size={40} className="text-indigo-500 mb-4 opacity-50" />
              <h4 className="text-lg font-bold text-white mb-2">New Conversation</h4>
              <p className="text-sm text-gray-500 max-w-sm">
                Type your first message below to start chatting with our advanced AI assistant.
              </p>
            </motion.div>
          )}
          {currentChat?.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={twMerge(
                "flex gap-4",
                message.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              <div className={twMerge(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                message.role === 'user' 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                  : "bg-white/5 border-white/10 text-indigo-400"
              )}>
                {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={twMerge(
                "max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                message.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white/5 text-gray-200 rounded-tl-none border border-white/10"
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
            className="flex gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-indigo-400">
              <Bot size={18} />
            </div>
            <div className="bg-white/5 px-5 py-3.5 rounded-2xl rounded-tl-none border border-white/10">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 shrink-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10] to-transparent z-10">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl"></div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your request..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm text-white placeholder:text-gray-600 relative z-10"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 z-10"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-600 mt-4 font-medium uppercase tracking-widest">
          Powered by Skin Cleaner AI • Secure & Private
        </p>
      </div>
    </div>
  );
}
