import { createContext, useContext, useState } from 'react';
import { googleAuthServiceFactory } from '../Services/googleAuthService';
import { useAuthContext } from './UserContext';

export const GoogleAuthContext = createContext();

export const GoogleAuthProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { setUser, setIsAuthenticated } = useAuthContext();
  const googleAuthService = googleAuthServiceFactory();

  const handleGoogleLogin = async (credential) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await googleAuthService.loginWithGoogle(credential);
      
      localStorage.setItem('auth_token', response.token);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      setIsProcessing(false);
      return response;
    } catch (error) {
      setError(error.message || 'Възникна грешка при автентикацията');
      setIsProcessing(false);
      throw error;
    }
  };

  const contextValue = {
    handleGoogleLogin,
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