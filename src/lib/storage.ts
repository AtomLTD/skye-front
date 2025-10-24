import { Chat, Message, User } from '@/types';

const STORAGE_KEYS = {
  USER: 'skye-user',
  CHATS: 'skye-chats',
  MESSAGES: 'skye-messages',
  TOKENS: 'skye-tokens',
} as const;

// Безопасное хранение токенов
interface TokenStorage {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// User storage
export const saveUser = (user: User): void => {
  // Сохраняем пользователя без токенов в основном хранилище
  const { accessToken, refreshToken, expiresAt, ...userData } = user;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  
  // Токены сохраняем отдельно для безопасности
  if (accessToken) {
    const tokenData: TokenStorage = {
      accessToken,
      refreshToken,
      expiresAt: expiresAt || 0,
    };
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokenData));
  }
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  const tokenData = localStorage.getItem(STORAGE_KEYS.TOKENS);
  
  if (!userData) return null;
  
  const user = JSON.parse(userData);
  
  if (tokenData) {
    const tokens = JSON.parse(tokenData);
    return {
      ...user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    };
  }
  
  return user;
};

export const removeUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
};

// Проверка валидности токена
export const isTokenValid = (user: User): boolean => {
  if (!user.expiresAt) return false;
  return Date.now() < user.expiresAt;
};

// Обновление токенов
export const updateUserTokens = (accessToken: string, refreshToken?: string, expiresAt?: number): void => {
  const tokenData: TokenStorage = {
    accessToken,
    refreshToken,
    expiresAt: expiresAt || 0,
  };
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokenData));
};

// Chats storage
export const saveChats = (chats: Chat[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
};

export const getChats = (): Chat[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHATS);
  return data ? JSON.parse(data) : [];
};

export const addChat = (chat: Chat): void => {
  const chats = getChats();
  chats.unshift(chat);
  saveChats(chats);
};

export const updateChat = (chatId: string, updates: Partial<Chat>): void => {
  const chats = getChats();
  const index = chats.findIndex(c => c.id === chatId);
  if (index !== -1) {
    chats[index] = { ...chats[index], ...updates };
    saveChats(chats);
  }
};

export const deleteChat = (chatId: string): void => {
  const chats = getChats().filter(c => c.id !== chatId);
  saveChats(chats);

  // Also delete all messages for this chat
  const messages = getMessages().filter(m => m.chatId !== chatId);
  saveMessages(messages);
};

// Messages storage
export const saveMessages = (messages: Message[]): void => {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

export const getMessages = (): Message[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
};

export const getChatMessages = (chatId: string): Message[] => {
  return getMessages().filter(m => m.chatId === chatId);
};

export const addMessage = (message: Message): void => {
  const messages = getMessages();
  messages.push(message);
  saveMessages(messages);

  // Update chat's last message
  updateChat(message.chatId, {
    lastMessage: message.content,
    timestamp: message.timestamp,
  });
};

export const updateMessage = (messageId: string, updates: Partial<Message>): void => {
  const messages = getMessages();
  const index = messages.findIndex(m => m.id === messageId);
  if (index !== -1) {
    messages[index] = { ...messages[index], ...updates };
    saveMessages(messages);

    // Update chat's last message if this is the latest message
    const message = messages[index];
    const chatMessages = messages.filter(m => m.chatId === message.chatId);
    const latestMessage = chatMessages[chatMessages.length - 1];
    if (latestMessage.id === messageId) {
      updateChat(message.chatId, {
        lastMessage: message.content,
        timestamp: message.timestamp,
      });
    }
  }
};

export const getMessage = (messageId: string): Message | undefined => {
  return getMessages().find(m => m.id === messageId);
};
