import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User, ChevronUp, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ui/theme-provider';
import { ColorPicker } from './ColorPicker';
import { useOnboarding } from '@/hooks/useOnboarding';

export function UserProfileWithMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { resetOnboarding } = useOnboarding();
  
  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Проверка пользователя ПОСЛЕ всех хуков
  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Кликабельный профиль */}
      <Button
        variant="ghost"
        onClick={toggleMenu}
        className="w-full justify-start p-3 h-auto hover:bg-accent"
      >
        <div className="flex items-center gap-3 w-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs">
              {user.avatar ? getInitials(user.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <ChevronUp 
            className={`h-4 w-4 transition-transform duration-200 ${
              isMenuOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </Button>

      {/* Контекстное меню */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 right-0 bg-background border border-border rounded-md shadow-lg mb-2">
          <div className="p-3 space-y-4">

            <ColorPicker />
            <Button
              variant="ghost"
              size="default"
              onClick={toggleTheme}
              className="w-full justify-start h-10"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-3 h-4 w-4" />
                  Светлая тема
                </>
              ) : (
                <>
                  <Moon className="mr-3 h-4 w-4" />
                  Темная тема
                </>
              )}
            </Button>
            <Button variant='ghost' size='default' onClick={resetOnboarding} className='w-full justify-start h-10'>
              <RotateCcw 
                className="mr-3 h-4 w-4"
              />
              Пройти обучение
            </Button>
            <Button
              variant="ghost"
              size="default"
              onClick={handleLogout}
              className="w-full justify-start h-10 text-destructive hover:text-destructive"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
