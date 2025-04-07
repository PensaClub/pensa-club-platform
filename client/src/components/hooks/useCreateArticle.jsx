import { useState } from "react";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { firebaseStorage } from "../../firebase";
import imageCompression from "browser-image-compression";
import { v4 } from "uuid";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/notify";
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

export const useCreateArticle = (initialValues, onSubmitHandler) => {
  const createEditorState = (html = '') => {
    if (html) {
      const contentBlock = htmlToDraft(html);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        return EditorState.createWithContent(contentState);
      }
    }
    return EditorState.createEmpty();
  };

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

  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

  // Генерираме slug от заглавие
  const generateSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Премахваме специални символи
      .replace(/\s+/g, '-') // Заменяме интервали с тирета
      .replace(/-+/g, '-'); // Премахваме повтарящи се тирета
  };

  // Конвертиране на EditorState в HTML
  const convertEditorToHtml = (editorState) => {
    if (!editorState) return '';
    return draftToHtml(convertToRaw(editorState.getCurrentContent()));
  };

  // Проверка дали EditorState е празен
  const isEditorEmpty = (editorState) => {
    if (!editorState) return true;
    const content = editorState.getCurrentContent();
    return !content.hasText();
  };

  // Обработка на промени в полетата - подобрена версия
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

  // Валидация полета
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "title":
        error = !value.trim() ? t("articles.title_required") : 
                value.length < 4 ? t("articles.title_too_short") : 
                value.length > 100 ? t("articles.title_too_long") : "";
        break;
      case "slug":
        error = !value.trim() ? t("articles.slug_required") : 
                !/^[a-z0-9-]+$/.test(value) ? t("articles.slug_invalid_format") : "";
        break;
      case "author":
        error = !value.trim() ? t("articles.author_required") : "";
        break;
      case "summary":
        error = isEditorEmpty(value) ? t("articles.summary_required") : "";
        break;
      case "mainImage.alt":
        error = isEditorEmpty(value) ? t("articles.image_alt_required") : "";
        break;
      default:
        if (name.startsWith("sections")) {
          const field = name.split(".").pop();
          if (field === "title" && !value.trim()) {
            error = t("articles.section_title_required");
          } else if (field === "content" && isEditorEmpty(value)) {
            error = t("articles.section_content_required");
          }
        }
        break;
    }
    
    return error;
  };

  // Обработка на загуба на фокус за валидация
  const onBlurHandler = (e, isEditor = false, editorValue = null) => {
    if (isEditor) {
      const { name, value } = editorValue;
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
      return;
    }
    
    const { name, value } = e.target;
    const error = validateField(name, value);
    
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

  // Добавяне на нова секция - обновена да използва order
  const addSection = () => {
    setValues(prev => {
      const newOrder = prev.sections.length + 1;
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            title: "",
            content: EditorState.createEmpty(),
            image: null,
            order: newOrder
          }
        ]
      };
    });
  };

  // Премахване на секция - обновена да преномерира order
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

  // Обработка на файлове с изображения за основното изображение
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

