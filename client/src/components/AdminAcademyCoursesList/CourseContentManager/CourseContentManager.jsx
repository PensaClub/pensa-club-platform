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
  Calendar,
  Upload, Paperclip,
  ClipboardCheck,
} from 'lucide-react';
import useCourseContentManager from './useCourseContentManager';
import './courseContentManager.css';
import { useState } from 'react';
import EditLessonModal from './EditLessonModal/EditLessonModal';
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import TestEditorModal from './TestEditorModal/TestEditorModal';
const LESSON_TYPE_ICONS = {
  video: Video,
  text: FileText,
  live: Radio,
  quiz: HelpCircle,
};

const LESSON_TYPE_OPTIONS = ['video', 'text', 'live', 'quiz'];

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

const CourseContentManager = () => {
  const { t } = useTranslation();
  const {
    course,
    modules,
    standaloneLessons,
    isLoading,
    slug,
    actionLoading,
    expandedModules,
    editingModule,
    addingModule,
    newModuleTitle,
    addingLessonTo,
    newLessonTitle,
    newLessonType,
    deleteTarget,
    editingLesson,
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
    closeEditLesson,
    openEditLesson,
    handleBack,
    courseMaterials,
    materialsLoading,
    handleAddCourseMaterial,
    handleDeleteCourseMaterial,
  } = useCourseContentManager();

  const { uploadFile, uploading, uploadProgress } = useFirebaseUpload();
  const [materialsExpanded, setMaterialsExpanded] = useState(true);
  const [showCourseTest, setShowCourseTest] = useState(false);

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

  const detectMaterialType = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const mime = file.type || '';
    if (ext === 'pdf' || mime.includes('pdf')) return 'pdf';
    if (['doc', 'docx'].includes(ext) || mime.includes('word')) return 'document';
    if (['xls', 'xlsx'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(ext) || mime.includes('presentation')) return 'presentation';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mime.startsWith('image/')) return 'image';
    if (['mp4', 'avi', 'mov', 'webm'].includes(ext) || mime.startsWith('video/')) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext) || mime.startsWith('audio/')) return 'audio';
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return 'archive';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCourseMaterialUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} е твърде голям (макс. 50MB)`);
        continue;
      }
      try {
        const materialType = detectMaterialType(file);
        const storagePath = `academy/materials/courses/${slug}`;
        const result = await uploadFile(file, storagePath);

        await handleAddCourseMaterial({
          title: file.name.replace(/\.[^/.]+$/, ''),
          materialType,
          fileUrl: result.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isDownloadable: true,
        });
      } catch (err) {
        console.error('Upload error:', err);
        toast.error(`Грешка при качване на ${file.name}`);
      }
    }
    e.target.value = '';
  };

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
                {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) + standaloneLessons.length}{' '}
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
             <button className="ccm-inline-btn ccm-inline-confirm" onClick={handleSave} disabled={actionLoading || !form.title.trim()}>
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
        {modules.length === 0 && standaloneLessons.length === 0 ? (
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
                        onSave={(updates) => handleUpdateModule(mod.id, updates)}
                        onCancel={() => setEditingModule(null)}
                        actionLoading={actionLoading === `module-${mod.id}`}
                      />
                    ) : (
                      <>
                        <span className="ccm-module-title">{mod.title}</span>
                        {(mod.startDate || mod.endDate || mod.estimatedHours) && (
                          <div className="ccm-module-meta">
                            {mod.startDate && (
                              <span className="ccm-module-meta-tag">
                                <Calendar size={10} /> {new Date(mod.startDate).toLocaleDateString('bg-BG')}
                              </span>
                            )}
                            {mod.endDate && (
                              <span className="ccm-module-meta-tag">
                                → {new Date(mod.endDate).toLocaleDateString('bg-BG')}
                              </span>
                            )}
                            {mod.estimatedHours && (
                              <span className="ccm-module-meta-tag">
                                <Clock size={10} /> {mod.estimatedHours}ч
                              </span>
                            )}
                          </div>
                        )}
                      </>
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
                                {les.hasTest && (
                                  <span className="ccm-test-badge" title={t('contentManager.hasTest', 'Урокът има тест')}>
                                    <ClipboardCheck size={14} />
                                  </span>
                                )}
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

        {/* =========================================================
                    STANDALONE LESSONS (без модул)
            ========================================================= */}
        <div className="ccm-standalone-section">
          <div
            className="ccm-standalone-header"
            onClick={() => toggleModule('standalone')}
          >
            <div className="ccm-module-left">
              {expandedModules['standalone'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <FileText size={16} className="ccm-standalone-icon" />
              <span className="ccm-module-title">
                {t('contentManager.standaloneLessons', 'Самостоятелни уроци')}
              </span>
              <span className="ccm-lesson-count-badge">
                {standaloneLessons.length}
              </span>
            </div>
          </div>

          {expandedModules['standalone'] && (
            <div className="ccm-module-body">
              {standaloneLessons.length === 0 && addingLessonTo !== 'standalone' && (
                <p className="ccm-standalone-empty">
                  {t('contentManager.noStandaloneLessons', 'Няма самостоятелни уроци. Тези уроци не принадлежат към модул.')}
                </p>
              )}

              {standaloneLessons.length > 0 && (
                <div className="ccm-lessons-list">
                  {standaloneLessons.map((les, lesIdx) => {
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
                          {les.hasTest && (
                            <span className="ccm-test-badge" title={t('contentManager.hasTest', 'Урокът има тест')}>
                              <ClipboardCheck size={14} />
                            </span>
                          )}
                        </div>

                        <div className="ccm-lesson-right">
                          {les.durationMinutes > 0 && (
                            <span className="ccm-lesson-duration">
                              <Clock size={12} /> {les.durationMinutes} мин
                            </span>
                          )}
                          <button
                            className="ccm-icon-btn"
                            onClick={() => handleMoveLessonInModule('standalone', les.id, 'up')}
                            disabled={lesIdx === 0}
                            title={t('contentManager.moveUp', 'Нагоре')}
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            className="ccm-icon-btn"
                            onClick={() => handleMoveLessonInModule('standalone', les.id, 'down')}
                            disabled={lesIdx === standaloneLessons.length - 1}
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

              {/* Add Standalone Lesson */}
              {addingLessonTo === 'standalone' ? (
                <div className="ccm-inline-form ccm-inline-form-lesson">
                  <input
                    type="text"
                    className="ccm-inline-input"
                    placeholder={t('contentManager.lessonTitlePlaceholder', 'Заглавие на урока...')}
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(null)}
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
                    onClick={() => handleAddLesson(null)}
                    disabled={actionLoading === `add-lesson-null` || !newLessonTitle.trim()}
                  >
                    {actionLoading === `add-lesson-null`
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
                  onClick={() => setAddingLessonTo('standalone')}
                >
                  <Plus size={14} />
                  {t('contentManager.addLesson', 'Добави урок')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* =========================================================
                    COURSE MATERIALS (материали към курса)
            ========================================================= */}
        <div className="ccm-materials-section">
          <div
            className="ccm-materials-header"
            onClick={() => setMaterialsExpanded(!materialsExpanded)}
          >
            <div className="ccm-materials-header-left">
              {materialsExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <Paperclip size={18} className="ccm-materials-icon" />
              <h3 className="ccm-materials-title">
                {t('contentManager.materials.title', 'Материали към курса')}
              </h3>
              <span className="ccm-lesson-count-badge">{courseMaterials.length}</span>
            </div>
            <label
              className="ccm-btn ccm-btn-sm ccm-btn-secondary"
              onClick={(e) => e.stopPropagation()}
              title={t('contentManager.materials.uploadTooltip', 'Качете файлове към курса')}
            >
              <Upload size={14} />
              {t('contentManager.materials.upload', 'Качи файл')}
              <input
                type="file"
                multiple
                hidden
                onChange={handleCourseMaterialUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {materialsExpanded && (
            <div className="ccm-materials-body">
              {uploading && (
                <div className="ccm-materials-uploading">
                  <Loader2 size={16} className="ccm-spin" />
                  {t('contentManager.materials.uploading', 'Качване...')} {Math.round(uploadProgress)}%
                </div>
              )}

              {materialsLoading ? (
                <div className="ccm-materials-loading">
                  <Loader2 size={20} className="ccm-spin" />
                </div>
              ) : courseMaterials.length === 0 ? (
                <div className="ccm-standalone-empty">
                  {t('contentManager.materials.empty', 'Няма качени материали към курса. Качете файлове с бутона "Качи файл".')}
                </div>
              ) : (
                <div className="ccm-materials-list">
                  {courseMaterials.map((mat) => (
                    <div key={mat.id} className="ccm-material-item">
                      <span className="ccm-material-type">{mat.materialType?.toUpperCase()}</span>
                      <span className="ccm-material-name">{mat.title}</span>
                      {mat.fileSize > 0 && (
                        <span className="ccm-material-size">{formatFileSize(mat.fileSize)}</span>
                      )}

                      <button
                        className="ccm-material-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(mat.fileUrl || mat.externalUrl, '_blank');
                        }}
                        title={t('contentManager.materials.openFile', 'Отвори файла')}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="ccm-material-delete"
                        onClick={() => handleDeleteCourseMaterial(mat.id)}
                        disabled={actionLoading === `deleteMaterial-${mat.id}`}
                        title={t('contentManager.materials.delete', 'Изтрий материал')}
                      >
                        {actionLoading === `deleteMaterial-${mat.id}`
                          ? <Loader2 size={14} className="ccm-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* =========================================================
                    COURSE FINAL TEST
            ========================================================= */}
        <div className="ccm-final-test-section">
          <div className="ccm-final-test-header">
            <div className="ccm-final-test-left">
              <HelpCircle size={18} className="ccm-final-test-icon" />
              <h3 className="ccm-final-test-title">
                {t('contentManager.finalTest.title', 'Финален тест на курса')}
              </h3>
            </div>
            <button
              className="ccm-btn ccm-btn-sm ccm-btn-primary"
              onClick={() => setShowCourseTest(true)}
            >
              <FileText size={14} />
              {t('contentManager.finalTest.manage', 'Управлявай тест')}
            </button>
          </div>
          <p className="ccm-final-test-desc">
            {t('contentManager.finalTest.description', 'Финалният тест се решава от учениците след завършване на всички модули и уроци в курса.')}
          </p>
        </div>
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

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <EditLessonModal
          lesson={editingLesson}
          courseSlug={slug}
          onClose={closeEditLesson}
        />
      )}
      <TestEditorModal
        isOpen={showCourseTest}
        onClose={() => setShowCourseTest(false)}
        courseId={course?.id}
        entityTitle={course?.name}
      />
    </div>
  );
};

// =========================================================
//                    INLINE MODULE EDIT
// =========================================================

const ModuleEditInline = ({ module, onSave, onCancel, actionLoading }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: module.title || '',
    startDate: formatDateForInput(module.startDate),
    endDate: formatDateForInput(module.endDate),
    estimatedHours: module.estimatedHours || '',
  });

  const handleSave = () => {
    onSave({
      title: form.title,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
    });
  };

  return (
    <div className="ccm-edit-inline-expanded" onClick={(e) => e.stopPropagation()}>
      <div className="ccm-edit-row-main">
        <input
          type="text"
          className="ccm-inline-input"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={t('contentManager.moduleNamePlaceholder', 'Име на модула...')}
          autoFocus
        />
        <button className="ccm-inline-btn ccm-inline-confirm" onClick={handleSave} disabled={actionLoading}>
          {actionLoading ? <Loader2 size={14} className="ccm-spin" /> : <Check size={14} />}
        </button>
        <button className="ccm-inline-btn ccm-inline-cancel" onClick={onCancel}>
          <X size={14} />
        </button>
      </div>
      <div className="ccm-edit-row-details">
        <div className="ccm-edit-mini-field">
          <label className="ccm-edit-mini-label">
            <Calendar size={11} />
            {t('contentManager.startDate', 'Начало')}
          </label>
          <input
            type="date"
            className="ccm-inline-input ccm-inline-input-sm"
            value={form.startDate}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
          />
        </div>
        <div className="ccm-edit-mini-field">
          <label className="ccm-edit-mini-label">
            <Calendar size={11} />
            {t('contentManager.endDate', 'Край')}
          </label>
          <input
            type="date"
            className="ccm-inline-input ccm-inline-input-sm"
            value={form.endDate}
            onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
          />
        </div>
        <div className="ccm-edit-mini-field">
          <label className="ccm-edit-mini-label">
            <Clock size={11} />
            {t('contentManager.estimatedHours', 'Часове')}
          </label>
          <input
            type="number"
            className="ccm-inline-input ccm-inline-input-sm"
            value={form.estimatedHours}
            onChange={(e) => setForm((p) => ({ ...p, estimatedHours: e.target.value }))}
            min={0}
            placeholder="0"
          />
        </div>
      </div>

    </div>
  );
};

export default CourseContentManager;