// src/components/CourseAcademyCreateForm/CourseStepPreview/CourseStepPreview.jsx

import { useTranslation } from 'react-i18next';
import {
  BookOpen, Settings, Layers, Video, FileText, Radio,
  HelpCircle, ClipboardList, Globe, Lock, Award, Calendar,
  Clock, Users, Tag, ChevronRight, AlertTriangle,
} from 'lucide-react';
import './courseStepPreview.css';

const LESSON_TYPE_ICONS = {
  video: Video,
  text: FileText,
  live: Radio,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

const CourseStepPreview = ({ courseData, modules, goToStep }) => {
  const { t } = useTranslation();

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (Number(l.durationMinutes) || 0), 0),
    0
  );

  // Warnings
  const warnings = [];
  if (!courseData.name.trim()) warnings.push(t('courseStepPreview.warnings.noName'));
  if (!courseData.category.trim()) warnings.push(t('courseStepPreview.warnings.noCategory'));
  if (modules.length === 0) warnings.push(t('courseStepPreview.warnings.noModules'));
  modules.forEach((mod, i) => {
    if (!mod.title.trim()) warnings.push(t('courseStepPreview.warnings.moduleNoTitle', { index: i + 1 }));
    if (mod.lessons.length === 0) warnings.push(t('courseStepPreview.warnings.moduleNoLessons', { index: i + 1 }));
    mod.lessons.forEach((les, j) => {
      if (!les.title.trim()) warnings.push(t('courseStepPreview.warnings.lessonNoTitle', { module: i + 1, lesson: j + 1 }));
    });
  });

  return (
    <div className="cspv-wrapper">

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="cspv-warnings">
          <div className="cspv-warnings-header">
            <AlertTriangle size={18} />
            <span>{t('courseStepPreview.warningsTitle', { count: warnings.length })}</span>
          </div>
          <ul className="cspv-warnings-list">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* === Section: Basic Info === */}
      <div className="cspv-section">
        <div className="cspv-section-header" onClick={() => goToStep(1)}>
          <div className="cspv-section-header-left">
            <BookOpen size={18} />
            <h3>{t('courseStepPreview.sections.basicInfo')}</h3>
          </div>
          <span className="cspv-edit-link">
            {t('courseStepPreview.edit')} <ChevronRight size={14} />
          </span>
        </div>

        <div className="cspv-grid">
          <div className="cspv-item">
            <span className="cspv-item-label">{t('courseStepPreview.fields.name')}</span>
            <span className="cspv-item-value">{courseData.name || '—'}</span>
          </div>
          <div className="cspv-item">
            <span className="cspv-item-label">{t('courseStepPreview.fields.category')}</span>
            <span className="cspv-item-value">{courseData.category || '—'}</span>
          </div>
          <div className="cspv-item">
            <span className="cspv-item-label">{t('courseStepPreview.fields.difficulty')}</span>
            <span className="cspv-item-value">
              {courseData.difficultyLevel ? t(`courseStepBasicInfo.difficultyLevels.${courseData.difficultyLevel}`) : '—'}
            </span>
          </div>
          {courseData.shortDescription && (
            <div className="cspv-item cspv-item-full">
              <span className="cspv-item-label">{t('courseStepPreview.fields.shortDescription')}</span>
              <span className="cspv-item-value">{courseData.shortDescription}</span>
            </div>
          )}
          {courseData.description && (
            <div className="cspv-item cspv-item-full">
              <span className="cspv-item-label">{t('courseStepPreview.fields.description')}</span>
              <span className="cspv-item-value cspv-item-description">{courseData.description}</span>
            </div>
          )}
        </div>

        {/* Thumbnail preview */}
        {courseData.thumbnailUrl && (
          <div className="cspv-thumbnail">
            <img
              src={courseData.thumbnailUrl}
              alt={t('courseStepPreview.fields.thumbnail')}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      {/* === Section: Settings === */}
      <div className="cspv-section">
        <div className="cspv-section-header" onClick={() => goToStep(2)}>
          <div className="cspv-section-header-left">
            <Settings size={18} />
            <h3>{t('courseStepPreview.sections.settings')}</h3>
          </div>
          <span className="cspv-edit-link">
            {t('courseStepPreview.edit')} <ChevronRight size={14} />
          </span>
        </div>

        <div className="cspv-badges">
          <span className="cspv-badge">
            {t(`courseStepSettings.courseTypes.${courseData.courseType}`)}
          </span>
          <span className="cspv-badge">
            {courseData.isPublic ? <><Globe size={13} /> {t('courseStepPreview.badges.public')}</> : <><Lock size={13} /> {t('courseStepPreview.badges.private')}</>}
          </span>
          {courseData.hasCertificate && (
            <span className="cspv-badge cspv-badge-accent">
              <Award size={13} /> {t('courseStepPreview.badges.certificate')}
            </span>
          )}
          {courseData.requiresApproval && (
            <span className="cspv-badge">{t('courseStepPreview.badges.approval')}</span>
          )}
        </div>

        <div className="cspv-grid">
          {courseData.startDate && (
            <div className="cspv-item">
              <span className="cspv-item-label"><Calendar size={13} /> {t('courseStepPreview.fields.startDate')}</span>
              <span className="cspv-item-value">{courseData.startDate}</span>
            </div>
          )}
          {courseData.endDate && (
            <div className="cspv-item">
              <span className="cspv-item-label"><Calendar size={13} /> {t('courseStepPreview.fields.endDate')}</span>
              <span className="cspv-item-value">{courseData.endDate}</span>
            </div>
          )}
          {courseData.durationWeeks && (
            <div className="cspv-item">
              <span className="cspv-item-label"><Clock size={13} /> {t('courseStepPreview.fields.duration')}</span>
              <span className="cspv-item-value">{courseData.durationWeeks} {t('courseStepPreview.weeks')}</span>
            </div>
          )}
          {courseData.estimatedHours && (
            <div className="cspv-item">
              <span className="cspv-item-label"><Clock size={13} /> {t('courseStepPreview.fields.hours')}</span>
              <span className="cspv-item-value">{courseData.estimatedHours} {t('courseStepPreview.hours')}</span>
            </div>
          )}
          {courseData.maxParticipants && (
            <div className="cspv-item">
              <span className="cspv-item-label"><Users size={13} /> {t('courseStepPreview.fields.maxParticipants')}</span>
              <span className="cspv-item-value">{courseData.maxParticipants}</span>
            </div>
          )}
          {(courseData.maxCredits > 0 || courseData.creditsForCompletion > 0) && (
            <div className="cspv-item">
              <span className="cspv-item-label">{t('courseStepPreview.fields.credits')}</span>
              <span className="cspv-item-value">{courseData.maxCredits} / {courseData.creditsForCompletion}</span>
            </div>
          )}
        </div>

        {courseData.tags && (
          <div className="cspv-tags">
            <Tag size={14} />
            {String(courseData.tags).split(',').map((tag, i) => (
              tag.trim() && <span key={i} className="cspv-tag">{tag.trim()}</span>
            ))}
          </div>
        )}
      </div>

      {/* === Section: Modules & Lessons === */}
      <div className="cspv-section">
        <div className="cspv-section-header" onClick={() => goToStep(3)}>
          <div className="cspv-section-header-left">
            <Layers size={18} />
            <h3>{t('courseStepPreview.sections.modules')}</h3>
          </div>
          <span className="cspv-edit-link">
            {t('courseStepPreview.edit')} <ChevronRight size={14} />
          </span>
        </div>

        <div className="cspv-modules-stats">
          <span>{t('courseStepPreview.modulesCount', { count: modules.length })}</span>
          <span>•</span>
          <span>{t('courseStepPreview.lessonsCount', { count: totalLessons })}</span>
          {totalDuration > 0 && (
            <>
              <span>•</span>
              <span>{totalDuration} {t('courseStepPreview.minutes')}</span>
            </>
          )}
        </div>

        {modules.length === 0 ? (
          <p className="cspv-empty">{t('courseStepPreview.noModules')}</p>
        ) : (
          <div className="cspv-modules-list">
            {modules.map((mod, i) => (
              <div key={mod.tempId} className="cspv-module">
                <div className="cspv-module-header">
                  <span className="cspv-module-index">{i + 1}</span>
                  <span className="cspv-module-title">{mod.title || t('courseStepPreview.untitledModule')}</span>
                  <span className="cspv-module-count">{mod.lessons.length} {t('courseStepModules.lessonsCount')}</span>
                </div>
                {mod.lessons.length > 0 && (
                  <div className="cspv-lessons-list">
                    {mod.lessons.map((les, j) => {
                      const TypeIcon = LESSON_TYPE_ICONS[les.lessonType] || Video;
                      return (
                        <div key={les.tempId} className="cspv-lesson">
                          <span className="cspv-lesson-index">{j + 1}</span>
                          <TypeIcon size={14} className="cspv-lesson-type-icon" />
                          <span className="cspv-lesson-title">{les.title || t('courseStepPreview.untitledLesson')}</span>
                          <span className="cspv-lesson-meta">
                            {t(`courseStepModules.lessonTypes.${les.lessonType}`)}
                            {les.durationMinutes && ` • ${les.durationMinutes} ${t('courseStepPreview.min')}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStepPreview;