import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEdit, faFileAlt, faArrowLeft, faLink } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Element as SlateElement, Transforms, Editor } from 'slate';
import { useNavigate, useParams } from 'react-router-dom';

import './mainFormPublication.css';

import BasicInfoSection from '../Sections/BasicSection/BasicInfoSection';
import ContentSection from '../Sections/ContentSection/ContentSection';
import PublicationProgressBar from '../components/PublicationProgressBar';
import FloatingActions from '../FloatingActions/FloatingActions';

import useCreatePublication from '../../../hooks/useCreatePublication';

import FileSection from "../Sections/FileSection/FileSection";
import { StoryPubView } from '../../InitiativeView/StoryPubView/StoryPubView';
import { useAuthContext } from '../../../contexts/UserContext';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import ConnectionSection from "../Sections/ConnectionSection/ConnectionSection";
import { notify } from '../../../../utils/notify';
import {
    transformPublicationForForm,
    transformPublicationForServer,
    transformPublicationForDisplay
} from '../utils/dataTransformationUtils';

const PublicationForm = ({
    mode = 'create',
    initialValues = null,
    onCancel = null
}) => {
    const { t } = useTranslation();
    const { userEmail, username } = useAuthContext();
    const { getPublicationById, createPublication, updatePublication } = useInitiativeContext();
    const navigate = useNavigate();
    const { slug } = useParams();

    const [publication, setPublication] = useState(null);
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
            if (isEditMode && publication?.id) {
                // Update existing publication
                await updatePublication(publication.id, data);
                notify('success', t('publications.admin.publicationUpdatedSuccess'));
            } else {
                // Create new publication
                await createPublication(data);
                notify('success', t('publications.admin.publicationCreatedSuccess'));
            }

            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/publications');
            }
        } catch (error) {
            notify('error', error.message || 'Failed to submit publication');
        }
    };

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
        updateMainImageCaption
    } = useCreatePublication(initialValues, onSubmitHandler);

    // Transform server data to form format for inline editing
    useEffect(() => {
        if (isEditMode && initialValues) {
            const transformedData = transformPublicationForForm(initialValues);
            setValues(transformedData);
        }
    }, [isEditMode, initialValues, setValues]);

    // Fetch publication by slug for route-based editing
    useEffect(() => {
        const fetchPublication = async () => {
            if (isEditMode && slug) {
                setLoading(true);
                try {
                    const foundPublication = await getPublicationById(slug);
                    setPublication(foundPublication);
                    const transformedData = transformPublicationForForm(foundPublication);
                    setValues(transformedData);
                } catch (err) {
                    notify('error', t('publications.edit.notFound'));
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPublication();
    }, [isEditMode, slug, setValues, t, getPublicationById]);

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
        { id: 'basic-info', label: t('publications.sections.basicInfo'), icon: faInfoCircle },
        { id: 'content', label: t('publications.sections.content') , icon: faEdit },
        { id: 'file-options', label: t('publications.sections.fileUpload') , icon: faFileAlt },
        { id: 'connections', label: t('publications.sections.connections'), icon: faLink }
    ];

    const sectionOrder = [
        'basic-info',
        'content',
        'file-options',
        'connections'
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(sectionId);
    };

    // Unified handler for all publication operations
    const handlePublicationAction = async (action) => {
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
            const publicationData = transformPublicationForServer(values, isDraft);

            const isEditing = isEditMode && (publication?.id || initialValues?.id);

            if (isEditing) {
                const publicationId = publication?.id || initialValues?.id;
                await updatePublication(publicationId, publicationData);

                const successMessage = isDraft
                    ? t('publications.admin.draftUpdatedSuccess')
                    : t('publications.admin.publicationUpdatedSuccess');
                notify('success', successMessage);
            } else {
                await createPublication(publicationData);

                const successMessage = isDraft
                    ? t('publications.admin.draftCreatedSuccess')
                    : t('publications.admin.publicationCreatedSuccess');
                notify('success', successMessage);
            }

            setIsSaving(false);

            // Navigate or close based on context
            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/publications');
            }
        } catch (error) {
            setIsSaving(false);
            notify('error', error.message || `Failed to ${action} publication`);
        }
    };

    // Simplified handlers
    const handleSaveDraft = () => handlePublicationAction('draft');
    const handlePublishOrUpdate = () => handlePublicationAction('publish');
    const handlePreview = () => setShowPreview(true);
    const closePreview = () => setShowPreview(false);

    // Get preview data
    const getPreviewData = () => {
        return transformPublicationForDisplay(values, {
            userEmail,
            username,
            t,
            publication,
            includeConnections: true
        });
    };

    return (
        <div className="publication-create-container">
            {/* Show back button only in edit mode */}
            {isEditMode && (
                <div className="publication-form-back-nav">
                    <button
                        className="publication-form-back-btn"
                        onClick={onCancel || (() => navigate('/profile/publications'))}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        {t('publications.common.back')}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="publication-form-header">
                <h1 className="publication-form-title">
                    {isEditMode
                        ? (publication?.isDraft
                            ? t('publications.edit.editDraft')
                            : t('publications.edit.editPublished'))
                        : t('publications.create.title')
                    }
                </h1>
                <p className="publication-form-subtitle">
                    {isEditMode
                        ? (publication?.isDraft
                            ? t('publications.edit.editDraftDescription')
                            : t('publications.edit.editPublishedDescription'))
                        : t('publications.create.description')
                    }
                </p>
            </div>

            {/* Progress Bar */}
            <PublicationProgressBar
                values={values}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
                isEditMode={isEditMode}
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

                        {activeSection === 'connections' && (
                            <ConnectionSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
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
                                {t('publications.common.back')}
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
                                {t('publications.common.next')}
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
                isDraft={publication?.isDraft}
                isEditMode={isEditMode}
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
                                {t('publications.common.back')}
                            </button>
                            <h2>{t('publications.preview.previewMode')}</h2>
                        </div>
                        <div className="publication-preview-modal-body">
                            <StoryPubView
                                type="publication"
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

export default PublicationForm;
