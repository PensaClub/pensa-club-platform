// src/components/AdminAcademyLecturesList/EditLecture/EditLecture.jsx
// Prefix: elec-

import { useState, useRef } from 'react'; // НОВО
import { useTranslation } from 'react-i18next'; // НОВО
import {
    ArrowLeft, Save, Loader2, Send, EyeOff, Trash2,
    AlertCircle, Info, Video, Calendar, Globe, User,
    Users, Award, BookOpen, Wifi, Building, MapPin,
    RotateCcw, X, HelpCircle, FileText, Radio, Upload,
} from 'lucide-react'; // НОВО
import useEditLecture from '../../hooks/useEditLecture'; // НОВО
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { toast } from 'react-toastify';
import { AcademyMentorPicker } from '../../AcademyCourses/AcademyMentorPicker/AcademyMentorPicker'; // НОВО
import './editLecture.css'; // НОВО
import TestEditorModal from '../../AdminAcademyCoursesList/CourseContentManager/TestEditorModal/TestEditorModal';

const LECTURE_TYPES = ['lecture', 'webinar', 'workshop', 'masterclass']; // НОВО
const VIDEO_PROVIDERS = ['youtube', 'vimeo', 'zoom', 'meet', 'teams', 'custom']; // НОВО

const EditLecture = () => { // НОВО
    const { t } = useTranslation('academy-admin');

    const {
        lectureData,
        lectureId,
        lectureStatus,
        isPublished,
        assignedMentors, 
        setAssignedMentors, 
        slug,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        handleSaveAndStay,
        handleSaveAndBack,
        handlePublish,
        handleUnpublish,
        handleStartLive,
        handleStopLive,
        handleDelete,
        handleCancel,
        handleDiscardChanges,
        availableCourses,
        courseSearch,
        setCourseSearch,
        availableModules,
        showTestEditor,
        setShowTestEditor,
    } = useEditLecture();

    const [showDeleteModal, setShowDeleteModal] = useState(false); // НОВО
    const [youtubeUploading, setYoutubeUploading] = useState(false);
    const ytInputRef = useRef(null);
    const firebaseVideoRef = useRef(null);
    const { uploadToYouTube, deleteFromYouTube } = useAcademyCourses();
    const { uploadFile, uploading: firebaseUploading, uploadProgress: fbUploadProgress } = useFirebaseUpload();

    // =========================================================
    //                    HANDLERS
    // =========================================================

    const handleFirebaseVideoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        try {
            const result = await uploadFile(file, 'academy/videos/lectures');
            updateField('videoUrl', result.url);
            updateField('videoProvider', 'custom');
            toast.success('Видеото е качено');
        } catch (err) {
            console.error('Firebase upload error:', err);
            toast.error('Грешка при качване');
        }
    };

    const handleYouTubeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setYoutubeUploading(true);
        try {
            const formData = new FormData();
            formData.append('video', file);
            formData.append('title', lectureData.title || file.name);
            formData.append('privacyStatus', 'unlisted');
            const result = await uploadToYouTube(formData);
            if (result?.success && result?.videoUrl) {
                updateField('videoUrl', result.videoUrl);
                updateField('videoProvider', 'youtube');
                updateField('thumbnailUrl', `https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`);
                toast.success('Видеото е качено в YouTube');
            } else {
                toast.error(result?.message || 'Грешка при качване');
            }
        } catch (err) {
            toast.error('Грешка при качване в YouTube');
        } finally {
            setYoutubeUploading(false);
        }
    };

    const handleChange = (e) => { // НОВО
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            updateField(name, checked);
        } else if (type === 'number') {
            updateField(name, value === '' ? '' : Number(value));
        } else {
            updateField(name, value);
        }
    };

    // const handleMentorChange = (mentorData) => { // НОВО
    //     if (mentorData) {
    //         updateField('mentorId', mentorData.mentorId || mentorData.id);
    //         setSelectedMentorObj(mentorData.mentor || mentorData);
    //     } else {
    //         updateField('mentorId', null);
    //         setSelectedMentorObj(null);
    //     }
    // };

    const handleCourseSelect = (courseId) => { // НОВО
        updateField('courseId', courseId);
        updateField('moduleId', null); // reset модул при смяна на курс
        setCourseSearch('');
    };

    const handleClearCourse = () => { // НОВО
        updateField('courseId', null);
        updateField('moduleId', null);
    };

    const confirmDelete = async () => { // НОВО
        await handleDelete();
        setShowDeleteModal(false);
    };

    const renderError = (field) => // НОВО
        errors[field] ? (
            <span className="elec-error-msg"><AlertCircle size={14} /> {errors[field]}</span>
        ) : null;

    // =========================================================
    //                    LOADING
    // =========================================================

    if (isLoading) {
        return (
            <div className="elec-wrapper">
                <div className="elec-page-bg"><div className="elec-glow-orb" /></div>
                <div className="elec-loading">
                    <div className="elec-spinner" />
                    <p>{t('editLecture.loading', 'Зареждане на лекцията...')}</p>
                </div>
            </div>
        );
    }

    // =========================================================
    //                    RENDER
    // =========================================================

    return (
        <>
            <div className="elec-wrapper">
                <div className="elec-page-bg"><div className="elec-glow-orb" /></div>

                <div className="elec-container">
                    {/* ============================================= */}
                    {/* Header */}
                    {/* ============================================= */}
                    <div className="elec-header">
                        <button className="elec-back-btn" onClick={handleCancel}>
                            <ArrowLeft size={18} />
                            {t('editLecture.back', 'Назад')}
                        </button>
                        <div className="elec-header-info">
                            <h1 className="elec-title">
                                {t('editLecture.pageTitle', 'Редактиране на')}{' '}
                                <span className="elec-title-accent">{lectureData.title || slug}</span>
                            </h1>
                            <div className="elec-subtitle-row">
                                <p className="elec-subtitle">
                                    {t('editLecture.subtitle', 'Промяна на информация и настройки')}
                                </p>
                                {lectureStatus && (
                                    <span className={`elec-status-badge elec-status-${lectureStatus}`}>
                                        {t(`editLecture.statuses.${lectureStatus}`, lectureStatus)}
                                    </span>
                                )}
                                {isPublished && (
                                    <span className="elec-status-badge elec-status-published">
                                        {t('editLecture.statuses.published', 'Публикувана')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* Section 1 — Basic Info */}
                    {/* ============================================= */}
                    <div className="elec-section">
                        <h2 className="elec-section-title"><Info size={18} /> {t('editLecture.sections.basicInfo', 'Основна информация')}</h2>
                        <div className="elec-section-content">
                            <div className={`elec-field ${errors.title ? 'elec-field-error' : ''}`}>
                                <label className="elec-label">{t('editLecture.titleField', 'Заглавие')} <span className="elec-required">*</span></label>
                                <input type="text" name="title" className="elec-input" value={lectureData.title} onChange={handleChange} maxLength={200} />
                                {renderError('title')}
                                <span className="elec-char-count">{lectureData.title.length}/200</span>
                            </div>

                            <div className={`elec-field ${errors.shortDescription ? 'elec-field-error' : ''}`}>
                                <label className="elec-label">{t('editLecture.shortDescription', 'Кратко описание')}</label>
                                <textarea name="shortDescription" className="elec-textarea elec-textarea-sm" value={lectureData.shortDescription} onChange={handleChange} maxLength={500} rows={3} />
                                {renderError('shortDescription')}
                                <span className="elec-char-count">{(lectureData.shortDescription || '').length}/500</span>
                            </div>

                            <div className={`elec-field ${errors.description ? 'elec-field-error' : ''}`}>
                                <label className="elec-label">{t('editLecture.description', 'Описание')}</label>
                                <textarea name="description" className="elec-textarea" value={lectureData.description} onChange={handleChange} rows={6} />
                                {renderError('description')}
                            </div>

                            <div className="elec-row">
                                <div className={`elec-field ${errors.category ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.category', 'Категория')}</label>
                                    <input type="text" name="category" className="elec-input" value={lectureData.category} onChange={handleChange} maxLength={100} />
                                    {renderError('category')}
                                </div>
                                <div className={`elec-field ${errors.lectureType ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.lectureType', 'Тип')}</label>
                                    <select name="lectureType" className="elec-select" value={lectureData.lectureType} onChange={handleChange}>
                                        {LECTURE_TYPES.map((type) => (
                                            <option key={type} value={type}>{t(`editLecture.lectureTypes.${type}`, type)}</option>
                                        ))}
                                    </select>
                                    {renderError('lectureType')}
                                </div>
                            </div>

                            <div className={`elec-field ${errors.tags ? 'elec-field-error' : ''}`}>
                                <label className="elec-label">{t('editLecture.tags', 'Тагове')}</label>
                                <input type="text" name="tags" className="elec-input" value={lectureData.tags} onChange={handleChange} />
                                <span className="elec-hint">{t('editLecture.tagsHint', 'Разделени със запетая')}</span>
                                {renderError('tags')}
                            </div>
                            {/* Learning Points — НОВО */}
                            <div className="elec-field">
                                <label className="elec-label">
                                    {t('editLecture.learningPoints', 'Какво ще научите')}
                                </label>
                                <div className="elec-learning-points">
                                    {(lectureData.learningPoints || []).map((point, index) => (
                                        <div key={index} className="elec-learning-point">
                                            <span className="elec-learning-point-icon">✓</span>
                                            <input
                                                type="text"
                                                className="elec-input elec-learning-point-input"
                                                value={point}
                                                placeholder={t('editLecture.learningPointPlaceholder', 'Напр. Основни понятия и концепции')}
                                                onChange={(e) => {
                                                    const updated = [...lectureData.learningPoints];
                                                    updated[index] = e.target.value;
                                                    updateField('learningPoints', updated);
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="elec-learning-point-remove"
                                                onClick={() => {
                                                    const updated = lectureData.learningPoints.filter((_, i) => i !== index);
                                                    updateField('learningPoints', updated);
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {(lectureData.learningPoints || []).length < 10 && (
                                        <button
                                            type="button"
                                            className="elec-learning-point-add"
                                            onClick={() => {
                                                updateField('learningPoints', [...(lectureData.learningPoints || []), '']);
                                            }}
                                        >
                                            + {t('editLecture.addLearningPoint', 'Добави точка')}
                                        </button>
                                    )}
                                </div>
                                <span className="elec-hint">{t('editLecture.learningPointsHint', 'До 10 точки')}</span>
                            </div>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* Section 2 — Date & Location */}
                    {/* ============================================= */}
                    <div className="elec-section">
                        <h2 className="elec-section-title"><Calendar size={18} /> {t('editLecture.sections.dateLocation', 'Дата и място')}</h2>
                        <div className="elec-section-content">
                            <div className="elec-row">
                                <div className={`elec-field ${errors.scheduledDate ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.scheduledDate', 'Начало')} <span className="elec-required">*</span></label>
                                    <input type="datetime-local" name="scheduledDate" className="elec-input" value={lectureData.scheduledDate} onChange={handleChange} />
                                    {renderError('scheduledDate')}
                                </div>
                                <div className={`elec-field ${errors.scheduledEndDate ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.scheduledEndDate', 'Край')}</label>
                                    <input type="datetime-local" name="scheduledEndDate" className="elec-input" value={lectureData.scheduledEndDate} onChange={handleChange} />
                                    {renderError('scheduledEndDate')}
                                </div>
                            </div>

                            <div className="elec-row">
                                <div className={`elec-field ${errors.durationMinutes ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.durationMinutes', 'Продължителност (мин.)')}</label>
                                    <input type="number" name="durationMinutes" className="elec-input" value={lectureData.durationMinutes} onChange={handleChange} min={1} />
                                    {renderError('durationMinutes')}
                                </div>
                                <div className={`elec-field ${errors.timezone ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.timezone', 'Часова зона')}</label>
                                    <input type="text" name="timezone" className="elec-input" value={lectureData.timezone} onChange={handleChange} />
                                    {renderError('timezone')}
                                </div>
                            </div>

                            <div className="elec-location-toggle">
                                <button type="button" className={`elec-toggle-btn ${lectureData.isOnline ? 'elec-toggle-active' : ''}`} onClick={() => updateField('isOnline', true)}>
                                    <Wifi size={16} /> {t('editLecture.online', 'Онлайн')}
                                </button>
                                <button type="button" className={`elec-toggle-btn ${!lectureData.isOnline ? 'elec-toggle-active' : ''}`} onClick={() => updateField('isOnline', false)}>
                                    <Building size={16} /> {t('editLecture.offline', 'На място')}
                                </button>
                            </div>

                            {lectureData.isOnline && (
                                <div className="elec-row">
                                    <div className={`elec-field ${errors.meetingLink ? 'elec-field-error' : ''}`}>
                                        <label className="elec-label"><Globe size={14} /> {t('editLecture.meetingLink', 'Линк за среща')}</label>
                                        <input type="url" name="meetingLink" className="elec-input" value={lectureData.meetingLink} onChange={handleChange} />
                                        {renderError('meetingLink')}
                                    </div>
                                    <div className={`elec-field ${errors.meetingPassword ? 'elec-field-error' : ''}`}>
                                        <label className="elec-label">{t('editLecture.meetingPassword', 'Парола')}</label>
                                        <input type="text" name="meetingPassword" className="elec-input" value={lectureData.meetingPassword} onChange={handleChange} maxLength={100} />
                                        {renderError('meetingPassword')}
                                    </div>
                                </div>
                            )}

                            {!lectureData.isOnline && (
                                <div className="elec-row">
                                    <div className={`elec-field ${errors.location ? 'elec-field-error' : ''}`}>
                                        <label className="elec-label"><MapPin size={14} /> {t('editLecture.location', 'Място')}</label>
                                        <input type="text" name="location" className="elec-input" value={lectureData.location} onChange={handleChange} />
                                        {renderError('location')}
                                    </div>
                                    <div className={`elec-field ${errors.address ? 'elec-field-error' : ''}`}>
                                        <label className="elec-label">{t('editLecture.address', 'Адрес')}</label>
                                        <input type="text" name="address" className="elec-input" value={lectureData.address} onChange={handleChange} />
                                        {renderError('address')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* Section 3 — Video & Media */}
                    {/* ============================================= */}
                    <div className="elec-section">
                        <h2 className="elec-section-title"><Video size={18} /> {t('editLecture.sections.videoMedia', 'Видео и медия')}</h2>
                        <div className="elec-section-content">
                            <div className="elec-row">
                                <div className={`elec-field ${errors.videoProvider ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.videoProvider', 'Платформа')}</label>
                                    <select name="videoProvider" className="elec-select" value={lectureData.videoProvider} onChange={handleChange}>
                                        <option value="">— {t('editLecture.selectProvider', 'Избери')} —</option>
                                        {VIDEO_PROVIDERS.map((p) => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>
                                    {renderError('videoProvider')}
                                </div>
                                <div className={`elec-field ${errors.videoUrl ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.videoUrl', 'Видео URL')}</label>
                                    <input type="url" name="videoUrl" className="elec-input" placeholder="https://..." value={lectureData.videoUrl} onChange={handleChange} />
                                    {renderError('videoUrl')}
                                </div>
                            </div>

                            <div className={`elec-field ${errors.thumbnailUrl ? 'elec-field-error' : ''}`}>
                                <label className="elec-label">{t('editLecture.thumbnailUrl', 'Обложка (URL)')}</label>
                                <input type="url" name="thumbnailUrl" className="elec-input" placeholder="https://..." value={lectureData.thumbnailUrl} onChange={handleChange} />
                                {renderError('thumbnailUrl')}
                            </div>

                            {lectureData.thumbnailUrl && (
                                <div className="elec-preview">
                                    <img src={lectureData.thumbnailUrl} alt="" className="elec-preview-img" onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                            )}

                            {/* Video preview + remove */}
                            {lectureData.videoUrl && (
                                <div className="elec-video-preview">
                                    <span className="elec-video-preview-url">{lectureData.videoUrl}</span>
                                    <button type="button" className="elec-video-remove" onClick={async () => {
                                        if (lectureData.videoProvider === 'youtube' && lectureData.videoUrl) {
                                            try {
                                                const match = lectureData.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                                                if (match) await deleteFromYouTube(match[1]);
                                            } catch (err) { console.error('YT delete error:', err); }
                                        } else if (lectureData.videoUrl?.includes('firebasestorage.googleapis.com')) {
                                            try {
                                                const { deleteFileFromStorage } = await import('../../Articles/articleUtils/file-delete-utils');
                                                await deleteFileFromStorage(lectureData.videoUrl);
                                            } catch (err) { console.error('Firebase delete error:', err); }
                                        }
                                        updateField('videoUrl', '');
                                        updateField('videoProvider', '');
                                        updateField('thumbnailUrl', '');
                                    }}>
                                        <X size={14} /> Премахни видео
                                    </button>
                                </div>
                            )}

                            {/* Firebase upload */}
                            <button type="button" className="elec-upload-btn" onClick={() => firebaseVideoRef.current?.click()} disabled={firebaseUploading}>
                                <Upload size={16} />
                                {firebaseUploading ? `Качване... ${Math.round(Object.values(fbUploadProgress || {})[0] || 0)}%` : 'Качи видео файл'}
                            </button>
                            <input ref={firebaseVideoRef} type="file" accept=".mp4,.webm,.mov" style={{ display: 'none' }} onChange={handleFirebaseVideoUpload} />

                            <button type="button" className="elec-youtube-upload-btn" onClick={() => ytInputRef.current?.click()} disabled={youtubeUploading}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                {youtubeUploading ? 'Качване...' : 'Качи в YouTube'}
                            </button>
                            <input ref={ytInputRef} type="file" accept=".mp4,.webm,.mov" style={{ display: 'none' }} onChange={handleYouTubeUpload} />
                        </div>
                    </div>

                   {/* ============================================= */}
                    {/* Section 4 — Лектори */}
                    {/* ============================================= */}
                    <div className="elec-section">
                        <h2 className="elec-section-title"><Users size={18} /> {t('editLecture.sections.mentors', 'Лектори')}</h2>
                        <div className="elec-section-content">
                            <p className="elec-hint" style={{ marginBottom: 12 }}>
                                {t('editLecture.mentorsDesc', 'Добавете един или повече лектори. Първият е водещ.')}
                            </p>
                            <AcademyMentorPicker
                                mode="multi"
                                selected={assignedMentors}
                                onChange={(mentors) => {
                                    setAssignedMentors(mentors);
                                 
                                }}
                                placeholder={t('editLecture.mentorPlaceholder', 'Търси лектор по име...')}
                            />
                        </div>
                    </div>
                    {/* ============================================= */}
                    {/* Section 5 — Registration */}
                    {/* ============================================= */}
                    <div className="elec-section">
                        <h2 className="elec-section-title"><Users size={18} /> {t('editLecture.sections.registration', 'Записване')}</h2>
                        <div className="elec-section-content">
                            <div className={`elec-field ${errors.maxParticipants ? 'elec-field-error' : ''}`}>
                                <label className="elec-label">{t('editLecture.maxParticipants', 'Макс. участници')}</label>
                                <input type="number" name="maxParticipants" className="elec-input elec-input-sm" placeholder={t('editLecture.unlimited', 'Без ограничение')} value={lectureData.maxParticipants} onChange={handleChange} min={1} />
                                {renderError('maxParticipants')}
                            </div>

                            <div className="elec-toggles">
                                <label className="elec-toggle">
                                    <input type="checkbox" name="requiresRegistration" checked={lectureData.requiresRegistration} onChange={handleChange} />
                                    <span className="elec-toggle-slider" />
                                    <span className="elec-toggle-text">{t('editLecture.requiresRegistration', 'Изисква записване')}</span>
                                </label>
                                <label className="elec-toggle">
                                    <input type="checkbox" name="isPublic" checked={lectureData.isPublic} onChange={handleChange} />
                                    <span className="elec-toggle-slider" />
                                    <span className="elec-toggle-text">{t('editLecture.isPublic', 'Публична')}</span>
                                </label>
                                <label className="elec-toggle">
                                    <input type="checkbox" name="isFree" checked={lectureData.isFree} onChange={handleChange} />
                                    <span className="elec-toggle-slider" />
                                    <span className="elec-toggle-text">{t('editLecture.isFree', 'Безплатна')}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* Section 6 — Credits & Test */}
                    {/* ============================================= */}
                    <div className="elec-section">
                        <h2 className="elec-section-title"><Award size={18} /> {t('editLecture.sections.credits', 'Кредити и тест')}</h2>
                        <div className="elec-section-content">
                            <div className="elec-row">
                                <div className={`elec-field ${errors.maxCredits ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.maxCredits', 'Макс. кредити')}</label>
                                    <input type="number" name="maxCredits" className="elec-input" value={lectureData.maxCredits} onChange={handleChange} min={0} />
                                    {renderError('maxCredits')}
                                </div>
                                <div className={`elec-field ${errors.creditsForAttendance ? 'elec-field-error' : ''}`}>
                                    <label className="elec-label">{t('editLecture.creditsForAttendance', 'За присъствие')}</label>
                                    <input type="number" name="creditsForAttendance" className="elec-input" value={lectureData.creditsForAttendance} onChange={handleChange} min={0} />
                                    {renderError('creditsForAttendance')}
                                </div>
                            </div>

                            <div className="elec-toggles">
                                <label className="elec-toggle">
                                    <input type="checkbox" name="hasTest" checked={lectureData.hasTest} onChange={handleChange} />
                                    <span className="elec-toggle-slider" />
                                    <span className="elec-toggle-text">{t('editLecture.hasTest', 'Има тест')}</span>
                                </label>
                            </div>

                            {lectureData.hasTest && (
                                <>
                                    <div className="elec-row elec-test-fields">
                                        <div className={`elec-field ${errors.creditsForTest ? 'elec-field-error' : ''}`}>
                                            <label className="elec-label">{t('editLecture.creditsForTest', 'За тест')}</label>
                                            <input type="number" name="creditsForTest" className="elec-input" value={lectureData.creditsForTest} onChange={handleChange} min={0} />
                                            {renderError('creditsForTest')}
                                        </div>
                                        <div className={`elec-field ${errors.testPassingScore ? 'elec-field-error' : ''}`}>
                                            <label className="elec-label">{t('editLecture.testPassingScore', 'Минимален резултат (%)')}</label>
                                            <input type="number" name="testPassingScore" className="elec-input" value={lectureData.testPassingScore} onChange={handleChange} min={0} max={100} />
                                            {renderError('testPassingScore')}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="elec-btn elec-btn-test-editor"
                                        onClick={() => setShowTestEditor(true)}
                                    >
                                        <FileText size={16} />
                                        {t('editLecture.manageTest', 'Управлявай тест')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* Section 7 — Connected Course & Module */}
                    {/* ============================================= */}
                    <div className="elec-section">
                        <h2 className="elec-section-title"><BookOpen size={18} /> {t('editLecture.sections.course', 'Свързан курс')}</h2>
                        <div className="elec-section-content">
                            <p className="elec-section-desc">
                                {t('editLecture.courseDesc', 'Ако лекцията е част от курс, изберете го тук. Може да я закачите и към конкретен модул.')}
                            </p>

                            {/* Курс */}
                            {lectureData.courseId ? (
                                <div className="elec-course-selected">
                                    <div className="elec-course-selected-info">
                                        <BookOpen size={16} />
                                        <span className="elec-course-selected-name">
                                            {availableCourses.find(c => c.id === lectureData.courseId)?.name || `Курс #${lectureData.courseId}`}
                                        </span>
                                    </div>
                                    <button type="button" className="elec-course-clear-btn" onClick={handleClearCourse}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        className="elec-input"
                                        placeholder={t('editLecture.courseSearchPlaceholder', 'Търси курс по име...')}
                                        value={courseSearch}
                                        onChange={(e) => setCourseSearch(e.target.value)}
                                    />
                                    {availableCourses.length > 0 && courseSearch.trim() && (
                                        <div className="elec-course-dropdown">
                                            {availableCourses.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    className="elec-course-option"
                                                    onClick={() => handleCourseSelect(c.id)}
                                                >
                                                    <span className="elec-course-option-name">{c.name}</span>
                                                    <span className="elec-course-option-cat">{c.category || ''}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Модул — показва се само ако има избран курс */}
                            {lectureData.courseId && ( // НОВО
                                <div className="elec-field elec-module-field">
                                    <label className="elec-label">{t('editLecture.module', 'Модул (незадължително)')}</label>
                                    <select
                                        name="moduleId"
                                        className="elec-select"
                                        value={lectureData.moduleId || ''}
                                        onChange={(e) => updateField('moduleId', e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">{t('editLecture.noModule', '— Самостоятелна (без модул) —')}</option>
                                        {availableModules.map((m) => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                    <span className="elec-hint">{t('editLecture.moduleHint', 'Оставете празно ако лекцията е директно към курса')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================= */}
                {/* Fixed Footer */}
                {/* ============================================= */}
                <div className="elec-footer">
                    <div className="elec-footer-left">
                        {hasChanges && (
                            <span className="elec-unsaved">
                                {t('editLecture.unsavedChanges', '● Незапазени промени')}
                            </span>
                        )}
                    </div>
                    <div className="elec-footer-right">
                        {hasChanges && (
                            <button className="elec-btn elec-btn-discard" onClick={handleDiscardChanges} disabled={isSaving}>
                                <RotateCcw size={16} />
                                <span className="elec-btn-label-desktop">{t('editLecture.discard', 'Отхвърли')}</span>
                            </button>
                        )}

                        <button className="elec-btn elec-btn-cancel" onClick={handleCancel} disabled={isSaving}>
                            {t('editLecture.cancel', 'Отказ')}
                        </button>

                        {/* Start / Stop Live */}
                        {lectureStatus !== 'live' && lectureStatus !== 'cancelled' && isPublished && (
                            <button className="elec-btn elec-btn-live" onClick={handleStartLive} disabled={isSaving}>
                                <Radio size={16} />
                                <span className="elec-btn-label-desktop">{t('editLecture.startLive', 'На живо')}</span>
                            </button>
                        )}
                        {lectureStatus === 'live' && (
                            <button className="elec-btn elec-btn-stop-live" onClick={handleStopLive} disabled={isSaving}>
                                <Radio size={16} />
                                <span className="elec-btn-label-desktop">{t('editLecture.stopLive', 'Спри на живо')}</span>
                            </button>
                        )}

                        <button className="elec-btn elec-btn-delete" onClick={() => setShowDeleteModal(true)} disabled={isSaving}>
                            <Trash2 size={16} />
                            <span className="elec-btn-label-desktop">{t('editLecture.delete', 'Изтрий')}</span>
                        </button>

                        {isPublished && (
                            <button className="elec-btn elec-btn-unpublish" onClick={handleUnpublish} disabled={isSaving}>
                                <EyeOff size={16} />
                                <span className="elec-btn-label-desktop">{t('editLecture.unpublish', 'Скрий')}</span>
                            </button>
                        )}

                        <button className="elec-btn elec-btn-save-stay" onClick={handleSaveAndStay} disabled={isSaving || !hasChanges}>
                            {isSaving ? <Loader2 size={16} className="elec-spin" /> : <Save size={16} />}
                            <span className="elec-btn-label-desktop">{t('editLecture.saveAndStay', 'Запази')}</span>
                        </button>

                        <button className="elec-btn elec-btn-save-back" onClick={handleSaveAndBack} disabled={isSaving || !hasChanges}>
                            {isSaving ? <Loader2 size={16} className="elec-spin" /> : <Save size={16} />}
                            <span className="elec-btn-label-desktop">{t('editLecture.saveAndBack', 'Запази и назад')}</span>
                        </button>

                        {!isPublished && (
                            <button className="elec-btn elec-btn-publish" onClick={handlePublish} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="elec-spin" /> : <Send size={16} />}
                                <span className="elec-btn-label-desktop">{t('editLecture.publish', 'Публикувай')}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ============================================= */}
                {/* Delete Confirmation Modal */}
                {/* ============================================= */}
                {showDeleteModal && (
                    <div className="elec-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="elec-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="elec-modal-icon"><Trash2 size={28} /></div>
                            <h3 className="elec-modal-title">{t('editLecture.deleteTitle', 'Изтриване на лекция')}</h3>
                            <p className="elec-modal-text">
                                {t('editLecture.deleteConfirm', 'Сигурни ли сте, че искате да изтриете тази лекция? Това действие е необратимо.')}
                            </p>
                            <div className="elec-modal-actions">
                                <button className="elec-btn elec-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                    {t('editLecture.cancelDelete', 'Отказ')}
                                </button>
                                <button className="elec-btn elec-btn-delete-confirm" onClick={confirmDelete} disabled={isSaving}>
                                    {isSaving ? <Loader2 size={16} className="elec-spin" /> : <Trash2 size={16} />}
                                    {t('editLecture.confirmDelete', 'Изтрий')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================= */}
            {/* Test Editor Modal */}
            {/* ============================================= */}
            <TestEditorModal
                isOpen={showTestEditor}
                onClose={() => setShowTestEditor(false)}
                lectureId={lectureId}
                entityTitle={lectureData.title}
            />
        </>
    );
};

export default EditLecture;