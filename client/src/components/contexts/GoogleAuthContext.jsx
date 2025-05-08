import { createContext, useContext, useState } from 'react';
import { googleAuthServiceFactory } from '../Services/googleAuthService';
import { useAuthContext } from './UserContext';
import { notify } from '../../utils/notify';
import { useNavigate } from 'react-router-dom';

export const GoogleAuthContext = createContext();

export const GoogleAuthProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Извличаме правилните функции от UserContext
  const { onLoginSubmit, handleAuthChange, setProfileData } = useAuthContext();
  const googleAuthService = googleAuthServiceFactory();
const navigate = useNavigate(); // Извличаме navigate от react-router-dom
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
      }
      
      notify('success-login');
      setIsProcessing(false);
      return response;
    } catch (error) {
      console.error('Google login error:', error);

      if (error.message === 'User not found. Please register.' || 
          error.message.includes('not found')) {
        
        notify('google-user-not-found', 'Нямате регистриран профил с този Google акаунт. Моля, регистрирайте се първо.');
        
         navigate('/'); // Пренасочваме към регистрация
        
        setError('register-required');
        setIsProcessing(false);
        return { redirectToRegister: true };
      }
      
      notify('error', 'Възникна проблем при входа с Google. Моля, опитайте отново.');
      setError('login-failed');
      setIsProcessing(false);
      throw error;
    }
  };
 
    const handleGoogleRegister = async (credential) => {
      setIsProcessing(true);
      setError(null);
      
      try {
        const response = await googleAuthService.registerWithGoogle(credential);
        
        // Успешна регистрация
        handleAuthChange({ 
          token: response.token, 
          email: response.user.email, 
          enabled: response.user.enabled 
        });
        
        if (response.user) {
          setProfileData(response.user);
        }
        
        notify('success-register');
        setIsProcessing(false);
        return response;
      } catch (error) {
        console.error('Google register error:', error);
        
        // Обработка на специфични грешки с по-добър UX
        if (error.message === 'User already exists. Please login.' || 
            error.message.includes('already exists')) {
          
          notify('google-user-exists-register', 'Имате вече регистриран профил с този Google акаунт. Ще ви пренасочим към входа.');

           navigate('/sign-up?tab=login');
          
          setError('login-required');
          setIsProcessing(false);
          return { redirectToLogin: true };
        }
        
        // Обработка на общи грешки
        notify('errors-register', 'Възникна проблем при регистрацията с Google. Моля, опитайте отново.');
        setError('register-failed');
        setIsProcessing(false);
        throw error;
      }
    };

  const contextValue = {
    handleGoogleLogin,
    isProcessing,
    error,
    handleGoogleRegister
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