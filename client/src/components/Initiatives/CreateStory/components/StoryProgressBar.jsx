import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculateStoryProgress, getStoryProgressBreakdown } from '../utils/storiesProgressUtils';

const StoryProgressBar = ({ values }) => {
    const { t } = useTranslation();

    const progress = calculateStoryProgress(values);
    const progressBreakdown = getStoryProgressBreakdown(values);

    return (
        <div className="story-form-progress-container">
            {/* Progress Header */}
            <div className="story-progress-header">
                <h3>{t('stories.progress.formProgress')}</h3>
                <span className="story-progress-percentage">
                    {progress}% {t('stories.progress.completed')}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="story-progress-bar">
                <div
                    className="story-form-progress-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Section Navigation - simplified to match the new structure */}
            <div className="story-progress-sections">
                <div className={`story-progress-section ${progressBreakdown.basicInfo.progress === 100 ? 'complete' : 'incomplete'}`}>
                    📝 {t('stories.sections.basicInfo')}
                </div>
                <div className={`story-progress-section ${progressBreakdown.content.progress === 100 ? 'complete' : 'incomplete'}`}>
                    📄 {t('stories.sections.content')}
                </div>
            </div>
        </div>
    );
};

export default StoryProgressBar;
