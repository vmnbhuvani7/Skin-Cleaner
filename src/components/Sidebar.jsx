'use client';

import React from 'react';
import { useChat } from '@/context/ChatContext';
import { Plus, MessageSquare, Trash2, Search, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function Sidebar() {
  const { chats, currentChatId, setCurrentChatId, createNewChat, deleteChat } = useChat();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 h-screen bg-[#0f1115] border-r border-white/10 flex flex-col shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap size={22} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">Skin Cleaner</h1>
          <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">AI Assistant</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 font-semibold text-sm group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          New Conversation
        </button>
        
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 mt-6 pb-4 custom-scrollbar">
        <div className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Recent Chats</p>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={twMerge(
                "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all relative border border-transparent",
                currentChatId === chat.id 
                  ? "bg-white/10 border-white/10 shadow-xl" 
                  : "hover:bg-white/5"
              )}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <MessageSquare size={16} className={twMerge(
                "shrink-0 transition-colors",
                currentChatId === chat.id ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-400"
              )} />
              <span className={twMerge(
                "text-sm truncate pr-6 transition-colors",
                currentChatId === chat.id ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-300"
              )}>{chat.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="absolute right-3 opacity-0 group-hover:opacity-100 hover:text-rose-400 text-gray-500 transition-all p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-white/[0.02] border-t border-white/10">
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold shadow-inner">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">John Doe</span>
              <span className="text-[10px] text-indigo-400 font-medium">Pro Member</span>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
