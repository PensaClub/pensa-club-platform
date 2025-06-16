/* eslint-disable react-hooks/exhaustive-deps */
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
import {
    uploadInitiativeImages,
    uploadSectionImages,
    deleteSingleImage,
    deleteInitiativeImages,
    processInitiativeImageChanges
} from '../../utils/initiative-firebase-utils';
import { faFileAlt, faFileArchive, faFileExcel, faFileImage, faFilePowerpoint, faFileWord } from '@fortawesome/free-solid-svg-icons';

const useCreateInitiative = (initialValues, onSubmitHandler) => {
    const navigate = useNavigate();
    const { createInitiative, saveDraftInitiative } = useInitiativeContext();
    const { userEmail } = useAuthContext();
    const STORAGE_KEY = 'initiative_draft';
    const STORAGE_TIMESTAMP_KEY = 'initiative_draft_timestamp';
     const [hasLocalStorageDraft, setHasLocalStorageDraft] = useState(false);
    const [localStorageTimestamp, setLocalStorageTimestamp] = useState(null);
    // DEFAULT VALUES - със правилните редактори и ВСИЧКИ структури
    const defaultValues = useMemo(() => ({
        // СЪЩЕСТВУВАЩИ ПОЛЕТА
        title: '',
        slug: '',
        shortDescription: '',
        mainImage: {
            src: '',
            alt: '',
            caption: '',
            gallery: []
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
        relatedInitiatives: [], 
        faq: [] ,
         gallery: []
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
    const [editingDocument, setEditingDocument] = useState(null);
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
   const saveToLocalStorage = useCallback((data) => {
        try {
            const dataToSave = {
                ...data,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());

        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
            notify('warning', 'Не може да се запази чернова в браузъра');
        }
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

    // 🔧 ОБНОВЕН Auto-save - и localStorage и база данни
    if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
    }
    autoSaveRef.current = setTimeout(async () => {
        const currentValues = { ...values, [name]: value }; // Включваме новата стойност
        
        // 💾 Запазваме в localStorage винаги
        saveToLocalStorage(currentValues);
        
        // 🗄️ Опитваме да запазим и в базата данни
        if (userEmail) {
            try {
                await saveDraftInitiative({ ...currentValues, userEmail });
                console.log('🔄 Auto-saved to both localStorage and database');
            } catch (error) {
                console.error('Auto-save to database failed:', error);
                console.log('🔄 Auto-saved to localStorage only');
            }
        } else {
            console.log('🔄 Auto-saved to localStorage only (no user)');
        }
    }, 30000);
}, [values, errors, generateSlug, saveDraftInitiative, userEmail, saveToLocalStorage]);

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
    // 🕒 TIMELINE HELPER FUNCTIONS
    const calculateDuration = useCallback((startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('bg-BG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }, []);

    // 📷 LOGO UPLOAD
    const handleLogoUpload = useCallback(async (e) => { // ⬅️ Променяме от (files) на (e)
        const files = e.target.files; // ⬅️ Извличаме файловете от event-а

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
    const handleDocumentUpload = useCallback(async (e) => {
        const files = e.target.files;
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

                // 🔧 ВРЪЩАМЕ КЪМ ОРИГИНАЛА (без custom fileName)
                const uploadedUrl = await uploadDocumentWithProgress(
                    file,
                    `initiatives/documents/${file.name}`, // ⬅️ Включи името в path-а!
                    (progress) => {
                        const totalProgress = ((index + progress / 100) / files.length) * 100;
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
                    originalName: file.name, // ⬅️ Запазваме за download attr
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

            e.target.value = '';

        } catch (error) {
            console.error('Document upload error:', error);
            notify('error', 'Failed to upload documents');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, []);
    const handleDocumentDownload = useCallback((docFile) => {
        try {
            // За PDF - отваря в нов tab
            if (docFile.fileType.toLowerCase() === 'pdf') {
                window.open(docFile.downloadUrl, '_blank');
                notify('info', 'Opening PDF');
                return;
            }

            // За други файлове - опитай с download атрибут
            const link = window.document.createElement('a');
            link.href = docFile.downloadUrl;
            link.download = docFile.originalName;
            link.style.display = 'none';
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);

            // Fallback - ако download не работи, отвори в нов tab
            setTimeout(() => {
                window.open(docFile.downloadUrl, '_blank');
            }, 1000);

            notify('success', `Downloading/Opening ${docFile.originalName}`);
        } catch (error) {
            console.error('Download error:', error);
            // Fallback
            window.open(docFile.downloadUrl, '_blank');
        }
    }, []);
    const updateDocumentField = useCallback((index, field, value) => {
        setValues(prev => {
            const updatedMaterials = [...prev.downloadMaterials];

            if (field.includes('.')) {
                // За nested fields като 'image.alt'
                const keys = field.split('.');
                let current = updatedMaterials[index];
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
            } else {
                updatedMaterials[index][field] = value;
            }

            return { ...prev, downloadMaterials: updatedMaterials };
        });
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
    // В useCreateInitiative.js - ПОПРАВЕНО
    const handleSetMainImage = useCallback((index) => {
        setValues(prev => {
            const selectedImage = prev.mainImage.gallery[index];
            const currentMain = {
                src: prev.mainImage.src,
                alt: prev.mainImage.alt,
                caption: prev.mainImage.caption
            };

            // Swap главната с избраната
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

    // В useCreateInitiative.js - ПЪЛЕН handleMainImageUpload с debug
    const handleMainImageUpload = useCallback(async (e) => {

        // Директно достъп до файловете
        const input = e.target;
        const files = input.files;

        if (!files) {

            return;
        }

        if (files.length === 0) {

            return;
        }

        // Покажи файловете
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

        }

        // Създай масив от файловете
        const fileArray = [];
        for (let i = 0; i < files.length; i++) {
            fileArray.push(files[i]);
        }

        // 🚀 ВЕДНАГА показваме снимките
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
                console.error(`❌ Error creating blob for ${file.name}:`, error);
            }
        });

        if (newImages.length === 0) {

            return;
        }

        // Веднага обновяваме UI
        setValues(prev => {

            const existingGallery = prev.mainImage?.gallery || [];
            const shouldUpdateMain = !prev.mainImage?.src;

            let newState;

            if (shouldUpdateMain) {
                newState = {
                    ...prev,
                    mainImage: {
                        src: newImages[0].src,
                        alt: newImages[0].alt,
                        caption: newImages[0].caption,
                        gallery: [...existingGallery, ...newImages.slice(1)]
                    }
                };

            } else {
                newState = {
                    ...prev,
                    mainImage: {
                        ...prev.mainImage,
                        gallery: [...existingGallery, ...newImages]
                    }
                };

            }

            return newState;
        });

        // Изчистваме input
        input.value = '';

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
                        'initiatives/main-images',
                        (progress) => {

                        }
                    );

                    uploadedImages.push({
                        src: url,
                        alt: '',
                        caption: ''
                    });

                } catch (fileError) {
                    console.error(`❌ Error uploading file ${i + 1}:`, fileError);
                    uploadedImages.push(null);
                }
            }

            const validUploads = uploadedImages.filter(img => img !== null);

            if (validUploads.length === 0) {

                notify('error', 'Нито една снимка не се качи');
                return;
            }

            // Заменяме blob URLs с Firebase URLs
            setValues(prev => {

                if (!prev.mainImage) {

                    return prev;
                }

                let newMainImage = { ...prev.mainImage };
                let updatedGallery = [...(prev.mainImage.gallery || [])];

                // Заменяме blob URLs със съответните Firebase URLs
                let uploadIndex = 0;
                newImages.forEach((blobImg, blobIndex) => {

                    if (!blobImg?.src || uploadIndex >= validUploads.length) {

                        return;
                    }

                    const firebaseImg = validUploads[uploadIndex];
                    if (!firebaseImg) {

                        return;
                    }

                    // Главна снимка
                    if (newMainImage.src === blobImg.src) {

                        newMainImage.src = firebaseImg.src;
                    }

                    // Gallery снимки
                    const galleryIndex = updatedGallery.findIndex(img => img?.src === blobImg.src);
                    if (galleryIndex !== -1) {

                        updatedGallery[galleryIndex] = {
                            ...firebaseImg,
                            alt: updatedGallery[galleryIndex].alt || '',
                            caption: updatedGallery[galleryIndex].caption || ''
                        };
                    }

                    // Cleanup blob URL
                    try {
                        URL.revokeObjectURL(blobImg.src);

                    } catch (e) {
                        console.warn('Could not revoke blob URL:', e);
                    }

                    uploadIndex++;
                });

                const finalState = {
                    ...prev,
                    mainImage: {
                        ...newMainImage,
                        gallery: updatedGallery.filter(img => img && img.src)
                    }
                };

                return finalState;
            });

            if (validUploads.length < fileArray.length) {
                notify('warning', `Качени ${validUploads.length} от ${fileArray.length} снимки`);
            } else {
                notify('success', `Качени всички ${validUploads.length} снимки`);
            }

        } catch (error) {
            console.error('❌ Upload error:', error);
            notify('error', 'Грешка при качване на снимки');

            // При грешка махаме неуспешните снимки
            setValues(prev => {
                if (!prev.mainImage) return prev;

                return {
                    ...prev,
                    mainImage: {
                        ...prev.mainImage,
                        gallery: (prev.mainImage.gallery || []).filter(img =>
                            img && img.src && !img.isUploading && !img.src.startsWith('blob:')
                        )
                    }
                };
            });
        }
    }, []);

    // В useCreateInitiative.js - OPTIMISTIC section upload
    const handleSectionImageUpload = useCallback(async (e, sectionIndex) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // 🚀 ВЕДНАГА показваме снимките
        const newImages = [];
        Array.from(files).forEach((file) => {
            const blobUrl = URL.createObjectURL(file);
            newImages.push({
                src: blobUrl,
                alt: '',
                caption: '',
                isUploading: true
            });
        });

        // Веднага обновяваме UI
        setValues(prev => {
            const updatedSections = [...prev.sections];
            const existingImages = updatedSections[sectionIndex].images || [];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: [...existingImages, ...newImages]
            };
            return { ...prev, sections: updatedSections };
        });

        // 🔥 В BACKGROUND качваме във Firebase
        try {
            const uploadedImages = await uploadSectionImages(files, sectionIndex, () => { });

            // Заменяме blob URLs с Firebase URLs
            setValues(prev => {
                const updatedSections = [...prev.sections];
                let updatedImages = [...updatedSections[sectionIndex].images];

                newImages.forEach((blobImg, index) => {
                    const imageIndex = updatedImages.findIndex(img => img.src === blobImg.src);
                    if (imageIndex !== -1) {
                        updatedImages[imageIndex] = {
                            ...uploadedImages[index],
                            alt: updatedImages[imageIndex].alt,
                            caption: updatedImages[imageIndex].caption,
                            isUploading: false
                        };
                    }
                    URL.revokeObjectURL(blobImg.src);
                });

                updatedSections[sectionIndex].images = updatedImages;
                return { ...prev, sections: updatedSections };
            });

        } catch (error) {
            console.error('Грешка при качване във Firebase:', error);
            notify('error', 'Някои снимки не се качиха');
        }
    }, []);

    // В useCreateInitiative.js - ПОПРАВЕНО с null checks
    const handleRemoveGalleryImage = useCallback(async (index) => {
        setValues(prev => {
            if (!prev.mainImage?.gallery || !prev.mainImage.gallery[index]) {
                console.warn('Invalid gallery index:', index);
                return prev; // 🔧 Safety return
            }

            const imageToDelete = prev.mainImage.gallery[index];
            const updatedGallery = prev.mainImage.gallery.filter((_, i) => i !== index);

            let newMainImage = { ...prev.mainImage };

            // Ако премахваме главната снимка
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
                    gallery: updatedGallery.filter(img => img && img.src) // 🔧 Филтрираме undefined
                };
            }
            // 🔥 В BACKGROUND изтриваме от Firebase
            if (imageToDelete?.src && !imageToDelete.isUploading) {
                deleteSingleImage(imageToDelete.src).catch(error => {
                    console.error('Грешка при изтриване от Firebase:', error);
                });
            }

            // Cleanup blob URL
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
    }, []);// 🔧 Празни dependencies - използваме functional updates

    const removeSectionImageItem = useCallback(async (sectionIndex, imageIndex) => {
        const imageToDelete = values.sections[sectionIndex]?.images?.[imageIndex];

        // 🚀 ВЕДНАГА махаме от UI
        setValues(prev => {
            const updatedSections = [...prev.sections];
            const updatedImages = updatedSections[sectionIndex].images.filter((_, i) => i !== imageIndex);
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: updatedImages
            };
            return { ...prev, sections: updatedSections };
        });

        // 🔥 В BACKGROUND изтриваме от Firebase
        if (imageToDelete?.src && !imageToDelete.isUploading) {
            try {
                await deleteSingleImage(imageToDelete.src);
            } catch (error) {
                console.error('Грешка при изтриване от Firebase:', error);
            }
        }

        if (imageToDelete?.src?.startsWith('blob:')) {
            URL.revokeObjectURL(imageToDelete.src);
        }
    }, [values.sections]);

    // 🔧 ОБНОВЕНО: Clear section images с Firebase изтриване
    const clearSectionImages = useCallback(async (sectionIndex) => {
        try {
            const imagesToDelete = values.sections[sectionIndex]?.images || [];

            // Изтриваме всички от Firebase
            const deletePromises = imagesToDelete.map(img => {
                if (img?.src) {
                    return deleteSingleImage(img.src);
                }
                return Promise.resolve();
            });

            await Promise.all(deletePromises);

            // Обновяваме state
            const updatedSections = [...values.sections];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: []
            };
            setValues(prev => ({ ...prev, sections: updatedSections }));

            notify('success', 'Всички снимки са изтрити');
        } catch (error) {
            console.error('Грешка при изтриване на снимки:', error);
            notify('error', 'Грешка при изтриване на снимки');
        }
    }, [values.sections]);
    // 🆕 ДОБАВЕНО: Clear main image gallery
    const clearMainImageGallery = useCallback(async () => {
        try {
            const imagesToDelete = values.mainImage.gallery || [];

            // Изтриваме всички от Firebase
            const deletePromises = imagesToDelete.map(img => {
                if (img?.src) {
                    return deleteSingleImage(img.src);
                }
                return Promise.resolve();
            });

            await Promise.all(deletePromises);

            // Обновяваме state
            setValues(prev => ({
                ...prev,
                mainImage: {
                    ...prev.mainImage,
                    src: '',
                    alt: '',
                    caption: '',
                    gallery: []
                }
            }));

            notify('success', 'Всички снимки са изтрити');
        } catch (error) {
            console.error('Грешка при изтриване на снимки:', error);
            notify('error', 'Грешка при изтриване на снимки');
        }
    }, [values.mainImage.gallery]);

    const removeMainImage = useCallback(async () => {
        setValues(prev => {
            const imageToDelete = prev.mainImage.src;

            let newMainImage;

            if (prev.mainImage.gallery && prev.mainImage.gallery.length > 0) {
                // Поставяме първата от gallery като главна
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

            // 🔥 В BACKGROUND изтриваме от Firebase
            if (imageToDelete && !imageToDelete.startsWith('blob:')) {
                deleteSingleImage(imageToDelete).catch(error => {
                    console.error('Грешка при изтриване от Firebase:', error);
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
    }, []); // 🔧 Празни dependencies
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

    const removeDownloadMaterial = useCallback(async (index) => {
        const documentToDelete = values.downloadMaterials[index];

        // 🚀 ВЕДНАГА махаме от UI
        setValues(prev => ({
            ...prev,
            downloadMaterials: prev.downloadMaterials.filter((_, i) => i !== index)
        }));

        // 🔥 В BACKGROUND изтриваме от Firebase
        if (documentToDelete?.downloadUrl && !documentToDelete.downloadUrl.startsWith('blob:')) {
            try {
                await deleteSingleImage(documentToDelete.downloadUrl); // Същата функция работи и за документи

            } catch (error) {
                console.error('❌ Error deleting document from Firebase:', error);
            }
        }

        notify('success', 'Документът е премахнат');
    }, [values.downloadMaterials]);

    //Additional Gallery Management:
    const clearGallery = useCallback(async () => {
        const imagesToDelete = values.gallery || [];

        // 🚀 ВЕДНАГА изчистваме UI
        setValues(prev => ({ ...prev, gallery: [] }));

        // 🔥 В BACKGROUND изтриваме всички от Firebase
        if (imagesToDelete.length > 0) {
            try {
                const deletePromises = imagesToDelete.map(img => {
                    if (img?.src && !img.src.startsWith('blob:')) {
                        return deleteSingleImage(img.src);
                    }
                    // Cleanup blob URLs
                    if (img?.src?.startsWith('blob:')) {
                        try {
                            URL.revokeObjectURL(img.src);
                        } catch (e) {
                            console.warn('Could not revoke blob URL:', e);
                        }
                    }
                    return Promise.resolve();
                });

                await Promise.all(deletePromises);

                notify('success', 'Всички снимки са премахнати');
            } catch (error) {
                console.error('❌ Error deleting gallery images from Firebase:', error);
                notify('error', 'Грешка при изтриване на снимки');
            }
        }
    }, [values.gallery]);

    const updateGalleryImageAlt = useCallback((index, value) => {
        setValues(prev => {
            const updatedGallery = [...prev.gallery];
            updatedGallery[index] = { ...updatedGallery[index], alt: value };
            return { ...prev, gallery: updatedGallery };
        });
    }, []);

    const updateGalleryImageCaption = useCallback((index, value) => {
        setValues(prev => {
            const updatedGallery = [...prev.gallery];
            updatedGallery[index] = { ...updatedGallery[index], caption: value };
            return { ...prev, gallery: updatedGallery };
        });
    }, []);

    const removeGalleryImage = useCallback(async (index) => {
        const imageToDelete = values.gallery?.[index];

        // 🚀 ВЕДНАГА махаме от UI
        setValues(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));

        // 🔥 В BACKGROUND изтриваме от Firebase
        if (imageToDelete?.src && !imageToDelete.src.startsWith('blob:')) {
            try {
                await deleteSingleImage(imageToDelete.src);

            } catch (error) {
                console.error('❌ Error deleting gallery image from Firebase:', error);
            }
        }

        // Cleanup blob URL ако е такъв
        if (imageToDelete?.src?.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(imageToDelete.src);
            } catch (e) {
                console.warn('Could not revoke blob URL:', e);
            }
        }

        notify('success', 'Снимката е премахната');
    }, [values.gallery]);

    // 📷 CONTACT IMAGE UPLOAD - добави в hook-а
    const handleContactImageUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file || !allowedImageTypes.includes(file.type)) {
            notify('error', 'Невалиден тип файл за снимка');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const compressedFile = await compressImage(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 400
            });

            const uploadedUrl = await uploadFileWithProgress(
                compressedFile,
                'initiatives/contacts',
                (progress) => setUploadProgress(progress)
            );

            setValues(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    image: uploadedUrl
                }
            }));

            setMediaFiles(prev => ({
                ...prev,
                contactImage: file
            }));

            notify('success', 'Contact image uploaded successfully');
        } catch (error) {
            console.error('Contact image upload error:', error);
            notify('error', 'Failed to upload contact image');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, []);

    // 🗑️ REMOVE CONTACT IMAGE
    const removeContactImage = useCallback(async () => {
        const imageToDelete = values.contact?.image;

        setValues(prev => ({
            ...prev,
            contact: {
                ...prev.contact,
                image: ''
            }
        }));

        // 🔥 В BACKGROUND изтриваме от Firebase
        if (imageToDelete && !imageToDelete.startsWith('blob:')) {
            try {
                await deleteSingleImage(imageToDelete);
            } catch (error) {
                console.error('Грешка при изтриване от Firebase:', error);
            }
        }

        if (imageToDelete?.startsWith('blob:')) {
            URL.revokeObjectURL(imageToDelete);
        }

        setMediaFiles(prev => ({
            ...prev,
            contactImage: null
        }));

        notify('success', 'Contact image removed');
    }, [values.contact?.image]);

    //Media Upload 
    const removeLogo = useCallback(() => {
        setValues(prev => ({ ...prev, logo: null }));
        setMediaFiles(prev => ({ ...prev, logo: null }));
        notify('success', 'Logo removed');
    }, []);
    const getFileIcon = useCallback((fileType) => {
        const iconMap = {
            // 📄 PDF
            'pdf': faFileAlt,

            // 📝 Word документи
            'doc': faFileWord,
            'docx': faFileWord,

            // 📊 Excel документи  
            'xls': faFileExcel,
            'xlsx': faFileExcel,
            'xlsm': faFileExcel,
            'xlsb': faFileExcel,

            // 📈 PowerPoint презентации
            'ppt': faFilePowerpoint,
            'pptx': faFilePowerpoint,
            'pptm': faFilePowerpoint,
            // 🖼️ Изображения
            'jpg': faFileImage,
            'jpeg': faFileImage,
            'png': faFileImage,
            'gif': faFileImage,
            'webp': faFileImage,
            // 📁 Архиви
            'zip': faFileArchive,
            'rar': faFileArchive,
            '7z': faFileArchive,
            // 📄 Текст
            'txt': faFileAlt,
            'csv': faFileAlt,
        };
        return iconMap[fileType.toLowerCase()] || iconMap.default;
    }, []);

    const handleGalleryUpload = useCallback(async (e) => {

        const files = e.target.files; // ⬅️ ВАЖНО: Трябва event.target.files!

        if (!files || files.length === 0) {
            return;
        }

        // 🚀 ВЕДНАГА показваме снимките с blob URLs
        const newImages = [];
        Array.from(files).forEach((file, index) => {

            if (allowedImageTypes.includes(file.type)) {
                const blobUrl = URL.createObjectURL(file);
                newImages.push({
                    src: blobUrl,
                    alt: '',
                    caption: '',
                    isUploading: true,
                    fileId: Date.now() + Math.random() + index
                });
            }
        });

        if (newImages.length === 0) {
            notify('error', 'Няма валидни изображения за качване');
            return;
        }

        // Веднага обновяваме UI
        setValues(prev => ({
            ...prev,
            gallery: [...(prev.gallery || []), ...newImages]
        }));

        try {
            const uploadedImages = [];

            // Upload всеки файл във Firebase
            for (let i = 0; i < newImages.length; i++) {
                const file = Array.from(files)[i];

                try {

                    const compressedFile = await compressImage(file, {
                        maxSizeMB: 2,
                        maxWidthOrHeight: 1920
                    });

                    const url = await uploadFileWithProgress(
                        compressedFile,
                        'initiatives/gallery',
                        (progress) => {

                        }
                    );

                    uploadedImages.push({
                        src: url,
                        alt: '',
                        caption: ''
                    });

                } catch (fileError) {
                    console.error(`❌ Error uploading file ${i + 1}:`, fileError);
                    uploadedImages.push(null);
                }
            }

            const validUploads = uploadedImages.filter(img => img !== null);

            // Заменяме blob URLs с Firebase URLs
            setValues(prev => {
                let updatedGallery = [...(prev.gallery || [])];

                newImages.forEach((blobImg, blobIndex) => {
                    if (validUploads[blobIndex]) {
                        const galleryIndex = updatedGallery.findIndex(img => img?.src === blobImg.src);
                        if (galleryIndex !== -1) {
                            updatedGallery[galleryIndex] = {
                                ...validUploads[blobIndex],
                                alt: updatedGallery[galleryIndex].alt || '',
                                caption: updatedGallery[galleryIndex].caption || '',
                                isUploading: false
                            };
                        }
                    }

                    // Cleanup blob URL
                    if (blobImg?.src?.startsWith('blob:')) {
                        try {
                            URL.revokeObjectURL(blobImg.src);
                        } catch (e) {
                            console.warn('Could not revoke blob URL:', e);
                        }
                    }
                });

                return {
                    ...prev,
                    gallery: updatedGallery.filter(img => img && img.src)
                };
            });

            if (validUploads.length < newImages.length) {
                notify('warning', `Качени ${validUploads.length} от ${newImages.length} снимки`);
            } else {
                notify('success', `Качени всички ${validUploads.length} снимки в галерията`);
            }

        } catch (error) {
            console.error('❌ Gallery upload error:', error);
            notify('error', 'Грешка при качване на снимки в галерията');

            // При грешка махаме неуспешните снимки
            setValues(prev => ({
                ...prev,
                gallery: (prev.gallery || []).filter(img =>
                    img && img.src && !img.isUploading && !img.src.startsWith('blob:')
                )
            }));
        }
    }, []);

    // ✅ FORM VALIDATION с новите утилити
    const validateForm = useCallback(() => {
        const newErrors = {};
        // 🕒 Timeline validation
        if (values.startDate && values.endDate) {
            if (new Date(values.startDate) >= new Date(values.endDate)) {
                newErrors.endDate = 'Крайната дата трябва да е след началната';
            }
        }
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
        // Milestone validation
        values.milestones.forEach((milestone, index) => {
            if (milestone.date) {
                const milestoneDate = new Date(milestone.date);
                const startDate = new Date(values.startDate);
                const endDate = new Date(values.endDate);

                if (values.startDate && milestoneDate < startDate) {
                    newErrors[`milestones[${index}].date`] = 'Етапът не може да е преди началната дата';
                }

                if (values.endDate && milestoneDate > endDate) {
                    newErrors[`milestones[${index}].date`] = 'Етапът не може да е след крайната дата';
                }
            }

            if (milestone.date && !milestone.description.trim()) {
                newErrors[`milestones[${index}].description`] = 'Описанието на етапа е задължително';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);
    // localStorage utility функции
 
    const loadFromLocalStorage = useCallback(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

            if (savedData && timestamp) {
                const parsedData = JSON.parse(savedData);
                const saveTime = new Date(timestamp);
                const now = new Date();
                const hoursDiff = (now - saveTime) / (1000 * 60 * 60);

                // Проверяваме дали данните не са по-стари от 7 дни
                if (hoursDiff < 168) { // 7 дни = 168 часа

                    return {
                        data: parsedData,
                        timestamp: saveTime
                    };
                } else {
                    // Изчистваме стари данни
                    clearLocalStorage();

                }
            }
            return null;
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
            clearLocalStorage();
            return null;
        }
    }, []);
    const clearLocalStorage = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
            setHasLocalStorageDraft(false);
            setLocalStorageTimestamp(null);
           
        } catch (error) {
            console.error('❌ Error clearing localStorage:', error);
        }
    }, []);
    // 💾 SAVE DRAFT
    const saveDraft = useCallback(async () => {
        try {
            // Запазваме в localStorage
            saveToLocalStorage(values);

            // Опитваме да запазим и в базата данни
            if (userEmail) {
                await saveDraftInitiative({ ...values, userEmail });
                notify('success', 'Черновата е запазена в профила и браузъра');
            } else {
                notify('success', 'Черновата е запазена в браузъра');
            }
        } catch (error) {
            console.error('Save draft error:', error);
            notify('warning', 'Черновата е запазена само в браузъра');
        }
    }, [values, saveDraftInitiative, userEmail, saveToLocalStorage]);

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

    // 💾 FORM SUBMISSION - ОБНОВЕНО
    const onSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            notify('error', 'Please fix the errors before submitting');
            return;
        }

        try {
            // 🔧 ВАЖНО: Не пращаме mediaFiles, само data-та с URL адресите
            const submissionData = convertFormToHtml();
            submissionData.createdAt = new Date().toISOString();
            submissionData.updatedAt = new Date().toISOString();

            const handler = onSubmitHandler || createInitiative;
            // 🔧 ПРОМЕНЕНО: Пращаме само данните, не файловете
            await handler(submissionData);
            // ✅ При успешно изпращане, изчистваме localStorage
            clearLocalStorage();
            notify('success', 'Initiative created successfully!');
            navigate('/initiatives');
        } catch (error) {
            console.error('Submission error:', error);
            notify('error', 'Failed to create initiative');
        }
    }, [values, validateForm, onSubmitHandler, createInitiative, navigate, convertFormToHtml]);

    // В useCreateInitiative.js - в return statement добави:
    return {
        values,
        errors,
        mediaFiles,
        isUploading,
        uploadProgress,

        // Event handlers
        onChangeHandler,
        onBlurHandler,
        handleEditorChange,
        onSubmit,
        validateForm,
        saveDraft,
        convertFormToHtml,

        // 🔧 ДОБАВЕНО: Firebase image handlers
        handleMainImageUpload,
        handleSectionImageUpload,

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

        // SECTIONS HANDLERS
        addSection,
        removeSection,
        updateSection,
        addSectionImage,
        removeSectionImage,
        
        // DOWNLOAD MATERIALS HANDLERS
        addDownloadMaterial,
        removeDownloadMaterial,
        //Timeline
        calculateDuration,
        formatDate,
        // Firebase upload handlers
        handleLogoUpload,
        handlePartnerLogoUpload,
        handleSponsorLogoUpload,
        handleDocumentUpload,
        setValues,
        handleRemoveGalleryImage,
        clearMainImageGallery,
        removeMainImage,
        removeSectionImageItem,
        clearSectionImages,
        handleSetMainImage,
        // Utility functions
        generateSlug,
        generateId,
        fileInputRefs,
        // 🆕 CONTACT IMAGE ФУНКЦИИ
        handleContactImageUpload,
        removeContactImage,
        removeLogo,
        getFileIcon,
        editingDocument,
        setEditingDocument,
        handleGalleryUpload,
        clearGallery,
        updateGalleryImageAlt,
        updateGalleryImageCaption,
        removeGalleryImage,
        updateDocumentField,
        handleDocumentDownload,
        saveToLocalStorage,
        loadFromLocalStorage,
        clearLocalStorage,
        hasLocalStorageDraft,
        localStorageTimestamp,
        setHasLocalStorageDraft,
        setLocalStorageTimestamp,
    };
};

export default useCreateInitiative;