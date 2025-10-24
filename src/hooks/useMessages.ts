import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types';
import { getChatMessages, addMessage } from '@/lib/storage';

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Симуляция загрузки
    setTimeout(() => {
      const chatMessages = getChatMessages(chatId);
      setMessages(chatMessages);
      setLoading(false);
    }, 300);
  }, [chatId]);

  const sendMessage = useCallback(
    (content: string, targetChatId?: string) => {
      const messagesChatId = targetChatId || chatId;
      if (!messagesChatId) return;

      const userMessage: Message = {
        id: 'msg-' + Date.now(),
        chatId: messagesChatId,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      addMessage(userMessage);

      // Обновляем messages только если это текущий чат
      if (messagesChatId === chatId) {
        setMessages(prev => [...prev, userMessage]);
      }

      // Симуляция ответа ИИ
      setTimeout(() => {
        const aiMessage: Message = {
          id: 'msg-' + Date.now(),
          chatId: messagesChatId,
          role: 'assistant',
          content: 'Это демонстрационный ответ от Skye ИИ. В будущем здесь будет настоящий ответ модели!',
          timestamp: Date.now(),
        };

        addMessage(aiMessage);

        // Обновляем messages только если это текущий чат
        if (messagesChatId === chatId) {
          setMessages(prev => [...prev, aiMessage]);
        }
      }, 1000);
    },
    [chatId]
  );

  return {
    messages,
    loading,
    sendMessage,
  };
}
