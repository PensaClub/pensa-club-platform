/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {trackArticleView, loadViewCounts, fetchViewCounts } from '../Services/analyticsService';

const AnalyticsContext = createContext();

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  const [viewCounts, setViewCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Зареждане на началните броячи при монтиране
  useEffect(() => {
    const initialCounts = loadViewCounts();
    setViewCounts(initialCounts);
    setIsLoading(false);
  }, []);

  // Функция за проследяване на преглед на статия
  const trackArticle = (articleId, articleTitle) => {
    trackArticleView(articleId, articleTitle);
    
    setViewCounts(prev => ({
      ...prev,
      [articleId]: (prev[articleId] || 0) + 1
    }));
  };

  // Функция за зареждане на броячи за определени статии
  const loadArticleViewCounts = async (articleIds) => {
    setIsLoading(true);
    try {
      const counts = await fetchViewCounts(articleIds);
      setViewCounts(prev => ({
        ...prev,
        ...counts
      }));
    } catch (error) {
      console.error('Error loading article view counts', error);
    }
    setIsLoading(false);
  };

  const getViewCount = (articleId) => {
    return viewCounts[articleId] || 0;
  };

  return (
    <AnalyticsContext.Provider value={{ 
      viewCounts, 
      isLoading, 
      trackArticle, 
      loadArticleViewCounts,
      getViewCount
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};