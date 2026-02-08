// src/components/CourseAcademyCreateForm/CourseStepSettings/CourseStepSettings.jsx

import { useTranslation } from 'react-i18next';
import './courseStepSettings.css';

const COURSE_TYPE_OPTIONS = ['online', 'offline', 'hybrid'];
const VIDEO_PROVIDER_OPTIONS = ['youtube', 'vimeo', 'custom', 'none'];

const CourseStepSettings = ({ courseData, updateField, errors }) => {
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
          <div className="csst-field">
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
          </div>

          <div className="csst-field">
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
          </div>
        </div>
      </div>

      {/* === Section: Duration & Dates === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.durationDates')}</h3>

        <div className="csst-row">
          <div className="csst-field">
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
          </div>

          <div className="csst-field">
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
          </div>
        </div>

        <div className="csst-row">
          <div className="csst-field">
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
          </div>

          <div className="csst-field">
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
          </div>
        </div>
      </div>

      {/* === Section: Enrollment === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.enrollment')}</h3>

        <div className="csst-row">
          <div className="csst-field">
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
          </div>

          <div className="csst-field">
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
          </div>
        </div>

        {/* Toggles */}
        <div className="csst-toggles">
          <label className="csst-toggle">
            <input
              type="checkbox"
              name="isPublic"
              checked={courseData.isPublic}
              onChange={handleChange}
            />
            <span className="csst-toggle-slider" />
            <span className="csst-toggle-text">{t('courseStepSettings.isPublic')}</span>
          </label>

          <label className="csst-toggle">
            <input
              type="checkbox"
              name="requiresApproval"
              checked={courseData.requiresApproval}
              onChange={handleChange}
            />
            <span className="csst-toggle-slider" />
            <span className="csst-toggle-text">{t('courseStepSettings.requiresApproval')}</span>
          </label>
        </div>
      </div>

      {/* === Section: Credits & Certificate === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.credits')}</h3>

        <div className="csst-row">
          <div className="csst-field">
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
          </div>

          <div className="csst-field">
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
          </div>
        </div>

        <div className="csst-toggles">
          <label className="csst-toggle">
            <input
              type="checkbox"
              name="hasCertificate"
              checked={courseData.hasCertificate}
              onChange={handleChange}
            />
            <span className="csst-toggle-slider" />
            <span className="csst-toggle-text">{t('courseStepSettings.hasCertificate')}</span>
          </label>
        </div>
      </div>

      {/* === Section: Tags === */}
      <div className="csst-section">
        <h3 className="csst-section-title">{t('courseStepSettings.sections.tags')}</h3>
        <div className="csst-field">
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
          <span className="csst-hint">{t('courseStepSettings.tagsHint')}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseStepSettings;