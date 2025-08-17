import React, { useState, useEffect, useMemo } from 'react';
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
import { initiativeServiceFactory } from '../../../Services/StoryPubServiceFactory';
import { isSlateEmpty } from '../../../../utils/slateToHtml';
import ConnectionSection from "../Sections/ConnectionSection/ConnectionSection";
import { notify } from '../../../../utils/notify';

const PublicationForm = ({ initialValues, onSubmitHandler, isEditMode = false }) => {
    const { t } = useTranslation();
    const { userEmail, username } = useAuthContext();
    const navigate = useNavigate();
    const { slug } = useParams();
    const [publication, setPublication] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [draftId, setDraftId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const token = localStorage.getItem('token');
    const publicationService = initiativeServiceFactory(token);

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


    useEffect(() => {
        const fetchPublication = async () => {
            if (isEditMode && slug) {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const publicationService = initiativeServiceFactory(token);
                    const data = await publicationService.getPublicationBySlug(slug);
                    setPublication(data);
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
    }, [isEditMode, slug, setValues, t]);

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

    const preparePublicationData = () => {
        const nullIfEmpty = (value) => {
            if (value === '' || value === undefined) return null;
            return value;
        };

        return {
            title: values.title,
            slug: values.slug,
            titleSlug: values.slug,
            shortDescription: values.shortDescription,
            category: nullIfEmpty(values.category),
            tags: values.tags || [],
            readTime: nullIfEmpty(values.readTime),
            fileType: nullIfEmpty(values.fileType),
            fileSize: nullIfEmpty(values.fileSize),
            downloadUrl: nullIfEmpty(values.downloadUrl),
            commentsEnabled: values.commentsEnabled ?? true,
            showAuthor: values.showAuthor ?? true,
            publishedAt: new Date().toISOString(),
            mainImage: values.mainImage?.src ? {
                src: values.mainImage.src,
                alt: nullIfEmpty(values.mainImage.alt),
                caption: nullIfEmpty(values.mainImage.caption)
            } : null,
            sections: values.sections?.map((section, index) => {
                let content = '';
                if (section.content && !isSlateEmpty(section.content)) {
                    content = section.content
                        .map(node => {
                            if (node.type === 'paragraph') {
                                return node.children?.map(child => child.text || '').join('') || '';
                            }
                            return node.children?.map(child => child.text || '').join('') || '';
                        })
                        .filter(text => text.trim() !== '')
                        .join('\n');
                }

                const sectionTitleSlug = section.titleSlug || section.title
                    ?.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .trim() || `section-${index + 1}`;

                return {
                    title: nullIfEmpty(section.title),
                    titleSlug: sectionTitleSlug,
                    content: nullIfEmpty(content),
                    order: index + 1,
                    image: section.image?.src ? {
                        src: section.image.src,
                        alt: nullIfEmpty(section.image.alt),
                        caption: nullIfEmpty(section.image.caption)
                    } : null
                };
            }) || [],

            relatedPublications: values.relatedPublications || [],
            connectedInitiativeIds: values.connectedInitiativeIds || [],
            connectedProjectIds: values.connectedProjectIds || []
        };
    };

    const handleSaveDraft = async () => {
        if (!values.title || !values.slug || !values.shortDescription) {
            notify('error', 'Please provide title, slug, and short description before saving');
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
            navigate('/profile/publications');
        } catch (error) {
            setIsSaving(false);
        }
    };

    const handleCreatePublication = async () => {
        if (!values.title || !values.slug || !values.shortDescription) {
            notify('error', 'Please provide title, slug, and short description before creating');
            return;
        }

        setIsSaving(true);
        try {
            const publicationData = preparePublicationData();
            await publicationService.createPublication(publicationData);
            setIsSaving(false);
            navigate('/profile/publications');
        } catch (error) {
            setIsSaving(false);
        }
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handlePublish = async () => {
        if (!values.title || !values.slug || !values.shortDescription) {
            notify('error', 'Please provide title, slug, and short description before publishing');
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
        if (!publication?.id) {
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

    const closePreview = () => {
        setShowPreview(false);
    };

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

    const getPreviewSections = () => {
        if (values.sections && values.sections.length > 0) {
            return values.sections
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((section, index) => {
                    const sectionTitleSlug = section.titleSlug || section.title
                        ?.toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-+|-+$/g, '')
                        .trim() || `section-${index + 1}`;

                    return {
                        id: section.id || `section-${index + 1}`,
                        title: section.title || `Section ${index + 1}`,
                        titleSlug: sectionTitleSlug,
                        content: section.content ? slateToText(section.content) : `This is section ${index + 1} content.`,
                        order: section.order || index + 1,
                        image: section.image ? {
                            src: section.image.src,
                            alt: section.image.alt || `Image for ${section.title}`,
                            caption: section.image.caption || ''
                        } : null,
                        images: section.image ? [section.image] : []
                    };
                });
        }
        return [];
    };

    const getOptimizedPreviewData = () => {
        return {
            id: publication?.id || 'preview-' + Date.now(),
            title: values.title || t('publications.preview.noTitle'),
            shortDescription: values.shortDescription || t('publications.preview.noDescription'),
            publishedAt: publication?.publishedAt || new Date().toISOString(),
            slug: values.slug || 'preview-slug',

            author: values.showAuthor ? (username || userEmail || t('publications.preview.noAuthor')) : null,
            authorEmail: values.showAuthor ? userEmail : null,
            authorImage: null,

            readTime: values.readTime || t('publications.preview.noReadTime'),
            category: values.category || t('publications.preview.noCategory'),
            tags: values.tags?.length > 0 ? values.tags : [],

            image: values.mainImage?.src ? {
                src: values.mainImage.src,
                alt: values.mainImage.alt || values.title || 'Publication',
                caption: values.mainImage.caption || ''
            } : null,
            mainImage: values.mainImage || null,

            sections: getPreviewSections(),

            downloadUrl: values.downloadUrl || null,
            fileType: values.downloadUrl ? (values.fileType || 'PDF') : null,
            fileSize: values.downloadUrl ? (values.fileSize || t('publications.preview.unknownSize')) : null,

            commentsEnabled: values.commentsEnabled !== false,

            views: null,
            downloads: null,
            likes: null,
            isLiked: false,

            relatedPublications: values.relatedPublications?.length > 0 ? [] : null,
            initiatives: values.connectedInitiativeIds?.length > 0 ? [] : null,
            projects: values.connectedProjectIds?.length > 0 ? [] : null,

            type: 'publication'
        };
    };

    return (
        <div className="publication-create-container">
            {/* Header */}
            <div className="publication-form-header">
                {/* Add back navigation for edit mode */}
                {isEditMode && (
                    <div className="publication-form-back-nav">
                        <button
                            className="publication-form-back-btn"
                            onClick={() => navigate('/profile/publications')}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            {t('publications.common.back')}
                        </button>
                    </div>
                )}

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
                draftId={draftId}
                editId={publication?.id}
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
                                {t('publications.preview.backToEditing')}
                            </button>
                            <h2>{t('publications.preview.previewMode')}</h2>
                        </div>
                        <div className="publication-preview-modal-body">
                            <StoryPubView
                                type="publication"
                                previewMode={true}
                                previewData={getOptimizedPreviewData()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicationForm;
