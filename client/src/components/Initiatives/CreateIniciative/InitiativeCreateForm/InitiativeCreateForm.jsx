/* eslint-disable no-unused-vars */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faMinus, faImage, faVideo, faSliders,
    faUpload, faEye, faSave, faTimes, faCloudUploadAlt,
    faEdit, faUsers, faClock, faBullseye, faMoneyBillWave,
    faAddressCard, faChartLine, faInfoCircle, faBuilding,
    faHandshake, faTrophy, faQuestionCircle, faTag, faMapMarkerAlt,
    faLink, faBold, faItalic, faUnderline, faListUl, faListOl,
    faQuoteLeft, faHeading, faTrash, faChevronUp, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
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
import {
    createSlateEditor,
    createSlateEditorState,
    convertSlateToHtml,
    isSlateEmpty
} from '../Utils/initiativeEditorUtils';

// 🎨 Components
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';
import { InitiativeSectionQuickMenu } from '../InitiativeSectionQuickMenu/InitiativeSectionQuickMenu';
import { LocationPicker } from '../LocationMarker/LocationMarker';

const InitiativeCreateForm = ({ initialValues, onSubmitHandler, isEditMode = false }) => {
    const { t } = useTranslation();

    // 🎯 Hook
    const {
        values,
        errors,
        mediaFiles,
        isUploading,
        uploadProgress,
        setValues, // 🔧 ДОБАВЕНО
        onChangeHandler,
        onBlurHandler,
        handleEditorChange,
        onSubmit,
        validateForm,
        saveDraft,
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
        addSection,
        removeSection,
        updateSection,
        addSectionImage,
        removeSectionImage,
        handleLogoUpload,
        handlePartnerLogoUpload,
        handleSponsorLogoUpload,
        handleDocumentUpload
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

    const getSectionEditor = (index) => {
        if (!sectionEditorsRef.current[index]) {
            sectionEditorsRef.current[index] = createSlateEditor();
        }
        return sectionEditorsRef.current[index];
    };

    // 🎯 Handle Slate.js changes
    const handleSlateChange = (fieldName) => (value) => {
        handleEditorChange(fieldName, value);
    };

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
        const isActive = isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    };

    const toggleBlock = (editor, format) => {
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
                return <h1 {...props.attributes}>{props.children}</h1>;
            case 'heading-two':
                return <h2 {...props.attributes}>{props.children}</h2>;
            case 'list-item':
                return <li {...props.attributes}>{props.children}</li>;
            case 'numbered-list':
                return <ol {...props.attributes}>{props.children}</ol>;
            default:
                return <p {...props.attributes}>{props.children}</p>;
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
        { id: 'sections', label: 'Секции', icon: faEdit },
        { id: 'timeline', label: t('initiatives.create.timeline'), icon: faClock },
        { id: 'target-scope', label: t('initiatives.create.targetScope'), icon: faBullseye },
        { id: 'resources', label: t('initiatives.create.resources'), icon: faMoneyBillWave },
        { id: 'media', label: t('initiatives.create.media'), icon: faImage },
        { id: 'contacts', label: t('initiatives.create.contacts'), icon: faAddressCard },
        { id: 'progress', label: t('initiatives.create.progress'), icon: faChartLine },
        { id: 'additional', label: t('initiatives.create.additional'), icon: faTag }
    ];

    // 📊 Calculate form progress
    const calculateProgress = () => {
        const requiredFields = [
            'title', 'shortDescription', 'detailedDescription', 'category'
        ];
        const completed = requiredFields.filter(field => {
            if (field === 'detailedDescription') {
                return values[field] && !isSlateEmpty(values[field]);
            }
            return values[field] && values[field].toString().trim();
        });
        return Math.round((completed.length / requiredFields.length) * 100);
    };

    // 🖼️ Handle main image upload
    const handleMainImageUpload = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {

            const newImages = [];

            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    newImages.push({
                        src: event.target.result,
                        alt: '',
                        caption: ''
                    });

                    // Когато всички нови файлове са заредени
                    if (newImages.length === files.length) {
                        setValues(prev => {
                            // 🔧 КЛЮЧОВА ПРОМЯНА: Проверяваме дали вече има снимки
                            const existingGallery = prev.mainImage.gallery || [];
                            const allImages = [...existingGallery, ...newImages];

                            // Ако няма главна снимка, поставяме първата от новите
                            const shouldUpdateMain = !prev.mainImage.src;

                            return {
                                ...prev,
                                mainImage: {
                                    ...prev.mainImage,
                                    // Обновяваме главната снимка само ако няма такава
                                    ...(shouldUpdateMain ? {
                                        src: newImages[0].src,
                                        alt: newImages[0].alt,
                                        caption: newImages[0].caption
                                    } : {}),
                                    gallery: allImages // 🔧 КОМБИНИРАМЕ старите и новите снимки
                                }
                            };
                        });
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

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

    // 📍 Section management functions
    const handleAddSection = () => {
        const newSection = {
            titleSlug: `section-${Date.now()}`,
            title: '',
            content: createSlateEditorState(), // 🔧 ПОПРАВЕНО: Правилна начална стойност
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
    // 🖼️ Section image upload functions
    const handleSectionImageUpload = useCallback((e, sectionIndex) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImages = [];

            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    newImages.push({
                        src: event.target.result,
                        alt: '',
                        caption: ''
                    });

                    if (newImages.length === files.length) {
                        const updatedSections = [...values.sections];
                        const existingImages = updatedSections[sectionIndex].images || [];
                        updatedSections[sectionIndex] = {
                            ...updatedSections[sectionIndex],
                            images: [...existingImages, ...newImages]
                        };
                        setValues(prev => ({ ...prev, sections: updatedSections }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }, [values.sections, setValues]);

    const handleSectionImageUrl = useCallback((sectionIndex) => {
        const url = sectionImageUrls[sectionIndex];
        if (url && url.trim()) {
            const newImage = {
                src: url.trim(),
                alt: '',
                caption: ''
            };

            const updatedSections = [...values.sections];
            const existingImages = updatedSections[sectionIndex].images || [];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: [...existingImages, newImage]
            };
            setValues(prev => ({ ...prev, sections: updatedSections }));

            // Clear URL input
            setSectionImageUrls(prev => ({ ...prev, [sectionIndex]: '' }));
            setShowSectionUrlInput(prev => ({ ...prev, [sectionIndex]: false }));
        }
    }, [sectionImageUrls, values.sections, setValues]);

    const updateSectionImageField = useCallback((sectionIndex, imageIndex, field, value) => {
        const updatedSections = [...values.sections];
        const updatedImages = [...updatedSections[sectionIndex].images];
        updatedImages[imageIndex] = {
            ...updatedImages[imageIndex],
            [field]: value
        };
        updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            images: updatedImages
        };
        setValues(prev => ({ ...prev, sections: updatedSections }));
    }, [values.sections, setValues]);

    const removeSectionImageItem = useCallback((sectionIndex, imageIndex) => {
        const updatedSections = [...values.sections];
        const updatedImages = updatedSections[sectionIndex].images.filter((_, i) => i !== imageIndex);
        updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            images: updatedImages
        };
        setValues(prev => ({ ...prev, sections: updatedSections }));
    }, [values.sections, setValues]);

    const clearSectionImages = useCallback((sectionIndex) => {
        const updatedSections = [...values.sections];
        updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            images: []
        };
        setValues(prev => ({ ...prev, sections: updatedSections }));
    }, [values.sections, setValues]);

    if (previewMode) {
        return (
            <div className="initiative-preview">
                <h2>Preview Mode - TODO</h2>
                <button onClick={() => setPreviewMode(false)}>Back to Edit</button>
            </div>
        );
    }

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

            {/* 📊 Progress Bar */}
            <div className="form-progress-container">
                <div className="form-progress-bar">
                    <div
                        className="form-progress-fill"
                        style={{ width: `${calculateProgress()}%` }}
                    ></div>
                </div>
                <div className="form-progress-text">
                    {calculateProgress()}% {t('initiatives.create.completed')}
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
                                            rows={3}
                                        />
                                        {errors.shortDescription && <div className="error-message">{errors.shortDescription}</div>}
                                    </div>

                                    {/* 🎯 Detailed Description (Slate.js) */}
                                    <div className="form-group-initiative">
                                        <label>
                                            {t('initiatives.create.detailedDescription')}
                                            <span className="required-indicator">*</span>
                                        </label>
                                        <div className={`slate-editor-container ${errors.detailedDescription ? 'error' : ''}`}>
                                            <Slate
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
                                            {values.mainImage.src && (
                                                <div className="initiative-create-images-preview">
                                                    {/* Основна снимка */}
                                                    <div className="initiative-create-main-image-preview">
                                                        <img src={values.mainImage.src} alt="Main Preview" />
                                                        <div className="image-fields">
                                                            <input
                                                                type="text"
                                                                placeholder="Alt текст"
                                                                value={values.mainImage.alt || ''}
                                                                onChange={(e) => onChangeHandler(null, false, {
                                                                    name: 'mainImage.alt',
                                                                    value: e.target.value
                                                                })}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Caption"
                                                                value={values.mainImage.caption || ''}
                                                                onChange={(e) => onChangeHandler(null, false, {
                                                                    name: 'mainImage.caption',
                                                                    value: e.target.value
                                                                })}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* 🔧 ОБНОВЕНО: Всяка снимка от галерията със собствени полета */}
                                                    {values.mainImage.gallery && values.mainImage.gallery.length > 1 && (
                                                        <div className="initiative-create-gallery-preview">
                                                            <h5>Галерия ({values.mainImage.gallery.length} снимки)</h5>
                                                            <div className="initiative-create-gallery-grid">
                                                                {values.mainImage.gallery.map((img, index) => (
                                                                    <div key={index} className="initiative-create-gallery-item">
                                                                        <img src={img.src} alt={img.alt || `Gallery ${index + 1}`} />

                                                                        {/* 🆕 ДОБАВЕНО: Alt и caption за всяка снимка */}
                                                                        <div className="initiative-create-gallery-controls">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Alt текст"
                                                                                value={img.alt || ''}
                                                                                onChange={(e) => {
                                                                                    const updatedGallery = [...values.mainImage.gallery];
                                                                                    updatedGallery[index] = {
                                                                                        ...updatedGallery[index],
                                                                                        alt: e.target.value
                                                                                    };
                                                                                    setValues(prev => ({
                                                                                        ...prev,
                                                                                        mainImage: {
                                                                                            ...prev.mainImage,
                                                                                            gallery: updatedGallery
                                                                                        }
                                                                                    }));
                                                                                }}
                                                                                className="initiative-create-gallery-input"
                                                                            />

                                                                            <input
                                                                                type="text"
                                                                                placeholder="Caption"
                                                                                value={img.caption || ''}
                                                                                onChange={(e) => {
                                                                                    const updatedGallery = [...values.mainImage.gallery];
                                                                                    updatedGallery[index] = {
                                                                                        ...updatedGallery[index],
                                                                                        caption: e.target.value
                                                                                    };
                                                                                    setValues(prev => ({
                                                                                        ...prev,
                                                                                        mainImage: {
                                                                                            ...prev.mainImage,
                                                                                            gallery: updatedGallery
                                                                                        }
                                                                                    }));
                                                                                }}
                                                                                className="initiative-create-gallery-input"
                                                                            />

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    // Сменяме главната снимка
                                                                                    setValues(prev => ({
                                                                                        ...prev,
                                                                                        mainImage: {
                                                                                            ...prev.mainImage,
                                                                                            src: img.src,
                                                                                            alt: img.alt,
                                                                                            caption: img.caption
                                                                                        }
                                                                                    }));
                                                                                }}
                                                                                className="initiative-create-set-main-btn"
                                                                            >
                                                                                Задай като главна
                                                                            </button>

                                                                            {/* 🆕 ДОБАВЕНО: Бутон за изтриване */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const updatedGallery = values.mainImage.gallery.filter((_, i) => i !== index);
                                                                                    setValues(prev => ({
                                                                                        ...prev,
                                                                                        mainImage: {
                                                                                            ...prev.mainImage,
                                                                                            gallery: updatedGallery,
                                                                                            // Ако изтриваме главната снимка, поставяме първата от останалите
                                                                                            ...(prev.mainImage.src === img.src && updatedGallery.length > 0 ? {
                                                                                                src: updatedGallery[0].src,
                                                                                                alt: updatedGallery[0].alt,
                                                                                                caption: updatedGallery[0].caption
                                                                                            } : {})
                                                                                        }
                                                                                    }));
                                                                                }}
                                                                                className="initiative-create-remove-img-btn"
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
                                            )}
                                        </div>
                                    </div>

                                    {/* Location Map - ЗАМЕНЕНО */}
                                    <div className="form-group-initiative">
                                        <label>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                            Местоположение
                                        </label>
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
                                        />
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

                                </div>
                            </div>
                        )}

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
                                                        <h4>Секция {index + 1}</h4>
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
                                                                        placeholder="Въведете заглавие..."
                                                                    />
                                                                </div>

                                                                {/* 🔧 ПОПРАВЕНО: Section Content */}
                                                                <div className="form-group-initiative">
                                                                    <label>Съдържание</label>
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
                                                                                    onChange={(e) => setSectionImageUrls(prev => ({
                                                                                        ...prev,
                                                                                        [index]: e.target.value
                                                                                    }))}
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
                                                                                        <div key={imgIndex} className="section-image-item">
                                                                                            <div className="section-image-header">
                                                                                                <span className="section-image-number">#{imgIndex + 1}</span>
                                                                                            </div>
                                                                                            <img src={img.src} alt={img.alt || `Section image ${imgIndex + 1}`} />

                                                                                            <div className="section-image-controls">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    placeholder="Alt текст"
                                                                                                    value={img.alt || ''}
                                                                                                    onChange={(e) => updateSectionImageField(index, imgIndex, 'alt', e.target.value)}
                                                                                                    className="section-image-input"
                                                                                                />

                                                                                                <input
                                                                                                    type="text"
                                                                                                    placeholder="Caption"
                                                                                                    value={img.caption || ''}
                                                                                                    onChange={(e) => updateSectionImageField(index, imgIndex, 'caption', e.target.value)}
                                                                                                    className="section-image-input"
                                                                                                />

                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => removeSectionImageItem(index, imgIndex)}
                                                                                                    className="section-remove-image-btn"
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
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* 🎯 SECTION 3: TARGET SCOPE */}
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
                                            className="custom-audience-textarea"
                                        />
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
                    onClick={() => setPreviewMode(true)}
                    title={t('initiatives.create.preview')}
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>
            </div>

            {/* 📜 Scroll to Top */}
            <ScrollToTop />
        </div>
    );
};

export default InitiativeCreateForm;