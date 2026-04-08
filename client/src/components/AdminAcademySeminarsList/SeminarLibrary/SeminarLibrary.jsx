// src/components/AdminAcademySeminarsList/SeminarLibrary/SeminarLibrary.jsx
// Prefix: slib-

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../../../firebase';
import {
  FileText, Download, Trash2, ChevronLeft, ChevronRight, Search,
  Calendar, Upload, Image, ExternalLink, Video, Presentation,
  Plus, FileBarChart, X, ChevronDown, ChevronUp, Link,
  CheckSquare, Square, Archive,
} from 'lucide-react';
import './seminarLibrary.css';

// ─── Constants ──────────────────────────────────────────────
const SUBTABS = [
  { key: 'reports', label: 'Доклади' },
  { key: 'seminars', label: 'Семинари' },
];

const MONTHS = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември',
];

const MEDIA_TABS = [
  { key: 'lists', label: 'Списъци', icon: FileText },
  { key: 'photos', label: 'Снимки', icon: Image },
  { key: 'videos', label: 'Видеа', icon: Video },
  { key: 'presentations', label: 'Презентации', icon: Presentation },
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
const LIST_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const PRESENTATION_EXTENSIONS = '.ppt,.pptx,.pdf,.doc,.docx,.xls,.xlsx,.txt';

const MAX_LIST_SIZE = 10 * 1024 * 1024;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PRESENTATION_SIZE = 20 * 1024 * 1024;

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

const TYPE_LABELS = {
  inperson: 'Присъствен',
  online: 'Онлайн',
  hybrid: 'Хибриден',
};

// ─── Component ──────────────────────────────────────────────
const SeminarLibrary = () => {
  const { t } = useTranslation('academy-admin');
  const { theme } = useTheme();
  const {
    getLibrarySeminars,
    getSeminarMedia,
    addSeminarMedia,
    deleteSeminarMedia,
    deleteAttendanceList,
    getAttendanceLists,
    uploadAttendanceList,
    getMonthlyReports,
    createMonthlyReport,
    autoGenerateReports,
    deleteMonthlyReport,
    uploadToYouTube,
  } = useAcademyCourses();

  // Hash-based sub-tab routing — format: #library/reports, #library/seminars
  const getInitialSubtab = () => {
    const hash = window.location.hash?.replace('#', '') || '';
    const parts = hash.split('/');
    if (parts[0] === 'library' && SUBTABS.some(t => t.key === parts[1])) {
      return parts[1];
    }
    return 'reports';
  };

  const [activeSubtab, setActiveSubtab] = useState(getInitialSubtab);

  const handleSubtabChange = (key) => {
    setActiveSubtab(key);
    window.location.hash = `library/${key}`;
  };

  // ═══════════════════════════════════════════════════════════
  //                      REPORTS STATE
  // ═══════════════════════════════════════════════════════════
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsPagination, setReportsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [reportYearFilter, setReportYearFilter] = useState('all');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportMonth, setReportMonth] = useState(currentMonth);
  const [reportYear, setReportYear] = useState(currentYear);
  const [reportCreating, setReportCreating] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportDownloading, setReportDownloading] = useState(null);

  // ═══════════════════════════════════════════════════════════
  //                    SEMINARS STATE
  // ═══════════════════════════════════════════════════════════
  const [seminars, setSeminars] = useState([]);
  const [seminarsLoading, setSeminarsLoading] = useState(false);
  const [seminarsPagination, setSeminarsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [seminarSearch, setSeminarSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [seminarMediaFilter, setSeminarMediaFilter] = useState('all');
  const [seminarSort, setSeminarSort] = useState('date-desc');
  const [expandedSeminar, setExpandedSeminar] = useState(null);
  const [activeMediaTab, setActiveMediaTab] = useState('lists');

  // Media state for expanded seminar
  const [mediaItems, setMediaItems] = useState({ lists: [], photos: [], videos: [], presentations: [] });
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaDragOver, setMediaDragOver] = useState(false);

  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);

  // Video form
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoAdding, setVideoAdding] = useState(false);
  const [youtubeUploading, setYoutubeUploading] = useState(false);

  const fileInputRef = useRef(null);
  const videoFileRef = useRef(null);

  // ═══════════════════════════════════════════════════════════
  //                    REPORTS LOGIC
  // ═══════════════════════════════════════════════════════════
  const fetchReports = useCallback(async (page = 1) => {
    setReportsLoading(true);
    try {
      const params = { page, limit: 12 };
      if (reportYearFilter !== 'all') params.year = reportYearFilter;
      const data = await getMonthlyReports(params);
      setReports(data?.reports || []);
      setReportsPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, [getMonthlyReports, reportYearFilter]);

  useEffect(() => {
    if (activeSubtab === 'reports') fetchReports(1);
  }, [activeSubtab, reportYearFilter]);

  const handleCreateReport = async () => {
    setReportError('');
    setReportCreating(true);
    try {
      await createMonthlyReport({ month: reportMonth, year: reportYear });
      setShowReportForm(false);
      await fetchReports(1);
    } catch (err) {
      if (err?.response?.status === 409 || err?.status === 409) {
        setReportError(t('seminarLibrary.reportDuplicate', 'Вече има доклад за този месец'));
      } else {
        setReportError(t('seminarLibrary.reportError', 'Грешка при създаване на доклад'));
      }
      console.error('Error creating report:', err);
    } finally {
      setReportCreating(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm(t('seminarLibrary.confirmDeleteReport', 'Сигурни ли сте, че искате да изтриете този доклад?'))) return;
    try {
      await deleteMonthlyReport(reportId);
      await fetchReports(reportsPagination.page);
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const handleDownloadReport = async (report) => {
    setReportDownloading(report.id);
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const url = `${baseUrl}/academy/seminars/admin/export-report?month=${report.month}&year=${report.year}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `seminar-report-${report.year}-${String(report.month).padStart(2, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading report:', err);
    } finally {
      setReportDownloading(null);
    }
  };

  const handleReportPageChange = (newPage) => {
    if (newPage < 1 || newPage > reportsPagination.totalPages) return;
    fetchReports(newPage);
  };

  // ═══════════════════════════════════════════════════════════
  //                    SEMINARS LOGIC
  // ═══════════════════════════════════════════════════════════
  const fetchSeminars = useCallback(async (page = 1) => {
    setSeminarsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const data = await getLibrarySeminars(params);
      setSeminars(data?.seminars || []);
      setSeminarsPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching library seminars:', err);
      setSeminars([]);
    } finally {
      setSeminarsLoading(false);
    }
  }, [getLibrarySeminars, debouncedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(seminarSearch), 300);
    return () => clearTimeout(timeout);
  }, [seminarSearch]);

  useEffect(() => {
    if (activeSubtab === 'seminars') fetchSeminars(1);
  }, [activeSubtab, debouncedSearch]);

  const handleSeminarPageChange = (newPage) => {
    if (newPage < 1 || newPage > seminarsPagination.totalPages) return;
    fetchSeminars(newPage);
  };

  // ═══════════════════════════════════════════════════════════
  //                    MEDIA LOGIC
  // ═══════════════════════════════════════════════════════════
  const fetchMedia = useCallback(async (seminarId) => {
    setMediaLoading(true);
    try {
      const [listsData, photosData, videosData, presentationsData] = await Promise.all([
        getAttendanceLists(seminarId).catch(() => ({ lists: [] })),
        getSeminarMedia(seminarId, 'photo').catch(() => ({ media: [] })),
        getSeminarMedia(seminarId, 'video').catch(() => ({ media: [] })),
        getSeminarMedia(seminarId, 'presentation').catch(() => ({ media: [] })),
      ]);
      setMediaItems({
        lists: listsData?.lists || [],
        photos: photosData?.media || [],
        videos: videosData?.media || [],
        presentations: presentationsData?.media || [],
      });
    } catch {
      setMediaItems({ lists: [], photos: [], videos: [], presentations: [] });
    } finally {
      setMediaLoading(false);
    }
  }, [getSeminarMedia, getAttendanceLists]);

  const handleExpandSeminar = (seminarId) => {
    setSelectedItems(new Set());
    if (expandedSeminar === seminarId) {
      setExpandedSeminar(null);
      return;
    }
    setExpandedSeminar(seminarId);
    setActiveMediaTab('lists');
    fetchMedia(seminarId);
  };

  const handleMediaTabChange = (tab) => {
    setSelectedItems(new Set());
    setActiveMediaTab(tab);
  };

  // ─── Bulk selection helpers ─────────────────────────────────
  const getItemKey = (tab, id) => `${tab === 'lists' ? 'list' : tab === 'photos' ? 'photo' : 'pres'}-${id}`;

  const toggleSelectItem = (key) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (activeMediaTab === 'videos') return;
    const items = mediaItems[activeMediaTab] || [];
    const allKeys = items.map(item => getItemKey(activeMediaTab, item.id));
    const allSelected = allKeys.length > 0 && allKeys.every(k => selectedItems.has(k));
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allKeys));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0 || !expandedSeminar) return;
    if (!confirm(`Сигурни ли сте, че искате да изтриете ${selectedItems.size} файла?`)) return;
    setBulkDeleting(true);
    try {
      const promises = [];
      for (const key of selectedItems) {
        const [type, id] = key.split('-');
        const numId = Number(id);
        if (type === 'list') {
          promises.push(deleteAttendanceList(expandedSeminar, numId));
        } else {
          promises.push(deleteSeminarMedia(expandedSeminar, numId));
        }
      }
      await Promise.all(promises);
      setSelectedItems(new Set());
      await fetchMedia(expandedSeminar);
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDownloadAllZip = async (seminarId) => {
    setZipDownloading(true);
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const url = `${baseUrl}/academy/seminars/${seminarId}/download-all`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const sem = seminars.find(s => s.id === seminarId);
      const fileName = `${(sem?.title || 'seminar').replace(/[^a-zA-Z0-9а-яА-Я\s-]/g, '').trim()}-files.zip`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading ZIP:', err);
    } finally {
      setZipDownloading(false);
    }
  };

  const getStoragePath = (semId) => {
    const sem = seminars.find(s => s.id === semId);
    return sem?.slug || `id-${semId}`;
  };

  const uploadToFirebase = async (file, folder, seminarId) => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(firebaseStorage, `seminars/${getStoragePath(seminarId)}/${folder}/${fileName}`);
    const metadata = file.type === 'text/plain'
      ? { contentType: 'text/plain; charset=utf-8' }
      : { contentType: file.type };
    await uploadBytes(storageRef, file, metadata);
    return getDownloadURL(storageRef);
  };

  const downloadFile = (url, name) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  // File upload handler (lists, photos, presentations)
  const handleFileUpload = async (file) => {
    if (!expandedSeminar) return;

    let mediaType, maxSize, allowedTypes, folder;
    if (activeMediaTab === 'lists') {
      mediaType = 'list';
      maxSize = MAX_LIST_SIZE;
      allowedTypes = LIST_TYPES;
      folder = null;
    } else if (activeMediaTab === 'photos') {
      mediaType = 'photo';
      maxSize = MAX_PHOTO_SIZE;
      allowedTypes = PHOTO_TYPES;
      folder = 'photos';
    } else if (activeMediaTab === 'presentations') {
      mediaType = 'presentation';
      maxSize = MAX_PRESENTATION_SIZE;
      allowedTypes = PRESENTATION_TYPES;
      folder = 'presentations';
    } else return;

    if (!allowedTypes.includes(file.type)) {
      alert(t('seminarLibrary.invalidFileType', 'Невалиден формат на файл'));
      return;
    }
    if (file.size > maxSize) {
      alert(t('seminarLibrary.fileTooLarge', 'Файлът е твърде голям'));
      return;
    }

    setMediaUploading(true);
    try {
      let fileUrl;
      if (activeMediaTab === 'lists') {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(firebaseStorage, `seminars/${getStoragePath(expandedSeminar)}/lists/${fileName}`);
        const metadata = file.type === 'text/plain' ? { contentType: 'text/plain; charset=utf-8' } : { contentType: file.type };
        await uploadBytes(storageRef, file, metadata);
        fileUrl = await getDownloadURL(storageRef);
        await uploadAttendanceList(expandedSeminar, {
          fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size,
        });
      } else {
        fileUrl = await uploadToFirebase(file, folder, expandedSeminar);
        await addSeminarMedia(expandedSeminar, {
          mediaType, fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size,
        });
      }
      await fetchMedia(expandedSeminar);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setMediaUploading(false);
    }
  };

  const handleYouTubeFileUpload = async (file) => {
    if (!file || !expandedSeminar) return;
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
      const semTitle = seminars.find(s => s.id === expandedSeminar)?.title || '';
      const dateStr = new Date().toLocaleDateString('bg-BG');
      const autoTitle = semTitle ? `${semTitle} - ${dateStr}` : `Семинар видео - ${dateStr}`;
      const finalTitle = videoTitle.trim() || autoTitle;

      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', finalTitle);
      formData.append('description', `Семинар: ${semTitle || 'DigiBridge Academy'}`);
      formData.append('privacyStatus', 'unlisted');

      const result = await uploadToYouTube(formData);
      if (result?.success && result?.videoUrl) {
        await addSeminarMedia(expandedSeminar, {
          mediaType: 'video',
          fileUrl: result.videoUrl,
          fileName: finalTitle,
          thumbnailUrl: null,
          youtubeVideoId: result.videoId,
        });
        setVideoTitle('');
        await fetchMedia(expandedSeminar);
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

  const handleVideoAdd = async () => {
    if (!expandedSeminar) return;
    setVideoError('');
    const videoId = parseYouTubeId(videoUrl.trim());
    if (!videoId) {
      setVideoError(t('seminarLibrary.invalidYouTube', 'Невалиден YouTube линк'));
      return;
    }
    if (!videoTitle.trim()) {
      setVideoError(t('seminarLibrary.videoTitleRequired', 'Заглавието е задължително'));
      return;
    }
    setVideoAdding(true);
    try {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      await addSeminarMedia(expandedSeminar, {
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
      await fetchMedia(expandedSeminar);
    } catch (err) {
      console.error('Video add error:', err);
    } finally {
      setVideoAdding(false);
    }
  };

  const handleMediaDelete = async (mediaId) => {
    if (!expandedSeminar) return;
    if (!confirm(t('seminarLibrary.confirmDelete', 'Сигурни ли сте?'))) return;
    try {
      await deleteSeminarMedia(expandedSeminar, mediaId);
      await fetchMedia(expandedSeminar);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Drag & drop helpers
  const makeDrop = (handler) => ({
    onDragOver: (e) => { e.preventDefault(); setMediaDragOver(true); },
    onDragLeave: () => setMediaDragOver(false),
    onDrop: (e) => { e.preventDefault(); setMediaDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handler(f); },
  });

  const makeFileSelect = (handler) => (e) => {
    const f = e.target.files?.[0];
    if (f) handler(f);
    e.target.value = '';
  };

  const getAcceptString = () => {
    if (activeMediaTab === 'lists') return '.jpg,.jpeg,.png,.webp,.pdf';
    if (activeMediaTab === 'photos') return '.jpg,.jpeg,.png,.webp';
    if (activeMediaTab === 'presentations') return PRESENTATION_EXTENSIONS;
    return '';
  };

  const getFormatLabel = () => {
    if (activeMediaTab === 'lists') return t('seminarLibrary.listFormats', 'JPG, PNG, WebP, PDF — до 10MB');
    if (activeMediaTab === 'photos') return t('seminarLibrary.photoFormats', 'JPG, PNG, WebP — до 5MB');
    if (activeMediaTab === 'presentations') return t('seminarLibrary.presentationFormats', 'PPT, PPTX, PDF, DOC, DOCX, XLS, XLSX, TXT — до 20MB');
    return '';
  };

  // ═══════════════════════════════════════════════════════════
  //                    RENDER HELPERS
  // ═══════════════════════════════════════════════════════════
  const renderSpinner = () => (
    <div className="slib-loading"><div className="slib-spinner" /></div>
  );

  const renderEmpty = (msg) => (
    <div className="slib-empty">{msg}</div>
  );

  // Year options for filter
  const yearOptions = [];
  for (let y = currentYear; y >= currentYear - 5; y--) yearOptions.push(y);

  // ═══════════════════════════════════════════════════════════
  //                    REPORTS TAB
  // ═══════════════════════════════════════════════════════════
  const renderReportsTab = () => (
    <div className="slib-reports">
      {/* Toolbar */}
      <div className="slib-toolbar">
        <div className="slib-toolbar-left">
          <select
            className="slib-select"
            value={reportYearFilter}
            onChange={(e) => setReportYearFilter(e.target.value)}
          >
            <option value="all">{t('seminarLibrary.allYears', 'Всички години')}</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="slib-btn-group">
          <button
            className="slib-btn slib-btn-secondary"
            onClick={async () => {
              try {
                await autoGenerateReports();
                await fetchReports(1);
              } catch { /* handled in provider */ }
            }}
          >
            {t('seminarLibrary.autoGenerate', 'Генерирай всички')}
          </button>
          <button
            className="slib-btn slib-btn-primary"
            onClick={() => { setShowReportForm(true); setReportError(''); }}
          >
            <FileBarChart size={16} />
            {t('seminarLibrary.generateReport', 'Генерирай доклад')}
          </button>
        </div>
      </div>

      {/* Report form modal */}
      {showReportForm && (
        <div className="slib-report-form-overlay" onClick={() => setShowReportForm(false)}>
          <div className="slib-report-form" onClick={(e) => e.stopPropagation()}>
            <div className="slib-report-form-header">
              <h3>{t('seminarLibrary.newReport', 'Нов месечен доклад')}</h3>
              <button className="slib-close-btn" onClick={() => setShowReportForm(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="slib-report-form-body">
              <div className="slib-form-row">
                <label>{t('seminarLibrary.month', 'Месец')}</label>
                <select
                  className="slib-select"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="slib-form-row">
                <label>{t('seminarLibrary.year', 'Година')}</label>
                <input
                  type="number"
                  className="slib-input"
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  min={2020}
                  max={currentYear + 1}
                />
              </div>
              {reportError && <div className="slib-form-error">{reportError}</div>}
            </div>
            <div className="slib-report-form-actions">
              <button
                className="slib-btn slib-btn-secondary"
                onClick={() => setShowReportForm(false)}
                disabled={reportCreating}
              >
                {t('seminarLibrary.cancel', 'Отказ')}
              </button>
              <button
                className="slib-btn slib-btn-primary"
                onClick={handleCreateReport}
                disabled={reportCreating}
              >
                {reportCreating && <div className="slib-spinner slib-spinner-sm" />}
                {t('seminarLibrary.create', 'Създай')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports list */}
      {reportsLoading ? renderSpinner() : reports.length === 0 ? (
        renderEmpty(t('seminarLibrary.noReports', 'Няма генерирани доклади'))
      ) : (
        <>
          <div className="slib-reports-table">
            <div className="slib-table-header">
              <span className="slib-th slib-th-period">{t('seminarLibrary.period', 'Период')}</span>
              <span className="slib-th slib-th-seminars">{t('seminarLibrary.seminarsCount', 'Семинари')}</span>
              <span className="slib-th slib-th-attendees">{t('seminarLibrary.attendeesCount', 'Участници')}</span>
              <span className="slib-th slib-th-credits">{t('seminarLibrary.credits', 'Кредити')}</span>
              <span className="slib-th slib-th-date">{t('seminarLibrary.dateGenerated', 'Дата')}</span>
              <span className="slib-th slib-th-actions">{t('seminarLibrary.actions', 'Действия')}</span>
            </div>
            {reports.map((report) => (
              <div key={report.id} className={`slib-table-row ${report.seminarsCount === 0 ? 'slib-row-empty' : ''}`}>
                <span className="slib-td slib-td-period">
                  <Calendar size={14} />
                  {MONTHS[report.month - 1]} {report.year}
                </span>
                <span className="slib-td slib-td-seminars">{report.seminarsCount ?? '—'}</span>
                <span className="slib-td slib-td-attendees">{report.attendeesCount ?? '—'}</span>
                <span className="slib-td slib-td-credits">{report.creditsCount ?? '—'}</span>
                <span className="slib-td slib-td-date">
                  {report.createdAt ? new Date(report.createdAt).toLocaleDateString('bg-BG') : '—'}
                </span>
                <span className="slib-td slib-td-actions">
                  {report.seminarsCount === 0 ? (
                    <span className="slib-no-seminars">{t('seminarLibrary.noSeminarsForMonth', 'Няма семинари')}</span>
                  ) : (
                    <button
                      className="slib-action-btn slib-action-download"
                      onClick={() => handleDownloadReport(report)}
                      disabled={reportDownloading === report.id}
                      title={t('seminarLibrary.download', 'Свали')}
                    >
                      {reportDownloading === report.id
                        ? <div className="slib-spinner slib-spinner-sm" />
                        : <Download size={14} />
                      }
                    </button>
                  )}
                  <button
                    className="slib-action-btn slib-action-delete"
                    onClick={() => handleDeleteReport(report.id)}
                    title={t('seminarLibrary.delete', 'Изтрий')}
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            ))}
          </div>

          {reportsPagination.totalPages > 1 && (
            <div className="slib-pagination">
              <button
                className="slib-page-btn"
                onClick={() => handleReportPageChange(reportsPagination.page - 1)}
                disabled={reportsPagination.page <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="slib-page-info">
                {reportsPagination.page} / {reportsPagination.totalPages}
              </span>
              <button
                className="slib-page-btn"
                onClick={() => handleReportPageChange(reportsPagination.page + 1)}
                disabled={reportsPagination.page >= reportsPagination.totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  //                SEMINARS MEDIA SECTION
  // ═══════════════════════════════════════════════════════════
  const renderMediaSection = (seminarId) => {
    const items = mediaItems[activeMediaTab] || [];
    const mediaCounts = {
      lists: mediaItems.lists.length,
      photos: mediaItems.photos.length,
      videos: mediaItems.videos.length,
      presentations: mediaItems.presentations.length,
    };
    const hasDownloadableFiles = mediaCounts.lists + mediaCounts.photos + mediaCounts.presentations > 0;
    const isSelectableTab = activeMediaTab !== 'videos';
    const currentKeys = isSelectableTab ? items.map(item => getItemKey(activeMediaTab, item.id)) : [];
    const allSelected = currentKeys.length > 0 && currentKeys.every(k => selectedItems.has(k));

    return (
      <div className="slib-media-section">
        {/* Media subtabs + download all */}
        <div className="slib-media-tabs-row">
          <div className="slib-media-tabs">
            {MEDIA_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`slib-media-tab ${activeMediaTab === key ? 'slib-media-tab-active' : ''}`}
                onClick={() => handleMediaTabChange(key)}
              >
                <Icon size={14} />
                {t(`seminarLibrary.mediaTab_${key}`, label)}
                {mediaCounts[key] > 0 && <span className="slib-media-tab-count">{mediaCounts[key]}</span>}
              </button>
            ))}
          </div>
          <button
            className="slib-btn slib-btn-primary slib-btn-sm slib-download-all-btn"
            onClick={() => handleDownloadAllZip(seminarId)}
            disabled={!hasDownloadableFiles || zipDownloading}
            title={!hasDownloadableFiles ? 'Няма файлове за сваляне' : 'Свали всички файлове като ZIP'}
          >
            {zipDownloading ? <div className="slib-spinner slib-spinner-sm" /> : <Archive size={14} />}
            Свали всички (ZIP)
          </button>
        </div>

        {mediaLoading ? renderSpinner() : (
          <div className="slib-media-content">
            {/* Select all checkbox (not for videos) */}
            {isSelectableTab && items.length > 0 && (
              <div className="slib-select-all-row">
                <label className="slib-checkbox-label" onClick={toggleSelectAll}>
                  <span className={`slib-checkbox ${allSelected ? 'slib-checkbox-checked' : ''}`}>
                    {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </span>
                  <span>Избери всички ({items.length})</span>
                </label>
              </div>
            )}

            {/* Upload area (not for videos) */}
            {activeMediaTab !== 'videos' && (
              <div
                className={`slib-dropzone ${mediaDragOver ? 'slib-dropzone-active' : ''} ${mediaUploading ? 'slib-dropzone-uploading' : ''}`}
                {...makeDrop(handleFileUpload)}
                onClick={() => !mediaUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptString()}
                  onChange={makeFileSelect(handleFileUpload)}
                  style={{ display: 'none' }}
                />
                {mediaUploading ? (
                  <div className="slib-uploading">
                    <div className="slib-spinner" />
                    <span>{t('seminarLibrary.uploading', 'Качване...')}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>{t('seminarLibrary.dropHint', 'Плъзнете файл тук или кликнете')}</span>
                    <span className="slib-dropzone-sub">{getFormatLabel()}</span>
                  </>
                )}
              </div>
            )}

            {/* Video form */}
            {activeMediaTab === 'videos' && (
              <>
                <div className="slib-video-form">
                  <input
                    type="text"
                    className="slib-input"
                    placeholder={t('seminarLibrary.youtubeUrl', 'YouTube, Vimeo или друг видео линк...')}
                    value={videoUrl}
                    onChange={(e) => { setVideoUrl(e.target.value); setVideoError(''); }}
                  />
                  <input
                    type="text"
                    className="slib-input"
                    placeholder={t('seminarLibrary.videoTitle', 'Заглавие (незадължително)')}
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                  {videoError && <div className="slib-form-error">{videoError}</div>}
                  <button
                    className="slib-btn slib-btn-primary slib-btn-sm"
                    onClick={handleVideoAdd}
                    disabled={videoAdding || !videoUrl.trim()}
                  >
                    {videoAdding ? <div className="slib-spinner slib-spinner-sm" /> : <Link size={16} />}
                    {t('seminarLibrary.addVideoLink', 'Добави видео')}
                  </button>
                </div>

                {/* YouTube file upload */}
                <div
                  className={`slib-dropzone ${youtubeUploading ? 'slib-dropzone-uploading' : ''}`}
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
                    <div className="slib-uploading">
                      <div className="slib-spinner" />
                      <span>{t('seminarLibrary.uploadingYouTube', 'Качване в YouTube...')}</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span>{t('seminarLibrary.dropVideoHint', 'Качете видео файл')}</span>
                      <span className="slib-dropzone-sub">MP4, WebM, MOV. Макс. 500MB</span>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Media items */}
            {items.length === 0 ? (
              renderEmpty(t('seminarLibrary.noFiles', 'Няма файлове'))
            ) : activeMediaTab === 'photos' ? (
              <div className="slib-photo-grid">
                {items.map((item) => {
                  const itemKey = getItemKey('photos', item.id);
                  const isChecked = selectedItems.has(itemKey);
                  return (
                    <div key={item.id} className={`slib-photo-card ${isChecked ? 'slib-photo-card-selected' : ''}`}>
                      <div
                        className={`slib-photo-checkbox ${isChecked ? 'slib-checkbox-checked' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleSelectItem(itemKey); }}
                      >
                        {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="slib-photo-thumb">
                        <img src={item.fileUrl} alt={item.fileName} />
                      </a>
                      <div className="slib-photo-actions">
                        <button className="slib-action-btn slib-action-download" onClick={() => downloadFile(item.fileUrl, item.fileName)} title={t('seminarLibrary.download', 'Свали')}>
                          <Download size={12} />
                        </button>
                        <button className="slib-action-btn slib-action-delete" onClick={() => handleMediaDelete(item.id)} title={t('seminarLibrary.delete', 'Изтрий')}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : activeMediaTab === 'videos' ? (
              <div className="slib-video-list">
                {items.map((item) => (
                  <div key={item.id} className="slib-video-card">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="slib-video-thumb">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.fileName} />
                      ) : null}
                      <div className="slib-video-play">▶</div>
                    </a>
                    <div className="slib-video-info">
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="slib-item-name">
                        {item.fileName}
                        <ExternalLink size={11} />
                      </a>
                      {item.notes && <div className="slib-item-meta">{item.notes}</div>}
                      <div className="slib-item-meta">
                        {item.uploaderName || '—'} · {new Date(item.createdAt).toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                    <button className="slib-action-btn slib-action-delete" onClick={() => handleMediaDelete(item.id)} title={t('seminarLibrary.delete', 'Изтрий')}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="slib-file-list">
                {items.map((item) => {
                  const itemKey = getItemKey(activeMediaTab, item.id);
                  const isChecked = selectedItems.has(itemKey);
                  return (
                    <div key={item.id} className={`slib-file-item ${isChecked ? 'slib-file-item-selected' : ''}`}>
                      <div
                        className={`slib-checkbox ${isChecked ? 'slib-checkbox-checked' : ''}`}
                        onClick={() => toggleSelectItem(itemKey)}
                      >
                        {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div className="slib-file-icon">
                        {item.fileType?.startsWith('image/') ? <Image size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="slib-file-info">
                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="slib-item-name">
                          {item.fileName}
                          <ExternalLink size={11} />
                        </a>
                        <div className="slib-item-meta">
                          {formatSize(item.fileSize)} · {item.uploaderName || '—'} · {new Date(item.createdAt).toLocaleDateString('bg-BG')}
                        </div>
                      </div>
                      <button className="slib-action-btn slib-action-download" onClick={() => downloadFile(item.fileUrl, item.fileName)} title={t('seminarLibrary.download', 'Свали')}>
                        <Download size={14} />
                      </button>
                      <button className="slib-action-btn slib-action-delete" onClick={() => handleMediaDelete(item.id)} title={t('seminarLibrary.delete', 'Изтрий')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Floating action bar for bulk selection */}
        {selectedItems.size > 0 && (
          <div className="slib-bulk-bar">
            <div className="slib-bulk-bar-content">
              <span className="slib-bulk-count">{selectedItems.size} избрани</span>
              <button
                className="slib-btn slib-btn-sm slib-bulk-delete-btn"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
              >
                {bulkDeleting ? <div className="slib-spinner slib-spinner-sm" /> : <Trash2 size={14} />}
                Изтрий избраните
              </button>
              <button
                className="slib-btn slib-btn-secondary slib-btn-sm"
                onClick={() => setSelectedItems(new Set())}
                disabled={bulkDeleting}
              >
                Отмени
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  //                    SEMINARS TAB
  // ═══════════════════════════════════════════════════════════
  const renderSeminarsTab = () => (
    <div className="slib-seminars">
      {/* Filters */}
      <div className="slib-toolbar">
        <div className="slib-search-box">
          <Search size={16} />
          <input
            type="text"
            className="slib-search-input"
            placeholder={t('seminarLibrary.searchSeminars', 'Търси по заглавие...')}
            value={seminarSearch}
            onChange={(e) => setSeminarSearch(e.target.value)}
          />
          {seminarSearch && (
            <button className="slib-search-clear" onClick={() => setSeminarSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="slib-filters">
          <select
            className="slib-select"
            value={seminarMediaFilter || 'all'}
            onChange={e => setSeminarMediaFilter(e.target.value)}
          >
            <option value="all">{t('seminarLibrary.allTypes', 'Всички типове')}</option>
            <option value="lists">{t('seminarLibrary.lists', 'Списъци')}</option>
            <option value="photos">{t('seminarLibrary.photos', 'Снимки')}</option>
            <option value="videos">{t('seminarLibrary.videos', 'Видеа')}</option>
            <option value="presentations">{t('seminarLibrary.presentations', 'Презентации')}</option>
          </select>
          <select
            className="slib-select"
            value={seminarSort || 'date-desc'}
            onChange={e => setSeminarSort(e.target.value)}
          >
            <option value="date-desc">{t('seminarLibrary.sortDateDesc', 'Дата (нови)')}</option>
            <option value="date-asc">{t('seminarLibrary.sortDateAsc', 'Дата (стари)')}</option>
            <option value="title-asc">{t('seminarLibrary.sortTitle', 'Заглавие А-Я')}</option>
            <option value="media-desc">{t('seminarLibrary.sortMedia', 'Най-много файлове')}</option>
          </select>
        </div>
      </div>

      {/* Seminars table */}
      {seminarsLoading ? renderSpinner() : (() => {
        // Client-side filtering & sorting
        let filtered = [...seminars];

        // Filter by media type
        if (seminarMediaFilter !== 'all') {
          const key = seminarMediaFilter === 'lists' ? 'attendanceLists' : seminarMediaFilter;
          filtered = filtered.filter(s => (s.mediaCounts?.[key] || 0) > 0);
        }

        // Sort
        filtered.sort((a, b) => {
          if (seminarSort === 'date-desc') return new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0);
          if (seminarSort === 'date-asc') return new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0);
          if (seminarSort === 'title-asc') return (a.title || '').localeCompare(b.title || '', 'bg');
          if (seminarSort === 'media-desc') {
            const countA = Object.values(a.mediaCounts || {}).reduce((s, v) => s + v, 0);
            const countB = Object.values(b.mediaCounts || {}).reduce((s, v) => s + v, 0);
            return countB - countA;
          }
          return 0;
        });

        return filtered.length === 0 ? (
        renderEmpty(t('seminarLibrary.noSeminars', 'Няма намерени семинари'))
      ) : (
        <>
          <div className="slib-seminars-table">
            <div className="slib-table-header">
              <span className="slib-th slib-th-date">{t('seminarLibrary.date', 'Дата')}</span>
              <span className="slib-th slib-th-title">{t('seminarLibrary.title', 'Заглавие')}</span>
              <span className="slib-th slib-th-type">{t('seminarLibrary.type', 'Тип')}</span>
              <span className="slib-th slib-th-facilitator">{t('seminarLibrary.facilitator', 'Водещ')}</span>
              <span className="slib-th slib-th-media">{t('seminarLibrary.media', 'Медия')}</span>
              <span className="slib-th slib-th-expand" />
            </div>

            {filtered.map((sem) => (
              <div key={sem.id} className="slib-seminar-row-wrapper">
                <div
                  className={`slib-table-row slib-seminar-row ${expandedSeminar === sem.id ? 'slib-row-expanded' : ''}`}
                  onClick={() => handleExpandSeminar(sem.id)}
                >
                  <span className="slib-td slib-td-date">
                    {sem.scheduledDate ? new Date(sem.scheduledDate).toLocaleDateString('bg-BG') : '—'}
                  </span>
                  <span className="slib-td slib-td-title">{sem.title}</span>
                  <span className="slib-td slib-td-type">
                    <span className={`slib-type-badge slib-type-${sem.isOnline ? 'online' : 'inperson'}`}>
                      {sem.isOnline ? TYPE_LABELS.online : TYPE_LABELS.inperson}
                    </span>
                  </span>
                  <span className="slib-td slib-td-facilitator">{sem.facilitator || '—'}</span>
                  <span className="slib-td slib-td-media">
                    {(() => {
                      const mc = sem.mediaCounts || {};
                      const totalFiles = (mc.attendanceLists || 0) + (mc.photos || 0) + (mc.videos || 0) + (mc.presentations || 0);
                      return totalFiles > 0 ? (
                        <span className="slib-media-counts-wrap">
                          <span className="slib-media-counts">
                            {(mc.attendanceLists || 0) > 0 && <span title={t('seminarLibrary.lists', 'Списъци')}><FileText size={12} /> {mc.attendanceLists}</span>}
                            {(mc.photos || 0) > 0 && <span title={t('seminarLibrary.photos', 'Снимки')}><Image size={12} /> {mc.photos}</span>}
                            {(mc.videos || 0) > 0 && <span title={t('seminarLibrary.videos', 'Видеа')}><Video size={12} /> {mc.videos}</span>}
                            {(mc.presentations || 0) > 0 && <span title={t('seminarLibrary.presentations', 'Презентации')}><Presentation size={12} /> {mc.presentations}</span>}
                          </span>
                          <span className="slib-media-summary">{totalFiles} {totalFiles === 1 ? 'файл' : 'файла'}</span>
                        </span>
                      ) : (
                        <span className="slib-no-media">—</span>
                      );
                    })()}
                  </span>
                  <span className="slib-td slib-td-expand">
                    {expandedSeminar === sem.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {expandedSeminar === sem.id && renderMediaSection(sem.id)}
              </div>
            ))}
          </div>

          {seminarsPagination.totalPages > 1 && (
            <div className="slib-pagination">
              <button
                className="slib-page-btn"
                onClick={() => handleSeminarPageChange(seminarsPagination.page - 1)}
                disabled={seminarsPagination.page <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="slib-page-info">
                {seminarsPagination.page} / {seminarsPagination.totalPages}
              </span>
              <button
                className="slib-page-btn"
                onClick={() => handleSeminarPageChange(seminarsPagination.page + 1)}
                disabled={seminarsPagination.page >= seminarsPagination.totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      );
      })()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  //                    MAIN RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="slib-container">
      {/* Subtabs */}
      <div className="slib-subtabs">
        {SUBTABS.map(({ key, label }) => (
          <button
            key={key}
            className={`slib-subtab ${activeSubtab === key ? 'slib-subtab-active' : ''}`}
            onClick={() => handleSubtabChange(key)}
          >
            {key === 'reports' ? <FileBarChart size={16} /> : <Video size={16} />}
            <span>{t(`seminarLibrary.subtab_${key}`, label)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="slib-content">
        {activeSubtab === 'reports' && renderReportsTab()}
        {activeSubtab === 'seminars' && renderSeminarsTab()}
      </div>
    </div>
  );
};

export default SeminarLibrary;
