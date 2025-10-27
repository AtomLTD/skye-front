import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getLanguage } from '@/lib/storage';

import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  ru: {
    translation: ruTranslations,
  },
};

// Get saved language from localStorage or use default
const savedLanguage = getLanguage();
const defaultLanguage = savedLanguage || 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

