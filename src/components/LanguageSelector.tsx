import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { saveLanguage } from '@/lib/storage';
import i18n from '@/i18n';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export function LanguageSelector() {
  const { t, i18n: i18nInstance } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18nInstance.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    saveLanguage(languageCode);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 pb-2 pt-8">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <div className="text-xs font-medium text-muted-foreground">
          {t('user.menu.language')}
        </div>
      </div>
      <div className="flex gap-2 px-1 flex-col pb-8">
        {languages.map((language) => {
          const isSelected = currentLanguage.code === language.code;
          return (
            <Button
              key={language.code}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeLanguage(language.code)}
              className={`w-full ${isSelected ? 'bg-brand hover:bg-brand/90 text-white' : ''}`}
            >
              <span className="mr-1.5 text-base">{language.flag}</span>
              {language.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

