// useCreatePublication.js
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/UserContext';
import { notify } from '../../utils/notify';
import { createSlateEditorState } from '../Initiatives/CreateIniciative/Utils/initiativeEditorUtils';
import {
    uploadFileWithProgress,
    compressImage,
} from '../Articles/articleUtils/file-utils';
import { deleteSingleImage } from '../../utils/initiative-firebase-utils';
import { 
    uploadVideoWithThumbnail, 
    validateVideo 
} from '../../utils/video-utils';

const useCreatePublication = (initialValues, onSubmitHandler) => {
    const { t } = useTranslation();
    const { userEmail } = useAuthContext();

    const defaultValues = useMemo(() => ({
        // Basic info
        title: '',
        slug: '',
        shortDescription: '',
        category: '',
        tags: [],
        readTime: '',
        fileType: '',
        fileSize: '',
        downloadUrl: '',
        commentsEnabled: true,
        showAuthor: true,

        // Main image
        mainImage: {
            src: '',
            alt: '',
            caption: '',
            gallery: []
        },

        // Always start with 1 section
        sections: [{
            titleSlug: 'introduction',
            title: 'Въведение',
            content: createSlateEditorState(),
            order: 1,
            image: null,
            videoUrl: null,      // ✅ ДОБАВЕНО
            thumbnailUrl: null   // ✅ ДОБАВЕНО
        }],

        relatedPublications: [],
        connectedInitiativeIds: [],
        connectedProjectIds: [],

        // Meta
        userEmail: userEmail || '',
        isDraft: true
    }), [userEmail]);

    const [values, setValues] = useState(initialValues || defaultValues);
    
    // ✅ ДОБАВЕНО: State за video upload progress по секции
    const [videoUploadState, setVideoUploadState] = useState({});

    // Generate slug from title
    const generateSlug = useCallback((title) => {
        if (!title) return '';

        return title
            .toLowerCase()
            // Convert Bulgarian characters to Latin
            .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v')
            .replace(/г/g, 'g').replace(/д/g, 'd').replace(/е/g, 'e')
            .replace(/ж/g, 'zh').replace(/з/g, 'z').replace(/и/g, 'i')
            .replace(/й/g, 'y').replace(/к/g, 'k').replace(/л/g, 'l')
            .replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
            .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's')
            .replace(/т/g, 't').replace(/у/g, 'u').replace(/ф/g, 'f')
            .replace(/х/g, 'h').replace(/ц/g, 'ts').replace(/ч/g, 'ch')
            .replace(/ш/g, 'sh').replace(/щ/g, 'sht').replace(/ъ/g, 'a')
            .replace(/ь/g, 'y').replace(/ю/g, 'yu').replace(/я/g, 'ya')
            // Remove all characters that are not a-z, 0-9 or spaces
            .replace(/[^a-z0-9\s]/g, '')
            // Replace spaces with hyphens
            .replace(/\s+/g, '-')
            // Remove multiple hyphens
            .replace(/-+/g, '-')
            // Remove hyphens from start and end
            .replace(/^-+|-+$/g, '')
            .trim();
    }, []);

    // Basic form handlers
    const onChangeHandler = useCallback((e) => {
        const { name, value, type, checked } = e.target;

        // Handle checkboxes differently
        const fieldValue = type === 'checkbox' ? checked : value;

        // Auto-generate slug when title changes
        if (name === 'title') {
            setValues(prev => ({
                ...prev,
                title: fieldValue,
                slug: generateSlug(fieldValue)
            }));
        } else {
            setValues(prev => ({
                ...prev,
                [name]: fieldValue
            }));
        }
    }, [generateSlug]);

    // Form submission
    const onSubmit = useCallback(async (e) => {
        e.preventDefault();

        try {
            // Call the onSubmitHandler if provided
            if (onSubmitHandler) {
                await onSubmitHandler(values);
            }
        } catch (error) {
            notify('error', 'Error submitting form');
        }
    }, [values, onSubmitHandler]);

    // Section management
    const addSection = useCallback(() => {
        const newSection = {
            titleSlug: `section-${Date.now()}`,
            title: '',
            content: createSlateEditorState(),
            image: null,
            videoUrl: null,      // ✅ ДОБАВЕНО
            thumbnailUrl: null   // ✅ ДОБАВЕНО
        };

        setValues(prev => ({
            ...prev,
            sections: [...(prev.sections || []), newSection]
        }));
    }, []);

    const removeSection = useCallback((index) => {
        setValues(prev => ({
            ...prev,
            sections: (prev.sections || []).filter((_, i) => i !== index)
        }));
    }, []);

    const updateSection = useCallback((index, field, value) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            updatedSections[index] = {
                ...updatedSections[index],
                [field]: value
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Section image management
    const handleSectionImageUpload = useCallback(async (e, sectionIndex) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        let blobUrl = null;

        try {
            blobUrl = URL.createObjectURL(file);

            // Update UI immediately with blob URL
            setValues(prev => {
                const updatedSections = [...(prev.sections || [])];
                updatedSections[sectionIndex] = {
                    ...updatedSections[sectionIndex],
                    image: {
                        src: blobUrl,
                        alt: '',
                        caption: '',
                        isUploading: true
                    }
                };
                return { ...prev, sections: updatedSections };
            });

            e.target.value = '';

            // Upload to Firebase
            const compressedFile = await compressImage(file, {
                maxSizeMB: 2,
                maxWidthOrHeight: 1920
            });

            const url = await uploadFileWithProgress(
                compressedFile,
                'publications/section-images',
                () => {}
            );

            // Replace blob URL with Firebase URL
            setValues(prev => {
                const updatedSections = [...(prev.sections || [])];
                updatedSections[sectionIndex] = {
                    ...updatedSections[sectionIndex],
                    image: {
                        src: url,
                        alt: '',
                        caption: '',
                        isUploading: false
                    }
                };
                return { ...prev, sections: updatedSections };
            });

            // Clean up blob URL
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }

            notify('success', 'Section image uploaded successfully!');

        } catch (error) {
            notify('error', 'Error uploading section image');

            // Reset on error
            setValues(prev => {
                const updatedSections = [...(prev.sections || [])];
                updatedSections[sectionIndex] = {
                    ...updatedSections[sectionIndex],
                    image: null
                };
                return { ...prev, sections: updatedSections };
            });

            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        }
    }, []);

    // Add section image from URL
    const addSectionImageFromUrl = useCallback((sectionIndex, imageUrl) => {
        if (!imageUrl.trim()) return;

        const newImage = {
            src: imageUrl.trim(),
            alt: '',
            caption: ''
        };

        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                image: newImage
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Remove section image
    const removeSectionImage = useCallback((sectionIndex) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const imageToDelete = updatedSections[sectionIndex].image;

            // Delete from Firebase if needed
            if (imageToDelete?.src && !imageToDelete.isUploading && !imageToDelete.src.startsWith('blob:')) {
                deleteSingleImage(imageToDelete.src).catch(() => {
                    // Silently fail - image might already be deleted
                });
            }

            if (imageToDelete?.src?.startsWith('blob:')) {
                URL.revokeObjectURL(imageToDelete.src);
            }

            // Set image to null to remove it
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                image: null
            };

            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Update section image alt
    const updateSectionImageAlt = useCallback((sectionIndex, altText) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const updatedImage = { ...updatedSections[sectionIndex].image };
            updatedImage.alt = altText;
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                image: updatedImage
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Update section image caption
    const updateSectionImageCaption = useCallback((sectionIndex, caption) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const updatedImage = { ...updatedSections[sectionIndex].image };
            updatedImage.caption = caption;
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                image: updatedImage
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Clear all section images
    const clearSectionImages = useCallback((sectionIndex) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const imageToDelete = updatedSections[sectionIndex].image;

            // Delete from Firebase
            if (imageToDelete?.src && !imageToDelete.isUploading && !imageToDelete.src.startsWith('blob:')) {
                deleteSingleImage(imageToDelete.src).catch(() => {
                    // Silently fail
                });
            }
            if (imageToDelete?.src?.startsWith('blob:')) {
                URL.revokeObjectURL(imageToDelete.src);
            }

            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                image: null
            };

            return { ...prev, sections: updatedSections };
        });
    }, []);

    // ========== ✅ SECTION VIDEO MANAGEMENT (ДОБАВЕНО) ==========

    // Handle section video upload
    const handleSectionVideoUpload = useCallback(async (e, sectionIndex) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateVideo(file);
        if (!validation.valid) {
            notify('error', validation.error);
            return;
        }

        // Reset input
        if (e.target) e.target.value = '';

        // Set uploading state
        setVideoUploadState(prev => ({
            ...prev,
            [sectionIndex]: { isUploading: true, progress: 0, stage: 'thumbnail' }
        }));

        try {
            const result = await uploadVideoWithThumbnail(
                file,
                `publications/section-videos`,
                ({ stage, progress }) => {
                    setVideoUploadState(prev => ({
                        ...prev,
                        [sectionIndex]: { isUploading: true, progress, stage }
                    }));
                }
            );

            // Update section with video data
            setValues(prev => {
                const updatedSections = [...(prev.sections || [])];
                updatedSections[sectionIndex] = {
                    ...updatedSections[sectionIndex],
                    videoUrl: result.videoUrl,
                    thumbnailUrl: result.thumbnailUrl
                };
                return { ...prev, sections: updatedSections };
            });

            // Clear uploading state
            setVideoUploadState(prev => ({
                ...prev,
                [sectionIndex]: { isUploading: false, progress: 100, stage: null }
            }));

            notify('success', 'Видеото е качено успешно!');

        } catch (error) {
            console.error('Video upload error:', error);
            setVideoUploadState(prev => ({
                ...prev,
                [sectionIndex]: { isUploading: false, progress: 0, stage: null }
            }));
            notify('error', 'Грешка при качване на видео');
        }
    }, [setValues]);

    // Remove section video
    const removeSectionVideo = useCallback(async (sectionIndex) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const section = updatedSections[sectionIndex];

            // Delete video from Firebase if needed
            if (section?.videoUrl && section.videoUrl.includes('firebasestorage.googleapis.com')) {
                deleteSingleImage(section.videoUrl).catch(() => {
                    console.log('Could not delete video from Firebase');
                });
            }
            
            // Delete thumbnail from Firebase if needed
            if (section?.thumbnailUrl && section.thumbnailUrl.includes('firebasestorage.googleapis.com')) {
                deleteSingleImage(section.thumbnailUrl).catch(() => {
                    console.log('Could not delete thumbnail from Firebase');
                });
            }

            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                videoUrl: null,
                thumbnailUrl: null
            };

            return { ...prev, sections: updatedSections };
        });
        
        notify('success', 'Видеото е премахнато');
    }, [setValues]);

    // ========== END SECTION VIDEO MANAGEMENT ==========

    // Main image management
    const handleMainImageUpload = useCallback(async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        let blobUrl = null;

        try {
            blobUrl = URL.createObjectURL(file);

            // Update UI immediately with blob URL
            setValues(prev => ({
                ...prev,
                mainImage: {
                    ...prev.mainImage,
                    src: blobUrl,
                    alt: '',
                    caption: '',
                    isUploading: true
                }
            }));

            e.target.value = '';

            // Upload to Firebase
            const compressedFile = await compressImage(file, {
                maxSizeMB: 2,
                maxWidthOrHeight: 1920
            });

            const url = await uploadFileWithProgress(
                compressedFile,
                'publications/main-images',
                () => {} // Progress callback
            );

            // Replace blob URL with Firebase URL
            setValues(prev => ({
                ...prev,
                mainImage: {
                    ...prev.mainImage,
                    src: url,
                    alt: prev.mainImage.alt || '',
                    caption: prev.mainImage.caption || '',
                    isUploading: false
                }
            }));

            // Clean up blob URL
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }

            notify('success', 'Main image uploaded successfully!');

        } catch (error) {
            notify('error', 'Error uploading main image');

            // Reset on error
            setValues(prev => ({
                ...prev,
                mainImage: {
                    ...prev.mainImage,
                    src: '',
                    alt: '',
                    caption: '',
                    isUploading: false
                }
            }));

            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        }
    }, []);

    // Add main image from URL
    const addMainImageFromUrl = useCallback((imageUrl) => {
        if (!imageUrl.trim()) return;

        setValues(prev => ({
            ...prev,
            mainImage: {
                ...prev.mainImage,
                src: imageUrl.trim(),
                alt: '',
                caption: ''
            }
        }));
    }, []);

    // Remove main image
    const removeMainImage = useCallback(() => {
        setValues(prev => {
            const imageToDelete = prev.mainImage;

            // Delete from Firebase if needed
            if (imageToDelete?.src && !imageToDelete.isUploading && !imageToDelete.src.startsWith('blob:')) {
                deleteSingleImage(imageToDelete.src).catch(() => {
                    // Silently fail
                });
            }

            if (imageToDelete?.src?.startsWith('blob:')) {
                URL.revokeObjectURL(imageToDelete.src);
            }

            return {
                ...prev,
                mainImage: {
                    src: '',
                    alt: '',
                    caption: '',
                    gallery: []
                }
            };
        });
    }, []);

    // Update main image alt
    const updateMainImageAlt = useCallback((altText) => {
        setValues(prev => ({
            ...prev,
            mainImage: {
                ...prev.mainImage,
                alt: altText
            }
        }));
    }, []);

    // Update main image caption
    const updateMainImageCaption = useCallback((caption) => {
        setValues(prev => ({
            ...prev,
            mainImage: {
                ...prev.mainImage,
                caption: caption
            }
        }));
    }, []);

    return {
        // State
        values,
        setValues,
        errors: {},

        // Form handlers
        onChangeHandler,
        onBlurHandler: () => {},
        onSubmit,
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

        // ✅ Section video management (ДОБАВЕНО)
        handleSectionVideoUpload,
        removeSectionVideo,
        videoUploadState,

        // Main image management
        handleMainImageUpload,
        addMainImageFromUrl,
        removeMainImage,
        updateMainImageAlt,
        updateMainImageCaption
    };
};

export default useCreatePublication;