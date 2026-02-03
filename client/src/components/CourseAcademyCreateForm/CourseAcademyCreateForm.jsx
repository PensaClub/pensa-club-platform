// src/components/CourseAcademyCreateForm/CourseAcademyCreateForm.jsx

import { useTranslation } from 'react-i18next';
import { BookOpen, Settings, Layers, Eye, ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import useCourseAcademyCreateForm from '../hooks/useCourseAcademyCreateForm';
import './courseAcademyCreateForm.css';

const STEPS = [
  { id: 1, key: 'basicInfo', icon: BookOpen },
  { id: 2, key: 'settings', icon: Settings },
  { id: 3, key: 'modules', icon: Layers },
  { id: 4, key: 'preview', icon: Eye },
];

const CourseAcademyCreateForm = () => {
  const { t } = useTranslation();

  const {
    isEditMode,
    currentStep,
    courseData,
    isLoading,
    isSaving,
    errors,
    totalSteps,
    updateField,
    goToStep,
    nextStep,
    prevStep,
    handleSaveDraft,
    handlePublish,
  } = useCourseAcademyCreateForm();

  const renderStepContent = () => {
    const StepIcon = STEPS[currentStep - 1].icon;
    return (
      <div className="cacf-step-placeholder">
        <StepIcon size={48} />
        <p>{t(`courseCreateForm.steps.${STEPS[currentStep - 1].key}`)} - TODO</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="cacf-loading">
        <div className="cacf-spinner" />
        <p>{t('courseCreateForm.loading')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Background */}
      <div className="cacf-page-bg">
        <div className="cacf-glow-orb" />
      </div>

      <div className="cacf-container">
        {/* Header */}
        <div className="cacf-header">
          <h1 className="cacf-title">
            {isEditMode
              ? <>{t('courseCreateForm.titleEdit')}</>
              : <>{t('courseCreateForm.titleCreate').split(' ').slice(0, -1).join(' ')} <span className="cacf-title-accent">{t('courseCreateForm.titleCreate').split(' ').pop()}</span></>
            }
          </h1>
          <p className="cacf-subtitle">
            {t(`courseCreateForm.steps.${STEPS[currentStep - 1].key}`)}
            {' — '}
            {t('courseCreateForm.stepOf', { current: currentStep, total: totalSteps })}
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="cacf-steps-nav">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                className={`cacf-step-btn ${currentStep === step.id ? 'cacf-step-active' : ''} ${currentStep > step.id ? 'cacf-step-completed' : ''}`}
                onClick={() => goToStep(step.id)}
              >
                <span className="cacf-step-number"><Icon size={18} /></span>
                <span className="cacf-step-label">{t(`courseCreateForm.steps.${step.key}`)}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="cacf-content">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="cacf-footer">
        <div className="cacf-footer-left">
          {currentStep > 1 && (
            <button className="cacf-btn cacf-btn-secondary" onClick={prevStep}>
              <ChevronLeft size={18} />
              {t('courseCreateForm.back')}
            </button>
          )}
        </div>
        <div className="cacf-footer-right">
          <button className="cacf-btn cacf-btn-draft" onClick={handleSaveDraft} disabled={isSaving}>
            <Save size={18} />
            {isSaving ? t('courseCreateForm.saving') : t('courseCreateForm.saveDraft')}
          </button>
          {currentStep < totalSteps ? (
            <button className="cacf-btn cacf-btn-primary" onClick={nextStep}>
              {t('courseCreateForm.next')}
              <ChevronRight size={18} />
            </button>
          ) : (
            <button className="cacf-btn cacf-btn-publish" onClick={handlePublish} disabled={isSaving}>
              <Send size={18} />
              {t('courseCreateForm.publish')}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseAcademyCreateForm;