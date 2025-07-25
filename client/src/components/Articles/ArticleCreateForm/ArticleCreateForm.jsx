import React, { useState, useRef, useMemo, useEffect, useReducer, forwardRef, useImperativeHandle, useCallback, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faMinus, faImage, faVideo, faSliders,
    faUpload, faEye, faSave, faTimes, faCloudUploadAlt,
    faEdit, faBold, faItalic, faUnderline, faListUl,
    faListOl, faQuoteLeft
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import "./articleCreateForm.css";

// 🎯 Slate.js imports
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { createEditor, Editor, Transforms, Element as SlateElement, Node } from 'slate';

import { useArticleContext } from "../../contexts/ArticleContext";
import ScrollToTop from "../../ScrollToTop/ScrollToTop";
import { ImageAltEditModal } from "../ArticleCreateForm/ImageAltEditModal/ImageAltEditModal";
import VideoThumbnailGenerator from "../ArticleCreateForm/VideoThumbnailGenerator/VideoThumbnailGenerator";
import { SectionQuickMenu } from "../ArticleCreateForm/SectionQuickMenu/SectionQuickMenu";
import ArticlePreview from "./ArticlePreview/ArticlePreview";
import { useCreateArticle } from "../../hooks/useCreateArticle";
import VideoPlayer from "../ArticleView/VideoPlayer/VideoPlayer";
import { htmlToSlate } from "../articleUtils/htmlToSlate";

// 🎯 Slate utility functions
const createSlateEditorState = () => {
    return [
        {
            type: 'paragraph',
            children: [{ text: '' }],
        },
    ];
};

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

const convertSlateToHtml = (slateValue) => {
    
    if (!isValidSlateValue(slateValue)) {
        return '';
    }
    
    const serialize = (node) => {
        if (typeof node === 'string') return node;
        if (!node || !node.children) return '';
        
        const children = node.children?.map(n => serialize(n)).join('') || '';
        
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
        
        const textOnly = result.replace(/<[^>]*>/g, '').trim();
        if (!textOnly) {
            return '';
        }
        
        return result;
    } catch (error) {
        console.error('Грешка при конвертиране на Slate в HTML:', error);
        return '';
    }
};

// Мемоизирани Slate компоненти
const MemoizedSlateEditor = memo(({ 
    editor, 
    value, 
    onChange, 
    onBlur, 
    placeholder, 
    className = "slate-editable",
    toolbarSize = "normal"
}) => {
    
    const [selection, setSelection] = useState(editor.selection);
    
    // Effect за проследяване на selection промени
    useEffect(() => {
        const { onChange: originalOnChange } = editor;
        
        editor.onChange = () => {
            originalOnChange();
            setSelection(editor.selection);
        };
        
        return () => {
            editor.onChange = originalOnChange;
        };
    }, [editor]);

    // Toolbar functions
    const toggleMark = useCallback((format) => {
        const marks = Editor.marks(editor);
        const isActive = marks ? marks[format] === true : false;
        
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
        
        // Принудително обновяване на selection state
        setSelection(editor.selection);
    }, [editor]);

    const toggleBlock = useCallback((format) => {
        const { selection } = editor;
        if (!selection) return;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
            })
        );
        
        const isActive = !!match;
        const isList = ['numbered-list', 'bulleted-list'].includes(format);

        Transforms.unwrapNodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type),
            split: true,
        });

        let newProperties;
        if (isActive) {
            newProperties = { type: 'paragraph' };
        } else if (isList) {
            newProperties = { type: 'list-item' };
        } else {
            newProperties = { type: format };
        }

        Transforms.setNodes(editor, newProperties);

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
        
        setSelection(editor.selection);
    }, [editor]);

    const isMarkActive = useCallback((format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    }, [editor, selection]); // Добавяме selection като dependency

    const isBlockActive = useCallback((format) => {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
            })
        );

        return !!match;
    }, [editor, selection]);

    // Memoized render functions
    const renderElement = useCallback((props) => {
        switch (props.element.type) {
            case 'block-quote':
                return <blockquote {...props.attributes}>{props.children}</blockquote>;
            case 'bulleted-list':
                return <ul {...props.attributes}>{props.children}</ul>;
            case 'heading-one':
                return <h1 {...props.attributes}>{props.children}</h1>;
            case 'heading-two':
                return <h2 {...props.attributes}>{props.children}</h2>;
            case 'list-item':
                return <li {...props.attributes}>{props.children}</li>;
            case 'numbered-list':
                return <ol {...props.attributes}>{props.children}</ol>;
            default:
                return <p {...props.attributes}>{props.children}</p>;
        }
    }, []);

    const renderLeaf = useCallback((props) => {
        let { children } = props;

        if (props.leaf.bold) {
            children = <strong>{children}</strong>;
        }

        if (props.leaf.italic) {
            children = <em>{children}</em>;
        }

        if (props.leaf.underline) {
            children = <u>{children}</u>;
        }

        return <span {...props.attributes}>{children}</span>;
    }, []);

    const renderToolbar = useCallback((isSmall = false) => (
        <div className={`slate-toolbar ${isSmall ? 'slate-toolbar-small' : ''}`}>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark('bold');
                }}
                className={`slate-btn ${isMarkActive('bold') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faBold} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark('italic');
                }}
                className={`slate-btn ${isMarkActive('italic') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faItalic} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark('underline');
                }}
                className={`slate-btn ${isMarkActive('underline') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faUnderline} />
            </button>

            {!isSmall && (
                <>
                    <div className="toolbar-divider"></div>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock('paragraph');
                        }}
                        className={`slate-btn ${isBlockActive('paragraph') ? 'active' : ''}`}
                    >
                        Normal
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock('heading-one');
                        }}
                        className={`slate-btn ${isBlockActive('heading-one') ? 'active' : ''}`}
                    >
                        H1
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock('heading-two');
                        }}
                        className={`slate-btn ${isBlockActive('heading-two') ? 'active' : ''}`}
                    >
                        H2
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock('bulleted-list');
                        }}
                        className={`slate-btn ${isBlockActive('bulleted-list') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faListUl} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock('numbered-list');
                        }}
                        className={`slate-btn ${isBlockActive('numbered-list') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faListOl} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock('block-quote');
                        }}
                        className={`slate-btn ${isBlockActive('block-quote') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faQuoteLeft} />
                    </button>
                </>
            )}
        </div>
    ), [toggleMark, toggleBlock, isMarkActive, isBlockActive, toolbarSize]);

    return (
        <Slate
            editor={editor}
            initialValue={normalizeSlateValue(value)}
            value={normalizeSlateValue(value)}

            onChange={onChange}
        >
            {renderToolbar(toolbarSize === "small")}
            <Editable
                className={className}
                placeholder={placeholder}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onBlur={onBlur}
            />
        </Slate>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    return (
        prevProps.value === nextProps.value &&
        prevProps.onChange === nextProps.onChange &&
        prevProps.onBlur === nextProps.onBlur &&
        prevProps.placeholder === nextProps.placeholder &&
        prevProps.className === nextProps.className &&
        prevProps.toolbarSize === nextProps.toolbarSize &&
        prevProps.editor === nextProps.editor
    );
});

