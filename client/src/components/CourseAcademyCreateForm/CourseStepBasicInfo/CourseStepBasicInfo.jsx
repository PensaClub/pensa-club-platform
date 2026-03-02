// src/components/CourseAcademyCreateForm/CourseStepBasicInfo/CourseStepBasicInfo.jsx

import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import './courseStepBasicInfo.css';

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];

const CourseStepBasicInfo = ({ courseData, updateField, errors = {} }) => {
  const { t } = useTranslation('academy-admin');

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  return (
    <div className="csbi-wrapper">

      {/* Name */}
      <div className={`csbi-field ${errors.name ? 'csbi-field-error' : ''}`}>
        <label className="csbi-label" htmlFor="csbi-name">
          {t('courseStepBasicInfo.name')} <span className="csbi-required">*</span>
        </label>
        <input
          id="csbi-name"
          type="text"
          name="name"
          className="csbi-input"
          placeholder={t('courseStepBasicInfo.namePlaceholder')}
          value={courseData.name}
          onChange={handleChange}
          maxLength={200}
        />
        {errors.name && (
          <span className="csbi-error-msg"><AlertCircle size={14} />{errors.name}</span>
        )}
        <span className="csbi-char-count">{courseData.name.length}/200</span>
      </div>

      {/* Short Description */}
      <div className={`csbi-field ${errors.shortDescription ? 'csbi-field-error' : ''}`}>
        <label className="csbi-label" htmlFor="csbi-short-desc">
          {t('courseStepBasicInfo.shortDescription')}
        </label>
        <textarea
          id="csbi-short-desc"
          name="shortDescription"
          className="csbi-textarea csbi-textarea-sm"
          placeholder={t('courseStepBasicInfo.shortDescriptionPlaceholder')}
          value={courseData.shortDescription}
          onChange={handleChange}
          maxLength={500}
          rows={3}
        />
        {errors.shortDescription && (
          <span className="csbi-error-msg"><AlertCircle size={14} />{errors.shortDescription}</span>
        )}
        <span className="csbi-char-count">{courseData.shortDescription.length}/500</span>
      </div>

      {/* Description */}
      <div className={`csbi-field ${errors.description ? 'csbi-field-error' : ''}`}>
        <label className="csbi-label" htmlFor="csbi-desc">
          {t('courseStepBasicInfo.description')}
        </label>
        <textarea
          id="csbi-desc"
          name="description"
          className="csbi-textarea"
          placeholder={t('courseStepBasicInfo.descriptionPlaceholder')}
          value={courseData.description}
          onChange={handleChange}
          rows={6}
        />
        {errors.description && (
          <span className="csbi-error-msg"><AlertCircle size={14} />{errors.description}</span>
        )}
      </div>

      {/* Category + Difficulty row */}
      <div className="csbi-row">
        <div className={`csbi-field ${errors.category ? 'csbi-field-error' : ''}`}>
          <label className="csbi-label" htmlFor="csbi-category">
            {t('courseStepBasicInfo.category')}
          </label>
          <input
            id="csbi-category"
            type="text"
            name="category"
            className="csbi-input"
            placeholder={t('courseStepBasicInfo.categoryPlaceholder')}
            value={courseData.category}
            onChange={handleChange}
            maxLength={100}
          />
          {errors.category && (
            <span className="csbi-error-msg"><AlertCircle size={14} />{errors.category}</span>
          )}
        </div>

        <div className={`csbi-field ${errors.difficultyLevel ? 'csbi-field-error' : ''}`}>
          <label className="csbi-label" htmlFor="csbi-difficulty">
            {t('courseStepBasicInfo.difficulty')}
          </label>
          <select
            id="csbi-difficulty"
            name="difficultyLevel"
            className="csbi-select"
            value={courseData.difficultyLevel}
            onChange={handleChange}
          >
            {DIFFICULTY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {t(`courseStepBasicInfo.difficultyLevels.${level}`)}
              </option>
            ))}
          </select>
          {errors.difficultyLevel && (
            <span className="csbi-error-msg"><AlertCircle size={14} />{errors.difficultyLevel}</span>
          )}
        </div>
      </div>

      {/* Thumbnail + Trailer row */}
      <div className="csbi-row">
        <div className={`csbi-field ${errors.thumbnailUrl ? 'csbi-field-error' : ''}`}>
          <label className="csbi-label" htmlFor="csbi-thumbnail">
            {t('courseStepBasicInfo.thumbnailUrl')}
          </label>
          <input
            id="csbi-thumbnail"
            type="url"
            name="thumbnailUrl"
            className="csbi-input"
            placeholder="https://..."
            value={courseData.thumbnailUrl}
            onChange={handleChange}
          />
          {errors.thumbnailUrl && (
            <span className="csbi-error-msg"><AlertCircle size={14} />{errors.thumbnailUrl}</span>
          )}
        </div>

        <div className={`csbi-field ${errors.trailerUrl ? 'csbi-field-error' : ''}`}>
          <label className="csbi-label" htmlFor="csbi-trailer">
            {t('courseStepBasicInfo.trailerUrl')}
          </label>
          <input
            id="csbi-trailer"
            type="url"
            name="trailerUrl"
            className="csbi-input"
            placeholder="https://youtube.com/..."
            value={courseData.trailerUrl}
            onChange={handleChange}
          />
          {errors.trailerUrl && (
            <span className="csbi-error-msg"><AlertCircle size={14} />{errors.trailerUrl}</span>
          )}
        </div>
      </div>

      {/* Thumbnail Preview */}
      {courseData.thumbnailUrl && (
        <div className="csbi-preview">
          <img
            src={courseData.thumbnailUrl}
            alt={t('courseStepBasicInfo.thumbnailPreview')}
            className="csbi-preview-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
};

export default CourseStepBasicInfo;