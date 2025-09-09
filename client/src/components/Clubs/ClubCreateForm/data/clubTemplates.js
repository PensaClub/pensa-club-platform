export const clubTemplates = {
  general: {
    id: 'general',
    name: 'Общ клуб',
    description: 'Универсален шаблон подходящ за всички видове клубове',
    features: [
      'Основна информация за клуба',
      'Галерия със снимки',
      'Контакти и местоположение',
      'Управителен съвет',
      'Дейности и събития'
    ],
    preview: '/images/templates/general-preview.jpg',
    thumbnail: '/images/templates/general-thumb.jpg',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    recommended: true,
    difficulty: 'easy',
    sections: [
      'hero', 'about', 'activities', 'events', 'management', 'gallery', 'location', 'contacts'
    ]
  },
  
  cultural: {
    id: 'cultural',
    name: 'Културен клуб',
    description: 'За клубове с фокус върху културни дейности и изкуства',
    features: [
      'Културни събития и изложби',
      'Галерия с произведения',
      'Творчески работилници',
      'Културни партньорства',
      'История на клуба'
    ],
    preview: '/images/templates/cultural-preview.jpg',
    thumbnail: '/images/templates/cultural-thumb.jpg',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    recommended: false,
    difficulty: 'medium',
    sections: [
      'hero', 'about', 'activities', 'events', 'management', 'gallery', 'location', 'contacts'
    ]
  },
  
  sports: {
    id: 'sports',
    name: 'Спортен клуб',
    description: 'За активни клубове със спортни и фитнес дейности',
    features: [
      'Фитнес програми',
      'Здравни дейности',
      'Спортни събития',
      'Проследяване на прогрес',
      'Партньори и спонсори'
    ],
    preview: '/images/templates/sports-preview.jpg',
    thumbnail: '/images/templates/sports-thumb.jpg',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    recommended: false,
    difficulty: 'medium',
    sections: [
      'hero', 'about', 'fitness', 'health', 'wellness', 'events', 'tracking', 'gallery', 'partners', 'location', 'contacts'
    ]
  },
  
  social: {
    id: 'social',
    name: 'Социален клуб',
    description: 'За клубове с благотворителни и социални дейности',
    features: [
      'Социални проекти',
      'Доброволчество',
      'Подкрепа за общността',
      'Партньорства',
      'Социално въздействие'
    ],
    preview: '/images/templates/social-preview.jpg',
    thumbnail: '/images/templates/social-thumb.jpg',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    recommended: false,
    difficulty: 'hard',
    sections: [
      'hero', 'about', 'projects', 'volunteering', 'support', 'impact', 'events', 'gallery', 'partnerships', 'location', 'contacts'
    ]
  },
  
  traditional: {
    id: 'traditional',
    name: 'Традиционен клуб',
    description: 'За клубове съхраняващи традиции и фолклор',
    features: [
      'Традиции и обичаи',
      'Фолклорни изпълнения',
      'Народни носии',
      'Традиционна музика',
      'Културен календар'
    ],
    preview: '/images/templates/traditional-preview.jpg',
    thumbnail: '/images/templates/traditional-thumb.jpg',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    recommended: false,
    difficulty: 'hard',
    sections: [
      'hero', 'about', 'traditions', 'folklore', 'performances', 'costumes', 'music', 'calendar', 'gallery', 'contacts', 'location'
    ]
  }
};

export const getTemplateById = (id) => {
  return clubTemplates[id] || clubTemplates.general;
};

export const getAllTemplates = () => {
  return Object.values(clubTemplates);
};

export const getRecommendedTemplate = () => {
  return Object.values(clubTemplates).find(template => template.recommended) || clubTemplates.general;
};

export const getTemplatesByDifficulty = (difficulty) => {
  return Object.values(clubTemplates).filter(template => template.difficulty === difficulty);
};