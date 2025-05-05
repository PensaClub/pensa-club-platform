import React, { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

export const CustomGoogleButton = () => {
  const { handleGoogleLogin } = useGoogleAuth();
  const buttonRef = useRef(null);
  
  // Използваме environment variable с резервна стойност
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "224833004247-o2q7ff1onln6j5pkhtqtnct74p0ehjj9.apps.googleusercontent.com";
  
  useEffect(() => {
    // Дебъг информация
    console.log("Client ID being used:", clientId);
    
    // Функция, която проверява дали Google API е заредено и инициализира бутона
    const loadGoogleApi = () => {
      if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
        // Ако API не е заредено, опитваме отново след малко
        setTimeout(loadGoogleApi, 100);
        return;
      }
      
      try {
        // Инициализираме Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response && response.credential) {
              handleGoogleLogin(response.credential);
            }
          }
        });
        
        console.log("Google API initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Google API:", error);
      }
    };
    
    // Зареждаме Google API
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
  }, [handleGoogleLogin, clientId]);
  
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
      <span>Google</span>
    </button>
  );
};