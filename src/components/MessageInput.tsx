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
      <div className="flex gap-2 max-w-4xl mx-auto relative">
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Введите сообщение..."
          disabled={disabled}
          className="flex-1 resize-none"
          rows={2}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="bg-brand hover:bg-brand/90 shrink-0 absolute right-2 bottom-2"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
