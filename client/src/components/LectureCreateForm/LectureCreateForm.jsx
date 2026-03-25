// src/components/LectureCreateForm/LectureCreateForm.jsx
// Prefix: lcf-

import { useTranslation } from 'react-i18next';
import {
    Save,
    Send,
    ArrowLeft,
    AlertCircle,
    Info,
    Video,
    Calendar,
    MapPin,
    Globe,
    User,
    Users,
    Award,
    BookOpen,
    Wifi,
    Building,
    Upload,
    X,
} from 'lucide-react';
import { useState, useRef } from 'react';
import useLectureCreateForm from '../hooks/useLectureCreateForm';
import { AcademyMentorPicker } from '../AcademyCourses/AcademyMentorPicker/AcademyMentorPicker';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useFirebaseUpload } from '../hooks/useFirebaseUpload';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { toast } from 'react-toastify';
import './lectureCreateForm.css';

const LECTURE_TYPES = ['lecture', 'webinar', 'workshop', 'masterclass'];
const VIDEO_PROVIDERS = ['youtube', 'vimeo', 'zoom', 'meet', 'teams', 'custom'];

const LectureCreateForm = () => {
    const { t } = useTranslation('academy-admin');
    const navigate = useLocalizedNavigate();
    const { uploadFile, uploading: firebaseUploading, uploadProgress: fbUploadProgress } = useFirebaseUpload();
    const { uploadToYouTube, deleteFromYouTube } = useAcademyCourses();
    const firebaseVideoRef = useRef(null);
    const ytInputRef = useRef(null);
    const [youtubeUploading, setYoutubeUploading] = useState(false);

     const {
        isEditMode,
        lectureData,
        assignedMentors, 
        setAssignedMentors,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        handleSaveDraft,
        handlePublish,
        availableCourses,
        courseSearch,
        setCourseSearch,
        availableModules, 
    } = useLectureCreateForm();

    // =========================================================
    //                    HANDLERS
    // =========================================================

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
            formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
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

    const handleRemoveVideo = async () => {
        if (lectureData.videoProvider === 'youtube' && lectureData.videoUrl) {
            try {
                const match = lectureData.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                if (match) await deleteFromYouTube(match[1]);
            } catch (err) { console.error('YT delete error:', err); }
        } else if (lectureData.videoUrl?.includes('firebasestorage.googleapis.com')) {
            try {
                const { deleteFileFromStorage } = await import('../Articles/articleUtils/file-delete-utils');
                await deleteFileFromStorage(lectureData.videoUrl);
            } catch (err) { console.error('Firebase delete error:', err); }
        }
        updateField('videoUrl', '');
        updateField('videoProvider', '');
        updateField('thumbnailUrl', '');
    };

    // const handleMentorChange = (mentorData) => {
    //     if (mentorData) {
    //         updateField('mentorId', mentorData.mentorId || mentorData.id);
    //         setSelectedMentorObj(mentorData.mentor || mentorData);
    //     } else {
    //         updateField('mentorId', null);
    //         setSelectedMentorObj(null);
    //     }
    // };

    // =========================================================
    //                    RENDER FIELD HELPER
    // =========================================================

    const renderError = (field) =>
        errors[field] ? (
            <span className="lcf-error-msg">
                <AlertCircle size={14} />
                {errors[field]}
            </span>
        ) : null;

    // =========================================================
    //                    LOADING
    // =========================================================

    if (isLoading) {
        return (
            <div className="lcf-loading">
                <div className="lcf-spinner" />
                <p>{t('lectureCreateForm.loading', 'Зареждане...')}</p>
            </div>
        );
    }

    // =========================================================
    //                    RENDER
    // =========================================================

    return (
        <>
            <div className="lcf-page-bg">
                <div className="lcf-glow-orb" />
            </div>

            <div className="lcf-container">
                {/* Header */}
                <div className="lcf-header">
                    <button className="lcf-back-btn" onClick={() => navigate('/academy/admin/lectures')}>
                        <ArrowLeft size={18} />
                        {t('lectureCreateForm.backToList', 'Към списъка')}
                    </button>
                    <h1 className="lcf-title">
                        {isEditMode
                            ? t('lectureCreateForm.titleEdit', 'Редактиране на лекция')
                            : (
                                <>
                                    {t('lectureCreateForm.titleCreate', 'Създаване на').split(' ').slice(0, -1).join(' ')}{' '}
                                    <span className="lcf-title-accent">{t('lectureCreateForm.titleCreate', 'Създаване на лекция').split(' ').pop()}</span>
                                </>
                            )}
                    </h1>
                </div>

                <div className="lcf-form">

                    {/* ============================================= */}
                    {/* Section 1 — Basic Info */}
                    {/* ============================================= */}
                    <div className="lcf-section">
                        <div className="lcf-section-header">
                            <Info size={20} />
                            <h2 className="lcf-section-title">{t('lectureCreateForm.sections.basicInfo', 'Основна информация')}</h2>
                        </div>

                        {/* Title */}
                        <div className={`lcf-field ${errors.title ? 'lcf-field-error' : ''}`}>
                            <label className="lcf-label" htmlFor="lcf-title">
                                {t('lectureCreateForm.title', 'Заглавие')} <span className="lcf-required">*</span>
                            </label>
                            <input
                                id="lcf-title"
                                type="text"
                                name="title"
                                className="lcf-input"
                                placeholder={t('lectureCreateForm.titlePlaceholder', 'Напр. Въведение в интернет')}
                                value={lectureData.title}
                                onChange={handleChange}
                                maxLength={200}
                            />
                            {renderError('title')}
                            <span className="lcf-char-count">{lectureData.title.length}/200</span>
                        </div>

                        {/* Short Description */}
                        <div className={`lcf-field ${errors.shortDescription ? 'lcf-field-error' : ''}`}>
                            <label className="lcf-label" htmlFor="lcf-short-desc">
                                {t('lectureCreateForm.shortDescription', 'Кратко описание')}
                            </label>
                            <textarea
                                id="lcf-short-desc"
                                name="shortDescription"
                                className="lcf-textarea lcf-textarea-sm"
                                placeholder={t('lectureCreateForm.shortDescriptionPlaceholder', 'Кратко описание на лекцията...')}
                                value={lectureData.shortDescription}
                                onChange={handleChange}
                                maxLength={500}
                                rows={3}
                            />
                            {renderError('shortDescription')}
                            <span className="lcf-char-count">{(lectureData.shortDescription || '').length}/500</span>
                        </div>

                        {/* Description */}
                        <div className={`lcf-field ${errors.description ? 'lcf-field-error' : ''}`}>
                            <label className="lcf-label" htmlFor="lcf-desc">
                                {t('lectureCreateForm.description', 'Описание')}
                            </label>
                            <textarea
                                id="lcf-desc"
                                name="description"
                                className="lcf-textarea"
                                placeholder={t('lectureCreateForm.descriptionPlaceholder', 'Подробно описание...')}
                                value={lectureData.description}
                                onChange={handleChange}
                                rows={6}
                            />
                            {renderError('description')}
                        </div>

                        {/* Category + LectureType row */}
                        <div className="lcf-row">
                            <div className={`lcf-field ${errors.category ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-category">
                                    {t('lectureCreateForm.category', 'Категория')}
                                </label>
                                <input
                                    id="lcf-category"
                                    type="text"
                                    name="category"
                                    className="lcf-input"
                                    placeholder={t('lectureCreateForm.categoryPlaceholder', 'Напр. Дигитална грамотност')}
                                    value={lectureData.category}
                                    onChange={handleChange}
                                    maxLength={100}
                                />
                                {renderError('category')}
                            </div>

                            <div className={`lcf-field ${errors.lectureType ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-type">
                                    {t('lectureCreateForm.lectureType', 'Тип')}
                                </label>
                                <select
                                    id="lcf-type"
                                    name="lectureType"
                                    className="lcf-select"
                                    value={lectureData.lectureType}
                                    onChange={handleChange}
                                >
                                    {LECTURE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {t(`lectureCreateForm.lectureTypes.${type}`, type)}
                                        </option>
                                    ))}
                                </select>
                                {renderError('lectureType')}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className={`lcf-field ${errors.tags ? 'lcf-field-error' : ''}`}>
                            <label className="lcf-label" htmlFor="lcf-tags">
                                {t('lectureCreateForm.tags', 'Тагове')}
                            </label>
                            <input
                                id="lcf-tags"
                                type="text"
                                name="tags"
                                className="lcf-input"
                                placeholder={t('lectureCreateForm.tagsPlaceholder', 'интернет, безопасност, начинаещи')}
                                value={lectureData.tags}
                                onChange={handleChange}
                            />
                            <span className="lcf-hint">{t('lectureCreateForm.tagsHint', 'Разделени със запетая')}</span>
                            {renderError('tags')}
                        </div>
                        {/* Learning Points — НОВО */}
                        <div className="lcf-field">
                            <label className="lcf-label">
                                {t('lectureCreateForm.learningPoints', 'Какво ще научите')}
                            </label>
                            <div className="lcf-learning-points">
                                {(lectureData.learningPoints || []).map((point, index) => (
                                    <div key={index} className="lcf-learning-point">
                                        <span className="lcf-learning-point-icon">✓</span>
                                        <input
                                            type="text"
                                            className="lcf-input lcf-learning-point-input"
                                            value={point}
                                            placeholder={t('lectureCreateForm.learningPointPlaceholder', 'Напр. Основни понятия и концепции')}
                                            onChange={(e) => {
                                                const updated = [...lectureData.learningPoints];
                                                updated[index] = e.target.value;
                                                updateField('learningPoints', updated);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="lcf-learning-point-remove"
                                            onClick={() => {
                                                const updated = lectureData.learningPoints.filter((_, i) => i !== index);
                                                updateField('learningPoints', updated);
                                            }}
                                            title={t('lectureCreateForm.removeLearningPoint', 'Премахни')}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {(lectureData.learningPoints || []).length < 10 && (
                                    <button
                                        type="button"
                                        className="lcf-learning-point-add"
                                        onClick={() => {
                                            updateField('learningPoints', [...(lectureData.learningPoints || []), '']);
                                        }}
                                    >
                                        + {t('lectureCreateForm.addLearningPoint', 'Добави точка')}
                                    </button>
                                )}
                            </div>
                            <span className="lcf-hint">{t('lectureCreateForm.learningPointsHint', 'До 10 точки, описващи какво ще научат участниците')}</span>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* Section 2 — Date & Location */}
                    {/* ============================================= */}
                    <div className="lcf-section">
                        <div className="lcf-section-header">
                            <Calendar size={20} />
                            <h2 className="lcf-section-title">{t('lectureCreateForm.sections.dateLocation', 'Дата и място')}</h2>
                        </div>

                        {/* Dates row */}
                        <div className="lcf-row">
                            <div className={`lcf-field ${errors.scheduledDate ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-scheduled-date">
                                    {t('lectureCreateForm.scheduledDate', 'Начало')} <span className="lcf-required">*</span>
                                </label>
                                <input
                                    id="lcf-scheduled-date"
                                    type="datetime-local"
                                    name="scheduledDate"
                                    className="lcf-input"
                                    value={lectureData.scheduledDate}
                                    onChange={handleChange}
                                />
                                {renderError('scheduledDate')}
                            </div>

                            <div className={`lcf-field ${errors.scheduledEndDate ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-scheduled-end">
                                    {t('lectureCreateForm.scheduledEndDate', 'Край')}
                                </label>
                                <input
                                    id="lcf-scheduled-end"
                                    type="datetime-local"
                                    name="scheduledEndDate"
                                    className="lcf-input"
                                    value={lectureData.scheduledEndDate}
                                    onChange={handleChange}
                                />
                                {renderError('scheduledEndDate')}
                            </div>
                        </div>

                        {/* Duration + Timezone row */}
                        <div className="lcf-row">
                            <div className={`lcf-field ${errors.durationMinutes ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-duration">
                                    {t('lectureCreateForm.durationMinutes', 'Продължителност (мин.)')}
                                </label>
                                <input
                                    id="lcf-duration"
                                    type="number"
                                    name="durationMinutes"
                                    className="lcf-input"
                                    value={lectureData.durationMinutes}
                                    onChange={handleChange}
                                    min={1}
                                />
                                {renderError('durationMinutes')}
                            </div>

                            <div className={`lcf-field ${errors.timezone ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-timezone">
                                    {t('lectureCreateForm.timezone', 'Часова зона')}
                                </label>
                                <input
                                    id="lcf-timezone"
                                    type="text"
                                    name="timezone"
                                    className="lcf-input"
                                    value={lectureData.timezone}
                                    onChange={handleChange}
                                />
                                {renderError('timezone')}
                            </div>
                        </div>

                        {/* Online/Offline toggle */}
                        <div className="lcf-location-toggle">
                            <button
                                type="button"
                                className={`lcf-toggle-btn ${lectureData.isOnline ? 'lcf-toggle-active' : ''}`}
                                onClick={() => updateField('isOnline', true)}
                            >
                                <Wifi size={16} />
                                {t('lectureCreateForm.online', 'Онлайн')}
                            </button>
                            <button
                                type="button"
                                className={`lcf-toggle-btn ${!lectureData.isOnline ? 'lcf-toggle-active' : ''}`}
                                onClick={() => updateField('isOnline', false)}
                            >
                                <Building size={16} />
                                {t('lectureCreateForm.offline', 'На място')}
                            </button>
                        </div>

                        {/* Conditional fields */}
                        {lectureData.isOnline ? (
                            <div className="lcf-online-hint">
                                <Info size={14} />
                                <span>{t('lectureCreateForm.onlineHint', 'Видеото се настройва в секция „Видео и медия". Ако лекцията е във външна платформа (Zoom, Meet), добавете линк по-долу.')}</span>
                            </div>
                        ) : null}

                        {lectureData.isOnline && (
                            <div className="lcf-row">
                                <div className={`lcf-field ${errors.meetingLink ? 'lcf-field-error' : ''}`}>
                                    <label className="lcf-label" htmlFor="lcf-meeting-link">
                                        <Globe size={14} />
                                        {t('lectureCreateForm.meetingLink', 'Външен линк за среща')}
                                    </label>
                                    <input
                                        id="lcf-meeting-link"
                                        type="url"
                                        name="meetingLink"
                                        className="lcf-input"
                                        placeholder={t('lectureCreateForm.meetingLinkPlaceholder', 'Само ако е в Zoom/Meet/Teams (незадължително)')}
                                        value={lectureData.meetingLink}
                                        onChange={handleChange}
                                    />
                                    <span className="lcf-hint">{t('lectureCreateForm.meetingLinkHint', 'Оставете празно ако лекцията е директно в платформата')}</span>
                                    {renderError('meetingLink')}
                                </div>

                                <div className={`lcf-field ${errors.meetingPassword ? 'lcf-field-error' : ''}`}>
                                    <label className="lcf-label" htmlFor="lcf-meeting-pass">
                                        {t('lectureCreateForm.meetingPassword', 'Парола')}
                                    </label>
                                    <input
                                        id="lcf-meeting-pass"
                                        type="text"
                                        name="meetingPassword"
                                        className="lcf-input"
                                        placeholder={t('lectureCreateForm.meetingPasswordPlaceholder', 'Незадължително')}
                                        value={lectureData.meetingPassword}
                                        onChange={handleChange}
                                        maxLength={100}
                                    />
                                    {renderError('meetingPassword')}
                                </div>
                            </div>
                        )}

                        {!lectureData.isOnline && (
                            <div className="lcf-row">
                                <div className={`lcf-field ${errors.location ? 'lcf-field-error' : ''}`}>
                                    <label className="lcf-label" htmlFor="lcf-location">
                                        <MapPin size={14} />
                                        {t('lectureCreateForm.location', 'Място')}
                                    </label>
                                    <input
                                        id="lcf-location"
                                        type="text"
                                        name="location"
                                        className="lcf-input"
                                        placeholder={t('lectureCreateForm.locationPlaceholder', 'Напр. Пенсионерски клуб „Здраве"')}
                                        value={lectureData.location}
                                        onChange={handleChange}
                                    />
                                    {renderError('location')}
                                </div>

                                <div className={`lcf-field ${errors.address ? 'lcf-field-error' : ''}`}>
                                    <label className="lcf-label" htmlFor="lcf-address">
                                        {t('lectureCreateForm.address', 'Адрес')}
                                    </label>
                                    <input
                                        id="lcf-address"
                                        type="text"
                                        name="address"
                                        className="lcf-input"
                                        placeholder={t('lectureCreateForm.addressPlaceholder', 'Пълен адрес')}
                                        value={lectureData.address}
                                        onChange={handleChange}
                                    />
                                    {renderError('address')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============================================= */}
                    {/* Section 3 — Video & Media */}
                    {/* ============================================= */}
                    <div className="lcf-section">
                        <div className="lcf-section-header">
                            <Video size={20} />
                            <h2 className="lcf-section-title">{t('lectureCreateForm.sections.videoMedia', 'Видео и медия')}</h2>
                        </div>

                        <div className="lcf-row">
                            <div className={`lcf-field ${errors.videoProvider ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-video-provider">
                                    {t('lectureCreateForm.videoProvider', 'Видео платформа')}
                                </label>
                                <select
                                    id="lcf-video-provider"
                                    name="videoProvider"
                                    className="lcf-select"
                                    value={lectureData.videoProvider}
                                    onChange={handleChange}
                                >
                                    <option value="">{t('lectureCreateForm.selectProvider', '— Избери —')}</option>
                                    {VIDEO_PROVIDERS.map((p) => (
                                        <option key={p} value={p}>
                                            {t(`lectureCreateForm.videoProviders.${p}`, p.charAt(0).toUpperCase() + p.slice(1))}
                                        </option>
                                    ))}
                                </select>
                                {renderError('videoProvider')}
                            </div>

                            <div className={`lcf-field ${errors.videoUrl ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-video-url">
                                    {t('lectureCreateForm.videoUrl', 'Видео URL')}
                                </label>
                                <input
                                    id="lcf-video-url"
                                    type="url"
                                    name="videoUrl"
                                    className="lcf-input"
                                    placeholder="https://..."
                                    value={lectureData.videoUrl}
                                    onChange={handleChange}
                                />
                                {renderError('videoUrl')}
                            </div>
                        </div>

                        {/* Video preview + remove */}
                        {lectureData.videoUrl && (
                            <div className="lcf-video-preview">
                                <span className="lcf-video-preview-url">{lectureData.videoUrl}</span>
                                <button type="button" className="lcf-video-remove" onClick={handleRemoveVideo}>
                                    <X size={14} /> Премахни
                                </button>
                            </div>
                        )}

                        {/* Upload buttons */}
                        <div className="lcf-upload-buttons">
                            <button type="button" className="lcf-upload-btn" onClick={() => firebaseVideoRef.current?.click()} disabled={firebaseUploading || youtubeUploading}>
                                <Upload size={16} />
                                {firebaseUploading ? `Качване... ${Math.round(Object.values(fbUploadProgress || {})[0] || 0)}%` : 'Качи видео файл'}
                            </button>
                            <input ref={firebaseVideoRef} type="file" accept=".mp4,.webm,.mov" style={{ display: 'none' }} onChange={handleFirebaseVideoUpload} />

                            <button type="button" className="lcf-youtube-btn" onClick={() => ytInputRef.current?.click()} disabled={youtubeUploading || firebaseUploading}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                {youtubeUploading ? 'Качване...' : 'Качи в YouTube'}
                            </button>
                            <input ref={ytInputRef} type="file" accept=".mp4,.webm,.mov" style={{ display: 'none' }} onChange={handleYouTubeUpload} />
                        </div>

                        {/* Thumbnail */}
                        <div className={`lcf-field ${errors.thumbnailUrl ? 'lcf-field-error' : ''}`}>
                            <label className="lcf-label" htmlFor="lcf-thumbnail">
                                {t('lectureCreateForm.thumbnailUrl', 'Обложка (URL)')}
                            </label>
                            <input
                                id="lcf-thumbnail"
                                type="url"
                                name="thumbnailUrl"
                                className="lcf-input"
                                placeholder="https://..."
                                value={lectureData.thumbnailUrl}
                                onChange={handleChange}
                            />
                            {renderError('thumbnailUrl')}
                        </div>

                        {lectureData.thumbnailUrl && (
                            <div className="lcf-preview">
                                <img
                                    src={lectureData.thumbnailUrl}
                                    alt={t('lectureCreateForm.thumbnailPreview', 'Преглед')}
                                    className="lcf-preview-img"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

                    {/* ============================================= */}
                    {/* Section 4 — Mentor */}
                    {/* ============================================= */}
                    <div className="lcf-section">
                        <div className="lcf-section-header">
                            <Users size={20} /> 
                            <h2 className="lcf-section-title">{t('lectureCreateForm.sections.mentors', 'Лектори')}</h2>
                        </div>
                        <p className="lcf-section-desc">
                            {t('lectureCreateForm.mentorsDesc', 'Добавете един или повече лектори. Първият добавен автоматично става водещ.')}
                        </p>

                        <AcademyMentorPicker
                            mode="multi"
                            selected={assignedMentors}
                            onChange={(mentors) => {
                                setAssignedMentors(mentors);
                            }}
                            placeholder={t('lectureCreateForm.mentorPlaceholder', 'Търси лектор по име...')}
                        />
                    </div>

                    {/* ============================================= */}
                    {/* Section 5 — Registration Settings */}
                    {/* ============================================= */}
                    <div className="lcf-section">
                        <div className="lcf-section-header">
                            <Users size={20} />
                            <h2 className="lcf-section-title">{t('lectureCreateForm.sections.registration', 'Настройки за записване')}</h2>
                        </div>

                        <div className={`lcf-field ${errors.maxParticipants ? 'lcf-field-error' : ''}`}>
                            <label className="lcf-label" htmlFor="lcf-max-participants">
                                {t('lectureCreateForm.maxParticipants', 'Макс. участници')}
                            </label>
                            <input
                                id="lcf-max-participants"
                                type="number"
                                name="maxParticipants"
                                className="lcf-input lcf-input-sm"
                                placeholder={t('lectureCreateForm.unlimited', 'Без ограничение')}
                                value={lectureData.maxParticipants}
                                onChange={handleChange}
                                min={1}
                            />
                            {renderError('maxParticipants')}
                        </div>

                        <div className="lcf-toggles">
                            <label className="lcf-toggle">
                                <input type="checkbox" name="requiresRegistration" checked={lectureData.requiresRegistration} onChange={handleChange} />
                                <span className="lcf-toggle-slider" />
                                <span className="lcf-toggle-text">{t('lectureCreateForm.requiresRegistration', 'Изисква записване')}</span>
                            </label>
                            <label className="lcf-toggle">
                                <input type="checkbox" name="isPublic" checked={lectureData.isPublic} onChange={handleChange} />
                                <span className="lcf-toggle-slider" />
                                <span className="lcf-toggle-text">{t('lectureCreateForm.isPublic', 'Публична')}</span>
                            </label>
                            <label className="lcf-toggle">
                                <input type="checkbox" name="isFree" checked={lectureData.isFree} onChange={handleChange} />
                                <span className="lcf-toggle-slider" />
                                <span className="lcf-toggle-text">{t('lectureCreateForm.isFree', 'Безплатна')}</span>
                            </label>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* Section 6 — Credits */}
                    {/* ============================================= */}
                    <div className="lcf-section">
                        <div className="lcf-section-header">
                            <Award size={20} />
                            <h2 className="lcf-section-title">{t('lectureCreateForm.sections.credits', 'Кредити')}</h2>
                        </div>

                        <div className="lcf-row">
                            <div className={`lcf-field ${errors.maxCredits ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-max-credits">
                                    {t('lectureCreateForm.maxCredits', 'Макс. кредити')}
                                </label>
                                <input
                                    id="lcf-max-credits"
                                    type="number"
                                    name="maxCredits"
                                    className="lcf-input"
                                    value={lectureData.maxCredits}
                                    onChange={handleChange}
                                    min={0}
                                />
                                {renderError('maxCredits')}
                            </div>

                            <div className={`lcf-field ${errors.creditsForAttendance ? 'lcf-field-error' : ''}`}>
                                <label className="lcf-label" htmlFor="lcf-credits-attendance">
                                    {t('lectureCreateForm.creditsForAttendance', 'За присъствие')}
                                </label>
                                <input
                                    id="lcf-credits-attendance"
                                    type="number"
                                    name="creditsForAttendance"
                                    className="lcf-input"
                                    value={lectureData.creditsForAttendance}
                                    onChange={handleChange}
                                    min={0}
                                />
                                {renderError('creditsForAttendance')}
                            </div>
                        </div>

                        <div className="lcf-toggles">
                            <label className="lcf-toggle">
                                <input type="checkbox" name="hasTest" checked={lectureData.hasTest} onChange={handleChange} />
                                <span className="lcf-toggle-slider" />
                                <span className="lcf-toggle-text">{t('lectureCreateForm.hasTest', 'Има тест')}</span>
                            </label>
                        </div>

                        {lectureData.hasTest && (
                            <div className="lcf-row lcf-test-fields">
                                <div className={`lcf-field ${errors.creditsForTest ? 'lcf-field-error' : ''}`}>
                                    <label className="lcf-label" htmlFor="lcf-credits-test">
                                        {t('lectureCreateForm.creditsForTest', 'За тест')}
                                    </label>
                                    <input
                                        id="lcf-credits-test"
                                        type="number"
                                        name="creditsForTest"
                                        className="lcf-input"
                                        value={lectureData.creditsForTest}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                    {renderError('creditsForTest')}
                                </div>

                                <div className={`lcf-field ${errors.testPassingScore ? 'lcf-field-error' : ''}`}>
                                    <label className="lcf-label" htmlFor="lcf-test-score">
                                        {t('lectureCreateForm.testPassingScore', 'Минимален резултат (%)')}
                                    </label>
                                    <input
                                        id="lcf-test-score"
                                        type="number"
                                        name="testPassingScore"
                                        className="lcf-input"
                                        value={lectureData.testPassingScore}
                                        onChange={handleChange}
                                        min={0}
                                        max={100}
                                    />
                                    {renderError('testPassingScore')}
                                </div>
                            </div>
                        )}
                    </div>

                   {/* ============================================= */}
                    {/* Section 7 — Connected Course & Module */}
                    {/* ============================================= */}
                    <div className="lcf-section">
                        <div className="lcf-section-header">
                            <BookOpen size={20} />
                            <h2 className="lcf-section-title">{t('lectureCreateForm.sections.course', 'Свързан курс')}</h2>
                        </div>
                        <p className="lcf-section-desc">
                            {t('lectureCreateForm.courseDesc', 'Ако лекцията е част от курс, изберете го тук. Иначе оставете празно.')}
                        </p>

                        {/* Selected course display */}
                        {lectureData.courseId ? (
                            <div className="lcf-course-selected">
                                <div className="lcf-course-selected-info">
                                    <BookOpen size={16} />
                                    <span className="lcf-course-selected-name">
                                        {availableCourses.find(c => c.id === lectureData.courseId)?.name || `Курс #${lectureData.courseId}`}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="lcf-course-clear-btn"
                                    onClick={() => {
                                        updateField('courseId', null);
                                        updateField('moduleId', null); 
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    className="lcf-input"
                                    placeholder={t('lectureCreateForm.courseSearchPlaceholder', 'Търси курс по име...')}
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                />
                                {availableCourses.length > 0 && courseSearch.trim() && (
                                    <div className="lcf-course-dropdown">
                                        {availableCourses.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className="lcf-course-option"
                                                onClick={() => {
                                                    updateField('courseId', c.id);
                                                    updateField('moduleId', null); 
                                                    setCourseSearch('');
                                                }}
                                            >
                                                <span className="lcf-course-option-name">{c.name}</span>
                                                <span className="lcf-course-option-cat">{c.category || ''}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Module dropdown (само ако има избран курс) */}
                        {lectureData.courseId && availableModules.length > 0 && (
                            <div className="lcf-field lcf-module-field">
                                <label className="lcf-label" htmlFor="lcf-module">
                                    {t('lectureCreateForm.module', 'Модул')}
                                </label>
                                <select
                                    id="lcf-module"
                                    className="lcf-select"
                                    value={lectureData.moduleId || ''}
                                    onChange={(e) => updateField('moduleId', e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">{t('lectureCreateForm.noModule', '— Без модул —')}</option>
                                    {availableModules.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================= */}
                {/* Footer Actions */}
                {/* ============================================= */}
                <div className="lcf-footer">
                    <div className="lcf-footer-left">
                        {hasChanges && (
                            <span className="lcf-unsaved">
                                {t('lectureCreateForm.unsavedChanges', '● Незапазени промени')}
                            </span>
                        )}
                    </div>
                    <div className="lcf-footer-right">
                        <button className="lcf-btn lcf-btn-cancel" onClick={() => navigate('/academy/admin/lectures')}>
                            {t('lectureCreateForm.cancel', 'Отказ')}
                        </button>
                        <button className="lcf-btn lcf-btn-draft" onClick={handleSaveDraft} disabled={isSaving}>
                            <Save size={18} />
                            {isSaving ? t('lectureCreateForm.saving', 'Запазване...') : t('lectureCreateForm.saveDraft', 'Запази чернова')}
                        </button>
                        <button className="lcf-btn lcf-btn-publish" onClick={handlePublish} disabled={isSaving}>
                            <Send size={18} />
                            {t('lectureCreateForm.publish', 'Публикувай')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LectureCreateForm;