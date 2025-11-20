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

  const [newChatId, setNewChatId] = useState<string | null>(null);

  useEffect(() => {
    if (newChatId) {
      const chatMessages = getChatMessages(newChatId);
      const hasUserMessage = chatMessages.some(m => m.role === 'user');
      
      if (hasUserMessage) {
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
      const newChat = createChat(t('chat.newChat'));
      setSelectedChatId(newChat.id);
      setNewChatId(newChat.id);
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
      
      <Sidebar variant="inset" className="border-r border-border/40 bg-sidebar/50 backdrop-blur-xl">
        <SidebarHeader className="pb-4 pt-6 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">{t('app.name')}</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
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
        <SidebarFooter className="p-4 pb-6">
          <UserProfileWithMenu />
        </SidebarFooter>
      </Sidebar>

      <main className="flex flex-1 flex-col relative bg-background w-full h-full overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="flex items-center gap-4 p-4 h-16 border-b border-border/40 bg-background/80 backdrop-blur-sm z-10 sticky top-0 w-full">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-accent/50">
            <PanelLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <h2 className="text-lg font-heading font-semibold truncate text-foreground/90">
            {selectedChatId
              ? chats.find(c => c.id === selectedChatId)?.title || t('chat.title')
              : t('chat.newChat')}
          </h2>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto h-[calc(100vh-4rem)] relative">
          <div className="flex-1 overflow-hidden flex flex-col relative">
             <MessageList 
                messages={messages} 
                loading={messagesLoading}
                showWelcomeMessage={messages.length === 0}
                onRegenerateMessage={regenerateMessage}
              />
          </div>

          {/* Input Area */}
          <div className="w-full p-4 pb-6 md:pb-8">
             <MessageInput 
                onSend={handleSendMessage}
                onStop={handleStopGeneration}
                disabled={messagesLoading}
                hasMessages={messages.length > 0}
                isGenerating={isGenerating}
              />
          </div>
        </div>
      </main>
    </>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
          <ChatPageContent />
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
