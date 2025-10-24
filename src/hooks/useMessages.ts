import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types';
import { getChatMessages, addMessage, updateMessage } from '@/lib/storage';
import { timewebAI, AIMessage } from '@/lib/timeweb-ai';

// Глобальный менеджер для отслеживания активных генераций
class GenerationManager {
  private activeGenerations = new Map<string, AbortController>();
  private messageUpdateListeners = new Map<string, Set<(message: Message) => void>>();

  startGeneration(messageId: string, controller: AbortController) {
    this.activeGenerations.set(messageId, controller);
  }

  stopGeneration(messageId: string) {
    const controller = this.activeGenerations.get(messageId);
    if (controller) {
      controller.abort();
      this.activeGenerations.delete(messageId);
    }
  }

  isGenerating(messageId: string): boolean {
    return this.activeGenerations.has(messageId);
  }

  completeGeneration(messageId: string) {
    this.activeGenerations.delete(messageId);
  }

  subscribeToMessage(chatId: string, callback: (message: Message) => void) {
    if (!this.messageUpdateListeners.has(chatId)) {
      this.messageUpdateListeners.set(chatId, new Set());
    }
    this.messageUpdateListeners.get(chatId)!.add(callback);

    return () => {
      const listeners = this.messageUpdateListeners.get(chatId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.messageUpdateListeners.delete(chatId);
        }
      }
    };
  }

  notifyMessageUpdate(chatId: string, message: Message) {
    const listeners = this.messageUpdateListeners.get(chatId);
    if (listeners) {
      listeners.forEach(callback => callback(message));
    }
  }
}

