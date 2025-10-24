import { useState } from 'react';
import { Menu } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
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
  const { isMobile, toggleSidebar } = useSidebar();
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
          <div className="flex items-center gap-2 px-2">
            <h1 className="text-xl font-bold">Skye</h1>
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

      <main className="flex flex-1 flex-col max-w-2xl mx-auto">
        {/* Header для мобильных */}
        <div className="flex items-center gap-2 p-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {selectedChatId
              ? chats.find(c => c.id === selectedChatId)?.title || 'Чат'
              : 'Новый чат'}
          </h2>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">
            {selectedChatId
              ? chats.find(c => c.id === selectedChatId)?.title || 'Чат'
              : 'Новый чат'}
          </h2>
        </div>

        <MessageList messages={messages} loading={messagesLoading} />
        <MessageInput onSend={handleSendMessage} disabled={messagesLoading} />
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
