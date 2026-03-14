import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../../../firebase';
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import { useReAction } from '../../contexts/ReActionProvider';
import './adminReActionGallery.css';

/**
 * Generate a thumbnail from a video file using canvas capture.
 * Returns a Blob (JPEG) or null on failure.
 */
const generateVideoThumbnail = (videoFile) => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(videoFile);
        video.src = url;

        video.addEventListener('loadeddata', () => {
            video.currentTime = Math.min(1, video.duration / 2);
        });

        video.addEventListener('seeked', () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = Math.min(video.videoWidth, 640);
                canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    resolve(blob);
                }, 'image/jpeg', 0.8);
            } catch {
                URL.revokeObjectURL(url);
                resolve(null);
            }
        });

        video.addEventListener('error', () => {
            URL.revokeObjectURL(url);
            resolve(null);
        });

        // timeout safety
        setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve(null);
        }, 15000);
    });
};

/**
 * Upload a thumbnail blob to Firebase and return its download URL.
 */
const uploadThumbnailToFirebase = async (blob, originalName) => {
    const thumbName = `${Date.now()}_thumb_${originalName.replace(/\.[^.]+$/, '')}.jpg`;
    const storageRef = ref(firebaseStorage, `reaction-gallery/${thumbName}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
};

export const AdminReActionGallery = () => {
    const { t } = useTranslation('reaction');
    const { getAdminGallery, createGalleryItem, updateGalleryItem, reorderGallery, deleteGalleryItem } = useReAction();
    const { uploadFile, uploading, uploadProgress } = useFirebaseUpload();

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const fileInputRef = useRef(null);

    // URL input state
    const [showUrlForm, setShowUrlForm] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [urlTitle, setUrlTitle] = useState('');
    const [urlThumbnail, setUrlThumbnail] = useState('');
    const [urlSubmitting, setUrlSubmitting] = useState(false);

    // Filter state
    const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'hidden'

    // Drag-and-drop state
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await getAdminGallery();
            setItems(res?.items || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ===================================
    // UPLOAD
    // ===================================

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        for (const file of files) {
            try {
                const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
                const result = await uploadFile(file, 'reaction-gallery');

                let thumbnailUrl = null;

                // Generate thumbnail for videos
                if (mediaType === 'video') {
                    const thumbBlob = await generateVideoThumbnail(file);
                    if (thumbBlob) {
                        thumbnailUrl = await uploadThumbnailToFirebase(thumbBlob, file.name);
                    }
                }

                await createGalleryItem({
                    mediaType,
                    mediaUrl: result.url,
                    thumbnailUrl: thumbnailUrl || undefined,
                    title: '',
                });

                await fetchItems();
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ===================================
    // ADD VIDEO BY URL
    // ===================================

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        if (!urlInput.trim()) return;

        setUrlSubmitting(true);
        try {
            await createGalleryItem({
                mediaType: 'video',
                mediaUrl: urlInput.trim(),
                thumbnailUrl: urlThumbnail.trim() || undefined,
                title: urlTitle.trim() || '',
            });

            setUrlInput('');
            setUrlTitle('');
            setUrlThumbnail('');
            setShowUrlForm(false);
            await fetchItems();
        } catch (error) {
            console.error('URL add failed:', error);
        } finally {
            setUrlSubmitting(false);
        }
    };

    // ===================================
    // TOGGLE PUBLISH
    // ===================================

    const handleTogglePublish = async (item) => {
        try {
            await updateGalleryItem(item.id, { isPublished: !item.isPublished });
            setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i))
            );
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // ===================================
    // DELETE
    // ===================================

    const handleDelete = async (item) => {
        try {
            const res = await deleteGalleryItem(item.id);

            // Clean up Firebase
            if (res?.mediaUrl) {
                try {
                    const storageRef = ref(firebaseStorage, res.mediaUrl);
                    await deleteObject(storageRef);
                } catch (fbErr) {
                    console.error('Firebase cleanup failed:', fbErr);
                }
            }

            setItems((prev) => prev.filter((i) => i.id !== item.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // ===================================
    // DRAG & DROP REORDER
    // ===================================

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = async (index) => {
        if (dragIndex === null || dragIndex === index) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...items];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);

        setItems(reordered);
        setDragIndex(null);
        setDragOverIndex(null);

        try {
            await reorderGallery(reordered.map((item, i) => ({ id: item.id, sortOrder: i })));
        } catch (error) {
            console.error('Reorder failed:', error);
            fetchItems();
        }
    };

    // ===================================
    // RENDER
    // ===================================

    const progressValues = Object.values(uploadProgress);
    const currentProgress = progressValues.length > 0
        ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
        : 0;

    // Stats
    const totalCount = items.length;
    const publishedCount = items.filter((i) => i.isPublished).length;
    const hiddenCount = totalCount - publishedCount;

    // Filtered items
    const filteredItems = filter === 'all'
        ? items
        : filter === 'published'
            ? items.filter((i) => i.isPublished)
            : items.filter((i) => !i.isPublished);

    return (
        <div className="arag">
            <h2 className="arag-title">{t('admin.gallery.title', 'Галерия')}</h2>

            {/* Upload zone */}
            <div
                className="arag-upload"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="arag-upload-input"
                />
                {uploading ? (
                    <div className="arag-upload-progress">
                        <div className="arag-progress-bar">
                            <div
                                className="arag-progress-fill"
                                style={{ width: `${currentProgress}%` }}
                            />
                        </div>
                        <span className="arag-progress-text">{currentProgress}%</span>
                    </div>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arag-upload-icon">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="arag-upload-text">{t('admin.gallery.upload', 'Качи снимки или видео')}</span>
                        <span className="arag-upload-hint">{t('admin.gallery.uploadHint', 'Кликни или пусни файлове тук')}</span>
                    </>
                )}
            </div>

            {/* URL input for video */}
            <div className="arag-url-section">
                {!showUrlForm ? (
                    <button
                        className="arag-url-toggle"
                        onClick={() => setShowUrlForm(true)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        {t('admin.gallery.addByUrl', 'Добави видео чрез URL')}
                    </button>
                ) : (
                    <form className="arag-url-form" onSubmit={handleUrlSubmit}>
                        <div className="arag-url-field">
                            <label className="arag-url-label">{t('admin.gallery.videoUrl', 'URL на видеото')} *</label>
                            <input
                                type="url"
                                className="arag-url-input"
                                placeholder="https://..."
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                required
                            />
                        </div>
                        <div className="arag-url-field">
                            <label className="arag-url-label">{t('admin.gallery.thumbnailUrl', 'URL на thumbnail (незадължително)')}</label>
                            <input
                                type="url"
                                className="arag-url-input"
                                placeholder="https://...jpg"
                                value={urlThumbnail}
                                onChange={(e) => setUrlThumbnail(e.target.value)}
                            />
                        </div>
                        <div className="arag-url-field">
                            <label className="arag-url-label">{t('admin.gallery.videoTitle', 'Заглавие (незадължително)')}</label>
                            <input
                                type="text"
                                className="arag-url-input"
                                value={urlTitle}
                                onChange={(e) => setUrlTitle(e.target.value)}
                            />
                        </div>
                        <div className="arag-url-actions">
                            <button
                                type="button"
                                className="arag-modal-btn arag-modal-btn--cancel"
                                onClick={() => { setShowUrlForm(false); setUrlInput(''); setUrlTitle(''); setUrlThumbnail(''); }}
                            >
                                {t('admin.gallery.cancel', 'Отказ')}
                            </button>
                            <button
                                type="submit"
                                className="arag-modal-btn arag-modal-btn--danger"
                                disabled={urlSubmitting || !urlInput.trim()}
                            >
                                {urlSubmitting ? '...' : t('admin.gallery.addVideo', 'Добави')}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Stats + Filter */}
            {!isLoading && totalCount > 0 && (
                <div className="arag-stats-bar">
                    <div className="arag-stats">
                        <span className="arag-stat">
                            {t('admin.gallery.total', 'Общо')}: <strong>{totalCount}</strong>
                        </span>
                        <span className="arag-stat arag-stat--published">
                            {t('admin.gallery.published', 'Видими')}: <strong>{publishedCount}</strong>
                        </span>
                        <span className="arag-stat arag-stat--hidden">
                            {t('admin.gallery.unpublished', 'Скрити')}: <strong>{hiddenCount}</strong>
                        </span>
                    </div>
                    <div className="arag-filters">
                        <button
                            className={`arag-filter ${filter === 'all' ? 'arag-filter--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            {t('admin.gallery.filterAll', 'Всички')}
                        </button>
                        <button
                            className={`arag-filter ${filter === 'published' ? 'arag-filter--active' : ''}`}
                            onClick={() => setFilter('published')}
                        >
                            {t('admin.gallery.filterPublished', 'Видими')}
                        </button>
                        <button
                            className={`arag-filter ${filter === 'hidden' ? 'arag-filter--active' : ''}`}
                            onClick={() => setFilter('hidden')}
                        >
                            {t('admin.gallery.filterHidden', 'Скрити')}
                        </button>
                    </div>
                </div>
            )}

            {/* Gallery grid */}
            {isLoading ? (
                <div className="arag-loading">
                    <div className="arag-spinner" />
                </div>
            ) : items.length === 0 ? (
                <p className="arag-empty">{t('admin.gallery.noItems', 'Няма качени елементи')}</p>
            ) : (
                <>
                    <p className="arag-drag-hint">{t('admin.gallery.dragToReorder', 'Плъзни за пренареждане')}</p>
                    <div className="arag-grid">
                        {filteredItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`arag-item ${dragOverIndex === index ? 'arag-item--drag-over' : ''} ${!item.isPublished ? 'arag-item--unpublished' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                            >
                                <div className="arag-item-media">
                                    {item.mediaType === 'video' ? (
                                        <video src={item.mediaUrl} className="arag-item-thumb" muted />
                                    ) : (
                                        <img src={item.mediaUrl} alt={item.title || ''} className="arag-item-thumb" loading="lazy" />
                                    )}
                                    <span className={`arag-item-type arag-item-type--${item.mediaType}`}>
                                        {item.mediaType === 'video' ? '🎬' : '📷'}
                                    </span>
                                </div>

                                <div className="arag-item-actions">
                                    <button
                                        className={`arag-btn arag-btn--publish ${item.isPublished ? 'arag-btn--active' : ''}`}
                                        onClick={() => handleTogglePublish(item)}
                                        title={item.isPublished ? t('admin.gallery.published', 'Публикувано') : t('admin.gallery.unpublished', 'Скрито')}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            {item.isPublished ? (
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" />
                                            ) : (
                                                <>
                                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                    <button
                                        className="arag-btn arag-btn--delete"
                                        onClick={() => setDeleteConfirm(item)}
                                        title="Изтрий"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Delete confirmation modal */}
            {deleteConfirm && (
                <div className="arag-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="arag-modal" onClick={(e) => e.stopPropagation()}>
                        <p className="arag-modal-text">{t('admin.gallery.deleteConfirm', 'Сигурни ли сте, че искате да изтриете този елемент?')}</p>
                        <div className="arag-modal-actions">
                            <button className="arag-modal-btn arag-modal-btn--cancel" onClick={() => setDeleteConfirm(null)}>
                                Отказ
                            </button>
                            <button className="arag-modal-btn arag-modal-btn--danger" onClick={() => handleDelete(deleteConfirm)}>
                                Изтрий
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
