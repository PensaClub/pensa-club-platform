/* eslint-disable no-unused-vars */
// hooks/useCreateInitiative.js
import { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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

// 🎨 Нашите нови утилити
import {   
  createSlateEditorState,
  createDraftEditorState,
  createEditorForField,
  validateEditorField,
  convertEditorToHtml,
  isSlateEmpty,
  isDraftEmpty 
} from '../Initiatives/CreateIniciative/Utils/initiativeEditorUtils';
import { notify } from '../../utils/notify';

const useCreateInitiative = (initialValues, onSubmitHandler) => {
  const navigate = useNavigate();
  const { createInitiative, saveDraftInitiative } = useInitiativeContext();
  const { userEmail } = useAuthContext();
  
  // DEFAULT VALUES - със правилните редактори и ВСИЧКИ структури
  const defaultValues = useMemo(() => ({
    // СЪЩЕСТВУВАЩИ ПОЛЕТА
    title: '',
    slug: '',
    shortDescription: '',
    mainImage: { 
      src: '', 
      alt: createDraftEditorState() 
    },
    category: '',
    location: { address: '', coordinates: { lat: null, lng: null } },
    status: 'active',
    campaignStatus: 'open',
    commentsEnabled: true,
    contact: { name: '', position: '', email: '', phone: '', image: '' },
    additionalContacts: [],
    
    // 🔧 ПОПРАВЕНО: Секции с пълна структура
    sections: [], // Ще се добавят динамично с структура: { titleSlug: '', title: '', content: createSlateEditorState(), images: [] }
    
    // 🔧 ПОПРАВЕНО: Download материали с пълна структура  
    downloadMaterials: [], // Ще се добавят динамично с структура: { titleSlug: '', title: '', description: '', fileType: '', fileSize: '', downloadUrl: '', image: { src: '', alt: '' } }
    
    projects: [],
    stories: [],
    publications: [],
    
    // 🆕 НОВИ ПОЛЕТА със правилните редактори
    detailedDescription: createSlateEditorState(), // 🎯 Slate.js за сложно съдържание
    customCategory: '',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    duration: '',
    
    // Milestones с правилна структура
    milestones: [], // { date: '', description: '' }
    
    // Целева група
    targetAge: [], // ['Children', 'Teens', 'Adults', 'Seniors', 'All ages']
    targetAudience: [], // ['Students', 'Professionals', 'Families', 'Elderly', 'Special needs']
    customAudience: '',
    
    // Финансиране
    expectedBudget: '',
    currency: 'BGN',
    fundingSources: [], // ['Government', 'Private', 'Donations', 'Sponsors', 'Self-funded']
    
    // Партньори с правилна структура
    partners: [], // { id: generateId(), name: '', description: '', website: '', type: 'Strategic', logo: null, visible: true }
    
    // Спонсори с правилна структура
    sponsors: [], // { id: generateId(), name: '', amount: '', currency: 'BGN', type: 'Financial', website: '', logo: null, visible: true }
    
    // Лого
    logo: null,
    
    // Контакти
    responsible: { name: '', position: '', email: '', phone: '' },
    organization: { name: '', address: '', website: '' },
    socialMedia: { facebook: '', instagram: '', linkedin: '', twitter: '' },
    
    // Резултати и метрики
    kpis: [], // { name: '', target: '' } - само target, без current
    expectedResults: createSlateEditorState(), // 🎯 Slate.js за сложно съдържание
    progressReport: createSlateEditorState(), // 🎯 Slate.js за сложно съдържание
    impactMetrics: [], // { name: '', value: '', description: '' }
    testimonials: [], // { name: '', position: '', content: '', image: '' }
    
    // Допълнителни
    tags: [],
    relatedInitiatives: [], // масив от ID-та на инициативи
    faq: [] // { question: '', answer: '' }
  }), []);

  const [values, setValues] = useState(initialValues || defaultValues);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 📁 MEDIA FILES STATE
  const [mediaFiles, setMediaFiles] = useState({
    logo: null,
    mainImage: [],
    gallery: [],
    documents: [],
    partnerLogos: {},
    sponsorLogos: {}
  });

  const autoSaveRef = useRef(null);
  const fileInputRefs = useRef({});

  // 🏷️ GENERATE SLUG
  const generateSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // 🆔 GENERATE ID
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      value = e.target.type === 'checkbox' 
        ? (e.target.checked 
            ? [...(values[name] || []), e.target.value]
            : (values[name] || []).filter(item => item !== e.target.value)
          )
        : e.target.value;
    }

    // Auto-generate slug when title changes
    if (name === 'title') {
      setValues(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value)
      }));
    } else {
      setValues(prev => {
        const updatedValues = { ...prev };
        
        // Handle nested objects
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
          // Handle array updates (e.g., "partners[0].name")
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

    // Auto-save draft every 30 seconds
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    autoSaveRef.current = setTimeout(async () => {
      if (userEmail) {
        try {
          await saveDraftInitiative({ ...values, userEmail });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);
  }, [values, errors, generateSlug, saveDraftInitiative, userEmail]);

  // 🎯 HANDLE BLUR (за валидация)
  const onBlurHandler = useCallback((e, isEditor = false, customData = null) => {
    let name;

    if (customData) {
      name = customData.name;
    } else if (isEditor) {
      name = e;
    } else {
      name = e.target.name;
    }

    console.log(`Field ${name} blurred`);
  }, []);

  // 🔄 EDITOR CHANGE HANDLER
  const handleEditorChange = useCallback((fieldName, value) => {
    setValues(prev => {
      const updatedValues = { ...prev };
      
      // Handle nested objects
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

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  // 🔥 FIREBASE FILE UPLOAD HANDLERS

  // 📷 LOGO UPLOAD
  const handleLogoUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!allowedImageTypes.includes(file.type)) {
      notify('error', 'Невалиден тип файл за лого');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'initiatives/logos',
        (progress) => setUploadProgress(progress)
      );

      setValues(prev => ({ ...prev, logo: uploadedUrl }));
      setMediaFiles(prev => ({ ...prev, logo: file }));
      
      notify('success', 'Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload error:', error);
      notify('error', 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // 🖼️ PARTNER LOGO UPLOAD
  const handlePartnerLogoUpload = useCallback(async (file, partnerIndex) => {
    if (!file || !allowedImageTypes.includes(file.type)) {
      notify('error', 'Невалиден тип файл');
      return;
    }

    try {
      setIsUploading(true);

      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'initiatives/partners',
        (progress) => setUploadProgress(progress)
      );

      setValues(prev => {
        const updatedPartners = [...prev.partners];
        updatedPartners[partnerIndex] = {
          ...updatedPartners[partnerIndex],
          logo: uploadedUrl
        };
        return { ...prev, partners: updatedPartners };
      });

      setMediaFiles(prev => ({
        ...prev,
        partnerLogos: { ...prev.partnerLogos, [partnerIndex]: file }
      }));
      
      notify('success', 'Partner logo uploaded successfully');
    } catch (error) {
      console.error('Partner logo upload error:', error);
      notify('error', 'Failed to upload partner logo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // 🎯 SPONSOR LOGO UPLOAD
  const handleSponsorLogoUpload = useCallback(async (file, sponsorIndex) => {
    if (!file || !allowedImageTypes.includes(file.type)) {
      notify('error', 'Невалиден тип файл');
      return;
    }

    try {
      setIsUploading(true);

      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400
      });

      const uploadedUrl = await uploadFileWithProgress(
        compressedFile,
        'initiatives/sponsors',
        (progress) => setUploadProgress(progress)
      );

      setValues(prev => {
        const updatedSponsors = [...prev.sponsors];
        updatedSponsors[sponsorIndex] = {
          ...updatedSponsors[sponsorIndex],
          logo: uploadedUrl
        };
        return { ...prev, sponsors: updatedSponsors };
      });

      setMediaFiles(prev => ({
        ...prev,
        sponsorLogos: { ...prev.sponsorLogos, [sponsorIndex]: file }
      }));
      
      notify('success', 'Sponsor logo uploaded successfully');
    } catch (error) {
      console.error('Sponsor logo upload error:', error);
      notify('error', 'Failed to upload sponsor logo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // 📄 DOCUMENT UPLOAD
  const handleDocumentUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadPromises = Array.from(files).map(async (file, index) => {
        const validation = isValidDocument(file);
        if (!validation.valid) {
          notify('error', `${file.name}: ${validation.error}`);
          return null;
        }

        const uploadedUrl = await uploadDocumentWithProgress(
          file,
          'initiatives/documents',
          (progress) => {
            const totalProgress = ((index + progress/100) / files.length) * 100;
            setUploadProgress(totalProgress);
          }
        );

        return {
          titleSlug: file.name.split('.')[0].toLowerCase().replace(/\s+/g, '-'),
          title: file.name.split('.')[0],
          description: '',
          fileType: file.name.split('.').pop(),
          fileSize: formatFileSize(file.size),
          downloadUrl: uploadedUrl,
          image: {
            src: '',
            alt: `${file.name} document`
          }
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      const validDocs = uploadedDocs.filter(doc => doc !== null);

      setValues(prev => ({
        ...prev,
        downloadMaterials: [...prev.downloadMaterials, ...validDocs]
      }));

      setMediaFiles(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));

      notify('success', `${validDocs.length} document(s) uploaded successfully`);
    } catch (error) {
      console.error('Document upload error:', error);
      notify('error', 'Failed to upload documents');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // 🆕 DYNAMIC CONTENT MANAGEMENT

  // Partners
  const addPartner = useCallback(() => {
    const newPartner = {
      id: generateId(),
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
    
    setMediaFiles(prev => {
      const updated = { ...prev.partnerLogos };
      delete updated[index];
      return { ...prev, partnerLogos: updated };
    });
  }, []);

  // Sponsors
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
    
    setMediaFiles(prev => {
      const updated = { ...prev.sponsorLogos };
      delete updated[index];
      return { ...prev, sponsorLogos: updated };
    });
  }, []);

  // Milestones
  const addMilestone = useCallback(() => {
    setValues(prev => ({
      ...prev,
      milestones: [...prev.milestones, { date: '', description: '' }]
    }));
  }, []);

  const removeMilestone = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  }, []);

  // KPIs
  const addKPI = useCallback(() => {
    setValues(prev => ({
      ...prev,
      kpis: [...prev.kpis, { name: '', target: '' }]
    }));
  }, []);

  const removeKPI = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      kpis: prev.kpis.filter((_, i) => i !== index)
    }));
  }, []);

  // FAQ
  const addFAQ = useCallback(() => {
    setValues(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }));
  }, []);

  const removeFAQ = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  }, []);

  // Tags
  const addTag = useCallback((tag) => {
    if (tag.trim() && !values.tags.includes(tag.trim())) {
      setValues(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  }, [values.tags]);

  const removeTag = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  }, []);

  // 🆕 SECTIONS MANAGEMENT
  const addSection = useCallback(() => {
    const newSection = {
      titleSlug: `section-${Date.now()}`,
      title: '',
      content: createSlateEditorState(), // 🎯 Slate редактор за content
      images: [] // { src: '', alt: '', caption: '' }
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

  // 🆕 SECTION IMAGES MANAGEMENT
  const addSectionImage = useCallback((sectionIndex) => {
    const newImage = {
      src: '',
      alt: '',
      caption: ''
    };
    
    setValues(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: [...updatedSections[sectionIndex].images, newImage]
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const removeSectionImage = useCallback((sectionIndex, imageIndex) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        images: updatedSections[sectionIndex].images.filter((_, i) => i !== imageIndex)
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);

  // 🆕 DOWNLOAD MATERIALS MANAGEMENT  
  const addDownloadMaterial = useCallback(() => {
    const newMaterial = {
      titleSlug: `material-${Date.now()}`,
      title: '',
      description: '',
      fileType: '',
      fileSize: '',
      downloadUrl: '',
      image: {
        src: '',
        alt: ''
      }
    };
    
    setValues(prev => ({
      ...prev,
      downloadMaterials: [...prev.downloadMaterials, newMaterial]
    }));
  }, []);

  const removeDownloadMaterial = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      downloadMaterials: prev.downloadMaterials.filter((_, i) => i !== index)
    }));
  }, []);

  // ✅ FORM VALIDATION с новите утилити
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Basic Info validation
    if (!values.title?.trim()) newErrors.title = 'Title is required';
    if (!values.shortDescription?.trim()) newErrors.shortDescription = 'Short description is required';
    
    // Slate.js валидация с новите утилити
    if (!validateEditorField('detailedDescription', values.detailedDescription)) {
      newErrors.detailedDescription = 'Detailed description is required';
    }
    
    if (!values.category?.trim() && !values.customCategory?.trim()) {
      newErrors.category = 'Category is required';
    }

    // Timeline validation
    if (values.startDate && values.endDate) {
      if (new Date(values.startDate) >= new Date(values.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Budget validation
    if (values.expectedBudget && isNaN(Number(values.expectedBudget))) {
      newErrors.expectedBudget = 'Budget must be a valid number';
    }

    // Partners validation
    if (!values.partners || values.partners.length === 0) {
      newErrors.partners = 'At least one partner is required';
    } else {
      values.partners.forEach((partner, index) => {
        if (!partner.name?.trim()) {
          newErrors[`partners[${index}].name`] = 'Partner name is required';
        }
      });
    }

    // Contact validation
    if (values.responsible.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.responsible.email)) {
      newErrors['responsible.email'] = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  // 💾 SAVE DRAFT
  const saveDraft = useCallback(async () => {
    try {
      await saveDraftInitiative({ ...values, userEmail });
      notify('success', 'Draft saved successfully');
    } catch (error) {
      console.error('Save draft error:', error);
      notify('error', 'Failed to save draft');
    }
  }, [values, saveDraftInitiative, userEmail]);

  // 📤 HTML CONVERSION за submission
  const convertFormToHtml = useCallback(() => {
    const htmlValues = { ...values };
    
    // Конвертиране на всички редактори в HTML с новите утилити
    htmlValues.detailedDescription = convertEditorToHtml('detailedDescription', values.detailedDescription);
    htmlValues.expectedResults = convertEditorToHtml('expectedResults', values.expectedResults);
    htmlValues.progressReport = convertEditorToHtml('progressReport', values.progressReport);
    htmlValues.mainImage.alt = convertEditorToHtml('mainImage.alt', values.mainImage.alt);
    
    // Конвертиране на секциите
    htmlValues.sections = values.sections.map(section => ({
      ...section,
      content: convertEditorToHtml('sections[].content', section.content)
    }));
    
    return htmlValues;
  }, [values]);

  // 💾 FORM SUBMISSION
  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify('error', 'Please fix the errors before submitting');
      return;
    }

    try {
      // Конвертираме редакторите в HTML преди изпращане
      const submissionData = convertFormToHtml();
      submissionData.createdAt = new Date().toISOString();
      submissionData.updatedAt = new Date().toISOString();

      const handler = onSubmitHandler || createInitiative;
      await handler(submissionData, mediaFiles);
      
      notify('success', 'Initiative created successfully!');
      navigate('/initiatives');
    } catch (error) {
      console.error('Submission error:', error);
      notify('error', 'Failed to create initiative');
    }
  }, [values, mediaFiles, validateForm, onSubmitHandler, createInitiative, navigate, convertFormToHtml]);

  return {
    values,
    errors,
    mediaFiles,
    isUploading,
    uploadProgress,
    
    // Event handlers
    onChangeHandler,
    onBlurHandler,
    handleEditorChange, // 🆕 За редакторите
    onSubmit,
    validateForm,
    saveDraft,
    convertFormToHtml, // 🆕 За submission
    
    // Dynamic content handlers
    addPartner,
    removePartner,
    addSponsor,
    removeSponsor,
    addMilestone,
    removeMilestone,
    addKPI,
    removeKPI,
    addFAQ,
    removeFAQ,
    addTag,
    removeTag,
    
    // 🆕 SECTIONS HANDLERS
    addSection,
    removeSection,
    updateSection,
    addSectionImage,
    removeSectionImage,
    
    // 🆕 DOWNLOAD MATERIALS HANDLERS
    addDownloadMaterial,
    removeDownloadMaterial,
    
    // 🔥 Firebase upload handlers
    handleLogoUpload,
    handlePartnerLogoUpload,
    handleSponsorLogoUpload,
    handleDocumentUpload,
    setValues,
    // Utility functions
    generateSlug,
    generateId,
    fileInputRefs
  };
};

export default useCreateInitiative;