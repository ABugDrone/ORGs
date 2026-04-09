// ORGs — single user app. Messages = personal notes/memos.
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessagesContextValue {
  messages: Message[];
  unreadCount: number;
  addMessage: (content: string) => void;
  markAllRead: () => void;
  deleteMessage: (id: string) => void;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem('orgs_messages');
    return stored ? JSON.parse(stored) : [];
  });

  const persist = (msgs: Message[]) => {
    localStorage.setItem('orgs_messages', JSON.stringify(msgs));
  };

  const addMessage = useCallback((content: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => {
      const updated = [msg, ...prev];
      persist(updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setMessages(prev => {
      const updated = prev.map(m => ({ ...m, read: true }));
      persist(updated);
      return updated;
    });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => {
      const updated = prev.filter(m => m.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <MessagesContext.Provider value={{ messages, unreadCount, addMessage, markAllRead, deleteMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider');
  return ctx;
}
