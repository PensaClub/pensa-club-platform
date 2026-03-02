import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageWrapper = ({ lang, children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return children;
};
