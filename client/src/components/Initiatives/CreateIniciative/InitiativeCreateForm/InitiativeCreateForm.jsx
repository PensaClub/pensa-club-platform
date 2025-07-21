/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faMinus, faImage, faVideo, faSliders,
    faUpload, faEye, faSave, faTimes, faCloudUploadAlt,
    faEdit, faUsers, faClock, faBullseye, faMoneyBillWave,
    faAddressCard, faChartLine, faInfoCircle, faBuilding,
    faHandshake, faTrophy, faQuestionCircle, faTag, faMapMarkerAlt,
    faLink, faBold, faItalic, faUnderline, faListUl, faListOl,
    faQuoteLeft, faHeading, faTrash, faChevronUp, faChevronDown,
    faShare,
    faPhone,
    faEnvelope,
    faUser,
    faFileAlt,
    faCheckCircle,
    faSearch,
    faCheck,
    faCommentDots,

} from '@fortawesome/free-solid-svg-icons';
import {
    faFacebookF,
    faInstagram,
    faLinkedinIn,
    faTwitter
} from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';

// 🎨 Styles
import './initiativeCreateForm.css';
import '../InitiativeSectionQuickMenu/initiativeSectionQuickMenu.css';

// 🎯 Slate.js imports
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate';

// 🔧 Hooks and utilities
import useCreateInitiative from '../../../hooks/useCreateInitiative';

// 🎨 Components
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';
import { InitiativeSectionQuickMenu } from '../InitiativeSectionQuickMenu/InitiativeSectionQuickMenu';
import { LocationPicker } from '../LocationMarker/LocationMarker';
import SectionImageItem from '../SectionImageItem/SectionImageItem';
import MainImagePreview from '../MainImagePreview/MainImagePreview';
import MainImageGalleryItem from '../MainImageGalleryItem/MainImageGalleryItem';

import { notify } from '../../../../utils/notify';
import { createSlateEditor, createSlateEditorState, isSlateEmpty, normalizeSlateValue } from '../Utils/initiativeEditorUtils';
import { calculateInitiativeProgress, getProgressBreakdown } from '../Utils/formProgressUtils';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocalStorageStatus } from '../LocalStorageStatus/LocalStorageStatus';
import SlateErrorBoundary from '../SlateErrorBoundary/SlateErrorBoundary';
import { getSlateTextLength } from '../Utils/slateUtils.js';
import { handleCleanPaste } from '../../../../utils/textPasteUtils.js';
import { htmlToSlate, isHtmlContent } from '../Utils/htmlToSlate.js';

const InitiativeCreateForm = ({ initialValues, onSubmitHandler, isEditMode = false }) => {

    const { t } = useTranslation();
    // 🎯 Hook
    const {
        values,
        errors,
        mediaFiles,
        isUploading,
        uploadProgress,
        defaultValues,
        setValues,
        onChangeHandler,
        onBlurHandler,
        handleEditorChange,
        onSubmit,
        validateForm,
        saveDraft,
        handleMainImageUpload,
        handleSectionImageUpload,
        addPartner,
        removePartner,
        addSponsor,
        removeSponsor,
        addMilestone,
        removeMilestone,
        addKPI,
        removeKPI,
        removeDownloadMaterial,
        addFAQ,
        removeFAQ,
        addTag,
        removeTag,
        addSection,
        removeSection,
        updateSection,
        addSectionImage,
        removeSectionImage,
        updateDocumentField,
        handleLogoUpload,
        handlePartnerLogoUpload,
        handleSponsorLogoUpload,
        handleDocumentUpload,
        handleRemoveGalleryImage,
        clearMainImageGallery,
        removeMainImage,
        removeSectionImageItem,
        clearSectionImages,
        handleSetMainImage,
        formatDate,
        calculateDuration,
        generateId,
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
        handleDocumentDownload,
        hasLocalStorageDraft,
        localStorageTimestamp,
        saveToLocalStorage,
        loadFromLocalStorage,
        clearLocalStorage,
        setHasLocalStorageDraft,
        setLocalStorageTimestamp,
        publishDraft,
        getDraftById,
        draftId,
        setDraftId,
        startNewDraft
    } = useCreateInitiative(initialValues, onSubmitHandler);

    // 🎯 Local state
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [showSectionUrlInput, setShowSectionUrlInput] = useState({}); // 🆕
    const [sectionImageUrls, setSectionImageUrls] = useState({}); // 🆕
    // 🎨 Slate editors - правилно създаване
    const detailedDescriptionEditor = useMemo(() => createSlateEditor(), []);
    const expectedResultsEditor = useMemo(() => createSlateEditor(), []);

    const progressReportEditor = useMemo(() => createSlateEditor(), []);
    // 🔧 ПОПРАВЕНО: Създаване на редактори за секциите
    const sectionEditorsRef = useRef({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { getAllInitiatives, clearLocalStorageDraft } = useInitiativeContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [localStorageChecked, setLocalStorageChecked] = useState(false);
    const [showLocalStoragePrompt, setShowLocalStoragePrompt] = useState(false)

    const getSectionEditor = (index) => {
        if (!sectionEditorsRef.current[index]) {
            sectionEditorsRef.current[index] = createSlateEditor();
        }
        return sectionEditorsRef.current[index];
    };

    useEffect(() => {
        if (location.state?.formData) {
            setValues(location.state.formData);
        }
    }, [location.state]);

    // 📂 При mount - проверяваме за localStorage draft
    // В useCreateInitiative.js - обновете СЪЩЕСТВУВАЩИЯ useEffect:

    useEffect(() => {
        // Ако има initialValues (edit mode), проверете за draft ID
        if (initialValues && Object.keys(initialValues).length > 0) {
            // 🆕 Проверяваме за draft ID
            if (initialValues.id) {
                setDraftId(initialValues.id);
            }
            setLocalStorageChecked(true);
            return;
        }

        // Ако вече сме проверили localStorage, не го правим отново
        if (localStorageChecked) {
            return;
        }

        const savedDraft = loadFromLocalStorage();
        if (savedDraft) {
            // 🔧 АВТОМАТИЧНО зареждаме данните
            setValues(prev => ({
                ...prev,
                ...savedDraft.data
            }));

            // 🆕 Възстановяваме draft ID от localStorage ако има
            if (savedDraft.data?.draftId) {
                setDraftId(savedDraft.data.draftId);
            }

            setHasLocalStorageDraft(true);
            setLocalStorageTimestamp(savedDraft.timestamp);
            setShowLocalStoragePrompt(true);

            // Показваме notification след кратко забавяне
            setTimeout(() => {
                notify('success', `Възстановена е чернова от ${savedDraft.timestamp.toLocaleString('bg-BG')}`);
            }, 500);
        }

        setLocalStorageChecked(true);
    }, [initialValues, loadFromLocalStorage, setValues, setHasLocalStorageDraft, setLocalStorageTimestamp, localStorageChecked]);

    // 🔧 Функция за зареждане на draft (за бутона)
    const handleLoadDraft = () => {
        const savedDraft = loadFromLocalStorage();
        if (savedDraft) {
            setValues(prev => ({
                ...prev,
                ...savedDraft.data
            }));
            setShowLocalStoragePrompt(false);
            notify('success', 'Черновата е заредена успешно!');
        }
    };

    const handleStartNewDraft = async () => {
        const confirmed = window.confirm(
            'Сигурни ли сте, че искате да започнете нова чернова? ' +
            'Текущата чернова ще бъде запазена.'
        );

        if (confirmed) {
            await startNewDraft(); // Използваме функцията от hook-а
            setShowLocalStoragePrompt(false);

            // Скролваме до началото на формата
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // 🗑️ Функция за изтриване на draft
    const handleClearDraft = async () => { // Добавяме async
        const confirmed = window.confirm(
            'Сигурни ли сте, че искате да изтриете черновата и всички данни от формата?'
        );

        if (confirmed) {
            try {
                // ЗАМЕНЯМЕ clearLocalStorage() с новата синхронизирана функция
                await clearLocalStorageDraft();

                // Изчистваме формата
                setValues(prev => {
                    const freshDefaults = {
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
                        sections: [],
                        downloadMaterials: [],
                        projects: [],
                        stories: [],
                        publications: [],
                        detailedDescription: createSlateEditorState(),
                        customCategory: '',
                        priority: 'Medium',
                        startDate: '',
                        endDate: '',
                        duration: '',
                        milestones: [],
                        targetAge: [],
                        targetAudience: [],
                        customAudience: '',
                        expectedBudget: '',
                        currency: 'BGN',
                        fundingSources: [],
                        partners: [],
                        sponsors: [],
                        logo: null,
                        responsible: { name: '', position: '', email: '', phone: '' },
                        organization: { name: '', address: '', website: '' },
                        socialMedia: { facebook: '', instagram: '', linkedin: '', twitter: '' },
                        kpis: [],
                        expectedResults: createSlateEditorState(),
                        progressReport: createSlateEditorState(),
                        impactMetrics: [],
                        testimonials: [],
                        tags: [],
                        relatedInitiatives: [],
                        faq: [],
                        gallery: []
                    };

                    return freshDefaults;
                });

                setShowLocalStoragePrompt(false);

                // Notify вече се извиква от clearLocalStorageDraft
                // notify('info', 'Черновата и данните от формата са изтрити');
            } catch (error) {
                console.error('Error clearing draft:', error);
                // Ако има грешка, все пак изчистваме локалната форма
                setShowLocalStoragePrompt(false);
                notify('warning', 'Черновата е изчистена локално, но може да има проблем със сървъра');
            }
        }
    };

    // 📝 Функция за игнориране на prompt-а
    const handleIgnorePrompt = () => {
        setShowLocalStoragePrompt(false);
    };

    // 🎯 Handle Slate.js changes
    const handleSlateChange = useCallback((fieldName) => (value) => {
        // Използваме functional update за да избегнем dependencies
        setValues(prev => {
            if (fieldName.includes('.')) {
                const keys = fieldName.split('.');
                const updatedValues = { ...prev };
                let current = updatedValues;

                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }

                current[keys[keys.length - 1]] = value;
                return updatedValues;
            } else {
                return { ...prev, [fieldName]: value };
            }
        });

        // Clear error за полето
        // setErrors(prev => {
        //     const newErrors = { ...prev };
        //     delete newErrors[fieldName];
        //     return newErrors;
        // });
    }, []);

    // 🔧 ПОПРАВЕНО: Handle Slate change за секции
    const handleSectionSlateChange = (sectionIndex) => (value) => {
        const updatedSections = [...values.sections];
        updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            content: value
        };
        setValues(prev => ({ ...prev, sections: updatedSections }));
    };

    // 🎯 Slate.js toolbar функции
    const toggleMark = (editor, format) => {
        try {
            const isActive = isMarkActive(editor, format);
            if (isActive) {
                Editor.removeMark(editor, format);
            } else {
                Editor.addMark(editor, format, true);
            }
        } catch (error) {
            console.error('Error toggling mark:', error);
        }
    };
    const toggleBlock = (editor, format) => {
        try {
            const isActive = isBlockActive(editor, format);
            const isList = ['numbered-list', 'bulleted-list'].includes(format);

            Transforms.unwrapNodes(editor, {
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type),
                split: true,
            });

            const newProperties = {
                type: isActive ? 'paragraph' : isList ? 'list-item' : format,
            };

            Transforms.setNodes(editor, newProperties);

            if (!isActive && isList) {
                const block = { type: format, children: [] };
                Transforms.wrapNodes(editor, block);
            }
        } catch (error) {
            console.error('Error toggling block:', error);
        }
    };

    const isMarkActive = (editor, format) => {
        try {
            const marks = Editor.marks(editor);
            return marks ? marks[format] === true : false;
        } catch (error) {
            console.warn('Error getting marks:', error);
            return false;
        }
    };

    const isBlockActive = (editor, format) => {
        try {
            const { selection } = editor;
            if (!selection) return false;

            const [match] = Array.from(
                Editor.nodes(editor, {
                    at: Editor.unhangRange(editor, selection),
                    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
                })
            );

            return !!match;
        } catch (error) {
            console.warn('Error checking block active:', error);
            return false;
        }
    };

    // 🎯 Render Slate toolbar
    const renderSlateToolbar = (editor) => (
        <div className="slate-toolbar">
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
                className={`slate-btn ${isMarkActive(editor, 'bold') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faBold} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
                className={`slate-btn ${isMarkActive(editor, 'italic') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faItalic} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
                className={`slate-btn ${isMarkActive(editor, 'underline') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faUnderline} />
            </button>

            <div className="toolbar-divider"></div>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-one');
                }}
                className={`slate-btn ${isBlockActive(editor, 'heading-one') ? 'active' : ''}`}
            >
                H1
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-two');
                }}
                className={`slate-btn ${isBlockActive(editor, 'heading-two') ? 'active' : ''}`}
            >
                H2
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'bulleted-list');
                }}
                className={`slate-btn ${isBlockActive(editor, 'bulleted-list') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faListUl} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'numbered-list');
                }}
                className={`slate-btn ${isBlockActive(editor, 'numbered-list') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faListOl} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'block-quote');
                }}
                className={`slate-btn ${isBlockActive(editor, 'block-quote') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faQuoteLeft} />
            </button>
        </div>
    );

    // 🎯 Render Slate element
    const renderElement = (props) => {

        switch (props.element.type) {
            case 'block-quote':
                return <blockquote {...props.attributes}>{props.children}</blockquote>;
            case 'bulleted-list':
                return <ul {...props.attributes}>{props.children}</ul>;
            case 'heading-one':

                return (
                    <h1
                        {...props.attributes}
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            lineHeight: '1.3',
                            margin: '1rem 0 0.5rem 0',
                            color: '#1B8B8A',
                            border: 'none',
                            background: 'transparent',
                            padding: '0',
                            boxShadow: 'none',
                            borderRadius: '0'
                        }}
                    >
                        {props.children}
                    </h1>
                );
            case 'heading-two':

                return (
                    <h2
                        {...props.attributes}
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            lineHeight: '1.4',
                            margin: '0.75rem 0 0.5rem 0',
                            color: '#1B8B8A',
                            border: 'none',
                            background: 'transparent',
                            padding: '0',
                            boxShadow: 'none',
                            borderRadius: '0'
                        }}
                    >
                        {props.children}
                    </h2>
                );
            case 'heading-three':
                return (
                    <h3
                        {...props.attributes}
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            lineHeight: '1.4',
                            margin: '0.5rem 0 0.25rem 0',
                            color: '#2d3748',
                            border: 'none',
                            background: 'transparent',
                            padding: '0'
                        }}
                    >
                        {props.children}
                    </h3>
                );
            case 'list-item':
                return <li {...props.attributes}>{props.children}</li>;
            case 'numbered-list':
                return <ol {...props.attributes}>{props.children}</ol>;
            default:

                return (
                    <p
                        {...props.attributes}
                        style={{
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            margin: '0.5rem 0',
                            color: '#2d3748'
                        }}
                    >
                        {props.children}
                    </p>
                );
        }
    };

    // 🎯 Render Slate leaf
    const renderLeaf = (props) => {
        let { children } = props;

        if (props.leaf.bold) {
            children = <strong>{children}</strong>;
        }

        if (props.leaf.italic) {
            children = <em>{children}</em>;
        }

        if (props.leaf.underline) {
            children = <u>{children}</u>;
        }

        return <span {...props.attributes}>{children}</span>;
    };

    // 🏠 Navigation sections
    const navigationSections = [
        { id: 'basic-info', label: t('initiatives.create.basicInfo'), icon: faInfoCircle },
        { id: 'sections', label: t('initiatives.create.sections'), icon: faEdit },
        { id: 'timeline', label: t('initiatives.create.timeline'), icon: faClock },
        { id: 'target-scope', label: t('initiatives.create.targetScope'), icon: faBullseye },
        { id: 'resources', label: t('initiatives.create.resources'), icon: faMoneyBillWave },
        { id: 'media', label: t('initiatives.create.media'), icon: faImage },
        { id: 'contacts', label: t('initiatives.create.contacts'), icon: faAddressCard },

        { id: 'progress-results', label: 'Прогрес и резултати', icon: faTrophy },
        { id: 'additional', label: t('initiatives.create.additional'), icon: faTag }
    ];

    // 📊 Calculate form progress
    const calculateProgress = () => calculateInitiativeProgress(values);

    // 🔗 Handle main image URL
    const handleMainImageUrl = () => {
        if (mainImageUrl.trim()) {
            onChangeHandler(null, false, {
                name: 'mainImage.src',
                value: mainImageUrl.trim()
            });
            setMainImageUrl('');
            setShowUrlInput(false);
        }
    };

    // 🔧 ДОБАВЕНО: Оптимизирани handlers за main image
    const updateMainImageAlt = useCallback((value) => {
        setValues(prev => ({
            ...prev,
            mainImage: {
                ...prev.mainImage,
                alt: value
            }
        }));
    }, []);

    const updateMainImageCaption = useCallback((value) => {
        setValues(prev => ({
            ...prev,
            mainImage: {
                ...prev.mainImage,
                caption: value
            }
        }));
    }, []);

    const updateMainImageGalleryAlt = useCallback((index, value) => {
        setValues(prev => {
            const updatedGallery = [...prev.mainImage.gallery];
            updatedGallery[index] = {
                ...updatedGallery[index],
                alt: value
            };
            return {
                ...prev,
                mainImage: {
                    ...prev.mainImage,
                    gallery: updatedGallery
                }
            };
        });
    }, []);

    const updateMainImageGalleryCaption = useCallback((index, value) => {
        setValues(prev => {
            const updatedGallery = [...prev.mainImage.gallery];
            updatedGallery[index] = {
                ...updatedGallery[index],
                caption: value
            };
            return {
                ...prev,
                mainImage: {
                    ...prev.mainImage,
                    gallery: updatedGallery
                }
            };
        });
    }, []);

    // 📍 Section management functions
    const handleAddSection = () => {
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
        setActiveSectionIndex(values.sections.length);
    };

    const handleMoveSection = (index, direction) => {
        const newSections = [...values.sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newSections.length) {
            [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
            setValues(prev => ({ ...prev, sections: newSections }));
            setActiveSectionIndex(targetIndex);

            // 🔧 ПОПРАВЕНО: Обменяме и редакторите
            const tempEditor = sectionEditorsRef.current[index];
            sectionEditorsRef.current[index] = sectionEditorsRef.current[targetIndex];
            sectionEditorsRef.current[targetIndex] = tempEditor;
        }
    };

    const handleRemoveSection = (index) => {
        // 🔧 ПОПРАВЕНО: Премахваме и редактора
        delete sectionEditorsRef.current[index];

        const newSections = values.sections.filter((_, i) => i !== index);
        setValues(prev => ({ ...prev, sections: newSections }));

        if (activeSectionIndex >= newSections.length) {
            setActiveSectionIndex(Math.max(0, newSections.length - 1));
        }
    };

    // 🔧 ОПТИМИЗИРАН: updateSectionImageField само за alt/caption
    const updateSectionImageAlt = useCallback((sectionIndex, imageIndex, value) => {
        setValues(prev => {
            const updatedSections = [...prev.sections];
            const updatedImages = [...updatedSections[sectionIndex].images];
            updatedImages[imageIndex] = {
                ...updatedImages[imageIndex],
                alt: value
            };
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: updatedImages
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    const updateSectionImageCaption = useCallback((sectionIndex, imageIndex, value) => {
        setValues(prev => {
            const updatedSections = [...prev.sections];
            const updatedImages = [...updatedSections[sectionIndex].images];
            updatedImages[imageIndex] = {
                ...updatedImages[imageIndex],
                caption: value
            };
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: updatedImages
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    const handleSectionImageUrl = useCallback((sectionIndex) => {
        const url = sectionImageUrls[sectionIndex];
        if (url && url.trim()) {
            const newImage = {
                src: url.trim(),
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

            // Clear URL input
            setSectionImageUrls(prev => ({ ...prev, [sectionIndex]: '' }));
            setShowSectionUrlInput(prev => ({ ...prev, [sectionIndex]: false }));
        }
    }, [sectionImageUrls]); // 

    // 🔧 НОВА: Оптимизирана функция за URL input change
    const handleSectionUrlChange = useCallback((sectionIndex, value) => {
        setSectionImageUrls(prev => ({
            ...prev,
            [sectionIndex]: value
        }));
    }, []);

    const handleSearchInitiatives = useCallback(async () => {
        if (!searchTerm.trim()) {
            notify('warning', 'Въведете текст за търсене');
            return;
        }

        try {
            setIsSearching(true);

            // Зареждаме всички инициативи
            const response = await getAllInitiatives(1, true);
            const allInitiatives = response.data || [];

            // Филтрираме по search term
            const filtered = allInitiatives.filter(initiative =>
                initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                initiative.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                initiative.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            // Премахваме текущата инициатива ако редактираме
            const filteredResults = filtered.filter(initiative =>
                initiative.id !== values.id
            );

            setSearchResults(filteredResults);

            if (filteredResults.length === 0) {
                notify('info', 'Няма намерени инициативи');
            }

        } catch (error) {
            console.error('Search error:', error);
            notify('error', 'Грешка при търсене');
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm, getAllInitiatives, values.id]);

    const handlePreview = () => {
        // Валидираме основните полета преди preview
        if (!values.title?.trim()) {
            notify('warning', 'Въведете заглавие преди preview');
            return;
        }

        // Навигираме към preview страницата с данните
        navigate('/initiative-preview', {
            state: { previewData: values }
        });
    };

    return (
        <div className="initiative-create-container">
            {/* Header, Progress Bar, Navigation остават същите... */}

            {/* 🎯 Header */}
            <div className="initiative-form-header">
                <h1 className="initiative-form-title">
                    {isEditMode ? t('initiatives.create.editTitle') : t('initiatives.create.newTitle')}
                </h1>
                <p className="initiative-form-subtitle">
                    {t('initiatives.create.subtitle')}
                </p>
            </div>
            {/* 💾 LocalStorage Status - показваме само ако има prompt */}
            {showLocalStoragePrompt && (
                <LocalStorageStatus
                    hasLocalStorageDraft={hasLocalStorageDraft}
                    localStorageTimestamp={localStorageTimestamp}
                    onStartNew={handleStartNewDraft}
                    onClearDraft={handleClearDraft}
                    onLoadDraft={handleLoadDraft}
                    onIgnore={handleIgnorePrompt}
                    autoLoaded={true}
                />
            )}
            {/* 📊 Progress Bar */}
            {/* 📊 Enhanced Progress Bar */}
            <div className="initiative-form-progress-container">
                <div className="initiative-progress-header">
                    <h3>Прогрес на формата</h3>
                    <span className="initiative-progress-percentage">{calculateProgress()}% завършено</span>
                </div>

                <div className="initiative-progress-bar">
                    <div
                        className="form-progress-fill"
                        style={{ width: `${calculateProgress()}%` }}
                    ></div>
                </div>

                {/* Section breakdown */}
                <div className="initiative-progress-sections">
                    {(() => {
                        const breakdown = getProgressBreakdown(values);
                        return (
                            <>
                                <div className={`initiative-progress-section ${breakdown.basicInfo ? 'complete' : 'incomplete'}`}>
                                    ✅ Основна информация
                                </div>
                                <div className={`initiative-progress-section ${breakdown.sections ? 'complete' : 'incomplete'}`}>
                                    📝 Секции
                                </div>
                                <div className={`initiative-progress-section ${breakdown.timeline ? 'complete' : 'incomplete'}`}>
                                    ⏰ Времева линия
                                </div>
                                <div className={`initiative-progress-section ${breakdown.targetScope ? 'complete' : 'incomplete'}`}>
                                    🎯 Целева група
                                </div>
                                <div className={`initiative-progress-section ${breakdown.resources ? 'complete' : 'incomplete'}`}>
                                    💰 Ресурси
                                </div>
                                <div className={`initiative-progress-section ${breakdown.media ? 'complete' : 'incomplete'}`}>
                                    🖼️ Медия
                                </div>
                                <div className={`initiative-progress-section ${breakdown.contacts ? 'complete' : 'incomplete'}`}>
                                    📞 Контакти
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* 🏗️ Layout */}
            <div className="initiative-form-layout">
                {/* 🧭 Sidebar Navigation */}
                <div className="initiative-form-sidebar">
                    <nav className="sidebar-nav">
                        {navigationSections.map((section) => (
                            <a key={section.id}
                                href={`#${section.id}`}
                                className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveSection(section.id);
                                }}
                            >
                                <FontAwesomeIcon icon={section.icon} />
                                {section.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* 📝 Form Content */}
                <div className="initiative-form-content">
                    <form onSubmit={onSubmit}>

                        {/* 🎯 SECTION 1: BASIC INFO */}
                        {activeSection === 'basic-info' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        {t('initiatives.create.basicInfo')}
                                    </h2>
                                </div>
                                <div className="form-section-content">

                                    {/* Title */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="title">
                                            {t('initiatives.create.title')}
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={values.title}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors.title ? 'error' : ''}
                                            onPaste={(e) => handleCleanPaste(e, (newValue) => {
                                                setValues(prev => ({ ...prev, title: newValue }));
                                            }, values.title, 200)}
                                            placeholder={t('initiatives.create.titlePlaceholder')}
                                        />
                                        {errors.title && <div className="error-message">{errors.title}</div>}
                                    </div>

                                    {/* Slug */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="slug">
                                            {t('initiatives.create.slug')}
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="slug"
                                            name="slug"
                                            value={values.slug}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors.slug ? 'error' : ''}

                                            placeholder={t('initiatives.create.slugPlaceholder')}
                                        />
                                        <div className="field-help">
                                            {t('initiatives.create.slug-help')}
                                        </div>
                                        {errors.slug && <div className="error-message">{errors.slug}</div>}
                                    </div>

                                    {/* Short Description */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="shortDescription">
                                            {t('initiatives.create.shortDescription')}
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <textarea
                                            id="shortDescription"
                                            name="shortDescription"
                                            value={values.shortDescription}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors.shortDescription ? 'error' : ''}
                                            placeholder={t('initiatives.create.shortDescriptionPlaceholder')}
                                            onPaste={(e) => handleCleanPaste(e, (newValue) => {
                                                setValues(prev => ({ ...prev, shortDescription: newValue }));
                                            }, values.title, 500)}
                                            rows={3}
                                        />
                                        <div className="field-help">
                                            {t('initiatives.create.short-description-help')}
                                            {/* 🆕 Character counter */}

                                        </div>
                                        {errors.shortDescription && <div className="error-message">{errors.shortDescription}</div>}
                                    </div>

                                    {/* 🎯 Detailed Description (Slate.js) */}
                                    <div className="form-group-initiative">
                                        <label>
                                            {t('initiatives.create.detailedDescription')}
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <div className="field-help editor-help">
                                            {t('initiatives.create.detailed-description-help')}
                                        </div>
                                        <div className={`slate-editor-container ${errors.detailedDescription ? 'error' : ''}`}>
                                            <Slate
                                                key={`detailed-desc-${values.title || 'empty'}`} // 🔧 ДОБАВИ key за re-render
                                                editor={detailedDescriptionEditor}
                                                initialValue={values.detailedDescription}
                                                onChange={handleSlateChange('detailedDescription')}
                                            >
                                                {renderSlateToolbar(detailedDescriptionEditor)}
                                                <Editable
                                                    className="slate-editable"
                                                    placeholder={t('initiatives.create.detailedDescriptionPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                />
                                            </Slate>
                                        </div>
                                        {/* 🆕 Character counter с преводи */}
                                        <div className={`character-count slate-counter ${getSlateTextLength(values.detailedDescription) > 49500 ? 'warning' :
                                            getSlateTextLength(values.detailedDescription) > 49800 ? 'error' : ''
                                            }`}>
                                            {getSlateTextLength(values.detailedDescription)}/50000 {t('initiatives.create.characters')}
                                        </div>
                                        {errors.detailedDescription && <div className="error-message">{errors.detailedDescription}</div>}
                                    </div>
                                    {/* Main Image Upload - ПОПРАВЕНО */}
                                    <div className="form-group-initiative">
                                        <label>Основна снимка</label>
                                        <div className="image-upload-section">
                                            <div className="upload-methods">
                                                <div className="upload-method">
                                                    <label className="upload-btn">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                        Качи снимки
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple // 🔧 Запазваме multiple
                                                            onChange={handleMainImageUpload}

                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>

                                                <div className="upload-method">
                                                    <button
                                                        type="button"
                                                        className="upload-btn"
                                                        onClick={() => setShowUrlInput(!showUrlInput)}

                                                    >
                                                        <FontAwesomeIcon icon={faLink} />
                                                        Добави URL
                                                    </button>
                                                </div>
                                            </div>

                                            {showUrlInput && (
                                                <div className="url-input-section">
                                                    <input
                                                        type="url"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={mainImageUrl}
                                                        onChange={(e) => setMainImageUrl(e.target.value)}
                                                    />
                                                    <button type="button" onClick={handleMainImageUrl}>
                                                        Добави
                                                    </button>
                                                </div>
                                            )}

                                            {/* 🔧 ПОПРАВЕНО: Всяка снимка със собствени alt и caption */}
                                            {values.mainImage?.src && (
                                                <div className="initiative-create-images-preview">
                                                    <MainImagePreview
                                                        mainImage={values.mainImage}
                                                        onAltChange={updateMainImageAlt}
                                                        onCaptionChange={updateMainImageCaption}
                                                        onRemove={removeMainImage}
                                                    />

                                                    {values.mainImage?.gallery && values.mainImage.gallery.length > 0 && (
                                                        <div className="initiative-create-gallery-preview">
                                                            <h5>Галерия ({values.mainImage.gallery.length} снимки)</h5>
                                                            <div className="initiative-create-gallery-grid">
                                                                {values.mainImage.gallery
                                                                    .filter(img => img && img.src) // 🔧 Филтрираме undefined елементи
                                                                    .map((img, index) => (
                                                                        <MainImageGalleryItem
                                                                            key={`gallery-${img.src}-${index}`}
                                                                            img={img}
                                                                            index={index}
                                                                            onAltChange={updateMainImageGalleryAlt}
                                                                            onCaptionChange={updateMainImageGalleryCaption}
                                                                            onSetMain={handleSetMainImage}
                                                                            onRemove={handleRemoveGalleryImage}
                                                                        />
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location Map - ЗАМЕНЕНО */}
                                    <div className="form-group-initiative" key={`location-${values.title || 'empty'}`}>
                                        <label>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                            Местоположение
                                        </label>
                                        {/* 🆕 Location header с clear бутон */}
                                        <div className="location-header">
                                            <div className="location-status">
                                                {values.location?.address && (
                                                    <span className="current-location">
                                                        📍 {values.location.address}
                                                    </span>
                                                )}
                                                {values.location?.coordinates?.lat && !values.location?.address && (
                                                    <span className="current-location">
                                                        📍 {values.location.coordinates.lat.toFixed(6)}, {values.location.coordinates.lng.toFixed(6)}
                                                    </span>
                                                )}
                                            </div>
                                            {/* 🆕 Clear location бутон */}
                                            {(values.location?.address || values.location?.coordinates?.lat) && (
                                                <button
                                                    type="button"
                                                    className="btn-clear-location"
                                                    onClick={() => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            location: {
                                                                address: '',
                                                                coordinates: { lat: null, lng: null }
                                                            }
                                                        }));
                                                        notify('info', t('initiatives.create.location-cleared'));
                                                    }}
                                                    title={t('initiatives.create.clear-location')}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                    {/* {t('initiatives.create.clear-location')} */}
                                                </button>
                                            )}
                                        </div>
                                        <LocationPicker
                                            initialPosition={values.location.coordinates}
                                            initialAddress={values.location.address}
                                            onLocationChange={(locationData) => {
                                                setValues(prev => ({
                                                    ...prev,
                                                    location: {
                                                        address: locationData.address,
                                                        coordinates: {
                                                            lat: locationData.lat,
                                                            lng: locationData.lng
                                                        }
                                                    }
                                                }));
                                            }}
                                            onLocationClear={() => { // 🆕 Нов callback
                                                setValues(prev => ({
                                                    ...prev,
                                                    location: {
                                                        address: '',
                                                        coordinates: { lat: null, lng: null }
                                                    }
                                                }));
                                                notify('info', t('initiatives.create.location-cleared'));
                                            }}
                                        />

                                        <div className="field-help">
                                            {t('initiatives.create.location-help')}
                                        </div>
                                        {errors.location && <div className="error-message">{errors.location}</div>}
                                    </div>

                                    {/* Category */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="category">
                                            {t('initiatives.create.category')}
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={values.category}
                                            onChange={onChangeHandler}
                                            className={errors.category ? 'error' : ''}
                                        >
                                            <option value="">{t('initiatives.create.selectCategory')}</option>
                                            <option value="Environment">{t('initiatives.categories.environment')}</option>
                                            <option value="Education">{t('initiatives.categories.education')}</option>
                                            <option value="Healthcare">{t('initiatives.categories.healthcare')}</option>
                                            <option value="Social">{t('initiatives.categories.social')}</option>
                                            <option value="Technology">{t('initiatives.categories.technology')}</option>
                                            <option value="Culture">{t('initiatives.categories.culture')}</option>
                                            <option value="Sport">{t('initiatives.categories.sport')}</option>
                                            <option value="custom">{t('initiatives.categories.custom')}</option>
                                        </select>
                                        {errors.category && <div className="error-message">{errors.category}</div>}
                                    </div>

                                    {/* Custom Category */}
                                    {values.category === 'custom' && (
                                        <div className="form-group-initiative">
                                            <label htmlFor="customCategory">
                                                {t('initiatives.create.customCategory')}
                                            </label>
                                            <input
                                                type="text"
                                                id="customCategory"
                                                name="customCategory"
                                                value={values.customCategory}
                                                onChange={onChangeHandler}
                                                placeholder={t('initiatives.create.customCategoryPlaceholder')}
                                            />
                                        </div>
                                    )}

                                    {/* Priority */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="priority">
                                            {t('initiatives.create.priority')}
                                        </label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            value={values.priority}
                                            onChange={onChangeHandler}
                                        >
                                            <option value="Low">{t('initiatives.priority.low')}</option>
                                            <option value="Medium">{t('initiatives.priority.medium')}</option>
                                            <option value="High">{t('initiatives.priority.high')}</option>
                                            <option value="Critical">{t('initiatives.priority.critical')}</option>
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="status">
                                            {t('initiatives.create.status')}
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={values.status}
                                            onChange={onChangeHandler}
                                        >
                                            <option value="active">{t('initiatives.status.active')}</option>
                                            <option value="inactive">{t('initiatives.status.inactive')}</option>
                                            <option value="completed">{t('initiatives.status.completed')}</option>
                                            <option value="paused">{t('initiatives.status.paused')}</option>
                                        </select>
                                    </div>
                                    {/* Comments Enabled */}
                                    <div className="form-group-initiative">
                                        <div className="comments-enabled-section">
                                            <div className="comments-enabled-header">
                                                <label className="comments-enabled-label">
                                                    <FontAwesomeIcon icon={faCommentDots} />
                                                    {t('initiatives.create.commentsEnabled')}
                                                </label>
                                                <div className="comments-enabled-description">
                                                    {t('initiatives.create.commentsEnabledDescription')}
                                                </div>
                                            </div>

                                            <div className="comments-toggle-container">
                                                <label className="comments-toggle">
                                                    <input
                                                        type="checkbox"
                                                        name="commentsEnabled"
                                                        checked={values.commentsEnabled}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                commentsEnabled: e.target.checked
                                                            }));
                                                        }}
                                                        className="comments-toggle-input"
                                                    />
                                                    <span className="comments-toggle-slider">
                                                        <span className="comments-toggle-thumb">
                                                            <FontAwesomeIcon
                                                                icon={values.commentsEnabled ? faCheck : faTimes}
                                                                className="comments-toggle-icon"
                                                            />
                                                        </span>
                                                    </span>
                                                    <span className="comments-toggle-text">
                                                        {values.commentsEnabled
                                                            ? t('initiatives.create.commentsAllowed')
                                                            : t('initiatives.create.commentsDisabled')
                                                        }
                                                    </span>
                                                </label>

                                                {values.commentsEnabled && (
                                                    <div className="comments-enabled-info">
                                                        <FontAwesomeIcon icon={faInfoCircle} />
                                                        {t('initiatives.create.commentsEnabledInfo')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}
                        {/* 🏷️ TAGS SECTION */}
                        <div className="form-group-initiative">
                            <label className="basic-info-tags-label">
                                🏷️ {t('initiatives.create.tags')}
                                <span className="basic-info-tags-description">{t('initiatives.create.tagsDescription')}</span>
                            </label>
                            <div className="basic-info-tags-help">
                                {t('initiatives.create.tags-help')}
                            </div>
                            <div className="basic-info-tags-input-container">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newTag.trim()) {
                                                addTag(newTag.trim());
                                                setNewTag('');
                                            }
                                        }
                                    }}
                                    placeholder={t('initiatives.create.tagPlaceholder')}
                                    className="basic-info-tags-input"
                                    maxLength={30}
                                />
                                <button
                                    type="button"
                                    className="basic-info-tags-add-btn"
                                    onClick={() => {
                                        if (newTag.trim()) {
                                            addTag(newTag.trim());
                                            setNewTag('');
                                        }
                                    }}
                                    disabled={values.tags.length >= 20}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    {t('initiatives.create.addTag')}
                                </button>
                            </div>
                            {values.tags.length > 0 && (
                                <div className="basic-info-tags-display">
                                    <div className="basic-info-tags-list">
                                        {values.tags.map((tag, index) => (
                                            <div key={index} className="basic-info-tag-item">
                                                <span className="basic-info-tag-text">{tag}</span>
                                                <button
                                                    type="button"
                                                    className="basic-info-tag-remove-btn"
                                                    onClick={() => removeTag(index)}
                                                    title={t('initiatives.create.removeTag')}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="basic-info-tags-info">
                                <small>
                                    {t('initiatives.create.tagsCount', { count: values.tags.length })}
                                    {values.tags.length >= 18 && (
                                        <span className="basic-info-tags-warning"> - {t('initiatives.create.close-to-limit')} (20)</span>
                                    )}
                                </small>
                            </div>
                        </div>
                        {/* 🎯 SECTION: SECTIONS  */}
                        {activeSection === 'sections' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faEdit} />
                                        Секции на инициативата
                                    </h2>
                                    <button
                                        type="button"
                                        className="btn-initiative accent"
                                        onClick={handleAddSection}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        Добави секция
                                    </button>
                                </div>
                                <div className="form-section-content">

                                    {values.sections.length === 0 ? (
                                        <div className="empty-sections">
                                            <p>Няма добавени секции</p>
                                            <button
                                                type="button"
                                                className="btn-initiative primary"
                                                onClick={handleAddSection}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                Добави първа секция
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="sections-list">
                                            {values.sections.map((section, index) => (
                                                <div
                                                    key={index}
                                                    className={`section-item ${activeSectionIndex === index ? 'active' : ''}`} // 🔧 Добавен active клас
                                                >
                                                    <div className="section-header">
                                                        <h4>
                                                            Секция {index + 1}
                                                            {/* 🚨 Показваме грешка ако има */}
                                                            {(errors[`sections[${index}].title`] || errors[`sections[${index}].content`]) && (
                                                                <span className="section-error-indicator">⚠️</span>
                                                            )}
                                                        </h4>
                                                        <div className="section-actions">
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveSectionIndex(index)}
                                                                className={activeSectionIndex === index ? 'active' : ''}
                                                            >
                                                                {activeSectionIndex === index ? 'Активна' : 'Редактирай'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {activeSectionIndex === index && (
                                                        <>
                                                            {/* 🔧 Менюто се показва само когато секцията е активна за редактиране */}
                                                            <InitiativeSectionQuickMenu
                                                                sectionIndex={index}
                                                                totalSections={values.sections.length}
                                                                onAddSection={handleAddSection}
                                                                onMoveUp={() => handleMoveSection(index, 'up')}
                                                                onMoveDown={() => handleMoveSection(index, 'down')}
                                                                onRemove={() => handleRemoveSection(index)}
                                                            />

                                                            <div className="section-form">
                                                                {/* Section Title */}
                                                                <div className="form-group-initiative">
                                                                    <label>Заглавие на секцията</label>
                                                                    <input
                                                                        type="text"
                                                                        value={section.title}
                                                                        onChange={(e) => {
                                                                            const updatedSections = [...values.sections];
                                                                            updatedSections[index] = {
                                                                                ...updatedSections[index],
                                                                                title: e.target.value
                                                                            };
                                                                            setValues(prev => ({ ...prev, sections: updatedSections }));
                                                                        }}
                                                                        // onPaste={(e) => handleCleanPaste(e, (newValue) => {
                                                                        //     setValues(prev => ({ ...prev, title: newValue }));
                                                                        // }, values.title, 500)}
                                                                        placeholder="Въведете заглавие..."
                                                                        className={errors[`sections[${index}].title`] ? 'error' : ''}
                                                                    />
                                                                    <div className="field-help">
                                                                        {t('initiatives.create.section-title-help')}
                                                                    </div>
                                                                    {/* 🚨 Показваме грешката */}
                                                                    {errors[`sections[${index}].title`] && (
                                                                        <div className="error-message">{errors[`sections[${index}].title`]}</div>
                                                                    )}
                                                                </div>

                                                                {/* 🔧 ПОПРАВЕНО: Section Content */}
                                                                <div className="form-group-initiative">
                                                                    <label>Съдържание</label>
                                                                    <div className="field-help editor-help">
                                                                        {t('initiatives.create.section-content-help')}
                                                                    </div>
                                                                    <div className="slate-editor-container">
                                                                        <Slate
                                                                            key={`section-${index}`} // 🔧 Добавен key за force re-render
                                                                            editor={getSectionEditor(index)}
                                                                            initialValue={section.content || createSlateEditorState()}
                                                                            onChange={handleSectionSlateChange(index)}
                                                                        >
                                                                            {renderSlateToolbar(getSectionEditor(index))}
                                                                            <Editable
                                                                                className="slate-editable"
                                                                                placeholder="Въведете съдържанието на секцията..."
                                                                                renderElement={renderElement}
                                                                                renderLeaf={renderLeaf}
                                                                            />
                                                                        </Slate>
                                                                    </div>
                                                                    {/* 🚨 Показваме грешката */}
                                                                    {errors[`sections[${index}].content`] && (
                                                                        <div className="error-message">{errors[`sections[${index}].content`]}</div>
                                                                    )}
                                                                </div>

                                                                {/* Section Images - simplified за сега */}
                                                                {/* Section Images - ОБНОВЕНО */}
                                                                <div className="form-group-initiative">
                                                                    <label>Изображения към секцията</label>
                                                                    <div className="initiative-create-section-images">

                                                                        {/* Upload methods */}
                                                                        <div className="section-image-upload-methods">
                                                                            <div className="section-upload-method">
                                                                                <label className="section-upload-btn">
                                                                                    <FontAwesomeIcon icon={faUpload} />
                                                                                    {section.images?.length > 0 ? 'Добави още снимки' : 'Качи снимки'}
                                                                                    <input
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        multiple
                                                                                        onChange={(e) => handleSectionImageUpload(e, index)}
                                                                                        style={{ display: 'none' }}
                                                                                    />
                                                                                </label>
                                                                            </div>

                                                                            <div className="section-upload-method">
                                                                                <button
                                                                                    type="button"
                                                                                    className="section-upload-btn"
                                                                                    onClick={() => setShowSectionUrlInput(prev => ({
                                                                                        ...prev,
                                                                                        [index]: !prev[index]
                                                                                    }))}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faLink} />
                                                                                    Добави URL
                                                                                </button>
                                                                            </div>

                                                                            {section.images?.length > 0 && (
                                                                                <div className="section-upload-method">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="section-upload-btn section-clear-btn"
                                                                                        onClick={() => clearSectionImages(index)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTimes} />
                                                                                        Изчисти всички
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* URL input */}
                                                                        {showSectionUrlInput[index] && (
                                                                            <div className="section-url-input-section">
                                                                                <input
                                                                                    type="url"
                                                                                    placeholder="https://example.com/image.jpg"
                                                                                    value={sectionImageUrls[index] || ''}
                                                                                    onChange={(e) => handleSectionUrlChange(index, e.target.value)} // 🔧 ПОПРАВЕНО
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleSectionImageUrl(index)}
                                                                                >
                                                                                    Добави
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {/* Images preview */}

                                                                        {section.images && section.images.length > 0 && (
                                                                            <div className="section-images-preview">
                                                                                <h5>Снимки към секцията ({section.images.length})</h5>
                                                                                <div className="section-images-grid">
                                                                                    {section.images.map((img, imgIndex) => (
                                                                                        <SectionImageItem
                                                                                            key={`section-${index}-img-${imgIndex}-${img.src.slice(-10)}`} // 🔧 Стабилен key
                                                                                            img={img}
                                                                                            sectionIndex={index}
                                                                                            imageIndex={imgIndex}
                                                                                            onAltChange={updateSectionImageAlt}
                                                                                            onCaptionChange={updateSectionImageCaption}
                                                                                            onRemove={removeSectionImageItem}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            {/* 🚨 Грешка ако няма секции */}
                                            {errors.sections && (
                                                <div className="sections-error">
                                                    <div className="error-message">{errors.sections}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 3: TIMELINE */}
                        {activeSection === 'timeline' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faClock} />
                                        {t('initiatives.create.timeline')}
                                    </h2>
                                </div>
                                <div className="form-section-content">

                                    {/* Start Date */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="startDate">
                                            Дата на започване
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                            value={values.startDate}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors.startDate ? 'error' : ''}
                                        // min={new Date().toISOString().split('T')[0]}
                                        />
                                        <div className="field-help">
                                            {t('initiatives.create.start-date-help')}
                                        </div>
                                        {errors.startDate && <div className="error-message">{errors.startDate}</div>}
                                    </div>

                                    {/* End Date */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="endDate">
                                            Планирана дата на завършване
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                            value={values.endDate}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors.endDate ? 'error' : ''}
                                            min={values.startDate}
                                        />
                                        <div className="field-help">
                                            {t('initiatives.create.end-date-help')}
                                        </div>
                                        {errors.endDate && <div className="error-message">{errors.endDate}</div>}
                                    </div>

                                    {/* Duration Display */}
                                    {values.startDate && values.endDate && (
                                        <div className="duration-display">
                                            <h4>📅 Продължителност</h4>
                                            <span className="duration-value">
                                                {calculateDuration(values.startDate, values.endDate)} дни
                                            </span>
                                        </div>
                                    )}

                                    {/* Milestones Section */}
                                    <div className="milestones-section">
                                        <div className="dynamic-section-header">
                                            <h4>🎯 Ключови етапи (Milestones)</h4>
                                            <button
                                                type="button"
                                                className="btn-initiative accent"
                                                onClick={addMilestone}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                Добави етап
                                            </button>
                                        </div>
                                        <div className="field-help section-help">
                                            {t('initiatives.create.milestones-help')}
                                        </div>
                                        {values.milestones.length === 0 ? (
                                            <div className="empty-milestones">
                                                <p>Няма добавени етапи</p>
                                                <button
                                                    type="button"
                                                    className="btn-initiative primary"
                                                    onClick={addMilestone}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                    Добави първи етап
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="milestones-list">
                                                {values.milestones.map((milestone, index) => (
                                                    <div key={index} className="milestone-item">
                                                        <div className="milestone-header">
                                                            <h5>
                                                                Етап {index + 1}
                                                                {/* 🚨 Показваме грешка ако има */}
                                                                {(errors[`milestones[${index}].date`] || errors[`milestones[${index}].description`]) && (
                                                                    <span className="section-error-indicator">⚠️</span>
                                                                )}
                                                            </h5>
                                                            <button
                                                                type="button"
                                                                className="remove-milestone-btn"
                                                                onClick={() => removeMilestone(index)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                                Премахни
                                                            </button>
                                                        </div>

                                                        <div className="milestone-fields">
                                                            <div className="milestone-date-field">
                                                                <label>Дата на етапа</label>
                                                                <input
                                                                    type="date"
                                                                    value={milestone.date}
                                                                    onChange={(e) => {
                                                                        const updatedMilestones = [...values.milestones];
                                                                        updatedMilestones[index].date = e.target.value;
                                                                        setValues(prev => ({ ...prev, milestones: updatedMilestones }));
                                                                    }}
                                                                    min={values.startDate}
                                                                    max={values.endDate}
                                                                    className={errors[`milestones[${index}].date`] ? 'error' : ''}
                                                                />
                                                                {errors[`milestones[${index}].date`] && (
                                                                    <div className="error-message">{errors[`milestones[${index}].date`]}</div>
                                                                )}
                                                            </div>

                                                            <div className="milestone-description-field">
                                                                <label>Описание на етапа</label>
                                                                <textarea
                                                                    value={milestone.description}
                                                                    onChange={(e) => {
                                                                        const updatedMilestones = [...values.milestones];
                                                                        updatedMilestones[index].description = e.target.value;
                                                                        setValues(prev => ({ ...prev, milestones: updatedMilestones }));
                                                                    }}
                                                                    placeholder="Описание на какво се случва в този етап..."
                                                                    rows={2}
                                                                    className={errors[`milestones[${index}].description`] ? 'error' : ''}
                                                                    maxLength={200}
                                                                />

                                                                <div className="character-count">
                                                                    {milestone.description?.length || 0}/200
                                                                </div>
                                                                {errors[`milestones[${index}].description`] && (
                                                                    <div className="error-message">{errors[`milestones[${index}].description`]}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline Visual Preview */}
                                    {values.startDate && values.endDate && values.milestones.length > 0 && (
                                        <div className="timeline-preview">
                                            <h4>📊 Визуализация на времевата линия</h4>
                                            <div className="field-help section-help">
                                                {t('initiatives.create.timeline-preview-help')}
                                            </div>
                                            <div className="timeline-visual">
                                                <div className="timeline-point timeline-start">
                                                    <div className="timeline-dot"></div>
                                                    <span className="timeline-date">{formatDate(values.startDate)}</span>
                                                    <span className="timeline-label">Начало</span>
                                                </div>

                                                {values.milestones
                                                    .filter(m => m.date)
                                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                    .map((milestone, index) => (
                                                        <div key={index} className="timeline-point timeline-milestone">
                                                            <div className="timeline-dot milestone-dot"></div>
                                                            <span className="timeline-date">{formatDate(milestone.date)}</span>
                                                            <span className="timeline-label">{milestone.description}</span>
                                                        </div>
                                                    ))}

                                                <div className="timeline-point timeline-end">
                                                    <div className="timeline-dot"></div>
                                                    <span className="timeline-date">{formatDate(values.endDate)}</span>
                                                    <span className="timeline-label">Край</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 4: TARGET SCOPE */}
                        {activeSection === 'target-scope' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faBullseye} />
                                        {t('initiatives.create.targetScope')}
                                    </h2>
                                </div>
                                <div className="form-section-content">

                                    {/* Target Age Groups */}
                                    <div className="form-group-initiative">
                                        <label className="section-label">
                                            {t('initiatives.create.targetAgeGroups')}
                                            <span className="label-description">{t('initiatives.create.targetAgeDescription')}</span>
                                        </label>
                                        <div className="checkbox-grid">
                                            {[
                                                { value: 'Children', label: t('initiatives.targetAge.children'), icon: '👶' },
                                                { value: 'Teens', label: t('initiatives.targetAge.teens'), icon: '🧑‍🎓' },
                                                { value: 'Adults', label: t('initiatives.targetAge.adults'), icon: '👨‍💼' },
                                                { value: 'Seniors', label: t('initiatives.targetAge.seniors'), icon: '👴' },
                                                { value: 'All ages', label: t('initiatives.targetAge.allAges'), icon: '👥' }
                                            ].map((age) => (
                                                <label key={age.value} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        value={age.value}
                                                        checked={values.targetAge.includes(age.value)}
                                                        onChange={(e) => {
                                                            const newTargetAge = e.target.checked
                                                                ? [...values.targetAge, age.value]
                                                                : values.targetAge.filter(item => item !== age.value);

                                                            setValues(prev => ({ ...prev, targetAge: newTargetAge }));
                                                        }}
                                                        className="checkbox-input"
                                                    />
                                                    <div className="checkbox-content">
                                                        <span className="checkbox-icon">{age.icon}</span>
                                                        <span className="checkbox-label">{age.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.targetAge && (
                                            <div className="error-message">{errors.targetAge}</div>
                                        )}
                                    </div>

                                    {/* Target Audience */}
                                    <div className="form-group-initiative">
                                        <label className="section-label">
                                            {t('initiatives.create.targetAudience')}
                                            <span className="label-description">{t('initiatives.create.targetAudienceDescription')}</span>
                                        </label>
                                        <div className="checkbox-grid">
                                            {[
                                                { value: 'Students', label: t('initiatives.audience.students'), icon: '🎓' },
                                                { value: 'Professionals', label: t('initiatives.audience.professionals'), icon: '💼' },
                                                { value: 'Families', label: t('initiatives.audience.families'), icon: '👨‍👩‍👧‍👦' },
                                                { value: 'Elderly', label: t('initiatives.audience.elderly'), icon: '👵' },
                                                { value: 'Special needs', label: t('initiatives.audience.specialNeeds'), icon: '♿' },
                                                { value: 'Unemployed', label: t('initiatives.audience.unemployed'), icon: '🔍' },
                                                { value: 'Entrepreneurs', label: t('initiatives.audience.entrepreneurs'), icon: '🚀' },
                                                { value: 'Volunteers', label: t('initiatives.audience.volunteers'), icon: '🤝' }
                                            ].map((audience) => (
                                                <label key={audience.value} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        value={audience.value}
                                                        checked={values.targetAudience.includes(audience.value)}
                                                        onChange={(e) => {
                                                            const newTargetAudience = e.target.checked
                                                                ? [...values.targetAudience, audience.value]
                                                                : values.targetAudience.filter(item => item !== audience.value);

                                                            setValues(prev => ({ ...prev, targetAudience: newTargetAudience }));
                                                        }}
                                                        className="checkbox-input"
                                                    />
                                                    <div className="checkbox-content">
                                                        <span className="checkbox-icon">{audience.icon}</span>
                                                        <span className="checkbox-label">{audience.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Audience */}
                                    <div className="form-group-initiative">
                                        <label htmlFor="customAudience" className="section-label">
                                            {t('initiatives.create.customAudience')}
                                            <span className="label-description">{t('initiatives.create.customAudienceDescription')}</span>
                                        </label>
                                        <textarea
                                            id="customAudience"
                                            name="customAudience"
                                            value={values.customAudience}
                                            onChange={onChangeHandler}
                                            placeholder={t('initiatives.create.customAudiencePlaceholder')}
                                            rows={3}
                                            onPaste={(e) => handleCleanPaste(e, (newValue) => {
                                                setValues(prev => ({ ...prev, customAudience: newValue }));
                                            }, values.customAudience, 500)}
                                            className="custom-audience-textarea"
                                        />
                                        {errors.customAudience && (
                                            <div className="error-message">{errors.customAudience}</div>
                                        )}
                                    </div>

                                    {/* Expected Budget */}
                                    <div className="form-group-initiative">
                                        <label className="section-label">
                                            {t('initiatives.create.expectedBudget')}
                                            <span className="label-description">{t('initiatives.create.expectedBudgetDescription')}</span>
                                        </label>
                                        <div className="budget-input-group">
                                            <input
                                                type="number"
                                                name="expectedBudget"
                                                value={values.expectedBudget}
                                                onChange={onChangeHandler}
                                                placeholder="0"
                                                min="0"
                                                step="100"
                                                className="budget-input"
                                            />
                                            <select
                                                name="currency"
                                                value={values.currency}
                                                onChange={onChangeHandler}
                                                className="currency-select"
                                            >
                                                <option value="BGN">BGN</option>
                                                <option value="EUR">EUR</option>
                                                <option value="USD">USD</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                        </div>
                                        {errors.expectedBudget && (
                                            <div className="error-message">{errors.expectedBudget}</div>
                                        )}
                                        {errors.currency && (
                                            <div className="error-message">{errors.currency}</div>
                                        )}
                                        {values.expectedBudget && (
                                            <div className="budget-display">
                                                {t('initiatives.create.budgetDisplay')} <strong>{parseInt(values.expectedBudget).toLocaleString()} {values.currency}</strong>
                                            </div>
                                        )}
                                    </div>

                                    {/* Funding Sources */}
                                    <div className="form-group-initiative">
                                        <label className="section-label">
                                            {t('initiatives.create.fundingSources')}
                                            <span className="label-description">{t('initiatives.create.fundingSourcesDescription')}</span>
                                        </label>
                                        <div className="funding-sources-grid">
                                            {[
                                                { value: 'Government', label: t('initiatives.funding.government'), icon: '🏛️', color: '#3182ce' },
                                                { value: 'Private', label: t('initiatives.funding.private'), icon: '💰', color: '#38a169' },
                                                { value: 'Donations', label: t('initiatives.funding.donations'), icon: '❤️', color: '#e53e3e' },
                                                { value: 'Sponsors', label: t('initiatives.funding.sponsors'), icon: '🤝', color: '#805ad5' },
                                                { value: 'Self-funded', label: t('initiatives.funding.selfFunded'), icon: '💳', color: '#d69e2e' },
                                                { value: 'Crowdfunding', label: t('initiatives.funding.crowdfunding'), icon: '👥', color: '#20b2aa' }
                                            ].map((source) => (
                                                <label key={source.value} className="funding-source-item">
                                                    <input
                                                        type="checkbox"
                                                        value={source.value}
                                                        checked={values.fundingSources.includes(source.value)}
                                                        onChange={(e) => {
                                                            const newFundingSources = e.target.checked
                                                                ? [...values.fundingSources, source.value]
                                                                : values.fundingSources.filter(item => item !== source.value);

                                                            setValues(prev => ({ ...prev, fundingSources: newFundingSources }));
                                                        }}
                                                        className="funding-checkbox"
                                                    />
                                                    <div
                                                        className="funding-content"
                                                        style={{ borderColor: source.color }}
                                                    >
                                                        <span className="funding-icon">{source.icon}</span>
                                                        <span className="funding-label">{source.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    {(values.targetAge.length > 0 || values.targetAudience.length > 0 || values.customAudience) && (
                                        <div className="target-scope-summary">
                                            <h4>📋 {t('initiatives.create.targetScopeSummary')}</h4>

                                            {values.targetAge.length > 0 && (
                                                <div className="summary-item">
                                                    <strong>{t('initiatives.create.targetAgeGroups')}:</strong>
                                                    <div className="summary-tags">
                                                        {values.targetAge.map(age => (
                                                            <span key={age} className="summary-tag age-tag">{age}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {values.targetAudience.length > 0 && (
                                                <div className="summary-item">
                                                    <strong>{t('initiatives.create.targetAudience')}:</strong>
                                                    <div className="summary-tags">
                                                        {values.targetAudience.map(audience => (
                                                            <span key={audience} className="summary-tag audience-tag">{audience}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {values.customAudience && (
                                                <div className="summary-item">
                                                    <strong>{t('initiatives.create.customAudience')}:</strong>
                                                    <p className="custom-audience-text">{values.customAudience}</p>
                                                </div>
                                            )}

                                            {values.expectedBudget && (
                                                <div className="summary-item">
                                                    <strong>{t('initiatives.create.plannedBudget')}</strong>
                                                    <span className="budget-summary">
                                                        {parseInt(values.expectedBudget).toLocaleString()} {values.currency}
                                                    </span>
                                                </div>
                                            )}

                                            {values.fundingSources.length > 0 && (
                                                <div className="summary-item">
                                                    <strong>{t('initiatives.create.fundingSources')}:</strong>
                                                    <div className="summary-tags">
                                                        {values.fundingSources.map(source => (
                                                            <span key={source} className="summary-tag funding-tag">{source}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* 🎯 SECTION 5: RESOURCES & FUNDING */}
                        {activeSection === 'resources' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                        {t('initiatives.create.resources')}
                                    </h2>
                                </div>
                                <div className="form-section-content">

                                    {/* 💰 FUNDING SUMMARY */}
                                    <div className="initiative-funding-summary-section">
                                        <h3>💰 {t('initiatives.create.fundingSummary')}</h3>
                                        <div className="initiative-funding-overview">
                                            <div className="initiative-funding-overview-item">
                                                <span className="initiative-funding-label">{t('initiatives.create.totalBudget')}:</span>
                                                <span className="initiative-funding-value">
                                                    {values.expectedBudget ?
                                                        `${parseInt(values.expectedBudget).toLocaleString()} ${values.currency}` :
                                                        t('initiatives.create.notDetermined')}
                                                </span>
                                            </div>
                                            <div className="initiative-funding-overview-item">
                                                <span className="initiative-funding-label">{t('initiatives.create.partners')}:</span>
                                                <span className="initiative-funding-value">{values.partners?.length || 0}</span>
                                            </div>
                                            <div className="initiative-funding-overview-item">
                                                <span className="initiative-funding-label">{t('initiatives.create.sponsors')}:</span>
                                                <span className="initiative-funding-value">{values.sponsors?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🤝 PARTNERS SECTION */}
                                    <div className="initiative-partners-section">
                                        <div className="initiative-dynamic-section-header">
                                            <h3>🤝 {t('initiatives.create.partners')}</h3>
                                            <button
                                                type="button"
                                                className="btn-initiative accent"
                                                onClick={addPartner}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                {t('initiatives.create.addPartner')}
                                            </button>
                                        </div>

                                        {values.partners?.length === 0 ? (
                                            <div className="initiative-empty-partners">
                                                <div className="initiative-empty-state">
                                                    <FontAwesomeIcon icon={faHandshake} className="initiative-empty-icon" />
                                                    <p>{t('initiatives.create.noPartnersAdded')}</p>
                                                    <p className="initiative-empty-description">{t('initiatives.create.partnersDescription')}</p>
                                                    <button
                                                        type="button"
                                                        className="btn-initiative primary"
                                                        onClick={addPartner}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                        {t('initiatives.create.addFirstPartner')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="initiative-partners-list">
                                                {values.partners.map((partner, index) => (
                                                    <div key={partner.titleSlug || `partner-${index}`} className="initiative-partner-card">
                                                        <div className="initiative-partner-card-header">
                                                            <div className="initiative-partner-number">
                                                                <FontAwesomeIcon icon={faHandshake} />
                                                                {t('initiatives.create.partnerNumber', { number: index + 1 })}
                                                                {(errors[`partners[${index}].name`] || errors[`partners[${index}].website`]) && (
                                                                    <span className="section-error-indicator">⚠️</span>
                                                                )}
                                                            </div>
                                                            <div className="initiative-partner-actions">
                                                                <button
                                                                    type="button"
                                                                    className="initiative-move-btn"
                                                                    onClick={() => {
                                                                        if (index > 0) {
                                                                            const newPartners = [...values.partners];
                                                                            [newPartners[index], newPartners[index - 1]] =
                                                                                [newPartners[index - 1], newPartners[index]];
                                                                            setValues(prev => ({ ...prev, partners: newPartners }));
                                                                        }
                                                                    }}
                                                                    disabled={index === 0}
                                                                    title={t('initiatives.create.moveUp')}
                                                                >
                                                                    <FontAwesomeIcon icon={faChevronUp} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="initiative-move-btn"
                                                                    onClick={() => {
                                                                        if (index < values.partners.length - 1) {
                                                                            const newPartners = [...values.partners];
                                                                            [newPartners[index], newPartners[index + 1]] =
                                                                                [newPartners[index + 1], newPartners[index]];
                                                                            setValues(prev => ({ ...prev, partners: newPartners }));
                                                                        }
                                                                    }}
                                                                    disabled={index === values.partners.length - 1}
                                                                    title={t('initiatives.create.moveDown')}
                                                                >
                                                                    <FontAwesomeIcon icon={faChevronDown} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="initiative-remove-btn"
                                                                    onClick={() => removePartner(index)}
                                                                    title={t('initiatives.create.removePartner')}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="initiative-partner-card-content">
                                                            <div className="initiative-partner-form-grid">
                                                                {/* Partner Logo */}
                                                                <div className="initiative-partner-logo-section">
                                                                    <label>{t('initiatives.create.partnerLogo')}</label>
                                                                    {partner.logo ? (
                                                                        <div className="initiative-partner-logo-preview">
                                                                            <img src={partner.logo} alt={partner.name || 'Partner logo'} />
                                                                            <div className="initiative-logo-overlay">
                                                                                <button
                                                                                    type="button"
                                                                                    className="initiative-change-logo-btn"
                                                                                    onClick={() => {
                                                                                        const fileInput = document.createElement('input');
                                                                                        fileInput.type = 'file';
                                                                                        fileInput.accept = 'image/*';
                                                                                        fileInput.onchange = (e) => {
                                                                                            if (e.target.files[0]) {
                                                                                                handlePartnerLogoUpload(e.target.files[0], index);
                                                                                            }
                                                                                        };
                                                                                        fileInput.click();
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faEdit} />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="initiative-remove-logo-btn"
                                                                                    onClick={() => {
                                                                                        const updatedPartners = [...values.partners];
                                                                                        updatedPartners[index] = {
                                                                                            ...updatedPartners[index],
                                                                                            logo: null
                                                                                        };
                                                                                        setValues(prev => ({ ...prev, partners: updatedPartners }));
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="initiative-partner-logo-upload">
                                                                            <label className="initiative-upload-placeholder">
                                                                                <FontAwesomeIcon icon={faCloudUploadAlt} />
                                                                                <span>{t('initiatives.create.uploadLogo')}</span>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={(e) => {
                                                                                        if (e.target.files[0]) {
                                                                                            handlePartnerLogoUpload(e.target.files[0], index);
                                                                                        }
                                                                                    }}
                                                                                    style={{ display: 'none' }}
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Partner Details */}
                                                                <div className="initiative-partner-details-section">
                                                                    {/* Partner Name */}
                                                                    <div className="initiative-form-group-partner">
                                                                        <label>
                                                                            {t('initiatives.create.partnerName')}
                                                                            <span className="required-indicator">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={partner.name || ''}
                                                                            onChange={(e) => {
                                                                                const updatedPartners = [...values.partners];
                                                                                updatedPartners[index] = {
                                                                                    ...updatedPartners[index],
                                                                                    name: e.target.value
                                                                                };
                                                                                setValues(prev => ({ ...prev, partners: updatedPartners }));
                                                                            }}

                                                                            placeholder={t('initiatives.create.partnerNamePlaceholder')}
                                                                            className={errors[`partners[${index}].name`] ? 'error' : ''}
                                                                        />
                                                                        {errors[`partners[${index}].name`] && (
                                                                            <div className="error-message">{errors[`partners[${index}].name`]}</div>
                                                                        )}
                                                                    </div>

                                                                    {/* Partner Type */}
                                                                    <div className="initiative-form-group-partner">
                                                                        <label>{t('initiatives.create.partnershipType')}</label>
                                                                        <select
                                                                            value={partner.type || 'Strategic'}
                                                                            onChange={(e) => {
                                                                                const updatedPartners = [...values.partners];
                                                                                updatedPartners[index] = {
                                                                                    ...updatedPartners[index],
                                                                                    type: e.target.value
                                                                                };
                                                                                setValues(prev => ({ ...prev, partners: updatedPartners }));
                                                                            }}
                                                                        >
                                                                            <option value="Strategic">{t('initiatives.partnerTypes.strategic')}</option>
                                                                            <option value="Resource">{t('initiatives.partnerTypes.resource')}</option>
                                                                            <option value="Media">{t('initiatives.partnerTypes.media')}</option>
                                                                            <option value="Technology">{t('initiatives.partnerTypes.technology')}</option>
                                                                            <option value="Educational">{t('initiatives.partnerTypes.educational')}</option>
                                                                        </select>
                                                                    </div>

                                                                    {/* Partner Website */}
                                                                    <div className="initiative-form-group-partner">
                                                                        <label>{t('initiatives.create.website')}</label>
                                                                        <input
                                                                            type="url"
                                                                            value={partner.website || ''}
                                                                            onChange={(e) => {
                                                                                const updatedPartners = [...values.partners];
                                                                                updatedPartners[index] = {
                                                                                    ...updatedPartners[index],
                                                                                    website: e.target.value
                                                                                };
                                                                                setValues(prev => ({ ...prev, partners: updatedPartners }));
                                                                            }}
                                                                            placeholder={t('initiatives.create.websitePlaceholder')}
                                                                            className={errors[`partners[${index}].website`] ? 'error' : ''}
                                                                        />
                                                                        {errors[`partners[${index}].website`] && (
                                                                            <div className="error-message">{errors[`partners[${index}].website`]}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Partner Description */}
                                                            <div className="initiative-form-group-partner initiative-full-width">
                                                                <label>{t('initiatives.create.partnerDescription')}</label>
                                                                <textarea
                                                                    value={partner.description || ''}
                                                                    onChange={(e) => {
                                                                        const updatedPartners = [...values.partners];
                                                                        updatedPartners[index] = {
                                                                            ...updatedPartners[index],
                                                                            description: e.target.value
                                                                        };
                                                                        setValues(prev => ({ ...prev, partners: updatedPartners }));
                                                                    }}
                                                                    placeholder={t('initiatives.create.partnerDescriptionPlaceholder')}
                                                                    rows={3}
                                                                    className={errors[`partners[${index}].description`] ? 'error' : ''}
                                                                />
                                                                <div className={`character-count slate-counter ${partner.description.length > 9500 ? 'warning' :
                                                                    partner.description.length > 9500 ? 'error' : ''
                                                                    }`}>
                                                                    {partner.description.length}/10000 {t('initiatives.create.characters')}
                                                                </div>
                                                                {errors[`partners[${index}].description`] && (
                                                                    <div className="error-message">{errors[`partners[${index}].description`]}</div>
                                                                )}
                                                            </div>

                                                            {/* Partner Visibility */}
                                                            <div className="initiative-form-group-partner">
                                                                <label className="initiative-checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={partner.visible !== false}
                                                                        onChange={(e) => {
                                                                            const updatedPartners = [...values.partners];
                                                                            updatedPartners[index] = {
                                                                                ...updatedPartners[index],
                                                                                visible: e.target.checked
                                                                            };
                                                                            setValues(prev => ({ ...prev, partners: updatedPartners }));
                                                                        }}
                                                                    />
                                                                    <span>{t('initiatives.create.showPartnerPublicly')}</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 💰 SPONSORS SECTION */}
                                    <div className="initiative-sponsors-section">
                                        <div className="initiative-dynamic-section-header">
                                            <h3>💰 {t('initiatives.create.sponsors')}</h3>
                                            <button
                                                type="button"
                                                className="btn-initiative accent"
                                                onClick={addSponsor}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                {t('initiatives.create.addSponsor')}
                                            </button>
                                        </div>

                                        {values.sponsors?.length === 0 ? (
                                            <div className="initiative-empty-sponsors">
                                                <div className="initiative-empty-state">
                                                    <FontAwesomeIcon icon={faTrophy} className="initiative-empty-icon" />
                                                    <p>{t('initiatives.create.noSponsorsAdded')}</p>
                                                    <p className="initiative-empty-description">{t('initiatives.create.sponsorsDescription')}</p>
                                                    <button
                                                        type="button"
                                                        className="btn-initiative primary"
                                                        onClick={addSponsor}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                        {t('initiatives.create.addFirstSponsor')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="initiative-sponsors-list">
                                                {values.sponsors.map((sponsor, index) => (
                                                    <div key={sponsor.id || index} className="initiative-sponsor-card">
                                                        <div className="initiative-sponsor-card-header">
                                                            <div className="initiative-sponsor-number">
                                                                <FontAwesomeIcon icon={faTrophy} />
                                                                {t('initiatives.create.sponsorNumber', { number: index + 1 })}
                                                                {(errors[`sponsors[${index}].amount`] || errors[`sponsors[${index}].website`]) && (
                                                                    <span className="section-error-indicator">⚠️</span>
                                                                )}
                                                            </div>
                                                            <div className="initiative-sponsor-actions">
                                                                <button
                                                                    type="button"
                                                                    className="initiative-move-btn"
                                                                    onClick={() => {
                                                                        if (index > 0) {
                                                                            const newSponsors = [...values.sponsors];
                                                                            [newSponsors[index], newSponsors[index - 1]] =
                                                                                [newSponsors[index - 1], newSponsors[index]];
                                                                            setValues(prev => ({ ...prev, sponsors: newSponsors }));
                                                                        }
                                                                    }}
                                                                    disabled={index === 0}
                                                                    title={t('initiatives.create.moveUp')}
                                                                >
                                                                    <FontAwesomeIcon icon={faChevronUp} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="initiative-move-btn"
                                                                    onClick={() => {
                                                                        if (index < values.sponsors.length - 1) {
                                                                            const newSponsors = [...values.sponsors];
                                                                            [newSponsors[index], newSponsors[index + 1]] =
                                                                                [newSponsors[index + 1], newSponsors[index]];
                                                                            setValues(prev => ({ ...prev, sponsors: newSponsors }));
                                                                        }
                                                                    }}
                                                                    disabled={index === values.sponsors.length - 1}
                                                                    title={t('initiatives.create.moveDown')}
                                                                >
                                                                    <FontAwesomeIcon icon={faChevronDown} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="initiative-remove-btn"
                                                                    onClick={() => removeSponsor(index)}
                                                                    title={t('initiatives.create.removeSponsor')}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="initiative-sponsor-card-content">
                                                            <div className="initiative-sponsor-form-grid">
                                                                {/* Sponsor Logo */}
                                                                <div className="initiative-sponsor-logo-section">
                                                                    <label>{t('initiatives.create.sponsorLogo')}</label>
                                                                    {sponsor.logo ? (
                                                                        <div className="initiative-sponsor-logo-preview">
                                                                            <img src={sponsor.logo} alt={sponsor.name || 'Sponsor logo'} />
                                                                            <div className="initiative-logo-overlay">
                                                                                <button
                                                                                    type="button"
                                                                                    className="initiative-change-logo-btn"
                                                                                    onClick={() => {
                                                                                        const fileInput = document.createElement('input');
                                                                                        fileInput.type = 'file';
                                                                                        fileInput.accept = 'image/*';
                                                                                        fileInput.onchange = (e) => {
                                                                                            if (e.target.files[0]) {
                                                                                                handleSponsorLogoUpload(e.target.files[0], index);
                                                                                            }
                                                                                        };
                                                                                        fileInput.click();
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faEdit} />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="initiative-remove-logo-btn"
                                                                                    onClick={() => {
                                                                                        const updatedSponsors = [...values.sponsors];
                                                                                        updatedSponsors[index] = {
                                                                                            ...updatedSponsors[index],
                                                                                            logo: null
                                                                                        };
                                                                                        setValues(prev => ({ ...prev, sponsors: updatedSponsors }));
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="initiative-sponsor-logo-upload">
                                                                            <label className="initiative-upload-placeholder">
                                                                                <FontAwesomeIcon icon={faCloudUploadAlt} />
                                                                                <span>{t('initiatives.create.uploadLogo')}</span>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={(e) => {
                                                                                        if (e.target.files[0]) {
                                                                                            handleSponsorLogoUpload(e.target.files[0], index);
                                                                                        }
                                                                                    }}
                                                                                    style={{ display: 'none' }}
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Sponsor Details */}
                                                                <div className="initiative-sponsor-details-section">
                                                                    {/* Sponsor Name */}
                                                                    <div className="initiative-form-group-sponsor">
                                                                        <label>
                                                                            {t('initiatives.create.sponsorName')}

                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={sponsor.name || ''}
                                                                            onChange={(e) => {
                                                                                const updatedSponsors = [...values.sponsors];
                                                                                updatedSponsors[index] = {
                                                                                    ...updatedSponsors[index],
                                                                                    name: e.target.value
                                                                                };
                                                                                setValues(prev => ({ ...prev, sponsors: updatedSponsors }));
                                                                            }}
                                                                            placeholder={t('initiatives.create.sponsorNamePlaceholder')}
                                                                            className={errors[`sponsors[${index}].name`] ? 'error' : ''}
                                                                        />
                                                                        {errors[`sponsors[${index}].name`] && (
                                                                            <div className="error-message">{errors[`sponsors[${index}].name`]}</div>
                                                                        )}
                                                                    </div>

                                                                    {/* Sponsorship Amount */}
                                                                    <div className="initiative-form-group-sponsor">
                                                                        <label>{t('initiatives.create.sponsorshipAmount')}</label>
                                                                        <div className="initiative-amount-input-group">
                                                                            <input
                                                                                type="number"
                                                                                value={sponsor.amount || ''}
                                                                                onChange={(e) => {
                                                                                    const updatedSponsors = [...values.sponsors];
                                                                                    updatedSponsors[index] = {
                                                                                        ...updatedSponsors[index],
                                                                                        amount: e.target.value
                                                                                    };
                                                                                    setValues(prev => ({ ...prev, sponsors: updatedSponsors }));
                                                                                }}
                                                                                placeholder="0"
                                                                                min="0"
                                                                                step="100"
                                                                            />
                                                                            <select
                                                                                value={sponsor.currency || 'BGN'}
                                                                                onChange={(e) => {
                                                                                    const updatedSponsors = [...values.sponsors];
                                                                                    updatedSponsors[index] = {
                                                                                        ...updatedSponsors[index],
                                                                                        currency: e.target.value
                                                                                    };
                                                                                    setValues(prev => ({ ...prev, sponsors: updatedSponsors }));
                                                                                }}
                                                                            >
                                                                                <option value="BGN">BGN</option>
                                                                                <option value="EUR">EUR</option>
                                                                                <option value="USD">USD</option>
                                                                                <option value="GBP">GBP</option>
                                                                            </select>
                                                                        </div>
                                                                        {errors[`sponsors[${index}].amount`] && (
                                                                            <div className="error-message">{errors[`sponsors[${index}].amount`]}</div>
                                                                        )}
                                                                    </div>

                                                                    {/* Sponsorship Type */}
                                                                    <div className="initiative-form-group-sponsor">
                                                                        <label>{t('initiatives.create.sponsorshipType')}</label>
                                                                        <select
                                                                            value={sponsor.type || 'Financial'}
                                                                            onChange={(e) => {
                                                                                const updatedSponsors = [...values.sponsors];
                                                                                updatedSponsors[index] = {
                                                                                    ...updatedSponsors[index],
                                                                                    type: e.target.value
                                                                                };
                                                                                setValues(prev => ({ ...prev, sponsors: updatedSponsors }));
                                                                            }}
                                                                        >
                                                                            <option value="Financial">{t('initiatives.sponsorTypes.financial')}</option>
                                                                            <option value="Technology">{t('initiatives.sponsorTypes.technology')}</option>
                                                                            <option value="Media">{t('initiatives.sponsorTypes.media')}</option>
                                                                            <option value="Equipment">{t('initiatives.sponsorTypes.equipment')}</option>
                                                                            <option value="Services">{t('initiatives.sponsorTypes.services')}</option>
                                                                        </select>
                                                                    </div>

                                                                    {/* Sponsor Website */}
                                                                    <div className="initiative-form-group-sponsor">
                                                                        <label>{t('initiatives.create.website')}</label>
                                                                        <input
                                                                            type="url"
                                                                            value={sponsor.website || ''}
                                                                            onChange={(e) => {
                                                                                const updatedSponsors = [...values.sponsors];
                                                                                updatedSponsors[index] = {
                                                                                    ...updatedSponsors[index],
                                                                                    website: e.target.value
                                                                                };
                                                                                setValues(prev => ({ ...prev, sponsors: updatedSponsors }));
                                                                            }}
                                                                            placeholder={t('initiatives.create.sponsorWebsitePlaceholder')}
                                                                            className={errors[`sponsors[${index}].website`] ? 'error' : ''}
                                                                        />
                                                                        {errors[`sponsors[${index}].website`] && (
                                                                            <div className="error-message">{errors[`sponsors[${index}].website`]}</div>
                                                                        )}
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            {/* Sponsor Visibility */}
                                                            <div className="initiative-form-group-sponsor">
                                                                <label className="initiative-checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={sponsor.visible !== false}
                                                                        onChange={(e) => {
                                                                            const updatedSponsors = [...values.sponsors];
                                                                            updatedSponsors[index] = {
                                                                                ...updatedSponsors[index],
                                                                                visible: e.target.checked
                                                                            };
                                                                            setValues(prev => ({ ...prev, sponsors: updatedSponsors }));
                                                                        }}
                                                                    />
                                                                    <span>{t('initiatives.create.showSponsorPublicly')}</span>
                                                                    <small>({t('initiatives.create.uncheckForAnonymous')})</small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 📊 BUDGET BREAKDOWN */}
                                    {(values.expectedBudget || values.sponsors?.length > 0) && (
                                        <div className="initiative-budget-breakdown-section">
                                            <h3>📊 {t('initiatives.create.budgetBreakdown')}</h3>
                                            <div className="initiative-budget-summary">
                                                <div className="initiative-budget-item">
                                                    <span className="initiative-budget-label">{t('initiatives.create.plannedBudget')}:</span>
                                                    <span className="initiative-budget-amount">
                                                        {values.expectedBudget ?
                                                            `${parseInt(values.expectedBudget).toLocaleString()} ${values.currency}` :
                                                            t('initiatives.create.notDetermined')}
                                                    </span>
                                                </div>

                                                {values.sponsors?.length > 0 && (
                                                    <>
                                                        <div className="initiative-budget-item">
                                                            <span className="initiative-budget-label">{t('initiatives.create.totalSponsorships')}:</span>
                                                            <span className="initiative-budget-amount">
                                                                {(() => {
                                                                    const totalSponsorships = values.sponsors
                                                                        .filter(s => s.amount && s.currency === values.currency)
                                                                        .reduce((sum, s) => sum + parseInt(s.amount || 0), 0);
                                                                    return `${totalSponsorships.toLocaleString()} ${values.currency}`;
                                                                })()}
                                                            </span>
                                                        </div>

                                                        <div className="initiative-sponsors-breakdown">
                                                            <h4>{t('initiatives.create.sponsorDetails')}:</h4>
                                                            {values.sponsors
                                                                .filter(s => s.amount && s.name)
                                                                .map((sponsor, index) => (
                                                                    <div key={index} className="initiative-sponsor-breakdown-item">
                                                                        <span className="initiative-sponsor-name">{sponsor.name}</span>
                                                                        <span className="initiative-sponsor-amount">
                                                                            {parseInt(sponsor.amount).toLocaleString()} {sponsor.currency || 'BGN'}
                                                                        </span>
                                                                        <span className="initiative-sponsor-type-badge">{sponsor.type}</span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 6: MEDIA & VISUALS */}
                        {activeSection === 'media' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faImage} />
                                        {t('initiatives.create.media')}
                                    </h2>
                                </div>
                                <div className="form-section-content">

                                    {/* 🖼️ INITIATIVE LOGO */}
                                    <div className="initiative-logo-section">
                                        <div className="media-section-header">
                                            <h3>🖼️ {t('initiatives.create.initiativeLogo')}</h3>
                                            <p className="media-section-description">{t('initiatives.create.initiativeLogoDescription')}</p>
                                        </div>

                                        <div className="initiative-logo-upload-container">
                                            {values.logo ? (
                                                <div className="initiative-logo-preview">
                                                    <div className="logo-preview-header">
                                                        <span className="logo-preview-title">{t('initiatives.create.currentLogo')}</span>
                                                        <button
                                                            type="button"
                                                            className="logo-remove-btn"
                                                            onClick={removeLogo}
                                                            title={t('initiatives.create.removeLogo')}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </div>
                                                    <img src={values.logo} alt="Initiative logo" />
                                                    <div className="logo-info">
                                                        <small>{t('initiatives.create.logoRecommendation')}</small>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="initiative-logo-upload">
                                                    <label className="logo-upload-placeholder">
                                                        <FontAwesomeIcon icon={faCloudUploadAlt} />
                                                        <span>{t('initiatives.create.uploadLogo')}</span>
                                                        <small>{t('initiatives.create.logoFormats')}</small>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleLogoUpload}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 📄 DOWNLOAD MATERIALS */}
                                    <div className="download-materials-section">
                                        <div className="media-section-header">
                                            <h3>📄 {t('initiatives.create.downloadMaterials')}</h3>
                                            <p className="media-section-description">{t('initiatives.create.downloadMaterialsDescription')}</p>
                                            <button
                                                type="button"
                                                className="btn-initiative accent"
                                                onClick={() => document.getElementById('document-upload').click()}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                {t('initiatives.create.addDocuments')}
                                            </button>
                                            <input
                                                id="document-upload"
                                                type="file"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                                multiple
                                                onChange={handleDocumentUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </div>

                                        {values.downloadMaterials?.length === 0 ? (
                                            <div className="empty-download-materials">
                                                <div className="empty-state">
                                                    <FontAwesomeIcon icon={faFileAlt} className="empty-icon" />
                                                    <p>{t('initiatives.create.noDocuments')}</p>
                                                    <p className="empty-description">{t('initiatives.create.documentsHint')}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="download-materials-list">
                                                {values.downloadMaterials.map((document, index) => (
                                                    <div key={index} className="document-item">
                                                        {editingDocument === index ? (
                                                            // 📝 EDIT MODE
                                                            <div className="document-edit-mode">
                                                                <div className="document-icon">
                                                                    <FontAwesomeIcon icon={getFileIcon(document.fileType)} />
                                                                </div>
                                                                <div className="document-edit-fields">
                                                                    <input
                                                                        type="text"
                                                                        value={document.title}
                                                                        onChange={(e) => updateDocumentField(index, 'title', e.target.value)}
                                                                        placeholder="Document title"
                                                                        className="document-edit-input"
                                                                    />
                                                                    {errors[`downloadMaterials[${index}].title`] && (
                                                                        <div className="error-message">{errors[`downloadMaterials[${index}].title`]}</div>
                                                                    )}
                                                                    <textarea
                                                                        value={document.description}
                                                                        onChange={(e) => updateDocumentField(index, 'description', e.target.value)}
                                                                        placeholder="Document description"
                                                                        rows={2}
                                                                        className="document-edit-textarea"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={document.image.alt}
                                                                        onChange={(e) => updateDocumentField(index, 'image.alt', e.target.value)}
                                                                        placeholder="Alt text"
                                                                        className="document-edit-input"
                                                                    />
                                                                </div>
                                                                <div className="document-edit-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="document-save-btn"
                                                                        onClick={() => setEditingDocument(null)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faSave} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="document-cancel-btn"
                                                                        onClick={() => setEditingDocument(null)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faTimes} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // 👁️ VIEW MODE (същото като сега)
                                                            <>
                                                                <div className="document-icon">
                                                                    <FontAwesomeIcon icon={getFileIcon(document.fileType)} />
                                                                    {errors[`downloadMaterials[${index}].title`] && (
                                                                        <span className="document-error-indicator">⚠️</span>
                                                                    )}
                                                                </div>
                                                                <div className="document-details">
                                                                    <div className="document-name">
                                                                        <button
                                                                            onClick={() => handleDocumentDownload(document)}
                                                                            className="document-download-btn"
                                                                            type="button"
                                                                        >
                                                                            {document.title || document.originalName}
                                                                        </button>
                                                                    </div>
                                                                    <div className="document-meta">
                                                                        {document.fileType.toUpperCase()} • {document.fileSize}
                                                                    </div>
                                                                    {document.description && (
                                                                        <div className="document-description">
                                                                            {document.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="document-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="document-edit-btn"
                                                                        onClick={() => window.open(document.downloadUrl, '_blank')}
                                                                        title="Отвори документа"
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="document-remove-btn"
                                                                        onClick={() => removeDownloadMaterial(index)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 🖼️ ADDITIONAL GALLERY */}
                                    <div className="additional-gallery-section">
                                        <div className="media-section-header">
                                            <h3>🖼️ {t('initiatives.create.additionalGallery')}</h3>
                                            <p className="media-section-description">{t('initiatives.create.additionalGalleryDescription')}</p>
                                        </div>

                                        <div className="additional-gallery-upload">
                                            <div className="gallery-upload-methods">
                                                <div className="gallery-upload-method">
                                                    <label className="gallery-upload-btn">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                        {values.gallery?.length > 0 ? t('initiatives.create.addMoreImages') : t('initiatives.create.uploadImages')}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleGalleryUpload}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>

                                                {values.gallery?.length > 0 && (
                                                    <div className="gallery-upload-method">
                                                        <button
                                                            type="button"
                                                            className="gallery-clear-btn"
                                                            onClick={clearGallery}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                            {t('initiatives.create.clearGallery')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {values.gallery && values.gallery.length > 0 && (
                                                <div className="additional-gallery-preview">
                                                    <h5>{t('initiatives.create.galleryImages')} ({values.gallery.length})</h5>
                                                    <div className="additional-gallery-grid">
                                                        {values.gallery.map((image, index) => (
                                                            <div key={index} className="gallery-item">
                                                                <img src={image.src} alt={image.alt || `Gallery image ${index + 1}`} />
                                                                <div className="gallery-item-controls">
                                                                    <input
                                                                        type="text"
                                                                        placeholder={t('initiatives.create.imageAlt')}
                                                                        value={image.alt || ''}
                                                                        onChange={(e) => updateGalleryImageAlt(index, e.target.value)}
                                                                        className="gallery-input"
                                                                    />
                                                                    {errors[`gallery[${index}].alt`] && (
                                                                        <div className="warning-message">
                                                                            <FontAwesomeIcon icon={faInfoCircle} />
                                                                            {errors[`gallery[${index}].alt`]}
                                                                        </div>
                                                                    )}
                                                                    <input
                                                                        type="text"
                                                                        placeholder={t('initiatives.create.imageCaption')}
                                                                        value={image.caption || ''}
                                                                        onChange={(e) => updateGalleryImageCaption(index, e.target.value)}
                                                                        className="gallery-input"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="gallery-remove-btn"
                                                                        onClick={() => removeGalleryImage(index)}
                                                                        title={t('initiatives.create.removeImage')}
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 7: CONTACTS & LINKS */}
                        {activeSection === 'contacts' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faAddressCard} />
                                        {t('initiatives.create.contacts')}
                                    </h2>
                                </div>
                                <div className="form-section-content">
                                    {/* 👨‍💼 ГЛАВЕН КОНТАКТ */}
                                    <div className="initiative-main-contact-section">
                                        <div className="initiative-contacts-section-header">
                                            <h3>👨‍💼 {t('initiatives.create.mainContactGlobal')}</h3>
                                            <p className="initiative-section-description">{t('initiatives.create.mainContactDescription')}</p>
                                        </div>

                                        <div className="initiative-main-contact-form-grid">
                                            {/* Contact Image */}
                                            <div className="initiative-form-group-contact-image">
                                                <label>{t('initiatives.create.contactImage')}</label>
                                                <div className="contact-image-upload">
                                                    {values.contact?.image ? (
                                                        <div className="contact-image-preview">
                                                            <img src={values.contact.image} alt={values.contact.name || 'Contact'} />
                                                            <button type="button" onClick={removeContactImage}>
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="contact-image-upload-placeholder">
                                                            <FontAwesomeIcon icon={faUser} />
                                                            <span>Качи снимка</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleContactImageUpload}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="initiative-contact-details">
                                                {/* Name */}
                                                <div className="initiative-form-group-contact">
                                                    <label>
                                                        {t('initiatives.create.contactName')}
                                                        {/* 🔧 ПРЕМАХНАТО: <span className="required-indicator">*</span> */}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={values.contact?.name || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                contact: {
                                                                    ...prev.contact,
                                                                    name: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={t('initiatives.create.contactNamePlaceholder')}
                                                        className={errors['contact.name'] ? 'error' : ''}
                                                    />
                                                    {/* 🆕 ДОБАВЕНО: Error message */}
                                                    {errors['contact.name'] && (
                                                        <div className="error-message">{errors['contact.name']}</div>
                                                    )}
                                                </div>

                                                {/* Position */}
                                                <div className="initiative-form-group-contact">
                                                    <label>{t('initiatives.create.contactPosition')}</label>
                                                    <input
                                                        type="text"
                                                        value={values.contact?.position || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                contact: {
                                                                    ...prev.contact,
                                                                    position: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={t('initiatives.create.contactPositionPlaceholder')}
                                                        className={errors['contact.position'] ? 'error' : ''}
                                                    />
                                                    {/* 🆕 ДОБАВЕНО: Error message */}
                                                    {errors['contact.position'] && (
                                                        <div className="error-message">{errors['contact.position']}</div>
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div className="initiative-form-group-contact">
                                                    <label>
                                                        {t('initiatives.create.contactEmail')}
                                                        {/* 🔧 ПРЕМАХНАТО: <span className="required-indicator">*</span> */}
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={values.contact?.email || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                contact: {
                                                                    ...prev.contact,
                                                                    email: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={t('initiatives.create.contactEmailPlaceholder')}
                                                        className={errors['contact.email'] ? 'error' : ''}
                                                    />
                                                    {/* 🆕 ДОБАВЕНО: Error message */}
                                                    {errors['contact.email'] && (
                                                        <div className="error-message">{errors['contact.email']}</div>
                                                    )}
                                                </div>

                                                {/* Phone */}
                                                <div className="initiative-form-group-contact">
                                                    <label>{t('initiatives.create.contactPhone')}</label>
                                                    <input
                                                        type="tel"
                                                        value={values.contact?.phone || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                contact: {
                                                                    ...prev.contact,
                                                                    phone: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={t('initiatives.create.contactPhonePlaceholder')}
                                                        className={errors['contact.phone'] ? 'error' : ''}
                                                    />
                                                    {/* 🆕 ДОБАВЕНО: Error message */}
                                                    {errors['contact.phone'] && (
                                                        <div className="error-message">{errors['contact.phone']}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 👤 RESPONSIBLE PERSON */}
                                    <div className="initiative-responsible-section">
                                        <div className="initiative-contacts-section-header">
                                            <h3>👤 {t('initiatives.create.responsiblePerson')}</h3>
                                            <p className="initiative-section-description">{t('initiatives.create.responsiblePersonDescription')}</p>
                                        </div>

                                        <div className="initiative-responsible-form-grid">
                                            {/* Name */}
                                            <div className="initiative-form-group-contact">
                                                <label>
                                                    {t('initiatives.create.fullName')}
                                                    {/* 🔧 ПРЕМАХНАТО: <span className="required-indicator">*</span> */}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={values.responsible?.name || ''}
                                                    onChange={(e) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            responsible: {
                                                                ...prev.responsible,
                                                                name: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={t('initiatives.create.fullNamePlaceholder')}
                                                    className={errors['responsible.name'] ? 'error' : ''}
                                                />
                                                {errors['responsible.name'] && (
                                                    <div className="error-message">{errors['responsible.name']}</div>
                                                )}
                                            </div>

                                            {/* Position */}
                                            <div className="initiative-form-group-contact">
                                                <label>{t('initiatives.create.position')}</label>
                                                <input
                                                    type="text"
                                                    value={values.responsible?.position || ''}
                                                    onChange={(e) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            responsible: {
                                                                ...prev.responsible,
                                                                position: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={t('initiatives.create.positionPlaceholder')}
                                                    className={errors['responsible.position'] ? 'error' : ''}
                                                />
                                                {/* 🆕 ДОБАВЕНО: Error message */}
                                                {errors['responsible.position'] && (
                                                    <div className="error-message">{errors['responsible.position']}</div>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div className="initiative-form-group-contact">
                                                <label>
                                                    {t('initiatives.create.email')}
                                                    {/* 🔧 ПРЕМАХНАТО: <span className="required-indicator">*</span> */}
                                                </label>
                                                <input
                                                    type="email"
                                                    value={values.responsible?.email || ''}
                                                    onChange={(e) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            responsible: {
                                                                ...prev.responsible,
                                                                email: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={t('initiatives.create.emailPlaceholder')}
                                                    className={errors['responsible.email'] ? 'error' : ''}
                                                />
                                                {errors['responsible.email'] && (
                                                    <div className="error-message">{errors['responsible.email']}</div>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div className="initiative-form-group-contact">
                                                <label>{t('initiatives.create.phone')}</label>
                                                <input
                                                    type="tel"
                                                    value={values.responsible?.phone || ''}
                                                    onChange={(e) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            responsible: {
                                                                ...prev.responsible,
                                                                phone: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={t('initiatives.create.phonePlaceholder')}
                                                    className={errors['responsible.phone'] ? 'error' : ''}
                                                />
                                                {/* 🆕 ДОБАВЕНО: Error message */}
                                                {errors['responsible.phone'] && (
                                                    <div className="error-message">{errors['responsible.phone']}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🏢 ORGANIZATION */}
                                    <div className="initiative-organization-section">
                                        <div className="initiative-contacts-section-header">
                                            <h3>🏢 {t('initiatives.create.organization')}</h3>
                                            <p className="initiative-section-description">{t('initiatives.create.organizationDescription')}</p>
                                        </div>

                                        <div className="initiative-organization-form-grid">
                                            {/* Organization Name */}
                                            <div className="initiative-form-group-contact">
                                                <label>
                                                    {t('initiatives.create.organizationName')}
                                                    {/* 🔧 ПРЕМАХНАТО: <span className="required-indicator">*</span> */}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={values.organization?.name || ''}
                                                    onChange={(e) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            organization: {
                                                                ...prev.organization,
                                                                name: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={t('initiatives.create.organizationNamePlaceholder')}
                                                    className={errors['organization.name'] ? 'error' : ''}
                                                />
                                                {errors['organization.name'] && (
                                                    <div className="error-message">{errors['organization.name']}</div>
                                                )}
                                            </div>

                                            {/* Organization Website */}
                                            <div className="initiative-form-group-contact">
                                                <label>{t('initiatives.create.organizationWebsite')}</label>
                                                <input
                                                    type="url"
                                                    value={values.organization?.website || ''}
                                                    onChange={(e) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            organization: {
                                                                ...prev.organization,
                                                                website: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={t('initiatives.create.organizationWebsitePlaceholder')}
                                                    className={errors['organization.website'] ? 'error' : ''}
                                                />
                                                {errors['organization.website'] && (
                                                    <div className="error-message">{errors['organization.website']}</div>
                                                )}
                                            </div>

                                            {/* Organization Address - Full Width */}
                                            <div className="initiative-form-group-contact initiative-contact-full-width">
                                                <label>{t('initiatives.create.organizationAddress')}</label>
                                                <textarea
                                                    value={values.organization?.address || ''}
                                                    onChange={(e) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            organization: {
                                                                ...prev.organization,
                                                                address: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={t('initiatives.create.organizationAddressPlaceholder')}
                                                    rows={3}
                                                    onPaste={(e) => handleCleanPaste(e, (newValue) => {
                                                        setValues(prev => ({
                                                            ...prev,
                                                            organization: {
                                                                ...prev.organization,
                                                                address: newValue
                                                            }
                                                        }));
                                                    }, values.organization?.address || '', 500)}
                                                    className={errors['organization.address'] ? 'error' : ''}
                                                />
                                                {/* 🆕 ДОБАВЕНО: Error message */}
                                                {errors['organization.address'] && (
                                                    <div className="error-message">{errors['organization.address']}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 📱 SOCIAL MEDIA - остава същo */}
                                    {/* 📱 SOCIAL MEDIA */}
                                    <div className="initiative-social-media-section">
                                        <div className="initiative-contacts-section-header">
                                            <h3>📱 {t('initiatives.create.socialMedia')}</h3>
                                            <p className="initiative-section-description">{t('initiatives.create.socialMediaDescription')}</p>
                                        </div>

                                        <div className="initiative-social-media-grid">
                                            {/* Facebook */}
                                            <div className="initiative-social-media-item">
                                                <div className="initiative-social-media-icon facebook">
                                                    <FontAwesomeIcon icon={faFacebookF} />
                                                </div>
                                                <div className="initiative-form-group-social">
                                                    <label>{t('initiatives.create.facebook')}</label>
                                                    <input
                                                        type="url"
                                                        value={values.socialMedia?.facebook || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                socialMedia: {
                                                                    ...prev.socialMedia,
                                                                    facebook: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder="https://facebook.com/your-page"
                                                        className={errors['socialMedia.facebook'] ? 'error' : ''}
                                                    />
                                                    {errors['socialMedia.facebook'] && (
                                                        <div className="error-message">{errors['socialMedia.facebook']}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Instagram */}
                                            <div className="initiative-social-media-item">
                                                <div className="initiative-social-media-icon instagram">
                                                    <FontAwesomeIcon icon={faInstagram} />
                                                </div>
                                                <div className="initiative-form-group-social">
                                                    <label>{t('initiatives.create.instagram')}</label>
                                                    <input
                                                        type="url"
                                                        value={values.socialMedia?.instagram || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                socialMedia: {
                                                                    ...prev.socialMedia,
                                                                    instagram: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder="https://instagram.com/your-profile"
                                                        className={errors['socialMedia.instagram'] ? 'error' : ''}
                                                    />
                                                    {errors['socialMedia.instagram'] && (
                                                        <div className="error-message">{errors['socialMedia.instagram']}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* LinkedIn */}
                                            <div className="initiative-social-media-item">
                                                <div className="initiative-social-media-icon linkedin">
                                                    <FontAwesomeIcon icon={faLinkedinIn} />
                                                </div>
                                                <div className="initiative-form-group-social">
                                                    <label>{t('initiatives.create.linkedin')}</label>
                                                    <input
                                                        type="url"
                                                        value={values.socialMedia?.linkedin || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                socialMedia: {
                                                                    ...prev.socialMedia,
                                                                    linkedin: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder="https://linkedin.com/company/your-company"
                                                        className={errors['socialMedia.linkedin'] ? 'error' : ''}
                                                    />
                                                    {errors['socialMedia.linkedin'] && (
                                                        <div className="error-message">{errors['socialMedia.linkedin']}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Twitter */}
                                            <div className="initiative-social-media-item">
                                                <div className="initiative-social-media-icon twitter">
                                                    <FontAwesomeIcon icon={faTwitter} />
                                                </div>
                                                <div className="initiative-form-group-social">
                                                    <label>{t('initiatives.create.twitter')}</label>
                                                    <input
                                                        type="url"
                                                        value={values.socialMedia?.twitter || ''}
                                                        onChange={(e) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                socialMedia: {
                                                                    ...prev.socialMedia,
                                                                    twitter: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder="https://twitter.com/your-profile"
                                                        className={errors['socialMedia.twitter'] ? 'error' : ''}
                                                    />
                                                    {errors['socialMedia.twitter'] && (
                                                        <div className="error-message">{errors['socialMedia.twitter']}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 📞 ADDITIONAL CONTACTS */}
                                    <div className="initiative-additional-contacts-section">
                                        <div className="initiative-contacts-section-header">
                                            <h3>📞 {t('initiatives.create.additionalContacts')}</h3>
                                            <p className="initiative-section-description">{t('initiatives.create.additionalContactsDescription')}</p>
                                            <button
                                                type="button"
                                                className="btn-initiative accent"
                                                onClick={() => {
                                                    setValues(prev => ({
                                                        ...prev,
                                                        additionalContacts: [
                                                            ...(prev.additionalContacts || []),
                                                            { id: generateId(), name: '', position: '', email: '', phone: '' }
                                                        ]
                                                    }));
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                {t('initiatives.create.addContact')}
                                            </button>
                                        </div>

                                        {values.additionalContacts?.length === 0 ? (
                                            <div className="initiative-empty-additional-contacts">
                                                <div className="initiative-empty-state">
                                                    <FontAwesomeIcon icon={faUsers} className="initiative-empty-icon" />
                                                    <p>{t('initiatives.create.noAdditionalContacts')}</p>
                                                    <p className="initiative-empty-description">{t('initiatives.create.additionalContactsHint')}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="initiative-additional-contacts-list">
                                                {values.additionalContacts.map((contact, index) => (
                                                    <div key={contact.id || index} className="initiative-additional-contact-card">
                                                        <div className="initiative-additional-contact-header">
                                                            <div className="initiative-contact-number">
                                                                <FontAwesomeIcon icon={faUsers} />
                                                                {t('initiatives.create.contactNumber', { number: index + 1 })}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="initiative-remove-contact-btn"
                                                                onClick={() => {
                                                                    setValues(prev => ({
                                                                        ...prev,
                                                                        additionalContacts: prev.additionalContacts.filter((_, i) => i !== index)
                                                                    }));
                                                                }}
                                                                title={t('initiatives.create.removeContact')}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>

                                                        <div className="initiative-additional-contact-content">
                                                            <div className="initiative-additional-contact-grid">
                                                                {/* Contact Name */}
                                                                <div className="initiative-form-group-additional-contact">
                                                                    <label>
                                                                        {t('initiatives.create.contactName')}
                                                                        {/* 🔧 ПРЕМАХНАТО: <span className="required-indicator">*</span> */}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.name || ''}
                                                                        onChange={(e) => {
                                                                            const updatedContacts = [...values.additionalContacts];
                                                                            updatedContacts[index] = {
                                                                                ...updatedContacts[index],
                                                                                name: e.target.value
                                                                            };
                                                                            setValues(prev => ({ ...prev, additionalContacts: updatedContacts }));
                                                                        }}
                                                                        placeholder={t('initiatives.create.contactNamePlaceholder')}
                                                                        className={errors[`additionalContacts[${index}].name`] ? 'error' : ''}
                                                                    />
                                                                    {errors[`additionalContacts[${index}].name`] && (
                                                                        <div className="error-message">{errors[`additionalContacts[${index}].name`]}</div>
                                                                    )}
                                                                </div>

                                                                {/* Contact Position */}
                                                                <div className="initiative-form-group-additional-contact">
                                                                    <label>{t('initiatives.create.contactPosition')}</label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.position || ''}
                                                                        onChange={(e) => {
                                                                            const updatedContacts = [...values.additionalContacts];
                                                                            updatedContacts[index] = {
                                                                                ...updatedContacts[index],
                                                                                position: e.target.value
                                                                            };
                                                                            setValues(prev => ({ ...prev, additionalContacts: updatedContacts }));
                                                                        }}
                                                                        placeholder={t('initiatives.create.contactPositionPlaceholder')}
                                                                        className={errors[`additionalContacts[${index}].position`] ? 'error' : ''}
                                                                    />
                                                                    {/* 🆕 ДОБАВЕНО: Error message */}
                                                                    {errors[`additionalContacts[${index}].position`] && (
                                                                        <div className="error-message">{errors[`additionalContacts[${index}].position`]}</div>
                                                                    )}
                                                                </div>

                                                                {/* Contact Email */}
                                                                <div className="initiative-form-group-additional-contact">
                                                                    <label>
                                                                        {t('initiatives.create.contactEmail')}
                                                                        {/* 🔧 ПРЕМАХНАТО: <span className="required-indicator">*</span> */}
                                                                    </label>
                                                                    <input
                                                                        type="email"
                                                                        value={contact.email || ''}
                                                                        onChange={(e) => {
                                                                            const updatedContacts = [...values.additionalContacts];
                                                                            updatedContacts[index] = {
                                                                                ...updatedContacts[index],
                                                                                email: e.target.value
                                                                            };
                                                                            setValues(prev => ({ ...prev, additionalContacts: updatedContacts }));
                                                                        }}
                                                                        placeholder={t('initiatives.create.contactEmailPlaceholder')}
                                                                        className={errors[`additionalContacts[${index}].email`] ? 'error' : ''}
                                                                    />
                                                                    {errors[`additionalContacts[${index}].email`] && (
                                                                        <div className="error-message">{errors[`additionalContacts[${index}].email`]}</div>
                                                                    )}
                                                                </div>

                                                                {/* Contact Phone */}
                                                                <div className="initiative-form-group-additional-contact">
                                                                    <label>{t('initiatives.create.contactPhone')}</label>
                                                                    <input
                                                                        type="tel"
                                                                        value={contact.phone || ''}
                                                                        onChange={(e) => {
                                                                            const updatedContacts = [...values.additionalContacts];
                                                                            updatedContacts[index] = {
                                                                                ...updatedContacts[index],
                                                                                phone: e.target.value
                                                                            };
                                                                            setValues(prev => ({ ...prev, additionalContacts: updatedContacts }));
                                                                        }}
                                                                        placeholder={t('initiatives.create.contactPhonePlaceholder')}
                                                                        className={errors[`additionalContacts[${index}].phone`] ? 'error' : ''}
                                                                    />
                                                                    {/* 🆕 ДОБАВЕНО: Error message */}
                                                                    {errors[`additionalContacts[${index}].phone`] && (
                                                                        <div className="error-message">{errors[`additionalContacts[${index}].phone`]}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 📋 CONTACTS SUMMARY - остава същo */}
                                    {/* ... останалия код остава същия ... */}

                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 8: PROGRESS & RESULTS */}
                        {activeSection === 'progress-results' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faTrophy} />
                                        {t('initiatives.create.progressResults')}
                                    </h2>
                                </div>
                                <div className="form-section-content">

                                    {/* 📊 KPIs SECTION */}
                                    <div className="kpis-section">
                                        <div className="dynamic-section-header">
                                            <h3>📊 {t('initiatives.create.kpis')}</h3>
                                            <button
                                                type="button"
                                                className="btn-initiative accent"
                                                onClick={addKPI}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                {t('initiatives.create.addKpi')}
                                            </button>
                                        </div>

                                        {values.kpis.length === 0 ? (
                                            <div className="empty-kpis">
                                                <p>{t('initiatives.create.noKpisAdded')}</p>
                                                <button
                                                    type="button"
                                                    className="btn-initiative primary"
                                                    onClick={addKPI}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                    {t('initiatives.create.addFirstKpi')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="kpis-list">
                                                {values.kpis.map((kpi, index) => (
                                                    <div key={index} className="kpi-item">
                                                        <div className="kpi-header">
                                                            <h5>{t('initiatives.create.kpiNumber', { number: index + 1 })}</h5>
                                                            {(errors[`kpis[${index}].name`] || errors[`kpis[${index}].target`]) && (
                                                                <span className="kpi-error-indicator">⚠️</span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="remove-kpi-btn"
                                                                onClick={() => removeKPI(index)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                                {t('initiatives.create.removeKpi')}
                                                            </button>
                                                        </div>

                                                        <div className="kpi-fields">
                                                            <div className="kpi-name-field">
                                                                <label>{t('initiatives.create.kpiName')}</label>
                                                                <input
                                                                    type="text"
                                                                    value={kpi.name}
                                                                    onChange={(e) => {
                                                                        const updatedKPIs = [...values.kpis];
                                                                        updatedKPIs[index].name = e.target.value;
                                                                        setValues(prev => ({ ...prev, kpis: updatedKPIs }));
                                                                    }}
                                                                    placeholder={t('initiatives.create.kpiNamePlaceholder')}
                                                                    className={errors[`kpis[${index}].name`] ? 'error' : ''}
                                                                />
                                                                {errors[`kpis[${index}].name`] && (
                                                                    <div className="error-message">{errors[`kpis[${index}].name`]}</div>
                                                                )}
                                                            </div>

                                                            <div className="kpi-target-field">
                                                                <label>{t('initiatives.create.kpiTarget')}</label>
                                                                <input
                                                                    type="text"
                                                                    value={kpi.target}
                                                                    onChange={(e) => {
                                                                        const updatedKPIs = [...values.kpis];
                                                                        updatedKPIs[index].target = e.target.value;
                                                                        setValues(prev => ({ ...prev, kpis: updatedKPIs }));
                                                                    }}
                                                                    placeholder={t('initiatives.create.kpiTargetPlaceholder')}
                                                                    className={errors[`kpis[${index}].target`] ? 'error' : ''}
                                                                />
                                                                {errors[`kpis[${index}].target`] && (
                                                                    <div className="error-message">{errors[`kpis[${index}].target`]}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 🎯 EXPECTED RESULTS */}
                                    <div className="expected-results-section">
                                        <h3>🎯 {t('initiatives.create.expectedResults')}</h3>
                                        <div className={`slate-editor-container ${errors.expectedResults ? 'error' : ''}`}>
                                            <Slate
                                                editor={expectedResultsEditor}
                                                initialValue={values.expectedResults}
                                                onChange={handleSlateChange('expectedResults')}
                                            >
                                                {renderSlateToolbar(expectedResultsEditor)}
                                                <Editable
                                                    className="slate-editable"
                                                    placeholder={t('initiatives.create.expectedResultsPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                />
                                            </Slate>
                                        </div>
                                        <div className={`character-count slate-counter ${getSlateTextLength(values.expectedResults) > 9500 ? 'warning' :
                                            getSlateTextLength(values.expectedResults) > 9800 ? 'error' : ''
                                            }`}>
                                            {getSlateTextLength(values.expectedResults)}/10000 {t('initiatives.create.characters')}
                                        </div>
                                        {errors.expectedResults && <div className="error-message">{errors.expectedResults}</div>}
                                    </div>

                                    {/* 📈 PROGRESS REPORT */}
                                    <div className="progress-report-section">
                                        <h3>📈 {t('initiatives.create.progressReport')}</h3>
                                        <div className={`slate-editor-container ${errors.progressReport ? 'error' : ''}`}>
                                            <SlateErrorBoundary>
                                                <Slate
                                                    editor={progressReportEditor}
                                                    initialValue={values.progressReport}
                                                    onChange={handleSlateChange('progressReport')}
                                                >
                                                    {renderSlateToolbar(progressReportEditor)}
                                                    <Editable
                                                        className="slate-editable"
                                                        placeholder={t('initiatives.create.progressReportPlaceholder')}
                                                        renderElement={renderElement}
                                                        renderLeaf={renderLeaf}

                                                    />
                                                </Slate>
                                            </SlateErrorBoundary>
                                        </div>
                                        <div className={`character-count slate-counter ${getSlateTextLength(values.progressReport) > 9500 ? 'warning' :
                                            getSlateTextLength(values.progressReport) > 9800 ? 'error' : ''
                                            }`}>
                                            {getSlateTextLength(values.progressReport)}/2500 {t('initiatives.create.characters')}
                                        </div>
                                        {errors.progressReport && <div className="error-message">{errors.progressReport}</div>}
                                    </div>

                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 9: ADDITIONAL INFO */}
                        {activeSection === 'additional' && (
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <h2 className="form-section-title">
                                        <FontAwesomeIcon icon={faTag} />
                                        {t('initiatives.create.additional')}
                                    </h2>
                                </div>
                                <div className="form-section-content">

                                    {/* 🏷️ TAGS SECTION */}
                                    <div className="tags-section">
                                        <h3>🏷️ {t('initiatives.create.tags')}</h3>
                                        <div className="field-help section-help">
                                            {t('initiatives.create.tags-help')}
                                        </div>
                                        <div className="tag-input-container">
                                            <input
                                                type="text"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (newTag.trim()) {
                                                            addTag(newTag.trim());
                                                            setNewTag('');
                                                        }
                                                    }
                                                }}
                                                placeholder={t('initiatives.create.tagPlaceholder')}
                                                className="tag-input"
                                            />
                                            <button
                                                type="button"
                                                className="add-tag-btn"
                                                onClick={() => {
                                                    if (newTag.trim()) {
                                                        addTag(newTag.trim());
                                                        setNewTag('');
                                                    }
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                {t('initiatives.create.addTag')}
                                            </button>
                                        </div>

                                        {values.tags.length > 0 && (
                                            <div className="tags-display">
                                                <div className="tags-list">
                                                    {values.tags.map((tag, index) => (
                                                        <div key={index} className="tag-item">
                                                            <span className="tag-text">{tag}</span>
                                                            <button
                                                                type="button"
                                                                className="remove-tag-btn"
                                                                onClick={() => removeTag(index)}
                                                                title={t('initiatives.create.removeTag')}
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>
                                        )}
                                        <div className="tags-info">
                                            <small>  {t('initiatives.create.tagsCount', { count: values.tags.length })}
                                                {values.tags.length >= 18 && (
                                                    <span className="tags-warning"> - {t('initiatives.create.close-to-limit')} (20)</span>
                                                )}</small>
                                        </div>
                                    </div>

                                    {/* 🔗 RELATED INITIATIVES */}
                                    <div className="related-initiatives-section">
                                        <h3>🔗 {t('initiatives.create.relatedInitiatives')}</h3>
                                        <p className="section-description">
                                            {t('initiatives.create.relatedInitiativesDescription')}
                                        </p>
                                        <div className="field-help section-help">
                                            {t('initiatives.create.related-initiatives-help')}
                                        </div>
                                        <div className="related-input-container">
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSearchInitiatives();
                                                    }
                                                }}
                                                placeholder={t('initiatives.create.searchInitiatives')}
                                                className="related-search-input"
                                            />
                                            <button
                                                type="button"
                                                className="search-initiatives-btn"
                                                onClick={handleSearchInitiatives}
                                                disabled={isSearching}
                                            >
                                                <FontAwesomeIcon icon={faSearch} />
                                                {isSearching ? t('initiatives.create.searching') : t('initiatives.create.search')}
                                            </button>
                                        </div>

                                        {/* 🆕 SEARCH RESULTS */}
                                        {searchResults.length > 0 && (
                                            <div className="search-results">
                                                <h5>{t('initiatives.create.searchResults', { count: searchResults.length })}</h5>
                                                <div className="search-results-list">
                                                    {searchResults.map((initiative) => (
                                                        <div key={initiative.id} className="search-result-item">
                                                            <div className="search-result-info">
                                                                <div className="search-result-title">{initiative.title}</div>
                                                                <div className="search-result-category">{initiative.category}</div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="add-related-btn"
                                                                onClick={() => {
                                                                    // Добавяме в related initiatives
                                                                    if (!values.relatedInitiatives.includes(initiative.id)) {
                                                                        setValues(prev => ({
                                                                            ...prev,
                                                                            relatedInitiatives: [...prev.relatedInitiatives, initiative.id]
                                                                        }));
                                                                        notify('success', t('initiatives.create.initiativeAdded', { title: initiative.title }));
                                                                    } else {
                                                                        notify('warning', t('initiatives.create.initiativeAlreadyAdded'));
                                                                    }
                                                                }}
                                                                disabled={values.relatedInitiatives.includes(initiative.id)}
                                                            >
                                                                {values.relatedInitiatives.includes(initiative.id) ?
                                                                    t('initiatives.create.added') :
                                                                    t('initiatives.create.add')
                                                                }
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* SELECTED RELATED INITIATIVES */}
                                        {values.relatedInitiatives.length > 0 && (
                                            <div className="related-initiatives-list">
                                                <h5>{t('initiatives.create.selectedRelatedInitiatives', { count: values.relatedInitiatives.length })}</h5>
                                                {values.relatedInitiatives.map((initiativeId, index) => {
                                                    // Намираме инициативата по ID
                                                    const initiative = searchResults.find(init => init.id === initiativeId) ||
                                                        { id: initiativeId, title: `Initiative #${initiativeId}` };

                                                    return (
                                                        <div key={index} className="related-initiative-item">
                                                            <span>{initiative.title}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setValues(prev => ({
                                                                        ...prev,
                                                                        relatedInitiatives: prev.relatedInitiatives.filter((_, i) => i !== index)
                                                                    }));
                                                                }}
                                                                title={t('initiatives.create.removeRelated')}
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* ❓ FAQ SECTION */}
                                    <div className="faq-section">
                                        <div className="dynamic-section-header">
                                            <h3>❓ {t('initiatives.create.faq')}</h3>
                                            <button
                                                type="button"
                                                className="btn-initiative accent"
                                                onClick={addFAQ}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                {t('initiatives.create.addFAQ')}
                                            </button>
                                        </div>
                                        <div className="field-help section-help">
                                            {t('initiatives.create.faq-help')}
                                        </div>

                                        {values.faq.length === 0 ? (
                                            <div className="empty-faq">
                                                <div className="empty-state">
                                                    <FontAwesomeIcon icon={faQuestionCircle} className="empty-icon" />
                                                    <p>{t('initiatives.create.noFAQAdded')}</p>
                                                    <p className="empty-description">{t('initiatives.create.faqDescription')}</p>
                                                    <button
                                                        type="button"
                                                        className="btn-initiative primary"
                                                        onClick={addFAQ}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                        {t('initiatives.create.addFirstFAQ')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="faq-list">
                                                {values.faq.map((faqItem, index) => (
                                                    <div key={index} className="faq-item">
                                                        <div className="faq-header">
                                                            <h5>{t('initiatives.create.faqNumber', { number: index + 1 })}
                                                                {/* 🆕 Error indicator */}
                                                                {(errors[`faq[${index}].question`] || errors[`faq[${index}].answer`]) && (
                                                                    <span className="faq-error-indicator">⚠️</span>
                                                                )}
                                                            </h5>
                                                            <button
                                                                type="button"
                                                                className="remove-faq-btn"
                                                                onClick={() => removeFAQ(index)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                                {t('initiatives.create.removeFAQ')}
                                                            </button>
                                                        </div>

                                                        <div className="faq-fields">
                                                            <div className="faq-question-field">
                                                                <label>{t('initiatives.create.question')}</label>
                                                                <div className="field-help">
                                                                    {t('initiatives.create.faq-question-help')}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={faqItem.question}
                                                                    onChange={(e) => {
                                                                        const updatedFAQ = [...values.faq];
                                                                        updatedFAQ[index].question = e.target.value;
                                                                        setValues(prev => ({ ...prev, faq: updatedFAQ }));
                                                                    }}
                                                                    placeholder={t('initiatives.create.questionPlaceholder')}
                                                                    maxLength={200}
                                                                />
                                                                <div className="character-count">
                                                                    {faqItem.question?.length || 0}/200
                                                                    {faqItem.question?.length > 180 && (
                                                                        <span className="warning"> - {t('initiatives.create.close-to-limit')}</span>
                                                                    )}
                                                                </div>
                                                                {errors[`faq[${index}].question`] && (
                                                                    <div className="error-message">{errors[`faq[${index}].question`]}</div>
                                                                )}
                                                            </div>

                                                            <div className="faq-answer-field">
                                                                <label>{t('initiatives.create.answer')}</label>
                                                                <div className="field-help">
                                                                    {t('initiatives.create.faq-answer-help')}
                                                                </div>
                                                                <textarea
                                                                    value={faqItem.answer}
                                                                    onChange={(e) => {
                                                                        const updatedFAQ = [...values.faq];
                                                                        updatedFAQ[index].answer = e.target.value;
                                                                        setValues(prev => ({ ...prev, faq: updatedFAQ }));
                                                                    }}
                                                                    placeholder={t('initiatives.create.answerPlaceholder')}
                                                                    rows={3}
                                                                    onPaste={(e) => handleCleanPaste(e, (newValue) => {
                                                                        const updatedFAQ = [...values.faq];
                                                                        updatedFAQ[index].answer = newValue;
                                                                        setValues(prev => ({ ...prev, faq: updatedFAQ }));
                                                                    }, faqItem.answer || '', 5000)}
                                                                    maxLength={5000}
                                                                />

                                                                <div className="character-count">
                                                                    {faqItem.answer?.length || 0}/5000
                                                                    {faqItem.answer?.length > 4800 && (
                                                                        <span className="warning"> - {t('initiatives.create.close-to-limit')}</span>
                                                                    )}
                                                                </div>
                                                                {errors[`faq[${index}].question`] && (
                                                                    <div className="error-message">{errors[`faq[${index}].question`]}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        )}
                        {/* Navigation buttons */}
                        <div className="form-navigation">
                            <button
                                type="button"
                                className="btn-initiative secondary"
                                onClick={() => {
                                    const currentIndex = navigationSections.findIndex(s => s.id === activeSection);
                                    if (currentIndex > 0) {
                                        setActiveSection(navigationSections[currentIndex - 1].id);
                                    }
                                }}
                                disabled={navigationSections.findIndex(s => s.id === activeSection) === 0}
                            >
                                {t('initiatives.create.previous')}
                            </button>

                            <button
                                type="button"
                                className="btn-initiative primary"
                                onClick={() => {
                                    const currentIndex = navigationSections.findIndex(s => s.id === activeSection);
                                    if (currentIndex < navigationSections.length - 1) {
                                        setActiveSection(navigationSections[currentIndex + 1].id);
                                    }
                                }}
                                disabled={navigationSections.findIndex(s => s.id === activeSection) === navigationSections.length - 1}
                            >
                                {t('initiatives.create.next')}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/*  Floating Actions */}
            <div className="floating-actions">
                {draftId && (
                    <button
                        type="button"
                        className="floating-btn new-draft"
                        onClick={handleStartNewDraft}
                        title="Започни нова чернова"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                )}
                <button
                    type="button"
                    className="floating-btn draft"
                    onClick={saveDraft}
                    title={t('initiatives.create.saveDraft')}
                >
                    <FontAwesomeIcon icon={faSave} />
                </button>
                <button
                    type="button"
                    className="floating-btn preview"
                    onClick={handlePreview}
                    title={t('initiatives.create.preview')}
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>
                {draftId ? (
                    // Ако редактираме draft, показваме бутон за публикуване
                    <button
                        type="button"
                        className="floating-btn publish"
                        onClick={async () => {
                            try {
                                await publishDraft();
                            } catch (error) {
                                console.error('Error publishing:', error);
                            }
                        }}
                        title="Публикувай инициативата"
                    >
                        <FontAwesomeIcon icon={faShare} />
                    </button>
                ) : (
                    // Ако създаваме нова, показваме стандартния бутон
                    <button
                        type="button"
                        className="floating-btn create"
                        onClick={onSubmit}
                        title="Създай инициатива"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                )}
            </div>

            {/* 📜 Scroll to Top */}
            <ScrollToTop />
        </div>
    );
};

export default InitiativeCreateForm;