import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEdit, faFileAlt, faCog, faArrowLeft, faUser, faCheck, faTimes, faImage, faUpload, faLink, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { createEditor, Element as SlateElement, Transforms, Editor } from 'slate';
import { useNavigate, useParams } from 'react-router-dom';

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
import { StoryPubView } from '../../InitiativeView/StoryPubView/StoryPubView';
import { useAuthContext } from '../../../contexts/UserContext'; // Fixed path - go up 3 levels to reach contexts
import { initiativeServiceFactory } from '../../../Services/StoryPubServiceFactory';
import { slateToHtml, isSlateEmpty } from '../../../../utils/slateToHtml';

// Change the component name from PublicationCreateForm to PublicationForm
const PublicationForm = ({ initialValues, onSubmitHandler, isEditMode = false }) => {
    const { t } = useTranslation();
    const { userEmail, username } = useAuthContext(); // Get user info
    const navigate = useNavigate(); // Add this line
    const { slug } = useParams(); // Get the slug from URL params
    const [publication, setPublication] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [draftId, setDraftId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Get the service instance
    const token = localStorage.getItem('token');
    const publicationService = initiativeServiceFactory(token);

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

    // Add this useEffect to monitor values changes
    useEffect(() => {
        console.log('📊 Values changed in main component:', {
            fileType: values.fileType,
            fileSize: values.fileSize,
            downloadUrl: values.downloadUrl,
            category: values.category
        });
    }, [values.fileType, values.fileSize, values.downloadUrl, values.category]);

    // Add this useEffect to fetch publication data when in edit mode
    useEffect(() => {
        const fetchPublication = async () => {
            if (isEditMode && slug) {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const publicationService = initiativeServiceFactory(token);
                    const data = await publicationService.getPublicationBySlug(slug);
                    setPublication(data);
                    // Update the form values with the fetched data
                    setValues(data);
                } catch (err) {
                    console.error('Error fetching publication:', err);
                    notify('error', t('publications.edit.notFound'));
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPublication();
    }, [isEditMode, slug]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

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
        { id: 'file-options', label: t('publications.sections.fileUpload') || 'File Upload', icon: faFileAlt }
    ];

    // Update section order
    const sectionOrder = [
        'basic-info',
        'content',
        'file-options'
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(sectionId);
    };

    const currentSectionIndex = sectionOrder.indexOf(activeSection);

    // Action handlers
    const handleNewPublication = () => {
        console.log('Start new publication');
    };

    // Helper function to prepare publication data
    const preparePublicationData = () => {
        // Add debugging to see what values we have
        console.log('🔍 Current values before preparePublicationData:', {
            fileType: values.fileType,
            fileSize: values.fileSize,
            downloadUrl: values.downloadUrl,
            category: values.category
        });

        return {
            title: values.title,
            slug: values.slug,
            title_slug: values.slug,
            shortDescription: values.shortDescription || '',
            category: values.category || null,
            tags: values.tags || [],
            readTime: values.readTime || '',
            fileType: values.fileType || null,
            fileSize: values.fileSize || '',
            downloadUrl: values.downloadUrl || null,
            commentsEnabled: values.commentsEnabled ?? true,
            showAuthor: values.showAuthor ?? true,
            mainImage: values.mainImage || {
                src: '',
                alt: '',
                caption: '',
                gallery: []
            },
            sections: values.sections?.map(section => {
                let content = '';
                if (section.content && !isSlateEmpty(section.content)) {
                    content = slateToHtml(section.content);
                }

                const sectionTitleSlug = section.titleSlug || section.title
                    ?.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .trim() || `section-${Date.now()}`;

                return {
                    ...section,
                    title_slug: sectionTitleSlug,
                    content
                };
            }) || []
        };
    };

    const handleSaveDraft = async () => {
        if (!values.title || !values.slug) {
            return;
        }

        setIsSaving(true);
        try {
            const publicationData = preparePublicationData();

            if (!draftId) {
                await publicationService.savePublicationDraft(publicationData);
            } else {
                await publicationService.updatePublicationDraft(draftId, publicationData);
            }

            setIsSaving(false);

            // Navigate to profile publications page
            navigate('/profile/publications');
        } catch (error) {
            setIsSaving(false);
        }
    };

    const handleCreatePublication = async () => {
        if (!values.title || !values.slug) {
            return;
        }

        setIsSaving(true);
        try {
            const publicationData = preparePublicationData();
            await publicationService.createPublication(publicationData);
            setIsSaving(false);

            // Navigate to profile publications page
            navigate('/profile/publications');
        } catch (error) {
            setIsSaving(false);
        }
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handlePublish = async () => {
        if (!values.title || !values.slug) {
            notify('error', 'Please provide a title before publishing');
            return;
        }

        setIsSaving(true);
        try {
            const publicationData = {
                ...values,
                userEmail: userEmail,
                isDraft: false,
            };

            const response = await publicationService.createPublication(publicationData);
            notify('success', 'Publication published successfully!');
            console.log('Publication published successfully:', response);

            if (onSubmitHandler) {
                await onSubmitHandler(response);
            }
        } catch (error) {
            console.error('Failed to publish publication:', error);
            notify('error', error.message || 'Failed to publish publication');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!publication?.id) { // Use publication?.id for edit mode
            notify('error', 'No publication ID for update');
            return;
        }

        setIsSaving(true);
        try {
            const publicationData = {
                ...values,
                userEmail: userEmail,
            };

            const response = await publicationService.updatePublication(publication.id, publicationData);
            notify('success', 'Publication updated successfully!');
            console.log('Publication updated successfully:', response);

            if (onSubmitHandler) {
                await onSubmitHandler(response);
            }
        } catch (error) {
            console.error('Failed to update publication:', error);
            notify('error', error.message || 'Failed to update publication');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = () => {
        console.log('Create publication');
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    // Helper function to convert Slate content to text for preview
    const slateToText = (slateContent) => {
        if (!slateContent || !Array.isArray(slateContent)) {
            return '';
        }

        return slateContent
            .map(node => {
                if (node.type === 'paragraph') {
                    return node.children?.map(child => child.text || '').join('') || '';
                } else if (node.type === 'heading-one') {
                    return `<h1>${node.children?.map(child => child.text || '').join('') || ''}</h1>`;
                } else if (node.type === 'heading-two') {
                    return `<h2>${node.children?.map(child => child.text || '').join('') || ''}</h2>`;
                } else if (node.type === 'heading-three') {
                    return `<h3>${node.children?.map(child => child.text || '').join('') || ''}</h3>`;
                } else if (node.type === 'bulleted-list') {
                    const items = node.children?.map(item =>
                        `<li>${item.children?.map(child => child.text || '').join('') || ''}</li>`
                    ).join('') || '';
                    return `<ul>${items}</ul>`;
                } else if (node.type === 'numbered-list') {
                    const items = node.children?.map(item =>
                        `<li>${item.children?.map(child => child.text || '').join('') || ''}</li>`
                    ).join('') || '';
                    return `<ol>${items}</ol>`;
                } else if (node.type === 'blockquote') {
                    return `<blockquote>${node.children?.map(child => child.text || '').join('') || ''}</blockquote>`;
                } else {
                    return node.children?.map(child => child.text || '').join('') || '';
                }
            })
            .filter(text => text.trim() !== '')
            .join('<br />');
    };

    // Helper function to get preview sections - use real data if available, fallback to mock
    const getPreviewSections = () => {
        if (values.sections && values.sections.length > 0) {
            return values.sections.map((section, index) => ({
                id: section.id || `section-${index + 1}`,
                title: section.title || `Section ${index + 1}`,
                titleSlug: section.titleSlug || `section-${index + 1}`,
                content: section.content ? slateToText(section.content) : `This is section ${index + 1} content.`,
                // Use the single image directly (no need for array access)
                image: section.image ? {
                    src: section.image.src,
                    alt: section.image.alt || `Image for ${section.title}`,
                    caption: section.image.caption || ''
                } : null,
                images: section.image ? [section.image] : [] // For backward compatibility if needed
            }));
        } else {
            // Fallback to mock data when no sections exist
            return [
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
            ];
        }
    };

    // Get author name for preview
    const getAuthorName = () => {
        if (!values.showAuthor) return null; // If checkbox is unchecked, no author
        return username || userEmail || 'Anonymous';
    };

    return (
        <div className="publication-create-container">
            {/* Header */}
            <div className="publication-form-header">
                <h1 className="publication-form-title">
                    {isEditMode ? t('publications.edit.title') : t('publications.create.title')}
                </h1>
                <p className="publication-form-subtitle">
                    {isEditMode ? t('publications.edit.description') : t('publications.create.description')}
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
                draftId={draftId}
                editId={publication?.id} // Use publication?.id for edit mode
                hasTitle={!!values.title}
                onSaveDraft={handleSaveDraft}
                onPreview={handlePreview}
                onPublish={handlePublish}
                onUpdate={handleUpdate}
                onCreate={handleCreatePublication}
                isSaving={isSaving}
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
                                {t('publications.create.preview.backToEditing')}
                            </button>
                            <h2>{t('publications.create.preview.previewMode')}</h2>
                        </div>
                        <div className="publication-preview-modal-body">
                            <StoryPubView
                                type="publication"
                                previewMode={true}
                                previewData={{
                                    id: publication?.id || 'preview-123', // Use publication?.id
                                    title: values.title || 'Untitled Publication',
                                    shortDescription: values.shortDescription || 'No description provided',
                                    description: values.shortDescription || 'No description provided',
                                    publishedAt: publication?.publishedAt || new Date().toISOString(), // Use publication?.publishedAt
                                    author: getAuthorName(), // Use checkbox-controlled author
                                    authorEmail: values.showAuthor ? userEmail : null,
                                    authorImage: null,
                                    readTime: values.readTime || '5',
                                    category: values.category || 'General',
                                    tags: values.tags || [],
                                    image: {
                                        src: values.mainImage?.src || '',
                                        alt: values.mainImage?.alt || values.title || 'Publication',
                                        caption: values.mainImage?.caption || ''
                                    },
                                    mainImage: values.mainImage || null,
                                    sections: getPreviewSections(), // Dynamic sections with first image only
                                    downloadUrl: values.downloadUrl || '',
                                    fileType: values.fileType || 'PDF',
                                    fileSize: values.fileSize || 'Unknown',
                                    commentsEnabled: values.commentsEnabled !== false,
                                    views: null,
                                    downloads: null,
                                    likes: null,
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

export default PublicationForm;
