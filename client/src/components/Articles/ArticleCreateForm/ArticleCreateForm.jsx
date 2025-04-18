import { useState, useRef, useMemo, useEffect, useReducer } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faMinus, faImage, faVideo, faSliders,
    faUpload, faEye, faSave, faTimes, faCloudUploadAlt,
    faEdit
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import "./articleCreateForm.css";
import ArticlePreview from "./ArticlePreview/ArticlePreview";
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useCreateArticle } from "../../hooks/useCreateArticle";
import VideoPlayer from "../ArticleView/VideoPlayer/VideoPlayer";
import { useArticleContext } from "../../contexts/ArticleContext";
import { createEditorState } from "../articleUtils/editor";
import ScrollToTop from "../../ScrollToTop/ScrollToTop";
import { ImageAltEditModal } from "./ImageAltEditModal/ImageAltEditModal";
import VideoThumbnailGenerator from "./VideoThumbnailGenerator/VideoThumbnailGenerator";
import { SectionQuickMenu } from "./SectionQuickMenu/SectionQuickMenu";
// import { faChevronUp, faChevronDown, faTrash } from "@fortawesome/free-solid-svg-icons";
const ArticleCreateForm = () => {
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
    const initialValues = {
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
                image: null,
                order: 1,
            },
        ],
        tags: [],
        previousArticle: null,
        nextArticle: null,
    };

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
    } = useCreateArticle(initialValues, createArticle);

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
        if (mediaFiles.sectionImages) {
            Object.entries(mediaFiles.sectionImages).forEach(([index, file]) => {
                try {
                    urls[index] = URL.createObjectURL(file);
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
        const currentSection = {...updatedSections[index]};
        const prevSection = {...updatedSections[index - 1]};
        
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
        const currentSection = {...updatedSections[index]};
        const nextSection = {...updatedSections[index + 1]};
        
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
                alert("Моля, качете видео файл в MP4, WebM или OGG формат.");
                return;
            }

            // Проверка за размер на файла (100MB = 104857600 bytes)
            if (videoFile.size > 104857600) {
                alert("Видео файлът надвишава максималния размер от 100MB.");
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
            alert("Моля, въведете валиден YouTube или Vimeo URL адрес.");
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
        alert(`Външното видео е добавено успешно.`);

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

    // Премахваме стария getVideoPreviewUrl, защото използваме кеширания videoPreviewUrl

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
            <h2 className="article-form-title">Създаване на нова статия</h2>

            <form className="article-form" onSubmit={onSubmit}>
                {/* Основна информация */}
                <div className="form-section">
                    <h3>Основна информация</h3>
                    <div className="form-section-content">
                        <div className="form-group-article">
                            <label htmlFor="title">Заглавие <span className="required">*</span></label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={values.title}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors.title ? "error" : ""}
                                placeholder="Въведете заглавие на статията"
                            />
                            {errors.title && <div className="error-message">{errors.title}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="slug">URL идентификатор <span className="required">*</span></label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={values.slug}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors.slug ? "error" : ""}
                                placeholder="пример-за-url-идентификатор"
                            />
                            {errors.slug && <div className="error-message">{errors.slug}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="author">Автор <span className="required">*</span></label>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                value={values.author}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors.author ? "error" : ""}
                                placeholder="Име на автора"
                            />
                            {errors.author && <div className="error-message">{errors.author}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="publishDate">Дата на публикуване</label>
                            <input
                                type="date"
                                id="publishDate"
                                name="publishDate"
                                value={values.publishDate}
                                onChange={onChangeHandler}
                            />
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="summary">Резюме <span className="required">*</span></label>
                            <div className={errors.summary ? "editor-container error" : "editor-container"}>
                                <Editor
                                    editorState={values.summary}
                                    onEditorStateChange={(editorState) => handleEditorChange(editorState, "summary")}
                                    onBlur={() => handleEditorBlur("summary", values.summary)}
                                    toolbar={editorToolbarOptions}
                                    placeholder="Кратко резюме на статията"
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
                    <h3>Основна медия</h3>
                    <div className="form-section-content">
                        <div className="media-type-selector">
                            <button
                                type="button"
                                className={values.mainImage.type === "image" ? "active" : ""}
                                onClick={() => handleMainImageTypeChange("image")}
                            >
                                <FontAwesomeIcon icon={faImage} /> Единично изображение
                            </button>
                            <button
                                type="button"
                                className={values.mainImage.type === "slider" ? "active" : ""}
                                onClick={() => handleMainImageTypeChange("slider")}
                            >
                                <FontAwesomeIcon icon={faSliders} /> Слайдер
                            </button>
                            <button
                                type="button"
                                className={values.mainImage.type === "video" ? "active" : ""}
                                onClick={() => handleMainImageTypeChange("video")}
                            >
                                <FontAwesomeIcon icon={faVideo} /> Видео
                            </button>
                        </div>

                        <div className="media-upload-container">
                            {(values.mainImage.type === "image" || values.mainImage.type === "slider") && (
                                <>
                                    <div className="form-group-article">
                                        <label htmlFor="mainImageAlt">Алтернативен текст <span className="required">*</span></label>
                                        <div className={errors["mainImage.alt"] ? "editor-container error" : "editor-container"}>
                                            <Editor
                                                editorState={values.mainImage.alt}
                                                onEditorStateChange={(editorState) => handleEditorChange(editorState, "mainImage.alt")}
                                                onBlur={() => handleEditorBlur("mainImage.alt", values.mainImage.alt)}
                                                toolbar={minimalEditorToolbarOptions}
                                                placeholder="Описание на изображението"
                                                wrapperClassName="editor-wrapper-small"
                                                editorClassName="editor-main-small"
                                                toolbarClassName="editor-toolbar-small"
                                            />
                                        </div>
                                        {errors["mainImage.alt"] && <div className="error-message">{errors["mainImage.alt"]}</div>}
                                    </div>

                                    {/* Нова секция за добавяне чрез URL */}
                                    <div className="form-group-article">
                                        <label>Добавяне чрез URL</label>
                                        <div className="image-url-input">
                                            <input
                                                type="text"
                                                placeholder="Въведете URL на изображение"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                                            />
                                            <button
                                                type="button"
                                                className="add-image-url-btn"
                                                onClick={handleAddImageUrl}
                                            >
                                                <FontAwesomeIcon icon={faPlus} /> Добави
                                            </button>
                                        </div>
                                    </div>

                                    <div className="file-upload-area">
                                        <div className="file-upload-icon">
                                            <FontAwesomeIcon icon={faCloudUploadAlt} />
                                        </div>
                                        <p className="file-upload-text">
                                            Плъзнете файлове тук или кликнете за избор
                                        </p>
                                        <label htmlFor="mainImageFile" className="file-upload-label">
                                            <FontAwesomeIcon icon={faUpload} />
                                            {values.mainImage.type === "image"
                                                ? "Качи основно изображение"
                                                : "Качи изображения за слайдера"}
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
                                                        alt={`Предпреглед ${index}`}
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
                                                        alt={`URL изображение ${index}`}
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
                                        <label htmlFor="mainImageAlt">Заглавие на видеото <span className="required">*</span></label>
                                        <div className={errors["mainImage.alt"] ? "editor-container error" : "editor-container"}>
                                            <Editor
                                                editorState={values.mainImage.alt}
                                                onEditorStateChange={(editorState) => handleEditorChange(editorState, "mainImage.alt")}
                                                onBlur={() => handleEditorBlur("mainImage.alt", values.mainImage.alt)}
                                                toolbar={minimalEditorToolbarOptions}
                                                placeholder="Заглавие или описание на видеото"
                                                wrapperClassName="editor-wrapper-small"
                                                editorClassName="editor-main-small"
                                                toolbarClassName="editor-toolbar-small"
                                            />
                                        </div>
                                        {errors["mainImage.alt"] && <div className="error-message">{errors["mainImage.alt"]}</div>}
                                    </div>

                                    <div className="form-group-article">
                                        <label htmlFor="videoThumbnail">Миниатюра за видеото</label>
                                        <input
                                            type="text"
                                            id="videoThumbnail"
                                            name="mainImage.thumbnail"
                                            value={values.mainImage.thumbnail}
                                            onChange={onChangeHandler}
                                            placeholder="URL адрес на миниатюрата на видеото (опционално)"
                                        />
                                    </div>

                                    <div className="video-upload-options">
                                        <div className="form-group-article">
                                            <label>Изберете начин на добавяне на видео</label>
                                            <div className="video-options-buttons">
                                                <button
                                                    type="button"
                                                    className="video-option-btn"
                                                    onClick={() => document.getElementById('mainVideoFile').click()}
                                                >
                                                    <FontAwesomeIcon icon={faUpload} /> Качване на файл
                                                </button>
                                                <span className="or-divider">или</span>
                                                <div className="video-url-input">
                                                    <input
                                                        type="text"
                                                        placeholder="Въведете YouTube/Vimeo URL"
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
                                                        <FontAwesomeIcon icon={faPlus} /> Добави
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="file-upload-area">
                                            <div className="file-upload-icon">
                                                <FontAwesomeIcon icon={faCloudUploadAlt} />
                                            </div>
                                            <p className="file-upload-text">
                                                Плъзнете видео файл тук или кликнете за избор
                                            </p>
                                            <label htmlFor="mainVideoFile" className="file-upload-label">
                                                <FontAwesomeIcon icon={faUpload} /> Качи видео файл
                                            </label>
                                            <input
                                                type="file"
                                                id="mainVideoFile"
                                                onChange={(e) => handleVideoFile(e.target.files)}
                                                accept="video/mp4,video/webm,video/ogg"
                                                className="file-input"
                                            />
                                            <p className="upload-info">Поддържани формати: MP4, WebM, OGG. Максимален размер: 100 MB</p>
                                        </div>
                                    </div>

                                    {/* Предпреглед на видео - използва кеширания URL */}
                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <div className="video-preview-container">
                                            <div className="video-element-wrapper">
                                                <video
                                                    controls
                                                    width="100%"
                                                    height="auto"
                                                    src={videoPreviewUrl} // Използваме кеширания URL
                                                    poster={values.mainImage.thumbnail || ""}
                                                >
                                                    Вашият браузър не поддържа HTML5 видео.
                                                </video>
                                            </div>
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4 dangerouslySetInnerHTML={{ __html: convertEditorToHtml(values.mainImage.alt) || 'Видео файл' }}></h4>
                                                    <p>{mediaFiles.mainImage[0]?.name || "Безименен файл"}</p>
                                                    <p>Размер: {mediaFiles.mainImage[0]?.size ? (mediaFiles.mainImage[0].size / (1024 * 1024)).toFixed(2) + " MB" : "Неизвестен размер"}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-video-btn"
                                                    onClick={() => removeMainImage(0)}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} /> Премахни
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Добавяме генератора на thumbnail за качени видео файлове */}
                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <VideoThumbnailGenerator
                                            videoFile={mediaFiles.mainImage[0]}
                                            onThumbnailGenerated={(thumbnailFile) => {
                                                // Качваме файла с използване на съществуващата функция за качване
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
                                                alt={convertEditorToHtml(values.mainImage.alt) || 'Видео от URL'}
                                                allowDownload={false}
                                            />
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4 dangerouslySetInnerHTML={{ __html: convertEditorToHtml(values.mainImage.alt) || 'Външно видео' }}></h4>
                                                    <p>URL: {values.mainImage.videoUrl}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-video-btn"
                                                    onClick={() => {
                                                        onChangeHandler({ target: { name: "mainImage.videoUrl", value: "" } });
                                                        forceUpdate(); // Използваме useReducer версията
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} /> Премахни
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
                    <h3>Съдържание на статията</h3>
                    <div className="form-section-content">
                        <div className="section-header" style={{ background: 'none', padding: '0 0 20px 0' }}>
                            <h4>Секции</h4>
                            <button type="button" className="add-section-btn" onClick={addSection}>
                                <FontAwesomeIcon icon={faPlus} /> Добави секция
                            </button>
                        </div>

                        {values.sections.map((section, index) => (
                            <div
                                key={index}
                                className={`article-section-item ${activeSection === index ? 'active-section' : ''}`}
                                onClick={() => setActiveSection(index)}
                            >
                                <div className="section-header">
                                    <h4>Секция {index + 1}</h4>
                                    {values.sections.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-section-btn"
                                            onClick={() => removeSection(index)}
                                        >
                                            <FontAwesomeIcon icon={faMinus} /> Премахни
                                        </button>
                                    )}
                                </div>

                                <div className="section-content-create">
                                    <div className="form-group-article">
                                        <label htmlFor={`section-title-${index}`}>Заглавие <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            id={`section-title-${index}`}
                                            name={`sections[${index}].title`}
                                            value={section.title}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors[`sections[${index}].title`] ? "error" : ""}
                                            placeholder="Заглавие на секцията"
                                        />
                                        {errors[`sections[${index}].title`] && <div className="error-message">{errors[`sections[${index}].title`]}</div>}
                                    </div>

                                    <div className="form-group-article">
                                        <label htmlFor={`section-content-${index}`}>Съдържание <span className="required">*</span></label>
                                        <div className={errors[`sections[${index}].content`] ? "editor-container error" : "editor-container"}>
                                            <Editor
                                                editorState={section.content}
                                                onEditorStateChange={(editorState) => handleEditorChange(editorState, `sections[${index}].content`)}
                                                onBlur={() => handleEditorBlur(`sections[${index}].content`, section.content)}
                                                toolbar={editorToolbarOptions}
                                                placeholder="Въведете съдържание на секцията"
                                                wrapperClassName="editor-wrapper"
                                                editorClassName="editor-main"
                                                toolbarClassName="editor-toolbar"
                                            />
                                        </div>
                                        {errors[`sections[${index}].content`] && <div className="error-message">{errors[`sections[${index}].content`]}</div>}
                                    </div>

                                    <div className="form-group-article">
                                        <label htmlFor={`section-image-${index}`}>Изображения към секцията</label>

                                        <div className="form-group-article">
                                            <label>Добавяне чрез URL</label>
                                            <div className="image-url-input">
                                                <input
                                                    type="text"
                                                    placeholder="Въведете URL на изображение"
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
                                                    <FontAwesomeIcon icon={faPlus} /> Добави
                                                </button>
                                            </div>
                                        </div>

                                        <div className="file-upload-area" style={{ padding: '20px' }}>
                                            <label htmlFor={`section-image-${index}`} className="file-upload-label">
                                                <FontAwesomeIcon icon={faUpload} /> Избери изображение
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
                                            {Array.isArray(section.image) && section.image.map((image, imgIndex) => (
                                                <div key={`image-${imgIndex}`} className="section-image-preview">
                                                    <img
                                                        src={image.src}
                                                        alt={convertEditorToHtml(image.alt) || `Секция ${index + 1} - Изображение ${imgIndex + 1}`}
                                                        onClick={() => handleImageClick(image.src)}
                                                    />
                                                    <div className="img-alt-actions">
                                                        <button
                                                            type="button"
                                                            className="img-alt-edit-btn"
                                                            onClick={() => openAltEditModal(index, imgIndex, image)}
                                                            title="Редактирай информация"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="remove-image-btn"
                                                            onClick={() => removeSectionImage(index, imgIndex)}
                                                            title="Премахни изображението"
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
                                            ))}
                                            {/* За обратна съвместимост - ако image не е масив, но има src */}
                                            {section.image && !Array.isArray(section.image) && section.image.src && (
                                                <div className="section-image-preview">
                                                    <img
                                                        src={section.image.src}
                                                        alt={`Секция ${index + 1}`}
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
                    <h3>Тагове</h3>
                    <div className="form-section-content">
                        <div className="tags-container">
                            <div className="tags-input-group">
                                <input
                                    type="text"
                                    id="newTag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Въведете таг и натиснете Enter"
                                    onKeyPress={(e) => e.key === 'Enter' && handleTagAdd(e)}
                                />
                                <button
                                    type="button"
                                    className="add-tag-btn"
                                    onClick={handleTagAdd}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Добави
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
                        <span>{uploadProgress.toFixed(0)}% качено</span>
                    </div>
                )}

                {/* Бутони на формата */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="preview-btn"
                        onClick={handlePreviewToggle}
                    >
                        <FontAwesomeIcon icon={faEye} /> Предпреглед
                    </button>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isUploading}
                    >
                        <FontAwesomeIcon icon={faSave} /> Запази
                    </button>
                </div>
            </form>

            {/* Модален прозорец за преглед на изображение в пълен размер */}
            {expandedImageUrl && (
                <div className="image-modal" onClick={closeExpandedImage}>
                    <div className="image-modal-content">
                        <img src={expandedImageUrl} alt="Разширен изглед" />
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
};

export default ArticleCreateForm;