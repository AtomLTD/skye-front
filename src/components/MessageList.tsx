import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Message as MessageType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Message } from './Message';
import { Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  loading: boolean;
  showWelcomeMessage?: boolean;
  onRegenerateMessage?: (messageId: string) => void;
}

export function MessageList({ messages, loading, showWelcomeMessage = true, onRegenerateMessage }: MessageListProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 space-y-8 max-w-4xl mx-auto w-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={cn('flex gap-4', i % 2 === 0 ? 'flex-row-reverse' : 'flex-row')}>
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className={cn("space-y-2 max-w-[70%]", i % 2 === 0 ? "items-end flex flex-col" : "")}>
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0 && showWelcomeMessage) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-8 w-full max-w-2xl relative">
           {/* Decorative background blob */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/5 rounded-full blur-3xl -z-10" />
           
           <div className="space-y-4">
             <div className="w-16 h-16 bg-gradient-to-br from-brand to-accent rounded-2xl mx-auto flex items-center justify-center shadow-xl rotate-3 hover:rotate-6 transition-transform duration-300">
               <Sparkles className="h-8 w-8 text-white" />
             </div>
             <h3 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
               {t('chat.welcome.title')}
             </h3>
             <p className="text-lg text-muted-foreground max-w-md mx-auto font-light leading-relaxed">
               {t('chat.welcome.description')}
             </p>
           </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !showWelcomeMessage) {
    return <div className="flex-1" />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-0">
       <div className="max-w-4xl mx-auto space-y-6 pb-4 md:pb-8 pt-4">
        {messages.map(message => (
          <Message
            key={message.id}
            message={message}
            onRegenerate={onRegenerateMessage}
          />
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}
