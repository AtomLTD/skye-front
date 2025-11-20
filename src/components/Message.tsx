import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Message as MessageType } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, Check, Sparkles, Bot } from 'lucide-react';
import { useIsTouchDevice } from '@/hooks/use-touch-device';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface MessageProps {
  message: MessageType;
  onRegenerate?: (messageId: string) => void;
}

export function Message({ message, onRegenerate }: MessageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && !message.isStreaming) {
      onRegenerate(message.id);
    }
  };

  const isUserMessage = message.role === 'user';
  const canRegenerate = !isUserMessage && !message.isStreaming && message.isComplete;
  
  // Initial for user avatar
  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <div
      className={cn(
        'group w-full flex gap-4 py-4 px-2 md:px-4 transition-colors',
        isUserMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <Avatar className={cn("h-8 w-8 md:h-10 md:w-10 shadow-sm border border-border/50", isUserMessage ? "ring-2 ring-brand/10" : "bg-brand/5")}>
          {isUserMessage ? (
            <>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-brand/10 text-brand-foreground font-medium">{userInitials}</AvatarFallback>
            </>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-brand to-brand/80 text-white">
              <Bot className="h-5 w-5 md:h-6 md:w-6" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[75%] lg:max-w-[70%]",
        isUserMessage ? "items-end" : "items-start"
      )}>
        {/* Name & Time (Optional, skipping time for now as not in props) */}
        <div className={cn("text-xs text-muted-foreground mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity", isUserMessage ? "text-right" : "text-left")}>
          {isUserMessage ? user?.name || 'You' : 'Atom AI'}
        </div>

        <div
          className={cn(
            'relative rounded-2xl md:rounded-3xl px-5 py-3.5 shadow-sm text-sm md:text-base leading-relaxed',
            isUserMessage
              ? 'bg-brand text-white rounded-tr-sm' // User message style
              : 'bg-white dark:bg-secondary border border-border/50 rounded-tl-sm' // Bot message style
          )}
        >
          <div className="whitespace-pre-wrap break-words font-sans">
            {message.content}
            {message.isStreaming && !message.isComplete && (
              <span className="inline-block ml-1 w-1.5 h-4 bg-current animate-pulse rounded-full align-middle" />
            )}
          </div>
        </div>

        {/* Actions */}
        <div 
          className={cn(
            'flex gap-2 mt-2 h-8 items-center px-1 transition-all duration-200',
             isUserMessage ? 'justify-end' : 'justify-start',
             (isTouchDevice || message.isStreaming) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
           {message.isStreaming && !message.isComplete ? (
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <Sparkles className="h-3 w-3 animate-spin" />
               {t('chat.message.generating')}
             </div>
           ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
                onClick={handleCopy}
              >
                {isCopied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                {isCopied ? t('chat.message.copied') : t('chat.message.copy')}
              </Button>
              
              {canRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  {t('chat.message.regenerate')}
                </Button>
              )}
            </>
           )}
        </div>
      </div>
    </div>
  );
}
