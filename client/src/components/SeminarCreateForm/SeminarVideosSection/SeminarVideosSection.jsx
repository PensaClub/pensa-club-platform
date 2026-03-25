import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Film, Upload, Trash2, Link2 } from 'lucide-react';
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './seminarVideosSection.css';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const ACCEPT_TYPES = '.mp4,.webm,.mov';

const detectProvider = (url) => {
    if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
    if (/vimeo\.com/i.test(url)) return 'vimeo';
    return 'custom';
};

const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function SeminarVideosSection({ seminarId, seminarSlug }) {
    const { t } = useTranslation('academy-admin');
    const { getSeminarVideos, addSeminarVideo, deleteSeminarVideo, uploadToYouTube, deleteFromYouTube } = useAcademyCourses();
    const { uploadMultipleFiles, uploading, uploadProgress } = useFirebaseUpload();

    const [videos, setVideos] = useState([]);              // saved in DB
    const [pendingVideos, setPendingVideos] = useState([]); // not yet in DB
    const [urlInput, setUrlInput] = useState('');
    const [urlTitle, setUrlTitle] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [youtubeUploading, setYoutubeUploading] = useState(false);
    const fileInputRef = useRef(null);
    const youtubeInputRef = useRef(null);
    const flushedRef = useRef(false);

    // Load saved videos when seminarId is available (edit mode)
    useEffect(() => {
        if (!seminarId || !getSeminarVideos) return;
        const loadVideos = async () => {
            try {
                const data = await getSeminarVideos(seminarId);
                setVideos(data?.videos || data || []);
            } catch (err) {
                console.error('Failed to load seminar videos:', err);
            }
        };
        loadVideos();
    }, [seminarId]);

    // Flush pending videos to backend when seminarSlug becomes available
    useEffect(() => {
        if (!seminarSlug || pendingVideos.length === 0 || flushedRef.current || !addSeminarVideo) return;
        flushedRef.current = true;

        const flushPending = async () => {
            for (const pending of pendingVideos) {
                try {
                    const resp = await addSeminarVideo(seminarId, pending);
                    const saved = resp?.video || resp;
                    if (saved?.id) setVideos(prev => [...prev, saved]);
                } catch (err) {
                    console.error('Failed to save pending video:', err);
                }
            }
            setPendingVideos([]);
            flushedRef.current = false;
        };
        flushPending();
    }, [seminarSlug, pendingVideos]);

    const handleFiles = useCallback(async (files) => {
        if (!files?.length) return;

        const validFiles = Array.from(files).filter(f => {
            if (f.size > MAX_FILE_SIZE) {
                toast.warning(t('seminarVideos.fileTooLarge', 'Файлът е твърде голям. Максимум 500MB.'));
                return false;
            }
            return true;
        });

        if (!validFiles.length) return;

        try {
            const results = await uploadMultipleFiles(validFiles, 'academy/videos/seminars');

            for (const result of results) {
                const videoData = {
                    title: result.name,
                    videoProvider: 'file',
                    videoUrl: result.url,
                    fileName: result.name,
                    fileSize: result.size,
                    mimeType: result.type
                };

                if (seminarSlug && addSeminarVideo) {
                    const resp = await addSeminarVideo(seminarId, videoData);
                    const saved = resp?.video || resp;
                    if (saved?.id) setVideos(prev => [...prev, saved]);
                } else {
                    setPendingVideos(prev => [...prev, videoData]);
                }
            }
            toast.success(t('seminarVideos.uploadSuccess', 'Видеото е качено успешно'));
        } catch (err) {
            console.error('Failed to upload video:', err);
            toast.error(t('seminarVideos.uploadError', 'Грешка при качване на видеото'));
        }
    }, [seminarSlug, seminarId, uploadMultipleFiles, addSeminarVideo, t]);

    const handleDeleteSaved = useCallback(async (videoId) => {
        if (!deleteSeminarVideo) return;
        try {
            await deleteSeminarVideo(seminarId, videoId);
            setVideos(prev => prev.filter(v => v.id !== videoId));
            toast.success(t('seminarVideos.deleteSuccess', 'Видеото е изтрито'));
        } catch (err) {
            console.error('Failed to delete video:', err);
            toast.error(t('seminarVideos.deleteError', 'Грешка при изтриване'));
        }
    }, [seminarId, deleteSeminarVideo, t]);

    const handleDeletePending = useCallback(async (index) => {
        const video = pendingVideos[index];
        if (video?.videoProvider === 'youtube' && video?.videoUrl) {
            try {
                const ytId = extractYouTubeId(video.videoUrl);
                if (ytId) await deleteFromYouTube(ytId);
            } catch (err) {
                console.error('Failed to delete from YouTube:', err);
            }
        }
        setPendingVideos(prev => prev.filter((_, i) => i !== index));
    }, [pendingVideos, deleteFromYouTube]);

    const handleAddUrl = useCallback(async () => {
        if (!urlInput.trim()) return;

        const provider = detectProvider(urlInput.trim());
        const youtubeId = provider === 'youtube' ? extractYouTubeId(urlInput.trim()) : null;
        const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;

        const videoData = {
            title: urlTitle.trim() || urlInput.trim(),
            videoProvider: provider,
            videoUrl: urlInput.trim(),
            thumbnailUrl,
            youtubeId
        };

        if (seminarSlug && addSeminarVideo) {
            try {
                const resp = await addSeminarVideo(seminarId, videoData);
                const saved = resp?.video || resp;
                if (saved?.id) setVideos(prev => [...prev, saved]);
                toast.success(t('seminarVideos.addUrlSuccess', 'Видеото е добавено успешно'));
            } catch (err) {
                console.error('Failed to add video URL:', err);
                toast.error(t('seminarVideos.addUrlError', 'Грешка при добавяне на видеото'));
            }
        } else {
            setPendingVideos(prev => [...prev, videoData]);
        }

        setUrlInput('');
        setUrlTitle('');
    }, [urlInput, urlTitle, seminarSlug, seminarId, addSeminarVideo, t]);

    const handleYouTubeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        setYoutubeUploading(true);
        try {
            const formData = new FormData();
            formData.append('video', file);
            formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
            formData.append('description', `Семинар видео - ${file.name}`);
            formData.append('privacyStatus', 'unlisted');

            const result = await uploadToYouTube(formData);

            if (result?.success && result?.videoUrl) {
                const videoData = {
                    title: result.title || file.name,
                    videoProvider: 'youtube',
                    videoUrl: result.videoUrl,
                    thumbnailUrl: `https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`,
                };

                if (seminarSlug && addSeminarVideo) {
                    const resp = await addSeminarVideo(seminarId, videoData);
                    const saved = resp?.video || resp;
                    if (saved?.id) setVideos(prev => [...prev, saved]);
                } else {
                    setPendingVideos(prev => [...prev, videoData]);
                }
                toast.success('Видеото е качено в YouTube');
            } else {
                toast.error(result?.message || 'Грешка при качване в YouTube');
            }
        } catch (err) {
            console.error('YouTube upload error:', err);
            toast.error('Грешка при качване в YouTube');
        } finally {
            setYoutubeUploading(false);
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleFileInputChange = useCallback((e) => {
        if (e.target.files?.length) {
            handleFiles(e.target.files);
            e.target.value = '';
        }
    }, [handleFiles]);

    const avgProgress = Math.round(
        Object.values(uploadProgress || {}).reduce((a, b) => a + b, 0) /
        Math.max(Object.keys(uploadProgress || {}).length, 1)
    );

    const allItems = [
        ...videos.map(v => ({ ...v, _saved: true })),
        ...pendingVideos.map((v, i) => ({ ...v, _saved: false, _pendingIndex: i, id: `pending-${i}` }))
    ];

    const getProviderLabel = (videoProvider) => {
        if (videoProvider === 'youtube') return 'YouTube';
        if (videoProvider === 'vimeo') return 'Vimeo';
        if (videoProvider === 'file') return t('seminarVideos.providerFile', 'Файл');
        return t('seminarVideos.providerCustom', 'Линк');
    };

    const getThumbnail = (item) => {
        if (item.thumbnailUrl) return item.thumbnailUrl;
        const ytId = item.youtubeId || (item.videoProvider === 'youtube' ? extractYouTubeId(item.videoUrl || '') : null);
        if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
        return null;
    };

    return (
        <div className="scfv-section">
            <div className="scfv-section-header">
                <Film size={20} />
                <h2 className="scfv-section-title">
                    {t('seminarVideos.title', 'Видеа')}
                </h2>
            </div>
            <p className="scfv-section-desc">
                {t('seminarVideos.desc', 'Добавете видеа чрез YouTube/Vimeo линк или качете видео файл.')}
            </p>

            {/* Videos list (saved + pending) */}
            {allItems.length > 0 && (
                <div className="scfv-list">
                    {allItems.map(v => {
                        const thumb = getThumbnail(v);
                        return (
                            <div key={v.id} className={`scfv-item${!v._saved ? ' scfv-item-pending' : ''}`}>
                                {thumb ? (
                                    <img src={thumb} alt="" className="scfv-item-thumb" />
                                ) : (
                                    <Film size={18} className="scfv-item-icon" />
                                )}
                                <div className="scfv-item-info">
                                    <span className="scfv-item-name">
                                        {v.title || v.fileName || v.videoUrl}
                                    </span>
                                    <span className="scfv-item-meta">
                                        <span className={`scfv-provider-badge scfv-provider-${v.videoProvider || 'custom'}`}>
                                            {getProviderLabel(v.videoProvider)}
                                        </span>
                                        {v.fileSize ? ` ${formatFileSize(v.fileSize)}` : ''}
                                        {!v._saved && (
                                            <span className="scfv-item-pending-badge">
                                                {t('seminarVideos.pendingBadge', '• ще се запази с черновата')}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <button
                                    className="scfv-item-delete"
                                    onClick={() => v._saved ? handleDeleteSaved(v.id) : handleDeletePending(v._pendingIndex)}
                                    title={t('seminarVideos.delete', 'Изтрий')}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* URL input (always visible) */}
            <div className="scfv-url-form">
                <input
                    className="scfv-url-input"
                    type="url"
                    placeholder={t('seminarVideos.urlPlaceholder', 'YouTube, Vimeo или друг видео линк...')}
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                />
                <input
                    className="scfv-url-input"
                    type="text"
                    placeholder={t('seminarVideos.urlTitle', 'Заглавие (незадължително)')}
                    value={urlTitle}
                    onChange={e => setUrlTitle(e.target.value)}
                />
                <button
                    type="button"
                    className="scfv-url-btn"
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                >
                    <Link2 size={14} />
                    {t('seminarVideos.addVideo', 'Добави видео')}
                </button>
            </div>

            {/* File upload zone (drag & drop) */}
            <div
                className={`scfv-upload-zone${dragActive ? ' scfv-upload-zone-active' : ''}${uploading ? ' scfv-upload-zone-uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_TYPES}
                    className="scfv-upload-input"
                    onChange={handleFileInputChange}
                />
                {uploading ? (
                    <div className="scfv-upload-progress">
                        <div className="scfv-upload-progress-bar">
                            <div className="scfv-upload-progress-fill" style={{ width: `${avgProgress}%` }} />
                        </div>
                        <span className="scfv-upload-progress-text">{avgProgress}%</span>
                    </div>
                ) : (
                    <>
                        <Upload size={24} />
                        <span className="scfv-upload-text">
                            {t('seminarVideos.dropHint', 'Пуснете видео файл тук')}
                        </span>
                    </>
                )}
            </div>

            {/* Upload button */}
            <button
                type="button"
                className="scfv-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || youtubeUploading}
            >
                <Upload size={16} />
                {t('seminarVideos.uploadBtn', 'Качи видео файл')}
            </button>

            {/* YouTube upload */}
            <input
                ref={youtubeInputRef}
                type="file"
                accept=".mp4,.webm,.mov"
                className="scfv-upload-input"
                onChange={handleYouTubeUpload}
            />
            <button
                type="button"
                className="scfv-youtube-btn"
                onClick={() => youtubeInputRef.current?.click()}
                disabled={youtubeUploading || uploading}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                {youtubeUploading ? 'Качване в YouTube...' : 'Качи в YouTube'}
            </button>

            <span className="scfv-upload-hint">
                {t('seminarVideos.formats', 'MP4, WebM, MOV. Макс. 500MB')}
            </span>
        </div>
    );
}
