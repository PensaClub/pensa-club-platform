import { useState } from "react";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/notify";
import { convertEditorToHtml, createEditorState } from "../Articles/articleUtils/editor";
import { generateSlug } from "../Articles/articleUtils/formatting";
import { isFormValid, validateArticleField, validateArticleForm } from "../Articles/articleUtils/validation";
import { allowedImageTypes, allowedVideoTypes, compressImage, uploadFileWithProgress } from "../Articles/articleUtils/file-utils";
import { prepareArticleValuesForSubmit } from "../Articles/articleUtils/article-utils";
// Импортиране на всички изнесени utility функции
// import { createEditorState, convertEditorToHtml, isEditorEmpty } from "../../utils/editor";
// import { generateSlug } from "../../utils/formatting";
// import { allowedImageTypes, allowedVideoTypes, compressImage, uploadFileWithProgress } from "../../utils/file-utils";
// import { prepareArticleValuesForSubmit } from "../../utils/article-utils";
// import { validateArticleField, validateArticleForm, isFormValid } from "../../utils/validation";

export const useCreateArticle = (initialValues, onSubmitHandler) => {
  const [values, setValues] = useState(initialValues || {
    title: "",
    slug: "",
    author: "",
    publishDate: new Date().toISOString().split('T')[0],
    summary: createEditorState(),
    mainImage: {
      type: "image", // "image", "slider", "video"
      sources: [],
      alt: createEditorState(),
      thumbnail: "", // за видео
      subtitles: [], // за видео
      allowDownload: false, // за видео
    },
    sections: [
      {
        title: "",
        content: createEditorState(),
        image: null, // {src: "", alt: createEditorState(), caption: createEditorState()}
        order: 1, // Добавено order поле
      },
    ],
    tags: [],
    previousArticle: null,
    nextArticle: null,
  });

  const [errors, setErrors] = useState({});
  const [mediaFiles, setMediaFiles] = useState({
    mainImage: [],
    sectionImages: {}
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();

  // Обработка на промени в полетата
  const onChangeHandler = (e, isEditor = false, editorValue = null) => {
    if (isEditor) {
      const { name, value } = editorValue;
      
      if (name.includes("[") && name.includes("]")) {
        // Обработка за секции
        const matches = name.match(/sections\[(\d+)\]\.(\w+)/);
        if (matches) {
          const sectionIndex = parseInt(matches[1], 10);
          const sectionField = matches[2];
          
          setValues(prev => {
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
          });
        }
      } else if (name.includes(".")) {
        const [parent, child] = name.split(".");
        setValues(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else {
        setValues(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    const { name, value } = e.target;
    
    if (name === "title") {
      // Автоматично генерираме slug при промяна на заглавието
      const slug = generateSlug(value);
      setValues(prev => ({
        ...prev,
        title: value,
        slug: slug
      }));
    } else if (name.includes("[") && name.includes("]")) {
      // Обработка на полета в секциите - sections[0].title
      const matches = name.match(/sections\[(\d+)\]\.(\w+)/);
      if (matches) {
        const sectionIndex = parseInt(matches[1], 10);
        const sectionField = matches[2];
        
        setValues(prev => {
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
        });
      }
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setValues(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Обработка на загуба на фокус за валидация
  const onBlurHandler = (e, isEditor = false, editorValue = null) => {
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
  };

  // Промяна на типа на основното изображение
  const handleMainImageTypeChange = (type) => {
    setValues(prev => ({
      ...prev,
      mainImage: {
        ...prev.mainImage,
        type: type,
        sources: []
      }
    }));
  };

  // Добавяне на нова секция
  const addSection = () => {
    setValues(prev => {
      const newOrder = prev.sections.length + 1;
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            title: "",
            content: createEditorState(),
            image: null,
            order: newOrder
          }
        ]
      };
    });
  };

  // Премахване на секция
  const removeSection = (index) => {
    if (values.sections.length <= 1) {
      notify("articles.minimum_one_section");
      return;
    }
    
    const updatedSections = [...values.sections];
    updatedSections.splice(index, 1);
    
    // Преномериране на order след изтриване
    const renumberedSections = updatedSections.map((section, idx) => ({
      ...section,
      order: idx + 1
    }));
    
    setValues(prev => ({
      ...prev,
      sections: renumberedSections
    }));

    // Премахване от медийните файлове
    if (mediaFiles.sectionImages[index]) {
      const updatedMediaFiles = { ...mediaFiles };
      delete updatedMediaFiles.sectionImages[index];
      setMediaFiles(updatedMediaFiles);
    }
  };

  // Добавяне на таг
  const addTag = (tag) => {
    if (!tag || values.tags.includes(tag)) return;
    
    setValues(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
  };

  // Премахване на таг
  const removeTag = (index) => {
    const updatedTags = [...values.tags];
    updatedTags.splice(index, 1);
    
    setValues(prev => ({
      ...prev,
      tags: updatedTags
    }));
  };

  // Обработка на файлове с изображения или видео за основното изображение
  const handleMainImageFiles = (files) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Проверяваме типа на медията
    if (values.mainImage.type === "video") {
      // За видео, проверяваме само първия файл
      const videoFile = fileArray[0];
      if (!allowedVideoTypes.includes(videoFile.type)) {
        notify("articles.invalid_video_format");
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
        notify("articles.invalid_image_format");
      }
      
      if (values.mainImage.type === "slider") {
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
  };

  // Обработка на файлове с изображения за секции
  const handleSectionImageFile = (file, sectionIndex) => {
    if (!file) return;
    
    if (!allowedImageTypes.includes(file.type)) {
      notify("articles.invalid_image_format");
      return;
    }
    
    setMediaFiles(prev => ({
      ...prev,
      sectionImages: {
        ...prev.sectionImages,
        [sectionIndex]: file
      }
    }));
  };

  // Премахване на изображение от основното изображение (слайдер)
  const removeMainImage = (index) => {
    const updatedFiles = [...mediaFiles.mainImage];
    updatedFiles.splice(index, 1);
    
    setMediaFiles(prev => ({
      ...prev,
      mainImage: updatedFiles
    }));
  };

  // Премахване на изображение от секция
  const removeSectionImage = (sectionIndex) => {
    const updatedMediaFiles = { ...mediaFiles };
    delete updatedMediaFiles.sectionImages[sectionIndex];
    
    // Премахваме и от самата секция
    const updatedSections = [...values.sections];
    updatedSections[sectionIndex].image = null;
    
    setMediaFiles(updatedMediaFiles);
    setValues(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Валидация на формата преди изпращане
  const validateForm = () => {
    const newErrors = validateArticleForm(values, t);
    setErrors(newErrors);
    return isFormValid(newErrors);
  };

  // Качване на всички медийни файлове
  const uploadAllMedia = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let mainImageUrls = [];
      let sectionImageUrls = {};
      
      // 1. Качване на основното изображение/видео
      if (mediaFiles.mainImage.length > 0) {
        if (values.mainImage.type === "image" || values.mainImage.type === "slider") {
          // Качване на изображения
          const imageUploads = mediaFiles.mainImage.map(async (file) => {
            const compressedFile = await compressImage(file, {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920
            });
            
            // Използваме утилитата за качване на файл с прогрес
            return uploadFileWithProgress(
              compressedFile, 
              'articles/images', 
              (progress) => {
                // Обновяваме общия прогрес
                setUploadProgress(prevProgress => 
                  (prevProgress + progress / (mediaFiles.mainImage.length + Object.keys(mediaFiles.sectionImages).length)) / 2
                );
              }
            );
          });
          
          mainImageUrls = await Promise.all(imageUploads);
        } else if (values.mainImage.type === "video") {
          // Качване на видео
          const videoFile = mediaFiles.mainImage[0];
          const videoUrl = await uploadFileWithProgress(
            videoFile, 
            'articles/videos', 
            (progress) => {
              setUploadProgress(progress / 2); // Първата половина на прогреса
            }
          );
          
          mainImageUrls = [videoUrl];
        }
      }
      
      // 2. Качване на изображения за секции
      if (Object.keys(mediaFiles.sectionImages).length > 0) {
        const sectionImagePromises = Object.entries(mediaFiles.sectionImages).map(
          async ([sectionIndex, file]) => {
            const compressedFile = await compressImage(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1200
            });
            
            const url = await uploadFileWithProgress(
              compressedFile, 
              'articles/section-images', 
              (progress) => {
                // Обновяваме общия прогрес за втората половина
                setUploadProgress(50 + progress / (2 * Object.keys(mediaFiles.sectionImages).length));
              }
            );
            
            return { sectionIndex, url };
          }
        );
        
        const sectionResults = await Promise.all(sectionImagePromises);
        sectionResults.forEach(({ sectionIndex, url }) => {
          sectionImageUrls[sectionIndex] = url;
        });
      }
      
      // Обновяваме стойностите с URL адресите
      const updatedValues = { ...values };
      
      // Обновяваме основното изображение/видео
      if (mainImageUrls.length > 0) {
        updatedValues.mainImage.sources = [
          ...mainImageUrls,
          ...updatedValues.mainImage.sources
        ];
      }
      
      // Обновяваме секциите с изображения
      for (const [index, url] of Object.entries(sectionImageUrls)) {
        updatedValues.sections[index].image = {
          src: url,
          alt: updatedValues.sections[index].image?.alt || createEditorState(),
          caption: updatedValues.sections[index].image?.caption || createEditorState()
        };
      }
      
      setUploadProgress(100);
      setIsUploading(false);
      
      return updatedValues;
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  // Изпращане на формата
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Валидиране на формата
    const isValid = validateForm();
    if (!isValid) {
      notify("articles.form_contains_errors");
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
      notify("error", error);
    }
  };

  return {
    values,
    setValues,
    errors,
    isUploading,
    uploadProgress,
    onChangeHandler,
    onBlurHandler,
    onSubmit,
    handleMainImageTypeChange,
    handleMainImageFiles,
    handleSectionImageFile,
    removeMainImage,
    removeSectionImage,
    addSection,
    removeSection,
    addTag,
    removeTag,
    mediaFiles,
    createEditorState,
    convertEditorToHtml
  };
};