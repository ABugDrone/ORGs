import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Message, Conversation, UserStatus, MessageNotification } from '@/types/messages';

interface MessagesContextValue {
  conversations: Conversation[];
  userStatuses: Map<string, UserStatus>;
  notifications: MessageNotification[];
  unreadCount: number;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string) => void;
  createConversation: (participantIds: string[], participantNames: string[]) => string;
  getMessages: (conversationId: string) => Message[];
  getUserStatus: (userId: string) => UserStatus | undefined;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

interface MessagesProviderProps {
  children: ReactNode;
}

export function MessagesProvider({ children }: MessagesProviderProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(new Map());
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize conversations and user statuses
  useEffect(() => {
    loadConversations();
    loadNotifications();
    initializeUserStatuses();
    
    // Set current user as online
    if (user) {
      updateUserStatus(user.id, 'online');
    }

    // Simulate other users' online status
    const statusInterval = setInterval(() => {
      simulateUserActivity();
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(statusInterval);
      if (user) {
        updateUserStatus(user.id, 'offline');
      }
    };
  }, [user]);

  // Calculate unread count
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    setUnreadCount(total);
  }, [conversations]);

  const loadConversations = () => {
    const stored = localStorage.getItem('conversations');
    if (stored) {
      setConversations(JSON.parse(stored));
    } else {
      // Initialize with system welcome message
      const welcomeConv: Conversation = {
        id: 'welcome',
        participants: [user?.id || '', 'system'],
        participantNames: ['CASI 360 System'],
        lastMessage: 'Welcome to CASI 360 Messaging!',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1,
        type: 'direct'
      };
      
      const welcomeMsg: Message = {
        id: '1',
        conversationId: 'welcome',
        senderId: 'system',
        senderName: 'CASI 360 System',
        content: 'Welcome to CASI 360 Messaging! You can now communicate with your colleagues in real-time.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'system'
      };
      
      localStorage.setItem('conversations', JSON.stringify([welcomeConv]));
      localStorage.setItem('messages_welcome', JSON.stringify([welcomeMsg]));
      setConversations([welcomeConv]);
    }
  };

  const loadNotifications = () => {
    const stored = localStorage.getItem('messageNotifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  };

  const initializeUserStatuses = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const statusMap = new Map<string, UserStatus>();
    
    users.forEach((u: any) => {
      statusMap.set(u.id, {
        userId: u.id,
        status: u.id === user?.id ? 'online' : 'offline',
        lastSeen: new Date().toISOString()
      });
    });
    
    setUserStatuses(statusMap);
  };

  const simulateUserActivity = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newStatusMap = new Map(userStatuses);
    
    users.forEach((u: any) => {
      if (u.id !== user?.id) {
        // Randomly set users as online/away/offline
        const rand = Math.random();
        const status = rand > 0.7 ? 'online' : rand > 0.4 ? 'away' : 'offline';
        newStatusMap.set(u.id, {
          userId: u.id,
          status,
          lastSeen: new Date().toISOString()
        });
      }
    });
    
    setUserStatuses(newStatusMap);
  };

  const updateUserStatus = (userId: string, status: 'online' | 'away' | 'offline') => {
    const newStatusMap = new Map(userStatuses);
    newStatusMap.set(userId, {
      userId,
      status,
      lastSeen: new Date().toISOString()
    });
    setUserStatuses(newStatusMap);
  };

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!user) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    };

    // Save message
    const existingMessages = JSON.parse(
      localStorage.getItem(`messages_${conversationId}`) || '[]'
    );
    const updatedMessages = [...existingMessages, message];
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify(updatedMessages));

    // Update conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: content,
          lastMessageTime: message.timestamp
        };
      }
      return conv;
    });
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));

    // Create notification for other participants
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      const otherParticipants = conversation.participants.filter(p => p !== user.id);
      otherParticipants.forEach(participantId => {
        const notification: MessageNotification = {
          id: Date.now().toString() + participantId,
          conversationId,
          senderId: user.id,
          senderName: user.name,
          message: content,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        // In a real app, this would be sent to the server
        // For now, we'll just store it locally
        const existingNotifs = JSON.parse(
          localStorage.getItem('messageNotifications') || '[]'
        );
        localStorage.setItem(
          'messageNotifications',
          JSON.stringify([...existingNotifs, notification])
        );
      });
    }
  }, [user, conversations]);

  const markAsRead = useCallback((conversationId: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    });
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));

    // Mark messages as read
    const messages = JSON.parse(
      localStorage.getItem(`messages_${conversationId}`) || '[]'
    );
    const updatedMessages = messages.map((msg: Message) => ({ ...msg, read: true }));
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify(updatedMessages));
  }, [conversations]);

  const createConversation = useCallback((
    participantIds: string[],
    participantNames: string[]
  ): string => {
    const conversationId = Date.now().toString();
    const newConversation: Conversation = {
      id: conversationId,
      participants: [user?.id || '', ...participantIds],
      participantNames,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      type: participantIds.length > 1 ? 'group' : 'direct'
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));

    return conversationId;
  }, [user, conversations]);

  const getMessages = useCallback((conversationId: string): Message[] => {
    const stored = localStorage.getItem(`messages_${conversationId}`);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const getUserStatus = useCallback((userId: string): UserStatus | undefined => {
    return userStatuses.get(userId);
  }, [userStatuses]);

  const clearNotification = useCallback((notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem('messageNotifications', JSON.stringify(updated));
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.setItem('messageNotifications', JSON.stringify([]));
  }, []);

  const value: MessagesContextValue = {
    conversations,
    userStatuses,
    notifications,
    unreadCount,
    sendMessage,
    markAsRead,
    createConversation,
    getMessages,
    getUserStatus,
    clearNotification,
    clearAllNotifications
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
