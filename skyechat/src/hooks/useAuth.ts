import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { yandexAuth } from '@/lib/yandex-auth';
import { saveUser, getUser, removeUser, isTokenValid, updateUserTokens } from '@/lib/storage';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  const navigate = useNavigate();

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getUser();
        
        if (!user) {
          setAuthState({ user: null, loading: false, error: null });
          return;
        }

        // Проверяем валидность токена
        if (!isTokenValid(user)) {
          // Пытаемся обновить токен
          if (user.refreshToken) {
            try {
              const updatedTokens = await yandexAuth.refreshAccessToken(user.refreshToken);
              updateUserTokens(
                updatedTokens.accessToken!,
                updatedTokens.refreshToken,
                updatedTokens.expiresAt
              );
              
              setAuthState({
                user: { ...user, ...updatedTokens },
                loading: false,
                error: null,
              });
            } catch (refreshError) {
              console.error('Ошибка при обновлении токена:', refreshError);
              // Токен не удалось обновить, выходим
              logout();
            }
          } else {
            logout();
          }
        } else {
          setAuthState({ user, loading: false, error: null });
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setAuthState({ user: null, loading: false, error: 'Ошибка авторизации' });
      }
    };

    checkAuth();
  }, []);

  // Авторизация через Яндекс ID
  const login = useCallback(() => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Перенаправляем на страницу авторизации Яндекс
      window.location.href = yandexAuth.getAuthUrl();
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Ошибка при авторизации',
      }));
    }
  }, []);

  // Обработка callback от Яндекс ID
  const handleAuthCallback = useCallback(async (code: string, state: string) => {
    // Проверяем, не обрабатываем ли мы уже этот callback
    const callbackKey = `callback_${code}_${state}`;
    const isProcessing = sessionStorage.getItem(callbackKey);
    
    if (isProcessing) {
      console.log('Callback уже обрабатывается, пропускаем...');
      return;
    }
    
    try {
      sessionStorage.setItem(callbackKey, 'true');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await yandexAuth.exchangeCodeForToken(code, state);
      saveUser(user);
      
      setAuthState({ user, loading: false, error: null });
      sessionStorage.removeItem(callbackKey);
      navigate('/chat');
    } catch (error) {
      console.error('Ошибка при обработке callback:', error);
      sessionStorage.removeItem(callbackKey);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка авторизации',
      }));
    }
  }, [navigate]);

  // Выход из системы
  const logout = useCallback(() => {
    try {
      removeUser();
      setAuthState({ user: null, loading: false, error: null });
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  }, [navigate]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    handleAuthCallback,
    clearError,
    isAuthenticated: !!authState.user,
  };
}
