import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './error.css';
import { Loader } from '../Loader/Loader';
import { notify } from '../../utils/notify';
import { suggestUserServiceFactory } from '../Services/suggestUserService';

export const SuggestUserContext = createContext();

export const SuggestUserProvider = ({ children }) => { 

  // eslint-disable-next-line no-unused-vars
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestUserService = suggestUserServiceFactory();

  const navigate = useNavigate();

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };

  const onSuggestSubmit = async (data) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await suggestUserService.suggestUser(data);
      navigate('/');
      notify('success-suggest');
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const contextService = {    
    onSuggestSubmit,
  };

  return (
    <SuggestUserContext.Provider value={contextService}>
      {children}
      {isLoading && <Loader />}
    </SuggestUserContext.Provider>
  );
};

export const useSuggestUserContext = () => {
  const context = useContext(SuggestUserContext);

  return context;
};
