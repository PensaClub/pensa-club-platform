// hooks/useCreateProject.js
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 🔥 Firebase imports
import {
  uploadFileWithProgress,
  uploadDocumentWithProgress,
  compressImage,
  allowedImageTypes,
  allowedDocumentTypes,
  isValidDocument,
  formatFileSize,
  getFileIcon
} from '../Articles/articleUtils/file-utils';
import { useInitiativeContext } from '../contexts/InitiativeProvider';
import { useAuthContext } from '../contexts/UserContext';

// 🎨 Editor utilities
import {
  createSlateEditorState,
  createEditorForField,
  validateEditorField,
  convertEditorToHtml,
  isSlateEmpty,
  isDraftEmpty
} from '../Initiatives/CreateIniciative/Utils/initiativeEditorUtils.jsx';
import { notify } from '../../utils/notify.jsx';
import {
  uploadInitiativeImages,
  uploadSectionImages,
  deleteSingleImage,
  deleteInitiativeImages,
  processInitiativeImageChanges
} from '../../utils/initiative-firebase-utils';
import { useTranslation } from 'react-i18next';
import { useRealTimeValidation } from './useRealTimeValidation';
import { htmlToSlate, isHtmlContent } from '../Initiatives/CreateIniciative/Utils/htmlToSlate';
import { validateProjectForm } from '../Initiatives/CreateProject/utils/validateProjectForm';
import { slateToHtml } from '../../utils/slateToHtml';
import { useProjectRealTimeValidation } from './useProjectRealTimeValidation';

const useCreateProject = (initialValues, onSubmitHandler) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    createProject,
    saveDraftProject,
    updateDraftProject,
    getDraftProjectById,
    toggleDraftProjectStatus,
    updateProject,
    getProjectById,
    getAllInitiatives,
    toggleProjectDraftStatus,
    initiatives,
    invalidateProjectDraftsCache,
    updateInitiativeWithProject,
    getAllProjectDrafts,
    deleteDraftProject,
    getAllProjects
  } = useInitiativeContext();
  const { userEmail } = useAuthContext();
  const STORAGE_KEY = 'project_draft';
  const STORAGE_TIMESTAMP_KEY = 'project_draft_timestamp';
  const [hasLocalStorageDraft, setHasLocalStorageDraft] = useState(false);
  const [localStorageTimestamp, setLocalStorageTimestamp] = useState(null);
  const location = useLocation();

  const defaultValues = useMemo(() => ({
    // Basic info
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: createSlateEditorState(),
    category: '',
    status: 'planned',
    priority: 'medium',

    // Main image
    mainImage: {
      src: '',
      alt: '',
      caption: '',
      gallery: [
        {
          src: '',
          alt: '',
          caption: ''
        }
      ]
    },

    // Budget
    budget: {
      goal: '',
      total: '',
      funded: '',
      currency: 'BGN'
    },

    // Timeline
    timeline: {
      startDate: '',
      endDate: '',
      estimatedDuration: ''
    },

    // Location
    location: [{
      address: '',
      coordinates: { lat: null, lng: null }
    }],

    // Application settings
    applicationStatus: 'open',
    applicationDeadline: '',
    maxParticipants: '',
    currentParticipants: 0,
    participantRequirements: [],

    // Content sections
    sections: [],

    // Media and documents
    downloadMaterials: [],
    gallery: [],
    logo: null,

    // Team
    team: [],
    contact: {
      name: '',
      role: '',
      email: '',
      phone: '',
      image: ''
    },

    // Partners and sponsors
    sponsors: [],
    partners: [],
    milestones: [],

    // Initiative connection
    initiativeId: '',
    initiativeSlug: '',

    // Other
    tags: [],
    commentsEnabled: true,

    // Meta
    userEmail: userEmail || '',
    isDraft: false
  }), [userEmail]);

  const [values, setValues] = useState(initialValues || defaultValues);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draftId, setDraftId] = useState(null);
  const [editId, setEditId] = useState(null);

  // 📁 MEDIA FILES STATE
  const [mediaFiles, setMediaFiles] = useState({
    logo: null,
    mainImage: [],
    gallery: [],
    documents: [],
    partnerLogos: {},
    sponsorLogos: {},
    teamImages: {}
  });

  const [editingDocument, setEditingDocument] = useState(null);
  const autoSaveRef = useRef(null);
  const fileInputRefs = useRef({});
  const [availableInitiatives, setAvailableInitiatives] = useState([]);
  const hasTriedToLoadInitiatives = useRef(false);

  // Real-time validation
  useProjectRealTimeValidation(values, setErrors);
  useEffect(() => {
    // Cleanup функция която се изпълнява при unmount
    return () => {

      // Изчистваме auto-save timeout
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = null;

      }
    };
  }, []);

useEffect(() => {
  const loadInitiatives = async () => {
    // Ако вече сме опитали да заредим, не опитваме отново
    if (hasTriedToLoadInitiatives.current) {
      return;
    }

    // Маркираме че започваме заявка
    hasTriedToLoadInitiatives.current = true;

    try {
      // Проверяваме дали вече има инициативи от context-а
      if (initiatives && initiatives.length > 0) {
        setAvailableInitiatives(initiatives);
        return;
      }

      // Ако няма инициативи в context-а, правим заявка
      const response = await getAllInitiatives(1, true);
      const loadedInitiatives = response.data || [];
      
      setAvailableInitiatives(loadedInitiatives);
      
    } catch (error) {
      console.error('❌ Error loading initiatives:', error);
      setAvailableInitiatives([]); 
    }
  };

  loadInitiatives();
}, []);

