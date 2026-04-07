// StorageFilePicker.jsx — prefix: sfp-
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home, ChevronRight, Folder, Image, FileText, Video, File,
  FileSpreadsheet, Presentation, X, Check
} from 'lucide-react';
import { storageServiceFactory } from '../../Services/storageService';
import './storageFilePicker.css';

const storageService = storageServiceFactory();

const getFileIcon = (contentType, name) => {
  if (contentType?.startsWith('image/')) return Image;
  if (contentType === 'application/pdf') return FileText;
  if (contentType?.includes('video')) return Video;
  if (contentType?.includes('presentation') || name?.endsWith('.pptx') || name?.endsWith('.ppt')) return Presentation;
  if (contentType?.includes('word') || name?.endsWith('.docx') || name?.endsWith('.doc')) return FileText;
  if (contentType?.includes('excel') || name?.endsWith('.xlsx') || name?.endsWith('.xls')) return FileSpreadsheet;
  return File;
};

const getFileName = (fullPath) => {
  if (!fullPath) return '';
  const parts = fullPath.replace(/\/$/, '').split('/');
  return parts[parts.length - 1];
};

const StorageFilePicker = ({ onSelect, onClose }) => {
  const { t } = useTranslation('admin');

  const [currentPath, setCurrentPath] = useState('');
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const loadFiles = useCallback(async (path) => {
    setLoading(true);
    try {
      const data = await storageService.listFiles(path);
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setSelectedFile(null);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles('');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const navigateToFolder = (folderName) => {
    const newPath = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
    setCurrentPath(newPath);
    loadFiles(newPath);
  };

  const navigateToBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentPath('');
      loadFiles('');
      return;
    }
    const parts = currentPath.split('/').filter(Boolean);
    const newPath = parts.slice(0, index + 1).join('/') + '/';
    setCurrentPath(newPath);
    loadFiles(newPath);
  };

  const handleSelect = () => {
    if (!selectedFile) return;
    const filePath = selectedFile.name;
    const fileName = getFileName(filePath);
    const url = `https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/${encodeURIComponent(filePath)}?alt=media`;
    onSelect({ filePath, fileName, url });
  };

  const handleBackdrop = (e) => {
    if (e.target.classList.contains('sfp-overlay')) onClose();
  };

  const breadcrumbParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="sfp-overlay" onClick={handleBackdrop}>
      <div className="sfp-modal">
        {/* Header */}
        <div className="sfp-header">
          <h3 className="sfp-title">{t('cloudStorage.selectFile', 'Избери файл')}</h3>
          <button className="sfp-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="sfp-breadcrumb">
          <button
            className={`sfp-breadcrumb-btn ${currentPath === '' ? 'sfp-breadcrumb-active' : ''}`}
            onClick={() => navigateToBreadcrumb(-1)}
          >
            <Home size={14} />
            <span>{t('cloudStorage.root', 'Начало')}</span>
          </button>
          {breadcrumbParts.map((part, i) => (
            <span key={i} className="sfp-breadcrumb-segment">
              <ChevronRight size={12} className="sfp-breadcrumb-sep" />
              <button
                className={`sfp-breadcrumb-btn ${i === breadcrumbParts.length - 1 ? 'sfp-breadcrumb-active' : ''}`}
                onClick={() => navigateToBreadcrumb(i)}
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        {/* File list */}
        <div className="sfp-list">
          {loading ? (
            <div className="sfp-loading">{t('cloudStorage.loading', 'Зареждане...')}</div>
          ) : (
            <>
              {folders.map((folder, i) => {
                const name = folder.replace(/\/$/, '');
                const displayName = getFileName(name);
                return (
                  <div
                    key={`f-${i}`}
                    className="sfp-item sfp-folder"
                    onClick={() => navigateToFolder(displayName)}
                  >
                    <Folder size={18} className="sfp-item-icon sfp-folder-icon" />
                    <span className="sfp-item-name">{displayName}</span>
                  </div>
                );
              })}
              {files.map((file, i) => {
                const fileName = getFileName(file.name);
                const FileIcon = getFileIcon(file.contentType, fileName);
                const isSelected = selectedFile?.name === file.name;
                return (
                  <div
                    key={`file-${i}`}
                    className={`sfp-item sfp-file ${isSelected ? 'sfp-file-selected' : ''}`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <FileIcon size={18} className="sfp-item-icon" />
                    <span className="sfp-item-name">{fileName}</span>
                    {isSelected && <Check size={16} className="sfp-check" />}
                  </div>
                );
              })}
              {folders.length === 0 && files.length === 0 && (
                <div className="sfp-empty">{t('cloudStorage.empty', 'Папката е празна')}</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sfp-footer">
          <button className="sfp-btn-cancel" onClick={onClose}>
            {t('cloudStorage.cancel', 'Отказ')}
          </button>
          <button
            className="sfp-btn-select"
            onClick={handleSelect}
            disabled={!selectedFile}
          >
            <Check size={16} />
            {t('cloudStorage.select', 'Избери')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageFilePicker;
