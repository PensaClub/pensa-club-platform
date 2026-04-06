// AttendanceListUpload.jsx — prefix: alu-
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../../../../firebase';
import { Upload, FileText, Trash2, ExternalLink, Image, Download, Video, Presentation, Link, Plus } from 'lucide-react';
import './attendanceListUpload.css';

const LIST_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PRESENTATION_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const PRESENTATION_EXTENSIONS = '.ppt,.pptx,.pdf,.doc,.docx,.xls,.xlsx,.txt';

const MAX_LIST_SIZE = 10 * 1024 * 1024;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PRESENTATION_SIZE = 20 * 1024 * 1024;

const TABS = [
  { key: 'lists', label: 'Списъци' },
  { key: 'photos', label: 'Снимки' },
  { key: 'videos', label: 'Видеа' },
  { key: 'presentations', label: 'Презентации' },
];

const parseYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (type) => type?.startsWith('image/');

const AttendanceListUpload = ({ seminarId, seminarTitle = '', seminarSlug = '' }) => {
  const { t } = useTranslation('academy-admin');
  const {
    getAttendanceLists, uploadAttendanceList, deleteAttendanceList,
    getSeminarMedia, addSeminarMedia, deleteSeminarMedia,
    uploadToYouTube,
  } = useAcademyCourses();

  const [activeTab, setActiveTab] = useState('lists');

  // Lists state
  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listUploading, setListUploading] = useState(false);
  const [listDragOver, setListDragOver] = useState(false);
  const [listNotes, setListNotes] = useState('');
  const listFileRef = useRef(null);

  // Photos state
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const photoFileRef = useRef(null);

  // Videos state
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoAdding, setVideoAdding] = useState(false);
  const [youtubeUploading, setYoutubeUploading] = useState(false);
  const videoFileRef = useRef(null);

  // Presentations state
  const [presentations, setPresentations] = useState([]);
  const [presentationsLoading, setPresentationsLoading] = useState(true);
  const [presentationUploading, setPresentationUploading] = useState(false);
  const [presentationDragOver, setPresentationDragOver] = useState(false);
  const presentationFileRef = useRef(null);

  // Fetch lists
  const fetchLists = useCallback(async () => {
    try {
      const data = await getAttendanceLists(seminarId);
      setLists(data?.lists || []);
    } catch { setLists([]); }
    finally { setListsLoading(false); }
  }, [seminarId]);

  // Fetch media by type
  const fetchPhotos = useCallback(async () => {
    try {
      const data = await getSeminarMedia(seminarId, 'photo');
      setPhotos(data?.media || []);
    } catch { setPhotos([]); }
    finally { setPhotosLoading(false); }
  }, [seminarId]);

  const fetchVideos = useCallback(async () => {
    try {
      const data = await getSeminarMedia(seminarId, 'video');
      setVideos(data?.media || []);
    } catch { setVideos([]); }
    finally { setVideosLoading(false); }
  }, [seminarId]);

  const fetchPresentations = useCallback(async () => {
    try {
      const data = await getSeminarMedia(seminarId, 'presentation');
      setPresentations(data?.media || []);
    } catch { setPresentations([]); }
    finally { setPresentationsLoading(false); }
  }, [seminarId]);

  useEffect(() => { fetchLists(); fetchPhotos(); fetchVideos(); fetchPresentations(); }, [fetchLists, fetchPhotos, fetchVideos, fetchPresentations]);

  // Upload helpers
  const storagePath = seminarSlug || `id-${seminarId}`;

  const uploadToFirebase = async (file, folder) => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(firebaseStorage, `seminars/${storagePath}/${folder}/${fileName}`);
    const metadata = file.type === 'text/plain'
      ? { contentType: 'text/plain; charset=utf-8' }
      : { contentType: file.type };
    await uploadBytes(storageRef, file, metadata);
    return getDownloadURL(storageRef);
  };

  const downloadFile = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  // === LIST handlers (same as before) ===
  const handleListUpload = async (file) => {
    if (!LIST_TYPES.includes(file.type)) {
      alert(t('attendanceList.invalidType', 'Позволени формати: JPG, PNG, WebP, PDF'));
      return;
    }
    if (file.size > MAX_LIST_SIZE) {
      alert(t('attendanceList.tooLarge', 'Максимален размер: 10MB'));
      return;
    }
    setListUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(firebaseStorage, `seminars/${storagePath}/lists/${fileName}`);
      const metadata = file.type === 'text/plain'
        ? { contentType: 'text/plain; charset=utf-8' }
        : { contentType: file.type };
      await uploadBytes(storageRef, file, metadata);
      const fileUrl = await getDownloadURL(storageRef);
      await uploadAttendanceList(seminarId, {
        fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size,
        notes: listNotes.trim() || null,
      });
      setListNotes('');
      await fetchLists();
    } catch (err) { console.error('Upload error:', err); }
    finally { setListUploading(false); }
  };

  const handleListDelete = async (listId) => {
    if (!confirm(t('attendanceList.confirmDelete', 'Сигурни ли сте?'))) return;
    try { await deleteAttendanceList(seminarId, listId); await fetchLists(); } catch { /* */ }
  };

  // === PHOTO handlers ===
  const handlePhotoUpload = async (file) => {
    if (!PHOTO_TYPES.includes(file.type)) {
      alert(t('attendanceList.photoInvalidType', 'Позволени формати: JPG, PNG, WebP'));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      alert(t('attendanceList.photoTooLarge', 'Максимален размер за снимки: 5MB'));
      return;
    }
    setPhotoUploading(true);
    try {
      const fileUrl = await uploadToFirebase(file, 'photos');
      await addSeminarMedia(seminarId, {
        mediaType: 'photo', fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size,
      });
      await fetchPhotos();
    } catch (err) { console.error('Photo upload error:', err); }
    finally { setPhotoUploading(false); }
  };

  const handlePhotoDelete = async (mediaId) => {
    if (!confirm(t('attendanceList.confirmDelete', 'Сигурни ли сте?'))) return;
    try { await deleteSeminarMedia(seminarId, mediaId); await fetchPhotos(); } catch { /* */ }
  };

  // === VIDEO handlers ===
  const handleVideoAdd = async () => {
    setVideoError('');
    const videoId = parseYouTubeId(videoUrl.trim());
    if (!videoId) {
      setVideoError(t('attendanceList.invalidYouTube', 'Невалиден YouTube линк'));
      return;
    }
    if (!videoTitle.trim()) {
      setVideoError(t('attendanceList.videoTitleRequired', 'Заглавието е задължително'));
      return;
    }
    setVideoAdding(true);
    try {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      await addSeminarMedia(seminarId, {
        mediaType: 'video',
        fileUrl: videoUrl.trim(),
        fileName: videoTitle.trim(),
        thumbnailUrl,
        youtubeVideoId: videoId,
        notes: videoNotes.trim() || null,
      });
      setVideoUrl('');
      setVideoTitle('');
      setVideoNotes('');
      await fetchVideos();
    } catch (err) { console.error('Video add error:', err); }
    finally { setVideoAdding(false); }
  };

  const handleVideoDelete = async (mediaId) => {
    if (!confirm(t('attendanceList.confirmDelete', 'Сигурни ли сте?'))) return;
    try { await deleteSeminarMedia(seminarId, mediaId); await fetchVideos(); } catch { /* */ }
  };

  // === PRESENTATION handlers ===
  const handlePresentationUpload = async (file) => {
    if (!PRESENTATION_TYPES.includes(file.type)) {
      alert(t('attendanceList.presentationInvalidType', 'Позволени формати: PPT, PPTX, PDF, DOC, DOCX, XLS, XLSX, TXT'));
      return;
    }
    if (file.size > MAX_PRESENTATION_SIZE) {
      alert(t('attendanceList.presentationTooLarge', 'Максимален размер за презентации: 20MB'));
      return;
    }
    setPresentationUploading(true);
    try {
      const fileUrl = await uploadToFirebase(file, 'presentations');
      await addSeminarMedia(seminarId, {
        mediaType: 'presentation', fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size,
      });
      await fetchPresentations();
    } catch (err) { console.error('Presentation upload error:', err); }
    finally { setPresentationUploading(false); }
  };

  const handlePresentationDelete = async (mediaId) => {
    if (!confirm(t('attendanceList.confirmDelete', 'Сигурни ли сте?'))) return;
    try { await deleteSeminarMedia(seminarId, mediaId); await fetchPresentations(); } catch { /* */ }
  };

  // Generic drag/drop helpers
  const makeDrop = (handler, setDrag) => ({
    onDragOver: (e) => { e.preventDefault(); setDrag(true); },
    onDragLeave: () => setDrag(false),
    onDrop: (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) handler(f); },
  });

  const makeFileSelect = (handler) => (e) => {
    const f = e.target.files?.[0];
    if (f) handler(f);
    e.target.value = '';
  };

  // Tab counts
  const tabCounts = {
    lists: lists.length,
    photos: photos.length,
    videos: videos.length,
    presentations: presentations.length,
  };

  // Render helpers
  const renderDropzone = (dragOver, uploading, fileRef, dropHandlers, clickHandler, acceptStr, formatLabel) => (
    <div
      className={`alu-dropzone ${dragOver ? 'alu-dropzone-active' : ''} ${uploading ? 'alu-dropzone-uploading' : ''}`}
      {...dropHandlers}
      onClick={() => !uploading && fileRef.current?.click()}
    >
      <input ref={fileRef} type="file" accept={acceptStr} onChange={clickHandler} style={{ display: 'none' }} />
      {uploading ? (
        <div className="alu-uploading">
          <div className="alu-spinner" />
          <span>{t('attendanceList.uploading', 'Качване...')}</span>
        </div>
      ) : (
        <>
          <Upload size={24} />
          <span>{t('attendanceList.dropHint', 'Плъзнете файл тук или кликнете')}</span>
          <span className="alu-dropzone-sub">{formatLabel}</span>
        </>
      )}
    </div>
  );

  const renderFileItem = (item, onDelete, showMeta = true) => (
    <div key={item.id} className="alu-item">
      <div className="alu-item-icon">
        {isImage(item.fileType) ? <Image size={18} /> : <FileText size={18} />}
      </div>
      <div className="alu-item-info">
        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="alu-item-name">
          {item.fileName}
          <ExternalLink size={11} />
        </a>
        {showMeta && (
          <div className="alu-item-meta">
            {formatSize(item.fileSize)} · {item.uploaderName || '—'} · {new Date(item.createdAt).toLocaleDateString('bg-BG')}
            {item.notes && <span className="alu-item-notes"> · {item.notes}</span>}
          </div>
        )}
      </div>
      {item.fileUrl && (
        <button className="alu-item-download" onClick={() => downloadFile(item.fileUrl, item.fileName)} title={t('attendanceList.download', 'Свали')}>
          <Download size={14} />
        </button>
      )}
      <button className="alu-item-delete" onClick={() => onDelete(item.id)} title={t('attendanceList.delete', 'Изтрий')}>
        <Trash2 size={14} />
      </button>
    </div>
  );

  const renderLoading = () => <div className="alu-loading"><div className="alu-spinner" /></div>;
  const renderEmpty = (msg) => <div className="alu-empty">{msg}</div>;

  // === TAB CONTENT ===
  const renderListsTab = () => (
    <>
      <input
        type="text"
        className="alu-notes-input"
        placeholder={t('attendanceList.notesPlaceholder', 'Бележка (незадължително)...')}
        value={listNotes}
        onChange={e => setListNotes(e.target.value)}
        disabled={listUploading}
      />
      {renderDropzone(
        listDragOver, listUploading, listFileRef,
        makeDrop(handleListUpload, setListDragOver),
        makeFileSelect(handleListUpload),
        '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt',
        t('attendanceList.formats', 'JPG, PNG, PDF, Word, Excel, TXT — до 10MB')
      )}
      {listsLoading ? renderLoading() : lists.length === 0
        ? renderEmpty(t('attendanceList.noFiles', 'Няма качени списъци'))
        : <div className="alu-list">{lists.map(item => renderFileItem(item, handleListDelete))}</div>
      }
    </>
  );

  const renderPhotosTab = () => (
    <>
      {renderDropzone(
        photoDragOver, photoUploading, photoFileRef,
        makeDrop(handlePhotoUpload, setPhotoDragOver),
        makeFileSelect(handlePhotoUpload),
        '.jpg,.jpeg,.png,.webp',
        t('attendanceList.photoFormats', 'JPG, PNG, WebP — до 5MB')
      )}
      {photosLoading ? renderLoading() : photos.length === 0
        ? renderEmpty(t('attendanceList.noPhotos', 'Няма качени снимки'))
        : (
          <div className="alu-photo-grid">
            {photos.map(item => (
              <div key={item.id} className="alu-photo-card">
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="alu-photo-thumb">
                  <img src={item.fileUrl} alt={item.fileName} />
                </a>
                <div className="alu-photo-actions">
                  <button className="alu-item-download" onClick={() => downloadFile(item.fileUrl, item.fileName)} title={t('attendanceList.download', 'Свали')}>
                    <Download size={12} />
                  </button>
                  <button className="alu-item-delete" onClick={() => handlePhotoDelete(item.id)} title={t('attendanceList.delete', 'Изтрий')}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </>
  );

  const handleYouTubeFileUpload = async (file) => {
    if (!file) return;
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setVideoError('Позволени формати: MP4, WebM, MOV');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setVideoError('Максимален размер: 500MB');
      return;
    }
    setYoutubeUploading(true);
    setVideoError('');
    try {
      const dateStr = new Date().toLocaleDateString('bg-BG');
      const autoTitle = seminarTitle
        ? `${seminarTitle} - ${dateStr}`
        : `Семинар видео - ${dateStr}`;
      const finalTitle = videoTitle.trim() || autoTitle;

      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', finalTitle);
      formData.append('description', `Семинар: ${seminarTitle || 'DigiBridge Academy'}`);
      formData.append('privacyStatus', 'unlisted');

      const result = await uploadToYouTube(formData);

      if (result?.success && result?.videoUrl) {
        await addSeminarMedia(seminarId, {
          mediaType: 'video',
          fileUrl: result.videoUrl,
          fileName: finalTitle,
          thumbnailUrl: null,
          youtubeVideoId: result.videoId,
        });
        setVideoTitle('');
        await fetchVideos();
      } else {
        setVideoError(result?.message || 'Грешка при качване в YouTube');
      }
    } catch (err) {
      console.error('YouTube upload error:', err);
      setVideoError('Грешка при качване в YouTube');
    } finally {
      setYoutubeUploading(false);
    }
  };

  const renderVideosTab = () => (
    <>
      {/* YouTube link */}
      <div className="alu-video-form">
        <input
          type="text"
          className="alu-notes-input"
          placeholder={t('attendanceList.youtubeUrlPlaceholder', 'YouTube, Vimeo или друг видео линк...')}
          value={videoUrl}
          onChange={e => { setVideoUrl(e.target.value); setVideoError(''); }}
        />
        <input
          type="text"
          className="alu-notes-input"
          placeholder={t('attendanceList.videoTitlePlaceholder', 'Заглавие (незадължително)')}
          value={videoTitle}
          onChange={e => setVideoTitle(e.target.value)}
        />
        {videoError && <div className="alu-video-error">{videoError}</div>}
        <div className="alu-video-actions-row">
          <button
            className="alu-video-add-btn"
            onClick={handleVideoAdd}
            disabled={videoAdding || !videoUrl.trim()}
          >
            {videoAdding ? <div className="alu-spinner alu-spinner-sm" /> : <Link size={16} />}
            {t('attendanceList.addVideoLink', 'Добави видео')}
          </button>
        </div>
      </div>

      {/* File upload to YouTube */}
      <div className="alu-video-upload-section">
        <div
          className={`alu-dropzone ${youtubeUploading ? 'alu-dropzone-uploading' : ''}`}
          onClick={() => !youtubeUploading && videoFileRef.current?.click()}
        >
          <input
            ref={videoFileRef}
            type="file"
            accept=".mp4,.webm,.mov"
            capture="environment"
            onChange={e => { handleYouTubeFileUpload(e.target.files?.[0]); e.target.value = ''; }}
            style={{ display: 'none' }}
          />
          {youtubeUploading ? (
            <div className="alu-uploading">
              <div className="alu-spinner" />
              <span>{t('attendanceList.uploadingYouTube', 'Качване в YouTube...')}</span>
            </div>
          ) : (
            <>
              <Upload size={24} />
              <span>{t('attendanceList.dropVideoHint', 'Пуснете видео файл тук')}</span>
              <span className="alu-dropzone-sub">MP4, WebM, MOV. Макс. 500MB</span>
            </>
          )}
        </div>
      </div>
      {videosLoading ? renderLoading() : videos.length === 0
        ? renderEmpty(t('attendanceList.noVideos', 'Няма добавени видеа'))
        : (
          <div className="alu-video-list">
            {videos.map(item => (
              <div key={item.id} className="alu-video-card">
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="alu-video-thumb"
                >
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.fileName} />
                  ) : null}
                  <div className="alu-video-play">▶</div>
                </a>
                <div className="alu-video-info">
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="alu-item-name">
                    {item.fileName}
                    <ExternalLink size={11} />
                  </a>
                  {item.notes && <div className="alu-item-meta">{item.notes}</div>}
                  <div className="alu-item-meta">
                    {item.uploaderName || '—'} · {new Date(item.createdAt).toLocaleDateString('bg-BG')}
                  </div>
                </div>
                <button className="alu-item-delete" onClick={() => handleVideoDelete(item.id)} title={t('attendanceList.delete', 'Изтрий')}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      }
    </>
  );

  const renderPresentationsTab = () => (
    <>
      {renderDropzone(
        presentationDragOver, presentationUploading, presentationFileRef,
        makeDrop(handlePresentationUpload, setPresentationDragOver),
        makeFileSelect(handlePresentationUpload),
        PRESENTATION_EXTENSIONS,
        t('attendanceList.presentationFormats', 'PPT, PPTX, PDF, DOC, DOCX, XLS, XLSX, TXT — до 20MB')
      )}
      {presentationsLoading ? renderLoading() : presentations.length === 0
        ? renderEmpty(t('attendanceList.noPresentations', 'Няма качени презентации'))
        : <div className="alu-list">{presentations.map(item => renderFileItem(item, handlePresentationDelete))}</div>
      }
    </>
  );

  const tabContent = {
    lists: renderListsTab,
    photos: renderPhotosTab,
    videos: renderVideosTab,
    presentations: renderPresentationsTab,
  };

  return (
    <div className="alu-container">
      <div className="alu-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`alu-tab ${activeTab === tab.key ? 'alu-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(`attendanceList.tab_${tab.key}`, tab.label)}
            {tabCounts[tab.key] > 0 && <span className="alu-tab-count">{tabCounts[tab.key]}</span>}
          </button>
        ))}
      </div>

      <div className="alu-tab-content">
        {tabContent[activeTab]()}
      </div>
    </div>
  );
};

export default AttendanceListUpload;
