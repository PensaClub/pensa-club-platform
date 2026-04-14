import { useTranslation } from 'react-i18next';
import {
    Folder, Image, FileText, Video, File, FileSpreadsheet, Presentation,
    Download, Trash2, Pencil, X, Check, Share2, Users, Upload
} from 'lucide-react';
import './cloudStorageFileList.css';

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

const CloudStorageFileList = ({
    viewMode,
    folders,
    files,
    selectedItems,
    onToggleSelect,
    onToggleSelectAll,
    allSelected,
    onNavigateFolder,
    onDownload,
    onShare,
    onShareWithUser,
    onRename,
    onDelete,
    renamingItem,
    renameValue,
    onRenameChange,
    onRenameSubmit,
    onRenameCancel,
    getThumbnailUrl,
    formatSize,
    loading,
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
}) => {
    const { t } = useTranslation('admin');

    const renderFolderItem = (folderName) => {
        const fullPath = folderName;
        const cleanName = folderName.replace(/\/$/, '');
        const displayName = cleanName.split('/').filter(Boolean).pop() || cleanName;
        const isRenaming = renamingItem === fullPath;
        const isSelected = selectedItems.has(fullPath);

        if (viewMode === 'grid') {
            return (
                <div
                    key={fullPath}
                    className={`csfl-grid-item csfl-grid-item--folder ${isSelected ? 'csfl-grid-item--selected' : ''}`}
                >
                    <div className="csfl-grid-checkbox">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(fullPath)}
                        />
                    </div>
                    <div
                        className="csfl-grid-icon"
                        onClick={() => !isRenaming && onNavigateFolder(fullPath.endsWith('/') ? fullPath : fullPath + '/')}
                    >
                        <Folder size={40} />
                    </div>
                    {isRenaming ? (
                        <div className="csfl-rename-inline">
                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => onRenameChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') onRenameSubmit(fullPath); if (e.key === 'Escape') onRenameCancel(); }}
                                autoFocus
                            />
                            <button onClick={() => onRenameSubmit(fullPath)}><Check size={14} /></button>
                            <button onClick={() => onRenameCancel()}><X size={14} /></button>
                        </div>
                    ) : (
                        <span
                            className="csfl-grid-name"
                            onClick={() => onNavigateFolder(fullPath.endsWith('/') ? fullPath : fullPath + '/')}
                        >
                            {displayName}
                        </span>
                    )}
                    <div className="csfl-grid-actions">
                        <button
                            className="csfl-action-btn"
                            title={t('cloudStorage.shareFile', 'Сподели')}
                            onClick={() => onShare(fullPath, displayName)}
                        >
                            <Share2 size={14} />
                        </button>
                        <button
                            className="csfl-action-btn"
                            title={t('cloudStorage.shareWithUser', 'Сподели с потребител')}
                            onClick={() => onShareWithUser(fullPath, displayName)}
                        >
                            <Users size={14} />
                        </button>
                        <button
                            title={t('cloudStorage.rename')}
                            onClick={() => onRename(fullPath, displayName)}
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            title={t('cloudStorage.delete')}
                            onClick={() => onDelete(fullPath, true, displayName)}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            );
        }

        // List view
        return (
            <tr
                key={fullPath}
                className={`csfl-list-row ${isSelected ? 'csfl-list-row--selected' : ''}`}
            >
                <td className="csfl-list-check">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(fullPath)}
                    />
                </td>
                <td className="csfl-list-name">
                    <div className="csfl-list-name-inner">
                        <Folder size={18} className="csfl-list-icon csfl-list-icon--folder" />
                        {isRenaming ? (
                            <div className="csfl-rename-inline">
                                <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => onRenameChange(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onRenameSubmit(fullPath); if (e.key === 'Escape') onRenameCancel(); }}
                                    autoFocus
                                />
                                <button onClick={() => onRenameSubmit(fullPath)}><Check size={14} /></button>
                                <button onClick={() => onRenameCancel()}><X size={14} /></button>
                            </div>
                        ) : (
                            <span
                                className="csfl-list-link"
                                onClick={() => onNavigateFolder(fullPath.endsWith('/') ? fullPath : fullPath + '/')}
                            >
                                {displayName}
                            </span>
                        )}
                    </div>
                </td>
                <td className="csfl-list-size">{'\u2014'}</td>
                <td className="csfl-list-type">{t('cloudStorage.folder')}</td>
                <td className="csfl-list-date">{'\u2014'}</td>
                <td className="csfl-list-actions">
                    <button
                        title={t('cloudStorage.shareFile', 'Сподели')}
                        onClick={() => onShare(fullPath, displayName)}
                    >
                        <Share2 size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.shareWithUser', 'Сподели с потребител')}
                        onClick={() => onShareWithUser(fullPath, displayName)}
                    >
                        <Users size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.rename')}
                        onClick={() => onRename(fullPath, displayName)}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.delete')}
                        onClick={() => onDelete(fullPath, true, displayName)}
                    >
                        <Trash2 size={14} />
                    </button>
                </td>
            </tr>
        );
    };

    const renderFileItem = (file) => {
        const filePath = file.fullPath || file.name;
        const displayName = getFileName(file.name || filePath);
        const FileIcon = getFileIcon(file.contentType, displayName);
        const isRenaming = renamingItem === filePath;
        const isSelected = selectedItems.has(filePath);
        const isImage = file.contentType?.startsWith('image/');
        const thumbnailUrl = getThumbnailUrl(file);

        if (viewMode === 'grid') {
            return (
                <div
                    key={filePath}
                    className={`csfl-grid-item ${isSelected ? 'csfl-grid-item--selected' : ''}`}
                >
                    <div className="csfl-grid-checkbox">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(filePath)}
                        />
                    </div>
                    <div className="csfl-grid-icon">
                        {isImage && thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={displayName} className="csfl-grid-thumb" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                            <FileIcon size={40} />
                        )}
                    </div>
                    {isRenaming ? (
                        <div className="csfl-rename-inline">
                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => onRenameChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') onRenameSubmit(filePath); if (e.key === 'Escape') onRenameCancel(); }}
                                autoFocus
                            />
                            <button onClick={() => onRenameSubmit(filePath)}><Check size={14} /></button>
                            <button onClick={() => onRenameCancel()}><X size={14} /></button>
                        </div>
                    ) : (
                        <span className="csfl-grid-name" title={displayName}>{displayName}</span>
                    )}
                    <span className="csfl-grid-size">{formatSize(file.size)}</span>
                    <div className="csfl-grid-actions">
                        <button title={t('cloudStorage.download')} onClick={() => onDownload(filePath)}>
                            <Download size={14} />
                        </button>
                        <button
                            className="csfl-action-btn"
                            title={t('cloudStorage.shareFile', 'Сподели')}
                            onClick={() => onShare(filePath, displayName)}
                        >
                            <Share2 size={14} />
                        </button>
                        <button
                            className="csfl-action-btn"
                            title={t('cloudStorage.shareWithUser', 'Сподели с потребител')}
                            onClick={() => onShareWithUser(filePath, displayName)}
                        >
                            <Users size={14} />
                        </button>
                        <button
                            className="csfl-action-btn"
                            title={t('cloudStorage.rename')}
                            onClick={() => onRename(filePath, displayName)}
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            title={t('cloudStorage.delete')}
                            onClick={() => onDelete(filePath, false, displayName)}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            );
        }

        // List view
        const dateStr = file.updated ? new Date(file.updated).toLocaleDateString('bg-BG', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '\u2014';

        return (
            <tr
                key={filePath}
                className={`csfl-list-row ${isSelected ? 'csfl-list-row--selected' : ''}`}
            >
                <td className="csfl-list-check">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(filePath)}
                    />
                </td>
                <td className="csfl-list-name">
                    <div className="csfl-list-name-inner">
                        {isImage && thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={displayName} className="csfl-list-thumb" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                            <FileIcon size={18} className="csfl-list-icon" />
                        )}
                        {isRenaming ? (
                            <div className="csfl-rename-inline">
                                <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => onRenameChange(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onRenameSubmit(filePath); if (e.key === 'Escape') onRenameCancel(); }}
                                    autoFocus
                                />
                                <button onClick={() => onRenameSubmit(filePath)}><Check size={14} /></button>
                                <button onClick={() => onRenameCancel()}><X size={14} /></button>
                            </div>
                        ) : (
                            <span className="csfl-list-filename">{displayName}</span>
                        )}
                    </div>
                </td>
                <td className="csfl-list-size">{formatSize(file.size)}</td>
                <td className="csfl-list-type">{file.contentType || '\u2014'}</td>
                <td className="csfl-list-date">{dateStr}</td>
                <td className="csfl-list-actions">
                    <button title={t('cloudStorage.download')} onClick={() => onDownload(filePath)}>
                        <Download size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.shareFile', 'Сподели')}
                        onClick={() => onShare(filePath, displayName)}
                    >
                        <Share2 size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.shareWithUser', 'Сподели с потребител')}
                        onClick={() => onShareWithUser(filePath, displayName)}
                    >
                        <Users size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.rename')}
                        onClick={() => onRename(filePath, displayName)}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.delete')}
                        onClick={() => onDelete(filePath, false, displayName)}
                    >
                        <Trash2 size={14} />
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <div
            className={`csfl-content ${dragOver ? 'csfl-content--dragover' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {loading ? (
                <div className="csfl-loading">
                    <svg className="csfl-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    <span>{t('cloudStorage.loading')}</span>
                </div>
            ) : folders.length === 0 && files.length === 0 ? (
                <div className="csfl-empty">
                    <Folder size={48} />
                    <p>{t('cloudStorage.empty')}</p>
                    <p className="csfl-empty-hint">{t('cloudStorage.emptyHint')}</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="csfl-grid">
                    {folders.map(f => renderFolderItem(f))}
                    {files.map(f => renderFileItem(f))}
                </div>
            ) : (
                <div className="csfl-list-wrapper">
                    <table className="csfl-list-table">
                        <thead>
                            <tr>
                                <th className="csfl-list-check">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={onToggleSelectAll}
                                    />
                                </th>
                                <th className="csfl-list-name">{t('cloudStorage.name')}</th>
                                <th className="csfl-list-size">{t('cloudStorage.size')}</th>
                                <th className="csfl-list-type">{t('cloudStorage.type')}</th>
                                <th className="csfl-list-date">{t('cloudStorage.modified')}</th>
                                <th className="csfl-list-actions">{t('cloudStorage.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {folders.map(f => renderFolderItem(f))}
                            {files.map(f => renderFileItem(f))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Drag overlay */}
            {dragOver && (
                <div className="csfl-drop-overlay">
                    <Upload size={48} />
                    <p>{t('cloudStorage.dropHere')}</p>
                </div>
            )}
        </div>
    );
};

export default CloudStorageFileList;
