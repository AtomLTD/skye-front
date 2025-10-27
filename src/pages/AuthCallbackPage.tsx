import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const { t } = useTranslation();
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
            <CardTitle className="text-2xl font-bold">{t('auth.callback.title')}</CardTitle>
            <CardDescription>
              {t('auth.callback.processing')}
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
              {t('auth.callback.errorTitle')}
            </CardTitle>
            <CardDescription>
              {t('auth.callback.errorDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {t('error.tryAgain')}
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
            {t('auth.callback.successTitle')}
          </CardTitle>
          <CardDescription>
            {t('auth.callback.successDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.callback.redirecting')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
