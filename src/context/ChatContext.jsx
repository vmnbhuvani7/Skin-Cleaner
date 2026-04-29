'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadChats, saveChats } from '@/utils/storage';
import { v4 as uuidv4 } from 'uuid';

const ChatContext = createContext(undefined);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadedChats = loadChats();
    if (loadedChats.length > 0) {
      setChats(loadedChats);
      setCurrentChatId(loadedChats[0].id);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveChats(chats);
    }
  }, [chats, isInitialized]);

  const createNewChat = () => {
    const newChat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const addMessage = (chatId, messageData) => {
    const messageId = messageData.id || uuidv4();
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        const newMessage = {
          ...messageData,
          id: messageId,
          timestamp: Date.now(),
        };
        const updatedMessages = [...chat.messages, newMessage];
        
        let newTitle = chat.title;
        if (chat.messages.length === 0 && messageData.role === 'user') {
          newTitle = messageData.content.slice(0, 30) + (messageData.content.length > 30 ? '...' : '');
        }
        
        return { ...chat, messages: updatedMessages, title: newTitle };
      }
      return chat;
    }));
    return messageId;
  };

  const updateMessage = (chatId, messageId, content) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = chat.messages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, content };
          }
          return msg;
        });
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    }));
  };

  const deleteChat = (id) => {
    const updatedChats = chats.filter(chat => chat.id !== id);
    setChats(updatedChats);
    if (currentChatId === id) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  return (
    <ChatContext.Provider value={{ chats, currentChatId, setCurrentChatId, createNewChat, addMessage, updateMessage, deleteChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
