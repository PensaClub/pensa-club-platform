import { useState, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faMinus, faImage, faVideo, faSliders,
    faUpload, faEye, faSave, faTimes, faCloudUploadAlt,
    faEdit, faBold, faItalic, faUnderline, faListUl,
    faListOl, faQuoteLeft
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import "./articleCreateForm.css";

// Slate.js imports
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { createEditor, Editor, Transforms, Element as SlateElement, Range } from 'slate';

import { useArticleContext } from "../../contexts/ArticleContext";
import ScrollToTop from "../../ScrollToTop/ScrollToTop";
import { ImageAltEditModal } from "../ArticleCreateForm/ImageAltEditModal/ImageAltEditModal";
import VideoThumbnailGenerator from "../ArticleCreateForm/VideoThumbnailGenerator/VideoThumbnailGenerator";
import { SectionQuickMenu } from "../ArticleCreateForm/SectionQuickMenu/SectionQuickMenu";
import ArticlePreview from "./ArticlePreview/ArticlePreview";
import { useCreateArticle } from "../../hooks/useCreateArticle";
import VideoPlayer from "../ArticleView/VideoPlayer/VideoPlayer";
import { convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { generateSlug, isValidSlug, sanitizeSlug } from "../../../utils/slugUtils";

import { useNavigate } from "react-router-dom";
import { notify } from "../../../utils/notify.jsx";

// 🔧 HTML to Slate conversion
const htmlToSlate = (html) => {
    if (!html || typeof html !== 'string') {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    const deserialize = (el) => {
        if (el.nodeType === 3) {
            // Игнорираме празни text nodes
            const text = el.textContent.trim();
            return text ? { text: el.textContent } : null;
        } else if (el.nodeType !== 1) {
            return null;
        }

        const children = Array.from(el.childNodes)
            .map(deserialize)
            .flat()
            .filter(x => x !== null);

        // 🔧 НЕ добавяме празни children!
        // if (children.length === 0) {
        //     children.push({ text: '' });
        // }

        switch (el.nodeName) {
            case 'BODY':
                return children;
            case 'BLOCKQUOTE':
                // Игнорираме празни blockquotes
                return children.length > 0 ? { type: 'block-quote', children } : null;
            case 'P':
                // Игнорираме празни параграфи
                return children.length > 0 ? { type: 'paragraph', children } : null;
            case 'H1':
                return children.length > 0 ? { type: 'heading-one', children } : null;
            case 'H2':
                return children.length > 0 ? { type: 'heading-two', children } : null;
            case 'H3':
                return children.length > 0 ? { type: 'heading-three', children } : null;

            case 'UL':
                return children.length > 0 ? { type: 'bulleted-list', children } : null;
            case 'OL':
                return children.length > 0 ? { type: 'numbered-list', children } : null;
            case 'LI':
                // За list items, ако няма children, добавяме празен text
                return { type: 'list-item', children: children.length > 0 ? children : [{ text: '' }] };

            case 'STRONG':
            case 'B':
                return children.map(child => {
                    if (typeof child === 'object' && child.text !== undefined) {
                        return { ...child, bold: true };
                    }
                    return child;
                });
            case 'EM':
            case 'I':
                return children.map(child => {
                    if (typeof child === 'object' && child.text !== undefined) {
                        return { ...child, italic: true };
                    }
                    return child;
                });
            case 'U':
                return children.map(child => {
                    if (typeof child === 'object' && child.text !== undefined) {
                        return { ...child, underline: true };
                    }
                    return child;
                });

            case 'A':
                const url = el.getAttribute('href') || '';
                return { type: 'link', url, children };
            default:
                return children;
        }
    };

    const nodes = deserialize(document.body);
    const result = Array.isArray(nodes) ? nodes : [nodes];

    // 🔧 АГРЕСИВНО ФИЛТРИРАНЕ - махаме всички null/undefined
    const filtered = result.filter(node => {
        if (!node || typeof node !== 'object') return false;

        // Text nodes
        if (node.text !== undefined) {
            return node.text.trim().length > 0;
        }

        // Element nodes - само ако имат валидно съдържание
        if (node.type) {
            return true;
        }

        return false;
    }).map(node => {
        // Wrap text nodes в paragraphs
        if (node.text !== undefined && !node.type) {
            return { type: 'paragraph', children: [node] };
        }
        return node;
    });

    return filtered.length > 0 ? filtered : [{ type: 'paragraph', children: [{ text: '' }] }];
};

// Convert Draft.js EditorState to Slate
const convertEditorStateToSlate = (editorState) => {
    if (!editorState || !editorState._immutable) {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    try {
        // Get HTML from Draft EditorState and convert to Slate properly
        const content = editorState.getCurrentContent();
        const plainText = content.getPlainText();

        if (!plainText.trim()) {
            return [{ type: 'paragraph', children: [{ text: '' }] }];
        }

        // Convert Draft content to HTML first
        const rawContent = convertToRaw(content);
        const html = draftToHtml(rawContent);

        // Then convert HTML to Slate using our existing function
        if (html && html.trim()) {
            return htmlToSlate(html);
        }

        // Fallback to plain text if HTML conversion fails
        return [{ type: 'paragraph', children: [{ text: plainText }] }];
    } catch (error) {
        console.error('Error converting EditorState to Slate:', error);
        // Last resort fallback
        const plainText = editorState.getCurrentContent().getPlainText();
        return plainText.trim()
            ? [{ type: 'paragraph', children: [{ text: plainText }] }]
            : [{ type: 'paragraph', children: [{ text: '' }] }];
    }
};

const createSlateEditorState = () => {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
};

const createSlateEditor = () => {
    return withHistory(withReact(createEditor()));
};

const normalizeSlateValue = (value) => {
    if (!Array.isArray(value) || value.length === 0) {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    return value.map(node => ({
        ...node,
        children: node.children && node.children.length > 0 ? node.children : [{ text: '' }]
    }));
};

const ArticleCreateForm = forwardRef(({ initialValues: propInitialValues, onSubmitHandler, isEditMode }, ref) => {
    const { t } = useTranslation();
    const { createArticle } = useArticleContext();
    const [isAltModalOpen, setIsAltModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [currentEditingImage, setCurrentEditingImage] = useState({
        sectionIndex: null,
        imageIndex: null,
        image: null
    });

    // Create separate Slate editors
    const summaryEditor = useMemo(() => createSlateEditor(), []);
    const mainImageAltEditor = useMemo(() => createSlateEditor(), []);
    const sectionEditorsRef = useRef({});
    const navigate = useNavigate();
    const getSectionEditor = useCallback((index, field) => {
        const key = `${index}-${field}`;
        if (!sectionEditorsRef.current[key]) {
            sectionEditorsRef.current[key] = createSlateEditor();
        }
        return sectionEditorsRef.current[key];
    }, []);

    // 🔧 ПРАВИЛНО обработени initial values ПРЕДИ да се подадат на hook-а
    const processedInitialValues = useMemo(() => {
        if (!propInitialValues) {
            return null; // Ще използва default values от hook-а
        }

        const processEditorValue = (value, fieldName) => {

            if (!value) {
                return createSlateEditorState();
            }

            // Ако е Draft.js EditorState (от API)
            if (value && value._immutable && typeof value.getCurrentContent === 'function') {
                return convertEditorStateToSlate(value);
            }

            // Ако е вече Slate array
            if (Array.isArray(value)) {
                return normalizeSlateValue(value);
            }

            // Ако е HTML string
            if (typeof value === 'string') {
                if (value.includes('<') && value.includes('>')) {
                    return htmlToSlate(value);
                } else {
                    return value.trim() ? [{ type: 'paragraph', children: [{ text: value }] }] : createSlateEditorState();
                }
            }

            return createSlateEditorState();
        };

        const result = {
            ...propInitialValues,
            summary: processEditorValue(propInitialValues.summary, 'summary'),
            mainImage: {
                ...propInitialValues.mainImage,
                alt: processEditorValue(propInitialValues.mainImage?.alt, 'mainImage.alt'),
            },
            sections: (propInitialValues.sections || []).map((section, index) => ({
                ...section,
                content: processEditorValue(section.content, `sections[${index}].content`),
                order: index + 1,
                image: Array.isArray(section.sectionImages)
                    ? section.sectionImages.map((img, imgIndex) => ({
                        src: img.src,
                        alt: processEditorValue(img.alt, `sections[${index}].image[${imgIndex}].alt`),
                        caption: processEditorValue(img.caption, `sections[${index}].image[${imgIndex}].caption`)
                    }))
                    : (Array.isArray(section.image) ? section.image : [])
            })),
        };

        return result;
    }, [propInitialValues]);

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
    } = useCreateArticle(processedInitialValues, onSubmitHandler || createArticle);

    useImperativeHandle(ref, () => ({
        onSubmit,
        mediaFiles,
        values
    }));

    const [newTag, setNewTag] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [sectionImageUrls, setSectionImageUrls] = useState({});
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    // Slate change handlers
    const handleSlateChange = useCallback((fieldName) => (value) => {
        onChangeHandler(null, true, { name: fieldName, value });
    }, [onChangeHandler]);

    // Slate toolbar functions
    const toggleMark = useCallback((editor, format) => {
        const isActive = isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    }, []);

    const toggleBlock = useCallback((editor, format) => {
        const isActive = isBlockActive(editor, format);
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
    }, []);

    const isMarkActive = useCallback((editor, format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    }, []);

    const isBlockActive = useCallback((editor, format) => {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
            })
        );

        return !!match;
    }, []);

    // Добави тези функции след isBlockActive
    const isLinkActive = useCallback((editor) => {
        const [link] = Editor.nodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
        });
        return !!link;
    }, []);
    const normalizeUrl = useCallback((url) => {
        if (!url) return url;

        const trimmedUrl = url.trim();

        // Ако вече има http:// или https://, върни както е
        if (trimmedUrl.match(/^https?:\/\//i)) {
            return trimmedUrl;
        }

        // Ако е mailto: или tel: линк, върни както е
        if (trimmedUrl.match(/^(mailto:|tel:)/i)) {
            return trimmedUrl;
        }

        // Добави https:// по подразбиране
        return `https://${trimmedUrl}`;
    }, []);
    const insertLink = useCallback((editor, url, text) => {
        if (isLinkActive(editor)) {
            unwrapLink(editor);
        }

        const { selection } = editor;
        const isCollapsed = selection && Range.isCollapsed(selection);
        const link = {
            type: 'link',
            url,
            children: isCollapsed ? [{ text }] : [],
        };

        if (isCollapsed) {
            Transforms.insertNodes(editor, link);
        } else {
            Transforms.wrapNodes(editor, link, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
        }
    }, []);

    const unwrapLink = useCallback((editor) => {
        Transforms.unwrapNodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
        });
    }, []);

    const resetSlugFromTitle = useCallback(() => {
        const newSlug = generateSlug(values.title);
        onChangeHandler({ target: { name: "slug", value: newSlug } });
        setIsSlugManuallyEdited(false);
    }, [values.title, onChangeHandler]);

    // Добави handleSlugChange
    const handleSlugChange = useCallback((e) => {
        setIsSlugManuallyEdited(true);
        const sanitizedSlug = sanitizeSlug(e.target.value);
        onChangeHandler({ target: { name: "slug", value: sanitizedSlug } });
    }, [onChangeHandler]);

    const toggleLink = useCallback((editor) => {
        if (isLinkActive(editor)) {
            unwrapLink(editor);
        } else {
            const url = window.prompt('Enter the URL:');
            if (!url) return;

            // Нормализирай URL-то
            const normalizedUrl = normalizeUrl(url.trim());

            const { selection } = editor;
            const isCollapsed = selection && Range.isCollapsed(selection);

            if (isCollapsed) {
                const text = window.prompt('Enter link text:') || url;
                insertLink(editor, normalizedUrl, text);
            } else {
                insertLink(editor, normalizedUrl, '');
            }
        }
    }, [isLinkActive, insertLink, unwrapLink, normalizeUrl]);

    // Render functions
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

            case 'link':
                return (
                    <a
                        {...props.attributes}
                        href={props.element.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {props.children}
                    </a>
                );
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

    const renderSlateToolbar = useCallback((editor, isSmall = false) => (
        <div className={`slate-toolbar ${isSmall ? 'slate-toolbar-small' : ''}`}>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
                className={`slate-btn ${isMarkActive(editor, 'bold') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faBold} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
                className={`slate-btn ${isMarkActive(editor, 'italic') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faItalic} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
                className={`slate-btn ${isMarkActive(editor, 'underline') ? 'active' : ''}`}
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
                            toggleBlock(editor, 'heading-one');
                        }}
                        className={`slate-btn ${isBlockActive(editor, 'heading-one') ? 'active' : ''}`}
                    >
                        H1
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock(editor, 'heading-two');
                        }}
                        className={`slate-btn ${isBlockActive(editor, 'heading-two') ? 'active' : ''}`}
                    >
                        H2
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock(editor, 'bulleted-list');
                        }}
                        className={`slate-btn ${isBlockActive(editor, 'bulleted-list') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faListUl} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock(editor, 'numbered-list');
                        }}
                        className={`slate-btn ${isBlockActive(editor, 'numbered-list') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faListOl} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleBlock(editor, 'block-quote');
                        }}
                        className={`slate-btn ${isBlockActive(editor, 'block-quote') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faQuoteLeft} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleLink(editor);
                        }}
                        className={`slate-btn ${isLinkActive(editor) ? 'active' : ''}`}
                    >
                        🔗
                    </button>
                </>
            )}
        </div>
    ), [toggleMark, toggleBlock, isMarkActive, isBlockActive, toggleLink, isLinkActive]);

    // Other handlers
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

    const handlePreview = useCallback(() => {
        if (!values.title?.trim()) {
            notify('warning', t('articles.createForm.enterTitleForPreview'));
            return;
        }

        navigate('/profile/article-preview', {
            state: {
                previewData: values,
                mediaFiles: mediaFiles
            }
        });
    }, [values, mediaFiles, navigate, t]);

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
    }, [values.mainImage.videoUrl, t, onChangeHandler]);

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

    // Loading check
    if (!values || !values.sections) {
        return (
            <div className="article-create-container">
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <p>Loading article data...</p>
                </div>
            </div>
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
                                value={values.title || ''}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors.title ? "error" : ""}
                                placeholder={t('articles.createForm.titlePlaceholder')}
                            />
                            {errors.title && <div className="error-message">{errors.title}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="slug">
                                {t('articles.createForm.slug')} <span className="required">*</span>
                            </label>
                            <div className="slug-input-container">
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={values.slug || ''}
                                    onChange={handleSlugChange}
                                    onBlur={onBlurHandler}
                                    className={errors.slug ? "error" : (isValidSlug(values.slug) ? "valid" : "")}
                                    placeholder={t('articles.createForm.slugPlaceholder')}
                                />
                                <button
                                    type="button"
                                    className="slug-reset-btn"
                                    onClick={resetSlugFromTitle}
                                    title="Генерирай slug от заглавието"
                                >
                                    🔄
                                </button>
                            </div>
                            {!isValidSlug(values.slug) && values.slug && (
                                <div className="slug-warning">
                                    Slug-ът трябва да съдържа само малки букви, цифри и тирета
                                </div>
                            )}
                            {isSlugManuallyEdited && (
                                <div className="slug-info">
                                    Slug-ът е ръчно редактиран и няма да се променя автоматично
                                </div>
                            )}
                            {errors.slug && <div className="error-message">{errors.slug}</div>}
                        </div>

                        <div className="form-group-article">
                            <label htmlFor="author">{t('articles.createForm.author')} <span className="required">*</span></label>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                value={values.author || ''}
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
                                value={values.publishDate || ''}
                                onChange={onChangeHandler}
                            />
                        </div>

                        {/* 🔧 SUMMARY EDITOR - САМО Slate */}
                        <div className="form-group-article">
                            <label htmlFor="summary">{t('articles.createForm.summary')} <span className="required">*</span></label>
                            <div className={errors.summary ? "slate-editor-container error" : "slate-editor-container"}>
                                <Slate
                                    key="summary-editor"
                                    editor={summaryEditor}
                                    initialValue={normalizeSlateValue(values.summary)}
                                    onChange={handleSlateChange('summary')}
                                >
                                    {renderSlateToolbar(summaryEditor, false)}
                                    <Editable
                                        className="slate-editable"
                                        placeholder={t('articles.createForm.summaryPlaceholder')}
                                        renderElement={renderElement}
                                        renderLeaf={renderLeaf}
                                    />
                                </Slate>
                            </div>
                            {errors.summary && <div className="error-message">{errors.summary}</div>}
                        </div>
                    </div>
                </div>

                {/* Медия раздел */}
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
                                    {/* 🔧 MAIN IMAGE ALT EDITOR - САМО Slate */}
                                    <div className="form-group-article">
                                        <label htmlFor="mainImageAlt">{t('articles.createForm.altText')} <span className="required">*</span></label>
                                        <div className={errors["mainImage.alt"] ? "slate-editor-container error" : "slate-editor-container"}>
                                            <Slate
                                                key="main-image-alt-editor"
                                                editor={mainImageAltEditor}
                                                initialValue={normalizeSlateValue(values.mainImage.alt)}
                                                onChange={handleSlateChange('mainImage.alt')}
                                            >
                                                {renderSlateToolbar(mainImageAltEditor, true)}
                                                <Editable
                                                    className="slate-editable slate-editable-small"
                                                    placeholder={t('articles.createForm.imageDescriptionPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                />
                                            </Slate>
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

                                    {/* СНИМКИ PREVIEW */}
                                    {(mediaFiles.mainImage.length > 0 || values.mainImage.sources.length > 0) && (
                                        <div className="media-preview-container">
                                            {mediaFiles.mainImage.map((file, index) => (
                                                <div key={index} className="image-preview-item">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index}`}
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
                                                <div key={index} className="image-preview-item">
                                                    <img src={url} alt={`URL ${index}`} />
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
                                    {/* VIDEO TITLE EDITOR - САМО Slate */}
                                    <div className="form-group-article">
                                        <label htmlFor="mainImageAlt">{t('articles.createForm.videoTitle')} <span className="required">*</span></label>
                                        <div className={errors["mainImage.alt"] ? "slate-editor-container error" : "slate-editor-container"}>
                                            <Slate
                                                key="main-image-alt-video-editor"
                                                editor={mainImageAltEditor}
                                                initialValue={normalizeSlateValue(values.mainImage.alt)}
                                                onChange={handleSlateChange('mainImage.alt')}
                                            >
                                                {renderSlateToolbar(mainImageAltEditor, true)}
                                                <Editable
                                                    className="slate-editable slate-editable-small"
                                                    placeholder={t('articles.createForm.videoTitlePlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                />
                                            </Slate>
                                        </div>
                                        {errors["mainImage.alt"] && <div className="error-message">{errors["mainImage.alt"]}</div>}
                                    </div>

                                    <div className="form-group-article">
                                        <label htmlFor="videoThumbnail">{t('articles.createForm.thumbnail')}</label>
                                        <input
                                            type="text"
                                            id="videoThumbnail"
                                            name="mainImage.thumbnail"
                                            value={values.mainImage.thumbnail || ''}
                                            onChange={onChangeHandler}
                                            placeholder={t('articles.createForm.videoThumbnailPlaceholder')}
                                        />
                                    </div>

                                    {/* 🔧 ДОБАВЯМ ЛИПСВАЩАТА VIDEO URL ЛОГИКА */}
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
                                                onChange={(e) => handleMainImageFiles(e.target.files)}
                                                accept="video/mp4,video/webm,video/ogg"
                                                className="file-input"
                                            />
                                            <p className="upload-info">{t('articles.createForm.supportedFormats')}</p>
                                        </div>
                                    </div>

                                    {/* 🔧 ПОПРАВЯМ VIDEO PREVIEW ЛОГИКАТА КАТО В СТАРАТА ФОРМА */}
                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <div className="video-preview-container">
                                            <div className="video-element-wrapper">
                                                <video
                                                    controls
                                                    width="100%"
                                                    height="auto"
                                                    src={URL.createObjectURL(mediaFiles.mainImage[0])}
                                                    poster={values.mainImage.thumbnail || ""}
                                                >
                                                    {t('articles.createForm.browserNotSupport')}
                                                </video>
                                            </div>
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4>{values.mainImage.alt ? 'Video Title' : t('articles.createForm.videoFile')}</h4>
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

                                    {/* 🔧 ДОБАВЯМ ЛИПСВАЩИЯ VideoThumbnailGenerator */}
                                    {values.mainImage.type === "video" && mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && (
                                        <VideoThumbnailGenerator
                                            videoFile={mediaFiles.mainImage[0]}
                                            onThumbnailGenerated={(thumbnailFile) => {
                                                uploadThumbnailFile(thumbnailFile);
                                            }}
                                        />
                                    )}

                                    {/* 🔧 ДОБАВЯМ VideoPlayer ЗА URL VIDEOS */}
                                    {values.mainImage.type === "video" && values.mainImage.videoUrl && !mediaFiles.mainImage?.length && (
                                        <div className="video-preview-container">
                                            <VideoPlayer
                                                src={values.mainImage.videoUrl}
                                                thumbnail={values.mainImage.thumbnail || ''}
                                                alt={values.mainImage.alt ? 'Video' : t('articles.createForm.urlVideo')}
                                                allowDownload={false}
                                            />
                                            <div className="video-controls-container">
                                                <div className="video-info-details">
                                                    <h4>{values.mainImage.alt ? 'Video Title' : t('articles.createForm.externalVideo')}</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-video-btn"
                                                    onClick={() => {
                                                        onChangeHandler({ target: { name: "mainImage.videoUrl", value: "" } });
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

                {/* Секции */}
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
                                            value={section.title || ''}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            className={errors[`sections[${index}].title`] ? "error" : ""}
                                            placeholder={t('articles.createForm.sectionTitlePlaceholder')}
                                        />
                                        {errors[`sections[${index}].title`] && <div className="error-message">{errors[`sections[${index}].title`]}</div>}
                                    </div>

                                    {/* 🔧 SECTION CONTENT EDITOR - САМО Slate */}
                                    <div className="form-group-article">
                                        <label htmlFor={`section-content-${index}`}>{t('articles.createForm.contentSimple')} <span className="required">*</span></label>
                                        <div className={errors[`sections[${index}].content`] ? "slate-editor-container error" : "slate-editor-container"}>
                                            <Slate
                                                key={`section-${index}-content`}
                                                editor={getSectionEditor(index, 'content')}
                                                initialValue={normalizeSlateValue(section.content)}
                                                onChange={handleSlateChange(`sections[${index}].content`)}
                                            >
                                                {renderSlateToolbar(getSectionEditor(index, 'content'), false)}
                                                <Editable
                                                    className="slate-editable"
                                                    placeholder={t('articles.createForm.sectionContentPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                />
                                            </Slate>
                                        </div>
                                        {errors[`sections[${index}].content`] && <div className="error-message">{errors[`sections[${index}].content`]}</div>}
                                    </div>

                                    {/* Section images */}
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

                                        {/* SECTION IMAGES PREVIEW */}
                                        {section.image && Array.isArray(section.image) && section.image.length > 0 && (
                                            <div className="section-images-container">
                                                {section.image.map((image, imgIndex) => (
                                                    <div key={imgIndex} className="section-image-preview">
                                                        <img src={image.src} alt={`Section ${index + 1} Image ${imgIndex + 1}`} />
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
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                {values.tags && values.tags.map((tag, index) => (
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
                        onClick={handlePreview}
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