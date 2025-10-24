import { useState, useEffect } from 'react';

/**
 * Хук для определения touch-устройств (без возможности hover)
 * Возвращает true, если устройство не поддерживает hover (мобильные/планшеты)
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    // Проверяем возможность hover через media query
    const hoverQuery = window.matchMedia('(hover: none)');
    
    // Функция для обновления состояния
    const checkTouchDevice = () => {
      // Устройство считается touch, если:
      // 1. Не поддерживает hover
      // 2. Имеет touch events
      const noHover = hoverQuery.matches;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(noHover && hasTouch);
    };

    // Проверяем при монтировании
    checkTouchDevice();

    // Слушаем изменения (для случая подключения/отключения внешних устройств)
    hoverQuery.addEventListener('change', checkTouchDevice);

    return () => {
      hoverQuery.removeEventListener('change', checkTouchDevice);
    };
  }, []);

  return isTouchDevice;
}

