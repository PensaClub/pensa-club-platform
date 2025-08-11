import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEdit, faFileAlt, faCog, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { createEditor, Element as SlateElement, Transforms, Editor } from 'slate';

// CSS
import './mainFormPublication.css';

// Components
import BasicInfoSection from '../Sections/BasicSection/BasicInfoSection';
import ContentSection from '../Sections/ContentSection/ContentSection';
import PublicationProgressBar from '../components/PublicationProgressBar';
import FloatingActions from '../FloatingActions/FloatingActions';

// Hooks and utilities
import useCreatePublication from '../../../hooks/useCreatePublication';

// Add imports for new sections
import FileSection from "../Sections/FileSection/FileSection";
import SettingsSection from "../Sections/SettingsSection/SettingsSection";
import { StoryPubView } from '../../InitiativeView/StoryPubView/StoryPubView';

const PublicationCreateForm = ({ initialValues, onSubmitHandler, isEditMode = false }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // Add ESC key and outside click handling
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && showPreview) {
                closePreview();
            }
        };

        const handleOutsideClick = (event) => {
            if (showPreview && event.target.classList.contains('publication-preview-modal-overlay')) {
                closePreview();
            }
        };

        if (showPreview) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('click', handleOutsideClick);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleOutsideClick);
            document.body.style.overflow = 'unset';
        };
    }, [showPreview]);

    const {
        values, setValues, errors, onChangeHandler, onBlurHandler, onSubmit,
        generateSlug,
        // Section management
        addSection,
        removeSection,
        updateSection,
        // Section image management
        handleSectionImageUpload,
        addSectionImageFromUrl,
        removeSectionImage,
        updateSectionImageAlt,
        updateSectionImageCaption,
        clearSectionImages,
        // Main image management
        handleMainImageUpload,
        addMainImageFromUrl,
        removeMainImage,
        updateMainImageAlt,
        updateMainImageCaption
    } = useCreatePublication(initialValues, onSubmitHandler);

    // Add tag
    const addTag = () => {
        if (newTag.trim() && !values.tags.includes(newTag.trim())) {
            setValues(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    // Remove tag
    const removeTag = (tagToRemove) => {
        setValues(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Navigation sections
    const navigationSections = [
        { id: 'basic-info', label: t('publications.sections.basicInfo') || 'Basic Information', icon: faInfoCircle },
        { id: 'content', label: t('publications.sections.content') || 'Content', icon: faEdit },
        { id: 'file-options', label: t('publications.sections.fileOptions') || 'File & Options', icon: faFileAlt },
        { id: 'publishing', label: t('publications.sections.publishing') || 'Publishing', icon: faCog }
    ];

    // Update section order
    const sectionOrder = [
        'basic-info',
        'content',
        'file-options',
        'publishing'
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(sectionId);
    };

    const currentSectionIndex = sectionOrder.indexOf(activeSection);

    // Action handlers
    const handleNewPublication = () => {
        console.log('Start new publication');
    };

    const handleSaveDraft = () => {
        console.log('Save draft');
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handlePublish = () => {
        console.log('Publish publication');
    };

    const handleUpdate = () => {
        console.log('Update publication');
    };

    const handleCreate = () => {
        console.log('Create publication');
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    return (
        <div className="publication-create-container">
            {/* Header */}
            <div className="publication-form-header">
                <h1 className="publication-form-title">
                    {isEditMode ? t('publications.edit.title') : t('publications.create.title')}
                </h1>
                <p className="publication-form-subtitle">
                    {t('publications.create.description')}
                </p>
            </div>

            {/* Progress Bar */}
            <PublicationProgressBar
                values={values}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
            />

            {/* Layout */}
            <div className="publication-form-layout">
                {/* Sidebar Navigation */}
                <div className="publication-form-sidebar">
                    <nav className="publication-sidebar-nav">
                        {navigationSections.map((section) => (
                            <a key={section.id}
                                href={`#${section.id}`}
                                className={`publication-sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSectionClick(section.id);
                                }}
                            >
                                <FontAwesomeIcon icon={section.icon} />
                                {section.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Form Content */}
                <div className="publication-form-content">
                    <form onSubmit={onSubmit}>
                        {activeSection === 'basic-info' && (
                            <BasicInfoSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
                                generateSlug={generateSlug}
                                newTag={newTag}
                                setNewTag={setNewTag}
                                addTag={addTag}
                                removeTag={removeTag}
                                handleMainImageUpload={handleMainImageUpload}
                                addMainImageFromUrl={addMainImageFromUrl}
                                removeMainImage={removeMainImage}
                                updateMainImageAlt={updateMainImageAlt}
                                updateMainImageCaption={updateMainImageCaption}
                            />
                        )}

                        {activeSection === 'content' && (
                            <ContentSection
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
                                updateSectionImageCaption={updateSectionImageCaption}
                                clearSectionImages={clearSectionImages}
                            />
                        )}

                        {activeSection === 'file-options' && (
                            <FileSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
                            />
                        )}

                        {activeSection === 'publishing' && (
                            <SettingsSection
                                values={values}
                                errors={errors}
                                onSubmit={onSubmit}
                                isEditMode={isEditMode}
                            />
                        )}

                        {/* Navigation Buttons */}
                        <div className="publication-form-navigation">
                            <button
                                type="button"
                                className="publication-btn-publication secondary"
                                onClick={() => {
                                    const currentIndex = sectionOrder.indexOf(activeSection);
                                    if (currentIndex > 0) {
                                        setActiveSection(sectionOrder[currentIndex - 1]);
                                    }
                                }}
                                disabled={sectionOrder.indexOf(activeSection) === 0}
                            >
                                {t('publications.back')}
                            </button>

                            <button
                                type="button"
                                className="publication-btn-publication primary"
                                onClick={() => {
                                    const currentIndex = sectionOrder.indexOf(activeSection);
                                    if (currentIndex < sectionOrder.length - 1) {
                                        setActiveSection(sectionOrder[currentIndex + 1]);
                                    }
                                }}
                                disabled={sectionOrder.indexOf(activeSection) === sectionOrder.length - 1}
                            >
                                {t('publications.next')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Floating Actions */}
            <FloatingActions
                draftId={null} // TODO: Add from hook
                editId={null} // TODO: Add from hook
                hasTitle={values.title?.trim()}
                onSaveDraft={handleSaveDraft}
                onPreview={handlePreview}
                onPublish={handlePublish}
                onUpdate={handleUpdate}
                onCreate={handleCreate}
            />

            {/* Preview Modal */}
            {showPreview && (
                <div className="publication-preview-modal-overlay">
                    <div className="publication-preview-modal-content">
                        <div className="publication-preview-modal-header">
                            <button
                                className="publication-preview-close-btn"
                                onClick={closePreview}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                                {t('publications.preview.backToEditing')}
                            </button>
                            <h2>{t('publications.preview.previewMode')}</h2>
                        </div>
                        <div className="publication-preview-modal-body">
                            <StoryPubView
                                type="publication"
                                previewMode={true}
                                previewData={{
                                    id: 'preview-123',
                                    title: values.title || 'Untitled Publication',
                                    shortDescription: values.shortDescription || 'No description provided',
                                    description: values.shortDescription || 'No description provided',
                                    publishedAt: new Date().toISOString(),
                                    author: values.author || 'Anonymous',
                                    authorEmail: values.authorEmail || '',
                                    authorImage: values.authorImage || null,
                                    readTime: values.readTime || '5',
                                    category: values.category || 'General',
                                    tags: values.tags || [],
                                                image: {
                src: values.mainImage?.src || '',
                alt: values.mainImage?.alt || values.title || 'Publication',
                caption: values.mainImage?.caption || ''
            },
                                    mainImage: values.mainImage || null,
                                    sections: [
                                        {
                                            id: 'section-1',
                                            title: 'Introduction',
                                            titleSlug: 'introduction',
                                            content: 'This is a sample introduction section for the preview.',
                                            image: null,
                                            images: []
                                        },
                                        {
                                            id: 'section-2',
                                            title: 'Main Content',
                                            titleSlug: 'main-content',
                                            content: 'This is the main content section with some sample text.',
                                            image: null,
                                            images: []
                                        }
                                    ],
                                    downloadUrl: values.downloadUrl || '',
                                    fileType: values.fileType || 'PDF',
                                    fileSize: values.fileSize || 'Unknown',
                                    commentsEnabled: values.commentsEnabled !== false,
                                    views: 0,
                                    downloads: 0,
                                    likes: 0,
                                    isLiked: false,
                                    initiative: values.initiative || null,
                                    slug: values.slug || 'preview-slug'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicationCreateForm;
