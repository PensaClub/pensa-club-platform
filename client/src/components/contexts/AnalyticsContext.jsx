/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  trackView,
  trackArticleView,
  trackInitiativeView,
  trackDownload,
  loadViewCounts,
  fetchViewCounts,
  fetchDownloadCounts,
  getDownloadCount,
  trackShare,
  fetchShareCounts,
  getShareCount,
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

  // Проследяване на story/publication прегледи
  const trackStoryOrPublication = async (contentId, contentTitle, contentType) => {
    try {
      // Определяме правилния тип за analytics
      const analyticsType = contentType === 'story' ? 'story' : 'publication';

      // Използваме общата trackView функция
      await trackView(contentId, contentTitle, analyticsType);

      const key = `${analyticsType}_${contentId}`;
      setViewCounts(prev => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    } catch (error) {
      console.error('Error tracking story/publication:', error);
    }
  };

  // Track download
  const trackContentDownload = async (contentId, contentTitle, contentType, fileType, fileSize) => {
    try {
      await trackDownload(contentId, contentTitle, contentType, fileType, fileSize);

      // Актуализираме state-а за downloads
      const key = `${contentType}_${contentId}_downloads`;
      setViewCounts(prev => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  };

  // Track share
  const trackContentShare = (contentId, contentTitle, contentType, shareMethod) => {
    try {
      const userAgent = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';

      trackShare(contentId, contentTitle, contentType, shareMethod, userAgent);

      // Актуализираме state-а за shares
      const key = `${contentType}_${contentId}_shares`;
      setViewCounts(prev => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    } catch (error) {
      console.error('Error tracking share:', error);
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

  // Зареждане на download counts
  const loadDownloadCounts = async (contentIds, contentType = 'publication') => {
    setIsLoading(true);
    try {
      const counts = await fetchDownloadCounts(contentIds, contentType);

      const transformedCounts = {};
      Object.entries(counts).forEach(([id, count]) => {
        const key = `${contentType}_${id}_downloads`;
        transformedCounts[key] = count;
      });

      setViewCounts(prev => ({
        ...prev,
        ...transformedCounts
      }));
    } catch (error) {
      console.error('Error loading download counts', error);
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

  // Зареждам броячи за stories/publications
  const loadStoryViewCounts = async (storyIds) => {
    return loadContentViewCounts(storyIds, 'story');
  };

  const loadPublicationViewCounts = async (publicationIds) => {
    return loadContentViewCounts(publicationIds, 'publication');
  };

  // Зареждане на share counts
  const loadShareCounts = async (contentIds, contentType = 'story') => {
    setIsLoading(true);
    try {
      const counts = await fetchShareCounts(contentIds, contentType);

      const transformedCounts = {};
      Object.entries(counts).forEach(([id, count]) => {
        const key = `${contentType}_${id}_shares`;
        transformedCounts[key] = count;
      });

      setViewCounts(prev => ({
        ...prev,
        ...transformedCounts
      }));
    } catch (error) {
      console.error('Error loading share counts', error);
    }
    setIsLoading(false);
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

  // Получаване на download count
  const getCurrentDownloadCount = (contentId, contentType = 'publication') => {
    try {
      const key = `${contentType}_${contentId}_downloads`;

      if (viewCounts[key] !== undefined) {
        return viewCounts[key];
      }

      return 0;
    } catch (error) {
      console.error('Error getting download count:', error);
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

  // Wrapper функции за stories/publications
  const getStoryViewCount = (storyId) => {
    return getViewCount(storyId, 'story');
  };

  const getPublicationViewCount = (publicationId) => {
    return getViewCount(publicationId, 'publication');
  };

  // Получаване на share count
  const getCurrentShareCount = (contentId, contentType = 'story') => {
    try {
      const key = `${contentType}_${contentId}_shares`;

      if (viewCounts[key] !== undefined) {
        return viewCounts[key];
      }

      return 0;
    } catch (error) {
      console.error('Error getting share count:', error);
      return 0;
    }
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
      getInitiativeViewCount,

      // Функции за stories и publications
      trackStoryOrPublication,
      loadStoryViewCounts,
      loadPublicationViewCounts,
      getStoryViewCount,
      getPublicationViewCount,
      getDownloadCount,
      // saveViewCounts,
      // downloads
      trackContentDownload,
      loadDownloadCounts,
      getCurrentDownloadCount,
      // shares
      trackContentShare,
      loadShareCounts,
      getCurrentShareCount
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
