import { useState, useEffect, useCallback } from 'react';
import { useClubContext } from '../contexts/ClubContext';
import { notify } from '../../utils/notify';

export const useCreateClub = (clubId = null, isEditMode = false, mode = 'create') => {
  const isContinueMode = mode === 'continue';
  
  const initialState = {
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    foundedYear: '',
    category: 'general',
    status: 'active',
    logo: '',
    mainImage: '',
    gallery: [],
    pensionersSpecific: {
      healthServices: {
        regularCheckups: false,
        bloodPressureMonitoring: false,
        healthLectures: [],
        medicalPartners: [],
        emergencyProtocol: {
          hasEmergencyPlan: false,
          emergencyContacts: [],
          nearestHospital: '',
          specialNeeds: []
        }
      },
      supportServices: {
        homeVisits: false,
        shoppingAssistance: false,
        documentHelp: false,
        companionship: false,
        transportService: false,
        mealDelivery: false,
        cleaningHelp: false,
        techSupport: false
      },
      accessibility: {
        wheelchairAccess: false,
        elevatorAccess: false,
        hearingLoop: false,
        largeTextMaterials: false,
        handrails: false,
        nonSlipFloors: false,
        goodLighting: false,
        restingAreas: false
      },
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
    membership: {
      totalMembers: 0,
      ageGroups: {
        "под-60": 0,
        "60-70": 0,
        "70-80": 0,
        "80+": 0
      },
      membershipFee: { monthly: 0, yearly: 0, currency: 'BGN' },
      requirements: [],
      benefits: []
    },
    members: [],
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
    management: {
      board: []
    },
    media: {
      videos: [],
      virtualTour: '',
      audioFiles: []
    },
    finances: {
      budget: { yearly: 0, currency: 'BGN' },
      funding: [],
      sponsors: []
    },
    regionalInfo: {
      isCentralClub: false,
      centralClubId: '',
      affiliatedClubs: [],
      coverageArea: '',
      regionalRole: 'local'
    },
    preferences: {
      showFinances: true,
      showMembersList: true,
      allowOnlineRegistration: true,
      showContactForm: true,
      enableCalendar: true,
      showTestimonials: true,
      publicGallery: true,
      showStatistics: true,
      allowComments: true,
      showNewsSection: true
    },
    template: 'general'
  };

  const {
    createClub,
    updateClub,
    saveDraftClub,
    updateDraftClub,
    getDraftById,
    deleteDraftClub,
    getClubById,
  } = useClubContext();

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);
  const [nameChangedByUser, setNameChangedByUser] = useState(false);
  
  // ✅ НОВ ФЛАГ - показва дали е зареждано от localStorage
  const [hasLocalStorageData, setHasLocalStorageData] = useState(false);

  const getIdentifier = useCallback((data = formData) => {
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

  const hasValidIdentifier = useCallback((data = formData) => {
    const identifier = getIdentifier(data);
    return identifier !== null && identifier !== '';
  }, [formData, getIdentifier]);

  const generateSlug = useCallback((name) => {
    if (!name) return '';

    return name
      .toLowerCase()
      .trim()
      .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
      .replace(/д/g, 'd').replace(/е/g, 'e').replace(/ж/g, 'zh').replace(/з/g, 'z')
      .replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k').replace(/л/g, 'l')
      .replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o').replace(/п/g, 'p')
      .replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't').replace(/у/g, 'u')
      .replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'ts').replace(/ч/g, 'ch')
      .replace(/ш/g, 'sh').replace(/щ/g, 'sht').replace(/ъ/g, 'a').replace(/ь/g, 'y')
      .replace(/ю/g, 'yu').replace(/я/g, 'ya')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40)
      .replace(/-+$/, '');
  }, []);

  useEffect(() => {
    if (formData.name && (
      (!clubId && (!isDraft || nameChangedByUser)) ||
      (isEditMode && nameChangedByUser) ||
      (isContinueMode && nameChangedByUser)
    )) {
      const newSlug = generateSlug(formData.name);
      setFormData(prev => ({ ...prev, slug: newSlug }));
      setNameChangedByUser(false);
    }
  }, [formData.name, generateSlug, clubId, isDraft, nameChangedByUser, isEditMode, isContinueMode]);

  const getLocalStorageKey = useCallback(() => {
    if (!clubId) {
      return 'club-draft-new';
    }
    return `club-draft-${clubId}`;
  }, [clubId]);

  useEffect(() => {
    const loadExistingData = async () => {
      if (clubId && !isLoadedFromStorage) {
        try {
          setIsLoading(true);
          let dataToLoad;

          if (isContinueMode) {
            dataToLoad = await getDraftById(clubId);
            setIsDraft(true);
            setDraftId(clubId);
          } else if (isEditMode) {
            dataToLoad = await getClubById(clubId);
          }

          if (dataToLoad) {
            setFormData(dataToLoad);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setIsLoading(false);
          setIsLoadedFromStorage(true);
        }
      } else {
        setIsLoadedFromStorage(true);
      }
    };

    loadExistingData();
  }, [clubId, isEditMode, isContinueMode]);

  // ✅ ОБНОВЕН - сетва флага при зареждане от localStorage
  useEffect(() => {
    if (isLoadedFromStorage) {
      const savedData = localStorage.getItem(getLocalStorageKey());
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          const loadedData = parsed.data || formData;
          
          setFormData(loadedData);
          setLastSaved(new Date(parsed.timestamp));
          setIsDraft(true);
          
          // ✅ ФЛАГ - има данни от localStorage
          setHasLocalStorageData(true);
          
          if (parsed.draftId) {
            setDraftId(parsed.draftId);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [isLoadedFromStorage, getLocalStorageKey]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Namnet на клуба трябва да е поне 3 символа';
    }

    if (formData.name && formData.slug && formData.slug.length > 40) {
      newErrors.slug = 'Slug не може да е по-дълъг от 40 символа';
    }

    if (formData.contacts.email && !/\S+@\S+\.\S+/.test(formData.contacts.email)) {
      newErrors['contacts.email'] = 'Невалиден email адрес';
    }

    if (!hasValidIdentifier()) {
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

  const saveToLocalStorage = useCallback(() => {
    const key = getLocalStorageKey();
    const dataToSave = {
      data: formData,
      timestamp: new Date().toISOString(),
      draftId: draftId
    };

    localStorage.setItem(key, JSON.stringify(dataToSave));
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  }, [formData, getLocalStorageKey, draftId]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        saveToLocalStorage();
      }, 30000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, saveToLocalStorage]);

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

    if (path === 'name' && isLoadedFromStorage) {
      setNameChangedByUser(true);
    }

    setHasUnsavedChanges(true);

    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: null }));
    }
  }, [errors, isLoadedFromStorage]);

  // ✅ ГЛАВНАТА ПОПРАВКА
  const saveDraft = useCallback(async () => {
    try {
      setIsLoading(true);

      let result;

      if (isContinueMode && clubId) {
        result = await updateDraftClub(clubId, formData);
      } else if (isEditMode && draftId) {
        result = await updateDraftClub(draftId, formData);
      } else if (isEditMode && !draftId) {
        result = await saveDraftClub(formData);
        if (result && result.id) {
          setDraftId(result.id);
        }
      } else if (draftId) {
        const identifier = getIdentifier();
        result = await updateDraftClub(identifier, formData);
      } else if (hasLocalStorageData && formData.slug) {
        // ✅ АКО Е ЗАРЕДЕНО ОТ localStorage - UPDATE СЪС SLUG
        result = await updateDraftClub(formData.slug, formData);
        if (result && result.id) {
          setDraftId(result.id);
        }
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
  }, [formData, draftId, clubId, isContinueMode, isEditMode, hasLocalStorageData, saveDraftClub, updateDraftClub, saveToLocalStorage, getIdentifier]);

  const submitClub = useCallback(async () => {
    if (!validateForm()) {
      notify('error', 'Моля, поправете грешките във формата');
      return false;
    }

    try {
      setIsLoading(true);

      let result;

      if (isEditMode && clubId) {
        result = await updateClub(clubId, formData);
      } else if (isContinueMode || isDraft) {
        result = await createClub(formData);
      } else if (clubId || formData.id) {
        const updateIdentifier = clubId || formData.id;
        result = await updateClub(updateIdentifier, formData);
      } else {
        result = await createClub(formData);
      }

      if (result) {
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
        setHasLocalStorageData(false);

        return result;
      }

      return false;
    } catch (error) {
      console.error('Error submitting club:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [formData, clubId, isEditMode, isContinueMode, isDraft, validateForm, createClub, updateClub, draftId, deleteDraftClub, getLocalStorageKey]);

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
    setHasLocalStorageData(false);
  }, [getLocalStorageKey]);

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
    formData,
    errors,
    isLoading,
    isDraft,
    draftId,
    lastSaved,
    hasUnsavedChanges,
    updateField,
    generateSlug,
    saveToLocalStorage,
    getIdentifier,
    hasValidIdentifier,
    saveDraft,
    submitClub,
    validateForm,
    clearDraft,
    resetForm
  };
};