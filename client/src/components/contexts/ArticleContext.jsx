import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify.jsx";
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useAuthContext } from "./UserContext";
import { articleServiceFactory } from "../Services/articleServiceFactory";
import { deleteFileFromStorage } from "../Articles/articleUtils/file-delete-utils";

export const ArticleContext = createContext();

export const ArticleProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
  const { isAdmin } = useAuthContext();
  const navigate = useLocalizedNavigate();
   const location = useLocation();
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
     
      const fetchedArticles = await articleService.getAllArticles();
      
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

  const deleteArticle = async (id) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да изтрие статия');
      notify('unauthorized-action');
      return false;
    }
    
    try {
      setIsLoading(true);

      const article = await articleService.getArticleById(id);
      
      if (!article) {
        throw new Error('Статията не беше намерена');
      }

      const filesToDelete = [];

      if (article.mainImage) {
        if (article.mainImage.type === "image" || article.mainImage.type === "slider") {

          if (Array.isArray(article.mainImage.sources)) {
            article.mainImage.sources.forEach(src => {
              if (src && src.includes('firebasestorage.googleapis.com')) {
                filesToDelete.push(src);
              }
            });
          }
        } else if (article.mainImage.type === "video") {

          if (article.mainImage.sources && article.mainImage.sources.length > 0 && 
              article.mainImage.sources[0].includes('firebasestorage.googleapis.com')) {
            filesToDelete.push(article.mainImage.sources[0]);
          }

          if (article.mainImage.thumbnail && article.mainImage.thumbnail.includes('firebasestorage.googleapis.com')) {
            filesToDelete.push(article.mainImage.thumbnail);
          }
        }
      }

      if (article.sections && article.sections.length > 0) {
        article.sections.forEach(section => {

          if (Array.isArray(section.image)) {
            section.image.forEach(img => {
              if (img && img.src && img.src.includes('firebasestorage.googleapis.com')) {
                filesToDelete.push(img.src);
              }
            });
          } 
          else if (section.image && section.image.src && section.image.src.includes('firebasestorage.googleapis.com')) {
            filesToDelete.push(section.image.src);
          }

          if (section.sectionImages && section.sectionImages.length > 0) {
            section.sectionImages.forEach(img => {
              if (img && img.src && img.src.includes('firebasestorage.googleapis.com')) {
                filesToDelete.push(img.src);
              }
            });
          }
        });
      }

      if (filesToDelete.length > 0) {
        const deletePromises = filesToDelete.map(url => deleteFileFromStorage(url));
        await Promise.all(deletePromises);
      }
      
      await articleService.deleteArticle(id);
      
      setArticles(prevArticles => prevArticles.filter(article => article.id !== id));
      
      invalidateArticlesCache();
      notify('article-deleted-success');
      return true;
    } catch (e) {
      console.error('Грешка при изтриване на статия:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper around the article service. Backend returns
  // { success, image, title, description, siteName } or
  // { success: false, code, message } — we surface as-is so the caller can
  // decide how to react (auto-fill vs. show "fetch failed").
  const getUrlMetadata = async (url) => {
    if (!url || typeof url !== 'string') {
      return { success: false, code: 'INVALID_URL', message: 'Invalid URL' };
    }
    try {
      const response = await articleService.getUrlMetadata(url);
      return response;
    } catch (e) {
      console.error('Грешка при извличане на метаданни:', e);
      return {
        success: false,
        code: e?.code || 'FETCH_FAILED',
        message: e?.message || 'Failed to fetch metadata',
      };
    }
  };

  // Paginated, server-filtered fetch for the admin list view (Phase 2). Does
  // NOT touch the cached `articles` state so that legacy callers
  // (RecentArticles, ArticleView, ArticlesList) keep their cached behavior.
  const getArticlesPaginated = async (params = {}) => {
    try {
      setIsLoading(true);
      const response = await articleService.getArticlesPaginated(params);
      return response;
    } catch (e) {
      console.error('Грешка при получаване на статии (paginated):', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return { items: [], total: 0, page: 1, limit: params.limit || 20, totalPages: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  // Single-item visibility toggle — used by AdminArticleCard / ListRow to
  // flip status between draft / published / archived. Falls through to the
  // existing PUT /:id endpoint with just { status } in the body.
  const updateArticleStatus = async (id, status) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да променя видимостта');
      notify('unauthorized-action');
      return null;
    }
    try {
      setIsLoading(true);
      const response = await articleService.updateArticleStatus(id, status);
      // Bust the legacy cache so the public list refetches next time.
      invalidateArticlesCache();
      return response;
    } catch (e) {
      console.error('Грешка при промяна на статуса:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk actions over a selection of article ids. Phase 3 of admin articles
  // redesign. The service returns either { success: true, updated, action }
  // (200) or { success: false, results: [...] } (207 — partial). The
  // requester normalizes both into a parsed JSON body, so we just pass it
  // through and let the caller decide how to react.
  const bulkArticles = async (ids, action) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да извърши групово действие');
      notify('unauthorized-action');
      return { success: false, code: 'UNAUTHORIZED' };
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, code: 'EMPTY_SELECTION' };
    }
    try {
      setIsLoading(true);
      const response = await articleService.bulkArticles(ids, action);
      // Bust the legacy cache so public list/recent refetch.
      invalidateArticlesCache();
      return response;
    } catch (e) {
      console.error('Грешка при групово действие върху статии:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return {
        success: false,
        code: e?.code || 'BULK_FAILED',
        message: e?.message || 'Bulk action failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateArticle = async (id,articleData) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да редактира статия');
      notify('unauthorized-action');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await articleService.updateArticle(id,articleData);
      
      // Актуализиране на списъка със статии след редактиране
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === articleData.id ? {...article, ...articleData} : article
        )
      );
      
      invalidateArticlesCache();
      notify('article-updated-success');
      return response;
    } catch (e) {
      console.error('Грешка при редактиране на статия:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
      navigate('profile/articles');
    }
  };

  const contextService = {
    createArticle,
    invalidateArticlesCache,
    getArticleById,
    getAllArticles,
    getArticlesPaginated,
    updateArticleStatus,
    bulkArticles,
    deleteArticle,
    updateArticle,
    getUrlMetadata,
    articles,
    isLoading,
    articlesLoaded,
  };
  const pagesWithLazyLoading = ['/articles'];

  // The admin paginated list (`/profile/articles`) renders its own skeleton
  // and toolbar-level loading state, so the global Loader would visually
  // collide on every filter change. Suppress it for that route.
  const isAdminArticlesPage = typeof location.pathname === 'string'
    && location.pathname.endsWith('/profile/articles');

  const shouldShowLoader = isLoading
    && !pagesWithLazyLoading.includes(location.pathname)
    && !isAdminArticlesPage;
  return (
    <ArticleContext.Provider value={contextService}>
      {children}
      {shouldShowLoader && <Loader />}
    </ArticleContext.Provider>
  );
};

export const useArticleContext = () => {
  const context = useContext(ArticleContext);
  return context;
};