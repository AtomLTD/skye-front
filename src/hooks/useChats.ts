import { useState, useEffect, useCallback } from 'react';
import { Chat } from '@/types';
import { getChats, addChat, updateChat, deleteChat } from '@/lib/storage';

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки
    setTimeout(() => {
      const storedChats = getChats();
      setChats(storedChats);
      setLoading(false);
    }, 500);
  }, []);

  const createChat = useCallback((title: string) => {
    const newChat: Chat = {
      id: 'chat-' + Date.now(),
      title,
      timestamp: Date.now(),
    };
    addChat(newChat);
    setChats(prev => [newChat, ...prev]);
    return newChat;
  }, []);

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    updateChat(chatId, { title: newTitle });
    setChats(prev =>
      prev.map(chat => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
    );
  }, []);

  const removeChat = useCallback((chatId: string) => {
    deleteChat(chatId);
    setChats(prev => prev.filter(chat => chat.id !== chatId));
  }, []);

  return {
    chats,
    loading,
    createChat,
    renameChat,
    removeChat,
  };
}
