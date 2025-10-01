/* eslint-disable no-unused-vars */
// components/Projects/ProjectCreateForm/ProjectCreateForm.jsx
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
    faShare, faPhone, faEnvelope, faUser, faFileAlt,
    faCheckCircle, faSearch, faCheck, faCommentDots,
    faProjectDiagram, faCalendarAlt, faUserCheck, faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// 🎨 Styles
import './projectCreateForm.css';

// 🎯 Slate.js imports
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate';

// 🔧 Hooks and utilities
import useCreateProject from '../../hooks/useCreateProject.js';

// 🎨 Components
import ScrollToTop from '../../ScrollToTop/ScrollToTop.jsx';
import { LocationPicker } from '../../Initiatives/CreateIniciative/LocationMarker/LocationMarker';
import SectionImageItem from '../../Initiatives/CreateIniciative/SectionImageItem/SectionImageItem';
import MainImagePreview from '../../Initiatives/CreateIniciative/MainImagePreview/MainImagePreview';
import MainImageGalleryItem from '../../Initiatives/CreateIniciative/MainImageGalleryItem/MainImageGalleryItem';
import { LocalStorageStatus } from '../../Initiatives/CreateIniciative/LocalStorageStatus/LocalStorageStatus';

import { notify } from '../../../utils/notify.jsx';
import { createSlateEditor } from '../../Initiatives/CreateIniciative/Utils/initiativeEditorUtils.jsx';
import { useInitiativeContext } from '../../contexts/InitiativeProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { handleCleanPaste } from '../../../utils/textPasteUtils.js';
import { calculateProjectProgress, getProjectProgressBreakdown } from './utils/projectProgressUtils.js';
import { getSlateTextLength } from '../../Initiatives/CreateIniciative/Utils/slateUtils.js';
import BudgetTimelineSection from './BudgetTimelineSection/BudgetTimelineSection.jsx';
import ApplicationSection from './ApplicationSection/ApplicationSection.jsx';
import SectionsSection from './SectionsSection/SectionsSection.jsx';
import TeamSection from './TeamSection/TeamSection.jsx';
import PartnersSponsorsSection from './PartnersSponsorsSection/PartnersSponsorsSection.jsx';
import MediaSection from './MediaSection/MediaSection.jsx';
import ContactSection from './ContactSection/ContactSection.jsx';

