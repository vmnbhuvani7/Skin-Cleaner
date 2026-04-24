'use client';

import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { ChatProvider } from '@/context/ChatContext';

export default function Home() {
  return (
    <ChatProvider>
      <main className="flex h-screen w-full bg-[#0a0c10] overflow-hidden text-gray-200 font-sans selection:bg-indigo-500/30">
        <Sidebar />
        <ChatWindow />
      </main>
    </ChatProvider>
  );
}
