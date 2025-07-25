/* eslint-disable no-loop-func */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/notify";
import { generateSlug } from "../Articles/articleUtils/formatting";
import { isFormValid, validateArticleField, validateArticleForm } from "../Articles/articleUtils/validation";
import { allowedImageTypes, allowedVideoTypes, compressImage, uploadFileWithProgress, isValidImageUrl } from "../Articles/articleUtils/file-utils";
import { prepareArticleValuesForSubmit, addSectionToArray, removeSectionByIndex, createEmptySection, swapSectionMediaFiles } from "../Articles/articleUtils/article-utils";
import { updateSectionImageAlt, updateSectionImageInfo } from "../Articles/articleUtils/image-utils";
import { createSlateEditorState, isSlateEmpty, convertEditorToHtml, convertSlateToHtml } from "../Initiatives/CreateIniciative/Utils/initiativeEditorUtils";
import { addTagToArray, removeTagByIndex } from "../Articles/articleUtils/tags";

// Валидационни функции за Slate - мемоизирани
const isValidSlateValue = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  
  return value.every(node => {
    if (!node || typeof node !== 'object') return false;
    if (!node.children || !Array.isArray(node.children)) return false;
    
    return node.children.length > 0 && 
           node.children.some(child => child.hasOwnProperty('text'));
  });
};

const normalizeSlateValue = (value) => {
  if (!isValidSlateValue(value)) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  
  return value.map(node => ({
    ...node,
    children: node.children.length > 0 ? node.children : [{ text: '' }]
  }));
};

// Функция за дълбоко сравнение на Slate стойности
const isSlateValueEqual = (value1, value2) => {
  return JSON.stringify(value1) === JSON.stringify(value2);
};

