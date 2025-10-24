import { useState } from 'react';
import { Menu, PanelLeft } from 'lucide-react';
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
import { SidebarSettings } from '@/components/SidebarSettings';
import { UserProfile } from '@/components/UserProfile';
import { AuthGuard } from '@/components/AuthGuard';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';

function ChatPageContent() {
  const { isMobile, toggleSidebar, state } = useSidebar();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { chats, loading: chatsLoading, createChat, renameChat, removeChat } = useChats();
  const { messages, loading: messagesLoading, sendMessage } = useMessages(selectedChatId);

  const handleCreateChat = (title: string) => {
    const newChat = createChat(title);
    setSelectedChatId(newChat.id);
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
      // Отправляем сообщение сразу в новый чат
      sendMessage(content, newChat.id);
    } else {
      sendMessage(content);
    }
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
          <UserProfile />
          <SidebarSettings />
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
        <div className="flex items-center gap-2 p-3 md:hidden bg-zinc-50 dark:bg-zinc-900 rounded-lg mx-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {selectedChatId
              ? chats.find(c => c.id === selectedChatId)?.title || 'Чат'
              : 'Новый чат'}
          </h2>
        </div>

        {/* Desktop Header - только заголовок без кнопки */}
        <div className="hidden md:flex items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg mx-2">
          <h2 className="text-lg font-semibold">
            {selectedChatId
              ? chats.find(c => c.id === selectedChatId)?.title || 'Чат'
              : 'Новый чат'}
          </h2>
        </div>

        <MessageList 
          messages={messages} 
          loading={messagesLoading}
          showWelcomeMessage={messages.length === 0}
          onSendMessage={handleSendMessage}
          messagesLoading={messagesLoading}
        />

        {/* Когда есть сообщения - показываем поле ввода снизу */}
        {messages.length > 0 && (
          <MessageInput 
            onSend={handleSendMessage} 
            disabled={messagesLoading}
            hasMessages={true}
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
