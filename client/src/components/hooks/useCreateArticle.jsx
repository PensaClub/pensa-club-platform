import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/notify.jsx";
// import { generateSlug } from "../Articles/articleUtils/formatting";
import { isFormValid, validateArticleField, validateArticleForm } from "../Articles/articleUtils/validation";
import { allowedImageTypes, allowedVideoTypes, compressImage, uploadFileWithProgress, isValidImageUrl } from "../Articles/articleUtils/file-utils";
import { prepareArticleValuesForSubmit, addSectionToArray, removeSectionByIndex, swapSectionMediaFiles } from "../Articles/articleUtils/article-utils.jsx";
import { updateSectionImageAlt } from "../Articles/articleUtils/image-utils";
import { addTagToArray, removeTagByIndex } from "../Articles/articleUtils/tags";
import { htmlToSlate, isHtmlContent, createSlateEditorState } from "../Articles/articleUtils/htmlToSlate";
import { generateSlug } from "../../utils/slugUtils";

const convertSlateToHtml = (slateValue) => {
  if (!Array.isArray(slateValue)) return '';

  const serialize = (node) => {
    if (typeof node === 'string') return node;
    if (!node || !node.children) return '';

    // 🔧 БЕЗОПАСНА обработка на children
    const children = node.children && Array.isArray(node.children)
      ? node.children.map(n => serialize(n)).join('')
      : '';

    switch (node.type) {
      case 'heading-one':
        return `<h1>${children}</h1>`;
      case 'heading-two':
        return `<h2>${children}</h2>`;
      case 'block-quote':
        return `<blockquote>${children}</blockquote>`;
      case 'bulleted-list':
        return `<ul>${children}</ul>`;
      case 'numbered-list':
        return `<ol>${children}</ol>`;
      case 'list-item':
        return `<li>${children}</li>`;
      case 'paragraph':
      default:
        let text = children;
        if (node.bold) text = `<strong>${text}</strong>`;
        if (node.italic) text = `<em>${text}</em>`;
        if (node.underline) text = `<u>${text}</u>`;
        return node.type === 'paragraph' ? `<p>${text}</p>` : text;
    }
  };

  try {
    const result = slateValue.map(serialize).join('');
    return result || '';
  } catch (error) {
    console.error('Грешка при конвертиране на Slate в HTML:', error);
    return '';
  }
};

// Проверка дали Slate е празен
const isSlateEmpty = (value) => {
  if (!Array.isArray(value) || value.length === 0) return true;

  return value.every(node => {
    if ('text' in node) {
      return !node.text || node.text.trim() === '';
    }

    if (node.type) {
      return false;
    }

    if (!node.children || node.children.length === 0) return true;
    return node.children.every(child => !child.text || child.text.trim() === '');
  });
};

