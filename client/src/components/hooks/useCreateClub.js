import { useState, useEffect, useCallback } from 'react';
import { useClubContext } from '../contexts/ClubContext';
import { notify } from '../../utils/notify';

export const useCreateClub = (clubId = null) => {
  // Initial form state с обновена медия структура
  const initialState = {
    // Основна информация
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    foundedYear: new Date().getFullYear(),
    category: 'general',
    status: 'active',
    logo: '',              // ОБНОВЕНО: string URL
    mainImage: '',         // ОБНОВЕНО: string URL  
    gallery: [],           // ОБНОВЕНО: string[] URLs
    // Специфични за пенсионери
pensionersSpecific: {
  healthServices: {
    healthLectures: [],
    medicalPartners: [],
    emergencyProtocol: {}
  },
  supportServices: {},
  accessibility: {},
  specialPrograms: {
    memoryActivities: [],
    intergenerationalPrograms: [],
    volunteerPrograms: [],
    mentalHealthSupport: []
  },
  ageSpecificNeeds: {
    lowImpactActivities: [],
    nutritionSupport: []
  }
},
    // Местоположение
    location: {
      address: '',
      city: '',
      municipality: '',
      region: '',
      postalCode: '',
      coordinates: { lat: 0, lng: 0 },
      venue: {
        type: 'municipal',
        size: '',
        capacity: 0,
        facilities: [],
        accessibility: false
      }
    },

    // Членство с добавена възрастова група под 60
    membership: {
      totalMembers: 0,
      ageGroups: { 
        "под-60": 0,    // НОВО за ветерани и други пенсионери
        "60-70": 0, 
        "70-80": 0, 
        "80+": 0 
      },
      membershipFee: { monthly: 0, yearly: 0, currency: 'BGN' },
      requirements: [],
      benefits: []
    },

    // Членове
    members: [],

    // Контакти
    contacts: {
      phone: '',
      mobile: '',
      email: '',
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        youtube: '',
        twitter: '',
        linkedin: ''
      },
      workingHours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      }
    },

    // Дейности
    activities: {
  regular: [],
  events: [],
  trips: [],
  courses: []
},
achievements: {
  awards: [],
  certificates: [],
  recognitions: []
},
socialImpact: {
  volunteering: [],
  communityProjects: [],
  partnerships: []
},
    // Управление
    management: {
      board: []
    },

    // Медия - ОБНОВЕНА СТРУКТУРА
    media: {
      videos: [
        // {
        //   src: "", alt: "", caption: "", type: "", duration: "", thumbnail: ""
        // }
      ],
      virtualTour: '',      // string URL
      audioFiles: [
        // {
        //   src: "", alt: "", caption: "", duration: ""
        // }
      ]
    },

    // Финанси
    finances: {
      budget: { yearly: 0, currency: 'BGN' },
      funding: [],
      sponsors: []
    },

    // Регионална информация
    regionalInfo: {
      isCentralClub: false,
      centralClubId: '',
      affiliatedClubs: [],
      coverageArea: '',
      regionalRole: 'local'
    },

    // Настройки
    preferences: {
      showFinances: false,
      showMembersList: false,
      allowOnlineRegistration: false,
      showContactForm: false,
      enableCalendar: false,
      showTestimonials: false,
      publicGallery: false,
      showStatistics: false,
      allowComments: false,
      showNewsSection: false
    },

    // Шаблон
    template: 'general'
  };

  // Взимаме функциите от ClubContext
  const { 
    createClub,
    updateClub,
    deleteClub,
    saveDraftClub,
    updateDraftClub,
    getDraftById,
    deleteDraftClub
  } = useClubContext();
  
  // State
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);
const [nameChangedByUser, setNameChangedByUser] = useState(false);

  // Helper function за identifier (slug или ID)
  const getIdentifier = useCallback((data = formData) => {
    // Приоритет: slug > id > draftId > clubId
    if (data.slug && data.slug.trim()) {
      return data.slug.trim();
    }
    if (data.id) {
      return data.id;
    }
    if (draftId) {
      return draftId;
    }
    if (clubId) {
      return clubId;
    }
    return null;
  }, [formData, draftId, clubId]);

  // Helper function за проверка дали имаме валиден identifier
  const hasValidIdentifier = useCallback((data = formData) => {
    const identifier = getIdentifier(data);
    return identifier !== null && identifier !== '';
  }, [formData, getIdentifier]);

  // Slug генератор
  const generateSlug = useCallback((name) => {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .trim()
      // Заменяме кирилица с латиница
      .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
      .replace(/д/g, 'd').replace(/е/g, 'e').replace(/ж/g, 'zh').replace(/з/g, 'z')
      .replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k').replace(/л/g, 'l')
      .replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o').replace(/п/g, 'p')
      .replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't').replace(/у/g, 'u')
      .replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'ts').replace(/ч/g, 'ch')
      .replace(/ш/g, 'sh').replace(/щ/g, 'sht').replace(/ъ/g, 'a').replace(/ь/g, 'y')
      .replace(/ю/g, 'yu').replace(/я/g, 'ya')
      // Премахваме неразрешени символи
      .replace(/[^a-z0-9\s-]/g, '')
      // Заменяме интервали и множествени тирета с единично тире
      .replace(/[\s-]+/g, '-')
      // Премахваме тирета от началото и края
      .replace(/^-+|-+$/g, '')
      // Ограничаваме до 40 символа
      .substring(0, 40)
      // Премахваме тире в края ако е отрязано
      .replace(/-+$/, '');
  }, []);

  // Auto-generate slug при промяна на името
