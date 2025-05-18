
import { requestFactory } from './requester';

const apiUrl = process.env.REACT_APP_API_URL;

export const googleAuthServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    loginWithGoogle: (credential) => {
      return requester.post(`${apiUrl}/auth/google-login`, { credential });
    },
    
    registerWithGoogle: (credential) => {
      return requester.post(`${apiUrl}/auth/google-register`, { credential });
    },
 
    verifyGoogleToken: (token) => {
      return requester.post(`${apiUrl}/auth/verify-google-token`, { token });
    }
  };
};