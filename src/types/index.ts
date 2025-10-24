export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: number;
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
