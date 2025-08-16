// components/Initiatives/CreatePublication/Sections/ContentSection/ContentSection.jsx
import React, { useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faChevronUp, faChevronDown, faImage, faUpload, faTimes, faLink } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Slate, Editable } from 'slate-react';
import { createSlateEditor, createSlateEditorState } from '../../../../Initiatives/CreateIniciative/Utils/initiativeEditorUtils';
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
}) => {
    const { t } = useTranslation();
    const sectionEditorsRef = useRef({});
    // State за URL inputs
    const [showUrlInputs, setShowUrlInputs] = useState({});
    const [imageUrls, setImageUrls] = useState({});

    // Handle URL input
    const handleImageUrlChange = (sectionIndex, value) => {
        setImageUrls(prev => ({
            ...prev,
            [sectionIndex]: value
        }));
    }

    // Add image from URL
    const handleAddImageFromUrl = (sectionIndex) => {
        const url = imageUrls[sectionIndex];
        if (url && url.trim()) {
            addSectionImageFromUrl(sectionIndex, url.trim());
            setImageUrls(prev => ({ ...prev, [sectionIndex]: '' }));
            setShowUrlInputs(prev => ({ ...prev, [sectionIndex]: false }));
        }
    };

    // Create editor for each section
    const getSectionEditor = (index) => {
        if (!sectionEditorsRef.current[index]) {
            sectionEditorsRef.current[index] = createSlateEditor();
        }
        return sectionEditorsRef.current[index];
    };

    // Handle section content changes
    const handleSectionContentChange = (sectionIndex) => (value) => {
        const updatedSections = [...(values.sections || [])];
        updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            content: value
        };
        setValues(prev => ({ ...prev, sections: updatedSections }));
    };

    // Move section up/down
    const handleMoveSection = (index, direction) => {
        const newSections = [...(values.sections || [])];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newSections.length) {
            [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
            setValues(prev => ({ ...prev, sections: newSections }));

            // Swap editors too
            const tempEditor = sectionEditorsRef.current[index];
            sectionEditorsRef.current[index] = sectionEditorsRef.current[targetIndex];
            sectionEditorsRef.current[targetIndex] = tempEditor;
        }
    };

    // Slate.js toolbar functions
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

    // Render Slate toolbar
    const renderSlateToolbar = (editor) => (
        <div className="publication-sections-slate-toolbar">
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
                className={`publication-sections-slate-btn ${isMarkActive(editor, 'bold') ? 'active' : ''}`}
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
                className={`publication-sections-slate-btn ${isMarkActive(editor, 'italic') ? 'active' : ''}`}
            >
                <em>I</em>
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
                className={`publication-sections-slate-btn ${isMarkActive(editor, 'underline') ? 'active' : ''}`}
            >
                <u>U</u>
            </button>
            <div className="publication-sections-toolbar-divider"></div>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-one');
                }}
                className={`publication-sections-slate-btn ${isBlockActive(editor, 'heading-one') ? 'active' : ''}`}
            >
                H1
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-two');
                }}
                className={`publication-sections-slate-btn ${isBlockActive(editor, 'heading-two') ? 'active' : ''}`}
            >
                H2
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'bulleted-list');
                }}
                className={`publication-sections-slate-btn ${isBlockActive(editor, 'bulleted-list') ? 'active' : ''}`}
            >
                • List
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'numbered-list');
                }}
                className={`publication-sections-slate-btn ${isBlockActive(editor, 'numbered-list') ? 'active' : ''}`}
            >
                1. List
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'block-quote');
                }}
                className={`publication-sections-slate-btn ${isBlockActive(editor, 'block-quote') ? 'active' : ''}`}
            >
                " Quote
            </button>
        </div>
    );

    // Render Slate element
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

    // Render Slate leaf
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

    return (
        <div className="publication-form-section-card">
            <div className="publication-sections-section-header">
                <h2 className="publication-sections-section-title">
                    📝 {t('publications.content.sections')}
                </h2>
                <button
                    type="button"
                    className="publication-sections-form-btn accent"
                    onClick={addSection}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {t('publications.content.addSection')}
                </button>
            </div>
            <div className="publication-form-section-content">

                <div className="publication-sections-help">
                    <p>{t('publications.helpTexts.sectionsHelp')}</p>
                </div>

                {(values.sections || []).length === 0 ? (
                    <div className="publication-sections-empty-state">
                        <div className="publication-sections-empty-content">
                            <FontAwesomeIcon icon={faEdit} className="publication-sections-empty-icon" />
                            <h3>{t('publications.content.noSections')}</h3>
                            <p>{t('publications.content.sectionsDescription')}</p>
                            <button
                                type="button"
                                className="publication-sections-form-btn primary"
                                onClick={addSection}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('publications.content.addFirstSection')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="publication-sections-list">
                        {(values.sections || []).map((section, index) => (
                            <div key={index} className="publication-sections-item">
                                <div className="publication-sections-item-header">
                                    <div className="publication-sections-item-title">
                                        <h4>
                                            {t('publications.content.sectionNumber', { number: index + 1 })}
                                            {(errors[`sections[${index}].title`] || errors[`sections[${index}].content`]) && (
                                                <span className="publication-sections-error-indicator">⚠️</span>
                                            )}
                                        </h4>
                                        <div className="publication-sections-item-status">
                                            {section.title ? (
                                                <span className="publication-sections-status-complete">✅ {section.title}</span>
                                            ) : (
                                                <span className="publication-sections-status-incomplete">⚪ {t('publications.content.untitled')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="publication-sections-item-actions">
                                        {/* Move buttons */}
                                        <button
                                            type="button"
                                            className="publication-sections-move-btn"
                                            onClick={() => handleMoveSection(index, 'up')}
                                            disabled={index === 0}
                                            title={t('publications.content.moveUp')}
                                        >
                                            <FontAwesomeIcon icon={faChevronUp} />
                                        </button>
                                        <button
                                            type="button"
                                            className="publication-sections-move-btn"
                                            onClick={() => handleMoveSection(index, 'down')}
                                            disabled={index === (values.sections || []).length - 1}
                                            title={t('publications.content.moveDown')}
                                        >
                                            <FontAwesomeIcon icon={faChevronDown} />
                                        </button>

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            className="publication-sections-remove-btn"
                                            onClick={() => removeSection(index)}
                                            title={t('publications.content.removeSection')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            {t('publications.common.remove')}
                                        </button>
                                    </div>
                                </div>

                                <div className="publication-sections-item-content">
                                    {/* Section Title */}
                                    <div className="publication-sections-form-group">
                                        <label htmlFor={`section-title-${index}`}>
                                            {t('publications.content.sectionTitle')}
                                            <span className="publication-required-indicator">*</span>
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
                                            className={`publication-sections-title-input ${errors[`sections[${index}].title`] ? 'error' : ''}`}
                                            maxLength={200}
                                        />
                                        <div className="publication-sections-character-count">
                                            {section.title?.length || 0}/200
                                        </div>
                                        {errors[`sections[${index}].title`] && (
                                            <div className="publication-sections-error-message">{errors[`sections[${index}].title`]}</div>
                                        )}
                                    </div>

                                    {/* Section Content - Slate.js */}
                                    <div className="publication-sections-form-group">
                                        <label htmlFor={`section-content-${index}`}>
                                            {t('publications.content.sectionContent')}
                                            <span className="publication-required-indicator">*</span>
                                        </label>
                                        <div className="publication-sections-field-help">
                                            {t('publications.helpTexts.sectionContentHelp')}
                                        </div>
                                        <div className={`publication-sections-slate-editor-container ${errors[`sections[${index}].content`] ? 'error' : ''}`}>
                                            <Slate
                                                key={`section-${index}`}
                                                editor={getSectionEditor(index)}
                                                initialValue={section.content || createSlateEditorState()}
                                                onChange={handleSectionContentChange(index)}
                                            >
                                                {renderSlateToolbar(getSectionEditor(index))}
                                                <Editable
                                                    className="publication-sections-slate-editable"
                                                    placeholder={t('publications.content.sectionContentPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                    onKeyDown={(event) => handleKeyDown(event, getSectionEditor(index))}
                                                />
                                            </Slate>
                                        </div>
                                        {errors[`sections[${index}].content`] && (
                                            <div className="publication-sections-error-message">{errors[`sections[${index}].content`]}</div>
                                        )}
                                    </div>

                                    {/* Section Image (Single Image) */}
                                    <div className="publication-sections-form-group">
                                        <label>
                                            <FontAwesomeIcon icon={faImage} />
                                            {t('publications.media.sectionImage')}
                                        </label>
                                        <div className="publication-sections-field-help">
                                            {t('publications.helpTexts.sectionImageHelp')}
                                        </div>

                                        <div className="publication-sections-image-upload">
                                            {/* Upload methods */}
                                            <div className="publication-sections-upload-methods">
                                                <div className="publication-sections-upload-method">
                                                    <label className="publication-sections-upload-btn">
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

                                                <div className="publication-sections-upload-method">
                                                    <button
                                                        type="button"
                                                        className="publication-sections-upload-btn"
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
                                                    <div className="publication-sections-upload-method">
                                                        <button
                                                            type="button"
                                                            className="publication-sections-clear-btn"
                                                            onClick={() => clearSectionImages(index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                            {t('publications.media.clearImage')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* URL input section */}
                                            {showUrlInputs[index] && (
                                                <div className="publication-sections-url-input-section">
                                                    <input
                                                        type="url"
                                                        placeholder={t('publications.media.imageUrl')}
                                                        value={imageUrls[index] || ''}
                                                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                        className="publication-sections-url-input"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="publication-sections-url-add-btn"
                                                        onClick={() => handleAddImageFromUrl(index)}
                                                        disabled={!imageUrls[index]?.trim()}
                                                    >
                                                        <FontAwesomeIcon icon={faLink} />
                                                        {t('publications.media.addImage')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Single Image Preview with controls on the right */}
                                        {section.image && (
                                            <div className="publication-sections-image-preview">
                                                <div className="publication-sections-image-container">
                                                    <div className="publication-sections-image-item">
                                                        <div className="publication-sections-image-preview">
                                                            <img src={section.image.src} alt={section.image.alt || 'Section image'} />
                                                            <div className="publication-sections-image-overlay">
                                                                <button
                                                                    type="button"
                                                                    className="publication-sections-image-remove-btn"
                                                                    onClick={() => clearSectionImages(index)}
                                                                    title={t('publications.media.removeImage')}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </div>
                                                            {section.image.isUploading && (
                                                                <div className="publication-sections-image-uploading">
                                                                    <div className="publication-sections-uploading-spinner"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Controls on the right side */}
                                                    <div className="publication-sections-image-controls">
                                                        <div className="publication-sections-image-input-group">
                                                            <label>{t('publications.media.altText')}:</label>
                                                            <input
                                                                type="text"
                                                                placeholder={t('publications.media.imageDescription')}
                                                                value={section.image.alt || ''}
                                                                onChange={(e) => updateSectionImageAlt(index, 0, e.target.value)}
                                                                className="publication-sections-image-input"
                                                                maxLength={100}
                                                            />
                                                            <div className="publication-sections-char-count">
                                                                {section.image.alt?.length || 0}/100
                                                            </div>
                                                        </div>

                                                        <div className="publication-sections-image-input-group">
                                                            <label>{t('publications.media.caption')}:</label>
                                                            <input
                                                                type="text"
                                                                placeholder={t('publications.media.imageCaption')}
                                                                value={section.image.caption || ''}
                                                                onChange={(e) => updateSectionImageCaption(index, 0, e.target.value)}
                                                                className="publication-sections-image-input"
                                                                maxLength={150}
                                                            />
                                                            <div className="publication-sections-char-count">
                                                                {section.image.caption?.length || 0}/150
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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
                    <div className="publication-sections-summary">
                        <h4>📊 {t('publications.content.sectionsSummary')}</h4>
                        <div className="publication-sections-summary-stats">
                            <div className="publication-sections-stat">
                                <span className="publication-sections-stat-label">{t('publications.content.totalSections')}:</span>
                                <span className="publication-sections-stat-value">{(values.sections || []).length}</span>
                            </div>
                            <div className="publication-sections-stat">
                                <span className="publication-sections-stat-label">{t('publications.content.completeSections')}:</span>
                                <span className="publication-sections-stat-value">
                                    {(values.sections || []).filter(s => s.title && s.content).length}
                                </span>
                            </div>
                            <div className="publication-sections-stat">
                                <span className="publication-sections-stat-label">{t('publications.content.completionRate')}:</span>
                                <span className="publication-sections-stat-value">
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
