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
  const [articles, setArticles] = useState([]);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
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
    
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да създаде статия');
      notify('unauthorized-action');
      return;
    }
  
    try {
      setIsLoading(true);

      const response = await articleService.createArticle(articleData);
 
      setIsLoading(false);
      invalidateArticlesCache();
      notify('article-created-success');
      navigate('/articles');
      return response;
    } catch (e) {
      console.error('Грешка при създаване на статия:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
   
    } finally {
      setIsLoading(false);
    }
  };

  const getAllArticles = async (forceRefresh = false) => {

    if (articles.length > 0 && articlesLoaded && !forceRefresh) {
      return articles;
    }

    try {
      setIsLoading(true);
      console.log('Предстои извикване на articleService.getAllArticles');
      const fetchedArticles = await articleService.getAllArticles();
      console.log('Получени са статии от сървъра:', fetchedArticles);
      
      const sortedArticles = fetchedArticles.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      setArticles(sortedArticles);
      setArticlesLoaded(true);
      return sortedArticles;
    } catch (e) {
      console.error('Грешка при получаване на статии:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const invalidateArticlesCache = () => {
    setArticlesLoaded(false);
  };

  const getArticleById = async (id) => {
    try {
      setIsLoading(true);
      const article = await articleService.getArticleById(id);
  
      return article;
    } catch (e) {
      console.error('Грешка при получаване на статия по ID:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);

    } finally {
      setIsLoading(false);
    }
  };

  const contextService = {
    createArticle,
    invalidateArticlesCache,
    getArticleById,
    getAllArticles,
    articles,
    isLoading,
    articlesLoaded,
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