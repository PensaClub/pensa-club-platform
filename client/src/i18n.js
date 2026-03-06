import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'bg',
    supportedLngs: ['bg', 'en', 'de'],

    ns: [
      'common',
      'auth',
      'community',
      'admin',
      'academy',
      'academy-admin',
      'clubs',
      'content',
      'home',
      'digibridge',
      'digibridge-mentor',
      'digibridge-students',
      'student-dashboard',
      'useful-links',
      'telk-rkme-rzi',
    ],
    defaultNS: 'common',
    fallbackNS: 'common',
    partialBundledLanguages: true,

    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
