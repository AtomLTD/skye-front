import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Onboarding } from '@/components/Onboarding';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { useOnboarding } from '@/hooks/useOnboarding';
import { getChatMessages } from '@/lib/storage';

function ChatPageContent() {
  const { t } = useTranslation();
  const { isMobile, toggleSidebar } = useSidebar();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { chats, loading: chatsLoading, createChat, renameChat, removeChat, autoRenameChat } = useChats();
  const { messages, loading: messagesLoading, isGenerating, sendMessage, stopGeneration, regenerateMessage } = useMessages(selectedChatId);
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

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
      const newChat = createChat(t('chat.newChat'));
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
      {showOnboarding && (
        <Onboarding 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      )}
      
      <Sidebar variant='floating'>
        <SidebarHeader>
          <div className="flex items-center justify-between px-2">
            <h1 className="text-xl font-bold">{t('app.name')}</h1>
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
        {/* Единый хедер для всех устройств */}
        <div className="flex items-center gap-2 p-3">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          {messages.length > 0 && (
            <h2 className="text-lg font-semibold">
              {selectedChatId
                ? chats.find(c => c.id === selectedChatId)?.title || t('chat.title')
                : t('chat.newChat')}
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
