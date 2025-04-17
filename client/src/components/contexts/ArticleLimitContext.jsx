// ArticleLimitContext.jsx
import { createContext, useContext, useState } from 'react';
import ArticleLimitAssistant from '../ArticleLimitAssistant/ArticleLimitAssistant';

const ArticleLimitContext = createContext();

export const ArticleLimitProvider = ({ children }) => {
  const [showLimitAssistant, setShowLimitAssistant] = useState(false);

  const showAssistant = () => {
    setShowLimitAssistant(true);
  };

  const hideAssistant = () => {
    setShowLimitAssistant(false);
  };

  return (
    <ArticleLimitContext.Provider value={{ showAssistant }}>
      {children}
      <ArticleLimitAssistant 
        isVisible={showLimitAssistant} 
        onClose={hideAssistant} 
      />
    </ArticleLimitContext.Provider>
  );
};

export const useArticleLimit = () => {
  return useContext(ArticleLimitContext);
};