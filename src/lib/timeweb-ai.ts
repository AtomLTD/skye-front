// Timeweb Cloud AI Agent Integration
// Документация: https://agent.timeweb.cloud/docs

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface GenerateOptions {
  messages: AIMessage[];
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export interface GenerateTitleOptions {
  firstMessage: string;
  signal?: AbortSignal;
}

class TimewebAIService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // Получаем API ключ (agent_access_id) из переменных окружения или localStorage
    this.apiKey = import.meta.env.VITE_TIMEWEB_API_KEY || localStorage.getItem('timeweb-api-key') || '';
    this.baseURL = import.meta.env.VITE_TIMEWEB_API_URL || 'https://agent.timeweb.cloud';
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('timeweb-api-key', key);
  }

  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Генерация ответа с поддержкой streaming
   */
  async generateStream(options: GenerateOptions): Promise<string> {
    const { messages, onChunk, onComplete, onError, signal } = options;

    if (!this.apiKey) {
      const error = new Error('API ключ Timeweb Cloud не установлен');
      onError?.(error);
      throw error;
    }

    let fullText = '';

    try {
      const requestBody = {
        messages: messages,
        stream: true,
        temperature: 1,
        max_completion_tokens: 4000,
      };

      console.log('Streaming request:', { url: `${this.baseURL}/api/v1/cloud-ai/agents/${this.apiKey}/v1/chat/completions`, body: requestBody });

      const response = await fetch(`${this.baseURL}/api/v1/cloud-ai/agents/${this.apiKey}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Streaming error:', response.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText || '{}');
        } catch (e) {
          errorData = { error: 'Unknown error' };
        }
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Не удалось получить reader из response');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const data = JSON.parse(jsonStr);

              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                onChunk?.(content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, trimmedLine);
            }
          }
        }
      }

      onComplete?.(fullText);
      return fullText;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return fullText; // Возвращаем то, что успели получить
        }
        onError?.(error);
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Генерация короткого названия чата (2-5 слов) на основе первого сообщения
   */
  async generateChatTitle(options: GenerateTitleOptions): Promise<string> {
    const { firstMessage, signal } = options;

    if (!this.apiKey) {
      // Fallback: используем первые слова сообщения
      return firstMessage.slice(0, 50).split(' ').slice(0, 5).join(' ') + (firstMessage.length > 50 ? '...' : '');
    }

    try {
      const requestBody = {
        messages: [
          {
            role: 'user',
            content: `Создай короткое название (2-5 слов) для чата на основе этого сообщения: "${firstMessage}". Ответь ТОЛЬКО названием, без кавычек.`,
          },
        ],
        stream: false,
        temperature: 1,
        max_completion_tokens: 20,
      };

      console.log('Generating chat title with request:', requestBody);

      const response = await fetch(`${this.baseURL}/api/v1/cloud-ai/agents/${this.apiKey}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat title generation error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Chat title response:', data);
      const title = data.choices?.[0]?.message?.content?.trim();
      
      if (title) {
        // Убираем кавычки если есть и ограничиваем длину
        return title.replace(/['"]/g, '').slice(0, 60);
      }

      // Fallback
      return firstMessage.slice(0, 50).split(' ').slice(0, 5).join(' ') + (firstMessage.length > 50 ? '...' : '');
    } catch (error) {
      console.error('Error generating chat title:', error);
      // Fallback: используем первые слова сообщения
      return firstMessage.slice(0, 50).split(' ').slice(0, 5).join(' ') + (firstMessage.length > 50 ? '...' : '');
    }
  }
}

export const timewebAI = new TimewebAIService();