useEffect(() => {
  const savedData = localStorage.getItem(getLocalStorageKey());
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.data || initialState);
      setLastSaved(new Date(parsed.timestamp));
      setDraftId(parsed.draftId);
      setIsDraft(true);
      setIsLoadedFromStorage(true);
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }
  setIsLoadedFromStorage(true);
}, []);

// Auto-generate slug - САМО ако НЕ е заредено от localStorage
useEffect(() => {

  if (formData.name && !clubId && (!isDraft || nameChangedByUser)) {
    const newSlug = generateSlug(formData.name);
    setFormData(prev => ({ ...prev, slug: newSlug }));
    setNameChangedByUser(false); // Reset флага
  }
}, [formData.name, generateSlug, clubId, isDraft, nameChangedByUser]);

  // LocalStorage key с fallback
 const getLocalStorageKey = useCallback(() => {
  // За нови клубове ВИНАГИ използвай фиксиран ключ
  if (!clubId) {
    return 'club-draft-new';
  }
  
  // За редактиране на съществуващи клубове използвай clubId
  return `club-draft-${clubId}`;
}, [clubId]);

  // Load от localStorage при mount
  // useEffect(() => {
  //   const savedData = localStorage.getItem(getLocalStorageKey());
  //   if (savedData) {
  //     try {
  //       const parsed = JSON.parse(savedData);
  //       setFormData(prev => ({ ...prev, ...parsed.data }));
  //       setLastSaved(new Date(parsed.timestamp));
  //       setDraftId(parsed.draftId);
  //       setIsDraft(true);
  //     } catch (error) {
  //       console.error('Error loading draft:', error);
  //     }
  //   }
  // }, []);

  // Load existing draft при редактиране
  useEffect(() => {
    const loadExistingDraft = async () => {
      if (clubId) {
        try {
          setIsLoading(true);
          const draft = await getDraftById(clubId);
          if (draft) {
            setFormData(draft);
            setDraftId(clubId);
            setIsDraft(true);
          }
        } catch (error) {
          console.error('Error loading existing draft:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingDraft();
  }, [clubId, getDraftById]);

  // Валидация
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Име на клуб - единственото задължително поле
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Namnet на клуба трябва да е поне 3 символа';
    }

    // Slug валидация - може да е празен, ще използваме ID
    if (formData.name && formData.slug && formData.slug.length > 40) {
      newErrors.slug = 'Slug не може да е по-дълъг от 40 символа';
    }

    // Email валидация ако е попълнен
    if (formData.contacts.email && !/\S+@\S+\.\S+/.test(formData.contacts.email)) {
      newErrors['contacts.email'] = 'Невалиден email адрес';
    }

    // Проверка дали имаме поне един идентификатор
    if (!hasValidIdentifier()) {
      // Ако няма slug и се създава нов клуб, генерираме slug
      if (!clubId && formData.name) {
        const newSlug = generateSlug(formData.name);
        if (newSlug) {
          setFormData(prev => ({ ...prev, slug: newSlug }));
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, hasValidIdentifier, clubId, generateSlug]);

  // Save в localStorage
  const saveToLocalStorage = useCallback(() => {
  const key = getLocalStorageKey(); // Винаги ще е 'club-draft-new' за нови клубове
  const dataToSave = {
    data: formData,
    timestamp: new Date().toISOString(),
    draftId: draftId
  };
  
  localStorage.setItem(key, JSON.stringify(dataToSave));
  setLastSaved(new Date());
  setHasUnsavedChanges(false);
}, [formData, getLocalStorageKey, draftId]);

  // Auto-save всеки 30 секунди ако има промени
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        saveToLocalStorage();
      }, 30000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, saveToLocalStorage]);

  // Update field
 const updateField = useCallback((path, value) => {
  setFormData(prev => {
    const newData = { ...prev };
    const keys = path.split('.');
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    return newData;
  });
  
  // Ако потребителят променя името, маркирай това
  if (path === 'name' && isLoadedFromStorage) {
    setNameChangedByUser(true);
  }
  
  setHasUnsavedChanges(true);
  
  // Clear field error ако съществува
  if (errors[path]) {
    setErrors(prev => ({ ...prev, [path]: null }));
  }
}, [errors, isLoadedFromStorage]);

  // DRAFT функции
  const saveDraft = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let result;
      if (draftId) {
        // Update съществуваща чернова - използваме identifier
        const identifier = getIdentifier();
        result = await updateDraftClub(identifier, formData);
      } else {
        // Създай нова чернова
        result = await saveDraftClub(formData);
        if (result && result.id) {
          setDraftId(result.id);
        }
      }
      
      setIsDraft(true);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      saveToLocalStorage();
      
      return result;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [formData, draftId, saveDraftClub, updateDraftClub, saveToLocalStorage, getIdentifier]);

  // SUBMIT функция
  // SUBMIT функция - ПРАВИЛНА ЛОГИКА ЗА SLUG
