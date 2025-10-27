import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MessageSquare,
  Sparkles,
  Shield,
  Github,
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  Moon,
} from 'lucide-react';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  illustration?: React.ReactNode;
}

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
      icon: <Sparkles className="w-16 h-16 text-primary" />,
    },
    {
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
      icon: <MessageSquare className="w-16 h-16 text-primary" />,
    },
    {
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
      icon: <Settings className="w-16 h-16 text-primary" />,
    },
    {
      title: t('onboarding.slide4.title'),
      description: t('onboarding.slide4.description'),
      icon: <Moon className="w-16 h-16 text-primary" />,
    },
    {
      title: t('onboarding.slide5.title'),
      description: t('onboarding.slide5.description'),
      icon: <Shield className="w-16 h-16 text-primary" />,
    },
    {
      title: t('onboarding.slide6.title'),
      description: t('onboarding.slide6.description'),
      icon: <Github className="w-16 h-16 text-primary" />,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-background/20 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl relative">
        {/* Кнопка закрытия */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={onSkip}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="p-8 md:p-12">

          {/* Иконка */}
          <div className="flex justify-center mb-6 w-full bg-zinc-100 rounded-lg p-12 dark:bg-zinc-800">{currentSlideData.icon}</div>

          {/* Контент */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{currentSlideData.title}</h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {currentSlideData.description}
            </p>
          </div>

          {/* Индикаторы прогресса */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-brand'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`${t('aria.goToSlide')} ${index + 1}`}
              />
            ))}
          </div>

          {/* Навигация */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('onboarding.navigation.back')}
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-brand hover:bg-brand/90">
              {currentSlide === slides.length - 1 ? (
                t('onboarding.navigation.start')
              ) : (
                <>
                  {t('onboarding.navigation.next')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Кнопка пропуска */}
          <div className="text-center mt-4">
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
              {t('onboarding.navigation.skip')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

