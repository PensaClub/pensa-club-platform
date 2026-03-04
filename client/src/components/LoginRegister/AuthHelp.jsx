import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './authHelp.css';

const EnvelopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.24 10.285V14.4H18.72C18.432 15.96 17.472 17.28 16.08 18.12L19.56 20.76C21.6 18.84 22.8 16.08 22.8 12.72C22.8 11.76 22.72 10.84 22.56 10.0H12.24V10.285Z" fill="#4285F4"/>
    <path d="M5.16 14.28L4.32 14.94L1.56 17.16C3.84 21.6 8.04 24 12.24 24C15.24 24 17.76 23.04 19.56 21.36L16.08 18.72C15 19.44 13.68 19.92 12.24 19.92C9.36 19.92 6.96 17.88 6.12 15.24L5.16 14.28Z" fill="#34A853"/>
    <path d="M1.56 6.84C0.48 9 0 11.4 0 12C0 12.6 0.48 15 1.56 17.16C1.56 17.16 6.12 13.56 6.12 12C6.12 10.44 5.16 8.76 5.16 8.76L1.56 6.84Z" fill="#FBBC05"/>
    <path d="M12.24 4.8C13.92 4.8 15.36 5.4 16.56 6.48L19.68 3.36C17.76 1.56 15.24 0 12.24 0C8.04 0 3.84 2.4 1.56 6.84L6.12 9.48C6.96 6.84 9.36 4.8 12.24 4.8Z" fill="#EA4335"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor"/>
  </svg>
);

const loginIcons = [EnvelopeIcon, LockIcon, EyeIcon, RefreshIcon, GoogleIcon];
const registerIcons = [EnvelopeIcon, LockIcon, CheckIcon, EyeIcon, GoogleIcon];

export const AuthHelp = ({ mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('auth');

  const icons = mode === 'login' ? loginIcons : registerIcons;

  return (
    <div className="ah-container">
      <button
        type="button"
        className="ah-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <span className="ah-toggle-left">
          <span className="ah-toggle-icon">?</span>
          <span>{t('help.toggle-label')}</span>
        </span>
        <span className={`ah-chevron${isOpen ? ' ah-chevron--open' : ''}`}>
          <ChevronIcon />
        </span>
      </button>

      <div className={`ah-content-wrapper${isOpen ? ' ah-content-wrapper--open' : ''}`}>
        <div className="ah-content">
          <p className="ah-intro">{t(`help.${mode}.intro`)}</p>

          <ol className="ah-steps">
            {[1, 2, 3, 4, 5].map(num => {
              const Icon = icons[num - 1];
              return (
                <li key={num} className="ah-step">
                  <span className="ah-step-icon"><Icon /></span>
                  <span className="ah-step-text">{t(`help.${mode}.step${num}`)}</span>
                </li>
              );
            })}
          </ol>

          <p className="ah-encouragement">{t('help.encouragement')}</p>
        </div>
      </div>
    </div>
  );
};
