import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { calculatePublicationProgress, getPublicationProgressBreakdown } from '../utils/publicationProgressUtils';

const PublicationProgressBar = ({ values, activeSection, onSectionClick }) => {
    const { t } = useTranslation();

    const progress = calculatePublicationProgress(values);
    const progressBreakdown = getPublicationProgressBreakdown(values);

    // Define icons for each section
    const sectionIcons = {
        basicInfo: faInfoCircle,
        content: faEdit,
    };

    // Section order and labels - simplified to match the new structure
    const sections = [
        { key: 'basicInfo', label: t('publications.sections.basicInfo') },
        { key: 'content', label: t('publications.sections.content') },
    ];

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
