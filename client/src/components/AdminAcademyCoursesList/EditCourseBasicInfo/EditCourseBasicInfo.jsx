// src/components/AdminAcademyCoursesList/EditCourseBasicInfo/EditCourseBasicInfo.jsx

import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import useEditCourseBasicInfo from './useEditCourseBasicInfo';
import CourseStepBasicInfo from '../../CourseAcademyCreateForm/CourseStepBasicInfo/CourseStepBasicInfo';
import CourseStepSettings from '../../CourseAcademyCreateForm/CourseStepSettings/CourseStepSettings';
import './editCourseBasicInfo.css';

const EditCourseBasicInfo = () => {
  const { t } = useTranslation();
  const {
    courseData,
    slug,
    isLoading,
    isSaving,
    errors,
    hasChanges,
    updateField,
    handleSave,
    handleCancel,
  } = useEditCourseBasicInfo();

  if (isLoading) {
    return (
      <div className="ecbi-wrapper">
        <div className="ecbi-page-bg"><div className="ecbi-glow-orb" /></div>
        <div className="ecbi-loading">
          <div className="ecbi-spinner" />
          <p>{t('editCourse.loading', 'Зареждане на курса...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ecbi-wrapper">
      {/* Background */}
      <div className="ecbi-page-bg"><div className="ecbi-glow-orb" /></div>

      <div className="ecbi-container">
        {/* Header */}
        <div className="ecbi-header">
          <button className="ecbi-back-btn" onClick={handleCancel}>
            <ArrowLeft size={18} />
            {t('editCourse.back', 'Назад')}
          </button>
          <div className="ecbi-header-info">
            <h1 className="ecbi-title">
              {t('editCourse.title', 'Редактиране на')}{' '}
              <span className="ecbi-title-accent">{courseData.name || slug}</span>
            </h1>
            <p className="ecbi-subtitle">
              {t('editCourse.subtitle', 'Промяна на основна информация и настройки')}
            </p>
          </div>
        </div>

        {/* Section: Basic Info */}
        <div className="ecbi-section">
          <h2 className="ecbi-section-title">
            {t('editCourse.basicInfoTitle', 'Основна информация')}
          </h2>
          <div className="ecbi-section-content">
            <CourseStepBasicInfo
              courseData={courseData}
              updateField={updateField}
              errors={errors}
            />
          </div>
        </div>

        {/* Section: Settings */}
        <div className="ecbi-section">
          <h2 className="ecbi-section-title">
            {t('editCourse.settingsTitle', 'Настройки')}
          </h2>
          <div className="ecbi-section-content">
            <CourseStepSettings
              courseData={courseData}
              updateField={updateField}
              errors={errors}
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="ecbi-footer">
        <div className="ecbi-footer-left">
          {hasChanges && (
            <span className="ecbi-unsaved">
              {t('editCourse.unsavedChanges', '● Незапазени промени')}
            </span>
          )}
        </div>
        <div className="ecbi-footer-right">
          <button className="ecbi-btn ecbi-btn-cancel" onClick={handleCancel}>
            {t('editCourse.cancel', 'Отказ')}
          </button>
          <button
            className="ecbi-btn ecbi-btn-save"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? <Loader2 size={16} className="ecbi-spin" /> : <Save size={16} />}
            {t('editCourse.save', 'Запази промените')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseBasicInfo;