import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEdit, faFileAlt, faArrowLeft, faLink } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Element as SlateElement, Transforms, Editor } from 'slate';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';

import './mainFormStory.css';

import BasicInfoSection from '../Sections/BasicSection/BasicInfoSection';
import ContentSection from '../Sections/ContentSection/ContentSection';
import StoryProgressBar from '../components/StoryProgressBar';
import FloatingActions from '../FloatingActions/FloatingActions';

import useCreateStory from '../../../hooks/useCreateStory';

import { StoryPubView } from '../../InitiativeView/StoryPubView/StoryPubView';
import { useAuthContext } from '../../../contexts/UserContext';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import ConnectionSection from "../Sections/ConnectionSection/ConnectionSection";
import { notify } from '../../../../utils/notify';
import {
    transformStoryForForm,
    transformStoryForServer,
    transformStoryForDisplay
} from '../utils/dataTransformationUtils';

const StoryForm = ({
    mode = 'create',
    initialValues = null,
    onCancel = null
}) => {
    const { t } = useTranslation('content');
    const { userEmail, username } = useAuthContext();
    const { getStoryById, createStory, updateStory, initiatives, projects, stories } = useInitiativeContext();
    const navigate = useLocalizedNavigate();
    const { slug } = useParams();

    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Determine if we're in edit mode
    const isEditMode = mode === 'edit' || !!slug;

    // Define onSubmitHandler function
    const onSubmitHandler = async (data) => {
        try {
            if (isEditMode && story?.id) {
                // Update existing story
                await updateStory(story.id, data);
                notify('success', t('stories.admin.storyUpdatedSuccess'));
            } else {
                // Create new story
                await createStory(data);
                notify('success', t('stories.admin.storyCreatedSuccess'));
            }

            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/stories');
            }
        } catch (error) {
            notify('error', error.message || 'Failed to submit story');
        }
    };

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && showPreview) {
                closePreview();
            }
        };

        const handleOutsideClick = (event) => {
            if (showPreview && event.target.classList.contains('story-preview-modal-overlay')) {
                closePreview();
            }
        };

        if (showPreview) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('click', handleOutsideClick);
            document.body.style.overflow = 'hidden';
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
        addSection,
        removeSection,
        updateSection,
        handleSectionImageUpload,
        addSectionImageFromUrl,
        removeSectionImage,
        updateSectionImageAlt,
        updateSectionImageCaption,
        clearSectionImages,
        handleMainImageUpload,
        addMainImageFromUrl,
        removeMainImage,
        updateMainImageAlt,
        updateMainImageCaption,
        handleAuthorImageUpload,
        addAuthorImageFromUrl,
        removeAuthorImage,
        updateAuthorImageAlt,
        updateAuthorImageCaption
    } = useCreateStory(initialValues, onSubmitHandler);

    // Transform server data to form format for inline editing
    useEffect(() => {
        if (isEditMode && initialValues) {
            const transformedData = transformStoryForForm(initialValues);
            setValues(transformedData);
        }
    }, [isEditMode, initialValues, setValues]);

    // Fetch story by slug for route-based editing
    useEffect(() => {
        const fetchStory = async () => {
            if (isEditMode && slug) {
                setLoading(true);
                try {
                    const foundStory = await getStoryById(slug);
                    setStory(foundStory);
                    const transformedData = transformStoryForForm(foundStory);
                    setValues(transformedData);
                } catch (err) {
                    notify('error', t('stories.edit.notFound'));
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStory();
    }, [isEditMode, slug, setValues, t, getStoryById]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    const addTag = () => {
        if (newTag.trim() && !values.tags.includes(newTag.trim())) {
            setValues(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setValues(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const navigationSections = [
        { id: 'basic-info', label: t('stories.sections.basicInfo'), icon: faInfoCircle },
        { id: 'content', label: t('stories.sections.content') , icon: faEdit },
        { id: 'connections', label: t('stories.sections.connections'), icon: faLink }
    ];

    const sectionOrder = [
        'basic-info',
        'content',
        'connections'
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(sectionId);
    };

    // Unified handler for all story operations
    const handleStoryAction = async (action) => {
        // Validate required fields
        if (!values.title || !values.slug || !values.shortDescription) {
            const requiredFields = 'title, slug, and short description';
            const actionText = action === 'draft' ? 'saving' : 'publishing';
            notify('error', `Please provide ${requiredFields} before ${actionText}`);
            return;
        }

        setIsSaving(true);
        try {
            const isDraft = action === 'draft';
            const storyData = transformStoryForServer(values, isDraft);

            const isEditing = isEditMode && (story?.id || initialValues?.id);

            if (isEditing) {
                const storyId = story?.id || initialValues?.id;
                await updateStory(storyId, storyData);

                const successMessage = isDraft
                    ? t('stories.admin.draftUpdatedSuccess')
                    : t('stories.admin.storyUpdatedSuccess');
                notify('success', successMessage);
            } else {
                await createStory(storyData);

                const successMessage = isDraft
                    ? t('stories.admin.draftCreatedSuccess')
                    : t('stories.admin.storyCreatedSuccess');
                notify('success', successMessage);
            }

            setIsSaving(false);

            // Navigate or close based on context
            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/stories');
            }
        } catch (error) {
            setIsSaving(false);
            notify('error', error.message || `Failed to ${action} story`);
        }
    };

    // Simplified handlers
    const handleSaveDraft = () => handleStoryAction('draft');
    const handlePublishOrUpdate = () => handleStoryAction('publish');
    const handlePreview = () => setShowPreview(true);
    const closePreview = () => setShowPreview(false);

    // Get preview data
    const getPreviewData = () => {
        const previewData = transformStoryForDisplay(values, {
            userEmail,
            username,
            t,
            story,
            includeConnections: true
            // Don't use isEditMode: true to avoid Slate content issues
        });

        // Manually add connections by resolving IDs to full objects
        const resolvedInitiatives = initiatives.filter(init =>
            (values.connectedInitiativeIds || []).includes(init.id)
        );

        const resolvedProjects = projects.filter(proj =>
            (values.connectedProjectIds || []).includes(proj.id)
        );

        const resolvedStories = stories.filter(story =>
            (values.relatedStories || []).includes(story.id)
        );

        // Override with resolved connections
        previewData.initiatives = resolvedInitiatives;
        previewData.projects = resolvedProjects;
        previewData.relatedStories = resolvedStories;

        return previewData;
    };

    // Get the current story ID from multiple possible sources
    const getCurrentStoryId = () => {
        // Try story state first
        if (story?.id) return story.id;

        // Try values.id (from form data)
        if (values.id) return values.id;

        // Try initialValues.id (from props)
        if (initialValues?.id) return initialValues.id;

        // Try slug (if it's numeric, it might be an ID)
        if (slug && !isNaN(slug)) return parseInt(slug);

        return null;
    };

    return (
        <div className="story-create-container">
            {/* Show back button only in edit mode */}
            {isEditMode && (
                <div className="story-form-back-nav">
                    <button
                        className="story-form-back-btn"
                        onClick={onCancel || (() => navigate('/profile/stories'))}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        {t('stories.common.back')}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="story-form-header">
                <h1 className="story-form-title">
                    {isEditMode
                        ? (story?.isDraft
                            ? t('stories.edit.editDraft')
                            : t('stories.edit.editPublished'))
                        : t('stories.create.title')
                    }
                </h1>
                <p className="story-form-subtitle">
                    {isEditMode
                        ? (story?.isDraft
                            ? t('stories.edit.editDraftDescription')
                            : t('stories.edit.editPublishedDescription'))
                        : t('stories.create.description')
                    }
                </p>
            </div>

            {/* Progress Bar */}
            <StoryProgressBar
                values={values}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
                isEditMode={isEditMode}
            />

            {/* Layout */}
            <div className="story-form-layout">
                {/* Sidebar Navigation */}
                <div className="story-form-sidebar">
                    <nav className="story-sidebar-nav">
                        {navigationSections.map((section) => (
                            <a key={section.id}
                                href={`#${section.id}`}
                                className={`story-sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
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
                <div className="story-form-content">
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
                                handleAuthorImageUpload={handleAuthorImageUpload}
                                addAuthorImageFromUrl={addAuthorImageFromUrl}
                                removeAuthorImage={removeAuthorImage}
                                updateAuthorImageAlt={updateAuthorImageAlt}
                                updateAuthorImageCaption={updateAuthorImageCaption}
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

                        {activeSection === 'connections' && (
                            <ConnectionSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
                                currentStoryId={getCurrentStoryId()}
                            />
                        )}

                        {/* Navigation Buttons */}
                        <div className="story-form-navigation">
                            <button
                                type="button"
                                className="story-btn-story secondary"
                                onClick={() => {
                                    const currentIndex = sectionOrder.indexOf(activeSection);
                                    if (currentIndex > 0) {
                                        setActiveSection(sectionOrder[currentIndex - 1]);
                                    }
                                }}
                                disabled={sectionOrder.indexOf(activeSection) === 0}
                            >
                                {t('stories.common.back')}
                            </button>

                            <button
                                type="button"
                                className="story-btn-story primary"
                                onClick={() => {
                                    const currentIndex = sectionOrder.indexOf(activeSection);
                                    if (currentIndex < sectionOrder.length - 1) {
                                        setActiveSection(sectionOrder[currentIndex + 1]);
                                    }
                                }}
                                disabled={sectionOrder.indexOf(activeSection) === sectionOrder.length - 1}
                            >
                                {t('stories.common.next')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Floating Actions */}
            <FloatingActions
                onPreview={handlePreview}
                onSaveDraft={handleSaveDraft}
                onCreate={handlePublishOrUpdate}
                onToggleDraft={handleSaveDraft}
                isSaving={isSaving}
                isDraft={story?.isDraft}
                isEditMode={isEditMode}
            />

            {/* Preview Modal */}
            {showPreview && (
                <div className="story-preview-modal-overlay">
                    <div className="story-preview-modal-content">
                        <div className="story-preview-modal-header">
                            <button
                                className="story-preview-close-btn"
                                onClick={closePreview}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                                {t('stories.common.back')}
                            </button>
                            <h2>{t('stories.preview.previewMode')}</h2>
                        </div>
                        <div className="story-preview-modal-body">
                            <StoryPubView
                                type="story"
                                previewMode={true}
                                previewData={getPreviewData()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryForm;
