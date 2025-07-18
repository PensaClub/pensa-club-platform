import i18next, { changeLanguage } from "i18next";
import { useEffect, useRef, useState } from "react";
import "./languageSwitcher.css";

export const LanguageSwitcher = ({ isMobile = false, onMobileMenuToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Ново състояние за мобилното меню
  const dropdownRef = useRef(null);

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

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
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
            <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="currentColor" />
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