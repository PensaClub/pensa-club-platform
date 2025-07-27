import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEdit, faFileAlt, faCog } from '@fortawesome/free-solid-svg-icons';
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
        file: faFileAlt,
        settings: faCog,
    };

    // Section order and labels
    const sections = [
        { key: 'basicInfo', label: t('publications.sections.basicInfo') },
        { key: 'content', label: t('publications.sections.content') },
        { key: 'file', label: t('publications.sections.file') },
        { key: 'settings', label: t('publications.sections.settings') },
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

            {/* Section Navigation - using different icons for each section */}
            <div className="publication-progress-sections">
                <div className={`publication-progress-section ${progressBreakdown.basicInfo.progress === 100 ? 'complete' : 'incomplete'}`}>
                    📝 {t('publications.sections.basicInfo')}
                </div>
                <div className={`publication-progress-section ${progressBreakdown.content.progress === 100 ? 'complete' : 'incomplete'}`}>
                    📄 {t('publications.sections.content')}
                </div>
                <div className={`publication-progress-section ${progressBreakdown.file.progress === 100 ? 'complete' : 'incomplete'}`}>
                    📎 {t('publications.sections.file')}
                </div>
                <div className={`publication-progress-section ${progressBreakdown.settings.progress === 100 ? 'complete' : 'incomplete'}`}>
                    ⚙️ {t('publications.sections.settings')}
                </div>
            </div>
        </div>
    );
};

export default PublicationProgressBar;
