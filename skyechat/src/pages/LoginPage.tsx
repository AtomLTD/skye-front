import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveUser } from '@/lib/storage';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleYandexLogin = () => {
    // Симуляция логина через Яндекс
    const mockUser = {
      id: 'user-' + Date.now(),
      name: 'Пользователь Яндекс',
      email: 'user@yandex.ru',
    };

    saveUser(mockUser);
    navigate('/chat');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Skye</CardTitle>
          <CardDescription>
            Войдите в свой аккаунт, чтобы начать общение с ИИ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleYandexLogin}
            className="w-full bg-[#fc3f1d] hover:bg-[#fc3f1d]/90"
            size="lg"
          >
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm4.5 18h-2.6v-7.5H11c-1.9 0-2.9-.9-2.9-2.5 0-1.7 1-2.5 3-2.5h5.4v2.1H11c-.7 0-1 .3-1 .9 0 .5.3.9 1 .9h2.9c1.3 0 1.6.6 1.6 1.8V18z" />
            </svg>
            Войти через Яндекс
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Нажимая "Войти через Яндекс", вы соглашаетесь с условиями использования
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
