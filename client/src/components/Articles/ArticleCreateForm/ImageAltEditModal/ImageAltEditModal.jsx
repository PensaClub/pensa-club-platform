import { Editor } from 'react-draft-wysiwyg';
import { createEditorState } from '../../articleUtils/editor';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import './imageAltEditModal.css';
import {useTranslation} from 'react-i18next';

export const ImageAltEditModal = ({ isOpen, onClose, image, onSave }) => {
    const { t } = useTranslation();

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
                <h3 className="alt-modal-header">{t('articles.imageEdit.title')}</h3>

                <div className="alt-modal-image-preview">
                    <img src={image?.src} alt={t('articles.imageEdit.editAlt')} />
                </div>

                {/* ALT текст */}
                <div className="alt-modal-editor-wrapper">
                    <label className="alt-modal-label">{t('articles.imageEdit.altLabel')}</label>
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
                    <p className="alt-modal-help-text">{t('articles.imageEdit.altHelpText')}</p>
                </div>

                {/* Caption (надпис) */}
                <div className="alt-modal-editor-wrapper">
                    <label className="alt-modal-label">{t('articles.imageEdit.captionLabel')}</label>
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
                            onClose();
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} /> {t('articles.imageEdit.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
