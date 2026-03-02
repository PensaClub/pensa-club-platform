import React, { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';

export const CustomGoogleButton = ({ mode = 'login', onSwitchMode }) => {
  const {t} = useTranslation('auth');
  const { handleGoogleLogin, handleGoogleRegister } = useGoogleAuth();
  const buttonRef = useRef(null);
  const navigate = useLocalizedNavigate();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "224833004247-o2q7ff1onln6j5pkhtqtnct74p0ehjj9.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
      // Зареждаме Google API ако не е заредено
      if (document.getElementById('google-api-script') === null) {
        const script = document.createElement('script');
        script.id = 'google-api-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      return;
    }
    window.google.accounts.id.cancel();

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        if (response && response.credential) {
          try {
            let result;
            // console.log("Google callback executing in mode:", mode);

            if (mode === 'register') {
              result = await handleGoogleRegister(response.credential);
            } else {
              result = await handleGoogleLogin(response.credential);
            }

            if (result && result.redirectToRegister) {
              if (onSwitchMode) {
                onSwitchMode('register');
              } else {
                navigate('/sign-up?tab=register');
              }
            } else if (result && result.redirectToLogin) {
              if (onSwitchMode) {
                onSwitchMode('login');
              } else {
                navigate('/sign-up?tab=login');
              }
            }
          } catch (error) {
            console.error("Error during Google auth:", error);
          }
        }
      }
    });

    // console.log("Google API initialized in mode:", mode);
  }, [clientId, handleGoogleLogin, handleGoogleRegister, mode, navigate, onSwitchMode]);

  const handleGoogleButtonClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      console.error("Google API не е заредено все още!");
    }
  };

  return (
    <button
      type="button"
      className="custom-google-btn"
      onClick={handleGoogleButtonClick}
      ref={buttonRef}
    >
      <img src="/google-icon.svg" alt="Google" className="google-icon" />
      <span>{mode === 'register' ? t('form.google-register') : t('form.google-login')}</span>
    </button>
  );
};
