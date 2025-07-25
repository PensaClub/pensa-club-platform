import React, { useState, useEffect, useMemo } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faBold, faItalic, faUnderline } from '@fortawesome/free-solid-svg-icons';
import './imageAltEditModal.css';
import { useTranslation } from 'react-i18next';

// ✅ htmlToSlate функция
const htmlToSlate = (html) => {
    if (!html || typeof html !== 'string') {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    if (!html.includes('<') || !html.includes('>')) {
        return html.trim() ? [{ type: 'paragraph', children: [{ text: html }] }] : [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const parseNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return { text: node.textContent };
            }
            
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return null;
            }

            const children = Array.from(node.childNodes)
                .map(parseNode)
                .filter(Boolean);
            
            if (children.length === 0) {
                children.push({ text: '' });
            }

            switch (node.tagName.toLowerCase()) {
                case 'p':
                    return { type: 'paragraph', children };
                case 'strong':
                case 'b':
                    return children.map(child => ({ ...child, bold: true }));
                case 'em':
                case 'i':
                    return children.map(child => ({ ...child, italic: true }));
                case 'u':
                    return children.map(child => ({ ...child, underline: true }));
                default:
                    return { type: 'paragraph', children };
            }
        };

        const result = Array.from(doc.body.childNodes)
            .map(parseNode)
            .filter(Boolean);

        return result.length > 0 ? result : [{ type: 'paragraph', children: [{ text: '' }] }];
        
    } catch (error) {
        console.error('HTML parsing error:', error);
        const textContent = html.replace(/<[^>]*>/g, '');
        return textContent.trim() ? [{ type: 'paragraph', children: [{ text: textContent }] }] : [{ type: 'paragraph', children: [{ text: '' }] }];
    }
};

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

// ✅ processEditorValue функция
const processEditorValue = (value) => {
    if (!value) return createSlateEditorState();
    
    if (Array.isArray(value)) {
        return normalizeSlateValue(value);
    }
    
    if (typeof value === 'string') {
        console.log('🔧 Modal конвертирам HTML в Slate:', value);
        const converted = htmlToSlate(value);
        console.log('✅ Modal резултат:', converted);
        return converted;
    }
    
    return createSlateEditorState();
};

export const ImageAltEditModal = ({ isOpen, onClose, image, onSave }) => {
    const { t } = useTranslation();

    // Create Slate editors
    const altEditor = useMemo(() => withHistory(withReact(createEditor())), []);
    const captionEditor = useMemo(() => withHistory(withReact(createEditor())), []);

    const [altEditorState, setAltEditorState] = useState(createSlateEditorState());
    const [captionEditorState, setCaptionEditorState] = useState(createSlateEditorState());

    useEffect(() => {
        console.log('🚨 Modal useEffect triggered');
        console.log('🚨 image parameter:', image);
        
        if (image) {
            console.log('🔍 Modal image.alt type:', typeof image.alt);
            console.log('🔍 Modal image.alt value:', image.alt);
            
            // ✅ ФИКСИРАНО: Директно използваме данните ако са вече Slate формат
            let processedAlt, processedCaption;
            
            if (Array.isArray(image.alt)) {
                processedAlt = normalizeSlateValue(image.alt);
                console.log('✅ Alt е вече Slate формат');
            } else {
                processedAlt = processEditorValue(image.alt);
                console.log('✅ Alt конвертиран от HTML/string');
            }
            
            if (Array.isArray(image.caption)) {
                processedCaption = normalizeSlateValue(image.caption);
                console.log('✅ Caption е вече Slate формат');
            } else {
                processedCaption = processEditorValue(image.caption);
                console.log('✅ Caption конвертиран от HTML/string');
            }
            
            console.log('🎯 Final processed alt:', processedAlt);
            console.log('🎯 Final processed caption:', processedCaption);
            
            setAltEditorState(processedAlt);
            setCaptionEditorState(processedCaption);
        }
    }, [image, isOpen]);

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
                            key={`alt-${image?.src}-${Date.now()}`}
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
                            key={`caption-${image?.src}-${Date.now()}`}
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