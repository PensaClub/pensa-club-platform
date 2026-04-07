import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Home, ChevronRight, FolderPlus, RefreshCw, Search, Folder,
    Image, FileText, Video, File, FileSpreadsheet, Presentation,
    Download, Trash2, X, Eye, Inbox
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useStorage } from '../../contexts/StorageProvider';
import ShareFileModal from './ShareFileModal';
import ShareWithUserModal from './ShareWithUserModal';
import CloudStorageToolbar from './CloudStorageToolbar';
import CloudStorageBreadcrumb from './CloudStorageBreadcrumb';
import CloudStorageSidebar from './CloudStorageSidebar';
import CloudStorageFileList from './CloudStorageFileList';
import CloudStorageAnalytics from './CloudStorageAnalytics';
import './cloudStorageManager.css';

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
    const {
        listFiles, uploadFile, createFolder, deleteFile, deleteFolder,
        renameFile, getStorageUsage, getDownloadUrl, syncStorage,
        initializeStructure, createProject, getSharedWithMe, markShareAsRead,
        searchFiles, getAnalytics,
    } = useStorage();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
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
    const [syncing, setSyncing] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [removeLinkConfirm, setRemoveLinkConfirm] = useState(null);
    const [customLinks, setCustomLinks] = useState(() => {
        try { return JSON.parse(localStorage.getItem('csm-custom-quick-links') || '[]'); }
        catch { return []; }
    });
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLinkLabel, setNewLinkLabel] = useState('');
    const [shareModal, setShareModal] = useState(null);
    const [shareWithUserModal, setShareWithUserModal] = useState(null);
    const [sharedWithMeView, setSharedWithMeView] = useState(false);
    const [sharedFiles, setSharedFiles] = useState([]);
    const [loadingShared, setLoadingShared] = useState(false);
    const [searchMode, setSearchMode] = useState('local');
    const [searchTypeFilter, setSearchTypeFilter] = useState('all');
    const [globalSearchResults, setGlobalSearchResults] = useState(null);
    const [globalSearching, setGlobalSearching] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Load files for current path
    const loadFiles = useCallback(async (path = currentPath) => {
        setLoading(true);
        try {
            const data = await listFiles(path);
            setFolders(data.folders || []);
            setFiles(data.files || []);
            setSelectedItems(new Set());
        } catch (err) {
            toast.error(t('cloudStorage.loadError'));
        } finally {
            setLoading(false);
        }
    }, [currentPath, t]);

    const loadStorageUsage = useCallback(async () => {
        try {
            const data = await getStorageUsage();
            setStorageUsage({
                usedBytes: data.totalSize || 0,
                totalBytes: 5 * 1024 * 1024 * 1024,
                totalFiles: data.totalFiles || 0,
                folderBreakdown: data.folderBreakdown || [],
            });
        } catch { /* silent */ }
    }, []);

    const loadFolderTree = useCallback(async (path = '') => {
        try {
            const data = await listFiles(path);
            setFolderTree(prev => ({
                ...prev,
                [path]: (data.folders || []).map(f => {
                    const name = f.replace(/\/$/, '');
                    return path ? `${path}${name}` : name;
                })
            }));
        } catch { /* silent */ }
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

    // Global search effect
    useEffect(() => {
        if (searchMode !== 'global' || !debouncedSearch) {
            setGlobalSearchResults(null);
            return;
        }
        let cancelled = false;
        const doSearch = async () => {
            setGlobalSearching(true);
            try {
                const result = await searchFiles({
                    q: debouncedSearch,
                    type: searchTypeFilter !== 'all' ? searchTypeFilter : undefined,
                    maxResults: 50,
                });
                if (!cancelled) setGlobalSearchResults(result.files || []);
            } catch {
                if (!cancelled) setGlobalSearchResults([]);
            } finally {
                if (!cancelled) setGlobalSearching(false);
            }
        };
        doSearch();
        return () => { cancelled = true; };
    }, [debouncedSearch, searchMode, searchTypeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadAnalytics = useCallback(async () => {
        setLoadingAnalytics(true);
        try {
            const data = await getAnalytics();
            setAnalyticsData(data);
        } catch {
            toast.error('Error loading analytics');
        } finally {
            setLoadingAnalytics(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const navigateTo = useCallback((path) => {
        setCurrentPath(path);
        setSearch('');
        setDebouncedSearch('');
        setSelectedItems(new Set());
        setShowNewFolder(false);
        setRenamingItem(null);
        setSharedWithMeView(false);
        setGlobalSearchResults(null);
        setShowAnalytics(false);
        loadFiles(path);
    }, [loadFiles]);

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
        let result = files;
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(f => getFileName(f.name || f.fullPath).toLowerCase().includes(q));
        }
        if (searchTypeFilter !== 'all') {
            result = result.filter(f => {
                const ct = f.contentType || '';
                const name = (f.name || f.fullPath || '').toLowerCase();
                if (searchTypeFilter === 'image') return ct.startsWith('image/');
                if (searchTypeFilter === 'video') return ct.startsWith('video/');
                if (searchTypeFilter === 'document') return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'].some(ext => name.endsWith('.' + ext));
                if (searchTypeFilter === 'presentation') return ['ppt', 'pptx'].some(ext => name.endsWith('.' + ext));
                return true;
            });
        }
        return result;
    }, [files, debouncedSearch, searchTypeFilter]);

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

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        const base = currentPath.endsWith('/') ? currentPath : (currentPath ? currentPath + '/' : '');
        const folderPath = `${base}${newFolderName.trim()}/`;
        try {
            await createFolder(folderPath);
            toast.success(t('cloudStorage.folderCreated'));
            setShowNewFolder(false);
            setNewFolderName('');
            loadFiles();
            loadFolderTree(currentPath);
        } catch {
            toast.error(t('cloudStorage.folderCreateError'));
        }
    };

    const handleUpload = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        setUploading(true);
        let successCount = 0;
        let failCount = 0;
        for (const file of fileList) {
            try {
                await uploadFile(currentPath || '', file);
                successCount++;
            } catch { failCount++; }
        }
        setUploading(false);
        if (successCount > 0) toast.success(t('cloudStorage.uploadSuccess', { count: successCount }));
        if (failCount > 0) toast.error(t('cloudStorage.uploadError', { count: failCount }));
        loadFiles();
        loadStorageUsage();
    };

    const handleDelete = async (path, isFolder) => {
        try {
            if (isFolder) await deleteFolder(path);
            else await deleteFile(path);
            toast.success(t('cloudStorage.deleteSuccess'));
            setDeleteConfirm(null);
            loadFiles();
            loadStorageUsage();
            if (isFolder) loadFolderTree(currentPath);
        } catch {
            toast.error(t('cloudStorage.deleteError'));
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await syncStorage();
            toast.success(`Синхронизация: ${result.synced || 0} нови, ${result.orphans?.length || 0} осиротели`);
            loadFiles();
        } catch (err) {
            toast.error('Грешка при синхронизация');
        } finally {
            setSyncing(false);
        }
    };

    const handleInitialize = async () => {
        setInitializing(true);
        try {
            const result = await initializeStructure();
            toast.success(`Създадени ${result.created} нови папки`);
            loadFiles();
            loadFolderTree('');
        } catch {
            toast.error('Грешка при инициализация');
        } finally {
            setInitializing(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        try {
            const result = await createProject(newProjectName.trim());
            toast.success(`Проект създаден: ${result.projectPath}`);
            setShowCreateProject(false);
            setNewProjectName('');
            navigateTo(result.projectPath);
            loadFolderTree('');
        } catch {
            toast.error('Грешка при създаване на проект');
        }
    };

    const handleAddQuickLink = () => {
        if (!newLinkLabel.trim() || !currentPath) return;
        const newLink = { id: `custom-${Date.now()}`, label: newLinkLabel.trim(), emoji: '📌', path: currentPath };
        const updated = [...customLinks, newLink];
        setCustomLinks(updated);
        localStorage.setItem('csm-custom-quick-links', JSON.stringify(updated));
        setShowAddLink(false);
        setNewLinkLabel('');
        toast.success('Бърза връзка добавена');
    };

    const handleRemoveQuickLink = (linkId) => {
        const updated = customLinks.filter(l => l.id !== linkId);
        setCustomLinks(updated);
        localStorage.setItem('csm-custom-quick-links', JSON.stringify(updated));
        setRemoveLinkConfirm(null);
        toast.success('Бърза връзка премахната');
    };

    const loadSharedWithMe = useCallback(async () => {
        setLoadingShared(true);
        try {
            const data = await getSharedWithMe();
            setSharedFiles(data.shares || []);
        } catch {
            toast.error('Грешка при зареждане на споделени файлове');
        } finally {
            setLoadingShared(false);
        }
    }, []);

    const handleMarkShareAsRead = async (shareId) => {
        try {
            await markShareAsRead(shareId);
            setSharedFiles(prev => prev.map(s => s.id === shareId ? { ...s, isRead: true } : s));
        } catch { /* silent */ }
    };

    const handleDownload = async (path) => {
        try {
            const url = getDownloadUrl(path);
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

    const handleBulkDelete = async () => {
        const items = Array.from(selectedItems);
        let successCount = 0;
        let failCount = 0;
        for (const path of items) {
            const isFolder = path.endsWith('/');
            try {
                if (isFolder) await deleteFolder(path);
                else await deleteFile(path);
                successCount++;
            } catch { failCount++; }
        }
        if (successCount > 0) toast.success(t('cloudStorage.bulkDeleteSuccess', { count: successCount }));
        if (failCount > 0) toast.error(t('cloudStorage.bulkDeleteError', { count: failCount }));
        setSelectedItems(new Set());
        setBulkDeleteConfirm(false);
        loadFiles();
        loadStorageUsage();
        loadFolderTree(currentPath);
    };

    const handleRename = async (oldPath) => {
        if (!renameValue.trim()) { setRenamingItem(null); return; }
        const isFolder = oldPath.endsWith('/');
        const parentPath = oldPath.substring(0, oldPath.replace(/\/$/, '').lastIndexOf('/') + 1);
        const newPath = isFolder ? `${parentPath}${renameValue.trim()}/` : `${parentPath}${renameValue.trim()}`;
        try {
            await renameFile(oldPath, newPath);
            toast.success(t('cloudStorage.renameSuccess'));
            setRenamingItem(null);
            setRenameValue('');
            loadFiles();
            if (isFolder) loadFolderTree(currentPath);
        } catch {
            toast.error(t('cloudStorage.renameError'));
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); const f = e.dataTransfer?.files; if (f && f.length > 0) handleUpload(f); };

    const toggleTreeFolder = async (folderPath) => {
        const next = new Set(expandedTreeFolders);
        if (next.has(folderPath)) {
            next.delete(folderPath);
        } else {
            next.add(folderPath);
            if (!folderTree[folderPath]) await loadFolderTree(folderPath);
        }
        setExpandedTreeFolders(next);
    };

    const getThumbnailUrl = (file) => {
        if (!file.contentType?.startsWith('image/')) return null;
        const filePath = encodeURIComponent(file.fullPath || file.name);
        return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent('pensaclub-909e0.appspot.com')}/o/${filePath}?alt=media`;
    };

    const unreadSharedCount = sharedFiles.filter(s => !s.isRead).length;

    return (
        <div className="csm-wrapper">
            {/* Breadcrumb */}
            <CloudStorageBreadcrumb
                currentPath={currentPath}
                breadcrumbs={breadcrumbs}
                onNavigate={navigateTo}
            />

            {/* Toolbar */}
            <CloudStorageToolbar
                currentPath={currentPath}
                onNewFolder={() => setShowNewFolder(true)}
                onUpload={handleUpload}
                onCamera={() => cameraInputRef.current?.click()}
                onInitialize={handleInitialize}
                onCreateProject={() => setShowCreateProject(true)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                search={search}
                onSearchChange={setSearch}
                searchMode={searchMode}
                onSearchModeChange={() => setSearchMode(prev => prev === 'local' ? 'global' : 'local')}
                typeFilter={searchTypeFilter}
                onTypeFilterChange={setSearchTypeFilter}
                onRefresh={() => loadFiles()}
                onSync={handleSync}
                onAnalytics={() => { setShowAnalytics(true); loadAnalytics(); }}
                loading={loading}
                syncing={syncing}
                storageUsage={storageUsage}
                showCreateProject={showCreateProject}
                showNewFolder={showNewFolder}
                uploading={uploading}
                initializing={initializing}
                showAnalytics={showAnalytics}
                onClearSearch={() => { setSearch(''); setDebouncedSearch(''); setGlobalSearchResults(null); }}
                fileInputRef={fileInputRef}
                cameraInputRef={cameraInputRef}
                formatSize={formatSize}
            />

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

            {/* Create Project inline form */}
            {showCreateProject && (
                <div className="csm-new-folder">
                    <FolderPlus size={16} />
                    <input
                        type="text"
                        placeholder="Име на проекта (напр. erasmus-plus)"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateProject();
                            if (e.key === 'Escape') { setShowCreateProject(false); setNewProjectName(''); }
                        }}
                        autoFocus
                    />
                    <button className="csm-btn csm-btn--small csm-btn--primary" onClick={handleCreateProject}>
                        Създай
                    </button>
                    <button className="csm-btn csm-btn--small" onClick={() => { setShowCreateProject(false); setNewProjectName(''); }}>
                        {t('cloudStorage.cancel')}
                    </button>
                </div>
            )}

            {/* Main content area */}
            <div className="csm-main">
                {/* Sidebar */}
                <CloudStorageSidebar
                    customLinks={customLinks}
                    onNavigate={navigateTo}
                    onAddLink={handleAddQuickLink}
                    onRemoveLink={handleRemoveQuickLink}
                    currentPath={currentPath}
                    sharedWithMeView={sharedWithMeView}
                    onSharedWithMe={() => { setSharedWithMeView(true); loadSharedWithMe(); }}
                    sharedFilesCount={unreadSharedCount}
                    folderTree={folderTree}
                    expandedFolders={expandedTreeFolders}
                    onToggleFolder={toggleTreeFolder}
                    showAddLink={showAddLink}
                    onToggleAddLink={() => { setShowAddLink(!showAddLink); setNewLinkLabel(''); }}
                    newLinkLabel={newLinkLabel}
                    onNewLinkLabelChange={setNewLinkLabel}
                    onSubmitAddLink={handleAddQuickLink}
                    onRemoveLinkConfirm={setRemoveLinkConfirm}
                />

                {/* File area - global search results */}
                {searchMode === 'global' && debouncedSearch ? (
                    <div className="csm-content">
                        <div className="csm-search-results-header">
                            <h3>{t('cloudStorage.searchResults')}: &quot;{debouncedSearch}&quot;</h3>
                            <button className="csm-btn csm-btn--small" onClick={() => { setSearch(''); setDebouncedSearch(''); setGlobalSearchResults(null); setSearchMode('local'); }}>
                                <X size={14} />
                                <span>{t('cloudStorage.clearSelection')}</span>
                            </button>
                        </div>
                        {globalSearching ? (
                            <div className="csm-loading">
                                <RefreshCw size={24} className="csm-spin" />
                                <span>{t('cloudStorage.searching')}</span>
                            </div>
                        ) : !globalSearchResults || globalSearchResults.length === 0 ? (
                            <div className="csm-empty">
                                <Search size={48} />
                                <p>{t('cloudStorage.noResults')}</p>
                            </div>
                        ) : (
                            <div className="csm-list-wrapper">
                                <table className="csm-list-table">
                                    <thead>
                                        <tr>
                                            <th className="csm-list-name">{t('cloudStorage.name')}</th>
                                            <th className="csm-list-size">{t('cloudStorage.size')}</th>
                                            <th className="csm-list-type">{t('cloudStorage.type')}</th>
                                            <th className="csm-list-actions">{t('cloudStorage.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {globalSearchResults.map(file => {
                                            const filePath = file.fullPath;
                                            const displayName = getFileName(file.name || filePath);
                                            const FileIcon = getFileIcon(file.contentType, displayName);
                                            const parentPath = filePath.substring(0, filePath.lastIndexOf('/') + 1);
                                            return (
                                                <tr key={filePath} className="csm-list-row">
                                                    <td className="csm-list-name">
                                                        <div className="csm-list-name-inner">
                                                            <FileIcon size={18} className="csm-list-icon" />
                                                            <div>
                                                                <span className="csm-list-filename">{displayName}</span>
                                                                <button
                                                                    className="csm-search-result-path"
                                                                    onClick={() => { setSearchMode('local'); setSearch(''); setDebouncedSearch(''); setGlobalSearchResults(null); navigateTo(parentPath); }}
                                                                    title={parentPath}
                                                                >
                                                                    {parentPath || '/'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="csm-list-size">{formatSize(file.size)}</td>
                                                    <td className="csm-list-type">{file.contentType || '\u2014'}</td>
                                                    <td className="csm-list-actions">
                                                        <button title={t('cloudStorage.download')} onClick={() => handleDownload(filePath)}>
                                                            <Download size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : sharedWithMeView ? (
                    <div className="csm-content">
                        <div className="csm-share-user-view-header">
                            <button className="csm-btn csm-btn--small" onClick={() => setSharedWithMeView(false)}>
                                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                                <span>{t('cloudStorage.backToStorage', 'Назад')}</span>
                            </button>
                            <h3>{t('cloudStorage.sharedWithMe', 'Споделени с мен')}</h3>
                            <button className="csm-btn csm-btn--small csm-btn--icon" onClick={loadSharedWithMe}>
                                <RefreshCw size={14} className={loadingShared ? 'csm-spin' : ''} />
                            </button>
                        </div>
                        {loadingShared ? (
                            <div className="csm-loading">
                                <RefreshCw size={24} className="csm-spin" />
                                <span>{t('cloudStorage.loading')}</span>
                            </div>
                        ) : sharedFiles.length === 0 ? (
                            <div className="csm-empty">
                                <Inbox size={48} />
                                <p>{t('cloudStorage.noSharedFiles', 'Няма споделени файлове')}</p>
                            </div>
                        ) : (
                            <div className="csm-list-wrapper">
                                <table className="csm-list-table">
                                    <thead>
                                        <tr>
                                            <th className="csm-list-name">{t('cloudStorage.name')}</th>
                                            <th className="csm-list-type">{t('cloudStorage.sharedBy', 'Споделен от')}</th>
                                            <th className="csm-list-date">{t('cloudStorage.modified')}</th>
                                            <th className="csm-list-actions">{t('cloudStorage.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sharedFiles.map(share => {
                                            const sharerName = share.sharer?.details
                                                ? `${share.sharer.details.firstName || ''} ${share.sharer.details.lastName || ''}`.trim()
                                                : share.sharer?.email || '—';
                                            const dateStr = share.createdAt
                                                ? new Date(share.createdAt).toLocaleDateString('bg-BG', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })
                                                : '—';
                                            const FileIcon = getFileIcon(null, share.fileName);
                                            return (
                                                <tr key={share.id} className={`csm-list-row ${!share.isRead ? 'csm-list-row--unread' : ''}`}>
                                                    <td className="csm-list-name">
                                                        <div className="csm-list-name-inner">
                                                            <FileIcon size={18} className="csm-list-icon" />
                                                            <div>
                                                                <span className="csm-list-filename">{share.fileName}</span>
                                                                {share.message && <span className="csm-share-user-msg">{share.message}</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="csm-list-type">{sharerName}</td>
                                                    <td className="csm-list-date">{dateStr}</td>
                                                    <td className="csm-list-actions">
                                                        <button title={t('cloudStorage.download')} onClick={() => { if (!share.isRead) handleMarkShareAsRead(share.id); handleDownload(share.filePath); }}>
                                                            <Download size={14} />
                                                        </button>
                                                        {!share.isRead && (
                                                            <button title={t('cloudStorage.markAsRead', 'Маркирай като прочетено')} onClick={() => handleMarkShareAsRead(share.id)}>
                                                                <Eye size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <CloudStorageFileList
                        viewMode={viewMode}
                        folders={filteredFolders}
                        files={filteredFiles}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleSelect}
                        onToggleSelectAll={toggleSelectAll}
                        allSelected={allSelected}
                        onNavigateFolder={navigateTo}
                        onDownload={handleDownload}
                        onShare={(filePath, fileName) => setShareModal({ filePath, fileName })}
                        onShareWithUser={(filePath, fileName) => setShareWithUserModal({ filePath, fileName })}
                        onRename={(path, displayName) => { setRenamingItem(path); setRenameValue(displayName); }}
                        onDelete={(path, isFolder, name) => setDeleteConfirm({ path, isFolder, name })}
                        renamingItem={renamingItem}
                        renameValue={renameValue}
                        onRenameChange={setRenameValue}
                        onRenameSubmit={handleRename}
                        onRenameCancel={() => setRenamingItem(null)}
                        getThumbnailUrl={getThumbnailUrl}
                        formatSize={formatSize}
                        loading={loading}
                        dragOver={dragOver}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    />
                )}
            </div>

            {/* Bulk actions bar */}
            {selectedItems.size > 0 && (
                <div className="csm-bulk-bar">
                    <span>{t('cloudStorage.selectedCount', { count: selectedItems.size })}</span>
                    <button className="csm-btn csm-btn--danger" onClick={() => setBulkDeleteConfirm(true)}>
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
                            <button className="csm-btn csm-btn--danger" onClick={() => handleDelete(deleteConfirm.path, deleteConfirm.isFolder)}>
                                {t('cloudStorage.delete')}
                            </button>
                            <button className="csm-btn" onClick={() => setDeleteConfirm(null)}>
                                {t('cloudStorage.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk delete confirm modal */}
            {bulkDeleteConfirm && (
                <div className="csm-modal-overlay" onClick={() => setBulkDeleteConfirm(false)}>
                    <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>{t('cloudStorage.confirmDelete')}</h4>
                        <p>Сигурни ли сте, че искате да изтриете {selectedItems.size} файла?</p>
                        <div className="csm-modal-actions">
                            <button className="csm-btn csm-btn--danger" onClick={handleBulkDelete}>Да, изтрий</button>
                            <button className="csm-btn" onClick={() => setBulkDeleteConfirm(false)}>{t('cloudStorage.cancel')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove quick link confirm modal */}
            {removeLinkConfirm && (
                <div className="csm-modal-overlay" onClick={() => setRemoveLinkConfirm(null)}>
                    <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>Премахване на бърза връзка</h4>
                        <p>Сигурни ли сте, че искате да премахнете тази бърза връзка?</p>
                        <div className="csm-modal-actions">
                            <button className="csm-btn csm-btn--danger" onClick={() => handleRemoveQuickLink(removeLinkConfirm.id)}>Да, премахни</button>
                            <button className="csm-btn" onClick={() => setRemoveLinkConfirm(null)}>Отказ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics panel */}
            <CloudStorageAnalytics
                open={showAnalytics}
                onClose={() => setShowAnalytics(false)}
                analytics={analyticsData}
                loading={loadingAnalytics}
                formatSize={formatSize}
            />

            {/* Share file modal (link) */}
            {shareModal && (
                <ShareFileModal
                    filePath={shareModal.filePath}
                    fileName={shareModal.fileName}
                    onClose={() => setShareModal(null)}
                />
            )}

            {/* Share with user modal */}
            {shareWithUserModal && (
                <ShareWithUserModal
                    filePath={shareWithUserModal.filePath}
                    fileName={shareWithUserModal.fileName}
                    onClose={() => setShareWithUserModal(null)}
                />
            )}
        </div>
    );
};

export default CloudStorageManager;