const ProjectCreateForm = ({ initialValues, onSubmitHandler, isEditMode = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { getAllInitiatives, initiatives } = useInitiativeContext();

    // 🎯 Hook
    const {
        values,
        errors,
        isLoading,
        handleStartNewProject,
        isUploading,
        uploadProgress,
        setValues,
        onChangeHandler,
        onBlurHandler,
        onSubmit,
        validateForm,
        saveDraft,
        publishDraft,
        draftId,
        editId,        // 🔧 ДОБАВЯМЕ editId
        setEditId,
        saveToLocalStorage,
        loadFromLocalStorage,
        clearLocalStorage,
        hasLocalStorageDraft,
        localStorageTimestamp,
        handleSectionImageUpload,
        addSectionImageFromUrl,
        removeSectionImage,
        updateSectionImageAlt,
        updateSectionImageCaption,
        clearSectionImages,
        // Section management
        addSection,
        removeSection,
        updateSection,
        // Team management
        addTeamMember,
        removeTeamMember,
        updateTeamMember,
        handleTeamImageUpload,
        removeTeamImage,
        handlePartnerImageUpload,     // 🆕
        removePartnerImage,           // 🆕
        handleSponsorImageUpload,     // 🆕
        removeSponsorImage,
        // Other management functions
        addMilestone,
        removeMilestone,
        addPartner,
        removePartner,
        addSponsor,
        removeSponsor,
        addRequirement,
        removeRequirement,
        addTag,
        removeTag,
        // Timeline functions 
        calculateDuration,
        formatDate,
        // Image handlers
        handleMainImageUpload,
        removeMainImage,
        handleSetMainImage,
        handleRemoveGalleryImage,
        // Gallery management
        handleGalleryUpload,      // 🆕
        removeGalleryImage,       // 🆕
        handleDocumentUpload,     // 🆕
        removeDocument,           // 🆕
        handleLogoUpload,         // 🆕
        removeLogo,               // 🆕
        clearAllGallery,          // 🆕
        clearAllDocuments,
        //Contact
        handleContactImageUpload,
        removeContactImage,
        // Utils
        generateSlug,
        availableInitiatives,
        handleEditorChange
    } = useCreateProject(initialValues, onSubmitHandler);

    // 🎯 Local state
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [showLocalStoragePrompt, setShowLocalStoragePrompt] = useState(false);
    const [localStorageChecked, setLocalStorageChecked] = useState(false);

    // 🎨 Slate editors
    const fullDescriptionEditor = useMemo(() => createSlateEditor(), []);
    const sectionEditorsRef = useRef({});

    const getSectionEditor = (index) => {
        if (!sectionEditorsRef.current[index]) {
            sectionEditorsRef.current[index] = createSlateEditor();
        }
        return sectionEditorsRef.current[index];
    };

    // 📂 Check for localStorage draft on mount
    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            setLocalStorageChecked(true);
            return;
        }

        if (localStorageChecked) return;

        const savedDraft = loadFromLocalStorage();
        if (savedDraft) {
            setValues(prev => ({
                ...prev,
                ...savedDraft.data
            }));

            if (savedDraft.data?.draftId) {
                // setDraftId is already handled in the hook
            }

            setShowLocalStoragePrompt(true);
            setTimeout(() => {
                t('projects.create.draftRestoredFrom', { date: savedDraft.timestamp.toLocaleString('bg-BG') })
            }, 500);
        }

        setLocalStorageChecked(true);
    }, [initialValues, loadFromLocalStorage, setValues, localStorageChecked]);

    // 🎯 Handle Slate.js changes
    const handleSlateChange = useCallback((fieldName) => (value) => {
        handleEditorChange(fieldName, value);
    }, [handleEditorChange]);

    // 🔧 Handle Slate change for sections
    const handleSectionSlateChange = (sectionIndex) => (value) => {
        updateSection(sectionIndex, 'content', value);
    };

    // 🎯 Slate.js toolbar functions
    const toggleMark = (editor, format) => {
        const isActive = isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    };

    const toggleBlock = (editor, format) => {
        try {
            const isActive = isBlockActive(editor, format);
            const isList = ['numbered-list', 'bulleted-list'].includes(format);

            // Премахваме списъци ако превключваме към друг формат
            Transforms.unwrapNodes(editor, {
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) &&
                    ['numbered-list', 'bulleted-list'].includes(n.type),
                split: true,
            });

            const newProperties = {
                type: isActive ? 'paragraph' : isList ? 'list-item' : format,
            };

            Transforms.setNodes(editor, newProperties);

            // Ако е списък, обвиваме в съответния wrapper
            if (!isActive && isList) {
                const block = { type: format, children: [] };
                Transforms.wrapNodes(editor, block);
            }
        } catch (error) {
            console.error('❌ Error toggling block:', error);
        }
    };

    const isMarkActive = (editor, format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    };

    const isBlockActive = (editor, format) => {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
            })
        );

        return !!match;
    };

    // 🎯 Render Slate toolbar
    const renderSlateToolbar = (editor) => (
        <div className="project-slate-toolbar">
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
                className={`project-slate-btn ${isMarkActive(editor, 'bold') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faBold} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
                className={`project-slate-btn ${isMarkActive(editor, 'italic') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faItalic} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
                className={`project-slate-btn ${isMarkActive(editor, 'underline') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faUnderline} />
            </button>
            <div className="project-toolbar-divider"></div>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-one');
                }}
                className={`project-slate-btn ${isBlockActive(editor, 'heading-one') ? 'active' : ''}`}
            >
                H1
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-two');
                }}
                className={`project-slate-btn ${isBlockActive(editor, 'heading-two') ? 'active' : ''}`}
            >
                H2
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'bulleted-list');
                }}
                className={`project-slate-btn ${isBlockActive(editor, 'bulleted-list') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faListUl} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'numbered-list');
                }}
                className={`project-slate-btn ${isBlockActive(editor, 'numbered-list') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faListOl} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'block-quote');
                }}
                className={`project-slate-btn ${isBlockActive(editor, 'block-quote') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faQuoteLeft} />
            </button>
        </div>
    );

    // 🎯 Render Slate element
    // В ProjectCreateForm.jsx - замени renderElement функцията
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
        { id: 'basic-info', label: t('projects.create.basicInfo'), icon: faInfoCircle },
        { id: 'initiative-link', label: t('projects.create.initiativeLink'), icon: faProjectDiagram },
        { id: 'budget-timeline', label: t('projects.create.budgetTimeline'), icon: faDollarSign }, // 🆕
        { id: 'application', label: t('projects.create.application'), icon: faUserCheck },
        { id: 'sections', label: t('projects.create.sections'), icon: faEdit },
        { id: 'team', label: t('projects.create.team'), icon: faUsers },
        { id: 'partners-sponsors', label: t('projects.create.partnersSponsors'), icon: faHandshake },
        { id: 'media', label: t('projects.create.media'), icon: faImage },
        { id: 'contact', label: t('projects.create.contact'), icon: faAddressCard }
    ];

    // 📊 Calculate form progress
    const calculateProgress = () => calculateProjectProgress(values);

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

    // Handle initiative selection
    const handleInitiativeSelect = (e) => {
        const selectedId = e.target.value;
        onChangeHandler(e);

        // Find selected initiative and set slug
        const selectedInitiative = availableInitiatives.find(init =>
            init.id === parseInt(selectedId) || init.id === selectedId
        );

        if (selectedInitiative) {
            setValues(prev => ({
                ...prev,
                initiativeId: selectedId,
                initiativeSlug: selectedInitiative.slug
            }));
        } else {
            setValues(prev => ({
                ...prev,
                initiativeId: '',
                initiativeSlug: ''
            }));
        }
    };

    // LocalStorage functions
    const handleLoadDraft = () => {
        const savedDraft = loadFromLocalStorage();
        if (savedDraft) {
            setValues(prev => ({
                ...prev,
                ...savedDraft.data
            }));
            setShowLocalStoragePrompt(false);
            notify('success', t('projects.create.draftLoadedSuccessfully'));
        }
    };

    const handleClearDraft = async () => {
        const confirmed = window.confirm(
            t('projects.create.confirmDeleteDraft')
        );

        if (confirmed) {
            clearLocalStorage();
            setShowLocalStoragePrompt(false);
            navigate('/profile/project-create');
        }
    };

    const handleIgnorePrompt = () => {
        setShowLocalStoragePrompt(false);
    };

    const handlePreview = () => {
  if (!values.title?.trim()) {
    notify('warning', t('projects.create.enterTitleForPreview'));
    return;
  }

  // 🔧 ЗАПАЗВАМЕ В localStorage ПРЕДИ PREVIEW
  saveToLocalStorage(values);

  navigate('/profile/project-preview', {
    state: { 
      previewData: {
        ...values,
        draftId: draftId,
        editId: editId
      }
    }
  });
};
    return (
        <div className="project-create-container">
            {/* 🎯 Header */}
            <div className="project-form-header">
                <h1 className="project-form-title">
                    {isEditMode ? t('projects.create.editTitle') : t('projects.create.newTitle')}
                </h1>
                <p className="project-form-subtitle">
                    {t('projects.create.subtitle')}
                </p>
            </div>

            {/* 💾 LocalStorage Status */}
            {showLocalStoragePrompt && (
                <LocalStorageStatus
                    hasLocalStorageDraft={hasLocalStorageDraft}
                    localStorageTimestamp={localStorageTimestamp}
                    onStartNew={() => { }}
                    onClearDraft={handleClearDraft}
                    onLoadDraft={handleLoadDraft}
                    onIgnore={handleIgnorePrompt}
                    autoLoaded={true}
                />
            )}

            {/* 📊 Progress Bar */}
            <div className="project-form-progress-container">
                <div className="project-progress-header">
                    <h3>{t('projects.create.formProgress')}</h3>
                    <span className="project-progress-percentage">{calculateProgress()}% {t('projects.create.completed')}</span>
                </div>

                <div className="project-progress-bar">
                    <div
                        className="project-form-progress-fill"
                        style={{ width: `${calculateProgress()}%` }}
                    ></div>
                </div>

                {/* Section breakdown */}
                <div className="project-progress-sections">
                    {(() => {
                        const breakdown = getProjectProgressBreakdown(values);
                        return (
                            <>
                                <div className={`project-progress-section ${breakdown.basicInfo ? 'complete' : 'incomplete'}`}>
                                    ✅ {t('projects.create.basicInfoProgress')}
                                </div>
                                <div className={`project-progress-section ${breakdown.budget ? 'complete' : 'incomplete'}`}>
                                    💰 {t('projects.create.budgetProgress')}
                                </div>
                                <div className={`project-progress-section ${breakdown.application ? 'complete' : 'incomplete'}`}>
                                    📝 {t('projects.create.applicationProgress')}
                                </div>
                                <div className={`project-progress-section ${breakdown.sections ? 'complete' : 'incomplete'}`}>
                                    📄 {t('projects.create.sectionsProgress')}
                                </div>
                                <div className={`project-progress-section ${breakdown.team ? 'complete' : 'incomplete'}`}>
                                    👥 {t('projects.create.teamProgress')}
                                </div>
                                <div className={`project-progress-section ${breakdown.media ? 'complete' : 'incomplete'}`}>
                                    🖼️ {t('projects.create.mediaProgress')}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* 🏗️ Layout */}
            <div className="project-form-layout">
                {/* 🧭 Sidebar Navigation */}
                <div className="project-form-sidebar">
                    <nav className="project-sidebar-nav">
                        {navigationSections.map((section) => (
                            <a key={section.id}
                                href={`#${section.id}`}
                                className={`project-sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
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
                <div className="project-form-content">
                    <form onSubmit={onSubmit}>

                        {/* 🎯 SECTION 1: BASIC INFO */}
                        {activeSection === 'basic-info' && (
                            <div className="project-form-section-card">
                                <div className="project-form-section-header">
                                    <h2 className="project-form-section-title">
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        {t('projects.create.basicInfo')}
                                    </h2>
                                </div>
                                <div className="project-form-section-content">

                                    {/* Title */}
                                    <div className="project-form-group">
                                        <label htmlFor="title">
                                            {t('projects.create.title')}
                                            <span className="project-required-indicator">*</span>
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
                                            placeholder={t('projects.create.titlePlaceholder')}
                                        />
                                        {errors.title && <div className="project-error-message">{errors.title}</div>}
                                    </div>

                                    {/* Slug */}
                                    <div className="project-form-group">
                                        <label htmlFor="slug">
                                            {t('projects.create.slug')}
                                            <span className="project-required-indicator">*</span>
                                        </label>
                                        <div className="project-slug-input-group">
                                            <input
                                                type="text"
                                                id="slug"
                                                name="slug"
                                                value={values.slug}
                                                onChange={onChangeHandler}
                                                onBlur={onBlurHandler}
                                                className={errors.slug ? 'error' : ''}
                                                placeholder={t('projects.create.slugPlaceholder')}
                                            />
                                            <button
                                                type="button"
                                                className="project-btn-generate-slug"
                                                onClick={() => {
                                                    const newSlug = generateSlug(values.title);
                                                    setValues(prev => ({ ...prev, slug: newSlug }));
                                                }}
                                                disabled={!values.title}
                                            >
                                                {t('projects.create.generate')}
                                            </button>
                                        </div>
                                        <div className="project-field-help">
                                            {t('projects.create.slug-help')}
                                        </div>
                                        {errors.slug && <div className="project-error-message">{errors.slug}</div>}
                                    </div>

                                    {/* Short Description */}
                                    <div className="project-form-group">
                                        <label htmlFor="shortDescription">
                                            {t('projects.create.shortDescription')}
                                        </label>
                                        <textarea
                                            id="shortDescription"
                                            name="shortDescription"
                                            value={values.shortDescription}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors.shortDescription ? 'error' : ''}
                                            placeholder={t('projects.create.shortDescriptionPlaceholder')}
                                            rows={3}
                                            onPaste={(e) => handleCleanPaste(e, (newValue) => {
                                                setValues(prev => ({ ...prev, shortDescription: newValue }));
                                            }, values.shortDescription, 500)}
                                        />
                                        <div className="project-field-help">
                                            {t('projects.create.short-description-help')}
                                        </div>
                                        {errors.shortDescription && <div className="project-error-message">{errors.shortDescription}</div>}
                                    </div>

                                    {/* Full Description (Slate.js) */}
                                    <div className="project-form-group">
                                        <label>
                                            {t('projects.create.fullDescription')}
                                        </label>
                                        <div className="project-field-help project-editor-help">
                                            {t('projects.create.full-description-help')}
                                        </div>
                                        <div className={`project-slate-editor-container ${errors.fullDescription ? 'error' : ''}`}>
                                            <Slate
                                                key={`full-desc-${values.title || 'empty'}`}
                                                editor={fullDescriptionEditor}
                                                initialValue={values.fullDescription}
                                                onChange={handleSlateChange('fullDescription')}
                                            >
                                                {renderSlateToolbar(fullDescriptionEditor)}
                                                <Editable
                                                    className="project-slate-editable"
                                                    placeholder={t('projects.create.fullDescriptionPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                />
                                            </Slate>
                                        </div>
                                        <div className={`project-character-count project-slate-counter ${getSlateTextLength(values.fullDescription) > 49500 ? 'warning' :
                                            getSlateTextLength(values.fullDescription) > 49800 ? 'error' : ''
                                            }`}>
                                            {getSlateTextLength(values.fullDescription)}/50000 {t('projects.create.characters')}
                                        </div>
                                        {errors.fullDescription && <div className="project-error-message">{errors.fullDescription}</div>}
                                    </div>

                                    {/* Main Image Upload */}
                                    <div className="project-form-group">
                                        <label>
                                            {t('projects.create.mainImage')}
                                            <span className="project-required-indicator">*</span>
                                        </label>
                                        <div className="project-image-upload-section">
                                            <div className="project-upload-methods">
                                                <div className="project-upload-method">
                                                    <label className="project-upload-btn">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                        {t('projects.create.uploadImages')}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleMainImageUpload}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>

                                                <div className="project-upload-method">
                                                    <button
                                                        type="button"
                                                        className="project-upload-btn"
                                                        onClick={() => setShowUrlInput(!showUrlInput)}
                                                    >
                                                        <FontAwesomeIcon icon={faLink} />
                                                        {t('projects.create.addUrl')}
                                                    </button>
                                                </div>
                                            </div>

                                            {showUrlInput && (
                                                <div className="project-url-input-section">
                                                    <input
                                                        type="url"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={mainImageUrl}
                                                        onChange={(e) => setMainImageUrl(e.target.value)}
                                                    />
                                                    <button type="button" onClick={handleMainImageUrl}>
                                                        {t('projects.create.add')}
                                                    </button>
                                                </div>
                                            )}

                                            {values.mainImage?.src && (
                                                <div className="project-create-images-preview">
                                                    <MainImagePreview
                                                        mainImage={values.mainImage}
                                                        onAltChange={(value) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                mainImage: {
                                                                    ...prev.mainImage,
                                                                    alt: value
                                                                }
                                                            }));
                                                        }}
                                                        onCaptionChange={(value) => {
                                                            setValues(prev => ({
                                                                ...prev,
                                                                mainImage: {
                                                                    ...prev.mainImage,
                                                                    caption: value
                                                                }
                                                            }));
                                                        }}
                                                        onRemove={removeMainImage}
                                                    />
                                                </div>
                                            )}
                                            {errors.mainImage && <div className="project-error-message">{errors.mainImage}</div>}
                                        </div>
                                    </div>

                                    {/* Location Map */}
                                    <div className="project-form-group">
                                        <label>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                            {t('projects.create.location')}
                                        </label>
                                        <LocationPicker
                                            key={`location-${values.location?.[0]?.coordinates?.lat || 'empty'}-${values.location?.[0]?.coordinates?.lng || 'empty'}`}
                                            initialPosition={
                                                values.location?.[0]?.coordinates?.lat != null && values.location?.[0]?.coordinates?.lng != null
                                                    ? {
                                                        lat: values.location[0].coordinates.lat,
                                                        lng: values.location[0].coordinates.lng
                                                    }
                                                    : undefined  // ВАЖНО: undefined вместо null
                                            }
                                            initialAddress={values.location?.[0]?.address || ''}
                                            onLocationChange={(locationData) => {
                                                console.log('📍 Location changed:', locationData);
                                                setValues(prev => ({
                                                    ...prev,
                                                    location: [{
                                                        address: locationData.address || '',
                                                        coordinates: {
                                                            lat: locationData.lat || null,
                                                            lng: locationData.lng || null
                                                        }
                                                    }]
                                                }));
                                            }}
                                        />
                                        <div className="project-field-help">
                                            {t('projects.create.location-help')}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="project-form-group">
                                        <label htmlFor="category">
                                            {t('projects.create.category')}
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={values.category}
                                            onChange={onChangeHandler}
                                        >
                                            <option value="">{t('projects.create.selectCategory')}</option>
                                            <option value="Дигитализация">{t('projects.categories.digitalization')}</option>
                                            <option value="Образование">{t('projects.categories.education')}</option>
                                            <option value="Здравеопазване">{t('projects.categories.healthcare')}</option>
                                            <option value="Околна среда">{t('projects.categories.environment')}</option>
                                            <option value="Социални дейности">{t('projects.categories.social')}</option>
                                            <option value="Култура">{t('projects.categories.culture')}</option>
                                            <option value="Спорт">{t('projects.categories.sports')}</option>
                                        </select>
                                    </div>

                                    {/* Status and Priority */}
                                    <div className="project-form-row">
                                        <div className="project-form-group">
                                            <label htmlFor="status">
                                                {t('projects.create.status')}
                                            </label>
                                            <select
                                                id="status"
                                                name="status"
                                                value={values.status}
                                                onChange={onChangeHandler}
                                            >
                                                <option value="planned">{t('projects.status.planned')}</option>
                                                <option value="active">{t('projects.status.active')}</option>
                                                <option value="in-progress">{t('projects.status.inProgress')}</option>
                                                <option value="completed">{t('projects.status.completed')}</option>
                                            </select>
                                        </div>

                                        <div className="project-form-group">
                                            <label htmlFor="priority">
                                                {t('projects.create.priority')}
                                            </label>
                                            <select
                                                id="priority"
                                                name="priority"
                                                value={values.priority}
                                                onChange={onChangeHandler}
                                            >
                                                <option value="low">{t('projects.priority.low')}</option>
                                                <option value="medium">{t('projects.priority.medium')}</option>
                                                <option value="high">{t('projects.priority.high')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Comments Enabled */}
                                    <div className="project-form-group">
                                        <div className="project-comments-enabled-section">
                                            <div className="project-comments-enabled-header">
                                                <label className="project-comments-enabled-label">
                                                    <FontAwesomeIcon icon={faCommentDots} />
                                                    {t('projects.create.commentsEnabled')}
                                                </label>
                                                <div className="project-comments-enabled-description">
                                                    {t('projects.create.commentsEnabledDescription')}
                                                </div>
                                            </div>

                                            <div className="project-comments-toggle-container">
                                                <label className="project-comments-toggle">
                                                    <input
                                                        type="checkbox"
                                                        name="commentsEnabled"
                                                        checked={values.commentsEnabled}
                                                        onChange={onChangeHandler}
                                                        className="project-comments-toggle-input"
                                                    />
                                                    <span className="project-comments-toggle-slider">
                                                        <span className="project-comments-toggle-thumb">
                                                            <FontAwesomeIcon
                                                                icon={values.commentsEnabled ? faCheck : faTimes}
                                                                className="project-comments-toggle-icon"
                                                            />
                                                        </span>
                                                    </span>
                                                    <span className="project-comments-toggle-text">
                                                        {values.commentsEnabled
                                                            ? t('projects.create.commentsAllowed')
                                                            : t('projects.create.commentsDisabled')
                                                        }
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* 🎯 SECTION 2: INITIATIVE LINK */}
                        {activeSection === 'initiative-link' && (
                            <div className="project-form-section-card">
                                <div className="project-form-section-header">
                                    <h2 className="project-form-section-title">
                                        <FontAwesomeIcon icon={faProjectDiagram} />
                                        {t('projects.create.initiativeLink')}
                                    </h2>
                                </div>
                                <div className="project-form-section-content">

                                    <div className="project-form-group">
                                        <label htmlFor="initiativeId">
                                            {t('projects.create.selectInitiative')}
                                        </label>
                                        <div className="project-field-help">
                                            {t('projects.create.initiative-help')}
                                        </div>
                                        <select
                                            id="initiativeId"
                                            name="initiativeId"
                                            value={values.initiativeId}
                                            onChange={handleInitiativeSelect}
                                            className="project-initiative-select"
                                        >
                                            <option value="">{t('projects.create.standaloneProject')}</option>
                                            {availableInitiatives.map(initiative => (
                                                <option key={initiative.id} value={initiative.id}>
                                                    {initiative.title}
                                                </option>
                                            ))}
                                        </select>

                                        {values.initiativeId && (
                                            <div className="project-selected-initiative-info">
                                                <p className="project-initiative-info-label">
                                                    {t('projects.create.selectedInitiative')}:
                                                </p>
                                                {(() => {
                                                    const selected = availableInitiatives.find(i =>
                                                        i.id === parseInt(values.initiativeId) || i.id === values.initiativeId
                                                    );
                                                    return selected ? (
                                                        <div className="project-initiative-preview-card">
                                                            <h4>{selected.title}</h4>
                                                            <p>{selected.shortDescription}</p>
                                                            <Link
                                                                to={`/initiatives/${selected.slug}`}
                                                                target="_blank"
                                                                className="project-view-initiative-link"
                                                            >
                                                                {t('projects.create.viewInitiative')} →
                                                            </Link>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 3: Budget */}
                        {activeSection === 'budget-timeline' && (
                            <BudgetTimelineSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
                                addMilestone={addMilestone}
                                removeMilestone={removeMilestone}
                                calculateDuration={calculateDuration}
                                formatDate={formatDate}
                            />
                        )}

                        {/* 🎯 SECTION 4: Application */}
                        {activeSection === 'application' && (
                            <ApplicationSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
                                addRequirement={addRequirement}
                                removeRequirement={removeRequirement}
                            />
                        )}
                        {/* 🎯 SECTION 5: Sections */}

                        {activeSection === 'sections' && (
                            <SectionsSection
                                values={values}
                                errors={errors}
                                setValues={setValues}
                                addSection={addSection}
                                removeSection={removeSection}
                                updateSection={updateSection}
                                Transforms={Transforms}
                                Editor={Editor}
                                SlateElement={SlateElement}
                                handleSectionImageUpload={handleSectionImageUpload}
                                addSectionImageFromUrl={addSectionImageFromUrl}
                                removeSectionImage={removeSectionImage}
                                updateSectionImageAlt={updateSectionImageAlt}
                                clearSectionImages={clearSectionImages}
                                updateSectionImageCaption={updateSectionImageCaption}
                            />
                        )}

                        {/* 🎯 SECTION 6: Team */}
                        {activeSection === 'team' && (
                            <TeamSection
                                values={values}
                                errors={errors}
                                setValues={setValues}
                                addTeamMember={addTeamMember}
                                removeTeamMember={removeTeamMember}
                                updateTeamMember={updateTeamMember}
                                handleTeamImageUpload={handleTeamImageUpload}
                                removeTeamImage={removeTeamImage}
                                onChangeHandler={onChangeHandler}
                            />
                        )}

                        {/* 🎯 SECTION 7: Partners & Sponsors */}
                        {activeSection === 'partners-sponsors' && (
                            <PartnersSponsorsSection
                                values={values}
                                errors={errors}
                                setValues={setValues}
                                addPartner={addPartner}
                                removePartner={removePartner}
                                addSponsor={addSponsor}
                                removeSponsor={removeSponsor}
                                handlePartnerImageUpload={handlePartnerImageUpload}
                                removePartnerImage={removePartnerImage}
                                handleSponsorImageUpload={handleSponsorImageUpload}
                                removeSponsorImage={removeSponsorImage}
                            />
                        )}
                        {/* 🎯 SECTION 8: Media */}
                        {activeSection === 'media' && (
                            <MediaSection
                                values={values}
                                errors={errors}
                                setValues={setValues}
                                handleGalleryUpload={handleGalleryUpload}
                                removeGalleryImage={removeGalleryImage}
                                handleDocumentUpload={handleDocumentUpload}
                                removeDocument={removeDocument}
                                handleLogoUpload={handleLogoUpload}
                                removeLogo={removeLogo}
                                clearAllGallery={clearAllGallery}
                                clearAllDocuments={clearAllDocuments}
                            />
                        )}

                        {/* 🎯 SECTION 9: Contacts */}
                        {activeSection === 'contact' && (
                            <ContactSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
                                handleContactImageUpload={handleContactImageUpload}
                                removeContactImage={removeContactImage}
                            />
                        )}
                        {/* Navigation buttons */}
                        <div className="project-form-navigation">
                            <button
                                type="button"
                                className="project-btn-project secondary"
                                onClick={() => {
                                    const currentIndex = navigationSections.findIndex(s => s.id === activeSection);
                                    if (currentIndex > 0) {
                                        setActiveSection(navigationSections[currentIndex - 1].id);
                                    }
                                }}
                                disabled={navigationSections.findIndex(s => s.id === activeSection) === 0}
                            >
                                {t('projects.create.previous')}
                            </button>

                            <button
                                type="button"
                                className="project-btn-project primary"
                                onClick={() => {
                                    const currentIndex = navigationSections.findIndex(s => s.id === activeSection);
                                    if (currentIndex < navigationSections.length - 1) {
                                        setActiveSection(navigationSections[currentIndex + 1].id);
                                    }
                                }}
                                disabled={navigationSections.findIndex(s => s.id === activeSection) === navigationSections.length - 1}
                            >
                                {t('projects.create.next')}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Floating Actions */}
            <div className="project-floating-actions">
                {(draftId || editId || values.title?.trim()) && (
                    <button
                        type="button"
                        className="project-floating-btn new-project"
                        onClick={handleStartNewProject}
                        title={t('projects.create.startNewProject')}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                )}

                {/* Save/Update Draft button - показва се само когато НЕ е в edit mode */}
                {!editId && (
                    <button
                        type="button"
                        className="project-floating-btn draft"
                        onClick={saveDraft}
                        title={draftId ? t('projects.create.updateDraft') : t('projects.create.saveDraft')}
                    >
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                )}

                <button
                    type="button"
                    className="project-floating-btn preview"
                    onClick={handlePreview}
                    title={t('projects.create.preview')}
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>

                {/* 🔧 ГЛАВНАТА ЛОГИКА ТУК */}
                {draftId && !editId ? (
                    // DRAFT MODE - може да публикува draft
                    <button
                        type="button"
                        className="project-floating-btn publish"
                        onClick={publishDraft}
                        title={t('projects.create.publishProject')}
                    >
                        <FontAwesomeIcon icon={faShare} />
                    </button>
                ) : editId ? (
                    // EDIT MODE - обновява съществуващ проект
                    <button
                        type="button"
                        className="project-floating-btn update"
                        onClick={onSubmit}
                        title={t('projects.create.updateProject')}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                ) : (
                    // NEW PROJECT MODE - създава нов проект
                    <button
                        type="button"
                        className="project-floating-btn create"
                        onClick={onSubmit}
                        title={t('projects.create.createProject')}
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

export default ProjectCreateForm;