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

  // Актуализира локалния кеш на броячите
  if (localViewCountCache[articleId]) {
    localViewCountCache[articleId]++;
  } else {
    localViewCountCache[articleId] = 1;
  }

  // Запазване на посещенията в localStorage
  saveViewCounts();

  console.log(`Article view tracked: ${articleTitle} (${articleId})`);
};

// Запазване на кеша на посещенията в localStorage
const saveViewCounts = () => {
  try {
    localStorage.setItem('articleViewCounts', JSON.stringify(localViewCountCache));
  } catch (error) {
    console.error('Error saving view counts to localStorage', error);
  }
};

// Зареждане на броячите от localStorage
export const loadViewCounts = () => {
  try {
    const savedCounts = localStorage.getItem('articleViewCounts');
    if (savedCounts) {
      const parsedCounts = JSON.parse(savedCounts);
      Object.assign(localViewCountCache, parsedCounts);
    }
  } catch (error) {
    console.error('Error loading view counts from localStorage', error);
  }
  return localViewCountCache;
};

// Получаване на броя на посещенията за определена статия
export const getArticleViewCount = (articleId) => {
  return localViewCountCache[articleId] || 0;
};

// Симулиране на заявка към API за реални приложения, които получават данни от сървър
export const fetchViewCounts = async (articleIds) => {
  // В реално приложение, тук би имало заявка към вашия сървър
  // За демо целите използваме localStorage
  loadViewCounts();

  // Симулираме някакво случайно начално число за статии без посещения
  const result = {};
  articleIds.forEach(id => {
    if (!localViewCountCache[id]) {
      localViewCountCache[id] = Math.floor(Math.random() * 50) + 1;
      saveViewCounts();
    }
    result[id] = localViewCountCache[id];
  });

  return result;
};
