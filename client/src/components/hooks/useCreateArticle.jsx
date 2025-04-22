/* eslint-disable no-loop-func */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/notify";
import { convertEditorToHtml, createEditorState } from "../Articles/articleUtils/editor";
import { generateSlug } from "../Articles/articleUtils/formatting";
import { isFormValid, validateArticleField, validateArticleForm } from "../Articles/articleUtils/validation";
import { allowedImageTypes, allowedVideoTypes, compressImage, uploadFileWithProgress,isValidImageUrl } from "../Articles/articleUtils/file-utils";
import { prepareArticleValuesForSubmit, addSectionToArray, removeSectionByIndex, createEmptySection,swapSectionMediaFiles } from "../Articles/articleUtils/article-utils";
import { updateSectionImageAlt, updateSectionImageInfo } from "../Articles/articleUtils/image-utils";

import { addTagToArray, removeTagByIndex } from "../Articles/articleUtils/tags";
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
      videoUrl: "", // за видео
      subtitles: [], // за видео
      allowDownload: false, // за видео
    },
    sections: [
      {
        title: "",
        content: createEditorState(),
        image: [],
        order: 1,
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
  const [imageUrl, setImageUrl] = useState("");
  const [sectionImageUrls, setSectionImageUrls] = useState({});

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

  // Дожавям нова секция
  const addSection = () => {
    setValues(prev => ({
      ...prev,
      sections: addSectionToArray(prev.sections)
    }));
  };

  const removeSection = (index) => {
    if (values.sections.length <= 1) {
      notify("notification.minimum_one_section");
      return;
    }

    setValues(prev => ({
      ...prev,
      sections: removeSectionByIndex(prev.sections, index)
    }));

    // Премахване от медийните файлове
    if (mediaFiles.sectionImages[index]) {
      const updatedMediaFiles = { ...mediaFiles };
      delete updatedMediaFiles.sectionImages[index];
      setMediaFiles(updatedMediaFiles);
    }
  }

  const addTag = (tag) => {
    setValues(prev => ({
      ...prev,
      tags: addTagToArray(prev.tags, tag)
    }));
  };

  const removeTag = (index) => {
    setValues(prev => ({
      ...prev,
      tags: removeTagByIndex(prev.tags, index)
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

  // Обработка на файлове с изображения за секции - ПОДДЪРЖА МНОЖЕСТВО ФАЙЛОВЕ НАВЕДНЪЖ
  const handleSectionImageFile = (files, sectionIndex) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => allowedImageTypes.includes(file.type));

    if (validFiles.length !== fileArray.length) {
      notify("notification.invalid_image_format");
    }

    if (validFiles.length === 0) return;

    // Обновяваме медийните файлове
    setMediaFiles(prev => {
      // Проверяваме дали вече има масив за този индекс
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

      // Проверяваме дали секцията съществува
      if (!updatedSections[sectionIndex]) {
        return prev;
      }

      // Инициализираме масива с изображения, ако не съществува
      if (!Array.isArray(updatedSections[sectionIndex].image)) {
        updatedSections[sectionIndex].image = [];
      }

      // Добавяме новите изображения към масива
      const newImages = validFiles.map(file => ({
        src: URL.createObjectURL(file),
        alt: createEditorState(),
        caption: createEditorState(),
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

  const removeSectionImage = (sectionIndex, imageIndex = 0) => {

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
  };

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
      let totalFilesCount = mediaFiles.mainImage.length;

      // Изчисляваме общия брой на файловете за качване
      Object.values(mediaFiles.sectionImages).forEach(files => {
        if (Array.isArray(files)) {
          totalFilesCount += files.length;
        } else if (files) {
          totalFilesCount += 1;
        }
      });

      let uploadedFilesCount = 0;

      // 1. Качване на основното изображение/видео
      if (mediaFiles.mainImage.length > 0) {
        if (values.mainImage.type === "image" || values.mainImage.type === "slider") {
          // Качване на изображения
          const imageUploads = mediaFiles.mainImage.map(async (file) => {
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
        } else if (values.mainImage.type === "video") {
          // Качване на видео
          const videoFile = mediaFiles.mainImage[0];
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
      for (const [sectionIndex, files] of Object.entries(mediaFiles.sectionImages)) {
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

      const updatedValues = { ...values };

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
                alt: updatedImages[i].alt || createEditorState(),
                caption: updatedImages[i].caption || createEditorState()
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
  };

  // Добавяне на URL адрес към основното изображение (слайдер)
  const handleMainImageUrl = (url) => {
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
  };

  // Добавяне на URL адрес към секционно изображение
  const handleSectionImageUrl = (url, sectionIndex) => {
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
        alt: createEditorState(),
        caption: createEditorState()
      });

      return {
        ...prev,
        sections: updatedSections
      };
    });

    notify("notification.section_image_url_added");
    return true;
  };

  // Премахване на URL изображение от основната медия
  const removeUrlImage = (index) => {
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
  };

  const updateImageAlt = (sectionIndex, imageIndex, altText) => {
    setValues(prev => ({
      ...prev,
      sections: updateSectionImageAlt(prev.sections, sectionIndex, imageIndex, altText)
    }));
  };

  const updateImageInfo = (sectionIndex, imageIndex, altText, captionText) => {
    setValues(prev => ({
      ...prev,
      sections: updateSectionImageInfo(prev.sections, sectionIndex, imageIndex, altText, captionText)
    }));
  };

  const uploadThumbnailFile = async (file) => {
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
  };

  const swapSectionsMedia = (index1, index2) => {
    setMediaFiles(prev => ({
      ...prev,
      sectionImages: swapSectionMediaFiles(prev.sectionImages, index1, index2)
    }));
  };

  const onSubmit = async (e) => {
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
  };

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
    imageUrl,
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
    createEditorState,
    convertEditorToHtml
  };
};
