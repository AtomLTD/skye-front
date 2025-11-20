import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Square, Paperclip } from 'lucide-react'; // Added extra icons for "modern" look visualization
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  hasMessages?: boolean;
  isGenerating?: boolean;
}

export function MessageInput({ 
  onSend, 
  onStop,
  disabled = false, 
  hasMessages = false,
  isGenerating = false,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled && !isGenerating) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleStop = () => {
    if (onStop && isGenerating) {
      onStop();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating) {
        handleStop();
      } else {
        handleSend();
      }
    }
  };

  return (
    <div className={cn(
      "mx-auto transition-all duration-500 ease-out",
      hasMessages ? "w-full max-w-3xl" : "w-full max-w-2xl"
    )}>
      <div className="relative group">
        <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-brand/10 to-accent/20 rounded-3xl blur-xl transition-opacity duration-500",
             isGenerating ? "opacity-100" : "opacity-0 group-hover:opacity-50"
        )} />
        
        <div className="relative bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-[2rem] p-2 flex items-end gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring/50">
          {/* Decorative / Future Functional Buttons */}
          <div className="hidden sm:flex pb-2 pl-2 gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent" disabled>
                <Paperclip className="h-4 w-4" />
             </Button>
          </div>

          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isGenerating ? t('chat.input.generating') : t('chat.input.placeholder')}
            disabled={disabled || isGenerating}
            className={cn(
              "flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent py-3 px-2 min-h-[50px] max-h-[200px]",
              hasMessages ? "text-base" : "text-lg"
            )}
            rows={1}
            style={{ height: 'auto', minHeight: '50px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
          />
          
          <div className="pb-1 pr-1 flex gap-2">
             {isGenerating ? (
              <Button
                onClick={handleStop}
                size="icon"
                variant="destructive"
                className="h-10 w-10 rounded-full shadow-sm transition-all duration-200 hover:scale-105"
                title={t('chat.input.stopGeneration')}
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full shadow-md transition-all duration-200",
                   message.trim() ? "bg-brand text-white hover:bg-brand/90 hover:scale-105" : "bg-muted text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {!hasMessages && (
         <div className="mt-6 flex justify-center gap-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-forwards">
            {/* Quick Action Chips (Visual only for now, could be functional) */}
            {['Creative', 'Precise', 'Balanced'].map((mode) => (
               <div key={mode} className="text-xs font-medium px-3 py-1 rounded-full bg-accent/50 text-muted-foreground border border-border/50 cursor-pointer hover:bg-accent hover:text-foreground transition-colors">
                  {mode}
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
