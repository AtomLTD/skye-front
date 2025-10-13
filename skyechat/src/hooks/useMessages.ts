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
    (content: string) => {
      if (!chatId) return;

      const userMessage: Message = {
        id: 'msg-' + Date.now(),
        chatId,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      setMessages(prev => [...prev, userMessage]);

      // Симуляция ответа ИИ
      setTimeout(() => {
        const aiMessage: Message = {
          id: 'msg-' + Date.now(),
          chatId,
          role: 'assistant',
          content: 'Это демонстрационный ответ от Skye ИИ. В будущем здесь будет настоящий ответ модели!',
          timestamp: Date.now(),
        };

        addMessage(aiMessage);
        setMessages(prev => [...prev, aiMessage]);
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
