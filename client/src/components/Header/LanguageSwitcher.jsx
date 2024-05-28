import { useTranslation } from "react-i18next";

const lngs = {
    bg: {nativeName: 'Български'},
    en: {nativeName: 'Български'}
  }

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
    return (
        <div>
         <button type="button" onClick={() => changeLanguage('bg')}>
         Български
        </button>
        <button type="button" onClick={() => changeLanguage('en')}>
        English
        </button>
          </div>
    )
}