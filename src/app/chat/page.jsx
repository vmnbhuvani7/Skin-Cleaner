'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { ChatProvider, useChat } from '@/context/ChatContext';
import Loader from '@/components/ui/Loader';

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
    <div className="flex flex-col lg:flex-row h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative pt-16 lg:pt-0 h-full overflow-hidden flex flex-col">
        <ChatWindow />
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <Suspense fallback={<Loader fullScreen />}>
        <ChatContent />
      </Suspense>
    </ChatProvider>
  );
}
