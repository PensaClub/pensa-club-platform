// components/Initiatives/CreatePublication/Sections/ContentSection/ContentSection.jsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, faTrash, faEdit, faChevronUp, faChevronDown, 
    faImage, faUpload, faTimes, faLink, faVideo, faPlay, 
    faSpinner, faCheck 
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Slate, Editable } from 'slate-react';
import { createSlateEditor, createSlateEditorState } from '../../../../Initiatives/CreateIniciative/Utils/initiativeEditorUtils';
import { formatVideoDuration } from '../../../../../utils/video-utils';
import './contentSection.css';

const ContentSection = ({
    values,
    errors,
    setValues,
    addSection,
    removeSection,
    updateSection,
    Transforms,
    Editor,
    SlateElement,
    handleSectionImageUpload,
    addSectionImageFromUrl,
    removeSectionImage,
    updateSectionImageAlt,
    updateSectionImageCaption,
    clearSectionImages,
    handleSectionVideoUpload,
    removeSectionVideo,
    videoUploadState,
}) => {
    const { t } = useTranslation();
    const sectionEditorsRef = useRef({});
    const sectionRefs = useRef({});
    const videoRefs = useRef({});
    const [lastSectionCount, setLastSectionCount] = useState(values.sections?.length || 0);
    const [lastRemovedIndex, setLastRemovedIndex] = useState(null);

    const [showUrlInputs, setShowUrlInputs] = useState({});
    const [imageUrls, setImageUrls] = useState({});
    const [playingVideos, setPlayingVideos] = useState({});

    useEffect(() => {
        const currentSectionCount = values.sections?.length || 0;

        if (currentSectionCount > lastSectionCount) {
            setTimeout(() => {
                const newSectionIndex = currentSectionCount - 1;
                scrollToSection(newSectionIndex, true);
            }, 100);
        } else if (currentSectionCount < lastSectionCount && lastRemovedIndex !== null) {
            setTimeout(() => {
                const targetIndex = Math.max(0, Math.min(lastRemovedIndex - 1, currentSectionCount - 1));
                if (targetIndex >= 0 && currentSectionCount > 0) {
                    scrollToSection(targetIndex, false);
                }
                setLastRemovedIndex(null);
            }, 100);
        }

        setLastSectionCount(currentSectionCount);
    }, [values.sections?.length, lastSectionCount, lastRemovedIndex]);

    const scrollToSection = (sectionIndex, shouldFocus = false) => {
        const sectionElement = sectionRefs.current[sectionIndex];
        if (sectionElement) {
            sectionElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });

            if (shouldFocus) {
                setTimeout(() => {
                    const titleInput = sectionElement.querySelector('input[type="text"]');
                    if (titleInput) {
                        titleInput.focus();
                    }
                }, 300);
            }
        }
    };

    const handleRemoveSection = (index) => {
        setLastRemovedIndex(index);
        removeSection(index);
    };

    const handleImageUrlChange = (sectionIndex, value) => {
        setImageUrls(prev => ({
            ...prev,
            [sectionIndex]: value
        }));
    }

    const handleAddImageFromUrl = (sectionIndex) => {
        const url = imageUrls[sectionIndex];
        if (url && url.trim()) {
            addSectionImageFromUrl(sectionIndex, url.trim());
            setImageUrls(prev => ({ ...prev, [sectionIndex]: '' }));
            setShowUrlInputs(prev => ({ ...prev, [sectionIndex]: false }));
        }
    };

    const toggleVideoPlay = (sectionIndex) => {
        const video = videoRefs.current[sectionIndex];
        if (video) {
            if (playingVideos[sectionIndex]) {
                video.pause();
            } else {
                video.play();
            }
            setPlayingVideos(prev => ({
                ...prev,
                [sectionIndex]: !prev[sectionIndex]
            }));
        }
    };

    const getVideoProgressText = (sectionIndex) => {
        const state = videoUploadState?.[sectionIndex];
        if (!state?.stage) return '';
        
        switch (state.stage) {
            case 'thumbnail':
                return t('publications.video.generatingThumbnail');
            case 'thumbnailUpload':
                return t('publications.video.uploadingThumbnail');
            case 'video':
                return `${t('publications.video.uploadingVideo')} ${Math.round(state.progress || 0)}%`;
            default:
                return '';
        }
    };

    const getSectionEditor = (index) => {
        if (!sectionEditorsRef.current[index]) {
            sectionEditorsRef.current[index] = createSlateEditor();
        }
        return sectionEditorsRef.current[index];
    };

    const handleSectionContentChange = (sectionIndex) => (value) => {
        try {
            const updatedSections = [...(values.sections || [])];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                content: value
            };
            setValues(prev => ({ ...prev, sections: updatedSections }));
        } catch (error) {
            console.error('Error updating section content:', error);
            const updatedSections = [...(values.sections || [])];
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                content: [{ type: 'paragraph', children: [{ text: '' }] }]
            };
            setValues(prev => ({ ...prev, sections: updatedSections }));
        }
    };

    const handleMoveSection = (index, direction) => {
        const newSections = [...(values.sections || [])];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newSections.length) {
            [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
            
            const updatedSections = newSections.map((section, idx) => ({
                ...section,
                order: idx + 1
            }));
            
            setValues(prev => ({ ...prev, sections: updatedSections }));

            const tempEditor = sectionEditorsRef.current[index];
            sectionEditorsRef.current[index] = sectionEditorsRef.current[targetIndex];
            sectionEditorsRef.current[targetIndex] = tempEditor;
        }
    };

    const toggleMark = (editor, format) => {
        try {
            const isActive = isMarkActive(editor, format);
            if (isActive) {
                Editor.removeMark(editor, format);
            } else {
                Editor.addMark(editor, format, true);
            }
        } catch (error) {
            console.error('Error toggling mark:', error);
        }
    };

    const toggleBlock = (editor, format) => {
        try {
            const isActive = isBlockActive(editor, format);
            const isList = ['numbered-list', 'bulleted-list'].includes(format);

            Transforms.unwrapNodes(editor, {
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type),
                split: true,
            });

            const newProperties = {
                type: isActive ? 'paragraph' : isList ? 'list-item' : format,
            };

            Transforms.setNodes(editor, newProperties);

            if (!isActive && isList) {
                const block = { type: format, children: [] };
                Transforms.wrapNodes(editor, block);
            }
        } catch (error) {
            console.error('Error toggling block:', error);
        }
    };

    const isMarkActive = (editor, format) => {
        try {
            const marks = Editor.marks(editor);
            return marks ? marks[format] === true : false;
        } catch (error) {
            return false;
        }
    };

    const isBlockActive = (editor, format) => {
        try {
            const { selection } = editor;
            if (!selection) return false;

            const [match] = Array.from(
                Editor.nodes(editor, {
                    at: Editor.unhangRange(editor, selection),
                    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
                })
            );

            return !!match;
        } catch (error) {
            return false;
        }
    };

    const handleKeyDown = (event, editor) => {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'b':
                    event.preventDefault();
                    toggleMark(editor, 'bold');
                    break;
                case 'i':
                    event.preventDefault();
                    toggleMark(editor, 'italic');
                    break;
                case 'u':
                    event.preventDefault();
                    toggleMark(editor, 'underline');
                    break;
                case '1':
                    event.preventDefault();
                    toggleBlock(editor, 'heading-one');
                    break;
                case '2':
                    event.preventDefault();
                    toggleBlock(editor, 'heading-two');
                    break;
                case '3':
                    event.preventDefault();
                    toggleBlock(editor, 'heading-three');
                    break;
                default:
                    break;
            }
        }
    };

    const renderSlateToolbar = (editor) => (
        <div className="pensa-pub-sec-slate-toolbar">
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
                className={`pensa-pub-sec-slate-btn ${isMarkActive(editor, 'bold') ? 'active' : ''}`}
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
                className={`pensa-pub-sec-slate-btn ${isMarkActive(editor, 'italic') ? 'active' : ''}`}
            >
                <em>I</em>
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
                className={`pensa-pub-sec-slate-btn ${isMarkActive(editor, 'underline') ? 'active' : ''}`}
            >
                <u>U</u>
            </button>
            <div className="pensa-pub-sec-toolbar-divider"></div>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-one');
                }}
                className={`pensa-pub-sec-slate-btn ${isBlockActive(editor, 'heading-one') ? 'active' : ''}`}
            >
                H1
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-two');
                }}
                className={`pensa-pub-sec-slate-btn ${isBlockActive(editor, 'heading-two') ? 'active' : ''}`}
            >
                H2
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'bulleted-list');
                }}
                className={`pensa-pub-sec-slate-btn ${isBlockActive(editor, 'bulleted-list') ? 'active' : ''}`}
            >
                • List
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'numbered-list');
                }}
                className={`pensa-pub-sec-slate-btn ${isBlockActive(editor, 'numbered-list') ? 'active' : ''}`}
            >
                1. List
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'block-quote');
                }}
                className={`pensa-pub-sec-slate-btn ${isBlockActive(editor, 'block-quote') ? 'active' : ''}`}
            >
                " Quote
            </button>
        </div>
    );

    const renderElement = (props) => {
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
    };

    const renderLeaf = (props) => {
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
    };

    useEffect(() => {
        const currentCount = values.sections?.length || 0;
        if (currentCount > lastSectionCount) {
            setTimeout(() => {
                const lastSectionIndex = currentCount - 1;
                const lastSection = sectionRefs.current[lastSectionIndex];
                if (lastSection) {
                    lastSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    const titleInput = lastSection.querySelector('input[type="text"]');
                    if (titleInput) {
                        setTimeout(() => titleInput.focus(), 300);
                    }
                }
            }, 100);
        }
        setLastSectionCount(currentCount);
    }, [values.sections?.length, lastSectionCount]);

    return (
        <div className="pensa-pub-sec-card">
            <div className="pensa-pub-sec-header">
                <h2 className="pensa-pub-sec-title">
                    📝 {t('publications.content.sections')}
                </h2>
                <button
                    type="button"
                    className="pensa-pub-sec-btn accent"
                    onClick={addSection}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {t('publications.content.addSection')}
                </button>
            </div>
            <div className="pensa-pub-sec-content">

                <div className="pensa-pub-sec-help">
                    <p>{t('publications.helpTexts.sectionsHelp')}</p>
                </div>

                {(values.sections || []).length === 0 ? (
                    <div className="pensa-pub-sec-empty-state">
                        <div className="pensa-pub-sec-empty-content">
                            <FontAwesomeIcon icon={faEdit} className="pensa-pub-sec-empty-icon" />
                            <h3>{t('publications.content.noSections')}</h3>
                            <p>{t('publications.content.sectionsDescription')}</p>
                            <button
                                type="button"
                                className="pensa-pub-sec-btn primary"
                                onClick={addSection}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('publications.content.addFirstSection')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pensa-pub-sec-list">
                        {(values.sections || []).map((section, index) => (
                            <div
                                key={index}
                                className="pensa-pub-sec-item"
                                ref={el => sectionRefs.current[index] = el}
                            >
                                <div className="pensa-pub-sec-item-header">
                                    <div className="pensa-pub-sec-item-title">
                                        <h4>
                                            {t('publications.content.sectionNumber', { number: index + 1 })}
                                            {(errors[`sections[${index}].title`] || errors[`sections[${index}].content`]) && (
                                                <span className="pensa-pub-sec-error-indicator">⚠️</span>
                                            )}
                                        </h4>
                                        <div className="pensa-pub-sec-item-status">
                                            {section.title ? (
                                                <span className="pensa-pub-sec-status-complete">✅ {section.title}</span>
                                            ) : (
                                                <span className="pensa-pub-sec-status-incomplete">⚪ {t('publications.content.untitled')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pensa-pub-sec-item-actions">
                                        <button
                                            type="button"
                                            className="pensa-pub-sec-move-btn"
                                            onClick={() => handleMoveSection(index, 'up')}
                                            disabled={index === 0}
                                            title={t('publications.content.moveUp')}
                                        >
                                            <FontAwesomeIcon icon={faChevronUp} />
                                        </button>
                                        <button
                                            type="button"
                                            className="pensa-pub-sec-move-btn"
                                            onClick={() => handleMoveSection(index, 'down')}
                                            disabled={index === (values.sections || []).length - 1}
                                            title={t('publications.content.moveDown')}
                                        >
                                            <FontAwesomeIcon icon={faChevronDown} />
                                        </button>

                                        <button
                                            type="button"
                                            className="pensa-pub-sec-remove-btn"
                                            onClick={() => handleRemoveSection(index)}
                                            title={t('publications.content.removeSection')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            {t('publications.common.remove')}
                                        </button>
                                    </div>
                                </div>

                                <div className="pensa-pub-sec-item-content">
                                    {/* Section Title */}
                                    <div className="pensa-pub-sec-form-group">
                                        <label htmlFor={`section-title-${index}`}>
                                            {t('publications.content.sectionTitle')}
                                            <span className="pensa-pub-sec-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id={`section-title-${index}`}
                                            value={section.title || ''}
                                            onChange={(e) => {
                                                const updatedSections = [...(values.sections || [])];
                                                updatedSections[index] = {
                                                    ...updatedSections[index],
                                                    title: e.target.value,
                                                    titleSlug: e.target.value.toLowerCase()
                                                        .replace(/[^a-z0-9\s]/g, '')
                                                        .replace(/\s+/g, '-')
                                                        .trim()
                                                };
                                                setValues(prev => ({ ...prev, sections: updatedSections }));
                                            }}
                                            placeholder={t('publications.content.sectionTitlePlaceholder')}
                                            className={`pensa-pub-sec-title-input ${errors[`sections[${index}].title`] ? 'error' : ''}`}
                                            maxLength={200}
                                        />
                                        <div className="pensa-pub-sec-char-count">
                                            {section.title?.length || 0}/200
                                        </div>
                                        {errors[`sections[${index}].title`] && (
                                            <div className="pensa-pub-sec-error-msg">{errors[`sections[${index}].title`]}</div>
                                        )}
                                    </div>

                                    {/* Section Content - Slate.js */}
                                    <div className="pensa-pub-sec-form-group">
                                        <label htmlFor={`section-content-${index}`}>
                                            {t('publications.content.sectionContent')}
                                            <span className="pensa-pub-sec-required">*</span>
                                        </label>
                                        <div className="pensa-pub-sec-field-help">
                                            {t('publications.helpTexts.sectionContentHelp')}
                                        </div>
                                        <div className={`pensa-pub-sec-slate-container ${errors[`sections[${index}].content`] ? 'error' : ''}`}>
                                            <Slate
                                                key={`section-${index}`}
                                                editor={getSectionEditor(index)}
                                                initialValue={section.content || createSlateEditorState()}
                                                onChange={handleSectionContentChange(index)}
                                            >
                                                {renderSlateToolbar(getSectionEditor(index))}
                                                <Editable
                                                    className="pensa-pub-sec-slate-editable"
                                                    placeholder={t('publications.content.sectionContentPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                    onKeyDown={(event) => handleKeyDown(event, getSectionEditor(index))}
                                                    onError={(error) => {
                                                        console.error('Slate editor error:', error);
                                                        const editor = getSectionEditor(index);
                                                        editor.children = createSlateEditorState();
                                                    }}
                                                />
                                            </Slate>
                                        </div>
                                        {errors[`sections[${index}].content`] && (
                                            <div className="pensa-pub-sec-error-msg">{errors[`sections[${index}].content`]}</div>
                                        )}
                                    </div>

                                    {/* Section Image */}
                                    <div className="pensa-pub-sec-form-group">
                                        <label>
                                            <FontAwesomeIcon icon={faImage} />
                                            {t('publications.media.sectionImage')}
                                        </label>
                                        <div className="pensa-pub-sec-field-help">
                                            {t('publications.helpTexts.sectionImageHelp')}
                                        </div>

                                        <div className="pensa-pub-sec-img-upload">
                                            <div className="pensa-pub-sec-upload-methods">
                                                <div className="pensa-pub-sec-upload-method">
                                                    <label className="pensa-pub-sec-upload-btn">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                        {section.image ? t('publications.media.changeImage') : t('publications.media.uploadImage')}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleSectionImageUpload(e, index)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>

                                                <div className="pensa-pub-sec-upload-method">
                                                    <button
                                                        type="button"
                                                        className="pensa-pub-sec-upload-btn"
                                                        onClick={() => setShowUrlInputs(prev => ({
                                                            ...prev,
                                                            [index]: !prev[index]
                                                        }))}
                                                    >
                                                        <FontAwesomeIcon icon={faLink} />
                                                        {section.image ? t('publications.media.changeImageUrl') : t('publications.media.addImageUrl')}
                                                    </button>
                                                </div>

                                                {section.image && (
                                                    <div className="pensa-pub-sec-upload-method">
                                                        <button
                                                            type="button"
                                                            className="pensa-pub-sec-clear-btn"
                                                            onClick={() => clearSectionImages(index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                            {t('publications.media.clearImage')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {showUrlInputs[index] && (
                                                <div className="pensa-pub-sec-url-section">
                                                    <input
                                                        type="url"
                                                        placeholder={t('publications.media.imageUrl')}
                                                        value={imageUrls[index] || ''}
                                                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                        className="pensa-pub-sec-url-input"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="pensa-pub-sec-url-add-btn"
                                                        onClick={() => handleAddImageFromUrl(index)}
                                                        disabled={!imageUrls[index]?.trim()}
                                                    >
                                                        <FontAwesomeIcon icon={faLink} />
                                                        {t('publications.media.addImage')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Image Preview */}
                                        {section.image && (
                                            <div className="pensa-pub-sec-img-preview">
                                                <div className="pensa-pub-sec-img-container">
                                                    <div className="pensa-pub-sec-img-item">
                                                        <div className="pensa-pub-sec-img-preview-inner">
                                                            <img src={section.image.src} alt={section.image.alt || 'Section image'} />
                                                            <div className="pensa-pub-sec-img-overlay">
                                                                <button
                                                                    type="button"
                                                                    className="pensa-pub-sec-img-remove-btn"
                                                                    onClick={() => clearSectionImages(index)}
                                                                    title={t('publications.media.removeImage')}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </div>
                                                            {section.image.isUploading && (
                                                                <div className="pensa-pub-sec-img-uploading">
                                                                    <div className="pensa-pub-sec-spinner"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pensa-pub-sec-img-controls">
                                                        <div className="pensa-pub-sec-img-input-group">
                                                            <label>{t('publications.media.altText')}:</label>
                                                            <input
                                                                type="text"
                                                                placeholder={t('publications.media.imageDescription')}
                                                                value={section.image.alt || ''}
                                                                onChange={(e) => updateSectionImageAlt(index, e.target.value)}
                                                                className="pensa-pub-sec-img-input"
                                                                maxLength={100}
                                                            />
                                                            <div className="pensa-pub-sec-img-char-count">
                                                                {section.image.alt?.length || 0}/100
                                                            </div>
                                                        </div>

                                                        <div className="pensa-pub-sec-img-input-group">
                                                            <label>{t('publications.media.caption')}:</label>
                                                            <input
                                                                type="text"
                                                                placeholder={t('publications.media.imageCaption')}
                                                                value={section.image.caption || ''}
                                                                onChange={(e) => updateSectionImageCaption(index, e.target.value)}
                                                                className="pensa-pub-sec-img-input"
                                                                maxLength={150}
                                                            />
                                                            <div className="pensa-pub-sec-img-char-count">
                                                                {section.image.caption?.length || 0}/150
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section Video */}
                                    <div className="pensa-pub-sec-form-group">
                                        <label>
                                            <FontAwesomeIcon icon={faVideo} />
                                            <span style={{ marginLeft: '0.5rem' }}>{t('publications.video.title')}</span>
                                        </label>
                                        <div className="pensa-pub-sec-field-help">
                                            {t('publications.video.helpText')}
                                        </div>

                                        {/* Video Upload Area */}
                                        {!section.videoUrl && !videoUploadState?.[index]?.isUploading && (
                                            <div className="pensa-pub-sec-video-upload">
                                                <label className="pensa-pub-sec-video-upload-btn">
                                                    <FontAwesomeIcon icon={faVideo} />
                                                    {t('publications.video.selectVideo')}
                                                    <input
                                                        type="file"
                                                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                                        onChange={(e) => handleSectionVideoUpload(e, index)}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                                <span className="pensa-pub-sec-video-formats">
                                                    MP4, WebM, OGG • Max 100MB
                                                </span>
                                            </div>
                                        )}

                                        {/* Video Upload Progress */}
                                        {videoUploadState?.[index]?.isUploading && (
                                            <div className="pensa-pub-sec-video-uploading">
                                                <FontAwesomeIcon icon={faSpinner} spin className="pensa-pub-sec-video-spinner" />
                                                <p>{getVideoProgressText(index)}</p>
                                                <div className="pensa-pub-sec-video-progress-bar">
                                                    <div 
                                                        className="pensa-pub-sec-video-progress-fill"
                                                        style={{ 
                                                            width: videoUploadState[index]?.stage === 'video' 
                                                                ? `${videoUploadState[index]?.progress || 0}%` 
                                                                : '100%' 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Video Preview */}
                                        {section.videoUrl && !videoUploadState?.[index]?.isUploading && (
                                            <div className="pensa-pub-sec-video-preview">
                                                <div className="pensa-pub-sec-video-container">
                                                    <div className="pensa-pub-sec-video-wrapper">
                                                        <video
                                                            ref={el => videoRefs.current[index] = el}
                                                            src={section.videoUrl}
                                                            poster={section.thumbnailUrl}
                                                            className="pensa-pub-sec-video-player"
                                                            onEnded={() => setPlayingVideos(prev => ({ ...prev, [index]: false }))}
                                                        />
                                                        
                                                        {!playingVideos[index] && (
                                                            <div 
                                                                className="pensa-pub-sec-video-overlay"
                                                                onClick={() => toggleVideoPlay(index)}
                                                            >
                                                                <div className="pensa-pub-sec-video-play-btn">
                                                                    <FontAwesomeIcon icon={faPlay} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pensa-pub-sec-video-info">
                                                        <div className="pensa-pub-sec-video-info-item">
                                                            <FontAwesomeIcon icon={faCheck} className="pensa-pub-sec-video-success-icon" />
                                                            <span>{t('publications.video.uploaded')}</span>
                                                        </div>
                                                        
                                                        {section.thumbnailUrl && (
                                                            <div className="pensa-pub-sec-video-thumb">
                                                                <span>{t('publications.video.thumbnail')}:</span>
                                                                <img src={section.thumbnailUrl} alt="Video thumbnail" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="pensa-pub-sec-video-remove-btn"
                                                    onClick={() => removeSectionVideo(index)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    {t('publications.video.remove')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sections Summary */}
                {(values.sections || []).length > 0 && (
                    <div className="pensa-pub-sec-summary">
                        <h4>📊 {t('publications.content.sectionsSummary')}</h4>
                        <div className="pensa-pub-sec-summary-stats">
                            <div className="pensa-pub-sec-stat">
                                <span className="pensa-pub-sec-stat-label">{t('publications.content.totalSections')}:</span>
                                <span className="pensa-pub-sec-stat-value">{(values.sections || []).length}</span>
                            </div>
                            <div className="pensa-pub-sec-stat">
                                <span className="pensa-pub-sec-stat-label">{t('publications.content.completeSections')}:</span>
                                <span className="pensa-pub-sec-stat-value">
                                    {(values.sections || []).filter(s => s.title && s.content).length}
                                </span>
                            </div>
                            <div className="pensa-pub-sec-stat">
                                <span className="pensa-pub-sec-stat-label">{t('publications.content.completionRate')}:</span>
                                <span className="pensa-pub-sec-stat-value">
                                    {(values.sections || []).length > 0 ? Math.round(((values.sections || []).filter(s => s.title && s.content).length / (values.sections || []).length) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentSection;