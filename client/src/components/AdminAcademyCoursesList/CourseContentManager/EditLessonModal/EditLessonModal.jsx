// src/components/AdminAcademyCoursesList/CourseContentManager/EditLessonModal/EditLessonModal.jsx
// Prefix: elm-

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Save,
  Loader2,
  Video,
  FileText,
  Radio,
  HelpCircle,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Award,
  Shield,
  Star,
} from 'lucide-react';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import { toast } from 'react-toastify';
import './editLessonModal.css';

const LESSON_TYPE_OPTIONS = [
  { value: 'video', icon: Video },
  { value: 'text', icon: FileText },
  { value: 'live', icon: Radio },
  { value: 'quiz', icon: HelpCircle },
];

const VIDEO_PROVIDER_OPTIONS = ['youtube', 'vimeo', 'custom', 'none'];

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

const EditLessonModal = ({ lesson: basicLesson, courseSlug, onClose }) => {
  const { t } = useTranslation();
  const { getLessonBySlug, updateLesson } = useAcademyCourses();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    lessonType: 'video',
    videoProvider: 'youtube',
    videoUrl: '',
    liveStreamUrl: '',
    thumbnailUrl: '',
    durationMinutes: '',
    scheduledDate: '',
    endDate: '',
    maxCredits: 0,
    creditsForCompletion: 0,
    creditsForTest: 0,
    hasTest: false,
    testPassingScore: 60,
    requiresCompletion: true,
    isFree: false,
    isPublished: false,
  });

  // Load full lesson data
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        const data = await getLessonBySlug(courseSlug, basicLesson.slug);
        const les = data.lesson || data;

        setForm({
          title: les.title || '',
          description: les.description || '',
          lessonType: les.lessonType || 'video',
          videoProvider: les.videoProvider || 'youtube',
          videoUrl: les.videoUrl || '',
          liveStreamUrl: les.liveStreamUrl || '',
          thumbnailUrl: les.thumbnailUrl || '',
          durationMinutes: les.durationMinutes || '',
          scheduledDate: formatDateForInput(les.scheduledDate),
          endDate: formatDateForInput(les.endDate),
          maxCredits: les.maxCredits || 0,
          creditsForCompletion: les.creditsForCompletion || 0,
          creditsForTest: les.creditsForTest || 0,
          hasTest: les.hasTest || false,
          testPassingScore: les.testPassingScore || 60,
          requiresCompletion: les.requiresCompletion ?? true,
          isFree: les.isFree || false,
          isPublished: les.isPublished || false,
        });
      } catch (err) {
        console.error('Error loading lesson:', err);
        toast.error(t('editLesson.errors.loadFailed', 'Грешка при зареждане на урока'));
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (basicLesson?.slug) loadLesson();
  }, [basicLesson?.slug]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

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

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t('editLesson.errors.titleRequired', 'Заглавието е задължително');
    return errs;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...form,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        maxCredits: Number(form.maxCredits) || 0,
        creditsForCompletion: Number(form.creditsForCompletion) || 0,
        creditsForTest: Number(form.creditsForTest) || 0,
        testPassingScore: form.hasTest ? Number(form.testPassingScore) || 60 : null,
        scheduledDate: form.scheduledDate || null,
        endDate: form.endDate || null,
       videoUrl: form.videoUrl || '',
