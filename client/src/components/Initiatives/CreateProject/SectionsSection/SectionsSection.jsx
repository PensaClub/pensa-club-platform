// components/Projects/ProjectCreateForm/SectionsSection/SectionsSection.jsx
import React, { useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faChevronUp, faChevronDown, faImage, faUpload, faTimes, faLink } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Slate, Editable } from 'slate-react';
import { createSlateEditor, createSlateEditorState } from '../../../Initiatives/CreateIniciative/Utils/initiativeEditorUtils.jsx';
import './sectionsSection.css';
const SectionsSection = ({
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
 // 🆕 State за URL inputs
    const [showUrlInputs, setShowUrlInputs] = useState({});
    const [imageUrls, setImageUrls] = useState({});

    // 🆕 Handle URL input
    const handleImageUrlChange = (sectionIndex, value) => {
        setImageUrls(prev => ({
            ...prev,
            [sectionIndex]: value
        }));
    }

    // 🆕 Add image from URL
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
        const updatedSections = [...values.sections];
        updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            content: value
        };
        setValues(prev => ({ ...prev, sections: updatedSections }));
    };

    // Move section up/down
    const handleMoveSection = (index, direction) => {
        const newSections = [...values.sections];
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
        <div className="project-sections-slate-toolbar">
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
                className={`project-sections-slate-btn ${isMarkActive(editor, 'bold') ? 'active' : ''}`}
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
                className={`project-sections-slate-btn ${isMarkActive(editor, 'italic') ? 'active' : ''}`}
            >
                <em>I</em>
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
                className={`project-sections-slate-btn ${isMarkActive(editor, 'underline') ? 'active' : ''}`}
            >
                <u>U</u>
            </button>
            <div className="project-sections-toolbar-divider"></div>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-one');
                }}
                className={`project-sections-slate-btn ${isBlockActive(editor, 'heading-one') ? 'active' : ''}`}
            >
                H1
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'heading-two');
                }}
                className={`project-sections-slate-btn ${isBlockActive(editor, 'heading-two') ? 'active' : ''}`}
            >
                H2
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'bulleted-list');
                }}
                className={`project-sections-slate-btn ${isBlockActive(editor, 'bulleted-list') ? 'active' : ''}`}
            >
                • List
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'numbered-list');
                }}
                className={`project-sections-slate-btn ${isBlockActive(editor, 'numbered-list') ? 'active' : ''}`}
            >
                1. List
            </button>
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock(editor, 'block-quote');
                }}
                className={`project-sections-slate-btn ${isBlockActive(editor, 'block-quote') ? 'active' : ''}`}
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
        <div className="project-form-section-card">
            <div className="project-sections-section-header">
                <h2 className="project-sections-section-title">
                    📝 {t('projects.create.sections')}
                </h2>
                <button
                    type="button"
                    className="project-sections-form-btn accent"
                    onClick={addSection}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {t('projects.create.addSection')}
                </button>
            </div>
            <div className="project-form-section-content">

                <div className="project-sections-help">
                    <p>{t('projects.create.sections-help')}</p>
                </div>

                {values.sections?.length === 0 ? (
                    <div className="project-sections-empty-state">
                        <div className="project-sections-empty-content">
                            <FontAwesomeIcon icon={faEdit} className="project-sections-empty-icon" />
                            <h3>{t('projects.create.noSections')}</h3>
                            <p>{t('projects.create.sectionsDescription')}</p>
                            <button
                                type="button"
                                className="project-sections-form-btn primary"
                                onClick={addSection}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('projects.create.addFirstSection')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="project-sections-list">
                        {values.sections.map((section, index) => (
                            <div key={index} className="project-sections-item">
                                <div className="project-sections-item-header">
                                    <div className="project-sections-item-title">
                                        <h4>
                                            {t('projects.create.sectionNumber', { number: index + 1 })}
                                            {(errors[`sections[${index}].title`] || errors[`sections[${index}].content`]) && (
                                                <span className="project-sections-error-indicator">⚠️</span>
                                            )}
                                        </h4>
                                        <div className="project-sections-item-status">
                                            {section.title ? (
                                                <span className="project-sections-status-complete">✅ {section.title}</span>
                                            ) : (
                                                <span className="project-sections-status-incomplete">⚪ {t('projects.create.untitled')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="project-sections-item-actions">
                                        {/* Move buttons */}
                                        <button
                                            type="button"
                                            className="project-sections-move-btn"
                                            onClick={() => handleMoveSection(index, 'up')}
                                            disabled={index === 0}
                                            title={t('projects.create.moveUp')}
                                        >
                                            <FontAwesomeIcon icon={faChevronUp} />
                                        </button>
                                        <button
                                            type="button"
                                            className="project-sections-move-btn"
                                            onClick={() => handleMoveSection(index, 'down')}
                                            disabled={index === values.sections.length - 1}
                                            title={t('projects.create.moveDown')}
                                        >
                                            <FontAwesomeIcon icon={faChevronDown} />
                                        </button>

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            className="project-sections-remove-btn"
                                            onClick={() => removeSection(index)}
                                            title={t('projects.create.removeSection')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            {t('projects.create.remove')}
                                        </button>
                                    </div>
                                </div>

                                <div className="project-sections-item-content">
                                    {/* Section Title */}
                                    <div className="project-sections-form-group">
                                        <label htmlFor={`section-title-${index}`}>
                                            {t('projects.create.sectionTitle')}
                                            <span className="project-required-indicator">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id={`section-title-${index}`}
                                            value={section.title || ''}
                                            onChange={(e) => {
                                                const updatedSections = [...values.sections];
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
                                            placeholder={t('projects.create.sectionTitlePlaceholder')}
                                            className={`project-sections-title-input ${errors[`sections[${index}].title`] ? 'error' : ''}`}
                                            maxLength={200}
                                        />
                                        <div className="project-sections-character-count">
                                            {section.title?.length || 0}/200
                                        </div>
                                        {errors[`sections[${index}].title`] && (
                                            <div className="project-sections-error-message">{errors[`sections[${index}].title`]}</div>
                                        )}
                                    </div>

                                    {/* Section Content - Slate.js */}
                                    <div className="project-sections-form-group">
                                        <label htmlFor={`section-content-${index}`}>
                                            {t('projects.create.sectionContent')}
                                            <span className="project-required-indicator">*</span>
                                        </label>
                                        <div className="project-sections-field-help">
                                            {t('projects.create.section-content-help')}
                                        </div>
                                        <div className={`project-sections-slate-editor-container ${errors[`sections[${index}].content`] ? 'error' : ''}`}>
                                            <Slate
                                                key={`section-${index}`}
                                                editor={getSectionEditor(index)}
                                                initialValue={section.content || createSlateEditorState()}
                                                onChange={handleSectionContentChange(index)}
                                            >
                                                {renderSlateToolbar(getSectionEditor(index))}
                                                <Editable
                                                    className="project-sections-slate-editable"
                                                    placeholder={t('projects.create.sectionContentPlaceholder')}
                                                    renderElement={renderElement}
                                                    renderLeaf={renderLeaf}
                                                />
                                            </Slate>
                                        </div>
                                        {errors[`sections[${index}].content`] && (
                                            <div className="project-sections-error-message">{errors[`sections[${index}].content`]}</div>
                                        )}
                                    </div>
                                     <div className="project-sections-form-group">
                                        <label>
                                            <FontAwesomeIcon icon={faImage} />
                                            {t('projects.create.sectionImages')}
                                        </label>
                                        <div className="project-sections-field-help">
                                            {t('projects.create.section-images-help')}
                                        </div>

                                        <div className="project-sections-images-upload">
                                            {/* Upload methods */}
                                            <div className="project-sections-upload-methods">
                                                <div className="project-sections-upload-method">
                                                    <label className="project-sections-upload-btn">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                        {section.images?.length > 0 ? 'Добави още снимки' : 'Качи снимки'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={(e) => handleSectionImageUpload(e, index)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>

                                                <div className="project-sections-upload-method">
                                                    <button
                                                        type="button"
                                                        className="project-sections-upload-btn"
                                                        onClick={() => setShowUrlInputs(prev => ({
                                                            ...prev,
                                                            [index]: !prev[index]
                                                        }))}
                                                    >
                                                        <FontAwesomeIcon icon={faLink} />
                                                        Добави URL
                                                    </button>
                                                </div>

                                                {section.images?.length > 0 && (
                                                    <div className="project-sections-upload-method">
                                                        <button
                                                            type="button"
                                                            className="project-sections-clear-btn"
                                                            onClick={() => clearSectionImages(index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                            Изчисти всички
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* URL input */}
                                            {showUrlInputs[index] && (
                                                <div className="project-sections-url-input-section">
                                                    <input
                                                        type="url"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={imageUrls[index] || ''}
                                                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                        className="project-sections-url-input"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="project-sections-url-add-btn"
                                                        onClick={() => handleAddImageFromUrl(index)}
                                                    >
                                                        Добави
                                                    </button>
                                                </div>
                                            )}

                                            {/* Images preview */}
                                            {section.images && section.images.length > 0 && (
                                                <div className="project-sections-images-preview">
                                                    <h5>🖼️ Снимки към секцията ({section.images.length})</h5>
                                                    <div className="project-sections-images-grid">
                                                        {section.images.map((img, imgIndex) => (
                                                            <div key={`section-${index}-img-${imgIndex}`} className="project-sections-image-item">
                                                                <div className="project-sections-image-preview">
                                                                    <img src={img.src} alt={img.alt || `Section image ${imgIndex + 1}`} />
                                                                    <div className="project-sections-image-overlay">
                                                                        <button
                                                                            type="button"
                                                                            className="project-sections-image-remove-btn"
                                                                            onClick={() => removeSectionImage(index, imgIndex)}
                                                                            title="Премахни снимка"
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </div>
                                                                    {img.isUploading && (
                                                                        <div className="project-sections-image-uploading">
                                                                            <div className="project-sections-uploading-spinner"></div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="project-sections-image-controls">
                                                                    <div className="project-sections-image-input-group">
                                                                        <label>Alt текст:</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Описание на снимката..."
                                                                            value={img.alt || ''}
                                                                            onChange={(e) => updateSectionImageAlt(index, imgIndex, e.target.value)}
                                                                            className="project-sections-image-input"
                                                                            maxLength={100}
                                                                        />
                                                                        <div className="project-sections-char-count">
                                                                            {img.alt?.length || 0}/100
                                                                        </div>
                                                                    </div>

                                                                    <div className="project-sections-image-input-group">
                                                                        <label>Заглавие:</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Заглавие на снимката..."
                                                                            value={img.caption || ''}
                                                                            onChange={(e) => updateSectionImageCaption(index, imgIndex, e.target.value)}
                                                                            className="project-sections-image-input"
                                                                            maxLength={150}
                                                                        />
                                                                        <div className="project-sections-char-count">
                                                                            {img.caption?.length || 0}/150
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sections Summary */}
                {values.sections?.length > 0 && (
                    <div className="project-sections-summary">
                        <h4>📊 {t('projects.create.sectionsSummary')}</h4>
                        <div className="project-sections-summary-stats">
                            <div className="project-sections-stat">
                                <span className="project-sections-stat-label">{t('projects.create.totalSections')}:</span>
                                <span className="project-sections-stat-value">{values.sections.length}</span>
                            </div>
                            <div className="project-sections-stat">
                                <span className="project-sections-stat-label">{t('projects.create.completeSections')}:</span>
                                <span className="project-sections-stat-value">
                                    {values.sections.filter(s => s.title && s.content).length}
                                </span>
                            </div>
                            <div className="project-sections-stat">
                                <span className="project-sections-stat-label">{t('projects.create.completionRate')}:</span>
                                <span className="project-sections-stat-value">
                                    {Math.round((values.sections.filter(s => s.title && s.content).length / values.sections.length) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SectionsSection;
