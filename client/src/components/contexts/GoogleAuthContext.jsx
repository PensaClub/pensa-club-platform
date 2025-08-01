import { createContext, useContext, useState } from 'react';
import { googleAuthServiceFactory } from '../Services/googleAuthService';
import { useAuthContext } from './UserContext';
import { notify } from '../../utils/notify.jsx';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const GoogleAuthContext = createContext();

export const GoogleAuthProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const { handleAuthChange, setProfileData } = useAuthContext();
  const googleAuthService = googleAuthServiceFactory();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoogleLogin = async (credential) => {
    setIsProcessing(true);
    setError(null);

    try {

      const response = await googleAuthService.loginWithGoogle(credential);

      // Успешен вход
      handleAuthChange({
        token: response.token,
        email: response.user.email,
        enabled: response.user.enabled
      });

      if (response.user) {
        setProfileData(response.user);
        if (response.user.enabled) {
          navigate('/');
        } else {
          navigate('/profile/profile-form');
        }
      }

      notify('success-login');
      setIsProcessing(false);
      return response;
    } catch (error) {
      console.error('Google login error:', error);

      if (error.message === 'User not found. Please register.' ||
          error.message.includes('not found')) {

        notify('google-user-not-found', t('notification.google-user-not-found'));

        navigate('/sign-up?tab=register');

        setError('register-required');
        setIsProcessing(false);
        return { redirectToRegister: true };
      }

      notify('error', t('notification.google-login-error'));
      setError('login-failed');
      setIsProcessing(false);
      throw error;
    }
  };

  const handleGoogleRegister = async (credential) => {
    setIsProcessing(true);
    setError(null);

    try {
      // ОСНОВНА КОРЕКЦИЯ ТУК - използваме registerWithGoogle, НЕ loginWithGoogle!

      const response = await googleAuthService.registerWithGoogle(credential);

      // Успешна регистрация
      handleAuthChange({
        token: response.token,
        email: response.user.email,
        enabled: response.user.enabled
      });

      navigate('/profile/profile-form');

      if (response.user) {
        setProfileData(response.user);
      }

      notify('success-register');
      setIsProcessing(false);
      return response;
    } catch (error) {
      console.error('Google register error:', error);

      // Проверка дали потребителят вече съществува
      if (error.message === 'User already exists. Please login.' ||
          error.message.includes('already exists')) {

        notify('google-user-exists', t('notification.google-user-exists'));

        navigate('/sign-up?tab=login');

        setError('login-required');
        setIsProcessing(false);
        return { redirectToLogin: true };
      }

      notify('error', t('notification.google-register-error'));
      setError('register-failed');
      setIsProcessing(false);
      throw error;
    }
  };

  const contextValue = {
    handleGoogleLogin,
    handleGoogleRegister,
    isProcessing,
    error,
  };

  return (
    <GoogleAuthContext.Provider value={contextValue}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  return useContext(GoogleAuthContext);
};
