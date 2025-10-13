import { Chat, Message, User } from '@/types';

const STORAGE_KEYS = {
  USER: 'skye-user',
  CHATS: 'skye-chats',
  MESSAGES: 'skye-messages',
} as const;

// User storage
export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const removeUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
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
