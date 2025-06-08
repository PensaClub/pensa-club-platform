import ReactGA from 'react-ga4';

// Локално съхранение на броячи на посещения, за да избегнем множество заявки към GA
const localViewCountCache = {};

// Инициализиране на Google Analytics
export const initGA = (trackingId) => {
  if (trackingId) {
    ReactGA.initialize(trackingId);
    // console.log('Google Analytics initialized');
    return true;
  }
  return false;
};

// Проследяване на посещение на страница
export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
  console.log(`Page view tracked: ${path}`);
};

// Проследяване на посещение на статия
export const trackArticleView = (articleId, articleTitle) => {
  ReactGA.event({
    category: 'Article',
    action: 'View',
    label: articleTitle,
    value: 1,
    article_id: articleId
  });

  // Актуализира локалния кеш на броячите за статии
  const key = `article_${articleId}`;
  if (localViewCountCache[key]) {
    localViewCountCache[key]++;
  } else {
    localViewCountCache[key] = 1;
  }

  // Запазване на посещенията в localStorage
  saveViewCounts();
};

// Проследяване на посещение на инициатива 
export const trackInitiativeView = (initiativeId, initiativeTitle) => {
  ReactGA.event({
    category: 'Initiative',
    action: 'View',
    label: initiativeTitle,
    value: 1,
    initiative_id: initiativeId
  });

  // Актуализира локалния кеш на броячите за инициативи
  const key = `initiative_${initiativeId}`;
  if (localViewCountCache[key]) {
    localViewCountCache[key]++;
  } else {
    localViewCountCache[key] = 1;
  }

  // Запазване на посещенията в localStorage
  saveViewCounts();
};

// Общa функция за проследяване на различни типове съдържание
export const trackView = (contentId, contentTitle, contentType = 'article') => {
  if (contentType === 'article') {
    trackArticleView(contentId, contentTitle);
  } else if (contentType === 'initiative') {
    trackInitiativeView(contentId, contentTitle);
  }
};

// Запазване на кеша на посещенията в localStorage
const saveViewCounts = () => {
  try {
    localStorage.setItem('viewCounts', JSON.stringify(localViewCountCache));
  } catch (error) {
    console.error('Error saving view counts to localStorage', error);
  }
};

// Зареждане на броячите от localStorage
export const loadViewCounts = () => {
  try {
    // Зареди стария формат за backward compatibility
    const oldArticleCounts = localStorage.getItem('articleViewCounts');
    if (oldArticleCounts) {
      const parsedOldCounts = JSON.parse(oldArticleCounts);
      // Мигрирай стария формат към новия
      Object.entries(parsedOldCounts).forEach(([id, count]) => {
        localViewCountCache[`article_${id}`] = count;
      });
      // Премахни стария формат
      localStorage.removeItem('articleViewCounts');
      saveViewCounts();
    }

    // Зареди новия формат
    const savedCounts = localStorage.getItem('viewCounts');
    if (savedCounts) {
      const parsedCounts = JSON.parse(savedCounts);
      Object.assign(localViewCountCache, parsedCounts);
    }
  } catch (error) {
    console.error('Error loading view counts from localStorage', error);
  }
  return localViewCountCache;
};

// Получаване на броя на посещенията за определена статия (backward compatibility)
export const getArticleViewCount = (articleId) => {
  return localViewCountCache[`article_${articleId}`] || 0;
};

// Получаване на броя на посещенията за определена инициатива
export const getInitiativeViewCount = (initiativeId) => {
  return localViewCountCache[`initiative_${initiativeId}`] || 0;
};

// Общa функция за получаване на view count
export const getViewCount = (contentId, contentType = 'article') => {
  const key = `${contentType}_${contentId}`;
  return localViewCountCache[key] || 0;
};

// Симулиране на заявка към API за реални приложения, които получават данни от сървър
export const fetchViewCounts = async (contentIds, contentType = 'article') => {
  // В реално приложение, тук би имало заявка към сървър
  // За демо целите използваме localStorage
  loadViewCounts();

  // Симулираме някакво случайно начално число за съдържание без посещения
  const result = {};
  contentIds.forEach(id => {
    const key = `${contentType}_${id}`;
    if (!localViewCountCache[key]) {
      localViewCountCache[key] = Math.floor(Math.random() * 50) + 1;
      saveViewCounts();
    }
    result[id] = localViewCountCache[key];
  });

  return result;
};

// За backward compatibility - wrapper функции
export const fetchArticleViewCounts = async (articleIds) => {
  return fetchViewCounts(articleIds, 'article');
};

export const fetchInitiativeViewCounts = async (initiativeIds) => {
  return fetchViewCounts(initiativeIds, 'initiative');
};