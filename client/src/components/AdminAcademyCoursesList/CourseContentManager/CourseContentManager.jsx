// src/components/AdminAcademyCoursesList/CourseContentManager/CourseContentManager.jsx
// Prefix: ccm-

import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Video,
  FileText,
  Radio,
  HelpCircle,
  Layers,
  Clock,
  GripVertical,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import useCourseContentManager from './useCourseContentManager';
import './courseContentManager.css';
import { useState } from 'react';

const LESSON_TYPE_ICONS = {
  video: Video,
  text: FileText,
  live: Radio,
  quiz: HelpCircle,
};

const LESSON_TYPE_OPTIONS = ['video', 'text', 'live', 'quiz'];

const CourseContentManager = () => {
  const { t } = useTranslation();
  const {
    course,
    modules,
    isLoading,
    actionLoading,
    expandedModules,
    editingModule,
    addingModule,
    newModuleTitle,
    addingLessonTo,
    newLessonTitle,
    newLessonType,
    deleteTarget,
    toggleModule,
    setAddingModule,
    setNewModuleTitle,
    handleAddModule,
    setEditingModule,
    handleUpdateModule,
    handleMoveModule,
    setAddingLessonTo,
    setNewLessonTitle,
    setNewLessonType,
    handleAddLesson,
    handleToggleLessonPublish,
    handleMoveLessonInModule,
    setDeleteTarget,
    handleDeleteModule,
    handleDeleteLesson,
    openEditLesson,
    handleBack,
  } = useCourseContentManager();

  if (isLoading) {
    return (
      <div className="ccm-wrapper">
        <div className="ccm-page-bg"><div className="ccm-glow-orb" /></div>
        <div className="ccm-loading">
          <div className="ccm-spinner" />
          <p>{t('contentManager.loading', 'Зареждане на съдържание...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ccm-wrapper">
      <div className="ccm-page-bg"><div className="ccm-glow-orb" /></div>

      <div className="ccm-container">
        {/* Header */}
        <div className="ccm-header">
          <button className="ccm-back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
            {t('contentManager.back', 'Назад')}
          </button>
          <div className="ccm-header-info">
            <h1 className="ccm-title">
              {t('contentManager.title', 'Съдържание на')}{' '}
              <span className="ccm-title-accent">{course?.name}</span>
            </h1>
            <p className="ccm-subtitle">
              {t('contentManager.subtitle', 'Управлявайте модули и уроци')}
            </p>
          </div>

          {/* Stats */}
          <div className="ccm-header-stats">
            <div className="ccm-mini-stat">
              <Layers size={14} />
              <span>{modules.length} {t('contentManager.modules', 'модула')}</span>
            </div>
            <div className="ccm-mini-stat">
              <Video size={14} />
              <span>
                {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)}{' '}
                {t('contentManager.lessons', 'урока')}
              </span>
            </div>
          </div>
        </div>

        {/* Add Module Button */}
        <div className="ccm-add-module-area">
          {addingModule ? (
            <div className="ccm-inline-form">
              <input
                type="text"
                className="ccm-inline-input"
                placeholder={t('contentManager.moduleNamePlaceholder', 'Име на модула...')}
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                autoFocus
              />
              <button
                className="ccm-inline-btn ccm-inline-confirm"
                onClick={handleAddModule}
                disabled={actionLoading === 'add-module' || !newModuleTitle.trim()}
              >
                {actionLoading === 'add-module' ? <Loader2 size={14} className="ccm-spin" /> : <Check size={14} />}
              </button>
              <button
                className="ccm-inline-btn ccm-inline-cancel"
                onClick={() => { setAddingModule(false); setNewModuleTitle(''); }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button className="ccm-add-module-btn" onClick={() => setAddingModule(true)}>
              <Plus size={16} />
              {t('contentManager.addModule', 'Добави модул')}
            </button>
          )}
        </div>

        {/* Modules List */}
        {modules.length === 0 ? (
          <div className="ccm-empty">
            <Layers size={40} strokeWidth={1} />
            <p>{t('contentManager.noModules', 'Все още няма модули. Добавете първия модул.')}</p>
          </div>
        ) : (
          <div className="ccm-modules-list">
            {modules.map((mod, modIdx) => (
              <div key={mod.id} className="ccm-module">
                {/* Module Header */}
                <div className="ccm-module-header" onClick={() => toggleModule(mod.id)}>
                  <div className="ccm-module-left">
                    {expandedModules[mod.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className="ccm-module-order">{modIdx + 1}</span>

                    {editingModule === mod.id ? (
                      <ModuleEditInline
                        module={mod}
                        onSave={(title) => handleUpdateModule(mod.id, { title })}
                        onCancel={() => setEditingModule(null)}
                        actionLoading={actionLoading === `module-${mod.id}`}
                      />
                    ) : (
                      <span className="ccm-module-title">{mod.title}</span>
                    )}
                  </div>

                  <div className="ccm-module-right" onClick={(e) => e.stopPropagation()}>
                    <span className="ccm-module-count">
                      {mod.lessons?.length || 0} {t('contentManager.lessonsShort', 'ур.')}
                    </span>
                    <button
                      className="ccm-icon-btn"
                      onClick={() => handleMoveModule(mod.id, 'up')}
                      disabled={modIdx === 0}
                      title={t('contentManager.moveUp', 'Нагоре')}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      className="ccm-icon-btn"
                      onClick={() => handleMoveModule(mod.id, 'down')}
                      disabled={modIdx === modules.length - 1}
                      title={t('contentManager.moveDown', 'Надолу')}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      className="ccm-icon-btn"
                      onClick={() => setEditingModule(mod.id)}
                      title={t('contentManager.editModule', 'Преименувай')}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="ccm-icon-btn ccm-icon-btn-danger"
                      onClick={() => setDeleteTarget({ type: 'module', id: mod.id, name: mod.title })}
                      title={t('contentManager.deleteModule', 'Изтрий модул')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Module Body */}
                {expandedModules[mod.id] && (
                  <div className="ccm-module-body">
                    {/* Lessons */}
                    {(mod.lessons || []).length === 0 ? (
                      <p className="ccm-no-lessons">{t('contentManager.noLessons', 'Няма уроци в този модул')}</p>
                    ) : (
                      <div className="ccm-lessons-list">
                        {(mod.lessons || []).map((les, lesIdx) => {
                          const TypeIcon = LESSON_TYPE_ICONS[les.lessonType] || Video;
                          return (
                            <div key={les.id} className={`ccm-lesson ${les.isPublished ? '' : 'ccm-lesson-draft'}`}>
                              <div className="ccm-lesson-left">
                                <GripVertical size={14} className="ccm-grip" />
                                <div className="ccm-lesson-type-icon">
                                  <TypeIcon size={14} />
                                </div>
                                <span className="ccm-lesson-title" onClick={() => openEditLesson(les)}>
                                  {les.title}
                                </span>
                                {les.isFree && <span className="ccm-free-badge">{t('contentManager.free', 'Безплатен')}</span>}
                              </div>

                              <div className="ccm-lesson-right">
                                {les.durationMinutes > 0 && (
                                  <span className="ccm-lesson-duration">
                                    <Clock size={12} /> {les.durationMinutes} мин
                                  </span>
                                )}
                                <button
                                  className="ccm-icon-btn"
                                  onClick={() => handleMoveLessonInModule(mod.id, les.id, 'up')}
                                  disabled={lesIdx === 0}
                                  title={t('contentManager.moveUp', 'Нагоре')}
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  className="ccm-icon-btn"
                                  onClick={() => handleMoveLessonInModule(mod.id, les.id, 'down')}
                                  disabled={lesIdx === (mod.lessons || []).length - 1}
                                  title={t('contentManager.moveDown', 'Надолу')}
                                >
                                  <ArrowDown size={13} />
                                </button>
                                <button
                                  className={`ccm-icon-btn ${les.isPublished ? 'ccm-icon-btn-active' : ''}`}
                                  onClick={() => handleToggleLessonPublish(les.slug, les.isPublished)}
                                  disabled={actionLoading === `publish-${les.slug}`}
                                  title={les.isPublished
                                    ? t('contentManager.unpublish', 'Скрий')
                                    : t('contentManager.publish', 'Публикувай')}
                                >
                                  {les.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                                </button>
                                <button
                                  className="ccm-icon-btn"
                                  onClick={() => openEditLesson(les)}
                                  title={t('contentManager.editLesson', 'Редактирай')}
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  className="ccm-icon-btn ccm-icon-btn-danger"
                                  onClick={() => setDeleteTarget({ type: 'lesson', slug: les.slug, name: les.title })}
                                  title={t('contentManager.deleteLesson', 'Изтрий')}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Lesson */}
                    {addingLessonTo === mod.id ? (
                      <div className="ccm-inline-form ccm-inline-form-lesson">
                        <input
                          type="text"
                          className="ccm-inline-input"
                          placeholder={t('contentManager.lessonTitlePlaceholder', 'Заглавие на урока...')}
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(mod.id)}
                          autoFocus
                        />
                        <select
                          className="ccm-inline-select"
                          value={newLessonType}
                          onChange={(e) => setNewLessonType(e.target.value)}
                        >
                          {LESSON_TYPE_OPTIONS.map((lt) => (
                            <option key={lt} value={lt}>
                              {t(`contentManager.lessonTypes.${lt}`, lt)}
                            </option>
                          ))}
                        </select>
                        <button
                          className="ccm-inline-btn ccm-inline-confirm"
                          onClick={() => handleAddLesson(mod.id)}
                          disabled={actionLoading === `add-lesson-${mod.id}` || !newLessonTitle.trim()}
                        >
                          {actionLoading === `add-lesson-${mod.id}`
                            ? <Loader2 size={14} className="ccm-spin" />
                            : <Check size={14} />}
                        </button>
                        <button
                          className="ccm-inline-btn ccm-inline-cancel"
                          onClick={() => { setAddingLessonTo(null); setNewLessonTitle(''); }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="ccm-add-lesson-btn"
                        onClick={() => setAddingLessonTo(mod.id)}
                      >
                        <Plus size={14} />
                        {t('contentManager.addLesson', 'Добави урок')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="ccm-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="ccm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ccm-modal-icon">
              <AlertTriangle size={32} />
            </div>
            <h3 className="ccm-modal-title">
              {deleteTarget.type === 'module'
                ? t('contentManager.deleteModuleTitle', 'Изтриване на модул')
                : t('contentManager.deleteLessonTitle', 'Изтриване на урок')}
            </h3>
            <p className="ccm-modal-text">
              {t('contentManager.deleteConfirm', 'Сигурни ли сте, че искате да изтриете')}
              <strong> „{deleteTarget.name}"</strong>?
              {deleteTarget.type === 'module' && (
                <> {t('contentManager.deleteModuleWarning', 'Уроците ще бъдат преместени извън модула.')}</>
              )}
            </p>
            <div className="ccm-modal-actions">
              <button className="ccm-btn ccm-btn-cancel" onClick={() => setDeleteTarget(null)}>
                {t('contentManager.cancel', 'Отказ')}
              </button>
              <button
                className="ccm-btn ccm-btn-delete"
                onClick={deleteTarget.type === 'module' ? handleDeleteModule : handleDeleteLesson}
                disabled={!!actionLoading}
              >
                {actionLoading ? <Loader2 size={14} className="ccm-spin" /> : <Trash2 size={14} />}
                {t('contentManager.confirmDelete', 'Изтрий')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================
//                    INLINE MODULE EDIT
// =========================================================

const ModuleEditInline = ({ module, onSave, onCancel, actionLoading }) => {
  const [title, setTitle] = useState(module.title);

  return (
    <div className="ccm-edit-inline" onClick={(e) => e.stopPropagation()}>
      <input
        type="text"
        className="ccm-inline-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave(title);
          if (e.key === 'Escape') onCancel();
        }}
        autoFocus
      />
      <button className="ccm-inline-btn ccm-inline-confirm" onClick={() => onSave(title)} disabled={actionLoading}>
        {actionLoading ? <Loader2 size={14} className="ccm-spin" /> : <Check size={14} />}
      </button>
      <button className="ccm-inline-btn ccm-inline-cancel" onClick={onCancel}>
        <X size={14} />
      </button>
    </div>
  );
};

export default CourseContentManager;