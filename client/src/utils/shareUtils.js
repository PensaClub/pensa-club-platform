export const generateShareUrls = (url, title, description = '') => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const fullText = encodeURIComponent(`${title}\n\n${description}\n\n${url}`);
  
  return {
    viber: {
      mobile: `viber://forward?text=${fullText}`,
      desktop: `https://3p3x.adj.st/?adjust_t=u783g1_kw9yml&adjust_fallback=https%3A%2F%2Fwww.viber.com%2F&adjust_campaign=share&adjust_deeplink=viber%3A%2F%2Fforward%3Ftext%3D${fullText}`
    },
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    instagram: {
      note: 'Instagram не поддържа direct URL sharing. Копирайте линка и го поставете в Instagram.',
      action: 'copy_link'
    },
    email: `mailto:?subject=${encodedTitle}&body=${fullText}`
  };
};

export const detectBulgarianPreferences = () => {
  // Може да добавим логика за detecting българските предпочитания
  // базирано на browser language, location, etc.
  const language = navigator.language || navigator.userLanguage;
  const isBulgarian = language.startsWith('bg');
  
  return {
    isBulgarian,
    preferredPlatforms: isBulgarian ? ['viber', 'telegram', 'instagram'] : ['telegram', 'instagram', 'email']
  };
};