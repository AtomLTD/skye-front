import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'skye_onboarding_completed';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем, прошел ли пользователь онбординг
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.location.reload();
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}

