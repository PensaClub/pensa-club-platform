import { isSlateEmpty, slateToHtml } from '../../../../utils/slateToHtml';

// Transformation types
export const TRANSFORMATION_TYPES = {
    FORM: 'form',           // Server data -> Form data (for editing)
    SERVER: 'server',       // Form data -> Server data (for API calls)
    DISPLAY: 'display'      // Server data -> Display data (for preview, lists, cards)
};

// Content types
export const CONTENT_TYPES = {
    PUBLICATION: 'publication',
    STORY: 'story'
};

// Convert string content to Slate format (for section content)
const convertStringToSlateContent = (content) => {
    if (!content) {
        return [
            {
                type: 'paragraph',
                children: [{ text: '' }]
            }
        ];
    }

    if (Array.isArray(content)) {
        if (content.length === 0) {
            return [
                {
                    type: 'paragraph',
                    children: [{ text: '' }]
                }
            ];
        }

        const isValidSlate = content.every(node =>
            node && typeof node === 'object' &&
            node.type &&
            node.children && Array.isArray(node.children)
        );

        if (isValidSlate) {
            return content;
        }
    }

    return [
        {
            type: 'paragraph',
            children: [{ text: content.toString() }]
        }
    ];
};

// Convert Slate content to plain text
const convertSlateToText = (slateContent) => {
    if (!slateContent || !Array.isArray(slateContent)) {
        return '';
    }

    return slateContent
        .map(node => {
            if (node.type === 'paragraph') {
                return node.children?.map(child => child.text || '').join('') || '';
            }
            return '';
        })
        .filter(text => text.trim() !== '')
        .join('\n');
};

// Normalize image data structure
const normalizeImageData = (imageData) => {
    if (!imageData) return null;

    if (typeof imageData === 'string') {
        return { src: imageData, alt: '', caption: '' };
    }

    return {
        src: imageData.src || imageData.url || '',
        alt: imageData.alt || '',
        caption: imageData.caption || ''
    };
};

// Convert empty values to null for server
const nullIfEmpty = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    return value;
};

// Extract filename from URL
const getFileNameFromUrl = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop();
        return filename || null;
    } catch {
        // Fallback for relative URLs
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 1] || null;
    }
};

// Generate section title slug
const generateSectionTitleSlug = (title, index) => {
    if (!title) return `section-${index + 1}`;

    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim() || `section-${index + 1}`;
};

// Main transformation function
export const transformData = (data, type, contentType = CONTENT_TYPES.PUBLICATION, options = {}) => {
    if (!data) return {};

    switch (type) {
        case TRANSFORMATION_TYPES.FORM:
            return transformToForm(data, contentType);
        case TRANSFORMATION_TYPES.SERVER:
            return transformToServer(data, contentType, options);
        case TRANSFORMATION_TYPES.DISPLAY:
            return transformToDisplay(data, contentType, options);
        default:
            throw new Error(`Unknown transformation type: ${type}`);
    }
};

const transformToForm = (data, contentType) => {
    const extractIds = (items) => {
        if (!items || !Array.isArray(items)) return [];
        return items.map(item => typeof item === 'object' ? item.id : item);
    };

    return {
        title: data.title || '',
        slug: data.slug || '',
        shortDescription: data.shortDescription || '',
        category: data.category || '',
        tags: data.tags || [],
        readTime: data.readTime || '',
        commentsEnabled: data.commentsEnabled ?? true,
        showAuthor: data.showAuthor ?? true,

        mainImage: normalizeImageData(data.image),

        fileType: data.fileType || '',
        fileSize: data.fileSize || '',
        downloadUrl: data.downloadUrl || '',

        sections: data.sections?.map((section, index) => ({
            id: section.id || `section-${index + 1}`,
            title: section.title || '',
            titleSlug: section.titleSlug || section.slug || '',
            content: convertStringToSlateContent(section.content),
            order: section.order || index + 1,
            image: normalizeImageData(section.image)
        })) || [],

        relatedPublications: extractIds(data.relatedPublications),
        connectedInitiativeIds: extractIds(data.initiatives),
        connectedProjectIds: extractIds(data.projects)
    };
};

