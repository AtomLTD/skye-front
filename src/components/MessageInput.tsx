import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  hasMessages?: boolean;
}

export function MessageInput({ onSend, disabled = false, hasMessages = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`bg-background p-4 ${hasMessages ? 'mt-auto' : 'p-0'}`}>
      <div className={`flex gap-2 mx-auto relative ${hasMessages ? 'max-w-4xl' : 'w-full max-w-4xl'}`}>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Введите сообщение..."
          disabled={disabled}
          className={`flex-1 resize-none ${hasMessages ? '' : 'min-h-[120px] text-lg'}`}
          rows={hasMessages ? 2 : 4}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className={`bg-brand text-white hover:bg-brand/90 shrink-0 absolute right-2 bottom-2`}
        >
          <Send className={`${hasMessages ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </Button>
      </div>
    </div>
  );
}
