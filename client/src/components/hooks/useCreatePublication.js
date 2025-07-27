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

const useCreatePublication = (initialValues, onSubmitHandler) => {
    const { t } = useTranslation();
    const { userEmail } = useAuthContext();

    const defaultValues = useMemo(() => ({
        // Basic info only
        title: '',
        slug: '',
        shortDescription: '',
        category: '',

        // Add sections array
        sections: [],

        // Meta
        userEmail: userEmail || '',
        isDraft: true
    }), [userEmail]);

    const [values, setValues] = useState(initialValues || defaultValues);

    // Generate slug from title (same as project/initiative)
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
        const { name, value } = e.target;

        // Auto-generate slug when title changes
        if (name === 'title') {
            setValues(prev => ({
                ...prev,
                title: value,
                slug: generateSlug(value)
            }));
        } else {
            setValues(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }, [generateSlug]);

    // Form submission
    const onSubmit = useCallback(async (e) => {
        e.preventDefault();

        try {
            console.log('Form values:', values);
            notify('success', 'Form submitted successfully!');

            // Call the onSubmitHandler if provided
            if (onSubmitHandler) {
                await onSubmitHandler(values);
            }
        } catch (error) {
            console.error('Submission error:', error);
            notify('error', 'Error submitting form');
        }
    }, [values, onSubmitHandler]);

    // Section management
    const addSection = useCallback(() => {
        const newSection = {
            titleSlug: `section-${Date.now()}`,
            title: '',
            content: createSlateEditorState(),
            images: []
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

        const fileArray = Array.from(files);
        const newImages = [];

        fileArray.forEach((file, index) => {
            try {
                const blobUrl = URL.createObjectURL(file);
                newImages.push({
                    src: blobUrl,
                    alt: '',
                    caption: '',
                    isUploading: true,
                    fileId: Date.now() + Math.random() + index
                });
            } catch (error) {
                console.error(`Error creating blob for ${file.name}:`, error);
            }
        });

        if (newImages.length === 0) return;

        // Update UI immediately
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const existingImages = updatedSections[sectionIndex].images || [];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: [...existingImages, ...newImages]
            };
            return { ...prev, sections: updatedSections };
        });

        e.target.value = '';

        try {
            const uploadedImages = [];
            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];
                try {
                    const compressedFile = await compressImage(file, {
                        maxSizeMB: 2,
                        maxWidthOrHeight: 1920
                    });

                    const url = await uploadFileWithProgress(
                        compressedFile,
                        'publications/section-images',
                        (progress) => { }
                    );

                    uploadedImages.push({
                        src: url,
                        alt: '',
                        caption: ''
                    });
                } catch (fileError) {
                    console.error(`Error uploading file ${i + 1}:`, fileError);
                    uploadedImages.push(null);
                }
            }

            const validUploads = uploadedImages.filter(img => img !== null);

            // Replace blob URLs with Firebase URLs
            setValues(prev => {
                const updatedSections = [...(prev.sections || [])];
                let updatedImages = [...(updatedSections[sectionIndex].images || [])];
                let uploadIndex = 0;

                newImages.forEach((blobImg) => {
                    if (uploadIndex >= validUploads.length) return;
                    const firebaseImg = validUploads[uploadIndex];
                    if (!firebaseImg) return;

                    const imageIndex = updatedImages.findIndex(img => img?.src === blobImg.src);
                    if (imageIndex !== -1) {
                        updatedImages[imageIndex] = {
                            ...firebaseImg,
                            alt: updatedImages[imageIndex].alt || '',
                            caption: updatedImages[imageIndex].caption || ''
                        };
                    }

                    try {
                        URL.revokeObjectURL(blobImg.src);
                    } catch (e) {
                        console.warn('Could not revoke blob URL:', e);
                    }

                    uploadIndex++;
                });

                updatedSections[sectionIndex] = {
                    ...updatedSections[sectionIndex],
                    images: updatedImages.filter(img => img && img.src)
                };

                return { ...prev, sections: updatedSections };
            });

            if (validUploads.length > 0) {
                notify('success', `Uploaded ${validUploads.length} images`);
            }

        } catch (error) {
            console.error('Upload error:', error);
            notify('error', 'Error uploading images');
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
            const existingImages = updatedSections[sectionIndex].images || [];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: [...existingImages, newImage]
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Remove section image
    const removeSectionImage = useCallback((sectionIndex, imageIndex) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const imageToDelete = updatedSections[sectionIndex].images[imageIndex];

            // Remove image from array
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: updatedSections[sectionIndex].images.filter((_, i) => i !== imageIndex)
            };

            // Delete from Firebase if needed
            if (imageToDelete?.src && !imageToDelete.isUploading && !imageToDelete.src.startsWith('blob:')) {
                deleteSingleImage(imageToDelete.src).catch(error => {
                    console.error('Error deleting from Firebase:', error);
                });
            }

            if (imageToDelete?.src?.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(imageToDelete.src);
                } catch (e) {
                    console.warn('Could not revoke blob URL:', e);
                }
            }

            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Update section image alt
    const updateSectionImageAlt = useCallback((sectionIndex, imageIndex, altText) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const updatedImages = [...updatedSections[sectionIndex].images];
            updatedImages[imageIndex] = {
                ...updatedImages[imageIndex],
                alt: altText
            };
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: updatedImages
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Update section image caption
    const updateSectionImageCaption = useCallback((sectionIndex, imageIndex, caption) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const updatedImages = [...updatedSections[sectionIndex].images];
            updatedImages[imageIndex] = {
                ...updatedImages[imageIndex],
                caption: caption
            };
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: updatedImages
            };
            return { ...prev, sections: updatedSections };
        });
    }, []);

    // Clear all section images
    const clearSectionImages = useCallback((sectionIndex) => {
        setValues(prev => {
            const updatedSections = [...(prev.sections || [])];
            const imagesToDelete = updatedSections[sectionIndex].images || [];

            // Delete from Firebase
            imagesToDelete.forEach(image => {
                if (image?.src && !image.isUploading && !image.src.startsWith('blob:')) {
                    deleteSingleImage(image.src).catch(error => {
                        console.error('Error deleting from Firebase:', error);
                    });
                }
                if (image?.src?.startsWith('blob:')) {
                    try {
                        URL.revokeObjectURL(image.src);
                    } catch (e) {
                        console.warn('Could not revoke blob URL:', e);
                    }
                }
            });

            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                images: []
            };

            return { ...prev, sections: updatedSections };
        });
    }, []);

    return {
        // State
        values,
        setValues,
        errors: {}, // Add this if validation is needed

        // Form handlers
        onChangeHandler,
        onBlurHandler: () => {}, // Add this if needed
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
        clearSectionImages
    };
};

export default useCreatePublication;
