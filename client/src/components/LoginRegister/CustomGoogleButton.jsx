import React, { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { useNavigate } from 'react-router-dom';

export const CustomGoogleButton = ({ mode = 'login', onSwitchMode }) => {
  const { handleGoogleLogin, handleGoogleRegister } = useGoogleAuth();
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  
  // Използваме environment variable с резервна стойност
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "224833004247-o2q7ff1onln6j5pkhtqtnct74p0ehjj9.apps.googleusercontent.com";
  
  useEffect(() => {
    console.log("Client ID being used:", clientId);
    console.log("Button mode:", mode);
    
    const loadGoogleApi = () => {
      if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
        setTimeout(loadGoogleApi, 100);
        return;
      }
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response && response.credential) {
              try {
                let result;
                
                if (mode === 'register') {
                  result = await handleGoogleRegister(response.credential);
                } else {
                  result = await handleGoogleLogin(response.credential);
                }
                
                // Проверяваме за нужда от пренасочване
                if (result && result.redirectToRegister) {
                  // Пренасочване към регистрация
                  if (onSwitchMode) {
                    onSwitchMode('register');
                  } else {
                    navigate('/sign-up');
                  }
                } else if (result && result.redirectToLogin) {
                  // Пренасочване към вход
                  if (onSwitchMode) {
                    onSwitchMode('login');
                  } else {
                    navigate('/login');
                  }
                }
              } catch (error) {
                console.error("Error during Google auth:", error);
              }
            }
          }
        });
        
        console.log("Google API initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Google API:", error);
      }
    };
    
    if (document.getElementById('google-api-script') === null) {
      const script = document.createElement('script');
      script.id = 'google-api-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleApi;
      document.head.appendChild(script);
    } else {
      loadGoogleApi();
    }
  }, [handleGoogleLogin, handleGoogleRegister, clientId, mode, navigate, onSwitchMode]);
  
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
      <span>{mode === 'register' ? 'Регистрация с Google' : 'Вход с Google'}</span>
    </button>
  );
};