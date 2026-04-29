import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const ChatLoading = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-4 mb-8"
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
  );
};

export default ChatLoading;