liveStreamUrl: form.liveStreamUrl || '',
thumbnailUrl: form.thumbnailUrl || '',
      };

      await updateLesson(courseSlug, basicLesson.slug, payload);
      setHasChanges(false);
      onClose();
    } catch (err) {
      console.error('Error saving lesson:', err);
      toast.error(t('editLesson.errors.saveFailed', 'Грешка при запазване'));
    } finally {
      setIsSaving(false);
    }
  };

  const showVideoFields = form.lessonType === 'video' || form.lessonType === 'live';

  return (
    <div className="elm-overlay" onClick={onClose}>
      <div className="elm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="elm-header">
          <h2 className="elm-header-title">
            {t('editLesson.title', 'Редактиране на урок')}
          </h2>
          <button className="elm-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="elm-loading">
            <Loader2 size={28} className="elm-spin" />
            <p>{t('editLesson.loading', 'Зареждане...')}</p>
          </div>
        ) : (
          <div className="elm-body">
            {/* === Section: Basic Info === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <FileText size={16} />
                {t('editLesson.sections.basicInfo', 'Основна информация')}
              </h3>

              {/* Title */}
              <div className={`elm-field ${errors.title ? 'elm-field-error' : ''}`}>
                <label className="elm-label">{t('editLesson.fields.title', 'Заглавие')} *</label>
                <input
                  type="text"
                  name="title"
                  className="elm-input"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={200}
                />
                {errors.title && <span className="elm-error-msg">{errors.title}</span>}
              </div>

              {/* Description */}
              <div className="elm-field">
                <label className="elm-label">{t('editLesson.fields.description', 'Описание')}</label>
                <textarea
                  name="description"
                  className="elm-textarea"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Lesson Type */}
              <div className="elm-field">
                <label className="elm-label">{t('editLesson.fields.lessonType', 'Тип урок')}</label>
                <div className="elm-type-selector">
                  {LESSON_TYPE_OPTIONS.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`elm-type-btn ${form.lessonType === value ? 'elm-type-btn-active' : ''}`}
                      onClick={() => updateField('lessonType', value)}
                    >
                      <Icon size={16} />
                      {t(`editLesson.lessonTypes.${value}`, value)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* === Section: Video === */}
            {showVideoFields && (
              <div className="elm-section">
                <h3 className="elm-section-title">
                  <Video size={16} />
                  {t('editLesson.sections.video', 'Видео настройки')}
                </h3>

                <div className="elm-row">
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.videoProvider', 'Доставчик')}</label>
                    <select name="videoProvider" className="elm-select" value={form.videoProvider} onChange={handleChange}>
                      {VIDEO_PROVIDER_OPTIONS.map((p) => (
                        <option key={p} value={p}>{t(`editLesson.videoProviders.${p}`, p)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.thumbnailUrl', 'Thumbnail URL')}</label>
                    <input type="url" name="thumbnailUrl" className="elm-input" value={form.thumbnailUrl} onChange={handleChange} placeholder="https://..." />
                  </div>
                </div>

                {form.lessonType === 'video' && (
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.videoUrl', 'Видео URL')}</label>
                    <input type="url" name="videoUrl" className="elm-input" value={form.videoUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
                  </div>
                )}

                {form.lessonType === 'live' && (
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.liveStreamUrl', 'Live Stream URL')}</label>
                    <input type="url" name="liveStreamUrl" className="elm-input" value={form.liveStreamUrl} onChange={handleChange} placeholder="https://meet.google.com/..." />
                  </div>
                )}
              </div>
            )}

            {/* === Section: Schedule === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <Calendar size={16} />
                {t('editLesson.sections.schedule', 'График и времетраене')}
              </h3>

              <div className="elm-row">
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.durationMinutes', 'Продължителност (мин)')}</label>
                  <input type="number" name="durationMinutes" className="elm-input" value={form.durationMinutes} onChange={handleChange} min={0} placeholder="0" />
                </div>
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.scheduledDate', 'Начална дата')}</label>
                  <input type="date" name="scheduledDate" className="elm-input" value={form.scheduledDate} onChange={handleChange} />
                </div>
              </div>

              <div className="elm-row">
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.endDate', 'Крайна дата')}</label>
                  <input type="date" name="endDate" className="elm-input" value={form.endDate} onChange={handleChange} />
                </div>
                <div className="elm-field" />
              </div>
            </div>

            {/* === Section: Credits === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <Award size={16} />
                {t('editLesson.sections.credits', 'Кредити')}
              </h3>

              <div className="elm-row elm-row-3">
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.maxCredits', 'Макс. кредити')}</label>
                  <input type="number" name="maxCredits" className="elm-input" value={form.maxCredits} onChange={handleChange} min={0} />
                </div>
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.creditsForCompletion', 'За завършване')}</label>
                  <input type="number" name="creditsForCompletion" className="elm-input" value={form.creditsForCompletion} onChange={handleChange} min={0} />
                </div>
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.creditsForTest', 'За тест')}</label>
                  <input type="number" name="creditsForTest" className="elm-input" value={form.creditsForTest} onChange={handleChange} min={0} />
                </div>
              </div>
            </div>

            {/* === Section: Test === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <HelpCircle size={16} />
                {t('editLesson.sections.test', 'Тест настройки')}
              </h3>

              <div className="elm-toggles">
                <label className="elm-toggle">
                  <input type="checkbox" name="hasTest" checked={form.hasTest} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">{t('editLesson.fields.hasTest', 'Има тест')}</span>
                </label>
              </div>

              {form.hasTest && (
                <div className="elm-row">
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.testPassingScore', 'Минимален резултат (%)')}</label>
                    <input type="number" name="testPassingScore" className="elm-input" value={form.testPassingScore} onChange={handleChange} min={0} max={100} />
                  </div>
                  <div className="elm-field" />
                </div>
              )}
            </div>

            {/* === Section: Settings === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <Shield size={16} />
                {t('editLesson.sections.settings', 'Настройки')}
              </h3>

              <div className="elm-toggles">
                <label className="elm-toggle">
                  <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">{t('editLesson.fields.isFree', 'Безплатен урок')}</span>
                </label>

                <label className="elm-toggle">
                  <input type="checkbox" name="requiresCompletion" checked={form.requiresCompletion} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">{t('editLesson.fields.requiresCompletion', 'Изисква завършване')}</span>
                </label>

                <label className="elm-toggle">
                  <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">
                    {form.isPublished
                      ? t('editLesson.fields.published', 'Публикуван')
                      : t('editLesson.fields.draft', 'Чернова')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isLoading && (
          <div className="elm-footer">
            <div className="elm-footer-left">
              {hasChanges && (
                <span className="elm-unsaved">{t('editLesson.unsavedChanges', '● Незапазени промени')}</span>
              )}
            </div>
            <div className="elm-footer-right">
              <button className="elm-btn elm-btn-cancel" onClick={onClose}>
                {t('editLesson.cancel', 'Отказ')}
              </button>
              <button
                className="elm-btn elm-btn-save"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? <Loader2 size={16} className="elm-spin" /> : <Save size={16} />}
                {t('editLesson.save', 'Запази')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditLessonModal;