import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';

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
    <div className={`bg-background p-4 ${hasMessages ? 'mt-auto' : 'p-0'}`}>
      <div className={`flex gap-2 mx-auto relative ${hasMessages ? 'max-w-4xl' : 'w-full max-w-4xl'}`}>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isGenerating ? t('chat.input.generating') : t('chat.input.placeholder')}
          disabled={disabled || isGenerating}
          className={`flex-1 resize-none ${hasMessages ? '' : 'min-h-[120px] text-lg'}`}
          rows={hasMessages ? 2 : 4}
        />
        {isGenerating ? (
          <Button
            onClick={handleStop}
            size="icon"
            variant="destructive"
            className="shrink-0 absolute right-2 bottom-2"
            title={t('chat.input.stopGeneration')}
          >
            <Square className={`${hasMessages ? 'h-4 w-4' : 'h-5 w-5'}`} fill="currentColor" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className={`bg-brand text-white hover:bg-brand/90 shrink-0 absolute right-2 bottom-2`}
          >
            <Send className={`${hasMessages ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
