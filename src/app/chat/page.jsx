'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { ChatProvider, useChat } from '@/context/ChatContext';

function ChatContent() {
  const searchParams = useSearchParams();
  const { setCurrentChatId } = useChat();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      setCurrentChatId(id);
    }
  }, [id, setCurrentChatId]);

  return (
    <main className="flex h-screen w-full bg-stone-50 overflow-hidden text-stone-800 font-sans selection:bg-indigo-100">
      <Sidebar />
      <ChatWindow />
    </main>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-stone-50 text-stone-400 font-bold uppercase tracking-widest">Initializing...</div>}>
        <ChatContent />
      </Suspense>
    </ChatProvider>
  );
}
