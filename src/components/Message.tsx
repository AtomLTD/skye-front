import { useState } from 'react';
import { Message as MessageType } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, Check } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  onRegenerate?: (messageId: string) => void;
}

export function Message({ message, onRegenerate }: MessageProps) {
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <div
      className={cn(
        'flex group',
        isUserMessage ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="flex flex-col max-w-[70%]">
        <div
          className={cn(
            'rounded-3xl py-3 px-4 relative',
            isUserMessage
              ? ''
              : 'bg-muted'
          )}
          style={
            isUserMessage
              ? {
                  backgroundColor: 'var(--brand-message)',
                  color: 'var(--brand-message-text)',
                }
              : undefined
          }
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && !message.isComplete && (
              <span className="inline-block ml-1 w-1 h-4 bg-current animate-pulse" />
            )}
          </div>
          {message.isStreaming && !message.isComplete && (
            <div className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
              Генерация...
            </div>
          )}
        </div>
        
        {/* Action buttons container - всегда занимает место */}
        <div 
          className={cn(
            'flex gap-1 mt-2 h-7 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none',
            isUserMessage ? 'justify-end' : 'justify-start'
          )}
        >
          {!message.isStreaming && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Копировать
                  </>
                )}
              </Button>
              {canRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Регенерировать
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