// handleMainVideoFile вече не е нужна, може да се премахне
  // Обработка на файлове с видео за основното изображение
  const handleMainVideoFile = (file) => {
    if (!file) return;
    
    if (!allowedVideoTypes.includes(file.type)) {
      notify("articles.invalid_video_format");
      return;
    }
    
    setMediaFiles(prev => ({
      ...prev,
      mainImage: [file]
    }));
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
    console.log("Започва валидация на формата");
    const newErrors = {};
    
    // Само основни полета
    newErrors.title = validateField("title", values.title);
    newErrors.slug = validateField("slug", values.slug);
    newErrors.author = validateField("author", values.author);
    newErrors.summary = validateField("summary", values.summary);
    console.log("След валидация на основни полета:", newErrors);
    
    // Секции - само проверка за заглавие и съдържание
    values.sections.forEach((section, index) => {
      if (!section.title?.trim()) {
        newErrors[`sections[${index}].title`] = t("articles.section_title_required");
      }
      
      if (isEditorEmpty(section.content)) {
        newErrors[`sections[${index}].content`] = t("articles.section_content_required");
      }
    });
    console.log("След валидация на секции:", newErrors);
    
    setErrors(newErrors);
    
    const isValid = Object.values(newErrors).every(error => !error);
    console.log("Форма валидна:", isValid, "Грешки:", newErrors);
    return isValid;
  };

  // Конвертиране на всички EditorState полета в HTML преди изпращане
  const prepareValuesForSubmit = (values) => {
    const prepared = { ...values };
    
    // Конвертиране на summary
    prepared.summary = convertEditorToHtml(values.summary);
    
    // Конвертиране на mainImage.alt
    prepared.mainImage = {
      ...values.mainImage,
      alt: convertEditorToHtml(values.mainImage.alt)
    };
    
    // Конвертиране на съдържанието на секциите
    prepared.sections = values.sections.map(section => {
      const updatedSection = { ...section };
      
      if (section.content) {
        updatedSection.content = convertEditorToHtml(section.content);
      }
      
      if (section.image && section.image.alt && typeof section.image.alt !== 'string') {
        updatedSection.image = {
          ...section.image,
          alt: convertEditorToHtml(section.image.alt)
        };
      }
      
      if (section.image && section.image.caption && typeof section.image.caption !== 'string') {
        updatedSection.image = {
          ...updatedSection.image,
          caption: convertEditorToHtml(section.image.caption)
        };
      }
      
      return updatedSection;
    });
    
    return prepared;
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
          const imageUploads = mediaFiles.mainImage.map(async (file, index) => {
            const options = {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920,
            };
            
            let compressedFile;
            try {
              compressedFile = await imageCompression(file, options);
            } catch (err) {
              console.error("Image compression error:", err);
              compressedFile = file;
            }
            
            const imageRef = ref(firebaseStorage, `articles/images/${v4()}`);
            const uploadTask = uploadBytesResumable(imageRef, compressedFile);
            
            return new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  // Обновяваме общия прогрес
                  setUploadProgress(prevProgress => 
                    (prevProgress + progress / (mediaFiles.mainImage.length + Object.keys(mediaFiles.sectionImages).length)) / 2
                  );
                },
                (error) => {
                  reject(error);
                },
                async () => {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(url);
                }
              );
            });
          });
          
          mainImageUrls = await Promise.all(imageUploads);
        } else if (values.mainImage.type === "video") {
          // Качване на видео с чънкове
          const videoFile = mediaFiles.mainImage[0];
          const videoRef = ref(firebaseStorage, `articles/videos/${v4()}`);
          const uploadTask = uploadBytesResumable(videoRef, videoFile);
          
          const videoUrl = await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress / 2); // Първата половина на прогреса
              },
              (error) => {
                reject(error);
              },
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              }
            );
          });
          
          mainImageUrls = [videoUrl];
        }
      }
      
      // 2. Качване на изображения за секции
      if (Object.keys(mediaFiles.sectionImages).length > 0) {
        const sectionImagePromises = Object.entries(mediaFiles.sectionImages).map(
          async ([sectionIndex, file]) => {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1200,
            };
            
            let compressedFile;
            try {
              compressedFile = await imageCompression(file, options);
            } catch (err) {
              console.error("Section image compression error:", err);
              compressedFile = file;
            }
            
            const imageRef = ref(firebaseStorage, `articles/section-images/${v4()}`);
            const uploadTask = uploadBytesResumable(imageRef, compressedFile);
            
            return new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  // Обновяваме общия прогрес за втората половина
                  setUploadProgress(50 + progress / (2 * Object.keys(mediaFiles.sectionImages).length));
                },
                (error) => {
                  reject(error);
                },
                async () => {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve({ sectionIndex, url });
                }
              );
            });
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
      
      // Конвертиране на EditorState полета в HTML
      const preparedValues = prepareValuesForSubmit(mediaUpdatedValues);
      
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
    handleMainVideoFile,
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