import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave,
    faEye,
    faShare
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './floatingActions.css';

const FloatingActions = ({
    draftId,
    editId,
    hasTitle,
    onSaveDraft,
    onPreview,
    onPublish,
    onUpdate,
    onCreate
}) => {
    const { t } = useTranslation();

    // Determine the main action button based on state
    const getMainActionButton = () => {
        if (draftId && !editId) {
            // DRAFT MODE - can publish draft
            return (
                <button
                    type="button"
                    className="publication-floating-btn publish"
                    onClick={onPublish}
                    title={t('publications.create.publishPublication')}
                >
                    <FontAwesomeIcon icon={faShare} />
                </button>
            );
        } else if (editId) {
            // EDIT MODE - update existing publication
            return (
                <button
                    type="button"
                    className="publication-floating-btn publish"
                    onClick={onUpdate}
                    title={t('publications.create.updatePublication')}
                >
                    <FontAwesomeIcon icon={faShare} />
                </button>
            );
        } else {
            // NEW PUBLICATION MODE - create new publication
            return (
                <button
                    type="button"
                    className="publication-floating-btn publish"
                    onClick={onCreate}
                    title={t('publications.create.createPublication')}
                >
                    <FontAwesomeIcon icon={faShare} />
                </button>
            );
        }
    };

    return (
        <div className="publication-floating-actions">
            {/* Save as Draft button - only show when NOT in edit mode */}
            {!editId && (
                <button
                    type="button"
                    className="publication-floating-btn draft"
                    onClick={onSaveDraft}
                    title={draftId ? t('publications.create.updateDraft') : t('publications.create.saveDraft')}
                >
                    <FontAwesomeIcon icon={faSave} />
                </button>
            )}

            {/* Preview button */}
            <button
                type="button"
                className="publication-floating-btn preview"
                onClick={onPreview}
                title={t('publications.create.preview')}
            >
                <FontAwesomeIcon icon={faEye} />
            </button>

            {/* Main action button (Save & Publish / Update / Create) */}
            {getMainActionButton()}
        </div>
    );
};

export default FloatingActions;
