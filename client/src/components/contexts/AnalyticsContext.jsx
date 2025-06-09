/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  trackView, 
  trackArticleView, 
  trackInitiativeView, 
  loadViewCounts, 
  fetchViewCounts,
  saveViewCounts 
} from '../Services/analyticsService';

const AnalyticsContext = createContext();

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  const [viewCounts, setViewCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Зареждам началните броячи при монтиране на компонента
  useEffect(() => {
    const initialCounts = loadViewCounts();
    setViewCounts(initialCounts);
    setIsLoading(false);
  }, []);

  // Запазвам view counts в localStorage при всяка промяна
  useEffect(() => {
    if (Object.keys(viewCounts).length > 0) {
      try {
        localStorage.setItem('viewCounts', JSON.stringify(viewCounts));
      } catch (error) {
        console.error('Error saving view counts:', error);
      }
    }
  }, [viewCounts]);

  // Функция за проследяване на статии (запазвам за backward compatibility)
  const trackArticle = (articleId, articleTitle) => {
    try {
      trackArticleView(articleId, articleTitle);
      
      const key = `article_${articleId}`;
      setViewCounts(prev => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    } catch (error) {
      console.error('Error tracking article:', error);
    }
  };

  // Функция за проследяване на инициативи
  const trackInitiative = (initiativeId, initiativeTitle) => {
    try {
      trackInitiativeView(initiativeId, initiativeTitle);
      
      const key = `initiative_${initiativeId}`;
      setViewCounts(prev => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    } catch (error) {
      console.error('Error tracking initiative:', error);
    }
  };

  // Зареждам броячи за определени статии/инициативи
  const loadContentViewCounts = async (contentIds, contentType = 'article') => {
    setIsLoading(true);
    try {
      const counts = await fetchViewCounts(contentIds, contentType);
      
      // Трансформирам данните в правилен формат за state
      const transformedCounts = {};
      Object.entries(counts).forEach(([id, count]) => {
        const key = `${contentType}_${id}`;
        transformedCounts[key] = count;
      });
      
      setViewCounts(prev => ({
        ...prev,
        ...transformedCounts
      }));
    } catch (error) {
      console.error('Error loading content view counts', error);
    }
    setIsLoading(false);
  };

  // Запазвам за backward compatibility
  const loadArticleViewCounts = async (articleIds) => {
    return loadContentViewCounts(articleIds, 'article');
  };

  // Зареждам броячи специално за инициативи
  const loadInitiativeViewCounts = async (initiativeIds) => {
    return loadContentViewCounts(initiativeIds, 'initiative');
  };

  // Общa функция за получаване на view count
  const getViewCount = (contentId, contentType = 'article') => {
    try {
      const key = `${contentType}_${contentId}`;
      
      // Проверявам в state-а
      if (viewCounts[key] !== undefined) {
        return viewCounts[key];
      }
      
      // Ако няма в state-а, връщам 0 вместо да търся в сървиза
      // защото може да причини грешки
      return 0;
    } catch (error) {
      console.error('Error getting view count:', error);
      return 0;
    }
  };

  // Wrapper функции за backward compatibility
  const getArticleViewCount = (articleId) => {
    return getViewCount(articleId, 'article');
  };

  const getInitiativeViewCount = (initiativeId) => {
    return getViewCount(initiativeId, 'initiative');
  };

  return (
    <AnalyticsContext.Provider value={{ 
      viewCounts, 
      isLoading, 
      
      // Основни функции
      getViewCount,
      loadContentViewCounts,
      
      // Функции за статии (backward compatibility)
      trackArticle,
      loadArticleViewCounts,
      getArticleViewCount,
      
      // Функции за инициативи
      trackInitiative,
      loadInitiativeViewCounts,
      getInitiativeViewCount
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};