import { useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChatList } from '@/components/ChatList';
import { MessageList } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import { UserProfileWithMenu } from '@/components/UserProfileWithMenu';
import { AuthGuard } from '@/components/AuthGuard';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { getChatMessages } from '@/lib/storage';

function ChatPageContent() {
  const { isMobile, toggleSidebar, state } = useSidebar();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { chats, loading: chatsLoading, createChat, renameChat, removeChat, autoRenameChat } = useChats();
  const { messages, loading: messagesLoading, isGenerating, sendMessage, stopGeneration, regenerateMessage } = useMessages(selectedChatId);

  // Отслеживаем, был ли чат только что создан для автоматического переименования
  const [newChatId, setNewChatId] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем, если у нового чата появилось первое сообщение от пользователя
    if (newChatId) {
      const chatMessages = getChatMessages(newChatId);
      const hasUserMessage = chatMessages.some(m => m.role === 'user');
      
      if (hasUserMessage) {
        // Запускаем автоматическое переименование
        autoRenameChat(newChatId);
        setNewChatId(null);
      }
    }
  }, [messages, newChatId, autoRenameChat]);

  const handleCreateChat = (title: string) => {
    const newChat = createChat(title);
    setSelectedChatId(newChat.id);
    setNewChatId(newChat.id);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleDeleteChat = (chatId: string) => {
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
    removeChat(chatId);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) {
      // Создаем новый чат, если не выбран
      const newChat = createChat('Новый чат');
      setSelectedChatId(newChat.id);
      setNewChatId(newChat.id);
      // Отправляем сообщение сразу в новый чат
      sendMessage(content, newChat.id);
    } else {
      sendMessage(content);
    }
  };

  const handleStopGeneration = () => {
    stopGeneration();
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-2">
            <h1 className="text-xl font-bold">Skye</h1>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ChatList
            chats={chats}
            loading={chatsLoading}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            onCreateChat={handleCreateChat}
            onRenameChat={renameChat}
            onDeleteChat={handleDeleteChat}
          />
        </SidebarContent>
        <SidebarFooter>
          <UserProfileWithMenu />
        </SidebarFooter>
      </Sidebar>

      <main className="flex flex-1 flex-col max-w-2xl mx-auto relative">
        {!isMobile && state === 'collapsed' && (
          <div className="absolute left-0 top-4 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="bg-background border border-border shadow-sm hover:bg-accent"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Header для мобильных */}
        <div className="flex items-center gap-2 p-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          {messages.length > 0 && (
            <h2 className="text-lg font-semibold">
              {selectedChatId
                ? chats.find(c => c.id === selectedChatId)?.title || 'Чат'
                : 'Новый чат'}
            </h2>
          )}
        </div>

        {/* Desktop Header - только заголовок без кнопки */}
        <div className="hidden md:flex items-center p-3">
          {messages.length > 0 && (
            <h2 className="text-lg font-semibold">
              {selectedChatId
                ? chats.find(c => c.id === selectedChatId)?.title || 'Чат'
                : 'Новый чат'}
            </h2>
          )}
        </div>

        <MessageList 
          messages={messages} 
          loading={messagesLoading}
          showWelcomeMessage={messages.length === 0}
          onSendMessage={handleSendMessage}
          messagesLoading={messagesLoading}
          onRegenerateMessage={regenerateMessage}
        />

        {/* Когда есть сообщения - показываем поле ввода снизу */}
        {messages.length > 0 && (
          <MessageInput 
            onSend={handleSendMessage}
            onStop={handleStopGeneration}
            disabled={messagesLoading}
            hasMessages={true}
            isGenerating={isGenerating}
          />
        )}
      </main>
    </>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <ChatPageContent />
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