export const useCreateArticle = (initialValues, onSubmitHandler) => {
  const { t } = useTranslation();

  const defaultValues = useMemo(() => ({
    title: "",
    slug: "",
    author: "",
    publishDate: new Date().toISOString().split('T')[0],
    summary: createSlateEditorState(),
    mainImage: {
      type: "image",
      sources: [],
      alt: createSlateEditorState(),
      thumbnail: "",
      videoUrl: "",
      subtitles: [],
      allowDownload: false,
    },
    sections: [
      {
        title: "",
        content: createSlateEditorState(),
        image: [],
        order: 1,
      },
    ],
    tags: [],
    previousArticle: null,
    nextArticle: null,
  }), []);

  // 🔧 ПРАВИЛНО използване на initial values
  const [values, setValues] = useState(() => {
    return initialValues || defaultValues;
  });

  // 🔧 ВАЖНО: Update values когато initialValues се променят
  useEffect(() => {
    if (initialValues && initialValues !== values) {
      setValues(initialValues);
    }
  }, [initialValues]);

  const [errors, setErrors] = useState({});
  const [mediaFiles, setMediaFiles] = useState({
    mainImage: [],
    sectionImages: {}
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const valuesRef = useRef(values);
  const mediaFilesRef = useRef(mediaFiles);

  valuesRef.current = values;
  mediaFilesRef.current = mediaFiles;

  // onChange handler
  const onChangeHandler = useCallback((e, isEditor = false, editorValue = null) => {
    if (isEditor) {
      const { name, value } = editorValue;

      setValues(prev => {
        if (name.includes("[") && name.includes("]")) {
          const matches = name.match(/sections\[(\d+)\]\.(\w+)/);
          if (matches) {
            const sectionIndex = parseInt(matches[1], 10);
            const sectionField = matches[2];

            const updatedSections = [...prev.sections];

            if (!updatedSections[sectionIndex]) {
              updatedSections[sectionIndex] = {
                order: sectionIndex + 1,
                content: createSlateEditorState(),
                title: "",
                image: []
              };
            }

            updatedSections[sectionIndex] = {
              ...updatedSections[sectionIndex],
              [sectionField]: value
            };

            return {
              ...prev,
              sections: updatedSections
            };
          }
        } else if (name.includes(".")) {
          const [parent, child] = name.split(".");
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: value
            }
          };
        } else {
          return {
            ...prev,
            [name]: value
          };
        }
      });
      return;
    }

    const { name, value } = e.target;

    setValues(prev => {
      if (name === "title") {
        // Автоматично генериране на slug от title
        const slug = generateSlug(value);
        return {
          ...prev,
          title: value,
          slug: slug
        };
      } else if (name.includes("[") && name.includes("]")) {
        const matches = name.match(/sections\[(\d+)\]\.(\w+)/);
        if (matches) {
          const sectionIndex = parseInt(matches[1], 10);
          const sectionField = matches[2];

          const updatedSections = [...prev.sections];
          if (!updatedSections[sectionIndex]) {
            updatedSections[sectionIndex] = { order: sectionIndex + 1 };
          }

          updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            [sectionField]: value
          };

          return {
            ...prev,
            sections: updatedSections
          };
        }
      } else if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });
  }, []);

  // onBlur handler
  const onBlurHandler = useCallback((e, isEditor = false, editorValue = null) => {
    try {
      if (isEditor) {
        const { name, value } = editorValue;
        const error = validateArticleField(name, value, t);
        setErrors(prev => ({ ...prev, [name]: error }));
        return;
      }

      const { name, value } = e.target;
      const error = validateArticleField(name, value, t);

      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } catch (error) {
      console.error('Грешка при валидация:', error);
    }
  }, [t]);

  // Main image type change
  const handleMainImageTypeChange = useCallback((type) => {
    setValues(prev => ({
      ...prev,
      mainImage: {
        ...prev.mainImage,
        type: type,
        sources: []
      }
    }));
  }, []);

  // Section management
  const addSection = useCallback(() => {
    setValues(prev => ({
      ...prev,
      sections: addSectionToArray(prev.sections)
    }));
  }, []);

  const removeSection = useCallback((index) => {
    if (valuesRef.current.sections.length <= 1) {
      notify("notification.minimum_one_section");
      return;
    }

    setValues(prev => ({
      ...prev,
      sections: removeSectionByIndex(prev.sections, index)
    }));

    setMediaFiles(prev => {
      if (prev.sectionImages[index]) {
        const updatedMediaFiles = { ...prev };
        delete updatedMediaFiles.sectionImages[index];
        return updatedMediaFiles;
      }
      return prev;
    });
  }, []);

  // Tag management
  const addTag = useCallback((tag) => {
    setValues(prev => ({
      ...prev,
      tags: addTagToArray(prev.tags, tag)
    }));
  }, []);

  const removeTag = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      tags: removeTagByIndex(prev.tags, index)
    }));
  }, []);

  // Media file handling
  const handleMainImageFiles = useCallback((files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const currentValues = valuesRef.current;

    if (currentValues.mainImage.type === "video") {
      const videoFile = fileArray[0];
      if (!allowedVideoTypes.includes(videoFile.type)) {
        notify("notification.invalid_video_format");
        return;
      }

      setMediaFiles(prev => ({
        ...prev,
        mainImage: [videoFile]
      }));
    } else {
      const validFiles = fileArray.filter(file =>
        allowedImageTypes.includes(file.type)
      );

      if (validFiles.length !== fileArray.length) {
        notify("notification.invalid_image_format");
      }

      if (currentValues.mainImage.type === "slider") {
        setMediaFiles(prev => ({
          ...prev,
          mainImage: [...prev.mainImage, ...validFiles]
        }));
      } else {
        setMediaFiles(prev => ({
          ...prev,
          mainImage: [validFiles[0]]
        }));
      }
    }
  }, []);

  const handleSectionImageFile = useCallback((files, sectionIndex) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => allowedImageTypes.includes(file.type));

    if (validFiles.length !== fileArray.length) {
      notify("notification.invalid_image_format");
    }

    if (validFiles.length === 0) return;

    setMediaFiles(prev => {
      const existingFiles = prev.sectionImages[sectionIndex] || [];
      return {
        ...prev,
        sectionImages: {
          ...prev.sectionImages,
          [sectionIndex]: [...existingFiles, ...validFiles]
        }
      };
    });

    setValues(prev => {
      const updatedSections = [...prev.sections];

      if (!updatedSections[sectionIndex]) {
        return prev;
      }

      if (!Array.isArray(updatedSections[sectionIndex].image)) {
        updatedSections[sectionIndex].image = [];
      }

      const newImages = validFiles.map(file => ({
        src: URL.createObjectURL(file),
        alt: createSlateEditorState(),
        caption: createSlateEditorState(),
        isFile: true,
        file: file
      }));

      updatedSections[sectionIndex].image = [
        ...updatedSections[sectionIndex].image,
        ...newImages
      ];

      return {
        ...prev,
        sections: updatedSections
      };
    });

    return true;
  }, []);

  // Image URL handlers
  const handleMainImageUrl = useCallback((url) => {
    if (!url) return false;

    if (!isValidImageUrl(url)) {
      notify("notification.invalid_image_url");
      return false;
    }

    setValues(prev => ({
      ...prev,
      mainImage: {
        ...prev.mainImage,
        sources: [...prev.mainImage.sources, url]
      }
    }));

    notify("notification.image_url_added");
    return true;
  }, []);

  const handleSectionImageUrl = useCallback((url, sectionIndex) => {
    if (!url) return false;

    if (!url.match(/^(https?:\/\/)(.+)\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
      notify("notification.invalid_image_url");
      return false;
    }

    setValues(prev => {
      const updatedSections = [...prev.sections];

      if (!updatedSections[sectionIndex]) {
        return prev;
      }

      if (!Array.isArray(updatedSections[sectionIndex].image)) {
        updatedSections[sectionIndex].image = [];
      }

      updatedSections[sectionIndex].image.push({
        src: url,
        alt: createSlateEditorState(),
        caption: createSlateEditorState()
      });

      return {
        ...prev,
        sections: updatedSections
      };
    });

    notify("notification.section_image_url_added");
    return true;
  }, []);

  // Remove functions
  const removeUrlImage = useCallback((index) => {
    setValues(prev => {
      const newSources = [...prev.mainImage.sources];
      newSources.splice(index, 1);

      return {
        ...prev,
        mainImage: {
          ...prev.mainImage,
          sources: newSources
        }
      };
    });
  }, []);

  const removeMainImage = useCallback((index) => {
    setMediaFiles(prev => {
      const updatedFiles = [...prev.mainImage];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        mainImage: updatedFiles
      };
    });
  }, []);

  const removeSectionImage = useCallback((sectionIndex, imageIndex = 0) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];

      if (!updatedSections[sectionIndex]) {
        return prev;
      }

      if (Array.isArray(updatedSections[sectionIndex].image)) {
        updatedSections[sectionIndex].image.splice(imageIndex, 1);
      } else {
        updatedSections[sectionIndex].image = [];
      }

      return {
        ...prev,
        sections: updatedSections
      };
    });

    setMediaFiles(prev => {
      const sectionFiles = prev.sectionImages[sectionIndex] || [];

      if (sectionFiles.length > imageIndex) {
        const updatedFiles = [...sectionFiles];
        updatedFiles.splice(imageIndex, 1);

        return {
          ...prev,
          sectionImages: {
            ...prev.sectionImages,
            [sectionIndex]: updatedFiles.length > 0 ? updatedFiles : []
          }
        };
      }

      return prev;
    });
  }, []);

  // Update image info
  const updateImageInfo = useCallback((sectionIndex, imageIndex, altText, captionText) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];

      if (!updatedSections[sectionIndex]) {
        return prev;
      }

      if (!Array.isArray(updatedSections[sectionIndex].image)) {
        return prev;
      }

      if (!updatedSections[sectionIndex].image[imageIndex]) {
        return prev;
      }

      updatedSections[sectionIndex].image[imageIndex] = {
        ...updatedSections[sectionIndex].image[imageIndex],
        alt: altText,
        caption: captionText
      };

      return {
        ...prev,
        sections: updatedSections
      };
    });
  }, []);

  const updateImageAlt = useCallback((sectionIndex, imageIndex, altText) => {
    setValues(prev => ({
      ...prev,
      sections: updateSectionImageAlt(prev.sections, sectionIndex, imageIndex, altText)
    }));
  }, []);

  // Upload thumbnail
  const uploadThumbnailFile = useCallback(async (file) => {
    try {
      setIsUploading(true);

      const thumbnailUrl = await uploadFileWithProgress(
        file,
        'articles/thumbnails',
        (progress) => {
          setUploadProgress(progress);
        }
      );

      onChangeHandler({
        target: {
          name: "mainImage.thumbnail",
          value: thumbnailUrl
        }
      });

      notify("notification.thumbnail_upload_success");
    } catch (error) {
      console.error("Грешка при качване на миниатюра:", error);
      notify("notification.thumbnail_upload_error", error);
    } finally {
      setIsUploading(false);
    }
  }, [onChangeHandler]);

  // Swap sections media
  const swapSectionsMedia = useCallback((index1, index2) => {
    setMediaFiles(prev => ({
      ...prev,
      sectionImages: swapSectionMediaFiles(prev.sectionImages, index1, index2)
    }));
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = validateArticleForm(valuesRef.current, t);
    setErrors(newErrors);
    return isFormValid(newErrors);
  }, [t]);

  // Upload all media
  const uploadAllMedia = useCallback(async () => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const currentValues = valuesRef.current;
      const currentMediaFiles = mediaFilesRef.current;

      let mainImageUrls = [];
      let totalFilesCount = currentMediaFiles.mainImage.length;

      Object.values(currentMediaFiles.sectionImages).forEach(files => {
        if (Array.isArray(files)) {
          totalFilesCount += files.length;
        } else if (files) {
          totalFilesCount += 1;
        }
      });

      let uploadedFilesCount = 0;

      // Upload main images/videos
      if (currentMediaFiles.mainImage.length > 0) {
        if (currentValues.mainImage.type === "image" || currentValues.mainImage.type === "slider") {
          const imageUploads = currentMediaFiles.mainImage.map(async (file) => {
            const compressedFile = await compressImage(file, {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920
            });

            const url = await uploadFileWithProgress(
              compressedFile,
              'articles/images',
              (progress) => {
                uploadedFilesCount = Math.min(uploadedFilesCount + (progress / 100), totalFilesCount);
                setUploadProgress((uploadedFilesCount / totalFilesCount) * 100);
              }
            );

            return url;
          });

          mainImageUrls = await Promise.all(imageUploads);
        } else if (currentValues.mainImage.type === "video") {
          const videoFile = currentMediaFiles.mainImage[0];
          const videoUrl = await uploadFileWithProgress(
            videoFile,
            'articles/videos',
            (progress) => {
              uploadedFilesCount = Math.min(uploadedFilesCount + (progress / 100), totalFilesCount);
              setUploadProgress((uploadedFilesCount / totalFilesCount) * 100);
            }
          );

          mainImageUrls = [videoUrl];
        }
      }

      // Upload section images
      const sectionImagesUrlsBySection = {};

      for (const [sectionIndex, files] of Object.entries(currentMediaFiles.sectionImages)) {
        if (!files || (Array.isArray(files) && files.length === 0)) continue;

        const filesArray = Array.isArray(files) ? files : [files];
        const sectionImagesUrls = [];

        for (const file of filesArray) {
          const compressedFile = await compressImage(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200
          });

          const url = await uploadFileWithProgress(
            compressedFile,
            'articles/section-images',
            (progress) => {
              uploadedFilesCount = Math.min(uploadedFilesCount + (progress / 100), totalFilesCount);
              setUploadProgress((uploadedFilesCount / totalFilesCount) * 100);
            }
          );

          sectionImagesUrls.push(url);
        }

        sectionImagesUrlsBySection[sectionIndex] = sectionImagesUrls;
      }

      const updatedValues = { ...currentValues };

      if (mainImageUrls.length > 0) {
        updatedValues.mainImage.sources = [
          ...mainImageUrls,
          ...updatedValues.mainImage.sources
        ];
      }

      // Update sections with uploaded images
      for (const [sectionIndex, urls] of Object.entries(sectionImagesUrlsBySection)) {
        if (!urls || urls.length === 0) continue;

        const index = parseInt(sectionIndex, 10);
        if (isNaN(index) || !updatedValues.sections[index]) continue;

        let currentImages = updatedValues.sections[index].image || [];
        if (!Array.isArray(currentImages)) {
          currentImages = [];
        }

        const updatedImages = [...currentImages];

        let urlIndex = 0;
        for (let i = 0; i < updatedImages.length; i++) {
          if (updatedImages[i] && updatedImages[i].isFile) {
            if (urlIndex < urls.length) {
              updatedImages[i] = {
                src: urls[urlIndex],
                alt: updatedImages[i].alt || createSlateEditorState(),
                caption: updatedImages[i].caption || createSlateEditorState()
              };
              urlIndex++;
            } else {
              updatedImages.splice(i, 1);
              i--;
            }
          }
        }

        updatedValues.sections[index].image = updatedImages;
      }

      setUploadProgress(100);
      setIsUploading(false);

      return updatedValues;
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  }, []);

  // Submit handler
  const onSubmit = useCallback(async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      notify("notification.form_contains_errors");
      return;
    }

    try {
      const mediaUpdatedValues = await uploadAllMedia();
      const preparedValues = prepareArticleValuesForSubmit(mediaUpdatedValues);

      if (onSubmitHandler) {
        await onSubmitHandler(preparedValues);
      }

      // DON'T RESET VALUES ON EDIT
      if (!initialValues) {
        setValues(defaultValues);
        setMediaFiles({
          mainImage: [],
          sectionImages: {}
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      notify("notification.error", error);
    }
  }, [validateForm, uploadAllMedia, onSubmitHandler, initialValues, defaultValues]);

  return {
    values,
    setValues,
    uploadThumbnailFile,
    errors,
    isUploading,
    uploadProgress,
    onChangeHandler,
    updateImageAlt,
    onBlurHandler,
    swapSectionsMedia,
    onSubmit,
    handleMainImageTypeChange,
    handleMainImageFiles,
    handleSectionImageFile,
    handleMainImageUrl,
    handleSectionImageUrl,
    removeUrlImage,
    removeMainImage,
    removeSectionImage,
    addSection,
    updateImageInfo,
    removeSection,
    addTag,
    removeTag,
    mediaFiles,
    createSlateEditorState,
    convertEditorToHtml: convertSlateToHtml
  };
};