// Ако initiatives се промени СЛЕД първоначалното зареждане, обновяваме
useEffect(() => {
  if (hasTriedToLoadInitiatives.current && initiatives && initiatives.length > 0) {
    setAvailableInitiatives(initiatives);
  }
}, [initiatives]);
  // Load draft from URL
  useEffect(() => {
    const loadDraftFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftIdFromUrl = urlParams.get('draftId');
      const editIdFromUrl = urlParams.get('editId');
      const mode = urlParams.get('mode');

      if (draftIdFromUrl && !initialValues) {
        try {
          const draftData = await getDraftProjectById(draftIdFromUrl);
          if (draftData) {
            const processedData = { ...draftData };

            if (processedData.fullDescription && typeof processedData.fullDescription === 'string') {
              try {
                processedData.fullDescription = htmlToSlate(processedData.fullDescription);
              } catch (error) {
                console.error('❌ Error converting fullDescription:', error);
                processedData.fullDescription = createSlateEditorState();
              }
            } else {
              processedData.fullDescription = createSlateEditorState();
            }

            // sections[].content - съдържанието на секциите (Slate редактор)
            if (processedData.sections && Array.isArray(processedData.sections)) {
              processedData.sections = processedData.sections.map(section => {
                if (section.content && typeof section.content === 'string') {
                  try {
                    return {
                      ...section,
                      content: htmlToSlate(section.content)
                    };
                  } catch (error) {
                    console.error('❌ Error converting section content:', error);
                    return {
                      ...section,
                      content: createSlateEditorState()
                    };
                  }
                } else {
                  return {
                    ...section,
                    content: createSlateEditorState()
                  };
                }
              });
            }

            // 🔧 ОСТАНАЛИТЕ полета остават както са (strings)
            // title, shortDescription, tags, etc. - НЕ се конвертират

            setValues(processedData);
            setDraftId(draftIdFromUrl);
            notify('success', 'Черновата е заредена за редактиране');
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          notify('error', 'Грешка при зареждане на черновата');
        }
      } else if (editIdFromUrl && mode === 'edit') {
        try {
          const projectData = await getProjectById(editIdFromUrl);
          if (projectData) {
            const processedData = { ...projectData };

            // 🎯 КОНВЕРТИРАНЕ НА SLATE ПОЛЕТАТА ОТ HTML КЪМ SLATE
            // fullDescription
            if (processedData.fullDescription && typeof processedData.fullDescription === 'string') {
              try {
                processedData.fullDescription = htmlToSlate(processedData.fullDescription);
              } catch (error) {
                console.error('❌ Error converting fullDescription:', error);
                processedData.fullDescription = createSlateEditorState();
              }
            } else {
              processedData.fullDescription = createSlateEditorState();
            }

            // sections[].content
            if (processedData.sections && Array.isArray(processedData.sections)) {
              processedData.sections = processedData.sections.map(section => {
                if (section.content && typeof section.content === 'string') {
                  try {
                    return {
                      ...section,
                      content: htmlToSlate(section.content)
                    };
                  } catch (error) {
                    console.error('❌ Error converting section content:', error);
                    return {
                      ...section,
                      content: createSlateEditorState()
                    };
                  }
                } else {
                  return {
                    ...section,
                    content: createSlateEditorState()
                  };
                }
              });
            }

            setValues(processedData);
            setEditId(editIdFromUrl);
            notify('success', 'Проектът е зареден за редактиране');
          }
        } catch (error) {
          console.error('Error loading project for edit:', error);
          notify('error', 'Грешка при зареждане на проекта');
        }
      }
    };

    loadDraftFromUrl();
  }, [location.search]);

  // Auto-load latest draft
  useEffect(() => {
    const autoLoadLatestDraft = async () => {
      // Ако има initialValues (edit mode), не зареждаме чернова
      if (initialValues && Object.keys(initialValues).length > 0) {
        return;
      }

      // Ако вече има URL параметри за draft/edit, не зареждаме автоматично
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('draftId') || urlParams.get('editId')) {
        return;
      }

      try {

        const draftsResponse = await getAllProjectDrafts(1, true);
        const drafts = draftsResponse.data || [];

        if (drafts.length > 0) {
          const latestDraft = drafts[0];

          const processedData = { ...latestDraft };

          // fullDescription - основното описание (има Slate редактор)
          if (processedData.fullDescription && typeof processedData.fullDescription === 'string') {
            try {
              processedData.fullDescription = htmlToSlate(processedData.fullDescription);
            } catch (error) {
              console.error('❌ Error converting fullDescription:', error);
              processedData.fullDescription = createSlateEditorState();
            }
          } else {
            processedData.fullDescription = createSlateEditorState();
          }

          // sections[].content - съдържанието на секциите (има Slate редактор)
          if (processedData.sections && Array.isArray(processedData.sections)) {
            processedData.sections = processedData.sections.map(section => {
              if (section.content && typeof section.content === 'string') {
                try {
                  return {
                    ...section,
                    content: htmlToSlate(section.content)
                  };
                } catch (error) {
                  console.error('❌ Error converting section content:', error);
                  return {
                    ...section,
                    content: createSlateEditorState()
                  };
                }
              } else {
                return {
                  ...section,
                  content: createSlateEditorState()
                };
              }
            });

          }
          if (processedData.location) {
            if (!Array.isArray(processedData.location)) {
              processedData.location = [processedData.location];
            }

            processedData.location = processedData.location.map(loc => ({
              address: loc.address || '',
              coordinates: {
                lat: loc.coordinates?.lat || null,
                lng: loc.coordinates?.lng || null
              }
            }));
          } else {
            processedData.location = [{
              address: '',
              coordinates: { lat: null, lng: null }
            }];
          }
          // 🔧 ОСТАНАЛИТЕ полета остават както са (strings)
          // title, shortDescription, tags, etc. - НЕ се конвертират

          setValues(processedData);
          setDraftId(latestDraft.id);

          notify('info', t('projects.create.continuingWork', { title: latestDraft.title }));
        } else {
        }
      } catch (error) {
        console.error('❌ Error loading latest draft:', error);
      }
    };

    autoLoadLatestDraft();
  }, [initialValues, setValues, setDraftId]);
  // 🏷️ GENERATE SLUG
  const generateSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v')
      .replace(/г/g, 'g').replace(/д/g, 'd').replace(/е/g, 'e')
      .replace(/ж/g, 'zh').replace(/з/g, 'z').replace(/и/g, 'i')
      .replace(/й/g, 'y').replace(/к/g, 'k').replace(/л/g, 'l')
      .replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
      .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's')
      .replace(/т/g, 't').replace(/у/g, 'u').replace(/ф/g, 'f')
      .replace(/х/g, 'h').replace(/ц/g, 'ts').replace(/ч/g, 'ch')
      .replace(/ш/g, 'sh').replace(/щ/g, 'sht').replace(/ъ/g, 'a')
      .replace(/ь/g, 'y').replace(/ю/g, 'yu').replace(/я/g, 'ya')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  }, []);

  // 🆔 GENERATE ID
  const generateId = useCallback(() => {
    return Date.now() + Math.floor(Math.random() * 1000);
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback((data) => {
    try {
      const dataToSave = {
        ...data,
        draftId: draftId,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      notify('error', 'Грешка при запазване в браузъра');
    }
  }, [draftId]);

  // 🕒 TIMELINE HELPER FUNCTIONS
  const calculateDuration = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // ⚡ HANDLE INPUT CHANGES
  const onChangeHandler = useCallback((e, isEditor = false, customData = null) => {
    let name, value;

    if (customData) {
      name = customData.name;
      value = customData.value;
    } else if (isEditor) {
      name = e;
      value = isEditor;
    } else {
      name = e.target.name;
      if (e.target.type === 'checkbox') {
        // Check if current value is boolean (single checkbox) or array (multiple checkboxes)
        if (typeof values[name] === 'boolean' || name === 'commentsEnabled') {
          // Single boolean checkbox
          value = e.target.checked;
        } else {
          // Multiple choice checkboxes (arrays)
          value = e.target.checked
            ? [...(values[name] || []), e.target.value]
            : (values[name] || []).filter(item => item !== e.target.value);
        }
      } else {
        value = e.target.value;
      }
    }

    // Auto-generate slug when title changes
    if (name === 'title') {
      setValues(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value)
      }));
    } else if (name === 'timeline.startDate' || name === 'timeline.endDate') {
      setValues(prev => {
        const updatedValues = { ...prev };
        const keys = name.split('.');
        let current = updatedValues;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        // Calculate duration
        if (updatedValues.timeline.startDate && updatedValues.timeline.endDate) {
          const duration = calculateDuration(updatedValues.timeline.startDate, updatedValues.timeline.endDate);
          updatedValues.timeline.estimatedDuration = `${duration} дни`;
        }

        return updatedValues;
      });
    } else {
      setValues(prev => {
        const updatedValues = { ...prev };

        if (name.includes('.')) {
          const keys = name.split('.');
          let current = updatedValues;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        } else if (name.includes('[') && name.includes(']')) {
          const arrayMatch = name.match(/(\w+)\[(\d+)\]\.(\w+)/);
          if (arrayMatch) {
            const [, arrayName, index, property] = arrayMatch;
            const arrayIndex = parseInt(index, 10);
            if (updatedValues[arrayName] && updatedValues[arrayName][arrayIndex]) {
              updatedValues[arrayName][arrayIndex][property] = value;
            }
          }
        } else {
          updatedValues[name] = value;
        }

        return updatedValues;
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-save
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    autoSaveRef.current = setTimeout(async () => {
      const currentPath = window.location.pathname;
      const isInProjectForm = currentPath.includes('/profile/project-create') ||
        currentPath.includes('/profile/projects-create');

      if (!isInProjectForm) {
        return;
      }

      if (!values.title?.trim()) {
        return;
      }
      const currentValues = { ...values, [name]: value };
      saveToLocalStorage(currentValues);

      if (userEmail) {
        try {
          const convertedData = convertFormToHtml.call(null, currentValues);
          if (draftId) {
            await updateDraftProject(draftId, { ...convertedData, userEmail });
          } else {
            const result = await saveDraftProject({ ...convertedData, userEmail });
            const newDraftId = result?.data?.id || result?.id;
            if (newDraftId) {
              setDraftId(newDraftId);
            }
          }
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }
    }, 30000);
  }, [values, errors, generateSlug, saveDraftProject, userEmail, saveToLocalStorage, calculateDuration]);

  // 🎯 HANDLE BLUR
  const onBlurHandler = useCallback((e, isEditor = false, customData = null) => {
    let name;
    if (customData) {
      name = customData.name;
    } else if (isEditor) {
      name = e;
    } else {
      name = e.target.name;
    }
  }, []);

  // 🔄 EDITOR CHANGE HANDLER
  const handleEditorChange = useCallback((fieldName, value) => {
    setValues(prev => {
      const updatedValues = { ...prev };
      if (fieldName.includes('.')) {
        const keys = fieldName.split('.');
        let current = updatedValues;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        updatedValues[fieldName] = value;
      }
      return updatedValues;
    });

    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // 📷 MAIN IMAGE UPLOAD
  const handleMainImageUpload = useCallback(async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages = [];

    fileArray.forEach((file, index) => {
      try {
        const blobUrl = URL.createObjectURL(file);
        newImages.push({
          src: blobUrl,
          alt: '',
          caption: '',
          isUploading: true,
          fileId: Date.now() + Math.random() + index
        });
      } catch (error) {
        console.error(`Error creating blob for ${file.name}:`, error);
      }
    });

    if (newImages.length === 0) return;

    // Update UI immediately
    setValues(prev => {
      const existingGallery = prev.mainImage?.gallery || [];
      const shouldUpdateMain = !prev.mainImage?.src;

      if (shouldUpdateMain) {
        return {
          ...prev,
          mainImage: {
            src: newImages[0].src,
            alt: newImages[0].alt,
            caption: newImages[0].caption,
            gallery: [...existingGallery, ...newImages.slice(1)]
          }
        };
      } else {
        return {
          ...prev,
          mainImage: {
            ...prev.mainImage,
            gallery: [...existingGallery, ...newImages]
          }
        };
      }
    });

    e.target.value = '';

    try {
      const uploadedImages = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        try {
          const compressedFile = await compressImage(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920
          });

          const url = await uploadFileWithProgress(
            compressedFile,
            'projects/main-images',
            (progress) => { }
          );

          uploadedImages.push({
            src: url,
            alt: '',
            caption: ''
          });
        } catch (fileError) {
          console.error(`Error uploading file ${i + 1}:`, fileError);
          uploadedImages.push(null);
        }
      }

      const validUploads = uploadedImages.filter(img => img !== null);
      if (validUploads.length === 0) {
        notify('error', 'Няма качени снимки');
        return;
      }

      // Replace blob URLs with Firebase URLs
      setValues(prev => {
        if (!prev.mainImage) return prev;

        let newMainImage = { ...prev.mainImage };
        let updatedGallery = [...(prev.mainImage.gallery || [])];
        let uploadIndex = 0;

        newImages.forEach((blobImg) => {
          if (uploadIndex >= validUploads.length) return;
          const firebaseImg = validUploads[uploadIndex];
          if (!firebaseImg) return;

          if (newMainImage.src === blobImg.src) {
            newMainImage.src = firebaseImg.src;
          }

          const galleryIndex = updatedGallery.findIndex(img => img?.src === blobImg.src);
          if (galleryIndex !== -1) {
            updatedGallery[galleryIndex] = {
              ...firebaseImg,
              alt: updatedGallery[galleryIndex].alt || '',
              caption: updatedGallery[galleryIndex].caption || ''
            };
          }

          try {
            URL.revokeObjectURL(blobImg.src);
          } catch (e) {
            console.warn('Could not revoke blob URL:', e);
          }

          uploadIndex++;
        });

        return {
          ...prev,
          mainImage: {
            ...newMainImage,
            gallery: updatedGallery.filter(img => img && img.src)
          }
        };
      });

      if (validUploads.length < fileArray.length) {
        notify('warning', `Качени ${validUploads.length} от ${fileArray.length} снимки`);
      } else {
        notify('success', `Качени всички ${validUploads.length} снимки`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      notify('error', 'Грешка при качване на снимките');
    }
  }, []);

  // Remove main image
  const removeMainImage = useCallback(async () => {
    setValues(prev => {
      const imageToDelete = prev.mainImage.src;
      let newMainImage;

      if (prev.mainImage.gallery && prev.mainImage.gallery.length > 0) {
        newMainImage = {
          src: prev.mainImage.gallery[0].src,
          alt: prev.mainImage.gallery[0].alt,
          caption: prev.mainImage.gallery[0].caption,
          gallery: prev.mainImage.gallery.slice(1)
        };
      } else {
        newMainImage = {
          src: '',
          alt: '',
          caption: '',
          gallery: []
        };
      }

      if (imageToDelete && !imageToDelete.startsWith('blob:')) {
        deleteSingleImage(imageToDelete).catch(error => {
          console.error('Error deleting from Firebase:', error);
        });
      }

      if (imageToDelete?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToDelete);
      }

      return {
        ...prev,
        mainImage: newMainImage
      };
    });
  }, []);

  // Handle set main image
  const handleSetMainImage = useCallback((index) => {
    setValues(prev => {
      const selectedImage = prev.mainImage.gallery[index];
      const currentMain = {
        src: prev.mainImage.src,
        alt: prev.mainImage.alt,
        caption: prev.mainImage.caption
      };

      const updatedGallery = [...prev.mainImage.gallery];
      updatedGallery[index] = currentMain;

      return {
        ...prev,
        mainImage: {
          src: selectedImage.src,
          alt: selectedImage.alt,
          caption: selectedImage.caption,
          gallery: updatedGallery
        }
      };
    });
  }, []);

  // Remove gallery image
  const handleRemoveGalleryImage = useCallback(async (index) => {
    setValues(prev => {
      if (!prev.mainImage?.gallery || !prev.mainImage.gallery[index]) {
        return prev;
      }

      const imageToDelete = prev.mainImage.gallery[index];
      const updatedGallery = prev.mainImage.gallery.filter((_, i) => i !== index);

      let newMainImage = { ...prev.mainImage };

      if (prev.mainImage.src === imageToDelete?.src) {
        if (updatedGallery.length > 0 && updatedGallery[0]?.src) {
          newMainImage = {
            src: updatedGallery[0].src,
            alt: updatedGallery[0].alt || '',
            caption: updatedGallery[0].caption || '',
            gallery: updatedGallery.slice(1)
          };
        } else {
          newMainImage = {
            src: '',
            alt: '',
            caption: '',
            gallery: []
          };
        }
      } else {
        newMainImage = {
          ...prev.mainImage,
          gallery: updatedGallery.filter(img => img && img.src)
        };
      }

      if (imageToDelete?.src && !imageToDelete.isUploading) {
        deleteSingleImage(imageToDelete.src).catch(error => {
          console.error('Error deleting from Firebase:', error);
        });
      }

      if (imageToDelete?.src?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToDelete.src);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return {
        ...prev,
        mainImage: newMainImage
      };
    });
  }, []);
  // Partner image upload
  const handlePartnerImageUpload = useCallback(async (file, partnerIndex) => {
    if (!file) return;

    try {
      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);

      // Update UI immediately
      setValues(prev => {
        const newPartners = [...prev.partners];
        newPartners[partnerIndex] = {
          ...newPartners[partnerIndex],
          logo: blobUrl,
          isUploading: true
        };
        return { ...prev, partners: newPartners };
      });

      // Compress and upload
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400 // Logo size
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'projects/partner-logos',
        (progress) => {
          // Optional: handle progress
        }
      );

      // Update with Firebase URL
      setValues(prev => {
        const newPartners = [...prev.partners];
        newPartners[partnerIndex] = {
          ...newPartners[partnerIndex],
          logo: uploadedUrl,
          isUploading: false
        };
        return { ...prev, partners: newPartners };
      });

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      notify('success', 'Логото е качено успешно!');
      return uploadedUrl;

    } catch (error) {
      console.error('Error uploading partner logo:', error);
      notify('error', 'Грешка при качване на логото');

      // Reset uploading state
      setValues(prev => {
        const newPartners = [...prev.partners];
        newPartners[partnerIndex] = {
          ...newPartners[partnerIndex],
          logo: '',
          isUploading: false
        };
        return { ...prev, partners: newPartners };
      });
    }
  }, []);

  // Remove partner image
  const removePartnerImage = useCallback(async (partnerIndex) => {
    setValues(prev => {
      const newPartners = [...prev.partners];
      const imageToDelete = newPartners[partnerIndex].logo;

      // Remove image URL
      newPartners[partnerIndex] = {
        ...newPartners[partnerIndex],
        logo: ''
      };

      // Delete from Firebase if needed
      if (imageToDelete && !imageToDelete.startsWith('blob:')) {
        deleteSingleImage(imageToDelete).catch(error => {
          console.error('Error deleting partner logo from Firebase:', error);
        });
      }

      // Clean up blob URL if needed
      if (imageToDelete?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToDelete);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return { ...prev, partners: newPartners };
    });
  }, []);

  // Sponsor image upload
  const handleSponsorImageUpload = useCallback(async (file, sponsorIndex) => {
    if (!file) return;

    try {
      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);

      // Update UI immediately
      setValues(prev => {
        const newSponsors = [...prev.sponsors];
        newSponsors[sponsorIndex] = {
          ...newSponsors[sponsorIndex],
          logo: blobUrl,
          isUploading: true
        };
        return { ...prev, sponsors: newSponsors };
      });

      // Compress and upload
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400 // Logo size
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'projects/sponsor-logos',
        (progress) => {
          // Optional: handle progress
        }
      );

      // Update with Firebase URL
      setValues(prev => {
        const newSponsors = [...prev.sponsors];
        newSponsors[sponsorIndex] = {
          ...newSponsors[sponsorIndex],
          logo: uploadedUrl,
          isUploading: false
        };
        return { ...prev, sponsors: newSponsors };
      });

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      notify('success', 'Логото е качено успешно!');
      return uploadedUrl;

    } catch (error) {
      console.error('Error uploading sponsor logo:', error);
      notify('error', 'Грешка при качване на логото');

      // Reset uploading state
      setValues(prev => {
        const newSponsors = [...prev.sponsors];
        newSponsors[sponsorIndex] = {
          ...newSponsors[sponsorIndex],
          logo: '',
          isUploading: false
        };
        return { ...prev, sponsors: newSponsors };
      });
    }
  }, []);

  // Remove sponsor image
  const removeSponsorImage = useCallback(async (sponsorIndex) => {
    setValues(prev => {
      const newSponsors = [...prev.sponsors];
      const imageToDelete = newSponsors[sponsorIndex].logo;

      // Remove image URL
      newSponsors[sponsorIndex] = {
        ...newSponsors[sponsorIndex],
        logo: ''
      };

      // Delete from Firebase if needed
      if (imageToDelete && !imageToDelete.startsWith('blob:')) {
        deleteSingleImage(imageToDelete).catch(error => {
          console.error('Error deleting sponsor logo from Firebase:', error);
        });
      }

      // Clean up blob URL if needed
      if (imageToDelete?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToDelete);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return { ...prev, sponsors: newSponsors };
    });
  }, []);
  // Section management
  const addSection = useCallback(() => {
    const newSection = {
      titleSlug: `section-${Date.now()}`,
      title: '',
      content: createSlateEditorState(),
      images: []
    };

    setValues(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  }, []);

  const removeSection = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  }, []);

  const updateSection = useCallback((index, field, value) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        [field]: value
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);

  // Team management
  const addTeamMember = useCallback(() => {
    const newMember = {
      id: generateId(),
      name: '',
      role: '',
      email: '',
      phone: '',
      image: ''
    };

    setValues(prev => ({
      ...prev,
      team: [...prev.team, newMember]
    }));
  }, [generateId]);

  const removeTeamMember = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }));
  }, []);

  const updateTeamMember = useCallback((index, updates) => {
    setValues(prev => {
      const newTeam = [...prev.team];
      newTeam[index] = { ...newTeam[index], ...updates };
      return { ...prev, team: newTeam };
    });
  }, []);

  // Partner management  
  const addPartner = useCallback(() => {
    const newPartner = {
      titleSlug: generateId(),
      name: '',
      description: '',
      website: '',
      type: 'Strategic',
      logo: null,
      visible: true
    };

    setValues(prev => ({
      ...prev,
      partners: [...prev.partners, newPartner]
    }));
  }, [generateId]);

  const removePartner = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index)
    }));
  }, []);

  // Sponsor management
  const addSponsor = useCallback(() => {
    const newSponsor = {
      id: generateId(),
      name: '',
      amount: '',
      currency: 'BGN',
      type: 'Financial',
      website: '',
      logo: null,
      visible: true
    };

    setValues(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, newSponsor]
    }));
  }, [generateId]);

  const removeSponsor = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== index)
    }));
  }, []);

  // Milestone management
 const addMilestone = useCallback(() => {
  setValues(prev => ({
    ...prev,
    milestones: [...prev.milestones, { 
      title: '',
      description: '', 
      dueDate: '',
      status: 'pending' // 🆕 ДОБАВИ СТАТУС
    }]
  }));
}, []);

  const removeMilestone = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  }, []);

  // Requirements management
  const addRequirement = useCallback(() => {
    setValues(prev => ({
      ...prev,
      participantRequirements: [...prev.participantRequirements, '']
    }));
  }, []);

  const removeRequirement = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      participantRequirements: prev.participantRequirements.filter((_, i) => i !== index)
    }));
  }, []);

  const updateRequirement = useCallback((index, value) => {
    setValues(prev => {
      const newRequirements = [...prev.participantRequirements];
      newRequirements[index] = value;
      return { ...prev, participantRequirements: newRequirements };
    });
  }, []);

  // Tags management
  const addTag = useCallback((tag) => {
    const trimmedTag = tag.trim();

    if (!trimmedTag) {
      notify('warning', 'Въведете валиден таг');
      return;
    }

    if (trimmedTag.length < 2) {
      notify('warning', 'Таг трябва да има поне 2 символа');
      return;
    }

    if (trimmedTag.length > 30) {
      notify('warning', 'Таг не може да надвишава 30 символа');
      return;
    }

    if (values.tags.length >= 20) {
      notify('warning', 'Максимален брой тагове е 20');
      return;
    }

    if (values.tags.includes(trimmedTag)) {
      notify('warning', 'Този таг вече съществува');
      return;
    }

    setValues(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));

    notify('success', `Таг "${trimmedTag}" е добавен успешно`);
  }, [values.tags]);

  const removeTag = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  }, []);

  // ✅ FORM VALIDATION
  const validateForm = useCallback(() => {
    const newErrors = validateProjectForm(values, t);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, t]);

  // localStorage utilities
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

      if (savedData && timestamp) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.draftId) {
          setDraftId(parsedData.draftId);
        }

        const saveTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now - saveTime) / (1000 * 60 * 60);

        if (hoursDiff < 168) { // 7 days
          return {
            data: parsedData,
            timestamp: saveTime
          };
        } else {
          clearLocalStorage();
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      clearLocalStorage();
      return null;
    }
  }, []);

  // Section image upload
  const handleSectionImageUpload = useCallback(async (e, sectionIndex) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages = [];

    fileArray.forEach((file, index) => {
      try {
        const blobUrl = URL.createObjectURL(file);
        newImages.push({
          src: blobUrl,
          alt: '',
          caption: '',
          isUploading: true,
          fileId: Date.now() + Math.random() + index
        });
      } catch (error) {
        console.error(`Error creating blob for ${file.name}:`, error);
      }
    });

    if (newImages.length === 0) return;

    // Update UI immediately
    setValues(prev => {
      const updatedSections = [...prev.sections];
      const existingImages = updatedSections[sectionIndex].images || [];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: [...existingImages, ...newImages]
      };
      return { ...prev, sections: updatedSections };
    });

    e.target.value = '';

    try {
      const uploadedImages = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        try {
          const compressedFile = await compressImage(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920
          });

          const url = await uploadFileWithProgress(
            compressedFile,
            'projects/section-images',
            (progress) => { }
          );

          uploadedImages.push({
            src: url,
            alt: '',
            caption: ''
          });
        } catch (fileError) {
          console.error(`Error uploading file ${i + 1}:`, fileError);
          uploadedImages.push(null);
        }
      }

      const validUploads = uploadedImages.filter(img => img !== null);
      if (validUploads.length === 0) {
        notify('error', 'Няма качени снимки');
        return;
      }

      // Replace blob URLs with Firebase URLs
      setValues(prev => {
        const updatedSections = [...prev.sections];
        let updatedImages = [...(updatedSections[sectionIndex].images || [])];
        let uploadIndex = 0;

        newImages.forEach((blobImg) => {
          if (uploadIndex >= validUploads.length) return;
          const firebaseImg = validUploads[uploadIndex];
          if (!firebaseImg) return;

          const imageIndex = updatedImages.findIndex(img => img?.src === blobImg.src);
          if (imageIndex !== -1) {
            updatedImages[imageIndex] = {
              ...firebaseImg,
              alt: updatedImages[imageIndex].alt || '',
              caption: updatedImages[imageIndex].caption || ''
            };
          }

          try {
            URL.revokeObjectURL(blobImg.src);
          } catch (e) {
            console.warn('Could not revoke blob URL:', e);
          }

          uploadIndex++;
        });

        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          images: updatedImages.filter(img => img && img.src)
        };

        return { ...prev, sections: updatedSections };
      });

      if (validUploads.length < fileArray.length) {
        notify('warning', `Качени ${validUploads.length} от ${fileArray.length} снимки`);
      } else {
        notify('success', `Качени всички ${validUploads.length} снимки`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      notify('error', 'Грешка при качване на снимките');
    }
  }, []);

  // Add section image from URL
  const addSectionImageFromUrl = useCallback((sectionIndex, imageUrl) => {
    if (!imageUrl.trim()) return;

    const newImage = {
      src: imageUrl.trim(),
      alt: '',
      caption: ''
    };

    setValues(prev => {
      const updatedSections = [...prev.sections];
      const existingImages = updatedSections[sectionIndex].images || [];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: [...existingImages, newImage]
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);

  // Remove section image
  const removeSectionImage = useCallback((sectionIndex, imageIndex) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];
      const imageToDelete = updatedSections[sectionIndex].images[imageIndex];

      // Remove image from array
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: updatedSections[sectionIndex].images.filter((_, i) => i !== imageIndex)
      };

      // Delete from Firebase if needed
      if (imageToDelete?.src && !imageToDelete.isUploading && !imageToDelete.src.startsWith('blob:')) {
        deleteSingleImage(imageToDelete.src).catch(error => {
          console.error('Error deleting from Firebase:', error);
        });
      }

      if (imageToDelete?.src?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToDelete.src);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return { ...prev, sections: updatedSections };
    });
  }, []);

  // Update section image alt
  const updateSectionImageAlt = useCallback((sectionIndex, imageIndex, altText) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];
      const updatedImages = [...updatedSections[sectionIndex].images];
      updatedImages[imageIndex] = {
        ...updatedImages[imageIndex],
        alt: altText
      };
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: updatedImages
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);

  // Update section image caption
  const updateSectionImageCaption = useCallback((sectionIndex, imageIndex, caption) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];
      const updatedImages = [...updatedSections[sectionIndex].images];
      updatedImages[imageIndex] = {
        ...updatedImages[imageIndex],
        caption: caption
      };
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: updatedImages
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);

  // Clear all section images
  const clearSectionImages = useCallback((sectionIndex) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];
      const imagesToDelete = updatedSections[sectionIndex].images || [];

      // Delete from Firebase
      imagesToDelete.forEach(image => {
        if (image?.src && !image.isUploading && !image.src.startsWith('blob:')) {
          deleteSingleImage(image.src).catch(error => {
            console.error('Error deleting from Firebase:', error);
          });
        }
        if (image?.src?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(image.src);
          } catch (e) {
            console.warn('Could not revoke blob URL:', e);
          }
        }
      });

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: []
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      setHasLocalStorageDraft(false);
      setLocalStorageTimestamp(null);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  // 📤 HTML CONVERSION
  // В useCreateProject.js - обнови convertFormToHtml функцията
  const convertFormToHtml = useCallback(() => {
    try {
      const htmlValues = { ...values };
 // Helper функция за конвертиране на MIME type към enum
    const convertMimeTypeToEnum = (mimeType, fileName) => {
      if (!mimeType && fileName) {
        // Ако няма mimeType, извличаме от разширението
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
          case 'pdf': return 'pdf';
          case 'docx': return 'docx';
          case 'doc': return 'doc';
          case 'xlsx': return 'xlsx';
          case 'xls': return 'xls';
          case 'pptx': return 'pptx';
          case 'ppt': return 'ppt';
          case 'txt': return 'txt';
          case 'csv': return 'csv';
          default: return null;
        }
      }

      // Конвертираме MIME type към enum
      switch (mimeType) {
        case 'application/pdf':
          return 'pdf';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'docx';
        case 'application/msword':
          return 'doc';
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return 'xlsx';
        case 'application/vnd.ms-excel':
          return 'xls';
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return 'pptx';
        case 'application/vnd.ms-powerpoint':
          return 'ppt';
        case 'text/plain':
          return 'txt';
        case 'text/csv':
          return 'csv';
        case 'application/rtf':
          return 'rtf';
        default:
          // Ако не разпознаваме MIME type-а, опитваме се от името на файла
          if (fileName) {
            const extension = fileName.split('.').pop().toLowerCase();
            switch (extension) {
              case 'pdf': return 'pdf';
              case 'docx': return 'docx';
              case 'doc': return 'doc';
              case 'xlsx': return 'xlsx';
              case 'xls': return 'xls';
              case 'pptx': return 'pptx';
              case 'ppt': return 'ppt';
              case 'txt': return 'txt';
              case 'csv': return 'csv';
              default: return 'pdf'; // Fallback към pdf
            }
          }
          return 'pdf'; // Default fallback
      }
    };
      // Remove ID fields
      if (htmlValues.sponsors) {
        htmlValues.sponsors = htmlValues.sponsors.map(sponsor => {
          const { id, ...sponsorWithoutId } = sponsor;
          return sponsorWithoutId;
        });
      }

      if (htmlValues.team) {
        htmlValues.team = htmlValues.team.map(member => {
          const { id, ...memberWithoutId } = member;
          return memberWithoutId;
        });
      }
      // 🔧 ПРАВИЛНА ТРАНСФОРМАЦИЯ НА ДОКУМЕНТИТЕ
    if (htmlValues.downloadMaterials && Array.isArray(htmlValues.downloadMaterials)) {
      htmlValues.downloadMaterials = htmlValues.downloadMaterials.map((document, index) => {
        const title = document.name || document.filename || `Document ${index + 1}`;
        const titleSlug = generateSlug ? generateSlug(title) : title
          .toLowerCase()
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .trim() || `document-${Date.now()}`;

        // Конвертираме MIME type към enum
        const fileType = convertMimeTypeToEnum(document.type, document.name || document.filename);
        
        // Конвертираме размера към string
        const fileSize = document.size ? String(document.size) : null;

        return {
          id: null, // Сървърът ще генерира ID
          titleSlug: titleSlug,
          title: title,
          description: null,
          fileType: fileType, // Конвертиран enum
          fileSize: fileSize, // Конвертиран string
          downloadUrl: document.url || document.src || null,
          image: null
        };
      });

    }

    // 🆕 ТРАНСФОРМАЦИЯ НА ГАЛЕРИЯТА ЗА СЪРВЪРА (ако е нужно)
    if (htmlValues.gallery && Array.isArray(htmlValues.gallery)) {
      htmlValues.gallery = htmlValues.gallery.map((image, index) => {
        return {
          src: image.src || image.url,
          alt: image.alt || `Gallery image ${index + 1}`,
          caption: image.caption || '',
          name: image.name || `Image ${index + 1}`,
          size: image.size || null,
          type: image.type || null
        };
      });
    }

      // 🆕 ПРАВИЛНО конвертиране на fullDescription
      try {
        if (!isSlateEmpty(values.fullDescription)) {
          htmlValues.fullDescription = slateToHtml(values.fullDescription);
        } else {
          htmlValues.fullDescription = '';
        }
      } catch (error) {
        console.error('❌ Error converting fullDescription:', error);
        htmlValues.fullDescription = '';
      }

      // 🆕 ПРАВИЛНО конвертиране на sections
      try {
        if (htmlValues.sections && Array.isArray(htmlValues.sections)) {
          htmlValues.sections = htmlValues.sections.map((section, index) => {
            try {
              if (!isSlateEmpty(section.content)) {
                const convertedContent = slateToHtml(section.content);
                return {
                  ...section,
                  content: convertedContent
                };
              }

              return {
                ...section,
                content: ''
              };
            } catch (sectionError) {
              console.error(`❌ Error converting section ${index}:`, sectionError);
              return {
                ...section,
                content: ''
              };
            }
          });
        } else {
          htmlValues.sections = [];
        }
      } catch (sectionsError) {
        console.error('❌ Error converting sections:', sectionsError);
        htmlValues.sections = [];
      }

      // Convert dates
      const convertDateToISO = (dateString) => {
        if (!dateString || dateString.trim() === '') return null;
        if (typeof dateString === 'string' && dateString.includes('T')) return dateString;
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return new Date(dateString + 'T00:00:00.000Z').toISOString();
        }
        return null;
      };

      if (htmlValues.timeline) {
        htmlValues.timeline.startDate = convertDateToISO(htmlValues.timeline.startDate);
        htmlValues.timeline.endDate = convertDateToISO(htmlValues.timeline.endDate);
      }

      if (htmlValues.milestones && htmlValues.milestones.length > 0) {
        htmlValues.milestones = htmlValues.milestones.map(milestone => ({
          ...milestone,
          dueDate: convertDateToISO(milestone.dueDate)
        }));
      }

      // Convert numeric fields
      if (htmlValues.budget) {
        if (htmlValues.budget.goal && htmlValues.budget.goal.toString().trim()) {
          htmlValues.budget.goal = Number(htmlValues.budget.goal);
        } else {
          htmlValues.budget.goal = null;
        }

        if (htmlValues.budget.total && htmlValues.budget.total.toString().trim()) {
          htmlValues.budget.total = Number(htmlValues.budget.total);
        } else {
          htmlValues.budget.total = null;
        }

        if (htmlValues.budget.funded && htmlValues.budget.funded.toString().trim()) {
          htmlValues.budget.funded = Number(htmlValues.budget.funded);
        } else {
          htmlValues.budget.funded = null;
        }
      }

      // Application fields
      if (htmlValues.maxParticipants && htmlValues.maxParticipants.toString().trim()) {
        htmlValues.maxParticipants = Number(htmlValues.maxParticipants);
      } else {
        htmlValues.maxParticipants = null;
      }

      if (htmlValues.currentParticipants && htmlValues.currentParticipants.toString().trim()) {
        htmlValues.currentParticipants = Number(htmlValues.currentParticipants);
      } else {
        htmlValues.currentParticipants = null;
      }

      // Sponsors amounts
      if (htmlValues.sponsors && htmlValues.sponsors.length > 0) {
        htmlValues.sponsors = htmlValues.sponsors.map(sponsor => ({
          ...sponsor,
          amount: sponsor.amount && sponsor.amount.toString().trim() ? Number(sponsor.amount) : null
        }));
      }

      // Clean empty fields
      const cleanEmptyFields = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(item => cleanEmptyFields(item));
        }

        if (obj !== null && typeof obj === 'object') {
          const cleaned = {};
          for (const [key, value] of Object.entries(obj)) {
            cleaned[key] = cleanEmptyFields(value);
          }
          return cleaned;
        }

        if (typeof obj === 'string' && obj.trim() === '') {
          return null;
        }

        return obj;
      };

      return cleanEmptyFields(htmlValues);

    } catch (error) {
      console.error('❌ Error converting form to HTML:', error);
      return {
        ...values,
        fullDescription: '',
        sections: values.sections?.map(s => ({ ...s, content: '' })) || [],
        downloadMaterials: []
      };
    }
  }, [values]);

  // Save draft projects
  const saveDraft = useCallback(async () => {
    try {
      saveToLocalStorage(values);

      if (userEmail) {
        let convertedData;
        try {
          convertedData = convertFormToHtml();
        } catch (conversionError) {
          notify('error', 'Грешка при обработка на данните');
          return;
        }

        try {
          const dataToSave = { ...convertedData, userEmail };
          let result;

          if (draftId) {
            result = await updateDraftProject(draftId, dataToSave);

            // 🔧 КЛЮЧОВА ПРОМЯНА - обновяваме draftId ако се е променил
            if (result?.data || result) {
              const updatedDraft = result.data || result;

              // Обновяваме draftId ако се е променил на сървъра
              if (updatedDraft.id && updatedDraft.id !== draftId) {
                setDraftId(updatedDraft.id);
              }

              // Обновяваме slug ако се е променил
              if (updatedDraft.slug && updatedDraft.slug !== values.slug) {
                setValues(prev => ({
                  ...prev,
                  slug: updatedDraft.slug,
                  id: updatedDraft.id // Синхронизираме и ID-то
                }));
              }
            }
          } else {
            result = await saveDraftProject(dataToSave);
            const newDraftId = result?.data?.id || result?.id;
            if (newDraftId) {
              setDraftId(newDraftId);
            }
          }

          notify('success', 'Черновата е запазена');
          return result;
        } catch (saveError) {
          console.error('❌ Save error:', saveError);
          notify('error', `Грешка при запазване: ${saveError.message}`);
        }
      } else {
        notify('success', 'Черновата е запазена в браузъра');
      }
    } catch (fatalError) {
      notify('warning', 'Черновата е запазена само в браузъра');
    }
  }, [values, saveDraftProject, updateDraftProject, userEmail, saveToLocalStorage, convertFormToHtml, draftId, setDraftId, setValues]);

  // Team image upload
  const handleTeamImageUpload = useCallback(async (file, memberIndex) => {
    if (!file) return;

    try {
      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);

      // Update UI immediately
      setValues(prev => {
        const newTeam = [...prev.team];
        newTeam[memberIndex] = {
          ...newTeam[memberIndex],
          image: blobUrl,
          isUploading: true
        };
        return { ...prev, team: newTeam };
      });

      // Compress and upload
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500 // Smaller for profile images
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'projects/team-images',
        (progress) => {
          // Optional: handle progress
        }
      );

      // Update with Firebase URL
      setValues(prev => {
        const newTeam = [...prev.team];
        newTeam[memberIndex] = {
          ...newTeam[memberIndex],
          image: uploadedUrl,
          isUploading: false
        };
        return { ...prev, team: newTeam };
      });

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      notify('success', 'Снимката е качена успешно!');
      return uploadedUrl;

    } catch (error) {
      console.error('Error uploading team image:', error);
      notify('error', 'Грешка при качване на снимката');

      // Reset uploading state
      setValues(prev => {
        const newTeam = [...prev.team];
        newTeam[memberIndex] = {
          ...newTeam[memberIndex],
          image: '',
          isUploading: false
        };
        return { ...prev, team: newTeam };
      });
    }
  }, []);
  // Remove team image
  const removeTeamImage = useCallback(async (memberIndex) => {
    setValues(prev => {
      const newTeam = [...prev.team];
      const imageToDelete = newTeam[memberIndex].image;

      // Remove image URL
      newTeam[memberIndex] = {
        ...newTeam[memberIndex],
        image: ''
      };

      // Delete from Firebase if needed
      if (imageToDelete && !imageToDelete.startsWith('blob:')) {
        deleteSingleImage(imageToDelete).catch(error => {
          console.error('Error deleting team image from Firebase:', error);
        });
      }

      // Clean up blob URL if needed
      if (imageToDelete?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToDelete);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return { ...prev, team: newTeam };
    });
  }, []);
  // Gallery upload
  const handleGalleryUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const newImages = [];

    // Create blob URLs for immediate preview
    files.forEach((file, index) => {
      try {
        const blobUrl = URL.createObjectURL(file);
        newImages.push({
          src: blobUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          isUploading: true,
          fileId: Date.now() + Math.random() + index
        });
      } catch (error) {
        console.error(`Error creating blob for ${file.name}:`, error);
      }
    });

    if (newImages.length === 0) return;

    // Update UI immediately
    setValues(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...newImages]
    }));

    try {
      const uploadedImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const compressedFile = await compressImage(file, {
            maxSizeMB: 3,
            maxWidthOrHeight: 1920
          });

          const url = await uploadFileWithProgress(
            compressedFile,
            'projects/gallery',
            (progress) => { }
          );

          uploadedImages.push({
            src: url,
            url: url,
            name: file.name,
            size: file.size,
            type: file.type,
            alt: '',
            caption: ''
          });
        } catch (fileError) {
          console.error(`Error uploading file ${i + 1}:`, fileError);
          uploadedImages.push(null);
        }
      }

      const validUploads = uploadedImages.filter(img => img !== null);

      // Replace blob URLs with Firebase URLs
      setValues(prev => {
        let updatedGallery = [...(prev.gallery || [])];
        let uploadIndex = 0;

        newImages.forEach((blobImg) => {
          if (uploadIndex >= validUploads.length) return;
          const firebaseImg = validUploads[uploadIndex];
          if (!firebaseImg) return;

          const imageIndex = updatedGallery.findIndex(img => img?.fileId === blobImg.fileId);
          if (imageIndex !== -1) {
            updatedGallery[imageIndex] = {
              ...firebaseImg,
              isUploading: false
            };
          }

          try {
            URL.revokeObjectURL(blobImg.src);
          } catch (e) {
            console.warn('Could not revoke blob URL:', e);
          }

          uploadIndex++;
        });

        return { ...prev, gallery: updatedGallery.filter(img => img && img.src) };
      });

      if (validUploads.length < files.length) {
        notify('warning', `Качени ${validUploads.length} от ${files.length} снимки`);
      } else {
        notify('success', `Качени всички ${validUploads.length} снимки`);
      }

    } catch (error) {
      console.error('Gallery upload error:', error);
      notify('error', 'Грешка при качване на снимките');
    }
  }, []);
  const navigateBackToProjects = useCallback(() => {
    // Изчистваме кеша за да се презаредят draft-овете

    if (invalidateProjectDraftsCache) {
      invalidateProjectDraftsCache();
    }

    navigate('/profile/all-projects');
  }, [navigate]);
  // Remove gallery image
  const removeGalleryImage = useCallback(async (index) => {
    setValues(prev => {
      if (!prev.gallery || !prev.gallery[index]) return prev;

      const imageToDelete = prev.gallery[index];
      const updatedGallery = prev.gallery.filter((_, i) => i !== index);

      // Delete from Firebase if needed
      if (imageToDelete?.src && !imageToDelete.isUploading && !imageToDelete.src.startsWith('blob:')) {
        deleteSingleImage(imageToDelete.src).catch(error => {
          console.error('Error deleting gallery image from Firebase:', error);
        });
      }

      if (imageToDelete?.src?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToDelete.src);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return { ...prev, gallery: updatedGallery };
    });
  }, []);

  // Document upload
  const handleDocumentUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const newDocuments = [];

    // Create immediate entries
    files.forEach((file, index) => {
      newDocuments.push({
        name: file.name,
        filename: file.name,
        size: file.size,
        type: file.type,
        isUploading: true,
        fileId: Date.now() + Math.random() + index
      });
    });

    // Update UI immediately
    setValues(prev => ({
      ...prev,
      downloadMaterials: [...(prev.downloadMaterials || []), ...newDocuments]
    }));

    try {
      const uploadedDocuments = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const url = await uploadDocumentWithProgress(
            file,
            'projects/documents',
            (progress) => { }
          );

          uploadedDocuments.push({
            name: file.name,
            filename: file.name,
            url: url,
            src: url,
            size: file.size,
            type: file.type,
            originalName: file.name // Запазваме оригиналното име
          });
        } catch (fileError) {
          console.error(`Error uploading document ${i + 1}:`, fileError);
          uploadedDocuments.push(null);
        }
      }

      const validUploads = uploadedDocuments.filter(doc => doc !== null);

      // Replace temporary entries with real URLs
      setValues(prev => {
        let updatedDocuments = [...(prev.downloadMaterials || [])];
        let uploadIndex = 0;

        newDocuments.forEach((tempDoc) => {
          if (uploadIndex >= validUploads.length) return;
          const firebaseDoc = validUploads[uploadIndex];
          if (!firebaseDoc) return;

          const docIndex = updatedDocuments.findIndex(doc => doc?.fileId === tempDoc.fileId);
          if (docIndex !== -1) {
            updatedDocuments[docIndex] = {
              ...firebaseDoc,
              isUploading: false
            };
          }

          uploadIndex++;
        });

        return { ...prev, downloadMaterials: updatedDocuments.filter(doc => doc && doc.url) };
      });

      if (validUploads.length < files.length) {
        notify('warning', `Качени ${validUploads.length} от ${files.length} документа`);
      } else {
        notify('success', `Качени всички ${validUploads.length} документа`);
      }

    } catch (error) {
      console.error('Document upload error:', error);
      notify('error', 'Грешка при качване на документите');
    }
  }, []);

  // Remove document
  const removeDocument = useCallback(async (index) => {
    setValues(prev => {
      if (!prev.downloadMaterials || !prev.downloadMaterials[index]) return prev;

      const documentToDelete = prev.downloadMaterials[index];
      const updatedDocuments = prev.downloadMaterials.filter((_, i) => i !== index);

      // Delete from Firebase if needed
      if (documentToDelete?.url && !documentToDelete.isUploading) {
        deleteSingleImage(documentToDelete.url).catch(error => {
          console.error('Error deleting document from Firebase:', error);
        });
      }

      return { ...prev, downloadMaterials: updatedDocuments };
    });
  }, []);

  // Logo upload
  const handleLogoUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);

      // Update UI immediately
      setValues(prev => ({
        ...prev,
        logo: blobUrl,
        logoUploading: true
      }));

      // Compress and upload
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'projects/logos',
        (progress) => { }
      );

      // Update with Firebase URL
      setValues(prev => ({
        ...prev,
        logo: uploadedUrl,
        logoUploading: false
      }));

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      notify('success', 'Логото е качено успешно!');
      return uploadedUrl;

    } catch (error) {
      console.error('Error uploading logo:', error);
      notify('error', 'Грешка при качване на логото');

      // Reset uploading state
      setValues(prev => ({
        ...prev,
        logo: '',
        logoUploading: false
      }));
    }
  }, []);

  // Remove logo
  const removeLogo = useCallback(async () => {
    setValues(prev => {
      const logoToDelete = prev.logo;

      // Delete from Firebase if needed
      if (logoToDelete && !logoToDelete.startsWith('blob:')) {
        deleteSingleImage(logoToDelete).catch(error => {
          console.error('Error deleting logo from Firebase:', error);
        });
      }

      if (logoToDelete?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(logoToDelete);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return { ...prev, logo: '' };
    });
  }, []);

  // Clear all gallery
  const clearAllGallery = useCallback(async () => {
    const confirmed = window.confirm('Сигурни ли сте, че искате да изтриете всички снимки от галерията?');
    if (!confirmed) return;

    setValues(prev => {
      // Delete all images from Firebase
      (prev.gallery || []).forEach(image => {
        if (image?.src && !image.isUploading && !image.src.startsWith('blob:')) {
          deleteSingleImage(image.src).catch(error => {
            console.error('Error deleting gallery image from Firebase:', error);
          });
        }
        if (image?.src?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(image.src);
          } catch (e) {
            console.warn('Could not revoke blob URL:', e);
          }
        }
      });

      return { ...prev, gallery: [] };
    });

    notify('success', 'Всички снимки са изтрити');
  }, []);

  // Clear all documents
  const clearAllDocuments = useCallback(async () => {
    const confirmed = window.confirm('Сигурни ли сте, че искате да изтриете всички документи?');
    if (!confirmed) return;

    setValues(prev => {
      // Delete all documents from Firebase
      (prev.downloadMaterials || []).forEach(document => {
        if (document?.url && !document.isUploading) {
          deleteSingleImage(document.url).catch(error => {
            console.error('Error deleting document from Firebase:', error);
          });
        }
      });

      return { ...prev, downloadMaterials: [] };
    });

    notify('success', 'Всички документи са изтрити');
  }, []);

  // Contact image upload
  const handleContactImageUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);

      // Update UI immediately
      setValues(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          image: blobUrl,
          imageUploading: true
        }
      }));

      // Compress and upload
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500 // Contact image size
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'projects/contact-images',
        (progress) => {
          // Optional: handle progress
        }
      );

      // Update with Firebase URL
      setValues(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          image: uploadedUrl,
          imageUploading: false
        }
      }));

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      notify('success', 'Снимката е качена успешно!');
      return uploadedUrl;

    } catch (error) {
      console.error('Error uploading contact image:', error);
      notify('error', 'Грешка при качване на снимката');

      // Reset uploading state
      setValues(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          image: '',
          imageUploading: false
        }
      }));
    }
  }, []);

  // Remove contact image
  const removeContactImage = useCallback(async () => {
    setValues(prev => {
      const imageToDelete = prev.contact?.image;

      // Remove image URL
      const updatedContact = {
        ...prev.contact,
        image: ''
      };

      // Delete from Firebase if needed
      if (imageToDelete && !imageToDelete.startsWith('blob:')) {
        deleteSingleImage(imageToDelete).catch(error => {
          console.error('Error deleting contact image from Firebase:', error);
        });
      }

      // Clean up blob URL if needed
      if (imageToDelete?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToDelete);
        } catch (e) {
          console.warn('Could not revoke blob URL:', e);
        }
      }

      return {
        ...prev,
        contact: updatedContact
      };
    });
  }, []);

  // Start new draft
  const startNewDraft = useCallback(async () => {
    try {
      if (draftId && userEmail) {
        const convertedData = convertFormToHtml();
        const dataToSave = { ...convertedData, userEmail };
        await updateDraftProject(draftId, dataToSave);
        notify('info', 'Текущата чернова е запазена');
      }

      setDraftId(null);
      clearLocalStorage();
      setValues(defaultValues);
      setErrors({});
      setMediaFiles({
        logo: null,
        mainImage: [],
        gallery: [],
        documents: [],
        partnerLogos: {},
        sponsorLogos: {},
        teamImages: {}
      });

      notify('success', 'Готови сте да започнете нов проект!');

    } catch (error) {
      console.error('Error starting new draft:', error);
      notify('error', 'Грешка при започване на нова чернова');
    }
  }, [draftId, userEmail, convertFormToHtml, updateDraftProject, clearLocalStorage, defaultValues]);

  // Publish draft
  // В useCreateProject.js - намери publishDraft функцията:
  const resetForm = useCallback(() => {

    // 🔧 ИЗРИЧНО ЗАЧИСТВАНЕ НА ЛОКАЦИЯТА
    const cleanDefaultValues = {
      ...defaultValues,
      location: [{
        address: '',
        coordinates: { lat: null, lng: null }
      }]
    };

    setValues(cleanDefaultValues);

    setErrors({});

    setMediaFiles({
      logo: null,
      mainImage: [],
      gallery: [],
      documents: [],
      partnerLogos: {},
      sponsorLogos: {},
      teamImages: {}
    });

    setDraftId(null);
    setEditId(null);

    clearLocalStorage();

  }, [defaultValues, clearLocalStorage]);

  const publishDraft = useCallback(async () => {
    if (!draftId) {
      notify('error', 'Няма чернова за публикуване');
      return;
    }

    try {
      const saveResult = await saveDraft();

      const actualDraftId = saveResult?.data?.id || saveResult?.id || draftId;

      // Обновяваме инициативата ако е свързана
      if (values.initiativeId) {
        try {
          const projectData = convertFormToHtml();
          const initiativeId = typeof values.initiativeId === 'string'
            ? parseInt(values.initiativeId, 10)
            : values.initiativeId;
          await updateInitiativeWithProject(initiativeId, projectData);
        } catch (updateError) {
          console.error('❌ Failed to update initiative:', updateError);
          notify('warning', 'Инициативата не беше обновена, но проектът ще бъде публикуван');
        }
      }

      // Публикуваме проекта
      const result = await toggleProjectDraftStatus(actualDraftId);

      // 🔧 FORCE REFRESH НА ДАННИТЕ СЛЕД ПУБЛИКУВАНЕ
      try {

        // Refresh drafts за да се премахне публикуваният
        await getAllProjectDrafts(1, true);

        // Refresh projects за да се добави новият
        await getAllProjects(1, true);

      } catch (refreshError) {
        console.warn('⚠️ Could not refresh data lists:', refreshError);
        // Не спираме процеса ако refresh-ът се провали
      }

      // 🔧 КЛЮЧОВА ПРОМЯНА - изтриваме черновата след публикуване
      try {
        await deleteDraftProject(actualDraftId);
      } catch (deleteError) {
        console.warn('⚠️ Could not delete draft, but project was published:', deleteError);
        // Не спираме процеса ако изтриването се провали
      }

      clearLocalStorage();

      setDraftId(null);
      setEditId(null);

      resetForm();

      setErrors({});

      // 🔧 TRIGGER CUSTOM EVENT ЗА ДРУГИ КОМПОНЕНТИ
      window.dispatchEvent(new CustomEvent('projectPublished', {
        detail: {
          publishedProject: result.data || result,
          draftId: actualDraftId
        }
      }));

      // Навигираме към проектите
      const publishedProject = result.data || result;
      const projectSlug = publishedProject.slug || publishedProject.id || actualDraftId;

      notify('success', 'Проектът е публикуван успешно!');

      // 🔧 НАВИГАЦИЯ СЛЕД КРАТКА ПАУЗА ЗА ДА СЕ ОБНОВИ STATE-А
      setTimeout(() => {
        if (projectSlug && projectSlug !== 'undefined') {
          navigate(`/projects/${projectSlug}`);
        } else {
          navigate('/projects');
        }
      }, 500);

      return result;
    } catch (error) {
      console.error('❌ Error publishing draft:', error);

      if (error.response?.status === 404) {
        notify('error', 'Черновата не е намерена. Моля запазете отново и опитайте.');

        // 🔧 ОПИТ ЗА СИНХРОНИЗАЦИЯ ПРИ 404
        try {
          await getAllProjectDrafts(1, true);
        } catch (syncError) {
          console.error('Failed to sync drafts:', syncError);
        }
      } else {
        notify('error', `Грешка при публикуване: ${error.message}`);
      }

      throw error;
    }
  }, [draftId, saveDraft, values.initiativeId, convertFormToHtml, updateInitiativeWithProject, toggleProjectDraftStatus, getAllProjectDrafts, getAllProjects, deleteDraftProject, clearLocalStorage, setDraftId, setEditId, resetForm, setErrors, navigate]);

  const handleStartNewProject = useCallback(async () => {
    const confirmed = window.confirm(
      t('projects.create.confirmStartNew') + ' ' +
      t('projects.create.currentWorkWillBeSaved')
    );

    if (!confirmed) return;

    try {

      // 1. ЗАПАЗВАМЕ текущата работа преди да изчистим
      if (values.title?.trim() || draftId) {
        await saveDraft();
      }

      resetForm();

      // 3. ГЕНЕРИРАМЕ нов ID за новата чернова
      setDraftId(null);

      // 4. ИЗВЕСТЯВАМЕ потребителя
      notify('success', t('projects.create.currentWorkSaved'));

      // 5. ОПЦИОНАЛНО: Скролваме до началото
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('❌ Error saving before new project:', error);

      // Ако save-ът се провали, питаме дали да продължим
      const continueAnyway = window.confirm(
        t('projects.create.errorSavingWork') + ' ' +
        t('projects.create.continueAnyway')
      );

      if (continueAnyway) {
        resetForm();
        setDraftId(null);
        notify('warning', t('projects.create.newProjectStarted'));
      }
    }
  }, [values.title, draftId, saveDraft, resetForm, setDraftId]);

  // 💾 FORM SUBMISSION
  const onSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // ... existing validation logic
      return;
    }

    try {
      const submissionData = convertFormToHtml();
      submissionData.updatedAt = new Date().toISOString();

      const urlParams = new URLSearchParams(window.location.search);
      const editIdFromUrl = urlParams.get('editId');
      const mode = urlParams.get('mode');

      if (mode === 'edit' && editIdFromUrl) {
        // EDIT MODE
        await updateProject(editIdFromUrl, submissionData);

        if (submissionData.initiativeId) {
          try {
            const initiativeId = typeof submissionData.initiativeId === 'string'
              ? parseInt(submissionData.initiativeId, 10)
              : submissionData.initiativeId;
            await updateInitiativeWithProject(initiativeId, submissionData);
          } catch (updateError) {
            notify('warning', 'Проектът е обновен, но инициативата не беше обновена');
          }
        }

        // 🔧 ИЗЧИСТВАМЕ СЛЕД EDIT
        resetForm();
        setEditId(null);
        clearLocalStorage();
        setErrors({});

        notify('success', 'Проектът е обновен успешно!');
        navigate(`/projects/${submissionData.slug || editIdFromUrl}`);
      } else {
        // CREATE NEW PROJECT MODE
        submissionData.createdAt = new Date().toISOString();
        delete submissionData.timestamp;

        const handler = onSubmitHandler || createProject;
        const createdProject = await handler(submissionData);

        // Обновяваме инициативата ако е свързана
        if (submissionData.initiativeId) {
          try {
            const initiativeId = typeof submissionData.initiativeId === 'string'
              ? parseInt(submissionData.initiativeId, 10)
              : submissionData.initiativeId;
            const projectToAdd = createdProject?.data || createdProject || submissionData;
            await updateInitiativeWithProject(initiativeId, projectToAdd);
          } catch (updateError) {
            console.error('❌ Failed to update initiative with new project:', updateError);
            notify('warning', 'Проектът е създаден, но инициативата не беше обновена');
          }
        }

        // 🔧 ИЗТРИВАМЕ ЧЕРНОВАТА СЛЕД СЪЗДАВАНЕ
        if (draftId) {
          try {
            await deleteDraftProject(draftId);
          } catch (deleteError) {
            console.warn('⚠️ Could not delete draft, but project was created:', deleteError);
          }
        }

        clearLocalStorage();
        setDraftId(null);
        setEditId(null);
        resetForm();
        setErrors({});

        notify('success', 'Проектът е създаден успешно!');
        navigate('/projects');
      }
    } catch (error) {
      console.error('Submission error:', error);
      notify('error', 'Грешка при създаване на проекта');
    }
  }, [validateForm, errors, onSubmitHandler, createProject, updateProject, navigate, convertFormToHtml, updateInitiativeWithProject, draftId, deleteDraftProject, clearLocalStorage, setDraftId, setEditId, resetForm, setErrors]);

  return {
    values,
    errors,
    mediaFiles,
    isUploading,
    uploadProgress,
    editId,
    setEditId,

    setValues,
    handleStartNewProject,
    // Event handlers
    onChangeHandler,
    onBlurHandler,
    handleEditorChange,
    onSubmit,
    validateForm,
    saveDraft,
    startNewDraft,
    convertFormToHtml,

    // Image handlers
    handleMainImageUpload,
    removeMainImage,
    handleSetMainImage,
    handleRemoveGalleryImage,
    handleSectionImageUpload,
    addSectionImageFromUrl,
    removeSectionImage,
    updateSectionImageAlt,
    updateSectionImageCaption,
    clearSectionImages,
    removeTeamImage,
    handleTeamImageUpload,
    handlePartnerImageUpload,     // 🆕
    removePartnerImage,           // 🆕
    handleSponsorImageUpload,     // 🆕
    removeSponsorImage,
    // Dynamic content handlers
    addPartner,
    removePartner,
    addSponsor,
    removeSponsor,
    addMilestone,
    removeMilestone,
    addRequirement,
    removeRequirement,
    addTag,
    removeTag,
    draftId,
    setDraftId,
    publishDraft,

    // Section handlers
    addSection,
    removeSection,
    updateSection,

    // Team handlers
    addTeamMember,
    removeTeamMember,
    updateTeamMember,

    // Timeline
    calculateDuration,
    formatDate,
    deleteDraftProject,    // 🔧 ДОБАВИ
    clearLocalStorage,     // 🔧 ДОБАВИ
    resetForm,            // 🔧 ДОБАВИ
    setErrors,
    // Utility functions
    generateSlug,
    generateId,
    fileInputRefs,

    // Storage functions
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    hasLocalStorageDraft,
    localStorageTimestamp,
    setHasLocalStorageDraft,
    setLocalStorageTimestamp,
    //медияа
    handleGalleryUpload,      // 🆕
    removeGalleryImage,       // 🆕
    handleDocumentUpload,     // 🆕
    removeDocument,           // 🆕
    handleLogoUpload,         // 🆕
    removeLogo,               // 🆕
    clearAllGallery,          // 🆕
    clearAllDocuments,        // 🆕
    //Contact
    handleContactImageUpload,
    removeContactImage,
    // Utils
    availableInitiatives
  };
};

export default useCreateProject;