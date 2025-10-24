import { useState, useEffect } from 'react';
import { Key, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { timewebAI } from '@/lib/timeweb-ai';

export function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existingKey = timewebAI.getApiKey();
    if (existingKey) {
      setApiKey(existingKey);
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      timewebAI.setApiKey(apiKey.trim());
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaved(false);
  };

  const isConfigured = !!timewebAI.getApiKey();

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4" />
        <h3 className="font-medium">Timeweb Cloud API</h3>
        {isConfigured && !isEditing && (
          <span className="ml-auto text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Настроено
          </span>
        )}
      </div>

      {!isConfigured && !isEditing && (
        <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 dark:text-yellow-300">
              API ключ не настроен. Получите ключ на{' '}
              <a
                href="https://agent.timeweb.cloud/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                agent.timeweb.cloud
              </a>
            </p>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Введите API ключ..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" disabled={!apiKey.trim()}>
              Сохранить
            </Button>
            {isConfigured && (
              <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                Отмена
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Ключ сохраняется локально в браузере
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="password"
              value={apiKey}
              disabled
              className="font-mono text-sm flex-1"
            />
            <Button onClick={handleEdit} size="sm" variant="outline">
              Изменить
            </Button>
          </div>
          {saved && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check className="h-3 w-3" />
              API ключ сохранен
            </p>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <a
          href="https://agent.timeweb.cloud/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Документация API
        </a>
      </div>
    </div>
  );
}

