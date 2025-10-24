import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MessageInput } from './MessageInput';
import { Message } from './Message';

interface MessageListProps {
  messages: MessageType[];
  loading: boolean;
  showWelcomeMessage?: boolean;
  onSendMessage?: (message: string) => void;
  messagesLoading?: boolean;
  onRegenerateMessage?: (messageId: string) => void;
}

export function MessageList({ messages, loading, showWelcomeMessage = true, onSendMessage, messagesLoading, onRegenerateMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
            <div className="max-w-[70%] space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0 && showWelcomeMessage) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center space-y-6 w-full max-w-2xl">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Привет!</h3>
            <p className="text-muted-foreground">
              Начните диалог, отправив сообщение ниже
            </p>
          </div>
          {onSendMessage && (
              <MessageInput 
                onSend={onSendMessage} 
                disabled={messagesLoading || false}
                hasMessages={false}
              />
          )}
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !showWelcomeMessage) {
    return <div className="flex-1" />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <Message
          key={message.id}
          message={message}
          onRegenerate={onRegenerateMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
