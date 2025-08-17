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

const PublicationForm = ({
    mode = 'create', // 'create' or 'edit'
    initialValues = null,
    onCancel = null,
    showBackButton = true
}) => {
    const { t } = useTranslation();
    const { userEmail, username } = useAuthContext();
    const navigate = useNavigate();
    const { slug } = useParams(); // Keep using slug for URL compatibility
    const [publication, setPublication] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const token = localStorage.getItem('token');
    const publicationService = initiativeServiceFactory(token);

    // Determine if we're in edit mode
    const isEditMode = mode === 'edit' || !!slug;

    // Add debugging
    console.log('MainFormPublication debug:', {
        mode,
        slug,
        isEditMode,
        publication: publication,
        publicationId: publication?.id,
        initialValues: initialValues
    });

    // Define onSubmitHandler function
    const onSubmitHandler = async (data) => {
        try {
            if (isEditMode && publication?.id) {
                // Update existing publication
                await publicationService.updatePublication(publication.id, data);
                notify('success', t('publications.admin.publicationUpdatedSuccess'));
            } else {
                // Create new publication
                await publicationService.createPublication(data);
                notify('success', t('publications.admin.publicationCreatedSuccess'));
            }

            // If we have an onCancel callback (inline editing), use it instead of navigation
            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/publications');
            }
        } catch (error) {
            console.error('Failed to submit publication:', error);
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

    // Transform server data to form format
    const transformPublicationForForm = (publicationData) => {
        if (!publicationData) return {};

        // Helper function to convert string content to Slate format
        const convertStringToSlateContent = (content) => {
            if (!content) return [];
            if (Array.isArray(content)) return content;

            // If it's a string, convert it to Slate format
            return [
                {
                    type: 'paragraph',
                    children: [{ text: content }]
                }
            ];
        };

        // Helper function to normalize image data
        const normalizeImageData = (imageData) => {
            if (!imageData) return null;

            // Handle different image data structures
            if (typeof imageData === 'string') {
                return { src: imageData, alt: '', caption: '' };
            }

            if (imageData.src || imageData.url) {
                return {
                    src: imageData.src || imageData.url,
                    alt: imageData.alt || '',
                    caption: imageData.caption || ''
                };
            }

            return null;
        };

        console.log('Transforming publication data:', publicationData); // Debug log

        const transformed = {
            title: publicationData.title || '',
            slug: publicationData.slug || '',
            shortDescription: publicationData.shortDescription || '',
            category: publicationData.category || '',
            tags: publicationData.tags || [],
            readTime: publicationData.readTime || '',
            commentsEnabled: publicationData.commentsEnabled ?? true,
            showAuthor: publicationData.showAuthor ?? true,

            mainImage: normalizeImageData(publicationData.image),

            fileType: publicationData.fileType || '',
            fileSize: publicationData.fileSize || '',
            downloadUrl: publicationData.downloadUrl || '',

            sections: publicationData.sections?.map((section, index) => ({
                id: section.id || `section-${index + 1}`,
                title: section.title || '',
                titleSlug: section.titleSlug || section.slug || '',
                content: convertStringToSlateContent(section.content),
                order: index + 1,
                image: normalizeImageData(section.image)
            })) || [],

            relatedPublications: publicationData.relatedPublications?.map(pub => pub.id) || [],
            connectedInitiativeIds: publicationData.initiatives?.map(init => init.id) || [],
            connectedProjectIds: publicationData.projects?.map(proj => proj.id) || []
        };

        return transformed;
    };

    useEffect(() => {
        if (isEditMode && initialValues) {
            // This is inline editing mode - transform the data
            const transformedData = transformPublicationForForm(initialValues);
            setValues(transformedData);
        }
    }, [isEditMode, initialValues, setValues]);

    useEffect(() => {
        const fetchPublication = async () => {
            if (isEditMode && slug) {
                // This is route-based editing mode - we need to get publication by slug first
                setLoading(true);
                try {
                    // Since we don't have a getPublicationBySlug endpoint, we'll need to get all publications
                    // and find the one with matching slug. This is not ideal but works for now.
                    // TODO: Add getPublicationBySlug endpoint to the backend
                    const allPublications = await publicationService.getAllPublications(1, 1000);
                    const foundPublication = allPublications.find(pub => pub.slug === slug);

                    if (foundPublication) {
                        setPublication(foundPublication);
                        // Transform the data before setting it
                        const transformedData = transformPublicationForForm(foundPublication);
                        setValues(transformedData);
                    } else {
                        notify('error', t('publications.edit.notFound'));
                    }
                } catch (err) {
                    console.error('Error fetching publication:', err);
                    notify('error', t('publications.edit.notFound'));
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPublication();
    }, [isEditMode, slug, setValues, t, publicationService]);

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

        // Extract file name from download URL if available
        const getFileNameFromUrl = (url) => {
            if (!url) return null;
            try {
                const urlParts = url.split('/');
                return urlParts[urlParts.length - 1] || null;
            } catch {
                return null;
            }
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
            fileName: getFileNameFromUrl(values.downloadUrl), // Add file name
            commentsEnabled: values.commentsEnabled ?? true,
            showAuthor: values.showAuthor ?? true,
            isDraft: true, // Default to draft for safety
            // Don't set publishedAt here - let the backend handle it
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
                    order: section.order || index + 1, // Use the actual order property
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
            const publicationData = {
                ...preparePublicationData(),
                isDraft: true // Always save as draft
            };

            if (isEditMode && publication?.id) {
                // Update existing publication
                await publicationService.updatePublication(publication.id, publicationData);
                notify('success', t('publications.admin.draftUpdatedSuccess'));
            } else {
                // Create new publication (will be saved as draft by default)
                await publicationService.createPublication(publicationData);
                notify('success', t('publications.admin.draftCreatedSuccess'));
            }

            setIsSaving(false);

            // If we have an onCancel callback (inline editing), use it instead of navigation
            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/publications');
            }
        } catch (error) {
            setIsSaving(false);
            notify('error', error.message || 'Failed to save draft');
        }
    };

    const handleCreatePublication = async () => {
        if (!values.title || !values.slug || !values.shortDescription) {
            notify('error', 'Please provide title, slug, and short description before creating');
            return;
        }

        setIsSaving(true);
        try {
            const publicationData = {
                ...preparePublicationData(),
                isDraft: false // Publish immediately
            };

            // Enhanced debugging
            console.log('handleCreatePublication debug:', {
                isEditMode,
                mode,
                slug,
                publication: publication,
                publicationId: publication?.id,
                initialValues: initialValues,
                editingItem: initialValues
            });

            let publicationId = publication?.id;

            // If we're in edit mode but don't have the publication ID, try to find it by slug
            if (isEditMode && !publicationId && slug) {
                try {
                    const allPublications = await publicationService.getAllPublications(1, 1000);
                    const foundPublication = allPublications.find(pub => pub.slug === slug);
                    if (foundPublication) {
                        publicationId = foundPublication.id;
                        setPublication(foundPublication); // Update the state
                    }
                } catch (error) {
                    console.error('Error finding publication by slug:', error);
                }
            }

            // If we're in edit mode and have initialValues with an ID, use that
            if (isEditMode && !publicationId && initialValues?.id) {
                publicationId = initialValues.id;
                setPublication(initialValues); // Update the state
            }

            if (isEditMode && publicationId) {
                // Update existing publication
                console.log('Updating publication with ID:', publicationId);
                await publicationService.updatePublication(publicationId, publicationData);
                notify('success', t('publications.admin.publicationUpdatedSuccess'));
            } else {
                // Create new publication
                console.log('Creating new publication');
                await publicationService.createPublication(publicationData);
                notify('success', t('publications.admin.publicationCreatedSuccess'));
            }

            setIsSaving(false);

            // If we have an onCancel callback (inline editing), use it instead of navigation
            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/publications');
            }
        } catch (error) {
            setIsSaving(false);
            console.error('Error in handleCreatePublication:', error);
            notify('error', error.message || 'Failed to create publication');
        }
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handlePublish = async () => {
        if (!publication?.id) {
            notify('error', 'No publication ID for publishing');
            return;
        }

        if (!values.title || !values.slug || !values.shortDescription) {
            notify('error', 'Please provide title, slug, and short description before publishing');
            return;
        }

        setIsSaving(true);
        try {
            // Convert published publication to draft by updating with isDraft: true
            const publicationData = {
                ...preparePublicationData(),
                isDraft: true
            };

            await publicationService.updatePublication(publication.id, publicationData);
            setIsSaving(false);

            notify('success', t('publications.admin.publicationConvertedToDraft'));

            // If we have an onCancel callback (inline editing), use it instead of navigation
            if (onCancel) {
                onCancel();
            } else {
                navigate('/profile/publications');
            }
        } catch (error) {
            setIsSaving(false);
            notify('error', error.message || 'Failed to convert publication to draft');
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
        // Get actual connection data from the service
        const getConnectionData = async () => {
            try {
                const token = localStorage.getItem('token');
                const service = initiativeServiceFactory(token);

                let initiatives = [];
                let projects = [];

                if (values.connectedInitiativeIds?.length > 0) {
                    const initiativesResponse = await service.getAllInitiativesForConnections();
                    if (initiativesResponse?.data) {
                        initiatives = initiativesResponse.data.filter(init =>
                            values.connectedInitiativeIds.includes(init.id)
                        );
                    }
                }

                if (values.connectedProjectIds?.length > 0) {
                    const projectsResponse = await service.getAllProjectsForConnections();
                    if (projectsResponse?.data) {
                        projects = projectsResponse.data.filter(proj =>
                            values.connectedProjectIds.includes(proj.id)
                        );
                    }
                }

                return { initiatives, projects };
            } catch (error) {
                console.error('Error fetching connection data for preview:', error);
                return { initiatives: [], projects: [] };
            }
        };

        // For now, return placeholder data - we'll enhance this later
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

            // Include connections for preview - for now using placeholder data
            // In a real implementation, you'd fetch the actual connection data
            initiatives: values.connectedInitiativeIds?.length > 0 ?
                values.connectedInitiativeIds.map(id => ({
                    id: id,
                    title: `Initiative ${id}`,
                    slug: `initiative-${id}`,
                    isDraft: false
                })) : [],
            projects: values.connectedProjectIds?.length > 0 ?
                values.connectedProjectIds.map(id => ({
                    id: id,
                    title: `Project ${id}`,
                    slug: `project-${id}`,
                    isDraft: false
                })) : [],

            type: 'publication'
        };
    };

    return (
        <div className="publication-create-container">
            {/* Show back button only in edit mode - at the top */}
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

            {/* Show header for both create and edit modes */}
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
                onCreate={handleCreatePublication}
                onToggleDraft={handlePublish}
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
