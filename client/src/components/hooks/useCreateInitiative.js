/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// hooks/useCreateInitiative.js
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

// 🎨 Нашите нови утилити
import {
    createSlateEditorState,
    createDraftEditorState,
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
import { faFileAlt, faFileArchive, faFileExcel, faFileImage, faFilePowerpoint, faFileWord } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useRealTimeValidation } from './useRealTimeValidation';
import { validateInitiativeForm } from '../Initiatives/CreateIniciative/Utils/initiativeValidation';
import { htmlToSlate, isHtmlContent } from '../Initiatives/CreateIniciative/Utils/htmlToSlate';

const useCreateInitiative = (initialValues, onSubmitHandler) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { createInitiative, saveDraftInitiative, updateDraftInitiative, getDraftById, toggleDraftStatus, updateInitiative, getInitiativeById } = useInitiativeContext();
    const { userEmail } = useAuthContext();
    const STORAGE_KEY = 'initiative_draft';
    const STORAGE_TIMESTAMP_KEY = 'initiative_draft_timestamp';
    const [hasLocalStorageDraft, setHasLocalStorageDraft] = useState(false);
    const [localStorageTimestamp, setLocalStorageTimestamp] = useState(null);
    const location = useLocation();
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
        faq: [],
        gallery: []
    }), []);

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
        sponsorLogos: {}
    });
    const [editingDocument, setEditingDocument] = useState(null);
    const autoSaveRef = useRef(null);
    const fileInputRefs = useRef({});
    useRealTimeValidation(values, setErrors);

    useEffect(() => {
        const loadDraftFromUrl = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const draftIdFromUrl = urlParams.get('draftId');

            const editIdFromUrl = urlParams.get('editId');
            const mode = urlParams.get('mode');

            if (draftIdFromUrl && !initialValues) {
                try {
                    // setIsLoading(true);
                    const draftData = await getDraftById(draftIdFromUrl);

                    if (draftData) {

                        const processedData = { ...draftData };

                        if (isHtmlContent(processedData.detailedDescription)) {
                            processedData.detailedDescription = htmlToSlate(processedData.detailedDescription);
                        }

                        if (isHtmlContent(processedData.expectedResults)) {
                            processedData.expectedResults = htmlToSlate(processedData.expectedResults);
                        }

                        if (isHtmlContent(processedData.progressReport)) {
                            processedData.progressReport = htmlToSlate(processedData.progressReport);
                        }

                        if (processedData.sections && Array.isArray(processedData.sections)) {
                            processedData.sections = processedData.sections.map(section => {
                                if (isHtmlContent(section.content)) {
                                    return {
                                        ...section,
                                        content: htmlToSlate(section.content)
                                    };
                                }
                                return section;
                            });
                        }

                        setValues(processedData);
                        setDraftId(draftIdFromUrl);
                        notify('success', 'Черновата е заредена за редактиране');
                    }
                } catch (error) {
                    console.error('Error loading draft:', error);
                    notify('error', 'Грешка при зареждане на черновата');
                } finally {
                    // setIsLoading(false);
                }
            } else if (editIdFromUrl && mode === 'edit') { // 🆕 За готови инициативи
                try {

                    const initiativeData = await getInitiativeById(editIdFromUrl);

                    if (initiativeData) {
                        // Конвертираме HTML към Slate формат ако е нужно
                        const processedData = { ...initiativeData };

                        if (isHtmlContent(processedData.detailedDescription)) {
                            processedData.detailedDescription = htmlToSlate(processedData.detailedDescription);
                        }
                        if (isHtmlContent(processedData.expectedResults)) {
                            processedData.expectedResults = htmlToSlate(processedData.expectedResults);
                        }

                        if (isHtmlContent(processedData.progressReport)) {
                            processedData.progressReport = htmlToSlate(processedData.progressReport);
                        }

                        if (processedData.sections && Array.isArray(processedData.sections)) {
                            processedData.sections = processedData.sections.map(section => {
                                if (isHtmlContent(section.content)) {
                                    return {
                                        ...section,
                                        content: htmlToSlate(section.content)
                                    };
                                }
                                return section;
                            });
                        }

                        setValues(processedData);
                        notify('success', 'Инициативата е заредена за редактиране');
                    }
                } catch (error) {
                    console.error('Error loading initiative for edit:', error);
                    notify('error', 'Грешка при зареждане на инициативата');
                }
            }
        };

        loadDraftFromUrl();
    }, [location.search]);

    // 🏷️ GENERATE SLUG
    const generateSlug = useCallback((title) => {
        return title
            .toLowerCase()
            // Заменяме кирилица с латиница (основни букви)
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
            // Премахваме всички символи които не са a-z, 0-9 или интервали
            .replace(/[^a-z0-9\s]/g, '')
            // Заменяме интервали с тирета
            .replace(/\s+/g, '-')
            // Премахваме множествени тирета
            .replace(/-+/g, '-')
            // Премахваме тирета от началото и края
            .replace(/^-+|-+$/g, '')
            .trim();
    }, []);

    // 🆔 GENERATE ID
    const generateId = useCallback(() => {
        return Date.now() + Math.floor(Math.random() * 1000);
    }, []);

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
            notify('localstorage-save-failed');
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
        } else if (name === 'startDate' || name === 'endDate') {
            setValues(prev => {
                const updatedValues = { ...prev, [name]: value };

                // 🔧 АВТОМАТИЧНО изчисли duration
                if (updatedValues.startDate && updatedValues.endDate) {
                    updatedValues.duration = calculateDuration(updatedValues.startDate, updatedValues.endDate);
                } else {
                    updatedValues.duration = '';
                }

                return updatedValues;
            });
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
            const currentValues = { ...values, [name]: value };

            saveToLocalStorage(currentValues);

            if (userEmail) {
                try {
                    const tempValues = { ...currentValues };
                    const tempFormData = { ...tempValues };
                    const convertedData = convertFormToHtml.call(null, tempFormData);

                    // Използваме същата логика като saveDraft
                    if (draftId) {
                        await updateDraftInitiative(draftId, { ...convertedData, userEmail });
                     
                    } else {
                        const result = await saveDraftInitiative({ ...convertedData, userEmail });
                        const newDraftId = result?.data?.id || result?.id;
                        if (newDraftId) {
                            setDraftId(newDraftId);
                       
                        }
                    }
                } catch (error) {
                 
                }
            }
        }, 30000);
    }, [values, errors, generateSlug, saveDraftInitiative, userEmail, saveToLocalStorage, calculateDuration]);

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
            notify('invalid-file-type');
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

            notify('logo-upload-success');
        } catch (error) {
            console.error('Logo upload error:', error);
            notify('logo-upload-failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, []);

    // 🖼️ PARTNER LOGO UPLOAD
    const handlePartnerLogoUpload = useCallback(async (file, partnerIndex) => {
        if (!file || !allowedImageTypes.includes(file.type)) {
            notify('invalid-file-type');
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

            notify('partner-logo-upload-success');
        } catch (error) {
            console.error('Partner logo upload error:', error);
            notify('partner-logo-upload-failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, []);

    // 🎯 SPONSOR LOGO UPLOAD
    const handleSponsorLogoUpload = useCallback(async (file, sponsorIndex) => {
        if (!file || !allowedImageTypes.includes(file.type)) {
            notify('invalid-file-type');
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

            notify('sponsor-logo-upload-success');
        } catch (error) {
            console.error('Sponsor logo upload error:', error);
            notify('sponsor-logo-upload-failed');
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
                    originalName: file.name,
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
            notify('documents-upload-failed');
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
                notify('opening-pdf');

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

            notify('success', null, `Downloading/Opening ${docFile.originalName}`);
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
        const trimmedTag = tag.trim();

        // Проверки преди добавяне
        if (!trimmedTag) {
            notify('warning', t('validation.tag-min-length'));
            return;
        }

        if (trimmedTag.length < 2) {
            notify('warning', t('validation.tag-min-length'));
            return;
        }

        if (trimmedTag.length > 30) {
            notify('warning', t('validation.tag-max-length'));
            return;
        }

        if (values.tags.length >= 20) {
            notify('warning', t('validation.tags-max-count'));
            return;
        }

        if (values.tags.includes(trimmedTag)) {
            notify('warning', t('validation.tag-already-exists'));
            return;
        }

        setValues(prev => ({
            ...prev,
            tags: [...prev.tags, trimmedTag]
        }));

        // Success feedback
        notify('success', t('validation.tag-added-success', { tag: trimmedTag }));
    }, [values.tags, t]);

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

                notify('no-images-uploaded');
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
                notify('warning', null, `Качени ${validUploads.length} от ${fileArray.length} снимки`);
            } else {
                notify('success', null, `Качени всички ${validUploads.length} снимки`);

            }

        } catch (error) {
            console.error('❌ Upload error:', error);
            notify('images-upload-error');

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
            notify('some-images-failed');
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

            notify('all-images-deleted');
        } catch (error) {
            console.error('Грешка при изтриване на снимки:', error);
            notify('images-delete-error');
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

            notify('all-images-deleted');

        } catch (error) {
            console.error('Грешка при изтриване на снимки:', error);
            notify('images-delete-error');
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

        notify('document-removed');
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

                notify('all-images-removed');
            } catch (error) {
                console.error('❌ Error deleting gallery images from Firebase:', error);
                notify('images-delete-error');
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

        notify('image-removed');
    }, [values.gallery]);

    // 📷 CONTACT IMAGE UPLOAD - добави в hook-а
    const handleContactImageUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file || !allowedImageTypes.includes(file.type)) {
            notify('invalid-image-file-type');
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

            notify('contact-image-upload-success');
        } catch (error) {
            console.error('Contact image upload error:', error);
            notify('contact-image-upload-failed'); notify('contact-image-upload-failed');
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

        notify('contact-image-removed');
    }, [values.contact?.image]);

    //Media Upload 
    const removeLogo = useCallback(() => {
        setValues(prev => ({ ...prev, logo: null }));
        setMediaFiles(prev => ({ ...prev, logo: null }));
        notify('logo-removed');
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
            notify('no-valid-images');

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
                notify('warning', null, `Качени ${validUploads.length} от ${newImages.length} снимки`);
            } else {
                notify('success', null, `Качени всички ${validUploads.length} снимки в галерията`);
            }

        } catch (error) {
            console.error('❌ Gallery upload error:', error);
            notify('gallery-upload-error');

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
        const newErrors = validateInitiativeForm(values, t);

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, t]);

    // localStorage utility функции
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

    // 📤 HTML CONVERSION за submission
    const convertFormToHtml = useCallback(() => {
        try {
            const htmlValues = { ...values };

            // Премахни id полета
            if (htmlValues.additionalContacts) {
                htmlValues.additionalContacts = htmlValues.additionalContacts.map(contact => {
                    const { id, ...contactWithoutId } = contact;
                    return contactWithoutId;
                });
            }

            if (htmlValues.sponsors) {
                htmlValues.sponsors = htmlValues.sponsors.map(sponsor => {
                    const { id, ...sponsorWithoutId } = sponsor;
                    return sponsorWithoutId;
                });
            }

            // Безопасно конвертиране на редактори
            try {
                htmlValues.detailedDescription = convertEditorToHtml('detailedDescription', values.detailedDescription);
            } catch (error) {
                htmlValues.detailedDescription = '';
            }

            try {
                htmlValues.expectedResults = convertEditorToHtml('expectedResults', values.expectedResults);
            } catch (error) {
                htmlValues.expectedResults = '';
            }

            try {
                htmlValues.progressReport = convertEditorToHtml('progressReport', values.progressReport);
            } catch (error) {
                htmlValues.progressReport = '';
            }

            // Безопасна проверка на mainImage структурата
            if (!htmlValues.mainImage) {
                htmlValues.mainImage = { src: '', alt: '', caption: '', gallery: [] };
            }

            // Безопасна конвертация на mainImage.alt
            try {
                if (htmlValues.mainImage.alt && typeof htmlValues.mainImage.alt !== 'string') {
                    htmlValues.mainImage.alt = convertEditorToHtml('mainImage.alt', htmlValues.mainImage.alt);
                }
            } catch (altError) {
                htmlValues.mainImage.alt = '';
            }

            // Безопасна конвертация на секции
            try {
                if (htmlValues.sections && Array.isArray(htmlValues.sections)) {
                    htmlValues.sections = htmlValues.sections.map((section, index) => {
                        try {
                            return {
                                ...section,
                                content: convertEditorToHtml('sections[].content', section.content)
                            };
                        } catch (sectionError) {
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
                htmlValues.sections = [];
            }

            // Конвертиране на дати
            const convertDateToISO = (dateString) => {
                if (!dateString || dateString.trim() === '') return null;
                if (typeof dateString === 'string' && dateString.includes('T')) return dateString;
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return new Date(dateString + 'T00:00:00.000Z').toISOString();
                }
                return null;
            };

            htmlValues.startDate = convertDateToISO(htmlValues.startDate);
            htmlValues.endDate = convertDateToISO(htmlValues.endDate);

            if (htmlValues.milestones && htmlValues.milestones.length > 0) {
                htmlValues.milestones = htmlValues.milestones.map(milestone => ({
                    ...milestone,
                    date: convertDateToISO(milestone.date)
                }));
            }

            // Почисти празни стрингове
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

                // Ако е празен стринг, върни null
                if (typeof obj === 'string' && obj.trim() === '') {
                    return null;
                }

                return obj;
            };

            const finalValues = cleanEmptyFields(htmlValues);
            return finalValues;

        } catch (error) {
            // Върни поне основните данни без конвертация
            return {
                ...values,
                detailedDescription: '',
                expectedResults: '',
                progressReport: '',
                sections: values.sections?.map(s => ({ ...s, content: '' })) || []
            };
        }
    }, [values]);

    const saveDraft = useCallback(async () => {
        try {
            saveToLocalStorage(values);

            if (userEmail) {
                let convertedData;
                try {
                    convertedData = convertFormToHtml();
                } catch (conversionError) {
                    notify('data-processing-error');
                    return;
                }

                try {
                    const dataToSave = { ...convertedData, userEmail };
                    let result;

                    // Проверяваме дали вече имаме draft ID
                    if (draftId) {
                        // Ако имаме ID, използваме update
                        result = await updateDraftInitiative(draftId, dataToSave);
                   
                    } else {
                        // Ако нямаме ID, създаваме нова чернова
                        result = await saveDraftInitiative(dataToSave);

                        // Запазваме ID-то на новосъздадената чернова
                        const newDraftId = result?.data?.id || result?.id;
                        if (newDraftId) {
                            setDraftId(newDraftId);
                      
                        }
                    }

                    notify('draft-saved-both');
                    return result;
                } catch (saveError) {
                    notify('error', null, `Грешка при запазване: ${saveError.message}`);
                }
            } else {
                notify('draft-saved-browser');
            }
        } catch (fatalError) {
            notify('draft-saved-browser-only');
        }
    }, [values, saveDraftInitiative, updateDraftInitiative, userEmail, saveToLocalStorage, convertFormToHtml, draftId]);

    const startNewDraft = useCallback(async () => {
        try {
            // Ако има несъхранени промени, първо ги запазваме
            if (draftId && userEmail) {
                const convertedData = convertFormToHtml();
                const dataToSave = { ...convertedData, userEmail };
                await updateDraftInitiative(draftId, dataToSave);
                notify('info', 'Текущата чернова е запазена');
            }

            // Изчистваме draftId
            setDraftId(null);

            // Изчистваме localStorage
            clearLocalStorage();

            // Изчистваме формата до defaultValues
            setValues(defaultValues);

            // Изчистваме грешките
            setErrors({});

            // Изчистваме media files
            setMediaFiles({
                logo: null,
                mainImage: [],
                gallery: [],
                documents: [],
                partnerLogos: {},
                sponsorLogos: {}
            });

            notify('success', 'Готови сте да започнете нова чернова!');

        } catch (error) {
            console.error('Error starting new draft:', error);
            notify('error', 'Грешка при започване на нова чернова');
        }
    }, [draftId, userEmail, saveDraft, clearLocalStorage, defaultValues]);

    const publishDraft = useCallback(async () => {
        if (!draftId) {
            notify('error', 'Няма draft за публикуване');
            return;
        }

        try {
            // Първо запазваме последните промени
            await saveDraft();

            // След това публикуваме
            const result = await toggleDraftStatus(draftId);

            // Изчистваме localStorage
            clearLocalStorage();
            setDraftId(null);

            return result;
        } catch (error) {
            console.error('Error publishing draft:', error);
            throw error;
        }
    }, [draftId, saveDraft, toggleDraftStatus, clearLocalStorage]);

    // 💾 FORM SUBMISSION - ОБНОВЕНО
    const onSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // 🚨 Показваме конкретната грешка от първото поле
            const errorEntries = Object.entries(errors);
            if (errorEntries.length > 0) {
                const [fieldName, errorMessage] = errorEntries[0];

                notify('error', null, errorMessage);
                let errorElement = null;

                if (fieldName.startsWith('sections[')) {

                    const sectionMatch = fieldName.match(/sections\[(\d+)\]/);
                    if (sectionMatch) {
                        const sectionIndex = parseInt(sectionMatch[1], 10);

                        errorElement = document.querySelector(`.section-item:nth-child(${sectionIndex + 1})`);

                        if (!errorElement) {
                            const sectionsContainer = document.querySelector('.sections-list');
                            if (sectionsContainer) {
                                const sectionItems = sectionsContainer.querySelectorAll('.section-item');
                                errorElement = sectionItems[sectionIndex];
                            }
                        }
                    }
                } else {
                    // За обикновени полета - escape-ваме специалните символи
                    const escapedFieldName = fieldName.replace(/\[/g, '\\[').replace(/\]/g, '\\]');

                    try {
                        errorElement = document.querySelector(`[name="${escapedFieldName}"], #${escapedFieldName}`);
                    } catch (e) {
                        // Ако още има проблем, опитваме без escape
                        try {
                            errorElement = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
                        } catch (e2) {
                            // Ако и това не работи, търсим по по-прост начин
                            const baseName = fieldName.split('[')[0].split('.')[0];
                            errorElement = document.querySelector(`[name="${baseName}"], #${baseName}`);
                        }
                    }
                }

                // Скролваме до елемента ако го намерим
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Focus само ако е input/textarea
                    if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA') {
                        errorElement.focus();
                    }
                } else {
                    // Fallback - скролваме нагоре
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                // Fallback ако няма errors (не трябва да се случи)
                notify('error', null, 'Моля поправете грешките във формата');
            }

            return;
        }

        try {
            // 🔧 ВАЖНО: Не пращаме mediaFiles, само data-та с URL адресите
            const submissionData = convertFormToHtml();
            submissionData.updatedAt = new Date().toISOString();

            const urlParams = new URLSearchParams(window.location.search);
            const editIdFromUrl = urlParams.get('editId');
            const mode = urlParams.get('mode');
            if (mode === 'edit' && editIdFromUrl) {
                // Редактираме съществуваща инициатива
                await updateInitiative(editIdFromUrl, submissionData);
                setEditId(null);
                notify('success', 'Инициативата е обновена успешно!');
                navigate(`/initiatives/${submissionData.slug || editIdFromUrl}`);
            } else {
                // Създаваме нова инициатива (съществуваща логика)
                submissionData.createdAt = new Date().toISOString();
                delete submissionData.timestamp;

                const handler = onSubmitHandler || createInitiative;
                await handler(submissionData);

                setDraftId(null);
                clearLocalStorage();
                notify('success', 'Инициативата е създадена успешно!');
                navigate('/initiatives');
            }
        } catch (error) {
            console.error('Submission error:', error);
            notify('error', null, 'Грешка при създаване на инициативата');
        }
    }, [values, validateForm, errors, onSubmitHandler, createInitiative, navigate, convertFormToHtml, clearLocalStorage]);

    // В useCreateInitiative.js - в return statement добави:
    return {
        values,
        errors,
        mediaFiles,
        isUploading,
        uploadProgress,
        editId,
        setEditId,
        // Event handlers
        onChangeHandler,
        onBlurHandler,
        handleEditorChange,
        onSubmit,
        validateForm,
        saveDraft,
        startNewDraft,
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
        draftId,
        setDraftId,
        publishDraft,
        getDraftById,

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