import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AccentColor = 'brand' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'cyan';

interface ColorPalette {
  light: string;
  dark: string;
  lightMessage: string;
  darkMessage: string;
  lightMessageText: string;
  darkMessageText: string;
}

const colorPalettes: Record<AccentColor, ColorPalette> = {
  brand: {
    light: 'oklch(0.51 0.05 210)',
    dark: 'oklch(0.55 0.055 210)',
    lightMessage: 'oklch(0.51 0.05 210 / 0.15)',
    darkMessage: 'oklch(0.55 0.055 210 / 0.25)',
    lightMessageText: 'oklch(0.38 0.06 210)',
    darkMessageText: 'oklch(0.78 0.06 210)',
  },
  blue: {
    light: 'oklch(0.50 0.12 240)',
    dark: 'oklch(0.58 0.13 240)',
    lightMessage: 'oklch(0.50 0.12 240 / 0.15)',
    darkMessage: 'oklch(0.58 0.13 240 / 0.25)',
    lightMessageText: 'oklch(0.35 0.13 240)',
    darkMessageText: 'oklch(0.80 0.12 240)',
  },
  purple: {
    light: 'oklch(0.52 0.14 290)',
    dark: 'oklch(0.60 0.15 290)',
    lightMessage: 'oklch(0.52 0.14 290 / 0.15)',
    darkMessage: 'oklch(0.60 0.15 290 / 0.25)',
    lightMessageText: 'oklch(0.38 0.15 290)',
    darkMessageText: 'oklch(0.82 0.14 290)',
  },
  green: {
    light: 'oklch(0.53 0.12 145)',
    dark: 'oklch(0.60 0.13 145)',
    lightMessage: 'oklch(0.53 0.12 145 / 0.15)',
    darkMessage: 'oklch(0.60 0.13 145 / 0.25)',
    lightMessageText: 'oklch(0.38 0.13 145)',
    darkMessageText: 'oklch(0.80 0.12 145)',
  },
  orange: {
    light: 'oklch(0.58 0.14 50)',
    dark: 'oklch(0.64 0.15 50)',
    lightMessage: 'oklch(0.58 0.14 50 / 0.15)',
    darkMessage: 'oklch(0.64 0.15 50 / 0.25)',
    lightMessageText: 'oklch(0.42 0.15 50)',
    darkMessageText: 'oklch(0.85 0.14 50)',
  },
  red: {
    light: 'oklch(0.55 0.18 25)',
    dark: 'oklch(0.62 0.18 25)',
    lightMessage: 'oklch(0.55 0.18 25 / 0.15)',
    darkMessage: 'oklch(0.62 0.18 25 / 0.25)',
    lightMessageText: 'oklch(0.40 0.18 25)',
    darkMessageText: 'oklch(0.83 0.17 25)',
  },
  pink: {
    light: 'oklch(0.56 0.16 340)',
    dark: 'oklch(0.63 0.17 340)',
    lightMessage: 'oklch(0.56 0.16 340 / 0.15)',
    darkMessage: 'oklch(0.63 0.17 340 / 0.25)',
    lightMessageText: 'oklch(0.41 0.17 340)',
    darkMessageText: 'oklch(0.84 0.16 340)',
  },
  cyan: {
    light: 'oklch(0.54 0.11 195)',
    dark: 'oklch(0.61 0.12 195)',
    lightMessage: 'oklch(0.54 0.11 195 / 0.15)',
    darkMessage: 'oklch(0.61 0.12 195 / 0.25)',
    lightMessageText: 'oklch(0.39 0.12 195)',
    darkMessageText: 'oklch(0.81 0.11 195)',
  },
};

interface AccentColorContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  getMessageColors: (isDark: boolean) => {
    background: string;
    text: string;
  };
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined);

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem('accent-color');
    return (stored as AccentColor) || 'brand';
  });

  useEffect(() => {
    const root = document.documentElement;
    const palette = colorPalettes[accentColor];
    const isDark = root.classList.contains('dark');

    // Устанавливаем основной акцентный цвет
    root.style.setProperty('--brand', isDark ? palette.dark : palette.light);
    root.style.setProperty('--brand-foreground', 'oklch(0.985 0 0)');

    // Устанавливаем цвета для сообщений
    root.style.setProperty('--brand-message', isDark ? palette.darkMessage : palette.lightMessage);
    root.style.setProperty('--brand-message-text', isDark ? palette.darkMessageText : palette.lightMessageText);
  }, [accentColor]);

  // Слушаем изменения темы (светлая/темная)
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const palette = colorPalettes[accentColor];
      const isDark = root.classList.contains('dark');
      
      root.style.setProperty('--brand', isDark ? palette.dark : palette.light);
      root.style.setProperty('--brand-message', isDark ? palette.darkMessage : palette.lightMessage);
      root.style.setProperty('--brand-message-text', isDark ? palette.darkMessageText : palette.lightMessageText);
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [accentColor]);

  const setAccentColor = (color: AccentColor) => {
    localStorage.setItem('accent-color', color);
    setAccentColorState(color);
  };

  const getMessageColors = (isDark: boolean) => {
    const palette = colorPalettes[accentColor];
    return {
      background: isDark ? palette.darkMessage : palette.lightMessage,
      text: isDark ? palette.darkMessageText : palette.lightMessageText,
    };
  };

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor, getMessageColors }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error('useAccentColor must be used within an AccentColorProvider');
  }
  return context;
}

export { colorPalettes };

