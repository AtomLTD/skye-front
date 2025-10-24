import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { handleAuthCallback, error, loading } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Защита от двойного вызова (React StrictMode)
    if (hasProcessed.current) {
      console.log('Callback уже обрабатывался, пропускаем повторный вызов');
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      console.error('Ошибка авторизации:', errorParam);
      return;
    }

    if (code && state) {
      hasProcessed.current = true;
      handleAuthCallback(code, state);
    } else {
      console.error('Отсутствуют необходимые параметры для авторизации');
    }
  }, [searchParams, handleAuthCallback]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Авторизация</CardTitle>
            <CardDescription>
              Обработка данных авторизации...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Ошибка авторизации
            </CardTitle>
            <CardDescription>
              Произошла ошибка при авторизации через Яндекс ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Попробуйте авторизоваться снова или обратитесь в поддержку
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Успешная авторизация
          </CardTitle>
          <CardDescription>
            Вы успешно авторизованы через Яндекс ID
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Перенаправление на главную страницу...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
