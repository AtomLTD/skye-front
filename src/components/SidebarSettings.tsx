import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/theme-provider';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

export function SidebarSettings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="p-3 space-y-2">
      <Separator />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="flex-1 justify-start"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Светлая тема
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Темная тема
            </>
          )}
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start text-destructive hover:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Выйти
      </Button>
    </div>
  );
}
