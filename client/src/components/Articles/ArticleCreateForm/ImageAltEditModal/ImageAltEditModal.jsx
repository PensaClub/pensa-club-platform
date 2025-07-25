import React, { useState, useEffect, useMemo } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faBold, faItalic, faUnderline } from '@fortawesome/free-solid-svg-icons';
import './imageAltEditModal.css';
import { useTranslation } from 'react-i18next';

// Utility functions
const createSlateEditorState = () => {
    return [
        {
            type: 'paragraph',
            children: [{ text: '' }],
        },
    ];
};

const normalizeSlateValue = (value) => {
    if (!Array.isArray(value) || value.length === 0) {
        return createSlateEditorState();
    }
    
    return value.map(node => ({
        ...node,
        children: node.children && node.children.length > 0 ? node.children : [{ text: '' }]
    }));
};

export const ImageAltEditModal = ({ isOpen, onClose, image, onSave }) => {
    const { t } = useTranslation();

    // Create Slate editors
    const altEditor = useMemo(() => withHistory(withReact(createEditor())), []);
    const captionEditor = useMemo(() => withHistory(withReact(createEditor())), []);

    const [altEditorState, setAltEditorState] = useState(createSlateEditorState());
    const [captionEditorState, setCaptionEditorState] = useState(createSlateEditorState());

    useEffect(() => {
        if (image) {
            setAltEditorState(normalizeSlateValue(image.alt || createSlateEditorState()));
            setCaptionEditorState(normalizeSlateValue(image.caption || createSlateEditorState()));
        }
    }, [image]);

    // Slate toolbar functions
    const toggleMark = (editor, format) => {
        const isActive = isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    };

    const isMarkActive = (editor, format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    };

    // Render functions
    const renderElement = (props) => {
        switch (props.element.type) {
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

    // Toolbar component
    const SlateToolbar = ({ editor }) => (
        <div className="slate-toolbar-small">
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
                className={`slate-btn-small ${isMarkActive(editor, 'bold') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faBold} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
                className={`slate-btn-small ${isMarkActive(editor, 'italic') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faItalic} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
                className={`slate-btn-small ${isMarkActive(editor, 'underline') ? 'active' : ''}`}
            >
                <FontAwesomeIcon icon={faUnderline} />
            </button>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="alt-modal-overlay">
            <div className="alt-modal-container">
                <h3 className="alt-modal-header">{t('articles.imageEdit.title')}</h3>

                <div className="alt-modal-image-preview">
                    <img src={image?.src} alt={t('articles.imageEdit.editAlt')} />
                </div>

                {/* ALT текст */}
                <div className="alt-modal-editor-wrapper">
                    <label className="alt-modal-label">{t('articles.imageEdit.altLabel')}</label>
                    <div className="slate-editor-container-small">
                        <Slate
                            editor={altEditor}
                            initialValue={altEditorState}
                            onChange={setAltEditorState}
                        >
                            <SlateToolbar editor={altEditor} />
                            <Editable
                                className="slate-editable-small"
                                placeholder="Въведете ALT текст..."
                                renderElement={renderElement}
                                renderLeaf={renderLeaf}
                            />
                        </Slate>
                    </div>
                    <p className="alt-modal-help-text">{t('articles.imageEdit.altHelpText')}</p>
                </div>

                {/* Caption (надпис) */}
                <div className="alt-modal-editor-wrapper">
                    <label className="alt-modal-label">{t('articles.imageEdit.captionLabel')}</label>
                    <div className="slate-editor-container-small">
                        <Slate
                            editor={captionEditor}
                            initialValue={captionEditorState}
                            onChange={setCaptionEditorState}
                        >
                            <SlateToolbar editor={captionEditor} />
                            <Editable
                                className="slate-editable-small"
                                placeholder="Въведете описание..."
                                renderElement={renderElement}
                                renderLeaf={renderLeaf}
                            />
                        </Slate>
                    </div>
                    <p className="alt-modal-help-text">{t('articles.imageEdit.captionHelpText')}</p>
                </div>

                <div className="alt-modal-buttons">
                    <button type="button" className="alt-modal-cancel-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} /> {t('articles.imageEdit.cancel')}
                    </button>
                    <button
                        type="button"
                        className="alt-modal-save-btn"
                        onClick={() => {
                            onSave(altEditorState, captionEditorState);
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} /> {t('articles.imageEdit.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};