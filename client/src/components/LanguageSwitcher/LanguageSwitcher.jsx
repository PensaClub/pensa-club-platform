import i18next from "i18next";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { localePath, stripLangFromPath } from "../../utils/languageUtils";
import "./languageSwitcher.css";

export const LanguageSwitcher = ({ isMobile = false, onMobileMenuToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];
  const currentLanguage = i18next.language;
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode) => {
    if (langCode === i18next.language) return;
    const cleanPath = stripLangFromPath(window.location.pathname);
    const targetPath = localePath(cleanPath, langCode);
    await i18next.changeLanguage(langCode);
    navigate(targetPath, { replace: true });
    setIsOpen(false);
    setIsMobileOpen(false);
    if (isMobile && onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const toggleMobileDropdown = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  if (isMobile) {
    return (
      <div className="mobile-language-switcher-new" ref={dropdownRef}>
        <button 
          className="mobile-lang-header" 
          onClick={toggleMobileDropdown}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 12H22M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* <span>Език / Language</span> */}
          <span className="mobile-current-lang">({currentLang.name})</span>
          <svg 
            className={`mobile-lang-dropdown-arrow ${isMobileOpen ? 'rotated' : ''}`}
            width="12" 
            height="6" 
            viewBox="0 0 12 6" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        <div className={`mobile-lang-options ${isMobileOpen ? 'open' : ''}`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`mobile-lang-option ${currentLanguage === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.name}</span>
              {currentLanguage === lang.code && (
                <svg className="check-icon-lng" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button 
        className="lang-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Смени език"
      >
        <span className="current-lang-code">{currentLang.code.toUpperCase()}</span>
        <svg 
          className={`lang-dropdown-arrow ${isOpen ? 'rotated' : ''}`}
          width="12" 
          height="6" 
          viewBox="0 0 12 6" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`lang-dropdown ${isOpen ? 'active' : ''}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`lang-option ${currentLanguage === lang.code ? 'current' : ''}`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <span className="lang-name">{lang.name}</span>
            <span className="lang-code">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};