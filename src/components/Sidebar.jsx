'use client';

import React from 'react';
import { useChat } from '@/context/ChatContext';
import { Plus, MessageSquare, Trash2, Search, Zap, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import Button from './ui/Button';

export default function Sidebar() {
  const router = useRouter();
  const { chats, currentChatId, setCurrentChatId, createNewChat, deleteChat } = useChat();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleChatClick = (id) => {
    setCurrentChatId(id);
    router.push(`/chat?id=${id}`);
  };

  const handleCreateNewChat = () => {
    const id = createNewChat();
    if (id) router.push(`/chat?id=${id}`);
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-screen bg-white border-r border-stone-100 flex flex-col shadow-sm">
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center border border-stone-200 shadow-sm transition-transform hover:scale-105">
          <Zap size={24} className="text-stone-900 fill-stone-900/10" />
        </div>
        <div>
          <h1 className="text-stone-900 font-bold text-xl tracking-tight leading-none">Skin Cleaner</h1>
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">Smart Aesthetics</p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <Button
          onClick={handleCreateNewChat}
          className="w-full shadow-md"
          icon={Plus}
        >
          New Analysis
        </Button>
        
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-stone-900 focus:outline-none focus:ring-4 focus:ring-stone-500/10 focus:border-stone-500/50 transition-all placeholder:text-stone-400"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 mt-8 pb-4 custom-scrollbar">
        <div className="space-y-1.5">
          <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Recent Discussions</p>
          {filteredChats.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-stone-400 italic">No history found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={twMerge(
                  "group flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all relative border border-transparent",
                  currentChatId === chat.id 
                    ? "bg-indigo-50/50 border-indigo-100/50 shadow-sm" 
                    : "hover:bg-stone-50"
                )}
                onClick={() => handleChatClick(chat.id)}
              >
                <div className={twMerge(
                  "w-2 h-2 rounded-full shrink-0 transition-all",
                  currentChatId === chat.id ? "bg-stone-900 scale-100" : "bg-transparent scale-0"
                )} />
                <MessageSquare size={18} className={twMerge(
                  "shrink-0 transition-colors",
                  currentChatId === chat.id ? "text-stone-900" : "text-stone-400 group-hover:text-stone-600"
                )} />
                <span className={twMerge(
                  "text-sm truncate pr-6 transition-colors",
                  currentChatId === chat.id ? "text-stone-900 font-bold" : "text-stone-500 group-hover:text-stone-700"
                )}>{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="absolute right-4 opacity-0 group-hover:opacity-100 hover:text-rose-500 text-stone-300 transition-all p-1.5 bg-white rounded-lg shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-6 mt-auto">
        <div className="flex items-center justify-between bg-stone-50 p-4 rounded-[1.5rem] border border-stone-100 group cursor-pointer hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-900 shadow-sm group-hover:shadow-md transition-all">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-900">Guest User</span>
              <span className="text-[10px] text-stone-400 font-medium group-hover:text-stone-900 transition-colors">Sign in for more</span>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        </div>
      </div>
    </div>
  );
}
