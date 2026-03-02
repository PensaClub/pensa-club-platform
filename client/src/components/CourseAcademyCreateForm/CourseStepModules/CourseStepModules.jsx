// src/components/CourseAcademyCreateForm/CourseStepModules/CourseStepModules.jsx

import { useTranslation } from 'react-i18next';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
  GripVertical, Video, FileText, Radio, HelpCircle, ClipboardList,
} from 'lucide-react';
import './courseStepModules.css';

const LESSON_TYPE_OPTIONS = ['video', 'text', 'live', 'quiz', 'assignment'];

const LESSON_TYPE_ICONS = {
  video: Video,
  text: FileText,
  live: Radio,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

const CourseStepModules = ({
  modules,
  addModule,
  updateModule,
  removeModule,
  moveModule,
  toggleModule,
  addLesson,
  updateLesson,
  removeLesson,
  moveLesson,
}) => {
  const { t } = useTranslation('academy-admin');

  return (
    <div className="csmo-wrapper">
      {/* Header */}
      <div className="csmo-header">
        <div className="csmo-header-info">
          <p className="csmo-header-desc">{t('courseStepModules.description')}</p>
          <span className="csmo-stats">
            {t('courseStepModules.stats', {
              modules: modules.length,
              lessons: modules.reduce((sum, m) => sum + m.lessons.length, 0),
            })}
          </span>
        </div>
        <button className="csmo-add-module-btn" onClick={addModule}>
          <Plus size={18} />
          {t('courseStepModules.addModule')}
        </button>
      </div>

      {/* Empty state */}
      {modules.length === 0 && (
        <div className="csmo-empty">
          <p>{t('courseStepModules.empty')}</p>
        </div>
      )}

      {/* Modules list */}
      <div className="csmo-modules-list">
        {modules.map((mod, moduleIndex) => (
          <div key={mod.tempId} className="csmo-module">
            {/* Module header */}
            <div className="csmo-module-header">
              <div className="csmo-module-left">
                <GripVertical size={16} className="csmo-drag-icon" />
                <button
                  className={`csmo-module-toggle ${mod.isOpen ? 'csmo-toggle-open' : ''}`}
                  onClick={() => toggleModule(moduleIndex)}
                >
                  <ChevronRight size={16} />
                </button>
                <span className="csmo-module-index">{moduleIndex + 1}</span>
                <input
                  type="text"
                  className="csmo-module-title-input"
                  placeholder={t('courseStepModules.moduleTitlePlaceholder')}
                  value={mod.title}
                  onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                />
              </div>

              <div className="csmo-module-actions">
                <span className="csmo-lesson-count">
                  {mod.lessons.length} {t('courseStepModules.lessonsCount')}
                </span>
                <button
                  className="csmo-icon-btn"
                  onClick={() => moveModule(moduleIndex, -1)}
                  disabled={moduleIndex === 0}
                  title={t('courseStepModules.moveUp')}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  className="csmo-icon-btn"
                  onClick={() => moveModule(moduleIndex, 1)}
                  disabled={moduleIndex === modules.length - 1}
                  title={t('courseStepModules.moveDown')}
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  className="csmo-icon-btn csmo-icon-btn-danger"
                  onClick={() => removeModule(moduleIndex)}
                  title={t('courseStepModules.removeModule')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Module description */}
            {mod.isOpen && (
              <div className="csmo-module-body">
                <input
                  type="text"
                  className="csmo-module-desc-input"
                  placeholder={t('courseStepModules.moduleDescPlaceholder')}
                  value={mod.description}
                  onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                />

                {/* Lessons */}
                <div className="csmo-lessons-list">
                  {mod.lessons.map((lesson, lessonIndex) => {
                    const TypeIcon = LESSON_TYPE_ICONS[lesson.lessonType] || Video;
                    return (
                      <div key={lesson.tempId} className="csmo-lesson">
                        <div className="csmo-lesson-row">
                          <GripVertical size={14} className="csmo-drag-icon" />
                          <div className="csmo-lesson-type-badge">
                            <TypeIcon size={14} />
                          </div>
                          <input
                            type="text"
                            className="csmo-lesson-title-input"
                            placeholder={t('courseStepModules.lessonTitlePlaceholder')}
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)
                            }
                          />
                          <select
                            className="csmo-lesson-type-select"
                            value={lesson.lessonType}
                            onChange={(e) =>
                              updateLesson(moduleIndex, lessonIndex, 'lessonType', e.target.value)
                            }
                          >
                            {LESSON_TYPE_OPTIONS.map((type) => (
                              <option key={type} value={type}>
                                {t(`courseStepModules.lessonTypes.${type}`)}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="csmo-lesson-duration"
                            placeholder={t('courseStepModules.durationPlaceholder')}
                            value={lesson.durationMinutes}
                            onChange={(e) =>
                              updateLesson(moduleIndex, lessonIndex, 'durationMinutes', e.target.value)
                            }
                            min={1}
                          />
                          <div className="csmo-lesson-actions">
                            <button
                              className="csmo-icon-btn-sm"
                              onClick={() => moveLesson(moduleIndex, lessonIndex, -1)}
                              disabled={lessonIndex === 0}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              className="csmo-icon-btn-sm"
                              onClick={() => moveLesson(moduleIndex, lessonIndex, 1)}
                              disabled={lessonIndex === mod.lessons.length - 1}
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              className="csmo-icon-btn-sm csmo-icon-btn-danger"
                              onClick={() => removeLesson(moduleIndex, lessonIndex)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add lesson */}
                <button
                  className="csmo-add-lesson-btn"
                  onClick={() => addLesson(moduleIndex)}
                >
                  <Plus size={16} />
                  {t('courseStepModules.addLesson')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseStepModules;