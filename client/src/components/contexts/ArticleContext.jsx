import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { articleServiceFactory } from "../Services/articleServiceFactory";

export const ArticleContext = createContext();

export const ArticleProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isAdmin } = useAuthContext();
  const navigate = useNavigate();
  
  const articleService = articleServiceFactory();

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };

  const createArticle = async (articleData) => {
    console.log('ArticleContext: функцията createArticle е извикана с данни:', articleData);
    
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да създаде статия');
      notify('unauthorized-action');
      return;
    }
  
    try {
      setIsLoading(true);
      console.log('Предстои извикване на articleService.createArticle');
      const response = await articleService.createArticle(articleData);
      console.log('Статията е създадена успешно, отговор:', response);
      setIsLoading(false);
      notify('article-created-success');
      navigate('/articles');
      return response;
    } catch (e) {
      console.error('Грешка при създаване на статия:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const contextService = {
    createArticle,
  };

  return (
    <ArticleContext.Provider value={contextService}>
      {children}
      {isLoading && <Loader />}
    </ArticleContext.Provider>
  );
};

export const useArticleContext = () => {
  const context = useContext(ArticleContext);
  return context;
};