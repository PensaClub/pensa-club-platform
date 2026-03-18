// src/components/SeminarCreateForm/SeminarSchedule/SeminarSchedule.jsx
// Prefix: scfs-

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Globe, Wifi, Building, Image, AlertCircle, Upload, X, Link } from 'lucide-react';
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import './seminarSchedule.css';

const SeminarSchedule = ({ seminarData, errors, handleChange, updateField }) => {
    const { t } = useTranslation('academy-admin');
    const { uploadFile, uploading, uploadProgress } = useFirebaseUpload();
    const fileInputRef = useRef(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        try {
            const result = await uploadFile(file, 'seminar-thumbnails');
            updateField('thumbnailUrl', result.url);
        } catch (error) {
            console.error('Failed to upload thumbnail:', error);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleRemoveImage = () => {
        updateField('thumbnailUrl', '');
    };

    const renderError = (field) =>
        errors[field] ? (
            <span className="scfs-error-msg">
                <AlertCircle size={14} />
                {errors[field]}
            </span>
        ) : null;

    return (
        <>
            {/* ============================================= */}
            {/* Date & Location */}
            {/* ============================================= */}
            <div className="scfs-section">
                <div className="scfs-section-header">
                    <Calendar size={20} />
                    <h2 className="scfs-section-title">{t('seminarSchedule.dateTitle', 'Дата и място')}</h2>
                </div>

                <div className="scfs-row">
                    <div className={`scfs-field ${errors.scheduledDate ? 'scfs-field-error' : ''}`}>
                        <label className="scfs-label" htmlFor="scfs-scheduled-date">
                            {t('seminarSchedule.scheduledDate', 'Начало')} <span className="scfs-required">*</span>
                        </label>
                        <input id="scfs-scheduled-date" type="datetime-local" name="scheduledDate" className="scfs-input" value={seminarData.scheduledDate} onChange={handleChange} />
                        {renderError('scheduledDate')}
                    </div>
                    <div className={`scfs-field ${errors.scheduledEndDate ? 'scfs-field-error' : ''}`}>
                        <label className="scfs-label" htmlFor="scfs-scheduled-end">
                            {t('seminarSchedule.scheduledEndDate', 'Край')}
                        </label>
                        <input id="scfs-scheduled-end" type="datetime-local" name="scheduledEndDate" className="scfs-input" value={seminarData.scheduledEndDate} onChange={handleChange} />
                        {renderError('scheduledEndDate')}
                    </div>
                </div>

                <div className="scfs-row">
                    <div className={`scfs-field ${errors.durationMinutes ? 'scfs-field-error' : ''}`}>
                        <label className="scfs-label" htmlFor="scfs-duration">
                            {t('seminarSchedule.durationMinutes', 'Продължителност (мин)')}
                        </label>
                        <input id="scfs-duration" type="number" name="durationMinutes" className="scfs-input" value={seminarData.durationMinutes} onChange={handleChange} min={1} />
                        {renderError('durationMinutes')}
                    </div>
                    <div className={`scfs-field ${errors.timezone ? 'scfs-field-error' : ''}`}>
                        <label className="scfs-label" htmlFor="scfs-timezone">
                            {t('seminarSchedule.timezone', 'Часова зона')}
                        </label>
                        <input id="scfs-timezone" type="text" name="timezone" className="scfs-input" value={seminarData.timezone} onChange={handleChange} />
                        {renderError('timezone')}
                    </div>
                </div>

                {/* Online/Offline toggle */}
                <div className="scfs-location-toggle">
                    <button type="button" className={`scfs-toggle-btn ${!seminarData.isOnline ? 'scfs-toggle-active' : ''}`} onClick={() => updateField('isOnline', false)}>
                        <Building size={16} />
                        {t('seminarSchedule.offline', 'На място')}
                    </button>
                    <button type="button" className={`scfs-toggle-btn ${seminarData.isOnline ? 'scfs-toggle-active' : ''}`} onClick={() => updateField('isOnline', true)}>
                        <Wifi size={16} />
                        {t('seminarSchedule.online', 'Онлайн')}
                    </button>
                </div>

                {/* Location (offline) */}
                {!seminarData.isOnline && (
                    <div className="scfs-row">
                        <div className={`scfs-field ${errors.location ? 'scfs-field-error' : ''}`}>
                            <label className="scfs-label" htmlFor="scfs-location">
                                <MapPin size={14} />
                                {t('seminarSchedule.location', 'Място')} <span className="scfs-required">*</span>
                            </label>
                            <input id="scfs-location" type="text" name="location" className="scfs-input" placeholder={t('seminarSchedule.locationPlaceholder', "Пенсионерски клуб 'Надежда'")} value={seminarData.location} onChange={handleChange} />
                            {renderError('location')}
                        </div>
                        <div className={`scfs-field ${errors.address ? 'scfs-field-error' : ''}`}>
                            <label className="scfs-label" htmlFor="scfs-address">
                                {t('seminarSchedule.address', 'Адрес')}
                            </label>
                            <input id="scfs-address" type="text" name="address" className="scfs-input" placeholder={t('seminarSchedule.addressPlaceholder', 'ул. Иван Вазов 5, София')} value={seminarData.address} onChange={handleChange} />
                            {renderError('address')}
                        </div>
                    </div>
                )}

                {/* Online fields */}
                {seminarData.isOnline && (
                    <div className="scfs-row">
                        <div className={`scfs-field ${errors.meetingLink ? 'scfs-field-error' : ''}`}>
                            <label className="scfs-label" htmlFor="scfs-meeting-link">
                                <Globe size={14} />
                                {t('seminarSchedule.meetingLink', 'Линк за среща')}
                            </label>
                            <input id="scfs-meeting-link" type="url" name="meetingLink" className="scfs-input" placeholder="https://..." value={seminarData.meetingLink} onChange={handleChange} />
                            {renderError('meetingLink')}
                        </div>
                        <div className={`scfs-field ${errors.meetingPassword ? 'scfs-field-error' : ''}`}>
                            <label className="scfs-label" htmlFor="scfs-meeting-pass">
                                {t('seminarSchedule.meetingPassword', 'Парола')}
                            </label>
                            <input id="scfs-meeting-pass" type="text" name="meetingPassword" className="scfs-input" value={seminarData.meetingPassword} onChange={handleChange} maxLength={100} />
                            {renderError('meetingPassword')}
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================= */}
            {/* Image */}
            {/* ============================================= */}
            <div className="scfs-section">
                <div className="scfs-section-header">
                    <Image size={20} />
                    <h2 className="scfs-section-title">{t('seminarSchedule.mediaTitle', 'Медия')}</h2>
                </div>

                {seminarData.thumbnailUrl ? (
                    <div className="scfs-preview">
                        <img src={seminarData.thumbnailUrl} alt={t('seminarSchedule.thumbnailPreview', 'Преглед')} className="scfs-preview-img" onError={(e) => { e.target.style.display = 'none'; }} />
                        <button type="button" className="scfs-preview-remove" onClick={handleRemoveImage} title={t('seminarSchedule.removeImage', 'Премахни')}>
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div
                            className={`scfs-upload-zone ${dragOver ? 'scfs-upload-zone-active' : ''} ${uploading ? 'scfs-upload-zone-uploading' : ''}`}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="scfs-upload-input"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                            />
                            {uploading ? (
                                <div className="scfs-upload-progress">
                                    <div className="scfs-upload-progress-bar">
                                        <div className="scfs-upload-progress-fill" style={{ width: `${Object.values(uploadProgress)[0] || 0}%` }} />
                                    </div>
                                    <span className="scfs-upload-progress-text">{Math.round(Object.values(uploadProgress)[0] || 0)}%</span>
                                </div>
                            ) : (
                                <>
                                    <Upload size={24} />
                                    <span className="scfs-upload-text">{t('seminarSchedule.uploadHint', 'Кликни или пусни снимка тук')}</span>
                                </>
                            )}
                        </div>

                        <button type="button" className="scfs-url-toggle" onClick={() => setShowUrlInput(!showUrlInput)}>
                            <Link size={14} />
                            {t('seminarSchedule.orPasteUrl', 'Или добави чрез URL')}
                        </button>

                        {showUrlInput && (
                            <div className={`scfs-field ${errors.thumbnailUrl ? 'scfs-field-error' : ''}`}>
                                <input id="scfs-thumbnail" type="url" name="thumbnailUrl" className="scfs-input" placeholder="https://..." value={seminarData.thumbnailUrl} onChange={handleChange} />
                                {renderError('thumbnailUrl')}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default SeminarSchedule;