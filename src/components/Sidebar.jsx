'use client';

import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import {
  Plus,
  MessageSquare,
  Zap,
  LayoutDashboard,
  Bot,
  Settings,
  ChevronRight,
  ArrowLeft,
  LogOut,
  User
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import Button from './ui/Button';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { chats, currentChatId, setCurrentChatId, createNewChat, deleteChat } = useChat();
  const [view, setView] = useState('main'); // 'main' or 'chat'
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/';
  };

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

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      onClick: () => router.push('/dashboard'),
      isActive: pathname === '/dashboard'
    },
    { 
      icon: User, 
      label: 'Doctors', 
      onClick: () => router.push('/doctors'),
      isActive: pathname === '/doctors'
    },
    { 
      icon: Bot, 
      label: 'AI Helper (Beta)', 
      hasSubmenu: true, 
      onClick: () => setView('chat'),
      isActive: view === 'chat'
    },
  ];

  return (
    <div className="w-72 h-screen bg-[#0f1115] border-r border-white/5 flex flex-col shadow-2xl z-20 relative">
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

      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'main' ? (
          /* Main Menu View */
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                onClick={item.onClick}
                className={twMerge(
                  "group flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all border border-transparent",
                  item.isActive ? "bg-white/10 border-white/5 shadow-xl" : "hover:bg-white/5 text-gray-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={twMerge(
                    "transition-colors",
                    item.isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                  )} />
                  <span className={twMerge(
                    "text-sm font-medium transition-colors",
                    item.isActive ? "text-white" : "group-hover:text-gray-200"
                  )}>{item.label}</span>
                </div>
                {item.hasProgress && (
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-[spin_3s_linear_infinite]"></div>
                )}
                {item.hasSubmenu && (
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-gray-600 hover:text-indigo-400 transition-colors" />
                    <ChevronRight size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Chat History View */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2">
              <button
                onClick={() => setView('main')}
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-bold mb-6 group"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Go Back
              </button>

              <Button
                onClick={handleCreateNewChat}
                className="w-full text-sm py-4 mb-8"
                icon={Plus}
              >
                New Chat
              </Button>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Your Chats</p>
                  <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-3 ml-1">Last 30 days</p>

                  <div className="space-y-1.5 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
                    {filteredChats.length > 0 ? (
                      filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={twMerge(
                            "group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                            currentChatId === chat.id ? "bg-white/10 border-white/5" : "hover:bg-white/5"
                          )}
                          onClick={() => handleChatClick(chat.id)}
                        >
                          <MessageSquare size={16} className={twMerge(
                            "shrink-0",
                            currentChatId === chat.id ? "text-indigo-400" : "text-gray-500"
                          )} />
                          <span className={twMerge(
                            "text-sm truncate pr-2 transition-colors",
                            currentChatId === chat.id ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                          )}>{chat.title}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-600 italic text-center py-4">No more chat history.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5 space-y-3">
        {/* User Profile */}
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5 group cursor-pointer hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold shadow-inner">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">John Doe</span>
              <span className="text-[10px] text-indigo-400 font-medium">Pro Member</span>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all group border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={18} className="transition-transform group-hover:scale-110" />
          <span className="text-sm font-bold tracking-tight">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
