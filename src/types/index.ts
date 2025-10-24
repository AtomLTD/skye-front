export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean; // Флаг для сообщений в процессе генерации
  isComplete?: boolean; // Флаг завершенности генерации
}

export interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: number;
  isGeneratingTitle?: boolean; // Флаг генерации названия
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}
