// src/components/AdminAcademyCoursesList/CourseContentManager/EditLessonModal/EditLessonModal.jsx
// Prefix: elm-

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Save,
  Loader2,
  Video,
  FileText,
  Radio,
  HelpCircle,
  Calendar,
  Award,
  Shield,
  Paperclip,
  Plus,
  Trash2,
  Link,
  Upload,
  File,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image,
  Music,
  FileSpreadsheet,
  Code,
  Archive,
} from 'lucide-react';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import { useFirebaseUpload } from '../../../hooks/useFirebaseUpload';
import { toast } from 'react-toastify';
import './editLessonModal.css';

const LESSON_TYPE_OPTIONS = [
  { value: 'video', icon: Video },
  { value: 'text', icon: FileText },
  { value: 'live', icon: Radio },
  { value: 'quiz', icon: HelpCircle },
];

const VIDEO_PROVIDER_OPTIONS = ['youtube', 'vimeo', 'custom', 'none'];

const MATERIAL_TYPE_OPTIONS = [
  { value: 'pdf', icon: FileText },
  { value: 'document', icon: File },
  { value: 'video', icon: Video },
  { value: 'presentation', icon: FileText },
  { value: 'image', icon: Image },
  { value: 'audio', icon: Music },
  { value: 'spreadsheet', icon: FileSpreadsheet },
  { value: 'code', icon: Code },
  { value: 'archive', icon: Archive },
  { value: 'link', icon: Link },
  { value: 'other', icon: File },
];

const ACCEPTED_FILE_TYPES = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.mp4', '.webm', '.avi', '.mov',
  '.mp3', '.wav', '.ogg',
  '.zip', '.rar', '.7z',
  '.txt', '.csv', '.json', '.html', '.css', '.js',
].join(',');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Auto-detect materialType от MIME type / extension */
const detectMaterialType = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  const mime = file.type || '';

  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext) || mime.includes('word') || mime.includes('text/plain')) return 'document';
  if (['ppt', 'pptx', 'odp'].includes(ext) || mime.includes('presentation')) return 'presentation';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('csv')) return 'spreadsheet';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext) || mime.startsWith('image/')) return 'image';
  if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext) || mime.startsWith('video/')) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext) || mime.startsWith('audio/')) return 'audio';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('archive')) return 'archive';
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'html', 'css', 'json', 'xml'].includes(ext)) return 'code';

  return 'other';
};

