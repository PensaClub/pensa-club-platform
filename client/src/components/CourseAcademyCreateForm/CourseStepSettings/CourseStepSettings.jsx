// src/components/CourseAcademyCreateForm/CourseStepSettings/CourseStepSettings.jsx

import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import './courseStepSettings.css';

const COURSE_TYPE_OPTIONS = ['online', 'offline', 'hybrid'];
const VIDEO_PROVIDER_OPTIONS = ['youtube', 'vimeo', 'custom', 'none'];

const CourseStepSettings = ({ courseData, updateField, errors = {} }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      updateField(name, checked);
    } else if (type === 'number') {
      updateField(name, value === '' ? '' : Number(value));
    } else {
      updateField(name, value);
    }
  };

  return (
    <div className="csst-wrapper">

      {/* === Section: Type & Format === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.typeFormat')}</h3>

        <div className="csst-row">
          <div className={`csst-field ${errors.courseType ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-course-type">
              {t('courseStepSettings.courseType')}
            </label>
            <select
              id="csst-course-type"
              name="courseType"
              className="csst-select"
              value={courseData.courseType}
              onChange={handleChange}
            >
              {COURSE_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {t(`courseStepSettings.courseTypes.${type}`)}
                </option>
              ))}
            </select>
            {errors.courseType && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.courseType}</span>
            )}
          </div>

          <div className={`csst-field ${errors.videoProvider ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-video-provider">
              {t('courseStepSettings.videoProvider')}
            </label>
            <select
              id="csst-video-provider"
              name="videoProvider"
              className="csst-select"
              value={courseData.videoProvider}
              onChange={handleChange}
            >
              {VIDEO_PROVIDER_OPTIONS.map((provider) => (
                <option key={provider} value={provider}>
                  {t(`courseStepSettings.videoProviders.${provider}`)}
                </option>
              ))}
            </select>
            {errors.videoProvider && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.videoProvider}</span>
            )}
          </div>
        </div>
      </div>

      {/* === Section: Duration & Dates === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.durationDates')}</h3>

        <div className="csst-row">
          <div className={`csst-field ${errors.durationWeeks ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-duration">
              {t('courseStepSettings.durationWeeks')}
            </label>
            <input
              id="csst-duration"
              type="number"
              name="durationWeeks"
              className="csst-input"
              placeholder="0"
              value={courseData.durationWeeks}
              onChange={handleChange}
              min={1}
            />
            {errors.durationWeeks && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.durationWeeks}</span>
            )}
          </div>

          <div className={`csst-field ${errors.estimatedHours ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-hours">
              {t('courseStepSettings.estimatedHours')}
            </label>
            <input
              id="csst-hours"
              type="number"
              name="estimatedHours"
              className="csst-input"
              placeholder="0"
              value={courseData.estimatedHours}
              onChange={handleChange}
              min={1}
            />
            {errors.estimatedHours && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.estimatedHours}</span>
            )}
          </div>
        </div>

        <div className="csst-row">
          <div className={`csst-field ${errors.startDate ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-start-date">
              {t('courseStepSettings.startDate')}
            </label>
            <input
              id="csst-start-date"
              type="date"
              name="startDate"
              className="csst-input"
              value={courseData.startDate}
              onChange={handleChange}
            />
            {errors.startDate && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.startDate}</span>
            )}
          </div>

          <div className={`csst-field ${errors.endDate ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-end-date">
              {t('courseStepSettings.endDate')}
            </label>
            <input
              id="csst-end-date"
              type="date"
              name="endDate"
              className="csst-input"
              value={courseData.endDate}
              onChange={handleChange}
            />
            {errors.endDate && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.endDate}</span>
            )}
          </div>
        </div>
      </div>

      {/* === Section: Enrollment === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.enrollment')}</h3>

        <div className="csst-row">
          <div className={`csst-field ${errors.maxParticipants ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-max-participants">
              {t('courseStepSettings.maxParticipants')}
            </label>
            <input
              id="csst-max-participants"
              type="number"
              name="maxParticipants"
              className="csst-input"
              placeholder={t('courseStepSettings.unlimited')}
              value={courseData.maxParticipants}
              onChange={handleChange}
              min={1}
            />
            {errors.maxParticipants && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.maxParticipants}</span>
            )}
          </div>

          <div className={`csst-field ${errors.targetAudience ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-target-audience">
              {t('courseStepSettings.targetAudience')}
            </label>
            <input
              id="csst-target-audience"
              type="text"
              name="targetAudience"
              className="csst-input"
              placeholder={t('courseStepSettings.targetAudiencePlaceholder')}
              value={courseData.targetAudience}
              onChange={handleChange}
            />
            {errors.targetAudience && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.targetAudience}</span>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="csst-toggles">
          <label className="csst-toggle">
            <input type="checkbox" name="isPublic" checked={courseData.isPublic} onChange={handleChange} />
            <span className="csst-toggle-slider" />
            <span className="csst-toggle-text">{t('courseStepSettings.isPublic')}</span>
          </label>

          <label className="csst-toggle">
            <input type="checkbox" name="requiresApproval" checked={courseData.requiresApproval} onChange={handleChange} />
            <span className="csst-toggle-slider" />
            <span className="csst-toggle-text">{t('courseStepSettings.requiresApproval')}</span>
          </label>
        </div>
      </div>

      {/* === Section: Credits & Certificate === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.credits')}</h3>

        <div className="csst-row">
          <div className={`csst-field ${errors.maxCredits ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-max-credits">
              {t('courseStepSettings.maxCredits')}
            </label>
            <input
              id="csst-max-credits"
              type="number"
              name="maxCredits"
              className="csst-input"
              value={courseData.maxCredits}
              onChange={handleChange}
              min={0}
            />
            {errors.maxCredits && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.maxCredits}</span>
            )}
          </div>

          <div className={`csst-field ${errors.creditsForCompletion ? 'csst-field-error' : ''}`}>
            <label className="csst-label" htmlFor="csst-credits-completion">
              {t('courseStepSettings.creditsForCompletion')}
            </label>
            <input
              id="csst-credits-completion"
              type="number"
              name="creditsForCompletion"
              className="csst-input"
              value={courseData.creditsForCompletion}
              onChange={handleChange}
              min={0}
            />
            {errors.creditsForCompletion && (
              <span className="csst-error-msg"><AlertCircle size={14} />{errors.creditsForCompletion}</span>
            )}
          </div>
        </div>

        <div className="csst-toggles">
          <label className="csst-toggle">
            <input type="checkbox" name="hasCertificate" checked={courseData.hasCertificate} onChange={handleChange} />
            <span className="csst-toggle-slider" />
            <span className="csst-toggle-text">{t('courseStepSettings.hasCertificate')}</span>
          </label>
        </div>
      </div>

      {/* === Section: Tags === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.tags')}</h3>
        <div className={`csst-field ${errors.tags ? 'csst-field-error' : ''}`}>
          <label className="csst-label" htmlFor="csst-tags">
            {t('courseStepSettings.tags')}
          </label>
          <input
            id="csst-tags"
            type="text"
            name="tags"
            className="csst-input"
            placeholder={t('courseStepSettings.tagsPlaceholder')}
            value={courseData.tags}
            onChange={handleChange}
          />
          {errors.tags && (
            <span className="csst-error-msg"><AlertCircle size={14} />{errors.tags}</span>
          )}
          <span className="csst-hint">{t('courseStepSettings.tagsHint')}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseStepSettings;