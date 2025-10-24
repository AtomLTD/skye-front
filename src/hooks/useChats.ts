import { useState, useEffect, useCallback } from 'react';
import { Chat } from '@/types';
import { getChats, addChat, updateChat, deleteChat, getChatMessages } from '@/lib/storage';
import { timewebAI } from '@/lib/timeweb-ai';

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

  /**
   * Автоматическое переименование чата на основе первого сообщения
   */
  const autoRenameChat = useCallback(async (chatId: string) => {
    const messages = getChatMessages(chatId);
    const firstUserMessage = messages.find(m => m.role === 'user');
    
    if (!firstUserMessage) {
      return;
    }

    // Помечаем чат как генерирующий название
    updateChat(chatId, { isGeneratingTitle: true });
    setChats(prev =>
      prev.map(chat => 
        chat.id === chatId ? { ...chat, isGeneratingTitle: true } : chat
      )
    );

    try {
      const newTitle = await timewebAI.generateChatTitle({
        firstMessage: firstUserMessage.content,
      });

      // Обновляем название чата
      updateChat(chatId, { 
        title: newTitle,
        isGeneratingTitle: false,
      });
      setChats(prev =>
        prev.map(chat => 
          chat.id === chatId ? { ...chat, title: newTitle, isGeneratingTitle: false } : chat
        )
      );
    } catch (error) {
      console.error('Error generating chat title:', error);
      
      // В случае ошибки используем первые слова сообщения
      const fallbackTitle = firstUserMessage.content
        .slice(0, 50)
        .split(' ')
        .slice(0, 5)
        .join(' ') + (firstUserMessage.content.length > 50 ? '...' : '');
      
      updateChat(chatId, { 
        title: fallbackTitle,
        isGeneratingTitle: false,
      });
      setChats(prev =>
        prev.map(chat => 
          chat.id === chatId ? { ...chat, title: fallbackTitle, isGeneratingTitle: false } : chat
        )
      );
    }
  }, []);

  return {
    chats,
    loading,
    createChat,
    renameChat,
    removeChat,
    autoRenameChat,
  };
}
