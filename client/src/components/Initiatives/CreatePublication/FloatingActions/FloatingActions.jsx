import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave,
    faEye,
    faShare,
    faSpinner,
    faEdit
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './floatingActions.css';

const FloatingActions = ({
    onSaveDraft,
    onPreview,
    onCreate,
    onToggleDraft,
    isSaving = false,
    isEditMode = false,
    isDraft = false
}) => {
    const { t } = useTranslation();

    // CREATE MODE
    if (!isEditMode) {
        return (
            <div className="publication-floating-actions">
                <button
                    type="button"
                    className="publication-floating-btn preview"
                    onClick={onPreview}
                    disabled={isSaving}
                    title={t('publications.common.preview')}
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>

                <button
                    type="button"
                    className="publication-floating-btn draft"
                    onClick={onSaveDraft}
                    disabled={isSaving}
                    title={t('publications.create.saveDraft')}
                >
                    <FontAwesomeIcon icon={isSaving ? faSpinner : faSave} className={isSaving ? 'fa-spin' : ''} />
                </button>

                <button
                    type="button"
                    className="publication-floating-btn publish"
                    onClick={onCreate}
                    disabled={isSaving}
                    title={t('publications.create.publishPublication')}
                >
                    <FontAwesomeIcon icon={isSaving ? faSpinner : faShare} className={isSaving ? 'fa-spin' : ''} />
                </button>
            </div>
        );
    }

    // EDIT MODE
    return (
        <div className="publication-floating-actions">
            <button
                type="button"
                className="publication-floating-btn preview"
                onClick={onPreview}
                disabled={isSaving}
                title={t('publications.common.preview')}
            >
                <FontAwesomeIcon icon={faEye} />
            </button>

            {isDraft ? (
                // EDITING A DRAFT
                <>
                    <button
                        type="button"
                        className="publication-floating-btn draft"
                        onClick={onSaveDraft}
                        disabled={isSaving}
                        title={t('publications.edit.updateDraft')}
                    >
                        <FontAwesomeIcon icon={isSaving ? faSpinner : faSave} className={isSaving ? 'fa-spin' : ''} />
                    </button>

                    <button
                        type="button"
                        className="publication-floating-btn publish"
                        onClick={onCreate}
                        disabled={isSaving}
                        title={t('publications.edit.publishDraft')}
                    >
                        <FontAwesomeIcon icon={isSaving ? faSpinner : faShare} className={isSaving ? 'fa-spin' : ''} />
                    </button>
                </>
            ) : (
                // EDITING A PUBLISHED PUBLICATION
                <>
                    <button
                        type="button"
                        className="publication-floating-btn draft"
                        onClick={onToggleDraft}
                        disabled={isSaving}
                        title={t('publications.edit.convertToDraft')}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>

                    <button
                        type="button"
                        className="publication-floating-btn publish"
                        onClick={onCreate}
                        disabled={isSaving}
                        title={t('publications.edit.updatePublished')}
                    >
                        <FontAwesomeIcon icon={isSaving ? faSpinner : faShare} className={isSaving ? 'fa-spin' : ''} />
                    </button>
                </>
            )}
        </div>
    );
};

export default FloatingActions;
