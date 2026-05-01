import React, { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useTheme } from '@/context/ThemeContext';
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
  User,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Stethoscope
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import Button from './ui/Button';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { chats, currentChatId, setCurrentChatId, createNewChat } = useChat();
  
  const [view, setView] = useState('main'); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
      icon: Users, 
      label: 'Patients', 
      onClick: () => router.push('/patients'),
      isActive: pathname === '/patients' || pathname.startsWith('/patients/')
    },
    { 
      icon: MessageSquare, 
      label: 'Services', 
      onClick: () => router.push('/services'),
      isActive: pathname === '/services'
    },
    { 
      icon: Bot, 
      label: 'AI Helper', 
      hasSubmenu: true, 
      onClick: () => setView('chat'),
      isActive: view === 'chat'
    },
  ];

  const ThemeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor
  }[theme];

  const SidebarContent = (
    <div className={twMerge(
      "h-full flex flex-col bg-[var(--sidebar)] border-r border-[var(--border)] transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Brand Header */}
      <div className={twMerge(
        "p-6 flex items-center transition-all",
        isCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap size={22} className="text-white fill-white" />
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <h1 className="text-[var(--foreground)] font-bold text-lg tracking-tight">Skin Cleaner</h1>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">AI Assistant</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[var(--surface)] border border-[var(--border)] rounded-full items-center justify-center text-[var(--text-muted)] hover:text-indigo-400 transition-all z-30 shadow-sm"
      >
        {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'main' ? (
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                onClick={item.onClick}
                title={isCollapsed ? item.label : ""}
                className={twMerge(
                  "group flex items-center rounded-2xl cursor-pointer transition-all border border-transparent",
                  isCollapsed ? "justify-center p-3" : "justify-between px-4 py-3.5",
                  item.isActive ? "bg-indigo-500/10 border-indigo-500/20 shadow-sm" : "hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={twMerge(
                    "transition-colors shrink-0",
                    item.isActive ? "text-indigo-400" : "text-[var(--text-muted)] group-hover:text-indigo-400"
                  )} />
                  {!isCollapsed && (
                    <span className={twMerge(
                      "text-sm font-medium transition-colors animate-in fade-in duration-300",
                      item.isActive ? "text-[var(--foreground)]" : "group-hover:text-[var(--foreground)]"
                    )}>{item.label}</span>
                  )}
                </div>
                {!isCollapsed && item.hasSubmenu && (
                  <ChevronRight size={16} className="text-[var(--text-muted)] opacity-50" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={twMerge("px-6 py-2", isCollapsed && "px-2 items-center")}>
              <button
                onClick={() => setView('main')}
                className={twMerge(
                  "flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-bold mb-6 group",
                  isCollapsed && "justify-center"
                )}
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                {!isCollapsed && "Back"}
              </button>

              <Button
                onClick={handleCreateNewChat}
                className={twMerge("w-full text-sm mb-8", isCollapsed ? "p-0 h-10 w-10 flex items-center justify-center" : "py-4")}
                icon={Plus}
              >
                {!isCollapsed && "New Chat"}
              </Button>

              {!isCollapsed && (
                <div className="space-y-1.5 overflow-y-auto max-h-[400px] custom-scrollbar pr-1 animate-in fade-in duration-300">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 ml-1">History</p>
                  {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={twMerge(
                          "group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                          currentChatId === chat.id ? "bg-indigo-500/5 border-indigo-500/10" : "hover:bg-[var(--surface-hover)]"
                        )}
                        onClick={() => handleChatClick(chat.id)}
                      >
                        <MessageSquare size={16} className={twMerge(
                          "shrink-0",
                          currentChatId === chat.id ? "text-indigo-400" : "text-[var(--text-muted)]"
                        )} />
                        <span className={twMerge(
                          "text-sm truncate pr-2 transition-colors",
                          currentChatId === chat.id ? "text-[var(--foreground)]" : "text-[var(--text-muted)] group-hover:text-[var(--foreground)]"
                        )}>{chat.title}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic text-center py-4">No history yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-[var(--surface-hover)]/30 border-t border-[var(--border)] space-y-3">
        {/* Theme Toggle */}
        <div className={twMerge(
          "flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-1 gap-1",
          isCollapsed ? "flex-col" : "flex-row"
        )}>
          {['light', 'dark', 'system'].map((m) => {
            const Icon = m === 'light' ? Sun : m === 'dark' ? Moon : Monitor;
            const active = theme === m;
            return (
              <button
                key={m}
                onClick={() => setTheme(m)}
                title={m.charAt(0).toUpperCase() + m.slice(1)}
                className={twMerge(
                  "flex-1 flex items-center justify-center p-2 rounded-xl transition-all",
                  active ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "text-[var(--text-muted)] hover:text-indigo-400 hover:bg-indigo-500/5"
                )}
              >
                <Icon size={16} />
              </button>
            )
          })}
        </div>

        {/* User Profile */}
        <div className={twMerge(
          "flex items-center bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)] group cursor-pointer hover:bg-[var(--surface-hover)] transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold shadow-inner">
              JD
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <span className="text-xs font-bold text-[var(--foreground)]">John Doe</span>
                <span className="text-[10px] text-indigo-400 font-medium">Pro Member</span>
              </div>
            )}
          </div>
          {!isCollapsed && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          title={isCollapsed ? "Sign Out" : ""}
          className={twMerge(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all group border border-transparent hover:border-rose-500/20",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={18} className="transition-transform group-hover:scale-110" />
          {!isCollapsed && <span className="text-sm font-bold tracking-tight">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--sidebar)] border-b border-[var(--border)] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-indigo-500" />
          <span className="font-bold text-[var(--foreground)]">Skin Cleaner</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-[var(--text-muted)] hover:text-indigo-400 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 h-full animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white transition-all z-50"
            >
              <X size={20} />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