export const useCreateArticle = (initialValues, onSubmitHandler) => {
  const { t } = useTranslation();
  
  // Подготвяме началните mediaFiles според наличните изображения от initialValues
  const preparedMediaFiles = useMemo(() => {
    const mediaFiles = {
      mainImage: [],
      sectionImages: {}
    };
    
    // Ако редактираме статия със съществуващи изображения в секциите
    if (initialValues && initialValues.sections) {
      initialValues.sections.forEach((section, index) => {
        if (Array.isArray(section.image) && section.image.length > 0) {
          // Имаме изображения в тази секция - добавяме празен масив
          mediaFiles.sectionImages[index] = [];
        }
      });
    }
    
    return mediaFiles;
  }, [initialValues]);

  const [values, setValues] = useState(() => {
    const defaultValues = {
      title: "",
      slug: "",
      author: "",
      publishDate: new Date().toISOString().split('T')[0],
      summary: createSlateEditorState(),
      mainImage: {
        type: "image", // "image", "slider", "video"
        sources: [],
        alt: createSlateEditorState(),
        thumbnail: "", // за видео
        videoUrl: "", // за видео
        subtitles: [], // за видео
        allowDownload: false, // за видео
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
    };

    if (!initialValues) return defaultValues;

    // Нормализиране на всички Slate стойности в initialValues
    const normalizedInitialValues = {
      ...initialValues,
      summary: normalizeSlateValue(initialValues.summary || createSlateEditorState()),
      mainImage: {
        ...initialValues.mainImage,
        alt: normalizeSlateValue(initialValues.mainImage?.alt || createSlateEditorState()),
      },
      sections: (initialValues.sections || []).map(section => ({
        ...section,
        content: normalizeSlateValue(section.content || createSlateEditorState()),
      })),
    };

    return normalizedInitialValues;
  });

  const [errors, setErrors] = useState({});
  const [mediaFiles, setMediaFiles] = useState(preparedMediaFiles);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const valuesRef = useRef(values);
  const mediaFilesRef = useRef(mediaFiles);
  
  // Винаги актуални стойности
  valuesRef.current = values;
  mediaFilesRef.current = mediaFiles;

  // Мемоизираме onChangeHandler
  const onChangeHandler = useCallback((e, isEditor = false, editorValue = null) => {
    if (isEditor) {
      const { name, value } = editorValue;
      
      setValues(prev => {
        // Проверка за промяна в секции
        if (name.includes("[") && name.includes("]")) {
          const matches = name.match(/sections\[(\d+)\]\.(\w+)/);
          if (matches) {
            const sectionIndex = parseInt(matches[1], 10);
            const sectionField = matches[2];
            
            // Проверяваме дали има реална промяна
            const currentValue = prev.sections[sectionIndex]?.[sectionField];
            if (isSlateValueEqual(currentValue, value)) {
              return prev; // Няма промяна - връщаме същия state
            }
            
            const normalizedValue = normalizeSlateValue(value);
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
              [sectionField]: normalizedValue
            };

            return {
              ...prev,
              sections: updatedSections
            };
          }
        } else if (name.includes(".")) {
          const [parent, child] = name.split(".");
          const currentValue = prev[parent]?.[child];
          
          if (isSlateValueEqual(currentValue, value)) {
            return prev; // Няма промяна
          }
          
          const normalizedValue = normalizeSlateValue(value);
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: normalizedValue
            }
          };
        } else {
          const currentValue = prev[name];
          if (isSlateValueEqual(currentValue, value)) {
            return prev; // Няма промяна
          }
          
          const normalizedValue = normalizeSlateValue(value);
          return {
            ...prev,
            [name]: normalizedValue
          };
        }
      });
      return;
    }

    const { name, value } = e.target;

    setValues(prev => {
      if (name === "title") {
        // Автоматично генерираме slug при промяна на заглавието
        const slug = generateSlug(value);
        if (prev.title === value && prev.slug === slug) {
          return prev; // Няма промяна
        }
        return {
          ...prev,
          title: value,
          slug: slug
        };
      } else if (name.includes("[") && name.includes("]")) {
        // Обработка на полета в секциите - sections[0].title
        const matches = name.match(/sections\[(\d+)\]\.(\w+)/);
        if (matches) {
          const sectionIndex = parseInt(matches[1], 10);
          const sectionField = matches[2];

          // Проверяваме за промяна
          const currentValue = prev.sections[sectionIndex]?.[sectionField];
          if (currentValue === value) {
            return prev;
          }

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
        const currentValue = prev[parent]?.[child];
        
        if (currentValue === value) {
          return prev;
        }
        
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      } else {
        if (prev[name] === value) {
          return prev;
        }
        
        return {
          ...prev,
          [name]: value
        };
      }
    });
  }, []);

  // Мемоизираме onBlurHandler
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

  // ФИКСИРАНИ ФУНКЦИИ С REFS:

  // Мемоизираме handleMainImageTypeChange
  const handleMainImageTypeChange = useCallback((type) => {
    setValues(prev => {
      if (prev.mainImage.type === type) {
        return prev;
      }
      
      return {
        ...prev,
        mainImage: {
          ...prev.mainImage,
          type: type,
          sources: []
        }
      };
    });
  }, []);

  // Мемоизираме addSection
  const addSection = useCallback(() => {
    setValues(prev => ({
      ...prev,
      sections: addSectionToArray(prev.sections)
    }));
  }, []);

  // ФИКСИРАН removeSection - използва ref
  const removeSection = useCallback((index) => {
    if (valuesRef.current.sections.length <= 1) {
      notify("notification.minimum_one_section");
      return;
    }

    setValues(prev => ({
      ...prev,
      sections: removeSectionByIndex(prev.sections, index)
    }));

    // Премахване от медийните файлове
    setMediaFiles(prev => {
      if (prev.sectionImages[index]) {
        const updatedMediaFiles = { ...prev };
        delete updatedMediaFiles.sectionImages[index];
        return updatedMediaFiles;
      }
      return prev;
    });
  }, []); // БЕЗ dependencies!

  // Мемоизираме addTag
  const addTag = useCallback((tag) => {
    setValues(prev => ({
      ...prev,
      tags: addTagToArray(prev.tags, tag)
    }));
  }, []);

  // Мемоизираме removeTag
  const removeTag = useCallback((index) => {
    setValues(prev => ({
      ...prev,
      tags: removeTagByIndex(prev.tags, index)
    }));
  }, []);

  // ФИКСИРАН handleMainImageFiles - използва ref
  const handleMainImageFiles = useCallback((files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const currentValues = valuesRef.current;

    // Проверяваме типа на медията
    if (currentValues.mainImage.type === "video") {
      // За видео, проверяваме само първия файл
      const videoFile = fileArray[0];
      if (!allowedVideoTypes.includes(videoFile.type)) {
        notify("notification.invalid_video_format");
        return;
      }

      // За видео, запазваме само един файл
      setMediaFiles(prev => ({
        ...prev,
        mainImage: [videoFile]
      }));
    } else {
      // За изображения, филтрираме по допустими формати
      const validFiles = fileArray.filter(file =>
        allowedImageTypes.includes(file.type)
      );

      if (validFiles.length !== fileArray.length) {
        notify("notification.invalid_image_format");
      }

      if (currentValues.mainImage.type === "slider") {
        // За слайдер можем да добавим множество изображения
        setMediaFiles(prev => ({
          ...prev,
          mainImage: [...prev.mainImage, ...validFiles]
        }));
      } else {
        // За единично изображение, заменяме съществуващото
        setMediaFiles(prev => ({
          ...prev,
          mainImage: [validFiles[0]]
        }));
      }
    }
  }, []); // БЕЗ dependencies!

  // Мемоизираме handleSectionImageFile
  const handleSectionImageFile = useCallback((files, sectionIndex) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => allowedImageTypes.includes(file.type));

    if (validFiles.length !== fileArray.length) {
      notify("notification.invalid_image_format");
    }

    if (validFiles.length === 0) return;

    // Обновяваме медийните файлове
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

    // Обновяваме стойностите на секцията
    setValues(prev => {
      const updatedSections = [...prev.sections];

      if (!updatedSections[sectionIndex]) {
        return prev;
      }

      if (!Array.isArray(updatedSections[sectionIndex].image)) {
        updatedSections[sectionIndex].image = [];
      }

      // Добавяме новите изображения към масива
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

  // Мемоизираме removeMainImage
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

  // Мемоизираме removeSectionImage
  const removeSectionImage = useCallback((sectionIndex, imageIndex = 0) => {
    setValues(prev => {
      const updatedSections = [...prev.sections];

      if (!updatedSections[sectionIndex]) {
        return prev;
      }

      if (Array.isArray(updatedSections[sectionIndex].image)) {
        // Премахваме изображението от масива
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

  // ФИКСИРАН validateForm - използва ref
  const validateForm = useCallback(() => {
    const newErrors = validateArticleForm(valuesRef.current, t);
    setErrors(newErrors);
    return isFormValid(newErrors);
  }, [t]); // БЕЗ values dependency!

  // ФИКСИРАН uploadAllMedia - използва ref
  const uploadAllMedia = useCallback(async () => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const currentValues = valuesRef.current;
      const currentMediaFiles = mediaFilesRef.current;
      
      let mainImageUrls = [];
      let totalFilesCount = currentMediaFiles.mainImage.length;

      // Изчисляваме общия брой на файловете за качване
      Object.values(currentMediaFiles.sectionImages).forEach(files => {
        if (Array.isArray(files)) {
          totalFilesCount += files.length;
        } else if (files) {
          totalFilesCount += 1;
        }
      });

      let uploadedFilesCount = 0;

      // 1. Качване на основното изображение/видео
      if (currentMediaFiles.mainImage.length > 0) {
        if (currentValues.mainImage.type === "image" || currentValues.mainImage.type === "slider") {
          // Качване на изображения
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
          // Качване на видео
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

      // 2. Качване на изображения за секции
      const sectionImagesUrlsBySection = {};

      // За всяка секция с изображения
      for (const [sectionIndex, files] of Object.entries(currentMediaFiles.sectionImages)) {
        if (!files || (Array.isArray(files) && files.length === 0)) continue;

        const filesArray = Array.isArray(files) ? files : [files];
        const sectionImagesUrls = [];

        // Качваме всеки файл
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

      // Обновяваме секциите с изображения
      for (const [sectionIndex, urls] of Object.entries(sectionImagesUrlsBySection)) {
        if (!urls || urls.length === 0) continue;

        const index = parseInt(sectionIndex, 10);
        if (isNaN(index) || !updatedValues.sections[index]) continue;

        // Получаваме текущите изображения
        let currentImages = updatedValues.sections[index].image || [];
        if (!Array.isArray(currentImages)) {
          currentImages = [];
        }

        // Заместваме временните URL с реалните
        const updatedImages = [...currentImages];

        // Намираме изображенията, които са файлове и ги заместваме с новите URL
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
              // Няма съответен URL, премахваме изображението
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
  }, []); // БЕЗ dependencies!

  // Мемоизираме handleMainImageUrl
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

  // Мемоизираме handleSectionImageUrl
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

  // Мемоизираме removeUrlImage
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

  // Мемоизираме updateImageAlt
  const updateImageAlt = useCallback((sectionIndex, imageIndex, altText) => {
    setValues(prev => ({
      ...prev,
      sections: updateSectionImageAlt(prev.sections, sectionIndex, imageIndex, altText)
    }));
  }, []);

  // Мемоизираме updateImageInfo
  const updateImageInfo = useCallback((sectionIndex, imageIndex, altText, captionText) => {
    
    setValues(prev => {
      
      const updatedSections = [...prev.sections];
      
      if (!updatedSections[sectionIndex]) {
        console.error('❌ Секция не съществува:', sectionIndex);
        return prev;
      }
      
      if (!Array.isArray(updatedSections[sectionIndex].image)) {
        console.error('❌ Image не е масив:', updatedSections[sectionIndex].image);
        return prev;
      }
      
      if (!updatedSections[sectionIndex].image[imageIndex]) {
        console.error('❌ Изображение не съществува на позиция:', imageIndex);
        return prev;
      }
      
      // Обновяваме изображението
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

  // Мемоизираме uploadThumbnailFile
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

      // След качване, актуализираме стойността на thumbnail
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

  // Мемоизираме swapSectionsMedia
  const swapSectionsMedia = useCallback((index1, index2) => {
    setMediaFiles(prev => ({
      ...prev,
      sectionImages: swapSectionMediaFiles(prev.sectionImages, index1, index2)
    }));
  }, []);

  // ФИКСИРАН onSubmit - използва ref
  const onSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Валидиране на формата
    const isValid = validateForm();
    if (!isValid) {
      notify("notification.form_contains_errors");
      return;
    }

    try {
      // Качване на медийни файлове
      const mediaUpdatedValues = await uploadAllMedia();

      // Използваме утилитата за подготовка на стойностите за изпращане
      const preparedValues = prepareArticleValuesForSubmit(mediaUpdatedValues);

      // Извикване на обработчика с обновените стойности
      if (onSubmitHandler) {
        await onSubmitHandler(preparedValues);
      }

      // Ресет на формата след успешно създаване
      setValues(initialValues);
      setMediaFiles({
        mainImage: [],
        sectionImages: {}
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting article:", error);
      notify("notification.error", error);
    }
  }, [validateForm, uploadAllMedia, onSubmitHandler, initialValues]);

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