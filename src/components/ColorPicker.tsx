import { Check, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AccentColor, colorPalettes, useAccentColor } from '@/contexts/AccentColorContext';
import { useTheme } from '@/components/ui/theme-provider';

export function ColorPicker() {
  const { t } = useTranslation();
  const { accentColor, setAccentColor } = useAccentColor();
  const { theme } = useTheme();

  const colorLabels: Record<AccentColor, string> = {
    brand: t('colors.brand'),
    blue: t('colors.blue'),
    purple: t('colors.purple'),
    green: t('colors.green'),
    orange: t('colors.orange'),
    red: t('colors.red'),
    pink: t('colors.pink'),
    cyan: t('colors.cyan'),
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const colors: AccentColor[] = ['brand', 'blue', 'purple', 'green', 'orange', 'red', 'pink', 'cyan'];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 pb-2">
      <Palette className="h-4 w-4 text-muted-foreground" />
        <div className="text-xs font-medium text-muted-foreground">
          {t('colors.accentColor')}
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5 px-1">
        {colors.map((color) => {
          const palette = colorPalettes[color];
          const colorValue = isDark ? palette.dark : palette.light;
          const isSelected = accentColor === color;

          return (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={cn(
                'relative w-8 h-8 rounded-full transition-all duration-200',
                'hover:scale-110 hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
                isSelected && 'ring-2 ring-offset-2 ring-offset-background scale-105'
              )}
              style={{
                backgroundColor: colorValue,
                '--tw-ring-color': colorValue,
              } as React.CSSProperties}
              title={colorLabels[color]}
              aria-label={colorLabels[color]}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

