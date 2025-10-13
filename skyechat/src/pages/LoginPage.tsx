import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveUser } from '@/lib/storage';
import { CircleArrowOutUpLeft } from 'lucide-react';

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
            <CircleArrowOutUpLeft className="w-5 h-5" />
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
