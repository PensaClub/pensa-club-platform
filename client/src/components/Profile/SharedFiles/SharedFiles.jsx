import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStorage } from '../../contexts/StorageProvider';
import './sharedFiles.css';

export const SharedFiles = () => {
  const { t } = useTranslation('common');
  const { getUserSharedFiles, markUserShareAsRead, getSharedFileDownloadUrl } = useStorage();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSharedFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserSharedFiles();
      setSharedFiles(data.shares || []);
    } catch (err) {
      console.error('Error loading shared files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSharedFiles();
  }, [loadSharedFiles]);

  const handleMarkAsRead = async (shareId) => {
    try {
      await markUserShareAsRead(shareId);
      setSharedFiles(prev =>
        prev.map(s => (s.id === shareId ? { ...s, isRead: true } : s))
      );
    } catch {
      // silent
    }
  };

  const handleDownload = async (share) => {
    try {
      const url = getSharedFileDownloadUrl(share.id);
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = share.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      // Update read status locally (backend marks as read on download)
      if (!share.isRead) {
        setSharedFiles(prev =>
          prev.map(s => (s.id === share.id ? { ...s, isRead: true } : s))
        );
      }
    } catch {
      // Fallback: try opening filePath in new tab
      window.open(share.filePath, '_blank');
    }
  };

  const getSharerName = (share) => {
    if (share.sharer?.details) {
      const name = `${share.sharer.details.firstName || ''} ${share.sharer.details.lastName || ''}`.trim();
      if (name) return name;
    }
    return share.sharer?.email || '—';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileExtension = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ext || '';
  };

  const getFileIconClass = (fileName) => {
    const ext = getFileExtension(fileName);
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];
    const videoExts = ['mp4', 'webm', 'avi', 'mov'];
    const audioExts = ['mp3', 'wav', 'ogg'];
    const archiveExts = ['zip', 'rar', '7z'];

    if (imageExts.includes(ext)) return 'sf-icon-image';
    if (docExts.includes(ext)) return 'sf-icon-doc';
    if (videoExts.includes(ext)) return 'sf-icon-video';
    if (audioExts.includes(ext)) return 'sf-icon-audio';
    if (archiveExts.includes(ext)) return 'sf-icon-archive';
    return 'sf-icon-file';
  };

  if (loading) {
    return (
      <div className="sf-wrapper">
        <div className="sf-header">
          <h1>{t('profile.sharedFiles')}</h1>
        </div>
        <div className="sf-loading">
          <div className="sf-spinner"></div>
          <span>{t('profile.loading', 'Зареждане...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-wrapper">
      <div className="sf-header">
        <h1>{t('profile.sharedFiles')}</h1>
        <button className="sf-refresh-btn" onClick={loadSharedFiles} title={t('profile.refresh', 'Обнови')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {sharedFiles.length === 0 ? (
        <div className="sf-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p>{t('profile.noSharedFiles')}</p>
        </div>
      ) : (
        <div className="sf-list">
          {sharedFiles.map(share => {
            const iconClass = getFileIconClass(share.fileName);
            return (
              <div
                key={share.id}
                className={`sf-item ${!share.isRead ? 'sf-item--unread' : ''}`}
              >
                <div className="sf-item-icon">
                  <div className={`sf-file-icon ${iconClass}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                </div>

                <div className="sf-item-info">
                  <div className="sf-item-name">
                    <span>{share.fileName}</span>
                    {!share.isRead && <span className="sf-unread-dot"></span>}
                  </div>
                  <div className="sf-item-meta">
                    <span className="sf-item-sharer">
                      {t('profile.sharedBy')}: {getSharerName(share)}
                    </span>
                    <span className="sf-item-date">{formatDate(share.createdAt)}</span>
                  </div>
                  {share.message && (
                    <div className="sf-item-message">{share.message}</div>
                  )}
                </div>

                <div className="sf-item-actions">
                  <button
                    className="sf-btn sf-btn-download"
                    onClick={() => handleDownload(share)}
                    title={t('profile.download', 'Изтегли')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  {!share.isRead && (
                    <button
                      className="sf-btn sf-btn-read"
                      onClick={() => handleMarkAsRead(share.id)}
                      title={t('profile.markAsRead', 'Маркирай като прочетено')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
