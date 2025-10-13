import { useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChat = () => {
    const title = 'Новый чат';
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

  return (
    <div className="flex h-full flex-col p-3">
      {/* Кнопка создания нового чата */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={handleCreateChat}
          className="bg-brand hover:bg-brand/90"
        >
          <Plus/>
          Чат
        </Button>
          <Input
            type="search"
            placeholder="Поиск..."
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
            {searchQuery ? 'Чаты не найдены' : 'Нет чатов'}
          </div>
        ) : (
          filteredChats.map(chat => (
            <ContextMenu key={chat.id}>
              <ContextMenuTrigger>
                <div
                  className={cn(
                    'group relative flex items-center gap-2 rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors mb-2',
                    selectedChatId === chat.id && 'bg-accent'
                  )}
                  onClick={() => onSelectChat(chat.id)}
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
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleRename(chat.id, chat.title)}>
                  <Edit2 className="h-4 w-4" />
                  Переименовать
                </ContextMenuItem>
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => handleDeleteClick(chat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить чат?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Все сообщения в этом чате будут удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