// Transform form data to server format (for create/update)
const transformToServer = (data, contentType, { isDraft = true } = {}) => {
    return {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        category: nullIfEmpty(data.category),
        tags: data.tags || [],
        readTime: nullIfEmpty(data.readTime),
        fileType: nullIfEmpty(data.fileType),
        fileSize: nullIfEmpty(data.fileSize),
        downloadUrl: nullIfEmpty(data.downloadUrl),
        fileName: getFileNameFromUrl(data.downloadUrl),
        commentsEnabled: data.commentsEnabled ?? true,
        showAuthor: data.showAuthor ?? true,
        isDraft,
        mainImage: data.mainImage?.src ? {
            src: data.mainImage.src,
            alt: nullIfEmpty(data.mainImage.alt),
            caption: nullIfEmpty(data.mainImage.caption)
        } : null,
        sections: data.sections?.map((section, index) => {
            let content = '';
            if (section.content && !isSlateEmpty(section.content)) {
                content = convertSlateToText(section.content);
            }

            const sectionTitleSlug = generateSectionTitleSlug(section.title, index);

            return {
                title: nullIfEmpty(section.title),
                titleSlug: sectionTitleSlug,
                content: nullIfEmpty(content),
                order: section.order || index + 1,
                image: section.image?.src ? {
                    src: section.image.src,
                    alt: nullIfEmpty(section.image.alt),
                    caption: nullIfEmpty(section.image.caption)
                } : null
            };
        }) || [],

        relatedPublications: data.relatedPublications || [],
        connectedInitiativeIds: data.connectedInitiativeIds || [],
        connectedProjectIds: data.connectedProjectIds || []
    };
};

// Transform data to display format (for preview, lists, cards)
const transformToDisplay = (data, contentType, { userEmail, username, t, publication, includeConnections = false, isEditMode = false } = {}) => {
    const getDisplaySections = () => {
        if (data.sections && data.sections.length > 0) {
            return data.sections
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((section, index) => {
                    const sectionTitleSlug = generateSectionTitleSlug(section.title, index);
                    let content = '';
                    if (section.content) {
                        if (isEditMode) {
                            content = section.content;
                        } else {
                            if (Array.isArray(section.content)) {
                                content = convertSlateToText(section.content);
                            } else {
                                content = section.content;
                            }
                        }
                    } else {
                        content = t?.('publications.preview.noContent') || 'No content';
                    }

                    return {
                        id: section.id || `section-${index + 1}`,
                        title: section.title || t?.('publications.preview.noTitle') || 'No Title',
                        titleSlug: sectionTitleSlug,
                        content: content,
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

    return {
        id: publication?.id || data.id || 'display-' + Date.now(),
        title: data.title || t?.('publications.preview.noTitle') || 'No Title',
        shortDescription: data.shortDescription || t?.('publications.preview.noDescription') || 'No Description',
        publishedAt: publication?.publishedAt || data.publishedAt || new Date().toISOString(),
        slug: data.slug || 'display-slug',

        author: data.showAuthor ? (username || userEmail || data.userEmail || t?.('publications.preview.noAuthor') || 'Unknown Author') : null,
        authorEmail: data.showAuthor ? (userEmail || data.userEmail) : null,
        authorImage: null,

        readTime: data.readTime || t?.('publications.preview.noReadTime') || 'No Read Time',
        category: data.category || t?.('publications.preview.noCategory') || 'No Category',
        tags: data.tags?.length > 0 ? data.tags : [],

        image: data.mainImage?.src ? {
            src: data.mainImage.src,
            alt: data.mainImage.alt || data.title || 'Publication',
            caption: data.mainImage.caption || ''
        } : null,
        mainImage: data.mainImage || data.image || null,

        sections: getDisplaySections(),

        downloadUrl: data.downloadUrl || null,
        fileType: data.downloadUrl ? (data.fileType || 'PDF') : null,
        fileSize: data.downloadUrl ? (data.fileSize || t?.('publications.preview.noFileSize') || 'No File Size') : null,

        commentsEnabled: data.commentsEnabled !== false,

        views: data.views || null,
        downloads: data.downloads || null,
        likes: data.likes || null,
        isLiked: data.isLiked || false,

        initiatives: isEditMode ? (data.initiatives || []) : (data.initiatives || []),
        projects: isEditMode ? (data.projects || []) : (data.projects || []),
        relatedPublications: isEditMode ? (data.relatedPublications || []) : (data.relatedPublications || []),
    };
};

// Convenience functions for publications
export const transformPublicationForForm = (data) =>
    transformData(data, TRANSFORMATION_TYPES.FORM, CONTENT_TYPES.PUBLICATION);

export const transformPublicationForServer = (data, isDraft = true) =>
    transformData(data, TRANSFORMATION_TYPES.SERVER, CONTENT_TYPES.PUBLICATION, { isDraft });

export const transformPublicationForDisplay = (data, options = {}) =>
    transformData(data, TRANSFORMATION_TYPES.DISPLAY, CONTENT_TYPES.PUBLICATION, options);

