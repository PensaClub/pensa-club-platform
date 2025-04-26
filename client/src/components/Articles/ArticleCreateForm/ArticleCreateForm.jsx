
import React, { useState, useRef, useMemo, useEffect, useReducer, forwardRef, useImperativeHandle } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faMinus, faImage, faVideo, faSliders,
    faUpload, faEye, faSave, faTimes, faCloudUploadAlt,
    faEdit
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import "./articleCreateForm.css";
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useArticleContext } from "../../contexts/ArticleContext";
import { createEditorState } from "../articleUtils/editor";
import ScrollToTop from "../../ScrollToTop/ScrollToTop";
import { ImageAltEditModal } from "../ArticleCreateForm/ImageAltEditModal/ImageAltEditModal";
import VideoThumbnailGenerator from "../ArticleCreateForm/VideoThumbnailGenerator/VideoThumbnailGenerator";
import { SectionQuickMenu } from "../ArticleCreateForm/SectionQuickMenu/SectionQuickMenu";
import ArticlePreview from "./ArticlePreview/ArticlePreview";
import { useCreateArticle } from "../../hooks/useCreateArticle";
import VideoPlayer from "../ArticleView/VideoPlayer/VideoPlayer";

const ArticleCreateForm = forwardRef(({ initialValues: propInitialValues, onSubmitHandler, isEditMode }, ref) => {
    const { t } = useTranslation();
    const { createArticle } = useArticleContext();
    const [previewMode, setPreviewMode] = useState(false);
    const [isAltModalOpen, setIsAltModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [currentEditingImage, setCurrentEditingImage] = useState({
        sectionIndex: null,
        imageIndex: null,
        image: null
    });

    // Използваме propInitialValues (ако има такива) или дефолтните стойности
    const defaultValues = {
        title: "",
        slug: "",
        author: "",
        publishDate: new Date().toISOString().split('T')[0],
        summary: createEditorState(),
        mainImage: {
            type: "image",
            sources: [],
            alt: createEditorState(),
            thumbnail: "",
            videoUrl: "",
            subtitles: [],
            allowDownload: false,
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
    };

    // Използваме пропнатите стойности, ако има такива
    const actualInitialValues = propInitialValues || defaultValues;

    // Определяме правилния onSubmitHandler
    const submitHandler = onSubmitHandler || createArticle;

    // Подготвяме началните mediaFiles според наличните изображения от initialValues
    const preparedMediaFiles = useMemo(() => {
        const mediaFiles = {
            mainImage: [],
            sectionImages: {}
        };

        // Ако редактираме статия със съществуващи изображения в секциите
        if (actualInitialValues && actualInitialValues.sections) {
            actualInitialValues.sections.forEach((section, index) => {
                if (Array.isArray(section.image) && section.image.length > 0) {
                    // Имаме изображения в тази секция - добавяме празен масив
                    // Това ще ни помогне да знаем, че секцията има изображения
                    mediaFiles.sectionImages[index] = [];
                }
            });
        }

        return mediaFiles;
    }, []);

    const {
        values,
        errors,
        isUploading,
        uploadProgress,
        onChangeHandler,
        onBlurHandler,
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
        removeSection,
        swapSectionsMedia,
        addTag,
        updateImageInfo,
        removeTag,
        mediaFiles,
        convertEditorToHtml,
        uploadThumbnailFile,
        updateImageAlt,
    } = useCreateArticle(actualInitialValues, submitHandler);

    useImperativeHandle(ref, () => ({
        onSubmit,
        mediaFiles,
        values
    }));

    const [newTag, setNewTag] = useState("");
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [imageUrl, setImageUrl] = useState("");
    const [sectionImageUrls, setSectionImageUrls] = useState({});

    const videoUrlInputRef = useRef(null);

    const videoPreviewUrl = useMemo(() => {
        if (mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && mediaFiles.mainImage[0]) {
            try {
                return URL.createObjectURL(mediaFiles.mainImage[0]);
            } catch (error) {
                console.error("Error creating URL:", error);
                return null;
            }
        }
        return null;
    }, [mediaFiles.mainImage]);

    const handleAddImageUrl = () => {
        if (handleMainImageUrl(imageUrl)) {
            setImageUrl("");
        }
    };

    const openAltEditModal = (sectionIndex, imageIndex, image) => {
        // Копираме изображението за да избегнем проблеми с референции
        setCurrentEditingImage({
            sectionIndex,
            imageIndex,
            image: { ...image }
        });
        setIsAltModalOpen(true);
    };

    // Функция за запазване на промените в ALT текста
    const handleSaveImageInfo = (altEditorState, captionEditorState) => {
        const { sectionIndex, imageIndex } = currentEditingImage;
        updateImageInfo(sectionIndex, imageIndex, altEditorState, captionEditorState);
    };

    // Кеширане на blob URL-и за изображения в слайдера
    const mainImagePreviewUrls = useMemo(() => {
        if (mediaFiles.mainImage && mediaFiles.mainImage.length > 0) {
            return mediaFiles.mainImage.map(file => {
                try {
                    return URL.createObjectURL(file);
                } catch (error) {
                    console.error("Error creating URL:", error);
                    return null;
                }
            });
        }
        return [];
    }, [mediaFiles.mainImage]);

    // Кеширане на blob URL-и за изображения в секциите
    const sectionImagePreviewUrls = useMemo(() => {
        const urls = {};

        // 1. Обработка на файлове от mediaFiles.sectionImages
        if (mediaFiles.sectionImages) {
            Object.entries(mediaFiles.sectionImages).forEach(([index, file]) => {
                try {
                    if (Array.isArray(file) && file.length > 0 &&
                        (file[0] instanceof Blob || file[0] instanceof File)) {
                        urls[index] = URL.createObjectURL(file[0]);
                    } else if (file && (file instanceof Blob || file instanceof File)) {
                        urls[index] = URL.createObjectURL(file);
                    }
                } catch (error) {
                    console.error("Error creating URL for section image:", error);
                    urls[index] = null;
                }
            });
        }

        return urls;
    }, [mediaFiles.sectionImages]);

    // ВАЖНО: Почистване на blob URL-и при размонтиране на компонента
    useEffect(() => {
        return () => {
            // Освобождаване на видео URL
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }

            // Освобождаване на URL-и на основни изображения
            mainImagePreviewUrls.forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });

            // Освобождаване на URL-и на секционни изображения
            Object.values(sectionImagePreviewUrls).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [videoPreviewUrl, mainImagePreviewUrls, sectionImagePreviewUrls]);

    const handleEditorChange = (editorState, name) => {
        onChangeHandler(null, true, { name, value: editorState });
    };

    const handleEditorBlur = (name, editorState) => {
        onBlurHandler(null, true, { name, value: editorState });
    };

    const moveSectionUp = (index) => {
        if (index <= 0) return;

        // Създаваме ново копие на масива със секции
        const updatedSections = [...values.sections];

        // Запазваме текущата секция и тази над нея
        const currentSection = { ...updatedSections[index] };
        const prevSection = { ...updatedSections[index - 1] };

        // Разменяме ги
        updatedSections[index - 1] = currentSection;
        updatedSections[index] = prevSection;

        // Актуализираме order свойството
        updatedSections.forEach((section, idx) => {
            section.order = idx + 1;
        });

        // Правим директен update на секциите в стейта
        onChangeHandler(null, true, { name: "sections", value: updatedSections });

        // ВАЖНО! Разменяме медия файловете също
        swapSectionsMedia(index, index - 1);

        // Актуализираме активната секция
        setActiveSection(index - 1);
    };

    const moveSectionDown = (index) => {
        if (index >= values.sections.length - 1) return;

        // Създаваме ново копие на масива със секции
        const updatedSections = [...values.sections];

        // Запазваме текущата секция и тази под нея
        const currentSection = { ...updatedSections[index] };
        const nextSection = { ...updatedSections[index + 1] };

        // Разменяме ги
        updatedSections[index + 1] = currentSection;
        updatedSections[index] = nextSection;

        // Актуализираме order свойството
        updatedSections.forEach((section, idx) => {
            section.order = idx + 1;
        });

        // Правим директен update на секциите в стейта
        onChangeHandler(null, true, { name: "sections", value: updatedSections });

        // ВАЖНО! Разменяме медия файловете също
        swapSectionsMedia(index, index + 1);

        // Актуализираме активната секция
        setActiveSection(index + 1);
    };

    const handleTagAdd = (e) => {
        e.preventDefault();
        if (newTag.trim()) {
            addTag(newTag.trim());
            setNewTag("");
        }
    };

    const handlePreviewToggle = () => {
        setPreviewMode(!previewMode);
    };

    const [expandedImageUrl, setExpandedImageUrl] = useState(null);

    const handleImageClick = (url) => {
        setExpandedImageUrl(url);
    };

    const closeExpandedImage = () => {
        setExpandedImageUrl(null);
    };

    // Функция за обработка на видео файлове
    const handleVideoFile = (files) => {
        if (!files || files.length === 0) return;

        const videoFile = files[0]; // Вземаме само първия файл за видео
        if (videoFile) {
            // Проверка за видео формат
            if (!/video\/(mp4|webm|ogg)/.test(videoFile.type)) {
                alert(t('articles.createForm.invalidVideoFormat'));
                return;
            }

            // Проверка за размер на файла (100MB = 104857600 bytes)
            if (videoFile.size > 104857600) {
                alert(t('articles.createForm.videoSizeExceeded'));
                return;
            }

            // Подаваме директно за обработка
            handleMainImageFiles([videoFile]);

            // Добавяме форсирано обновяване, но сега използваме useReducer версията
            setTimeout(() => forceUpdate(), 100);
        }
    };

    // Функция за добавяне на външно видео от URL
    const handleAddVideoUrl = () => {
        if (!values.mainImage.videoUrl) return;

        // Проверка на URL формата (опростена)
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;

        if (!youtubeRegex.test(values.mainImage.videoUrl) && !vimeoRegex.test(values.mainImage.videoUrl)) {
            alert(t('articles.createForm.invalidVideoUrl'));
            return;
        }

        // Генерираме thumbnail URL ако е YouTube
        let thumbnailUrl = "";
        if (youtubeRegex.test(values.mainImage.videoUrl)) {
            // Опит да извлечем видео ID
            let videoId = "";
            if (values.mainImage.videoUrl.includes("youtube.com/watch?v=")) {
                videoId = values.mainImage.videoUrl.split("v=")[1]?.split("&")[0];
            } else if (values.mainImage.videoUrl.includes("youtu.be/")) {
                videoId = values.mainImage.videoUrl.split("youtu.be/")[1]?.split("?")[0];
            }

            if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                // Ако има thumbnail, сетваме го автоматично
                onChangeHandler({ target: { name: "mainImage.thumbnail", value: thumbnailUrl } });
            }
        }

        // Уведомяваме потребителя, че външното видео е добавено
        alert(t('articles.createForm.videoAddedSuccess'));

        // Принуждаваме компонента да се преизрисува с useReducer версията
        forceUpdate();
    };

    // Общи настройки за редактора
    const editorToolbarOptions = {
        options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'emoji', 'history'],
        inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough'],
            className: 'editor-toolbar-inline',
        },
        blockType: {
            options: ['Normal', 'H2', 'H3', 'H4', 'Blockquote'],
            className: 'editor-toolbar-block',
        },
        list: {
            options: ['unordered', 'ordered'],
        },
        textAlign: {
            inDropdown: true,
        },
        link: {
            inDropdown: false,
            showOpenOptionOnHover: true,
        },
        emoji: {
            emojis: [
                '😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😮', '🙂', '🙃', '🤑', '🤔', '🤗', '🤐',
                '🤡', '🤥', '🤨', '🤩', '🤪', '🤫', '🤬', '🤭', '🧐', '🤯', '😴', '😌', '😛', '😜', '😝'
            ],
        },
    };

    // Опростени настройки за малки полета (alt текст)
    const minimalEditorToolbarOptions = {
        options: ['inline', 'link'],
        inline: {
            options: ['bold', 'italic', 'underline'],
            className: 'editor-toolbar-inline-small',
        },
        link: {
            inDropdown: false,
            showOpenOptionOnHover: true,
        },
    };

    if (previewMode) {
        return (
            <ArticlePreview
                article={values}
                onBack={handlePreviewToggle}
                mediaFiles={mediaFiles}
                convertEditorToHtml={convertEditorToHtml}
            />
        );
    }

    // Определяме текстовете според режима (създаване или редактиране)
    const formTitle = isEditMode
        ? t('articles.editForm.editArticle', 'Редактиране на статия')
        : t('articles.createForm.createNewArticle');

    const submitButtonText = isEditMode
        ? t('articles.editForm.saveChanges', 'Запази промените')
        : t('articles.createForm.saveBtn');

    return (
        <div className="article-create-container">
            {/* Постоянно фиксирано меню - ще се показва винаги */}
            <SectionQuickMenu
                sectionIndex={activeSection !== null ? activeSection : 0}
                totalSections={values.sections.length}
                onAddSection={addSection}
                onMoveUp={moveSectionUp}
                onMoveDown={moveSectionDown}
                onRemove={removeSection}
            />
            <h2 className="article-form-title">{formTitle}</h2>

            <form className="article-form" onSubmit={onSubmit}>
                {/* Основна информация */}
                <div className="form-section">
                    <h3>{t('articles.createForm.basicInfo')}</h3>
                    <div className="form-section-content">
                        <div className="form-group-article">
                            <label htmlFor="title">{t('articles.createForm.title')} <span className="required">*</span></label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={values.title}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors.title ? "error" : ""}
                                placeholder={t('articles.createForm.titlePlaceholder')}
                            />
                            {errors.title && <div className="error-message">{errors.title}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="slug">{t('articles.createForm.slug')} <span className="required">*</span></label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={values.slug}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors.slug ? "error" : ""}
                                placeholder={t('articles.createForm.slugPlaceholder')}
                            />
                            {errors.slug && <div className="error-message">{errors.slug}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="author">{t('articles.createForm.author')} <span className="required">*</span></label>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                value={values.author}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors.author ? "error" : ""}
                                placeholder={t('articles.createForm.authorPlaceholder')}
                            />
                            {errors.author && <div className="error-message">{errors.author}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="publishDate">{t('articles.createForm.publishDate')}</label>
                            <input
                                type="date"
                                id="publishDate"
                                name="publishDate"
                                value={values.publishDate}
                                onChange={onChangeHandler}
                            />
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="summary">{t('articles.createForm.summary')} <span className="required">*</span></label>
                            <div className={errors.summary ? "editor-container error" : "editor-container"}>
                                <Editor
                                    editorState={values.summary}
                                    onEditorStateChange={(editorState) => handleEditorChange(editorState, "summary")}
                                    onBlur={() => handleEditorBlur("summary", values.summary)}
                                    toolbar={editorToolbarOptions}
                                    placeholder={t('articles.createForm.summaryPlaceholder')}
                                    wrapperClassName="editor-wrapper"
                                    editorClassName="editor-main"
                                    toolbarClassName="editor-toolbar"
                                />
                            </div>
                            {errors.summary && <div className="error-message">{errors.summary}</div>}
                        </div>
                    </div>
                </div>

                {/* Основно изображение или медия */}
                <div className="form-section">
                    <h3>{t('articles.createForm.mainMedia')}</h3>
                    <div className="form-section-content">
                        <div className="media-type-selector">
                            <button
                                type="button"
                                className={values.mainImage.type === "image" ? "active" : ""}
                                onClick={() => handleMainImageTypeChange("image")}
                            >
                                <FontAwesomeIcon icon={faImage} /> {t('articles.createForm.singleImage')}
                            </button>
                            <button
                                type="button"
                                className={values.mainImage.type === "slider" ? "active" : ""}
                                onClick={() => handleMainImageTypeChange("slider")}
                            >
                                <FontAwesomeIcon icon={faSliders} /> {t('articles.createForm.slider')}
                            </button>
                            <button
                                type="button"
                                className={values.mainImage.type === "video" ? "active" : ""}
                                onClick={() => handleMainImageTypeChange("video")}
                            >
                                <FontAwesomeIcon icon={faVideo} /> {t('articles.createForm.video')}
                            </button>
                        </div>

                        <div className="media-upload-container">
                            {(values.mainImage.type === "image" || values.mainImage.type === "slider") && (
                                <>
                                    <div className="form-group-article">
                                        <label htmlFor="mainImageAlt">{t('articles.createForm.altText')} <span className="required">*</span></label>
                                        <div className={errors["mainImage.alt"] ? "editor-container error" : "editor-container"}>
                                            <Editor
                                                editorState={values.mainImage.alt}
                                                onEditorStateChange={(editorState) => handleEditorChange(editorState, "mainImage.alt")}
                                                onBlur={() => handleEditorBlur("mainImage.alt", values.mainImage.alt)}
                                                toolbar={minimalEditorToolbarOptions}
                                                placeholder={t('articles.createForm.imageDescriptionPlaceholder')}
                                                wrapperClassName="editor-wrapper-small"
                                                editorClassName="editor-main-small"
                                                toolbarClassName="editor-toolbar-small"
                                            />
                                        </div>
                                        {errors["mainImage.alt"] && <div className="error-message">{errors["mainImage.alt"]}</div>}
                                    </div>

                                    {/* Нова секция за добавяне чрез URL */}
                                    <div className="form-group-article">
                                        <label>{t('articles.createForm.addViaUrl')}</label>
                                        <div className="image-url-input">
                                            <input
                                                type="text"
                                                placeholder={t('articles.createForm.imageUrlPlaceholder')}
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                                            />
                                            <button
                                                type="button"
                                                className="add-image-url-btn"
                                                onClick={handleAddImageUrl}
                                            >
                                                <FontAwesomeIcon icon={faPlus} /> {t('articles.createForm.addBtn')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="file-upload-area">
                                        <div className="file-upload-icon">
                                            <FontAwesomeIcon icon={faCloudUploadAlt} />
                                        </div>
                                        <p className="file-upload-text">
                                            {t('articles.createForm.dragDropFile')}
                                        </p>
                                        <label htmlFor="mainImageFile" className="file-upload-label">
                                            <FontAwesomeIcon icon={faUpload} />
                                            {values.mainImage.type === "image"
                                                ? t('articles.createForm.uploadMainImageBtn')
                                                : t('articles.createForm.uploadSliderImagesBtn')}
                                        </label>
                                        <input
                                            type="file"
                                            id="mainImageFile"
                                            multiple={values.mainImage.type === "slider"}
                                            onChange={(e) => handleMainImageFiles(e.target.files)}
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            className="file-input"
                                        />
                                    </div>

                                    {/* Предпреглед на всички изображения - файлове и URL-и */}
                                    {(mediaFiles.mainImage.length > 0 || values.mainImage.sources.length > 0) && (
                                        <div className="media-preview-container">
                                            {/* Показване на файловете */}
                                            {mediaFiles.mainImage.map((file, index) => (
                                                <div key={`file-${index}`} className="image-preview-item">
                                                    <img
                                                        src={mainImagePreviewUrls[index]}
                                                        alt={t('articles.createForm.preview', { index: index })}
                                                        onClick={() => handleImageClick(mainImagePreviewUrls[index])}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => removeMainImage(index)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Показване на URL адресите */}
                                            {values.mainImage.sources.map((url, index) => (
                                                <div key={`url-${index}`} className="image-preview-item">
                                                    <img
                                                        src={url}
                                                        alt={t('articles.createForm.urlImage', { index: index })}
                                                        onClick={() => handleImageClick(url)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => removeUrlImage(index)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Раздел за видео, показва се само когато типът е видео */}
                            {values.mainImage.type === "video" && (
                                <>
                                    <div className="form-group-article">
                                        <label htmlFor="mainImageAlt">{t('articles.createForm.videoTitle')} <span className="required">*</span></label>
                                        <div className={errors["mainImage.alt"] ? "editor-container error" : "editor-container"}>
                                            <Editor
                                                editorState={values.mainImage.alt}
                                                onEditorStateChange={(editorState) => handleEditorChange(editorState, "mainImage.alt")}
                                                onBlur={() => handleEditorBlur("mainImage.alt", values.mainImage.alt)}
                                                toolbar={minimalEditorToolbarOptions}
                                                placeholder={t('articles.createForm.videoTitlePlaceholder')}
                                                wrapperClassName="editor-wrapper-small"
                                                editorClassName="editor-main-small"
                                                toolbarClassName="editor-toolbar-small"
                                            />
                                        </div>
                                        {errors["mainImage.alt"] && <div className="error-message">{errors["mainImage.alt"]}</div>}
                                    </div>

                                    <div className="form-group-article">
                                        <label htmlFor="videoThumbnail">{t('articles.createForm.thumbnail')}</label>
                                        <input
                                            type="text"
                                            id="videoThumbnail"
                                            name="mainImage.thumbnail"
                                            value={values.mainImage.thumbnail}
                                            onChange={onChangeHandler}
                                            placeholder={t('articles.createForm.videoThumbnailPlaceholder')}
                                        />
                                    </div>

                                    <div className="video-upload-options">
                                        <div className="form-group-article">
                                            <label>{t('articles.createForm.chooseVideoMethod')}</label>
                                            <div className="video-options-buttons">
                                                <button
                                                    type="button"
                                                    className="video-option-btn"
                                                    onClick={() => document.getElementById('mainVideoFile').click()}
                                                >
                                                    <FontAwesomeIcon icon={faUpload} /> {t('articles.createForm.uploadFile')}
                                                </button>
                                                <span className="or-divider">{t('articles.createForm.or')}</span>
                                                <div className="video-url-input">
                                                    <input
                                                        type="text"
                                                        placeholder={t('articles.createForm.videoUrlPlaceholder')}
                                                        name="mainImage.videoUrl"
                                                        value={values.mainImage.videoUrl || ''}
                                                        onChange={onChangeHandler}
                                                        ref={videoUrlInputRef}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddVideoUrl()}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="add-video-url-btn"
                                                        onClick={handleAddVideoUrl}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} /> {t('articles.createForm.addBtn')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="file-upload-area">
                                            <div className="file-upload-icon">
                                                <FontAwesomeIcon icon={faCloudUploadAlt} />
                                            </div>
                                            <p className="file-upload-text">
                                                {t('articles.createForm.dragDropVideo')}
                                            </p>
                                            <label htmlFor="mainVideoFile" className="file-upload-label">
                                                <FontAwesomeIcon icon={faUpload} /> {t('articles.createForm.uploadVideoBtn')}
                                            </label>
                                            <input
                                                type="file"
                                                id="mainVideoFile"
                                                onChange={(e) => handleVideoFile(e.target.files)}
                                                accept="video/mp4,video/webm,video/ogg"
                                                className="file-input"
                                            />
                                            <p className="upload-info">{t('articles.createForm.supportedFormats')}</p>
                                        </div>
                                    </div>

                                    {/* Предпреглед на видео - използва кеширания URL */}
                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <div className="video-preview-container" >
                                            <div className="video-element-wrapper">
                                                <video
                                                    controls
                                                    width="100%"
                                                    height="auto"
                                                    src={videoPreviewUrl} // Използваме кеширания URL
                                                    poster={values.mainImage.thumbnail || ""}
                                                >
                                                    {t('articles.createForm.browserNotSupport')}
                                                </video>
                                            </div>
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4 dangerouslySetInnerHTML={{ __html: convertEditorToHtml(values.mainImage.alt) || t('articles.createForm.videoFile') }}></h4>
                                                    <p>{mediaFiles.mainImage[0]?.name || t('articles.createForm.unnamedFile')}</p>
                                                    <p>{t('articles.createForm.size')} {mediaFiles.mainImage[0]?.size ? (mediaFiles.mainImage[0].size / (1024 * 1024)).toFixed(2) + " MB" : t('articles.createForm.unknownSize')}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-video-btn"
                                                    onClick={() => removeMainImage(0)}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} /> {t('articles.createForm.removeBtn')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Добавяме генератора на thumbnail за качени видео файлове */}
                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <VideoThumbnailGenerator
                                            videoFile={mediaFiles.mainImage[0]}
                                            onThumbnailGenerated={(thumbnailFile) => {
                                                uploadThumbnailFile(thumbnailFile);
                                            }}
                                        />
                                    )}

                                    {/* Предпреглед за външно видео от URL */}
                                    {values.mainImage.type === "video" && values.mainImage.videoUrl && !mediaFiles.mainImage?.length && (
                                        <div className="video-preview-container">
                                            <VideoPlayer
                                                src={values.mainImage.videoUrl}
                                                thumbnail={values.mainImage.thumbnail || ''}
                                                alt={convertEditorToHtml(values.mainImage.alt) || t('articles.createForm.urlVideo')}
                                                allowDownload={false}
                                            />
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4 dangerouslySetInnerHTML={{ __html: convertEditorToHtml(values.mainImage.alt) || t('articles.createForm.externalVideo') }}></h4>
                                                    {/* <p>URL: {values.mainImage.videoUrl}</p> */}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-video-btn"
                                                    onClick={() => {
                                                        onChangeHandler({ target: { name: "mainImage.videoUrl", value: "" } });
                                                        forceUpdate(); // Използваме useReducer версията
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} /> {t('articles.createForm.removeBtn')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Секции статии */}
                <div className="form-section">
                    <h3>{t('articles.createForm.content')}</h3>
                    <div className="form-section-content">
                        <div className="section-header" style={{ background: 'none', padding: '0 0 20px 0' }}>
                            <h4>{t('articles.createForm.sections')}</h4>
                            <button type="button" className="add-section-btn" onClick={addSection}>
                                <FontAwesomeIcon icon={faPlus} /> {t('articles.createForm.addSectionBtn')}
                            </button>
                        </div>

                        {values.sections.map((section, index) => (
                            <div
                                key={index}
                                className={`article-section-item ${activeSection === index ? 'active-section' : ''}`}
                                onClick={() => setActiveSection(index)}
                            >
                                <div className="section-header">
                                    <h4>{t('articles.createForm.sectionWithNumber', { number: index + 1 })}</h4>
                                    {values.sections.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-section-btn"
                                            onClick={() => removeSection(index)}
                                        >
                                            <FontAwesomeIcon icon={faMinus} /> {t('articles.createForm.removeBtn')}
                                        </button>
                                    )}
                                </div>

                                <div className="section-content-create">
                                    <div className="form-group-article">
                                        <label htmlFor={`section-title-${index}`}>{t('articles.createForm.title')} <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            id={`section-title-${index}`}
                                            name={`sections[${index}].title`}
                                            value={section.title}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors[`sections[${index}].title`] ? "error" : ""}
                                            placeholder={t('articles.createForm.sectionTitlePlaceholder')}
                                        />
                                        {errors[`sections[${index}].title`] && <div className="error-message">{errors[`sections[${index}].title`]}</div>}
                                    </div>

                                    <div className="form-group-article">
                                        <label htmlFor={`section-content-${index}`}>{t('articles.createForm.contentSimple')} <span className="required">*</span></label>
                                        <div className={errors[`sections[${index}].content`] ? "editor-container error" : "editor-container"}>
                                            <Editor
                                                editorState={section.content}
                                                onEditorStateChange={(editorState) => handleEditorChange(editorState, `sections[${index}].content`)}
                                                onBlur={() => handleEditorBlur(`sections[${index}].content`, section.content)}
                                                toolbar={editorToolbarOptions}
                                                placeholder={t('articles.createForm.sectionContentPlaceholder')}
                                                wrapperClassName="editor-wrapper"
                                                editorClassName="editor-main"
                                                toolbarClassName="editor-toolbar"
                                            />
                                        </div>
                                        {errors[`sections[${index}].content`] && <div className="error-message">{errors[`sections[${index}].content`]}</div>}
                                    </div>

                                    <div className="form-group-article">
                                        <label htmlFor={`section-image-${index}`}>{t('articles.createForm.sectionImages')}</label>

                                        <div className="form-group-article">
                                            <label>{t('articles.createForm.addViaUrl')}</label>
                                            <div className="image-url-input">
                                                <input
                                                    type="text"
                                                    placeholder={t('articles.createForm.imageUrlPlaceholder')}
                                                    value={sectionImageUrls[index] || ''}
                                                    onChange={(e) => setSectionImageUrls({ ...sectionImageUrls, [index]: e.target.value })}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSectionImageUrl(sectionImageUrls[index], index)}
                                                />
                                                <button
                                                    type="button"
                                                    className="add-image-url-btn"
                                                    onClick={() => {
                                                        if (handleSectionImageUrl(sectionImageUrls[index], index)) {
                                                            setSectionImageUrls({ ...sectionImageUrls, [index]: '' });
                                                        }
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} /> {t('articles.createForm.addBtn')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="file-upload-area" style={{ padding: '20px' }}>
                                            <label htmlFor={`section-image-${index}`} className="file-upload-label">
                                                <FontAwesomeIcon icon={faUpload} /> {t('articles.createForm.chooseImage')}
                                            </label>
                                            <input
                                                type="file"
                                                id={`section-image-${index}`}
                                                multiple={true}
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        handleSectionImageFile(e.target.files, index);
                                                    }
                                                }}
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                className="file-input"
                                            />
                                        </div>

                                        {/* Показване на всички изображения */}
                                        <div className="section-images-container">

                                            {/* Показване на всички изображения от масива */}
                                            {Array.isArray(section.image) && section.image.map((image, imgIndex) => {

                                                if (!image || !image.src) return null;

                                                return (
                                                    <div key={`image-${imgIndex}`} className="section-image-preview">
                                                        <img
                                                            src={image.src}
                                                            alt={t('articles.createForm.sectionWithNumber', { number: index + 1 })}
                                                            onClick={() => handleImageClick(image.src)}
                                                            onError={(e) => {
                                                                console.error(`Грешка при зареждане на изображение: ${image.src}`);
                                                                e.target.src = '/default-image-placeholder.jpg';
                                                            }}
                                                        />
                                                        <div className="img-alt-actions">
                                                            <button
                                                                type="button"
                                                                className="img-alt-edit-btn"
                                                                onClick={() => openAltEditModal(index, imgIndex, image)}
                                                                title={t('articles.createForm.editInfo')}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="remove-image-btn"
                                                                onClick={() => removeSectionImage(index, imgIndex)}
                                                                title={t('articles.createForm.removeImage')}
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </button>
                                                        </div>

                                                        {/* ALT текст */}
                                                        {image.alt && convertEditorToHtml(image.alt) && (
                                                            <div className="img-alt-text-preview">
                                                                ALT: <span className="truncated-alt-text" dangerouslySetInnerHTML={{ __html: convertEditorToHtml(image.alt) }}></span>
                                                            </div>
                                                        )}

                                                        {/* Caption */}
                                                        {image.caption && convertEditorToHtml(image.caption) && (
                                                            <div className="img-caption-preview">
                                                                <span className="truncated-caption-text" dangerouslySetInnerHTML={{ __html: convertEditorToHtml(image.caption) }}></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* За обратна съвместимост - ако image не е масив, но има src */}
                                            {section.image && !Array.isArray(section.image) && section.image.src && (
                                                <div className="section-image-preview">
                                                    <img
                                                        src={section.image.src}
                                                        alt={t('articles.createForm.sectionWithNumber', { number: index + 1 })}
                                                        onClick={() => handleImageClick(section.image.src)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => removeSectionImage(index)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Тагове */}
                <div className="form-section">
                    <h3>{t('articles.createForm.tags')}</h3>
                    <div className="form-section-content">
                        <div className="tags-container">
                            <div className="tags-input-group">
                                <input
                                    type="text"
                                    id="newTag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder={t('articles.createForm.tagPlaceholder')}
                                    onKeyPress={(e) => e.key === 'Enter' && handleTagAdd(e)}
                                />
                                <button
                                    type="button"
                                    className="add-tag-btn"
                                    onClick={handleTagAdd}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> {t('articles.createForm.addBtn')}
                                </button>
                            </div>

                            {errors.tags && <div className="error-message">{errors.tags}</div>}

                            <div className="tags-list">
                                {values.tags.map((tag, index) => (
                                    <div key={index} className="tag-item">
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="remove-tag-btn"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Прогрес при качване */}
                {isUploading && (
                    <div className="upload-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span>{uploadProgress.toFixed(0)}% {t('articles.createForm.uploaded')}</span>
                    </div>
                )}

                {/* Бутони на формата */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="preview-btn"
                        onClick={handlePreviewToggle}
                    >
                        <FontAwesomeIcon icon={faEye} />  {t('articles.createForm.previewBtn')}
                    </button>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isUploading}
                    >
                        <FontAwesomeIcon icon={faSave} /> {submitButtonText}
                    </button>
                </div>
            </form>

            {/* Модален прозорец за преглед на изображение в пълен размер */}
            {expandedImageUrl && (
                <div className="image-modal" onClick={closeExpandedImage}>
                    <div className="image-modal-content">
                        <img src={expandedImageUrl} alt={t('articles.createForm.expandedView')} />
                        <button className="close-modal-btn" onClick={closeExpandedImage}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>
            )}
            <ScrollToTop />
            {/* В края на компонента, преди последния затварящ таг */}
            <ImageAltEditModal
                isOpen={isAltModalOpen}
                onClose={() => setIsAltModalOpen(false)}
                image={currentEditingImage.image}
                onSave={handleSaveImageInfo}
            />
        </div>
    );
});

export default ArticleCreateForm;