const ArticleCreateForm = forwardRef(({ initialValues: propInitialValues, onSubmitHandler, isEditMode }, ref) => {
    const { t, i18n } = useTranslation();
    const { createArticle } = useArticleContext();
    const [previewMode, setPreviewMode] = useState(false);
    const [isAltModalOpen, setIsAltModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [currentEditingImage, setCurrentEditingImage] = useState({
        sectionIndex: null,
        imageIndex: null,
        image: null
    });

    // Slate editors
    const summaryEditor = useMemo(() => withHistory(withReact(createEditor())), []);
    const mainImageAltEditor = useMemo(() => withHistory(withReact(createEditor())), []);
    const sectionEditorsRef = useRef({});

    const getSectionEditor = useCallback((index, field) => {
        const key = `${index}-${field}`;
        if (!sectionEditorsRef.current[key]) {
            sectionEditorsRef.current[key] = withHistory(withReact(createEditor()));
        }
        return sectionEditorsRef.current[key];
    }, []);

    // Мемоизирани default values
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

  // В ArticleCreateForm заменям actualInitialValues логиката:
const actualInitialValues = useMemo(() => {
    if (!propInitialValues) return defaultValues;

    // ПРОСТА функция за обработка
    const processEditorValue = (value) => {
        if (!value) return createSlateEditorState();
        
        // Ако е вече Slate формат (Array)
        if (Array.isArray(value)) {
            return normalizeSlateValue(value);
        }
        
        // Ако е string (HTML или plain text) - ТОВА Е КЛЮЧОВОТО!
        if (typeof value === 'string') {
            const converted = htmlToSlate(value);
            return converted;
        }
        
        // Ако е EditorState обект (fallback)
        if (value && typeof value === 'object' && value.getCurrentContent) {
            const plainText = value.getCurrentContent().getPlainText();
            return plainText ? [{ type: 'paragraph', children: [{ text: plainText }] }] : createSlateEditorState();
        }
        
        return createSlateEditorState();
    };

    const result = {
        ...defaultValues,
        ...propInitialValues,
        summary: processEditorValue(propInitialValues.summary),
        mainImage: {
            ...defaultValues.mainImage,
            ...propInitialValues.mainImage,
            alt: processEditorValue(propInitialValues.mainImage?.alt),
        },
        sections: (propInitialValues.sections || defaultValues.sections).map((section, index) => ({
            ...defaultValues.sections[0],
            ...section,
            content: processEditorValue(section.content),
            order: index + 1,
            // Обработваме и изображенията в секциите
            image: Array.isArray(section.sectionImages) 
                ? section.sectionImages.map(img => ({
                    src: img.src,
                    alt: processEditorValue(img.alt),
                    caption: processEditorValue(img.caption)
                }))
                : (section.image || [])
        })),
    };

    // 🔍 DEBUG: Проверяваме резултата
    
    return result;
}, [propInitialValues, defaultValues]);

    // Мемоизиран submit handler
    const submitHandler = useMemo(() => onSubmitHandler || createArticle, [onSubmitHandler, createArticle]);

    // Hook за създаване на статия
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

    // КЛЮЧОВО: Стабилни handler функции с useRef
    const stableHandlersRef = useRef({});
    const valuesRef = useRef(values);
    valuesRef.current = values; // Винаги актуални values

    // Helper функция за взимане на стойност по path
    const getValueByPath = useCallback((obj, path) => {
        if (path === 'summary') return obj.summary;
        if (path === 'mainImage.alt') return obj.mainImage.alt;
        
        const matches = path.match(/sections\[(\d+)\]\.(\w+)/);
        if (matches) {
            const sectionIndex = parseInt(matches[1], 10);
            const field = matches[2];
            return obj.sections[sectionIndex]?.[field];
        }
        
        return null;
    }, []);

    // Създаваме стабилни onChange handlers
    const getStableChangeHandler = useCallback((fieldName) => {
        if (!stableHandlersRef.current[fieldName]) {
            stableHandlersRef.current[fieldName] = (value) => {
                onChangeHandler(null, true, { name: fieldName, value });
            };
        }
        return stableHandlersRef.current[fieldName];
    }, [onChangeHandler]);

    // Създаваме стабилни onBlur handlers
    const getStableBlurHandler = useCallback((fieldName) => {
        const blurKey = `${fieldName}_blur`;
        if (!stableHandlersRef.current[blurKey]) {
            stableHandlersRef.current[blurKey] = () => {
                // Използваме valuesRef за актуални стойности
                const currentValue = getValueByPath(valuesRef.current, fieldName);
                onBlurHandler(null, true, { name: fieldName, value: currentValue });
            };
        }
        return stableHandlersRef.current[blurKey];
    }, [onBlurHandler, getValueByPath]);

    // Почистваме handlers при unmount
    useEffect(() => {
        return () => {
            stableHandlersRef.current = {};
        };
    }, []);

    // Мемоизирани preview URLs
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

    const sectionImagePreviewUrls = useMemo(() => {
        const urls = {};
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

    // Cleanup URLs
    useEffect(() => {
        return () => {
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
            mainImagePreviewUrls.forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
            Object.values(sectionImagePreviewUrls).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [videoPreviewUrl, mainImagePreviewUrls, sectionImagePreviewUrls]);

    // Мемоизирани callback-и
    const moveSectionUp = useCallback((index) => {
        if (index <= 0) return;
        const updatedSections = [...values.sections];
        const currentSection = { ...updatedSections[index] };
        const prevSection = { ...updatedSections[index - 1] };
        updatedSections[index - 1] = currentSection;
        updatedSections[index] = prevSection;
        updatedSections.forEach((section, idx) => {
            section.order = idx + 1;
        });
        onChangeHandler(null, true, { name: "sections", value: updatedSections });
        swapSectionsMedia(index, index - 1);
        setActiveSection(index - 1);
    }, [values.sections, onChangeHandler, swapSectionsMedia]);

    const moveSectionDown = useCallback((index) => {
        if (index >= values.sections.length - 1) return;
        const updatedSections = [...values.sections];
        const currentSection = { ...updatedSections[index] };
        const nextSection = { ...updatedSections[index + 1] };
        updatedSections[index + 1] = currentSection;
        updatedSections[index] = nextSection;
        updatedSections.forEach((section, idx) => {
            section.order = idx + 1;
        });
        onChangeHandler(null, true, { name: "sections", value: updatedSections });
        swapSectionsMedia(index, index + 1);
        setActiveSection(index + 1);
    }, [values.sections, onChangeHandler, swapSectionsMedia]);

    const handleTagAdd = useCallback((e) => {
        e.preventDefault();
        if (newTag.trim()) {
            addTag(newTag.trim());
            setNewTag("");
        }
    }, [newTag, addTag]);

    const handlePreviewToggle = useCallback(() => {
        setPreviewMode(!previewMode);
    }, [previewMode]);

    const handleAddImageUrl = useCallback(() => {
        if (handleMainImageUrl(imageUrl)) {
            setImageUrl("");
        }
    }, [imageUrl, handleMainImageUrl]);

    const openAltEditModal = useCallback((sectionIndex, imageIndex, image) => {
        setCurrentEditingImage({
            sectionIndex,
            imageIndex,
            image: { ...image }
        });
        setIsAltModalOpen(true);
    }, []);

    const handleSaveImageInfo = useCallback((altEditorState, captionEditorState) => {
        try {
            
            const { sectionIndex, imageIndex } = currentEditingImage;
            
            const normalizedAlt = normalizeSlateValue(altEditorState);
            const normalizedCaption = normalizeSlateValue(captionEditorState);
            
            updateImageInfo(sectionIndex, imageIndex, normalizedAlt, normalizedCaption);
            
            setIsAltModalOpen(false);
            setCurrentEditingImage({
                sectionIndex: null,
                imageIndex: null,
                image: null
            });
                        
        } catch (error) {
            console.error('Грешка при запазване на image info:', error);
            setIsAltModalOpen(false);
        }
    }, [currentEditingImage, updateImageInfo]);

    const handleVideoFile = useCallback((files) => {
        if (!files || files.length === 0) return;
        const videoFile = files[0];
        if (videoFile) {
            if (!/video\/(mp4|webm|ogg)/.test(videoFile.type)) {
                alert(t('articles.createForm.invalidVideoFormat'));
                return;
            }
            if (videoFile.size > 104857600) {
                alert(t('articles.createForm.videoSizeExceeded'));
                return;
            }
            handleMainImageFiles([videoFile]);
            setTimeout(() => forceUpdate(), 100);
        }
    }, [t, handleMainImageFiles, forceUpdate]);

    const handleAddVideoUrl = useCallback(() => {
        if (!values.mainImage.videoUrl) return;
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
        if (!youtubeRegex.test(values.mainImage.videoUrl) && !vimeoRegex.test(values.mainImage.videoUrl)) {
            alert(t('articles.createForm.invalidVideoUrl'));
            return;
        }
        let thumbnailUrl = "";
        if (youtubeRegex.test(values.mainImage.videoUrl)) {
            let videoId = "";
            if (values.mainImage.videoUrl.includes("youtube.com/watch?v=")) {
                videoId = values.mainImage.videoUrl.split("v=")[1]?.split("&")[0];
            } else if (values.mainImage.videoUrl.includes("youtu.be/")) {
                videoId = values.mainImage.videoUrl.split("youtu.be/")[1]?.split("?")[0];
            }
            if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                onChangeHandler({ target: { name: "mainImage.thumbnail", value: thumbnailUrl } });
            }
        }
        alert(t('articles.createForm.videoAddedSuccess'));
        forceUpdate();
    }, [values.mainImage.videoUrl, t, onChangeHandler, forceUpdate]);

    const [expandedImageUrl, setExpandedImageUrl] = useState(null);

    const handleImageClick = useCallback((url) => {
        setExpandedImageUrl(url);
    }, []);

    const closeExpandedImage = useCallback(() => {
        setExpandedImageUrl(null);
    }, []);

    if (previewMode) {
        return (
            <ArticlePreview
                article={values}
                onBack={handlePreviewToggle}
                mediaFiles={mediaFiles}
                convertEditorToHtml={convertSlateToHtml}
            />
        );
    }

    const formTitle = isEditMode
        ? t('articles.editArticle.edit_article')
        : t('articles.createForm.createNewArticle');

    const submitButtonText = isEditMode
        ? t('articles.editArticle.save_changes')
        : t('articles.createForm.saveBtn');

    return (
        <div className="article-create-container">
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
                            <div className={errors.summary ? "slate-editor-container error" : "slate-editor-container"}>
                                <MemoizedSlateEditor
                                key={`summary-${isEditMode ? 'edit' : 'create'}-${JSON.stringify(values.summary)}`}
                                    editor={summaryEditor}
                                    value={values.summary}
                                    onChange={getStableChangeHandler('summary')}
                                    onBlur={getStableBlurHandler('summary')}
                                    placeholder={t('articles.createForm.summaryPlaceholder')}
                                    toolbarSize="normal"
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
                                        <div className={errors["mainImage.alt"] ? "slate-editor-container error" : "slate-editor-container"}>
                                            <MemoizedSlateEditor
                                             key={`mainImageAlt-${isEditMode ? 'edit' : 'create'}-${JSON.stringify(values.mainImage.alt)}`}
                                                editor={mainImageAltEditor}
                                                value={values.mainImage.alt}
                                                onChange={getStableChangeHandler('mainImage.alt')}
                                                onBlur={getStableBlurHandler('mainImage.alt')}
                                                placeholder={t('articles.createForm.imageDescriptionPlaceholder')}
                                                className="slate-editable slate-editable-small"
                                                toolbarSize="small"
                                            />
                                        </div>
                                        {errors["mainImage.alt"] && <div className="error-message">{errors["mainImage.alt"]}</div>}
                                    </div>

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

                                    {(mediaFiles.mainImage.length > 0 || values.mainImage.sources.length > 0) && (
                                        <div className="media-preview-container">
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

                            {values.mainImage.type === "video" && (
                                <>
                                    <div className="form-group-article">
                                        <label htmlFor="mainImageAlt">{t('articles.createForm.videoTitle')} <span className="required">*</span></label>
                                        <div className={errors["mainImage.alt"] ? "slate-editor-container error" : "slate-editor-container"}>
                                            <MemoizedSlateEditor
                                             key={`mainImageAlt-${isEditMode ? 'edit' : 'create'}-${JSON.stringify(values.mainImage.alt)}`}
                                                editor={mainImageAltEditor}
                                                value={values.mainImage.alt}
                                                onChange={getStableChangeHandler('mainImage.alt')}
                                                onBlur={getStableBlurHandler('mainImage.alt')}
                                                placeholder={t('articles.createForm.videoTitlePlaceholder')}
                                                className="slate-editable slate-editable-small"
                                                toolbarSize="small"
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

                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <div className="video-preview-container">
                                            <div className="video-element-wrapper">
                                                <video
                                                    controls
                                                    width="100%"
                                                    height="auto"
                                                    src={videoPreviewUrl}
                                                    poster={values.mainImage.thumbnail || ""}
                                                >
                                                    {t('articles.createForm.browserNotSupport')}
                                                </video>
                                            </div>
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4 dangerouslySetInnerHTML={{ __html: convertSlateToHtml(values.mainImage.alt) || t('articles.createForm.videoFile') }}></h4>
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

                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <VideoThumbnailGenerator
                                            videoFile={mediaFiles.mainImage[0]}
                                            onThumbnailGenerated={(thumbnailFile) => {
                                                uploadThumbnailFile(thumbnailFile);
                                            }}
                                        />
                                    )}

                                    {values.mainImage.type === "video" && values.mainImage.videoUrl && !mediaFiles.mainImage?.length && (
                                        <div className="video-preview-container">
                                            <VideoPlayer
                                                src={values.mainImage.videoUrl}
                                                thumbnail={values.mainImage.thumbnail || ''}
                                                alt={convertSlateToHtml(values.mainImage.alt) || t('articles.createForm.urlVideo')}
                                                allowDownload={false}
                                            />
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4 dangerouslySetInnerHTML={{ __html: convertSlateToHtml(values.mainImage.alt) || t('articles.createForm.externalVideo') }}></h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-video-btn"
                                                    onClick={() => {
                                                        onChangeHandler({ target: { name: "mainImage.videoUrl", value: "" } });
                                                        forceUpdate();
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
                                        <div className={errors[`sections[${index}].content`] ? "slate-editor-container error" : "slate-editor-container"}>
                                            <MemoizedSlateEditor
                                            key={`section-${index}-content-${JSON.stringify(section.content)}`}
                                                editor={getSectionEditor(index, 'content')}
                                                value={section.content}
                                                onChange={getStableChangeHandler(`sections[${index}].content`)}
                                                onBlur={getStableBlurHandler(`sections[${index}].content`)}
                                                placeholder={t('articles.createForm.sectionContentPlaceholder')}
                                                toolbarSize="normal"
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

                                        <div className="section-images-container">
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

                                                        {image.alt && convertSlateToHtml(image.alt) && (
                                                            <div className="img-alt-text-preview">
                                                                ALT: <span className="truncated-alt-text" dangerouslySetInnerHTML={{ __html: convertSlateToHtml(image.alt) }}></span>
                                                            </div>
                                                        )}

                                                        {image.caption && convertSlateToHtml(image.caption) && (
                                                            <div className="img-caption-preview">
                                                                <span className="truncated-caption-text" dangerouslySetInnerHTML={{ __html: convertSlateToHtml(image.caption) }}></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

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

                {isUploading && (
                    <div className="upload-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span>{uploadProgress.toFixed(0)}% {t('articles.createForm.uploaded')}</span>
                    </div>
                )}

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