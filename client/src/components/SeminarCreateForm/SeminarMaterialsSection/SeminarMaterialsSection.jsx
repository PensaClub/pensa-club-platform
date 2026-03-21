import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
    Paperclip, Upload, Trash2, Link2, FileQuestion,
    FileText, File, FileSpreadsheet, FileImage, Film, Music, Archive, Image as ImageIcon
} from 'lucide-react';
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './seminarMaterialsSection.css';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ACCEPT_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.zip,.rar,.mp4,.webm,.mov,.ogg,.7z,.svg';

const getMaterialType = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx', 'txt', 'csv'].includes(ext)) return 'document';
    if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(ext)) return 'presentation';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    return 'other';
};

const getTypeIcon = (type) => {
    const icons = {
        pdf: File, document: FileText, spreadsheet: FileSpreadsheet,
        presentation: FileImage, image: ImageIcon, video: Film,
        audio: Music, archive: Archive, link: Link2, other: FileQuestion
    };
    return icons[type] || FileQuestion;
};

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function SeminarMaterialsSection({ seminarId, seminarSlug }) {
    const { t } = useTranslation('academy-admin');
    const { getSeminarMaterials, addSeminarMaterial, deleteSeminarMaterial } = useAcademyCourses();
    const { uploadMultipleFiles, uploading, uploadProgress } = useFirebaseUpload();

    const [materials, setMaterials] = useState([]);          // saved in DB
    const [pendingMaterials, setPendingMaterials] = useState([]); // uploaded to Firebase, not yet in DB
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [urlTitle, setUrlTitle] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const flushedRef = useRef(false);

    // Load saved materials when seminarSlug is available (edit mode)
    useEffect(() => {
        if (!seminarSlug) return;
        const loadMaterials = async () => {
            try {
                const data = await getSeminarMaterials(seminarSlug);
                setMaterials(data?.materials || data || []);
            } catch (err) {
                console.error('Failed to load seminar materials:', err);
            }
        };
        loadMaterials();
    }, [seminarSlug]);

    // Flush pending materials to backend when seminarSlug becomes available
    useEffect(() => {
        if (!seminarSlug || pendingMaterials.length === 0 || flushedRef.current) return;
        flushedRef.current = true;

        const flushPending = async () => {
            for (const pending of pendingMaterials) {
                try {
                    const resp = await addSeminarMaterial(seminarSlug, pending);
                    const saved = resp?.material || resp;
                    if (saved?.id) setMaterials(prev => [...prev, saved]);
                } catch (err) {
                    console.error('Failed to save pending material:', err);
                }
            }
            setPendingMaterials([]);
            flushedRef.current = false;
        };
        flushPending();
    }, [seminarSlug, pendingMaterials]);

    const handleFiles = useCallback(async (files) => {
        if (!files?.length) return;

        const validFiles = Array.from(files).filter(f => {
            if (f.size > MAX_FILE_SIZE) {
                toast.warning(t('seminarMaterials.fileTooLarge', 'Файлът е твърде голям. Максимум 50MB.'));
                return false;
            }
            return true;
        });

        if (!validFiles.length) return;

        try {
            const results = await uploadMultipleFiles(validFiles, 'academy/materials/seminars');

            for (const result of results) {
                const materialData = {
                    title: result.name,
                    materialType: getMaterialType(result.name),
                    fileUrl: result.url,
                    fileName: result.name,
                    fileSize: result.size,
                    mimeType: result.type,
                    isDownloadable: true
                };

                if (seminarSlug) {
                    // Seminar exists → save to backend immediately
                    const resp = await addSeminarMaterial(seminarSlug, materialData);
                    const saved = resp?.material || resp;
                    if (saved?.id) setMaterials(prev => [...prev, saved]);
                } else {
                    // Seminar not saved yet → store as pending
                    setPendingMaterials(prev => [...prev, materialData]);
                }
            }
            toast.success(t('seminarMaterials.uploadSuccess', 'Материалът е качен успешно'));
        } catch (err) {
            console.error('Failed to upload materials:', err);
            toast.error(t('seminarMaterials.uploadError', 'Грешка при качване на файла'));
        }
    }, [seminarSlug, uploadMultipleFiles, addSeminarMaterial, t]);

    const handleDeleteSaved = useCallback(async (materialId) => {
        try {
            await deleteSeminarMaterial('seminar', seminarId, materialId);
            setMaterials(prev => prev.filter(m => m.id !== materialId));
            toast.success(t('seminarMaterials.deleteSuccess', 'Материалът е изтрит'));
        } catch (err) {
            console.error('Failed to delete material:', err);
            toast.error(t('seminarMaterials.deleteError', 'Грешка при изтриване'));
        }
    }, [seminarId, deleteSeminarMaterial, t]);

    const handleDeletePending = useCallback((index) => {
        setPendingMaterials(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleAddUrl = useCallback(async () => {
        if (!urlInput.trim()) return;

        const materialData = {
            title: urlTitle.trim() || urlInput.trim(),
            materialType: 'link',
            externalUrl: urlInput.trim(),
            isDownloadable: false
        };

        if (seminarSlug) {
            try {
                const resp = await addSeminarMaterial(seminarSlug, materialData);
                const saved = resp?.material || resp;
                if (saved?.id) setMaterials(prev => [...prev, saved]);
                toast.success(t('seminarMaterials.addUrlSuccess', 'Линкът е добавен успешно'));
            } catch (err) {
                console.error('Failed to add URL material:', err);
                toast.error(t('seminarMaterials.addUrlError', 'Грешка при добавяне на линка'));
            }
        } else {
            setPendingMaterials(prev => [...prev, materialData]);
        }

        setUrlInput('');
        setUrlTitle('');
        setShowUrlInput(false);
    }, [urlInput, urlTitle, seminarSlug, addSeminarMaterial, t]);

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
        ...materials.map(m => ({ ...m, _saved: true })),
        ...pendingMaterials.map((m, i) => ({ ...m, _saved: false, _pendingIndex: i, id: `pending-${i}` }))
    ];

    return (
        <div className="scfm-section">
            <div className="scfm-section-header">
                <Paperclip size={20} />
                <h2 className="scfm-section-title">
                    {t('seminarMaterials.title', 'Материали')}
                </h2>
            </div>
            <p className="scfm-section-desc">
                {t('seminarMaterials.desc', 'Добавете файлове и връзки към допълнителни ресурси за семинара.')}
            </p>

            {/* Materials list (saved + pending) */}
            {allItems.length > 0 && (
                <div className="scfm-list">
                    {allItems.map(m => {
                        const TypeIcon = getTypeIcon(m.materialType);
                        return (
                            <div key={m.id} className={`scfm-item${!m._saved ? ' scfm-item-pending' : ''}`}>
                                <TypeIcon size={18} className="scfm-item-icon" />
                                <div className="scfm-item-info">
                                    <span className="scfm-item-name">
                                        {m.title || m.originalFileName || m.fileName}
                                    </span>
                                    <span className="scfm-item-meta">
                                        {m.materialType === 'link'
                                            ? (m.externalUrl || '')
                                            : formatFileSize(m.fileSize)}
                                        {!m._saved && (
                                            <span className="scfm-item-pending-badge">
                                                {t('seminarMaterials.pendingBadge', '• ще се запази с черновата')}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <button
                                    className="scfm-item-delete"
                                    onClick={() => m._saved ? handleDeleteSaved(m.id) : handleDeletePending(m._pendingIndex)}
                                    title={t('seminarMaterials.delete', 'Изтрий')}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload zone (drag & drop) */}
            <div
                className={`scfm-upload-zone${dragActive ? ' scfm-upload-zone-active' : ''}${uploading ? ' scfm-upload-zone-uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPT_TYPES}
                    className="scfm-upload-input"
                    onChange={handleFileInputChange}
                />
                {uploading ? (
                    <div className="scfm-upload-progress">
                        <div className="scfm-upload-progress-bar">
                            <div className="scfm-upload-progress-fill" style={{ width: `${avgProgress}%` }} />
                        </div>
                        <span className="scfm-upload-progress-text">{avgProgress}%</span>
                    </div>
                ) : (
                    <>
                        <Upload size={24} />
                        <span className="scfm-upload-text">
                            {t('seminarMaterials.dropHint', 'Пуснете файлове тук')}
                        </span>
                    </>
                )}
            </div>

            {/* Upload button */}
            <button
                type="button"
                className="scfm-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                <Upload size={16} />
                {t('seminarMaterials.uploadBtn', 'Качи файлове')}
            </button>

            <span className="scfm-upload-hint">
                {t('seminarMaterials.formats', 'PDF, Word, Excel, PowerPoint, снимки, архиви и др. Макс. 50MB на файл')}
            </span>

            {/* URL input toggle */}
            <button
                type="button"
                className="scfm-url-toggle"
                onClick={() => setShowUrlInput(prev => !prev)}
            >
                <Link2 size={14} />
                {t('seminarMaterials.orAddUrl', 'Или добави чрез URL')}
            </button>

            {showUrlInput && (
                <div className="scfm-url-form">
                    <input
                        className="scfm-url-input"
                        type="url"
                        placeholder={t('seminarMaterials.urlPlaceholder', 'https://example.com/document.pdf')}
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                    />
                    <input
                        className="scfm-url-input"
                        type="text"
                        placeholder={t('seminarMaterials.urlTitle', 'Заглавие (незадължително)')}
                        value={urlTitle}
                        onChange={e => setUrlTitle(e.target.value)}
                    />
                    <button
                        type="button"
                        className="scfm-url-btn"
                        onClick={handleAddUrl}
                        disabled={!urlInput.trim()}
                    >
                        {t('seminarMaterials.addUrl', 'Добави')}
                    </button>
                </div>
            )}
        </div>
    );
}