const submitClub = useCallback(async () => {
  if (!validateForm()) {
    notify('error', 'Моля, поправете грешките във формата');
    return false;
  }

  try {
    setIsLoading(true);
    
    let result;
    
    // ПРАВИЛНА ЛОГИКА: 
    // UPDATE само ако редактираме СЪЩЕСТВУВАЩ клуб (имаме clubId или formData.id)
    // CREATE във всички други случаи (дори и да има slug в данните)
    if (clubId || formData.id) {
      // UPDATE - редактираме съществуващ клуб
      const updateIdentifier = clubId || formData.id;
      console.log('🔄 UPDATE клуб с identifier:', updateIdentifier);
      result = await updateClub(updateIdentifier, formData);
    } else {
      // CREATE - създаваме нов клуб (slug е в formData)
      console.log('✅ CREATE нов клуб със slug:', formData.slug);
      result = await createClub(formData);
    }
    
    if (result) {
      // Изчисти чернова след успешно създаване/обновяване
      if (draftId) {
        try {
          await deleteDraftClub(draftId);
        } catch (deleteError) {
          console.warn('Could not delete draft:', deleteError);
        }
      }
      localStorage.removeItem(getLocalStorageKey());
      
      setIsDraft(false);
      setDraftId(null);
      setHasUnsavedChanges(false);
      
      return result;
    }
    
    return false;
  } catch (error) {
    console.error('Error submitting club:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
}, [formData, clubId, validateForm, createClub, updateClub, draftId, deleteDraftClub, getLocalStorageKey]);

  // RESET функция
  const resetForm = useCallback(() => {
  const key = getLocalStorageKey();
  localStorage.removeItem(key);
  setFormData(initialState);
  setErrors({});
  setIsDraft(false);
  setDraftId(null);
  setHasUnsavedChanges(false);
  setIsLoadedFromStorage(false);
  setNameChangedByUser(false);
}, [getLocalStorageKey]);

  // CLEAR DRAFT функция
  const clearDraft = useCallback(async () => {
    try {
      if (draftId) {
        const identifier = getIdentifier();
        await deleteDraftClub(identifier || draftId);
      }
      localStorage.removeItem(getLocalStorageKey());
      resetForm();
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [draftId, deleteDraftClub, getLocalStorageKey, resetForm, getIdentifier]);

  return {
    // Data
    formData,
    errors,
    isLoading,
    isDraft,
    draftId,
    lastSaved,
    hasUnsavedChanges,
    
    // Methods
    updateField,
    generateSlug,
    saveToLocalStorage,
    getIdentifier,
    hasValidIdentifier,
    
    // CRUD операции
    saveDraft,
    submitClub,
    validateForm,
    clearDraft,
    resetForm
  };
};