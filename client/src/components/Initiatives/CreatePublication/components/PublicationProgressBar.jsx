import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculatePublicationProgress, getPublicationProgressBreakdown } from '../utils/publicationProgressUtils';

const PublicationProgressBar = ({ values }) => {
    const { t } = useTranslation();

    const progress = calculatePublicationProgress(values);
    const progressBreakdown = getPublicationProgressBreakdown(values);

    return (
        <div className="publication-form-progress-container">
            {/* Progress Header */}
            <div className="publication-progress-header">
                <h3>{t('publications.progress.formProgress')}</h3>
                <span className="publication-progress-percentage">
                    {progress}% {t('publications.progress.completed')}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="publication-progress-bar">
                <div
                    className="publication-form-progress-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Section Navigation - simplified to match the new structure */}
            <div className="publication-progress-sections">
                <div className={`publication-progress-section ${progressBreakdown.basicInfo.progress === 100 ? 'complete' : 'incomplete'}`}>
                    📝 {t('publications.sections.basicInfo')}
                </div>
                <div className={`publication-progress-section ${progressBreakdown.content.progress === 100 ? 'complete' : 'incomplete'}`}>
                    📄 {t('publications.sections.content')}
                </div>
            </div>
        </div>
    );
};

export default PublicationProgressBar;
