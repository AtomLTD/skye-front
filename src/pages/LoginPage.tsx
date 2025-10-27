import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { CircleArrowOutUpLeft, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, loading, error, clearError } = useAuth();

  const handleYandexLogin = () => {
    clearError();
    login();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">{t('app.name')}</CardTitle>
          <CardDescription>
            {t('auth.login.title')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleYandexLogin}
            disabled={loading}
            className="w-full bg-brand hover:bg-brand/90"
            size="lg"
          >
            <CircleArrowOutUpLeft className="w-5 h-5" />
            {loading ? t('auth.login.buttonLoading') : t('auth.login.button')}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.login.terms')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
