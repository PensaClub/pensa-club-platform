// AttendanceListUpload.jsx — prefix: alu-
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../../../../firebase';
import { Upload, FileText, Trash2, ExternalLink, Image, Download } from 'lucide-react';
import './attendanceListUpload.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const AttendanceListUpload = ({ seminarId }) => {
  const { t } = useTranslation('academy-admin');
  const { getAttendanceLists, uploadAttendanceList, deleteAttendanceList } = useAcademyCourses();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);

  const fetchLists = useCallback(async () => {
    try {
      const data = await getAttendanceLists(seminarId);
      setLists(data?.lists || []);
    } catch { setLists([]); }
    finally { setLoading(false); }
  }, [seminarId]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const handleUpload = async (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert(t('attendanceList.invalidType', 'Позволени формати: JPG, PNG, WebP, PDF'));
      return;
    }
    if (file.size > MAX_SIZE) {
      alert(t('attendanceList.tooLarge', 'Максимален размер: 10MB'));
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(firebaseStorage, `seminar-attendance-lists/${seminarId}/${fileName}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await uploadAttendanceList(seminarId, {
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        notes: notes.trim() || null,
      });

      setNotes('');
      await fetchLists();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (listId) => {
    if (!confirm(t('attendanceList.confirmDelete', 'Сигурни ли сте?'))) return;
    try {
      await deleteAttendanceList(seminarId, listId);
      await fetchLists();
    } catch { /* handled in provider */ }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type) => type?.startsWith('image/');

  return (
    <div className="alu-container">
      <h4 className="alu-title">{t('attendanceList.title', 'Физически списъци')}</h4>

      {/* Notes input */}
      <input
        type="text"
        className="alu-notes-input"
        placeholder={t('attendanceList.notesPlaceholder', 'Бележка (незадължително)...')}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        disabled={uploading}
      />

      {/* Drop zone */}
      <div
        className={`alu-dropzone ${dragOver ? 'alu-dropzone-active' : ''} ${uploading ? 'alu-dropzone-uploading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div className="alu-uploading">
            <div className="alu-spinner" />
            <span>{t('attendanceList.uploading', 'Качване...')}</span>
          </div>
        ) : (
          <>
            <Upload size={24} />
            <span>{t('attendanceList.dropHint', 'Плъзнете файл тук или кликнете')}</span>
            <span className="alu-dropzone-sub">{t('attendanceList.formats', 'JPG, PNG, WebP, PDF — до 10MB')}</span>
          </>
        )}
      </div>

      {/* Uploaded lists */}
      {loading ? (
        <div className="alu-loading"><div className="alu-spinner" /></div>
      ) : lists.length === 0 ? (
        <div className="alu-empty">{t('attendanceList.noFiles', 'Няма качени списъци')}</div>
      ) : (
        <div className="alu-list">
          {lists.map(item => (
            <div key={item.id} className="alu-item">
              <div className="alu-item-icon">
                {isImage(item.fileType) ? <Image size={18} /> : <FileText size={18} />}
              </div>
              <div className="alu-item-info">
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="alu-item-name">
                  {item.fileName}
                  <ExternalLink size={11} />
                </a>
                <div className="alu-item-meta">
                  {formatSize(item.fileSize)} · {item.uploaderName} · {new Date(item.createdAt).toLocaleDateString('bg-BG')}
                  {item.notes && <span className="alu-item-notes"> · {item.notes}</span>}
                </div>
              </div>
              <button
                className="alu-item-download"
                onClick={async () => {
                  try {
                    const res = await fetch(item.fileUrl);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = item.fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch { /* ignore */ }
                }}
                title={t('attendanceList.download', 'Свали')}
              >
                <Download size={14} />
              </button>
              <button className="alu-item-delete" onClick={() => handleDelete(item.id)} title={t('attendanceList.delete', 'Изтрий')}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceListUpload;
