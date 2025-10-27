import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { Chat } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarMenuSkeleton } from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { useIsTouchDevice } from '@/hooks/use-touch-device';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (title: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({
  chats,
  loading,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onRenameChat,
  onDeleteChat,
}: ChatListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [contextMenuChatId, setContextMenuChatId] = useState<string | null>(null);
  const isTouchDevice = useIsTouchDevice();
  const chatRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Закрытие меню при клике вне его области (для touch-устройств)
  useEffect(() => {
    if (!isTouchDevice || !contextMenuChatId) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Проверяем, что клик был не по меню и не по кнопке открытия меню
      const isMenuClick = target.closest('[data-touch-menu]');
      const isMenuButtonClick = target.closest('[data-menu-trigger]');
      
      if (!isMenuClick && !isMenuButtonClick) {
        setContextMenuChatId(null);
      }
    };

    // Небольшая задержка чтобы не конфликтовать с onClick кнопки
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTouchDevice, contextMenuChatId]);

  const handleCreateChat = () => {
    const title = t('chat.newChat');
    onCreateChat(title);
  };

  const handleRename = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = () => {
    if (editingChatId && editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
    }
    setShowDeleteDialog(false);
    setChatToDelete(null);
  };

  // Навигация клавиатурой
  const handleKeyDown = (e: React.KeyboardEvent, chatId: string, index: number) => {
    if (editingChatId) return; // Не обрабатываем, если идет редактирование

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = Math.min(index + 1, filteredChats.length - 1);
        const nextChat = filteredChats[nextIndex];
        if (nextChat) {
          chatRefs.current.get(nextChat.id)?.focus();
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        const prevChat = filteredChats[prevIndex];
        if (prevChat) {
          chatRefs.current.get(prevChat.id)?.focus();
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        onSelectChat(chatId);
        break;
      }
      case 'Delete':
      case 'Backspace': {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleDeleteClick(chatId);
        }
        break;
      }
      case 'F2': {
        e.preventDefault();
        handleRename(chatId, filteredChats[index].title);
        break;
      }
    }
  };

  const handleContextMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuChatId(chatId === contextMenuChatId ? null : chatId);
  };

  const handleChatClick = (chatId: string) => {
    // Не выбирать чат, если кликнули по кнопке меню или в режиме редактирования
    if (editingChatId === chatId) {
      return;
    }
    onSelectChat(chatId);
  };

  return (
    <div className="flex h-full flex-col p-3">
      {/* Кнопка создания нового чата */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={handleCreateChat}
          className="bg-brand text-white hover:bg-brand/90"
        >
          <Plus/>
          {t('chat.chat')}
        </Button>
          <Input
            type="search"
            placeholder={t('chat.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <SidebarMenuSkeleton key={i} />
            ))}
          </>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
            {searchQuery ? t('chat.notFound') : t('chat.noChats')}
          </div>
        ) : (
          filteredChats.map((chat, index) => (
            <div key={chat.id} className="relative">
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    ref={(el) => {
                      if (el) {
                        chatRefs.current.set(chat.id, el);
                      } else {
                        chatRefs.current.delete(chat.id);
                      }
                    }}
                    tabIndex={0}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors mb-2',
                      'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
                      selectedChatId === chat.id && 'bg-accent'
                    )}
                    onClick={() => handleChatClick(chat.id)}
                    onKeyDown={(e) => handleKeyDown(e, chat.id, index)}
                  >
                    <div className="flex-1 overflow-hidden">
                      {editingChatId === chat.id ? (
                        <Input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={handleSaveRename}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') setEditingChatId(null);
                          }}
                          className="h-6 px-2 text-sm"
                          autoFocus
                        />
                      ) : (
                        <>
                          <div className="font-medium text-sm truncate">{chat.title}</div>
                          {chat.lastMessage && (
                            <div className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Кнопка с тремя точками для touch-устройств */}
                    {isTouchDevice && editingChatId !== chat.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        data-menu-trigger
                        className="h-7 w-7 p-0 flex-shrink-0 relative z-10"
                        onClick={(e) => handleContextMenuClick(e, chat.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </ContextMenuTrigger>
                {!isTouchDevice && (
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleRename(chat.id, chat.title)}>
                      <Edit2 className="h-4 w-4" />
                      {t('chat.rename')}
                    </ContextMenuItem>
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteClick(chat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('chat.delete')}
                    </ContextMenuItem>
                  </ContextMenuContent>
                )}
              </ContextMenu>
              
              {/* Меню для touch-устройств */}
              {isTouchDevice && contextMenuChatId === chat.id && editingChatId !== chat.id && (
                <div 
                  data-touch-menu
                  className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg z-20 min-w-[180px]"
                >
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleRename(chat.id, chat.title);
                        setContextMenuChatId(null);
                      }}
                      className="w-full justify-start"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {t('chat.rename')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleDeleteClick(chat.id);
                        setContextMenuChatId(null);
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('chat.delete')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('chat.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('chat.deleteDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('chat.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t('chat.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
