import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Home, ChevronRight, FolderPlus, Upload, LayoutGrid, List, Search, RefreshCw,
    Folder, FolderOpen, Image, FileText, Video, File, FileSpreadsheet, Presentation,
    Download, Trash2, Pencil, X, Check, ChevronDown, ChevronRight as TreeArrow
} from 'lucide-react';
import { toast } from 'react-toastify';
import { storageServiceFactory } from '../../Services/storageService';
import './cloudStorageManager.css';

const storageService = storageServiceFactory();

const formatSize = (bytes) => {
    if (!bytes) return '\u2014';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

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

const CloudStorageManager = () => {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const [currentPath, setCurrentPath] = useState('');
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [storageUsage, setStorageUsage] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [renamingItem, setRenamingItem] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [folderTree, setFolderTree] = useState({});
    const [expandedTreeFolders, setExpandedTreeFolders] = useState(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Load files for current path
    const loadFiles = useCallback(async (path = currentPath) => {
        setLoading(true);
        try {
            const data = await storageService.listFiles(path);
            setFolders(data.folders || []);
            setFiles(data.files || []);
            setSelectedItems(new Set());
        } catch (err) {
            toast.error(t('cloudStorage.loadError'));
        } finally {
            setLoading(false);
        }
    }, [currentPath, t]);

    // Load storage usage
    const loadStorageUsage = useCallback(async () => {
        try {
            const data = await storageService.getStorageUsage();
            setStorageUsage({
                usedBytes: data.totalSize || 0,
                totalBytes: 5 * 1024 * 1024 * 1024,
                totalFiles: data.totalFiles || 0,
                folderBreakdown: data.folderBreakdown || [],
            });
        } catch {
            // silent fail
        }
    }, []);

    // Load folder tree for sidebar
    const loadFolderTree = useCallback(async (path = '') => {
        try {
            const data = await storageService.listFiles(path);
            setFolderTree(prev => ({
                ...prev,
                [path]: (data.folders || []).map(f => {
                    const name = f.replace(/\/$/, '');
                    return path ? `${path}${name}` : name;
                })
            }));
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        loadFiles('');
        loadStorageUsage();
        loadFolderTree('');
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounce search
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [search]);

    // Navigate to a path
    const navigateTo = useCallback((path) => {
        setCurrentPath(path);
        setSearch('');
        setDebouncedSearch('');
        setSelectedItems(new Set());
        setShowNewFolder(false);
        setRenamingItem(null);
        loadFiles(path);
    }, [loadFiles]);

    // Breadcrumb segments
    const breadcrumbs = useMemo(() => {
        if (!currentPath) return [];
        const parts = currentPath.replace(/\/$/, '').split('/').filter(Boolean);
        return parts.map((part, i) => ({
            name: part,
            path: parts.slice(0, i + 1).join('/') + (i < parts.length - 1 ? '/' : '')
        }));
    }, [currentPath]);

    // Filtered files/folders by search
    const filteredFolders = useMemo(() => {
        if (!debouncedSearch) return folders;
        const q = debouncedSearch.toLowerCase();
        return folders.filter(f => getFileName(f).toLowerCase().includes(q));
    }, [folders, debouncedSearch]);

    const filteredFiles = useMemo(() => {
        if (!debouncedSearch) return files;
        const q = debouncedSearch.toLowerCase();
        return files.filter(f => getFileName(f.name || f.fullPath).toLowerCase().includes(q));
    }, [files, debouncedSearch]);

    // Selection helpers
    const allItems = useMemo(() => {
        const items = [];
        filteredFolders.forEach(f => items.push({ type: 'folder', id: f }));
        filteredFiles.forEach(f => items.push({ type: 'file', id: f.fullPath || f.name }));
        return items;
    }, [filteredFolders, filteredFiles]);

    const allSelected = allItems.length > 0 && allItems.every(item => selectedItems.has(item.id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(allItems.map(item => item.id)));
        }
    };

    const toggleSelect = (id) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Create folder
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        const base = currentPath.endsWith('/') ? currentPath : (currentPath ? currentPath + '/' : '');
        const folderPath = `${base}${newFolderName.trim()}/`;
        try {
            await storageService.createFolder(folderPath);
            toast.success(t('cloudStorage.folderCreated'));
            setShowNewFolder(false);
            setNewFolderName('');
            loadFiles();
            loadFolderTree(currentPath);
        } catch {
            toast.error(t('cloudStorage.folderCreateError'));
        }
    };

    // Upload
    const handleUpload = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        for (const file of fileList) {
            const uploadPath = currentPath || '';
            try {
                await storageService.uploadFile(uploadPath, file);
                successCount++;
            } catch {
                failCount++;
            }
        }

        setUploading(false);
        if (successCount > 0) {
            toast.success(t('cloudStorage.uploadSuccess', { count: successCount }));
        }
        if (failCount > 0) {
            toast.error(t('cloudStorage.uploadError', { count: failCount }));
        }
        loadFiles();
        loadStorageUsage();
    };

    // Delete single item
    const handleDelete = async (path, isFolder) => {
        try {
            if (isFolder) {
                await storageService.deleteFolder(path);
            } else {
                await storageService.deleteFile(path);
            }
            toast.success(t('cloudStorage.deleteSuccess'));
            setDeleteConfirm(null);
            loadFiles();
            loadStorageUsage();
            if (isFolder) loadFolderTree(currentPath);
        } catch {
            toast.error(t('cloudStorage.deleteError'));
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        const items = Array.from(selectedItems);
        let successCount = 0;
        let failCount = 0;

        for (const path of items) {
            const isFolder = path.endsWith('/');
            try {
                if (isFolder) {
                    await storageService.deleteFolder(path);
                } else {
                    await storageService.deleteFile(path);
                }
                successCount++;
            } catch {
                failCount++;
            }
        }

        if (successCount > 0) toast.success(t('cloudStorage.bulkDeleteSuccess', { count: successCount }));
        if (failCount > 0) toast.error(t('cloudStorage.bulkDeleteError', { count: failCount }));
        setSelectedItems(new Set());
        loadFiles();
        loadStorageUsage();
        loadFolderTree(currentPath);
    };

    // Rename
    const handleRename = async (oldPath) => {
        if (!renameValue.trim()) {
            setRenamingItem(null);
            return;
        }
        const isFolder = oldPath.endsWith('/');
        const parentPath = oldPath.substring(0, oldPath.replace(/\/$/, '').lastIndexOf('/') + 1);
        const newPath = isFolder
            ? `${parentPath}${renameValue.trim()}/`
            : `${parentPath}${renameValue.trim()}`;

        try {
            await storageService.renameFile(oldPath, newPath);
            toast.success(t('cloudStorage.renameSuccess'));
            setRenamingItem(null);
            setRenameValue('');
            loadFiles();
            if (isFolder) loadFolderTree(currentPath);
        } catch {
            toast.error(t('cloudStorage.renameError'));
        }
    };

    // Download
    const handleDownload = async (path) => {
        try {
            const url = storageService.getDownloadUrl(path);
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${auth.token}` },
                credentials: 'include',
            });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = getFileName(path);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            toast.error(t('cloudStorage.downloadError'));
        }
    };

    // Drag & drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const droppedFiles = e.dataTransfer?.files;
        if (droppedFiles && droppedFiles.length > 0) {
            handleUpload(droppedFiles);
        }
    };

    // Toggle folder in tree
    const toggleTreeFolder = async (folderPath) => {
        const next = new Set(expandedTreeFolders);
        if (next.has(folderPath)) {
            next.delete(folderPath);
        } else {
            next.add(folderPath);
            if (!folderTree[folderPath]) {
                await loadFolderTree(folderPath);
            }
        }
        setExpandedTreeFolders(next);
    };

    // Get thumbnail URL for images (Firebase Storage public URL format)
    const getThumbnailUrl = (file) => {
        if (!file.contentType?.startsWith('image/')) return null;
        const filePath = encodeURIComponent(file.fullPath || file.name);
        return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent('pensaclub-909e0.appspot.com')}/o/${filePath}?alt=media`;
    };

    // Render folder tree recursively
    const renderTreeNode = (folderPath, depth = 0) => {
        const children = folderTree[folderPath] || [];
        const isExpanded = expandedTreeFolders.has(folderPath);
        const folderName = getFileName(folderPath) || t('cloudStorage.root');
        const isActive = currentPath === (folderPath ? folderPath + '/' : '') || currentPath === folderPath;

        return (
            <div key={folderPath || 'root'} className="csm-tree-node">
                <div
                    className={`csm-tree-item ${isActive ? 'csm-tree-item--active' : ''}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                >
                    <button
                        className="csm-tree-toggle"
                        onClick={(e) => { e.stopPropagation(); toggleTreeFolder(folderPath); }}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <TreeArrow size={14} />}
                    </button>
                    <button
                        className="csm-tree-label"
                        onClick={() => navigateTo(folderPath ? folderPath + '/' : '')}
                    >
                        {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                        <span>{folderName}</span>
                    </button>
                </div>
                {isExpanded && children.length > 0 && (
                    <div className="csm-tree-children">
                        {children.map(child => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Render file item for grid or list
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
                    className={`csm-grid-item csm-grid-item--folder ${isSelected ? 'csm-grid-item--selected' : ''}`}
                >
                    <div className="csm-grid-checkbox">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(fullPath)}
                        />
                    </div>
                    <div
                        className="csm-grid-icon"
                        onClick={() => !isRenaming && navigateTo(fullPath.endsWith('/') ? fullPath : fullPath + '/')}
                    >
                        <Folder size={40} />
                    </div>
                    {isRenaming ? (
                        <div className="csm-rename-inline">
                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(fullPath); if (e.key === 'Escape') setRenamingItem(null); }}
                                autoFocus
                            />
                            <button onClick={() => handleRename(fullPath)}><Check size={14} /></button>
                            <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                        </div>
                    ) : (
                        <span
                            className="csm-grid-name"
                            onClick={() => navigateTo(fullPath.endsWith('/') ? fullPath : fullPath + '/')}
                        >
                            {displayName}
                        </span>
                    )}
                    <div className="csm-grid-actions">
                        <button
                            title={t('cloudStorage.rename')}
                            onClick={() => { setRenamingItem(fullPath); setRenameValue(displayName); }}
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            title={t('cloudStorage.delete')}
                            onClick={() => setDeleteConfirm({ path: fullPath, isFolder: true, name: displayName })}
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
                className={`csm-list-row ${isSelected ? 'csm-list-row--selected' : ''}`}
            >
                <td className="csm-list-check">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(fullPath)}
                    />
                </td>
                <td className="csm-list-name">
                    <div className="csm-list-name-inner">
                        <Folder size={18} className="csm-list-icon csm-list-icon--folder" />
                        {isRenaming ? (
                            <div className="csm-rename-inline">
                                <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(fullPath); if (e.key === 'Escape') setRenamingItem(null); }}
                                    autoFocus
                                />
                                <button onClick={() => handleRename(fullPath)}><Check size={14} /></button>
                                <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                            </div>
                        ) : (
                            <span
                                className="csm-list-link"
                                onClick={() => navigateTo(fullPath.endsWith('/') ? fullPath : fullPath + '/')}
                            >
                                {displayName}
                            </span>
                        )}
                    </div>
                </td>
                <td className="csm-list-size">{'\u2014'}</td>
                <td className="csm-list-type">{t('cloudStorage.folder')}</td>
                <td className="csm-list-date">{'\u2014'}</td>
                <td className="csm-list-actions">
                    <button
                        title={t('cloudStorage.rename')}
                        onClick={() => { setRenamingItem(fullPath); setRenameValue(displayName); }}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.delete')}
                        onClick={() => setDeleteConfirm({ path: fullPath, isFolder: true, name: displayName })}
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
                    className={`csm-grid-item ${isSelected ? 'csm-grid-item--selected' : ''}`}
                >
                    <div className="csm-grid-checkbox">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(filePath)}
                        />
                    </div>
                    <div className="csm-grid-icon">
                        {isImage && thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={displayName} className="csm-grid-thumb" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                            <FileIcon size={40} />
                        )}
                    </div>
                    {isRenaming ? (
                        <div className="csm-rename-inline">
                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(filePath); if (e.key === 'Escape') setRenamingItem(null); }}
                                autoFocus
                            />
                            <button onClick={() => handleRename(filePath)}><Check size={14} /></button>
                            <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                        </div>
                    ) : (
                        <span className="csm-grid-name" title={displayName}>{displayName}</span>
                    )}
                    <span className="csm-grid-size">{formatSize(file.size)}</span>
                    <div className="csm-grid-actions">
                        <button title={t('cloudStorage.download')} onClick={() => handleDownload(filePath)}>
                            <Download size={14} />
                        </button>
                        <button
                            title={t('cloudStorage.rename')}
                            onClick={() => { setRenamingItem(filePath); setRenameValue(displayName); }}
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            title={t('cloudStorage.delete')}
                            onClick={() => setDeleteConfirm({ path: filePath, isFolder: false, name: displayName })}
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
                className={`csm-list-row ${isSelected ? 'csm-list-row--selected' : ''}`}
            >
                <td className="csm-list-check">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(filePath)}
                    />
                </td>
                <td className="csm-list-name">
                    <div className="csm-list-name-inner">
                        {isImage && thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={displayName} className="csm-list-thumb" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                            <FileIcon size={18} className="csm-list-icon" />
                        )}
                        {isRenaming ? (
                            <div className="csm-rename-inline">
                                <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(filePath); if (e.key === 'Escape') setRenamingItem(null); }}
                                    autoFocus
                                />
                                <button onClick={() => handleRename(filePath)}><Check size={14} /></button>
                                <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                            </div>
                        ) : (
                            <span className="csm-list-filename">{displayName}</span>
                        )}
                    </div>
                </td>
                <td className="csm-list-size">{formatSize(file.size)}</td>
                <td className="csm-list-type">{file.contentType || '\u2014'}</td>
                <td className="csm-list-date">{dateStr}</td>
                <td className="csm-list-actions">
                    <button title={t('cloudStorage.download')} onClick={() => handleDownload(filePath)}>
                        <Download size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.rename')}
                        onClick={() => { setRenamingItem(filePath); setRenameValue(displayName); }}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        title={t('cloudStorage.delete')}
                        onClick={() => setDeleteConfirm({ path: filePath, isFolder: false, name: displayName })}
                    >
                        <Trash2 size={14} />
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <div className="csm-wrapper">
            {/* Breadcrumb */}
            <div className="csm-breadcrumb">
                <button
                    className={`csm-breadcrumb-item ${!currentPath ? 'csm-breadcrumb-item--active' : ''}`}
                    onClick={() => navigateTo('')}
                >
                    <Home size={14} />
                    <span>{t('cloudStorage.root')}</span>
                </button>
                {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.path} className="csm-breadcrumb-segment">
                        <ChevronRight size={14} className="csm-breadcrumb-sep" />
                        <button
                            className={`csm-breadcrumb-item ${i === breadcrumbs.length - 1 ? 'csm-breadcrumb-item--active' : ''}`}
                            onClick={() => navigateTo(crumb.path)}
                        >
                            {crumb.name}
                        </button>
                    </span>
                ))}
            </div>

            {/* Toolbar */}
            <div className="csm-toolbar">
                <div className="csm-toolbar-left">
                    <button className="csm-btn csm-btn--primary" onClick={() => setShowNewFolder(true)}>
                        <FolderPlus size={16} />
                        <span>{t('cloudStorage.newFolder')}</span>
                    </button>
                    <button
                        className="csm-btn csm-btn--primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload size={16} />
                        <span>{uploading ? t('cloudStorage.uploading') : t('cloudStorage.upload')}</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => { handleUpload(e.target.files); e.target.value = ''; }}
                    />
                </div>
                <div className="csm-toolbar-right">
                    <div className="csm-view-toggle">
                        <button
                            className={`csm-view-btn ${viewMode === 'grid' ? 'csm-view-btn--active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title={t('cloudStorage.gridView')}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            className={`csm-view-btn ${viewMode === 'list' ? 'csm-view-btn--active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title={t('cloudStorage.listView')}
                        >
                            <List size={16} />
                        </button>
                    </div>
                    <div className="csm-search">
                        <Search size={14} className="csm-search-icon" />
                        <input
                            type="text"
                            placeholder={t('cloudStorage.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="csm-search-input"
                        />
                        {search && (
                            <button className="csm-search-clear" onClick={() => { setSearch(''); setDebouncedSearch(''); }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button className="csm-btn csm-btn--icon" onClick={() => loadFiles()} title={t('cloudStorage.refresh')}>
                        <RefreshCw size={16} className={loading ? 'csm-spin' : ''} />
                    </button>
                    {storageUsage && (
                        <div className="csm-storage-bar" title={`${formatSize(storageUsage.usedBytes)} / ${formatSize(storageUsage.totalBytes || 5 * 1024 * 1024 * 1024)}`}>
                            <div className="csm-storage-label">
                                {formatSize(storageUsage.usedBytes)} / {formatSize(storageUsage.totalBytes || 5 * 1024 * 1024 * 1024)}
                            </div>
                            <div className="csm-storage-track">
                                <div
                                    className="csm-storage-fill"
                                    style={{ width: `${Math.min(100, ((storageUsage.usedBytes || 0) / (storageUsage.totalBytes || 5 * 1024 * 1024 * 1024)) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Folder inline form */}
            {showNewFolder && (
                <div className="csm-new-folder">
                    <FolderPlus size={16} />
                    <input
                        type="text"
                        placeholder={t('cloudStorage.folderNamePlaceholder')}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName(''); } }}
                        autoFocus
                    />
                    <button className="csm-btn csm-btn--small csm-btn--primary" onClick={handleCreateFolder}>
                        {t('cloudStorage.create')}
                    </button>
                    <button className="csm-btn csm-btn--small" onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}>
                        {t('cloudStorage.cancel')}
                    </button>
                </div>
            )}

            {/* Main content area */}
            <div className="csm-main">
                {/* Sidebar folder tree */}
                <div className="csm-sidebar">
                    <div className="csm-sidebar-title">{t('cloudStorage.folders')}</div>
                    <div className="csm-tree">
                        {renderTreeNode('')}
                    </div>
                </div>

                {/* File area */}
                <div
                    className={`csm-content ${dragOver ? 'csm-content--dragover' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {loading ? (
                        <div className="csm-loading">
                            <RefreshCw size={24} className="csm-spin" />
                            <span>{t('cloudStorage.loading')}</span>
                        </div>
                    ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                        <div className="csm-empty">
                            <Folder size={48} />
                            <p>{t('cloudStorage.empty')}</p>
                            <p className="csm-empty-hint">{t('cloudStorage.emptyHint')}</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="csm-grid">
                            {filteredFolders.map(f => renderFolderItem(f))}
                            {filteredFiles.map(f => renderFileItem(f))}
                        </div>
                    ) : (
                        <div className="csm-list-wrapper">
                            <table className="csm-list-table">
                                <thead>
                                    <tr>
                                        <th className="csm-list-check">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="csm-list-name">{t('cloudStorage.name')}</th>
                                        <th className="csm-list-size">{t('cloudStorage.size')}</th>
                                        <th className="csm-list-type">{t('cloudStorage.type')}</th>
                                        <th className="csm-list-date">{t('cloudStorage.modified')}</th>
                                        <th className="csm-list-actions">{t('cloudStorage.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFolders.map(f => renderFolderItem(f))}
                                    {filteredFiles.map(f => renderFileItem(f))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Drag overlay */}
                    {dragOver && (
                        <div className="csm-drop-overlay">
                            <Upload size={48} />
                            <p>{t('cloudStorage.dropHere')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk actions bar */}
            {selectedItems.size > 0 && (
                <div className="csm-bulk-bar">
                    <span>{t('cloudStorage.selectedCount', { count: selectedItems.size })}</span>
                    <button className="csm-btn csm-btn--danger" onClick={handleBulkDelete}>
                        <Trash2 size={16} />
                        <span>{t('cloudStorage.deleteSelected')}</span>
                    </button>
                    <button className="csm-btn csm-btn--small" onClick={() => setSelectedItems(new Set())}>
                        <X size={16} />
                        <span>{t('cloudStorage.clearSelection')}</span>
                    </button>
                </div>
            )}

            {/* Delete confirm modal */}
            {deleteConfirm && (
                <div className="csm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>{t('cloudStorage.confirmDelete')}</h4>
                        <p>{t('cloudStorage.confirmDeleteText', { name: deleteConfirm.name })}</p>
                        <div className="csm-modal-actions">
                            <button
                                className="csm-btn csm-btn--danger"
                                onClick={() => handleDelete(deleteConfirm.path, deleteConfirm.isFolder)}
                            >
                                {t('cloudStorage.delete')}
                            </button>
                            <button className="csm-btn" onClick={() => setDeleteConfirm(null)}>
                                {t('cloudStorage.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CloudStorageManager;
