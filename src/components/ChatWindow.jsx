'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Bot, User, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export default function ChatWindow() {
  const { chats, currentChatId, addMessage, updateMessage } = useChat();
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
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      
      // Add an initial empty assistant message to update
      const assistantMessageId = Math.random().toString(36).substring(7);
      addMessage(currentChatId, { role: 'assistant', content: '', id: assistantMessageId });

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last partial line in buffer

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.substring(2));
              assistantContent += content;
              updateMessage(currentChatId, assistantMessageId, assistantContent);
            } catch (e) {
              console.error('Error parsing line:', line, e);
            }
          }
        }
      }
      
      // Handle remaining buffer
      if (buffer.startsWith('0:')) {
        try {
          const content = JSON.parse(buffer.substring(2));
          assistantContent += content;
          updateMessage(currentChatId, assistantMessageId, assistantContent);
        } catch (e) {}
      }
    } catch (error) {
      addMessage(currentChatId, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] text-[var(--text-muted)] p-8 relative">
        <div className="w-24 h-24 rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-8 relative group">
          <Bot size={48} className="text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
          <div className="absolute inset-0 rounded-3xl border border-indigo-500/20 animate-pulse"></div>
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 tracking-tight">Ready to assist you</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-xs text-center leading-relaxed font-medium">
          Select an existing conversation or start a new one to experience the power of Skin Cleaner AI.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="h-20 border-b border-[var(--border)] flex items-center justify-between px-6 md:px-8 shrink-0 bg-[var(--background)]/80 backdrop-blur-xl z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
            <Bot size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="font-bold text-[var(--foreground)] tracking-tight truncate max-w-[150px] md:max-w-none">{currentChat?.title || 'New Chat'}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">AI Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-[var(--text-muted)] hover:text-indigo-400 transition-all bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:border-indigo-500/50">
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
              <Sparkles size={40} className="text-indigo-500 mb-6 opacity-50" />
              <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">New Conversation</h4>
              <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
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
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                message.role === 'user' 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                  : "bg-[var(--surface)] border-[var(--border)] text-indigo-400"
              )}>
                {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={twMerge(
                "max-w-[85%] md:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                message.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-[var(--surface)] text-[var(--foreground)] rounded-tl-none border border-[var(--border)]"
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
            <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 text-indigo-400">
              <Bot size={18} />
            </div>
            <div className="bg-[var(--surface)] px-5 py-3.5 rounded-2xl rounded-tl-none border border-[var(--border)]">
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
      <div className="p-4 md:p-8 shrink-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent z-10">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl"></div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your request..."
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] relative z-10"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-[var(--surface)] disabled:text-[var(--text-muted)] text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 z-10"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-center text-[var(--text-muted)] mt-4 font-bold uppercase tracking-[0.2em]">
          Skin Cleaner AI • Pure Intelligence
        </p>
      </div>
    </div>
  );
}
