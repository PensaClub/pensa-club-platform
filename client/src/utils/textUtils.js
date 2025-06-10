// Функция за правилна граматика с i18n поддръжка
export const getCountText = (count, t, countType) => {
  const singularKey = `counts.${countType}.singular`;
  const pluralKey = `counts.${countType}.plural`;
  
  if (count === 1) {
    return `${count} ${t(singularKey)}`;
  } else {
    return `${count} ${t(pluralKey)}`;
  }
};

// Специфични функции за удобство
export const getViewCountText = (count, t) => {
  return getCountText(count, t, 'view');
};

export const getLikesCountText = (count, t) => {
  return getCountText(count, t, 'like');
};

export const getDownloadsCountText = (count, t) => {
  return getCountText(count, t, 'download');
};

export const getCommentsCountText = (count, t) => {
  return getCountText(count, t, 'comment');
};

export const getArticlesCountText = (count, t) => {
  return getCountText(count, t, 'article');
};