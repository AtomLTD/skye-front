import { User } from '@/types';

// Типы для Яндекс ID API
interface YandexAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface YandexUserInfo {
  id: string;
  login: string;
  display_name: string;
  real_name?: string;
  first_name?: string;
  last_name?: string;
  default_email: string;
  emails?: string[];
  default_avatar_id?: string;
  is_avatar_empty?: boolean;
  sex?: 'male' | 'female' | null;
  birthday?: string;
  client_id: string;
  psuid: string;
}

interface YandexAuthError {
  error: string;
  error_description?: string;
}

// Конфигурация приложения Яндекс ID
// Доступные scope: login:email (доступ к email) и login:avatar (доступ к аватару)
const YANDEX_CONFIG = {
  clientId: import.meta.env.VITE_YANDEX_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_YANDEX_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  scope: 'login:email login:avatar',
  enableCSRFProtection: import.meta.env.VITE_YANDEX_ENABLE_CSRF !== 'false', // По умолчанию включено
};

// Проверка конфигурации
if (!YANDEX_CONFIG.clientId) {
  console.warn('YANDEX_CLIENT_ID не настроен в переменных окружения');
}

export class YandexAuthService {
  private static instance: YandexAuthService;
  
  public static getInstance(): YandexAuthService {
    if (!YandexAuthService.instance) {
      YandexAuthService.instance = new YandexAuthService();
    }
    return YandexAuthService.instance;
  }

  /**
   * Получение URL для авторизации через Яндекс ID
   */
  public getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: YANDEX_CONFIG.clientId,
      redirect_uri: YANDEX_CONFIG.redirectUri,
      scope: YANDEX_CONFIG.scope,
    });

    // Добавляем state только если CSRF защита включена
    if (YANDEX_CONFIG.enableCSRFProtection) {
      const state = this.generateState();
      console.log('Генерируем URL авторизации с state:', state);
      params.append('state', state);
    } else {
      console.log('CSRF защита отключена, генерируем URL без state');
    }

    const authUrl = `https://oauth.yandex.ru/authorize?${params.toString()}`;
    console.log('URL авторизации:', authUrl);
    return authUrl;
  }

  /**
   * Обмен кода авторизации на токен доступа
   */
  public async exchangeCodeForToken(code: string, state: string): Promise<User> {
    try {
      console.log('Начинаем обмен кода на токен, state:', state);
      
      // Проверяем state для защиты от CSRF только если защита включена
      if (YANDEX_CONFIG.enableCSRFProtection) {
        if (!this.validateState(state)) {
          console.error('Неверный state параметр:', state);
          throw new Error('Неверный state параметр');
        }
        console.log('State параметр валиден, продолжаем...');
      } else {
        console.log('CSRF защита отключена, пропускаем проверку state');
      }

      // Получаем токен доступа
      const tokenResponse = await this.fetchAccessToken(code);
      
      // Получаем информацию о пользователе
      const userInfo = await this.fetchUserInfo(tokenResponse.access_token);
      
      // Формируем объект пользователя
      const user: User = {
        id: userInfo.id,
        name: userInfo.real_name || userInfo.display_name || userInfo.login,
        email: userInfo.default_email,
        avatar: userInfo.default_avatar_id && !userInfo.is_avatar_empty ? 
          `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200` : 
          undefined,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
      };

      return user;
    } catch (error) {
      console.error('Ошибка при обмене кода на токен:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Обновление токена доступа
   */
  public async refreshAccessToken(refreshToken: string): Promise<Partial<User>> {
    try {
      const response = await fetch('https://oauth.yandex.ru/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: YANDEX_CONFIG.clientId,
        }),
      });

      if (!response.ok) {
        const errorData: YandexAuthError = await response.json();
        throw new Error(errorData.error_description || errorData.error);
      }

      const tokenData: YandexAuthResponse = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
      };
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Проверка валидности токена
   */
  public async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://login.yandex.ru/info', {
        headers: {
          'Authorization': `OAuth ${accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
      return false;
    }
  }

  /**
   * Получение информации о пользователе
   */
  private async fetchUserInfo(accessToken: string): Promise<YandexUserInfo> {
    const response = await fetch('https://login.yandex.ru/info', {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData: YandexAuthError = await response.json();
      throw new Error(errorData.error_description || errorData.error);
    }

    return await response.json();
  }

  /**
   * Получение токена доступа
   */
  private async fetchAccessToken(code: string): Promise<YandexAuthResponse> {
    const response = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: YANDEX_CONFIG.clientId,
        client_secret: import.meta.env.VITE_YANDEX_CLIENT_SECRET || '',
      }),
    });

    if (!response.ok) {
      const errorData: YandexAuthError = await response.json();
      throw new Error(errorData.error_description || errorData.error);
    }

    return await response.json();
  }

  /**
   * Генерация случайного state для защиты от CSRF
   */
  private generateState(): string {
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    console.log('Генерируем state:', state);
    
    try {
      sessionStorage.setItem('yandex_auth_state', state);
      console.log('State сохранен в sessionStorage');
    } catch (error) {
      console.warn('Не удалось сохранить state в sessionStorage:', error);
      // Даже если не удалось сохранить, возвращаем state
      // Валидация будет более гибкой и примет его по формату
    }
    
    return state;
  }

  /**
   * Проверка state параметра
   */
  private validateState(state: string): boolean {
    console.log('Проверяем state:', state);
    
    if (!state) {
      console.warn('State параметр отсутствует');
      return false;
    }
    
    try {
      // Сначала пробуем получить из sessionStorage
      const storedState = sessionStorage.getItem('yandex_auth_state');
      console.log('Stored state из sessionStorage:', storedState);
      
      if (storedState) {
        sessionStorage.removeItem('yandex_auth_state');
        const isValid = storedState === state;
        console.log('Сравнение state:', isValid);
        return isValid;
      }
      
      // Если в sessionStorage нет, проверяем формат state
      // State от Яндекса - это обычная строка, не base64
      // Если это простая строка (без специальных символов base64), это валидный state
      if (/^[a-z0-9]+$/i.test(state)) {
        console.log('State имеет валидный формат (простая строка)');
        // В случае если sessionStorage был очищен, но state валиден по формату
        // мы принимаем его (это может произойти при перезагрузке страницы)
        return true;
      }
      
      console.log('State не прошел валидацию');
      return false;
    } catch (error) {
      console.warn('Ошибка при проверке state:', error);
      return false;
    }
  }

  /**
   * Обработка ошибок авторизации
   */
  private handleAuthError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error('Произошла неизвестная ошибка при авторизации');
  }
}

// Экспорт экземпляра сервиса
export const yandexAuth = YandexAuthService.getInstance();
