import { Editor } from 'react-draft-wysiwyg';
import { createEditorState } from '../../articleUtils/editor';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import './imageAltEditModal.css';

export const ImageAltEditModal = ({ isOpen, onClose, image, onSave }) => {

    const [altEditorState, setAltEditorState] = useState(createEditorState());
    const [captionEditorState, setCaptionEditorState] = useState(createEditorState());

    useEffect(() => {
        if (image) {
            setAltEditorState(image.alt || createEditorState());
            setCaptionEditorState(image.caption || createEditorState());
        }
    }, [image]);

    if (!isOpen) return null;

    return (
        <div className="alt-modal-overlay">
            <div className="alt-modal-container">
                <h3 className="alt-modal-header">Редактиране на информация за изображението</h3>

                <div className="alt-modal-image-preview">
                    <img src={image?.src} alt="Редактиране на изображение" />
                </div>

                {/* ALT текст */}
                <div className="alt-modal-editor-wrapper">
                    <label className="alt-modal-label">Алтернативен текст (ALT):</label>
                    <Editor
                        editorState={altEditorState}
                        onEditorStateChange={setAltEditorState}
                        toolbar={{
                            options: ['inline', 'link'],
                            inline: {
                                options: ['bold', 'italic', 'underline'],
                            },
                            link: {
                                inDropdown: false,
                                showOpenOptionOnHover: true,
                            },
                        }}
                        wrapperClassName="editor-wrapper-small"
                        editorClassName="editor-main-small"
                        toolbarClassName="editor-toolbar-small"
                    />
                    <p className="alt-modal-help-text">Добрият ALT текст описва съдържанието на изображението за потребители, които не могат да го видят.</p>
                </div>

                {/* Caption (надпис) */}
                <div className="alt-modal-editor-wrapper">
                    <label className="alt-modal-label">Надпис (Caption):</label>
                    <Editor
                        editorState={captionEditorState}
                        onEditorStateChange={setCaptionEditorState}
                        toolbar={{
                            options: ['inline', 'link'],
                            inline: {
                                options: ['bold', 'italic', 'underline'],
                            },
                            link: {
                                inDropdown: false,
                                showOpenOptionOnHover: true,
                            },
                        }}
                        wrapperClassName="editor-wrapper-small"
                        editorClassName="editor-main-small"
                        toolbarClassName="editor-toolbar-small"
                    />
                    <p className="alt-modal-help-text">Надписът се показва под изображението и дава допълнителен контекст за всички потребители.</p>
                </div>

                <div className="alt-modal-buttons">
                    <button type="button" className="alt-modal-cancel-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} /> Отказ
                    </button>
                    <button
                        type="button"
                        className="alt-modal-save-btn"
                        onClick={() => {
                            onSave(altEditorState, captionEditorState);
                            onClose();
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} /> Запази
                    </button>
                </div>
            </div>
        </div>
    );
};