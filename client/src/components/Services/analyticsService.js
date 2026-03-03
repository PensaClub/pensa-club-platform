import ReactGA from 'react-ga4';
import { initiativeServiceFactory } from './StoryPubServiceFactory';

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

  updateLocalCache(`article_${articleId}`);
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

  updateLocalCache(`initiative_${initiativeId}`);
};

// Проследяване на story и publication
export const trackStoryView = async (storyId, storyTitle) => {
  ReactGA.event({
    category: 'Story',
    action: 'View',
    label: storyTitle,
    value: 1,
    story_id: storyId
  });

  updateLocalCache(`story_${storyId}`);

  // Also call server endpoint to update database
  try {
    const token = localStorage.getItem('token');
    const service = initiativeServiceFactory(token);
    await service.trackStoryView(storyId);
  } catch (error) {
    console.error('Error tracking story view on server:', error);
  }
};

export const trackPublicationView = async (publicationId, publicationTitle) => {
  ReactGA.event({
    category: 'Publication',
    action: 'View',
    label: publicationTitle,
    value: 1,
    publication_id: publicationId
  });

  updateLocalCache(`publication_${publicationId}`);

  // Also call server endpoint to update database
  try {
    const token = localStorage.getItem('token');
    const service = initiativeServiceFactory(token);
    await service.trackPublicationView(publicationId);
  } catch (error) {
    console.error('Error tracking publication view on server:', error);
  }
};

//  Проследяване на download
export const trackDownload = async (contentId, contentTitle, contentType, fileType, fileSize) => {
  ReactGA.event({
    category: contentType === 'publication' ? 'Publication' : 'Document',
    action: 'Download',
    label: contentTitle,
    value: 1,
    content_id: contentId,
    file_type: fileType,
    file_size: fileSize
  });

  // Актуализираме локалния кеш за downloads
  const key = `${contentType}_${contentId}_downloads`;
  if (localViewCountCache[key]) {
    localViewCountCache[key]++;
  } else {
    localViewCountCache[key] = 1;
  }

  saveViewCounts();

  // Also call server endpoint to update database for publications
  if (contentType === 'publication') {
    try {
      const token = localStorage.getItem('token');
      const service = initiativeServiceFactory(token);
      await service.downloadPublication(contentId);
    } catch (error) {
      console.error('Error tracking publication download on server:', error);
    }
  }
};
// Проследяване на share events
export const trackShare = (contentId, contentTitle, contentType, shareMethod, userAgent = 'unknown') => {
  ReactGA.event({
    category: contentType === 'story' ? 'Story' : 'Publication',
    action: 'Share',
    label: `${shareMethod} - ${contentTitle}`,
    value: 1,
    content_id: contentId,
    share_method: shareMethod,
    user_agent: userAgent
  });

  // Актуализираме локалния кеш за shares
  const key = `${contentType}_${contentId}_shares`;
  if (localViewCountCache[key]) {
    localViewCountCache[key]++;
  } else {
    localViewCountCache[key] = 1;
  }

  saveViewCounts();
}

// Проследяване на посещение на полезна връзка
export const trackUsefulLinkView = async (linkId, linkTitle) => {
  ReactGA.event({
    category: 'UsefulLink',
    action: 'View',
    label: linkTitle,
    value: 1,
    link_id: linkId
  });

  updateLocalCache(`useful_link_${linkId}`);
};

// Получаване на view count за полезна връзка
export const getUsefulLinkViewCount = (linkId) => {
  return localViewCountCache[`useful_link_${linkId}`] || 0;
};

// Помощна функция за актуализация на локалния кеш
const updateLocalCache = (key) => {
  if (localViewCountCache[key]) {
    localViewCountCache[key]++;
  } else {
    localViewCountCache[key] = 1;
  }
  saveViewCounts();
};

// Общa функция за проследяване на различни типове съдържание
export const trackView = async (contentId, contentTitle, contentType = 'article') => {
  switch (contentType) {
    case 'article':
      trackArticleView(contentId, contentTitle);
      break;
    case 'initiative':
      trackInitiativeView(contentId, contentTitle);
      break;
    case 'story':
      await trackStoryView(contentId, contentTitle);
      break;
    case 'publication':
      await trackPublicationView(contentId, contentTitle);
      break;
    case 'usefulLink':
      await trackUsefulLinkView(contentId, contentTitle);
      break;
    default:
      console.warn(`Unknown content type: ${contentType}`);
  }
};

// Запазване на кеша на посещенията в localStorage
export const saveViewCounts = () => {
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

// Получаване на view counts за stories и publications
export const getStoryViewCount = (storyId) => {
  return localViewCountCache[`story_${storyId}`] || 0;
};

export const getPublicationViewCount = (publicationId) => {
  return localViewCountCache[`publication_${publicationId}`] || 0;
};

// Получаване на download count
export const getDownloadCount = (contentId, contentType = 'publication') => {
  const key = `${contentType}_${contentId}_downloads`;
  return localViewCountCache[key] || 0;
};

// Общa функция за получаване на view count
export const getViewCount = (contentId, contentType = 'article') => {
  const key = `${contentType}_${contentId}`;
  return localViewCountCache[key] || 0;
};

//Получаване на share count
export const getShareCount = (contentId, contentType = 'story') => {
  const key = `${contentType}_${contentId}_shares`;
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

// Fetch downloads counts
export const fetchDownloadCounts = async (contentIds, contentType = 'publication') => {
  loadViewCounts();

  const result = {};
  contentIds.forEach(id => {
    const key = `${contentType}_${id}_downloads`;
    if (!localViewCountCache[key]) {
      // Симулираме някакво случайно начално число за downloads
      localViewCountCache[key] = Math.floor(Math.random() * 20) + 1;
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

// Fetch функции за stories и publications
export const fetchStoryViewCounts = async (storyIds) => {
  return fetchViewCounts(storyIds, 'story');
};

export const fetchPublicationViewCounts = async (publicationIds) => {
  return fetchViewCounts(publicationIds, 'publication');
};
export const fetchShareCounts = async (contentIds, contentType = 'story') => {
  loadViewCounts();

  const result = {};
  contentIds.forEach(id => {
    const key = `${contentType}_${id}_shares`;
    if (!localViewCountCache[key]) {
      // Симулираме някакво случайно начално число за shares
      localViewCountCache[key] = Math.floor(Math.random() * 10) + 1;
      saveViewCounts();
    }
    result[id] = localViewCountCache[key];
  });

  return result;
};
