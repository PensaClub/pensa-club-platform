import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faEye, faSave } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const PublishingSection = ({
    values,
    errors,
    onSubmit,
    isEditMode = false
}) => {
    const { t } = useTranslation();

    return (
        <div className="publication-form-section-card">
            <div className="publication-form-section-header">
                <h2 className="publication-form-section-title">
                    <FontAwesomeIcon icon={faGlobe} />
                    {t('publications.sections.publishing')}
                </h2>
            </div>
            <div className="publication-form-section-content">
                <div className="publishing-options">
                    <div className="publishing-option">
                        <h3>
                            <FontAwesomeIcon icon={faSave} />
                            {t('publications.saveAsDraft')}
                        </h3>
                        <p>{t('publications.saveAsDraftDescription')}</p>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => onSubmit({ ...values, isDraft: true })}
                        >
                            {t('publications.saveDraft')}
                        </button>
                    </div>

                    <div className="publishing-option">
                        <h3>
                            <FontAwesomeIcon icon={faEye} />
                            {t('publications.publishNow')}
                        </h3>
                        <p>{t('publications.publishNowDescription')}</p>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => onSubmit({ ...values, isDraft: false })}
                        >
                            {isEditMode ? t('publications.updatePublication') : t('publications.publish')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishingSection;