const generationManager = new GenerationManager();

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentChatIdRef = useRef(chatId);

  useEffect(() => {
    currentChatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const chatMessages = getChatMessages(chatId);
      setMessages(chatMessages);
      setLoading(false);

      // Проверяем, есть ли незавершенные генерации
      const hasIncompleteMessage = chatMessages.some(m => m.isStreaming && !m.isComplete);
      setIsGenerating(hasIncompleteMessage);
    }, 300);

    // Подписываемся на обновления сообщений
    const unsubscribe = generationManager.subscribeToMessage(chatId, (updatedMessage) => {
      // Обновляем только если это текущий активный чат
      if (currentChatIdRef.current === chatId) {
        setMessages(prev => {
          const index = prev.findIndex(m => m.id === updatedMessage.id);
          if (index !== -1) {
            const newMessages = [...prev];
            newMessages[index] = updatedMessage;
            return newMessages;
          }
          return prev;
        });
        
        // Обновляем флаг генерации
        setIsGenerating(!updatedMessage.isComplete);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  const stopGeneration = useCallback(() => {
    const streamingMessage = messages.find(m => m.isStreaming && !m.isComplete);
    if (streamingMessage) {
      generationManager.stopGeneration(streamingMessage.id);
      
      // Помечаем сообщение как завершенное
      updateMessage(streamingMessage.id, {
        isStreaming: false,
        isComplete: true,
      });

      setIsGenerating(false);
      
      // Обновляем локальное состояние
      setMessages(prev => 
        prev.map(m => 
          m.id === streamingMessage.id 
            ? { ...m, isStreaming: false, isComplete: true }
            : m
        )
      );
    }
  }, [messages]);

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      if (!chatId) return;

      // Находим сообщение ассистента для регенерации
      const messageToRegenerate = messages.find(m => m.id === messageId);
      if (!messageToRegenerate || messageToRegenerate.role !== 'assistant') {
        return;
      }

      // Находим последнее сообщение пользователя перед этим сообщением ассистента
      const messageIndex = messages.findIndex(m => m.id === messageId);
      const previousMessages = messages.slice(0, messageIndex);
      const lastUserMessage = [...previousMessages].reverse().find(m => m.role === 'user');
      
      if (!lastUserMessage) {
        console.error('No user message found before assistant message');
        return;
      }

      // Очищаем содержимое сообщения и начинаем регенерацию
      const updatedMessage: Message = {
        ...messageToRegenerate,
        content: '',
        isStreaming: true,
        isComplete: false,
      };

      updateMessage(messageId, {
        content: '',
        isStreaming: true,
        isComplete: false,
      });

      setMessages(prev => 
        prev.map(m => m.id === messageId ? updatedMessage : m)
      );
      setIsGenerating(true);

      // Получаем историю сообщений до регенерируемого (не включая его)
      const history = previousMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Создаем AbortController для возможности отмены
      const abortController = new AbortController();
      generationManager.startGeneration(messageId, abortController);

      // Запускаем генерацию
      try {
        await timewebAI.generateStream({
          messages: history,
          signal: abortController.signal,
          onChunk: (chunk: string) => {
            // Обновляем содержимое сообщения
            updatedMessage.content += chunk;
            
            // Сохраняем в storage
            updateMessage(messageId, {
              content: updatedMessage.content,
            });

            // Уведомляем подписчиков
            generationManager.notifyMessageUpdate(chatId, { ...updatedMessage });
          },
          onComplete: (fullText: string) => {
            // Финализируем сообщение
            updateMessage(messageId, {
              content: fullText,
              isStreaming: false,
              isComplete: true,
            });

            generationManager.completeGeneration(messageId);

            const finalMessage = { ...updatedMessage, content: fullText, isStreaming: false, isComplete: true };
            generationManager.notifyMessageUpdate(chatId, finalMessage);
            setIsGenerating(false);
          },
          onError: (error: Error) => {
            console.error('Error regenerating response:', error);
            
            // Обновляем сообщение с ошибкой
            const errorContent = updatedMessage.content || 'Произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.';
            updateMessage(messageId, {
              content: errorContent,
              isStreaming: false,
              isComplete: true,
            });

            generationManager.completeGeneration(messageId);

            const errorMessage = { ...updatedMessage, content: errorContent, isStreaming: false, isComplete: true };
            generationManager.notifyMessageUpdate(chatId, errorMessage);
            setIsGenerating(false);
          },
        });
      } catch (error) {
        console.error('Unexpected error in regenerateMessage:', error);
      }
    },
    [chatId, messages]
  );

  const sendMessage = useCallback(
    async (content: string, targetChatId?: string) => {
      const messagesChatId = targetChatId || chatId;
      if (!messagesChatId) return;

      // Создаем сообщение пользователя
      const userMessage: Message = {
        id: 'msg-user-' + Date.now(),
        chatId: messagesChatId,
        role: 'user',
        content,
        timestamp: Date.now(),
        isComplete: true,
      };

      addMessage(userMessage);

      // Обновляем messages только если это текущий чат
      if (messagesChatId === chatId) {
        setMessages(prev => [...prev, userMessage]);
      }

      // Создаем пустое сообщение ассистента для streaming
      const aiMessageId = 'msg-ai-' + Date.now();
      const aiMessage: Message = {
        id: aiMessageId,
        chatId: messagesChatId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
        isComplete: false,
      };

      addMessage(aiMessage);

      if (messagesChatId === chatId) {
        setMessages(prev => [...prev, aiMessage]);
        setIsGenerating(true);
      }

      // Получаем историю сообщений для контекста
      const history = getChatMessages(messagesChatId);
      const aiMessages: AIMessage[] = history
        .filter(m => m.id !== aiMessageId) // Исключаем только что созданное пустое сообщение
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      // Создаем AbortController для возможности отмены
      const abortController = new AbortController();
      generationManager.startGeneration(aiMessageId, abortController);

      // Запускаем генерацию
      try {
        await timewebAI.generateStream({
          messages: aiMessages,
          signal: abortController.signal,
          onChunk: (chunk: string) => {
            // Обновляем содержимое сообщения
            aiMessage.content += chunk;
            
            // Сохраняем в storage
            updateMessage(aiMessageId, {
              content: aiMessage.content,
            });

            // Уведомляем подписчиков
            generationManager.notifyMessageUpdate(messagesChatId, { ...aiMessage });
          },
          onComplete: (fullText: string) => {
            // Финализируем сообщение
            updateMessage(aiMessageId, {
              content: fullText,
              isStreaming: false,
              isComplete: true,
            });

            generationManager.completeGeneration(aiMessageId);

            const finalMessage = { ...aiMessage, content: fullText, isStreaming: false, isComplete: true };
            generationManager.notifyMessageUpdate(messagesChatId, finalMessage);

            if (messagesChatId === chatId) {
              setIsGenerating(false);
            }
          },
          onError: (error: Error) => {
            console.error('Error generating response:', error);
            
            // Обновляем сообщение с ошибкой
            const errorContent = aiMessage.content || 'Произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.';
            updateMessage(aiMessageId, {
              content: errorContent,
              isStreaming: false,
              isComplete: true,
            });

            generationManager.completeGeneration(aiMessageId);

            const errorMessage = { ...aiMessage, content: errorContent, isStreaming: false, isComplete: true };
            generationManager.notifyMessageUpdate(messagesChatId, errorMessage);

            if (messagesChatId === chatId) {
              setIsGenerating(false);
            }
          },
        });
      } catch (error) {
        console.error('Unexpected error in sendMessage:', error);
      }
    },
    [chatId]
  );

  return {
    messages,
    loading,
    isGenerating,
    sendMessage,
    stopGeneration,
    regenerateMessage,
  };
}