const EditLessonModal = ({ lesson: basicLesson, courseSlug, onClose }) => {
  const { t } = useTranslation();
  const {
    getLessonBySlug,
    updateLesson,
    getLessonMaterials,
    addLessonMaterial,
    deleteLessonMaterial,
  } = useAcademyCourses();
  const { uploadFile, uploading, uploadProgress } = useFirebaseUpload();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [lessonId, setLessonId] = useState(null);
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

  // === MATERIALS STATE ===
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsExpanded, setMaterialsExpanded] = useState(true);
  const [deletingMaterialId, setDeletingMaterialId] = useState(null);

  // Add material mode: 'none' | 'upload' | 'link'
  const [addMode, setAddMode] = useState('none');
  const [fileUploadProgress, setFileUploadProgress] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Link form state
  const [linkForm, setLinkForm] = useState({
    title: '',
    description: '',
    materialType: 'link',
    externalUrl: '',
    isDownloadable: false,
  });
  const [linkErrors, setLinkErrors] = useState({});
  const [addingLink, setAddingLink] = useState(false);

  // =========================================================
  //                    LOAD LESSON + MATERIALS
  // =========================================================

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        const data = await getLessonBySlug(courseSlug, basicLesson.slug);
        const les = data.lesson || data;

        setLessonId(les.id);

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

        await loadMaterials();
      } catch (err) {
        console.error('Error loading lesson:', err);
        toast.error(t('editLesson.errors.loadFailed'));
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (basicLesson?.slug) loadLesson();
  }, [basicLesson?.slug]);

  const loadMaterials = async () => {
    try {
      setMaterialsLoading(true);
      const data = await getLessonMaterials(basicLesson.slug);
      setMaterials(data || []);
    } catch (err) {
      console.error('Error loading materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // =========================================================
  //                    FORM HANDLERS
  // =========================================================

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') updateField(name, checked);
    else if (type === 'number') updateField(name, value === '' ? '' : Number(value));
    else updateField(name, value);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t('editLesson.errors.titleRequired');
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
      toast.error(t('editLesson.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  //                    FILE UPLOAD (Firebase)
  // =========================================================

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t('editLesson.materials.errors.fileTooLarge', { name: file.name }));
        continue;
      }

      try {
        const materialType = detectMaterialType(file);
        const storagePath = `academy/materials/lessons/${basicLesson.slug}`;

        setFileUploadProgress({ fileName: file.name, progress: 0 });

        const result = await uploadFile(file, storagePath, (progress) => {
          setFileUploadProgress({ fileName: file.name, progress: Math.round(progress) });
        });

        // Save to DB
        const payload = {
          title: file.name.replace(/\.[^.]+$/, ''),
          materialType,
          fileUrl: result.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isDownloadable: true,
        };

        await addLessonMaterial(basicLesson.slug, payload);
        await loadMaterials();

        toast.success(t('editLesson.materials.uploadSuccess', { name: file.name }));
      } catch (err) {
        console.error('Error uploading file:', err);
        toast.error(t('editLesson.materials.errors.uploadFailed', { name: file.name }));
      } finally {
        setFileUploadProgress(null);
      }
    }

    setAddMode('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // =========================================================
  //                    LINK / EXTERNAL URL
  // =========================================================

  const handleLinkChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLinkForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (linkErrors[name]) {
      setLinkErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validateLink = () => {
    const errs = {};
    if (!linkForm.title.trim()) errs.title = t('editLesson.materials.errors.titleRequired');
    if (!linkForm.externalUrl.trim()) errs.externalUrl = t('editLesson.materials.errors.urlRequired');
    return errs;
  };

  const handleAddLink = async () => {
    const validationErrors = validateLink();
    if (Object.keys(validationErrors).length > 0) {
      setLinkErrors(validationErrors);
      return;
    }

    try {
      setAddingLink(true);
      const payload = {
        title: linkForm.title.trim(),
        description: linkForm.description.trim() || undefined,
        materialType: linkForm.materialType,
        externalUrl: linkForm.externalUrl.trim(),
        isDownloadable: linkForm.isDownloadable,
      };

      await addLessonMaterial(basicLesson.slug, payload);
      setLinkForm({ title: '', description: '', materialType: 'link', externalUrl: '', isDownloadable: false });
      setLinkErrors({});
      setAddMode('none');
      await loadMaterials();
    } catch (err) {
      console.error('Error adding link:', err);
    } finally {
      setAddingLink(false);
    }
  };

  // =========================================================
  //                    DELETE MATERIAL
  // =========================================================

  const handleDeleteMaterial = async (materialId) => {
    if (!lessonId) return;

    try {
      setDeletingMaterialId(materialId);
      await deleteLessonMaterial(lessonId, materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    } catch (err) {
      console.error('Error deleting material:', err);
    } finally {
      setDeletingMaterialId(null);
    }
  };

  // =========================================================
  //                    HELPERS
  // =========================================================

  const getMaterialTypeIcon = (type) => {
    const found = MATERIAL_TYPE_OPTIONS.find((o) => o.value === type);
    return found ? found.icon : File;
  };

  const showVideoFields = form.lessonType === 'video' || form.lessonType === 'live';

  // =========================================================
  //                    RENDER
  // =========================================================

  return (
    <div className="elm-overlay" onClick={onClose}>
      <div className="elm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="elm-header">
          <h2 className="elm-header-title">{t('editLesson.title')}</h2>
          <button className="elm-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="elm-loading">
            <Loader2 size={28} className="elm-spin" />
            <p>{t('editLesson.loading')}</p>
          </div>
        ) : (
          <div className="elm-body">

            {/* === Section: Basic Info === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <FileText size={16} />
                {t('editLesson.sections.basicInfo')}
              </h3>

              <div className={`elm-field ${errors.title ? 'elm-field-error' : ''}`}>
                <label className="elm-label">{t('editLesson.fields.title')} *</label>
                <input type="text" name="title" className="elm-input" value={form.title} onChange={handleChange} placeholder={t('editLesson.placeholders.title')} />
                {errors.title && <span className="elm-error-msg">{errors.title}</span>}
              </div>

              <div className="elm-field">
                <label className="elm-label">{t('editLesson.fields.description')}</label>
                <textarea name="description" className="elm-textarea" value={form.description} onChange={handleChange} rows={3} placeholder={t('editLesson.placeholders.description')} />
              </div>

              <div className="elm-field">
                <label className="elm-label">{t('editLesson.fields.lessonType')}</label>
                <div className="elm-type-selector">
                  {LESSON_TYPE_OPTIONS.map(({ value, icon: Icon }) => (
                    <button key={value} type="button" className={`elm-type-btn ${form.lessonType === value ? 'elm-type-btn-active' : ''}`} onClick={() => updateField('lessonType', value)}>
                      <Icon size={16} />
                      {t(`editLesson.lessonTypes.${value}`)}
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
                  {t('editLesson.sections.video')}
                </h3>

                <div className="elm-row">
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.videoProvider')}</label>
                    <select name="videoProvider" className="elm-select" value={form.videoProvider} onChange={handleChange}>
                      {VIDEO_PROVIDER_OPTIONS.map((p) => (
                        <option key={p} value={p}>{t(`editLesson.videoProviders.${p}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.thumbnailUrl')}</label>
                    <input type="url" name="thumbnailUrl" className="elm-input" value={form.thumbnailUrl} onChange={handleChange} placeholder="https://..." />
                  </div>
                </div>

                {form.lessonType === 'video' && (
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.videoUrl')}</label>
                    <input type="url" name="videoUrl" className="elm-input" value={form.videoUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
                  </div>
                )}

                {form.lessonType === 'live' && (
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.liveStreamUrl')}</label>
                    <input type="url" name="liveStreamUrl" className="elm-input" value={form.liveStreamUrl} onChange={handleChange} placeholder="https://meet.google.com/..." />
                  </div>
                )}
              </div>
            )}

            {/* === Section: Schedule === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <Calendar size={16} />
                {t('editLesson.sections.schedule')}
              </h3>

              <div className="elm-row">
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.durationMinutes')}</label>
                  <input type="number" name="durationMinutes" className="elm-input" value={form.durationMinutes} onChange={handleChange} min={0} placeholder="0" />
                </div>
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.scheduledDate')}</label>
                  <input type="date" name="scheduledDate" className="elm-input" value={form.scheduledDate} onChange={handleChange} />
                </div>
              </div>

              <div className="elm-row">
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.endDate')}</label>
                  <input type="date" name="endDate" className="elm-input" value={form.endDate} onChange={handleChange} />
                </div>
                <div className="elm-field" />
              </div>
            </div>

            {/* === Section: Credits === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <Award size={16} />
                {t('editLesson.sections.credits')}
              </h3>

              <div className="elm-row elm-row-3">
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.maxCredits')}</label>
                  <input type="number" name="maxCredits" className="elm-input" value={form.maxCredits} onChange={handleChange} min={0} />
                </div>
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.creditsForCompletion')}</label>
                  <input type="number" name="creditsForCompletion" className="elm-input" value={form.creditsForCompletion} onChange={handleChange} min={0} />
                </div>
                <div className="elm-field">
                  <label className="elm-label">{t('editLesson.fields.creditsForTest')}</label>
                  <input type="number" name="creditsForTest" className="elm-input" value={form.creditsForTest} onChange={handleChange} min={0} />
                </div>
              </div>
            </div>

            {/* === Section: Test === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <HelpCircle size={16} />
                {t('editLesson.sections.test')}
              </h3>

              <div className="elm-toggles">
                <label className="elm-toggle">
                  <input type="checkbox" name="hasTest" checked={form.hasTest} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">{t('editLesson.fields.hasTest')}</span>
                </label>
              </div>

              {form.hasTest && (
                <div className="elm-row" style={{ marginTop: 14 }}>
                  <div className="elm-field">
                    <label className="elm-label">{t('editLesson.fields.testPassingScore')}</label>
                    <input type="number" name="testPassingScore" className="elm-input" value={form.testPassingScore} onChange={handleChange} min={0} max={100} />
                  </div>
                  <div className="elm-field" />
                </div>
              )}
            </div>

            {/* ============================================= */}
            {/* === Section: MATERIALS === */}
            {/* ============================================= */}
            <div className="elm-section">
              <div className="elm-section-title elm-section-title-clickable" onClick={() => setMaterialsExpanded((p) => !p)}>
                <Paperclip size={16} />
                {t('editLesson.sections.materials')}
                <span className="elm-materials-count">{materials.length}</span>
                <span className="elm-expand-icon">
                  {materialsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>

              {materialsExpanded && (
                <div className="elm-materials-wrapper">
                  {/* Auto-save notice */}
                  <div className="elm-materials-autosave">
                    <Save size={12} />
                    {t('editLesson.materials.autosave')}
                  </div>

                  {/* Materials List */}
                  {materialsLoading ? (
                    <div className="elm-materials-loading">
                      <Loader2 size={18} className="elm-spin" />
                      <span>{t('editLesson.materials.loading')}</span>
                    </div>
                  ) : materials.length === 0 && addMode === 'none' ? (
                    <div className="elm-materials-empty">
                      <Paperclip size={20} />
                      <p>{t('editLesson.materials.empty')}</p>
                    </div>
                  ) : (
                    <div className="elm-materials-list">
                      {materials.map((mat) => {
                        const TypeIcon = getMaterialTypeIcon(mat.materialType);
                        const isDeleting = deletingMaterialId === mat.id;
                        const url = mat.fileUrl || mat.externalUrl;

                        return (
                          <div key={mat.id} className="elm-material-item">
                            <div className="elm-material-icon">
                              <TypeIcon size={16} />
                            </div>
                            <div className="elm-material-info">
                              <span className="elm-material-title">{mat.title}</span>
                              <div className="elm-material-meta">
                                <span className="elm-material-type-badge">
                                  {t(`editLesson.materials.types.${mat.materialType}`, mat.materialType)}
                                </span>
                                {mat.fileSize > 0 && (
                                  <span className="elm-material-size">{formatFileSize(mat.fileSize)}</span>
                                )}
                                {url && (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="elm-material-link" title={t('editLesson.materials.open')}>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                            <button className="elm-material-delete" onClick={() => handleDeleteMaterial(mat.id)} disabled={isDeleting} title={t('editLesson.materials.delete')}>
                              {isDeleting ? <Loader2 size={14} className="elm-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upload progress */}
                  {fileUploadProgress && (
                    <div className="elm-upload-progress">
                      <div className="elm-upload-progress-info">
                        <Upload size={14} />
                        <span className="elm-upload-progress-name">{fileUploadProgress.fileName}</span>
                        <span className="elm-upload-progress-pct">{fileUploadProgress.progress}%</span>
                      </div>
                      <div className="elm-upload-progress-bar">
                        <div className="elm-upload-progress-fill" style={{ width: `${fileUploadProgress.progress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* === ADD MODE: Upload === */}
                  {addMode === 'upload' && !fileUploadProgress && (
                    <div
                      className={`elm-dropzone ${isDragOver ? 'elm-dropzone-active' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={24} />
                      <p className="elm-dropzone-title">{t('editLesson.materials.dropzoneTitle')}</p>
                      <p className="elm-dropzone-subtitle">{t('editLesson.materials.dropzoneSubtitle')}</p>
                      <p className="elm-dropzone-limit">{t('editLesson.materials.maxFileSize')}</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="elm-file-input"
                        accept={ACCEPTED_FILE_TYPES}
                        multiple
                        onChange={handleFileInputChange}
                      />
                    </div>
                  )}

                  {/* === ADD MODE: Link === */}
                  {addMode === 'link' && (
                    <div className="elm-link-form">
                      <div className="elm-link-form-header">
                        <h4 className="elm-link-form-title">
                          <Link size={14} />
                          {t('editLesson.materials.addLink')}
                        </h4>
                      </div>

                      <div className={`elm-field ${linkErrors.title ? 'elm-field-error' : ''}`}>
                        <label className="elm-label">{t('editLesson.materials.fields.title')} *</label>
                        <input type="text" name="title" className="elm-input" value={linkForm.title} onChange={handleLinkChange} placeholder={t('editLesson.materials.placeholders.linkTitle')} />
                        {linkErrors.title && <span className="elm-error-msg">{linkErrors.title}</span>}
                      </div>

                      <div className={`elm-field ${linkErrors.externalUrl ? 'elm-field-error' : ''}`}>
                        <label className="elm-label">{t('editLesson.materials.fields.url')} *</label>
                        <input type="url" name="externalUrl" className="elm-input" value={linkForm.externalUrl} onChange={handleLinkChange} placeholder="https://docs.google.com/..." />
                        {linkErrors.externalUrl && <span className="elm-error-msg">{linkErrors.externalUrl}</span>}
                      </div>

                      <div className="elm-field">
                        <label className="elm-label">{t('editLesson.materials.fields.type')}</label>
                        <div className="elm-material-type-selector">
                          {MATERIAL_TYPE_OPTIONS.map(({ value, icon: Icon }) => (
                            <button key={value} type="button" className={`elm-mat-type-btn ${linkForm.materialType === value ? 'elm-mat-type-btn-active' : ''}`} onClick={() => setLinkForm((p) => ({ ...p, materialType: value }))}>
                              <Icon size={13} />
                              {t(`editLesson.materials.types.${value}`, value)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="elm-field">
                        <label className="elm-label">{t('editLesson.materials.fields.description')}</label>
                        <textarea name="description" className="elm-textarea elm-textarea-sm" value={linkForm.description} onChange={handleLinkChange} rows={2} placeholder={t('editLesson.materials.placeholders.description')} />
                      </div>

                      <div className="elm-link-form-actions">
                        <button className="elm-btn elm-btn-cancel elm-btn-sm" onClick={() => { setAddMode('none'); setLinkErrors({}); }}>
                          {t('editLesson.materials.cancel')}
                        </button>
                        <button className="elm-btn elm-btn-add elm-btn-sm" onClick={handleAddLink} disabled={addingLink}>
                          {addingLink ? <Loader2 size={14} className="elm-spin" /> : <Plus size={14} />}
                          {t('editLesson.materials.add')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Buttons */}
                  {addMode === 'none' && !fileUploadProgress && (
                    <div className="elm-add-material-buttons">
                      <button className="elm-add-material-btn" onClick={() => setAddMode('upload')}>
                        <Upload size={15} />
                        {t('editLesson.materials.uploadFile')}
                      </button>
                      <button className="elm-add-material-btn" onClick={() => setAddMode('link')}>
                        <Link size={15} />
                        {t('editLesson.materials.addExternalLink')}
                      </button>
                    </div>
                  )}

                  {/* Cancel add mode button */}
                  {addMode === 'upload' && !fileUploadProgress && (
                    <button className="elm-cancel-add-btn" onClick={() => setAddMode('none')}>
                      {t('editLesson.materials.cancel')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* === Section: Settings === */}
            <div className="elm-section">
              <h3 className="elm-section-title">
                <Shield size={16} />
                {t('editLesson.sections.settings')}
              </h3>

              <div className="elm-toggles">
                <label className="elm-toggle">
                  <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">{t('editLesson.fields.isFree')}</span>
                </label>
                <label className="elm-toggle">
                  <input type="checkbox" name="requiresCompletion" checked={form.requiresCompletion} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">{t('editLesson.fields.requiresCompletion')}</span>
                </label>
                <label className="elm-toggle">
                  <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                  <span className="elm-toggle-slider" />
                  <span className="elm-toggle-text">
                    {form.isPublished ? t('editLesson.fields.published') : t('editLesson.fields.draft')}
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
              {hasChanges && <span className="elm-unsaved">{t('editLesson.unsavedChanges')}</span>}
            </div>
            <div className="elm-footer-right">
              <button className="elm-btn elm-btn-cancel" onClick={onClose}>{t('editLesson.cancel')}</button>
              <button className="elm-btn elm-btn-save" onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving ? <Loader2 size={16} className="elm-spin" /> : <Save size={16} />}
                {t('editLesson.save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditLessonModal;