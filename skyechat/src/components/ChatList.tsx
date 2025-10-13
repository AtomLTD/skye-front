import { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit2 } from 'lucide-react';
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
  const [showMenu, setShowMenu] = useState<string | null>(null);

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
    setShowMenu(null);
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
    setShowMenu(null);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
    }
    setShowDeleteDialog(false);
    setChatToDelete(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Кнопка создания нового чата */}
      <div className="p-3">
        <Button
          onClick={handleCreateChat}
          className="w-full bg-orange-500 hover:bg-orange-600"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Новый чат
        </Button>
      </div>

      {/* Поиск */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
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
            <div
              key={chat.id}
              className={cn(
                'group relative flex items-center gap-2 rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors',
                selectedChatId === chat.id && 'bg-accent'
              )}
            >
              <div
                className="flex-1 overflow-hidden"
                onClick={() => onSelectChat(chat.id)}
              >
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

              {editingChatId !== chat.id && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => {
                      e.stopPropagation();
                      setShowMenu(showMenu === chat.id ? null : chat.id);
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {showMenu === chat.id && (
                    <div className="absolute right-0 top-8 z-50 min-w-[140px] rounded-md border bg-popover p-1 shadow-md">
                      <button
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                        onClick={() => handleRename(chat.id, chat.title)}
                      >
                        <Edit2 className="h-4 w-4" />
                        Переименовать
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                        onClick={() => handleDeleteClick(chat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </button>
                    </div>
                  )}
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
