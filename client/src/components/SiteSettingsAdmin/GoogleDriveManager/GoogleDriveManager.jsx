import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Home, ChevronRight, FolderPlus, Search, Folder,
    Image, FileText, Video, File, FileSpreadsheet, Presentation,
    Download, Trash2, X, Check, Pencil, Upload, LayoutGrid, List,
    RefreshCw, ArrowLeft, AlertCircle, HardDrive, ExternalLink, Camera, Share2,
    Lock, Unlock, KeyRound, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useDrive } from '../../contexts/DriveProvider';
import DriveShareModal from './DriveShareModal';
import './googleDriveManager.css';

const formatSize = (bytes) => {
    if (!bytes) return '\u2014';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const NEW_BADGE_HOURS = 48;

const isNewItem = (createdTime) => {
    if (!createdTime) return false;
    const created = new Date(createdTime).getTime();
    const now = Date.now();
    return (now - created) < NEW_BADGE_HOURS * 60 * 60 * 1000;
};

const getDriveFileIcon = (mimeType, name) => {
    if (!mimeType) return File;
    if (mimeType === 'application/vnd.google-apps.folder') return Folder;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf' || mimeType === 'application/vnd.google-apps.document') return FileText;
    if (mimeType.includes('video')) return Video;
    if (mimeType.includes('presentation') || mimeType === 'application/vnd.google-apps.presentation' || name?.endsWith('.pptx')) return Presentation;
    if (mimeType.includes('word') || name?.endsWith('.docx')) return FileText;
    if (mimeType.includes('spreadsheet') || mimeType === 'application/vnd.google-apps.spreadsheet' || name?.endsWith('.xlsx')) return FileSpreadsheet;
    return File;
};

const GoogleDriveManager = () => {
    const { t } = useTranslation('admin');
    const {
        checkStatus, listFiles, searchFiles, uploadFile,
        createFolder, deleteFile, renameFile, getDownloadUrl, getQuota,
        setFolderPassword, removeFolderPassword, verifyFolderPassword, getProtectedFolders,
        setSuperPassword, getSuperPasswordStatus, removeSuperPassword, requestPasswordReset,
    } = useDrive();

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Navigation state — stack of { id, name } for breadcrumbs
    const [folderStack, setFolderStack] = useState([]);
    const currentFolderId = folderStack.length > 0 ? folderStack[folderStack.length - 1].id : 'root';

    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [renamingItem, setRenamingItem] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [quota, setQuota] = useState(null);
    const [connected, setConnected] = useState(null);
    const [statusError, setStatusError] = useState(null);
    const [shareModal, setShareModal] = useState(null);
    const [protectedFolders, setProtectedFolders] = useState({});
    const [passwordPrompt, setPasswordPrompt] = useState(null); // { folder, resolve }
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [setPasswordModal, setSetPasswordModal] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [lockTimeout, setLockTimeout] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [superPasswordModal, setSuperPasswordModal] = useState(false);
    const [superPwdInput, setSuperPwdInput] = useState('');
    const [showSuperPassword, setShowSuperPassword] = useState(false);
    const [hasSuperPassword, setHasSuperPassword] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const unlockedFoldersRef = useRef(new Set());
    const lockTimersRef = useRef({});

    // Auto-lock: re-lock folder after timeout
    const startLockTimer = (folderId, timeoutMinutes) => {
        if (!timeoutMinutes) return;
        // Clear existing timer
        if (lockTimersRef.current[folderId]) {
            clearTimeout(lockTimersRef.current[folderId]);
        }
        lockTimersRef.current[folderId] = setTimeout(() => {
            unlockedFoldersRef.current.delete(folderId);
            delete lockTimersRef.current[folderId];
            // If currently inside this folder, navigate out
            if (folderStack.some(f => f.id === folderId)) {
                const idx = folderStack.findIndex(f => f.id === folderId);
                setFolderStack(prev => prev.slice(0, idx));
                toast.info(t('googleDrive.password.autoLocked'));
            }
        }, timeoutMinutes * 60 * 1000);
    };

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(lockTimersRef.current).forEach(clearTimeout);
        };
    }, []);

    // ─── Check Drive connection ──────────────────────────────────────────────
    useEffect(() => {
        const check = async () => {
            try {
                const status = await checkStatus();
                setConnected(status.connected);
                if (!status.connected) {
                    setStatusError(status.error);
                }
                if (status.quota) {
                    setQuota(status.quota);
                }
                if (status.connected) {
                    try {
                        const pf = await getProtectedFolders();
                        setProtectedFolders(pf.protectedFolders || {});
                    } catch { /* ignore — passwords are optional */ }
                    try {
                        const sp = await getSuperPasswordStatus();
                        setHasSuperPassword(sp.hasSuperPassword || false);
                    } catch { /* ignore */ }
                    try {
                        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                        if (auth.userId) setCurrentUserId(auth.userId);
                    } catch { /* ignore */ }
                }
            } catch {
                setConnected(false);
                setStatusError('Failed to connect');
            }
        };
        check();
    }, [checkStatus, getProtectedFolders]);

    // ─── Load files ──────────────────────────────────────────────────────────
    const loadFiles = useCallback(async (folderId = currentFolderId) => {
        setLoading(true);
        try {
            const result = await listFiles(folderId);
            setFolders(result.folders || []);
            setFiles(result.files || []);
            setSelectedItems(new Set());
        } catch (err) {
            toast.error(t('googleDrive.errors.loadFailed'));
            console.error('Load files error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentFolderId, listFiles, t]);

    useEffect(() => {
        if (connected) {
            loadFiles();
        }
    }, [connected, currentFolderId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Search ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!search.trim()) {
            setSearchResults(null);
            return;
        }
        searchTimeoutRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const result = await searchFiles(search.trim());
                setSearchResults(result.files || []);
            } catch {
                toast.error(t('googleDrive.errors.searchFailed'));
            } finally {
                setSearching(false);
            }
        }, 500);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [search, searchFiles, t]);

    // ─── Navigation ──────────────────────────────────────────────────────────
    const navigateToFolder = async (folder) => {
        // Check if folder is password-protected
        if (protectedFolders[folder.id] && !unlockedFoldersRef.current.has(folder.id)) {
            setPasswordPrompt(folder);
            setPasswordInput('');
            setPasswordError(false);
            return;
        }
        setSearch('');
        setSearchResults(null);
        setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }]);
    };

    const handlePasswordSubmit = async () => {
        if (!passwordPrompt || !passwordInput) return;
        try {
            const result = await verifyFolderPassword(passwordPrompt.id, passwordInput);
            if (result.valid) {
                unlockedFoldersRef.current.add(passwordPrompt.id);
                // Start auto-lock timer if configured
                const folderInfo = protectedFolders[passwordPrompt.id];
                if (folderInfo?.lockTimeout) {
                    startLockTimer(passwordPrompt.id, folderInfo.lockTimeout);
                }
                const folder = passwordPrompt;
                setPasswordPrompt(null);
                setPasswordInput('');
                setPasswordError(false);
                setSearch('');
                setSearchResults(null);
                setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }]);
            } else {
                setPasswordError(true);
            }
        } catch {
            toast.error(t('googleDrive.errors.loadFailed'));
        }
    };

    // ─── Set/Remove password on folder ───────────────────────────────────────
    const handleSetPassword = async () => {
        if (!setPasswordModal || !newPassword || newPassword.length < 4) return;
        const folderInfo = protectedFolders[setPasswordModal.id];
        try {
            await setFolderPassword(setPasswordModal.id, newPassword, setPasswordModal.name, folderInfo ? oldPassword : null, lockTimeout);
            const pf = await getProtectedFolders();
            setProtectedFolders(pf.protectedFolders || {});
            toast.success(t('googleDrive.password.set'));
            setSetPasswordModal(null);
            setNewPassword('');
            setOldPassword('');
            setOldPasswordError('');
        } catch (err) {
            const errorCode = err?.error || '';
            if (errorCode === 'WRONG_OLD_PASSWORD') {
                setOldPasswordError(t('googleDrive.password.wrongOld'));
            } else if (errorCode === 'OLD_PASSWORD_REQUIRED') {
                setOldPasswordError(t('googleDrive.password.oldRequired'));
            } else {
                toast.error(t('googleDrive.password.setFailed'));
            }
        }
    };

    const handleRequestReset = async () => {
        if (!setPasswordModal) return;
        try {
            await requestPasswordReset(setPasswordModal.id);
            toast.success(t('googleDrive.password.resetSent'));
        } catch {
            toast.error(t('googleDrive.password.resetFailed'));
        }
    };

    const handleSetSuperPassword = async () => {
        if (!superPwdInput || superPwdInput.length < 4) return;
        try {
            await setSuperPassword(superPwdInput);
            setHasSuperPassword(true);
            toast.success(t('googleDrive.superPassword.set'));
            setSuperPasswordModal(false);
            setSuperPwdInput('');
            setShowSuperPassword(false);
        } catch {
            toast.error(t('googleDrive.superPassword.setFailed'));
        }
    };

    const handleRemoveSuperPassword = async () => {
        try {
            await removeSuperPassword();
            setHasSuperPassword(false);
            toast.success(t('googleDrive.superPassword.removed'));
            setSuperPasswordModal(false);
        } catch {
            toast.error(t('googleDrive.superPassword.removeFailed'));
        }
    };

    const handleRemovePassword = async () => {
        if (!setPasswordModal || !oldPassword) {
            setOldPasswordError(t('googleDrive.password.oldRequired'));
            return;
        }
        try {
            await removeFolderPassword(setPasswordModal.id, oldPassword);
            setProtectedFolders(prev => {
                const next = { ...prev };
                delete next[setPasswordModal.id];
                return next;
            });
            unlockedFoldersRef.current.delete(setPasswordModal.id);
            toast.success(t('googleDrive.password.removed'));
            setSetPasswordModal(null);
            setOldPassword('');
            setOldPasswordError('');
        } catch (err) {
            const errorCode = err?.error || '';
            if (errorCode === 'WRONG_PASSWORD' || errorCode === 'PASSWORD_REQUIRED') {
                setOldPasswordError(t('googleDrive.password.wrongOld'));
            } else {
                toast.error(t('googleDrive.password.removeFailed'));
            }
        }
    };

    const navigateToBreadcrumb = (index) => {
        setSearch('');
        setSearchResults(null);
        if (index < 0) {
            setFolderStack([]);
        } else {
            setFolderStack(prev => prev.slice(0, index + 1));
        }
    };

    const goBack = () => {
        setSearch('');
        setSearchResults(null);
        setFolderStack(prev => prev.slice(0, -1));
    };

    // ─── Upload ──────────────────────────────────────────────────────────────
    const handleUpload = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        setUploading(true);
        try {
            for (const file of Array.from(fileList)) {
                await uploadFile(currentFolderId, file);
            }
            toast.success(t('googleDrive.uploadSuccess'));
            loadFiles();
        } catch {
            toast.error(t('googleDrive.errors.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    // ─── Create folder ───────────────────────────────────────────────────────
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await createFolder(newFolderName.trim(), currentFolderId);
            toast.success(t('googleDrive.folderCreated'));
            setShowNewFolder(false);
            setNewFolderName('');
            loadFiles();
        } catch {
            toast.error(t('googleDrive.errors.folderFailed'));
        }
    };

    // ─── Delete ──────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteFile(deleteConfirm.id);
            toast.success(t('googleDrive.deleted'));
            setDeleteConfirm(null);
            loadFiles();
        } catch {
            toast.error(t('googleDrive.errors.deleteFailed'));
        }
    };

    // ─── Rename ──────────────────────────────────────────────────────────────
    const startRename = (item) => {
        setRenamingItem(item.id);
        setRenameValue(item.name);
    };

    const handleRename = async (id) => {
        if (!renameValue.trim()) return;
        try {
            await renameFile(id, renameValue.trim());
            toast.success(t('googleDrive.renamed'));
            setRenamingItem(null);
            setRenameValue('');
            loadFiles();
        } catch {
            toast.error(t('googleDrive.errors.renameFailed'));
        }
    };

    // ─── Download ────────────────────────────────────────────────────────────
    const handleDownload = (fileId) => {
        const url = getDownloadUrl(fileId);
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        // Use fetch with auth header, then trigger download
        fetch(url, {
            headers: { Authorization: `Bearer ${auth.token}` },
            credentials: 'include',
        })
            .then(res => {
                const disposition = res.headers.get('Content-Disposition');
                let filename = 'download';
                if (disposition) {
                    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i);
                    if (match) filename = decodeURIComponent(match[1]);
                }
                return res.blob().then(blob => ({ blob, filename }));
            })
            .then(({ blob, filename }) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                a.click();
                URL.revokeObjectURL(a.href);
            })
            .catch(() => toast.error(t('googleDrive.errors.downloadFailed')));
    };

    // ─── Drag & drop ─────────────────────────────────────────────────────────
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    // ─── Select ──────────────────────────────────────────────────────────────
    const toggleSelect = (id) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const allItems = [...folders, ...files];
    const allSelected = allItems.length > 0 && allItems.every(i => selectedItems.has(i.id));
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(allItems.map(i => i.id)));
        }
    };

    // ─── Bulk delete ─────────────────────────────────────────────────────────
    const handleBulkDelete = async () => {
        try {
            for (const id of selectedItems) {
                await deleteFile(id);
            }
            toast.success(t('googleDrive.deleted'));
            setSelectedItems(new Set());
            loadFiles();
        } catch {
            toast.error(t('googleDrive.errors.deleteFailed'));
        }
    };

    // ─── Display items (search or folder contents) ───────────────────────────
    const displayFolders = searchResults ? [] : folders;
    const displayFiles = searchResults || files;

    // ─── Not connected state ─────────────────────────────────────────────────
    if (connected === false) {
        return (
            <div className="gdm-container">
                <div className="gdm-disconnected">
                    <AlertCircle size={48} />
                    <h3>{t('googleDrive.notConnected')}</h3>
                    <p>{t('googleDrive.notConnectedHint')}</p>
                    {statusError && <p className="gdm-error-detail">{statusError}</p>}
                </div>
            </div>
        );
    }

    if (connected === null) {
        return (
            <div className="gdm-container">
                <div className="gdm-loading-status">
                    <RefreshCw size={24} className="gdm-spin" />
                    <span>{t('googleDrive.checking')}</span>
                </div>
            </div>
        );
    }

    const dateStr = (date) => {
        if (!date) return '\u2014';
        return new Date(date).toLocaleDateString('bg-BG', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="gdm-container">
            {/* ─── Toolbar ──────────────────────────────────────────────── */}
            <div className="gdm-toolbar">
                <div className="gdm-actions">
                    <button className="gdm-action" onClick={() => { setShowNewFolder(true); setNewFolderName(''); }}>
                        <FolderPlus size={16} />
                        <span>{t('googleDrive.newFolder')}</span>
                    </button>
                    <button className="gdm-action" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Upload size={16} />
                        <span>{uploading ? '...' : t('googleDrive.upload')}</span>
                    </button>
                    <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => { handleUpload(e.target.files); e.target.value = ''; }} />
                    <button className="gdm-action gdm-mobile-only" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                        <Camera size={16} />
                        <span>{t('googleDrive.camera')}</span>
                    </button>
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { handleUpload(e.target.files); e.target.value = ''; }} />
                    <button
                        className={`gdm-action ${hasSuperPassword ? 'gdm-action--super-active' : ''}`}
                        onClick={() => { setSuperPasswordModal(true); setSuperPwdInput(''); setShowSuperPassword(false); }}
                    >
                        <KeyRound size={16} />
                        <span>{t('googleDrive.superPassword.btn')}</span>
                    </button>
                    {selectedItems.size > 0 && (
                        <button className="gdm-action gdm-action--danger" onClick={handleBulkDelete}>
                            <Trash2 size={16} />
                            <span>{t('googleDrive.deleteSelected')} ({selectedItems.size})</span>
                        </button>
                    )}
                </div>

                <div className="gdm-search">
                    <Search size={16} className="gdm-search-icon" />
                    <input
                        type="text"
                        className="gdm-search-field"
                        placeholder={t('googleDrive.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="gdm-search-x" onClick={() => { setSearch(''); setSearchResults(null); }}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="gdm-controls">
                    <div className="gdm-view-toggle">
                        <button className={viewMode === 'grid' ? 'gdm-vt-active' : ''} onClick={() => setViewMode('grid')}>
                            <LayoutGrid size={15} />
                        </button>
                        <button className={viewMode === 'list' ? 'gdm-vt-active' : ''} onClick={() => setViewMode('list')}>
                            <List size={15} />
                        </button>
                    </div>

                    <button className="gdm-icon-btn" onClick={() => loadFiles()} title={t('googleDrive.refresh')}>
                        <RefreshCw size={15} className={loading ? 'gdm-spin' : ''} />
                    </button>

                    {quota && (
                        <div className="gdm-usage">
                            <div className="gdm-usage-bar">
                                <div className="gdm-usage-fill" style={{ width: `${quota.limit ? Math.min(100, (quota.usage / quota.limit) * 100) : 0}%` }} />
                            </div>
                            <span className="gdm-usage-text">{formatSize(quota.usage)} / {formatSize(quota.limit)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Breadcrumb ───────────────────────────────────────────── */}
            <div className="gdm-breadcrumb">
                {folderStack.length > 0 && (
                    <button className="gdm-back" onClick={goBack} title={t('googleDrive.back')}>
                        <ArrowLeft size={16} />
                    </button>
                )}

                <div className="gdm-breadcrumb-desktop">
                    <button
                        className={`gdm-crumb ${folderStack.length === 0 ? 'gdm-crumb--active' : ''}`}
                        onClick={() => navigateToBreadcrumb(-1)}
                    >
                        <HardDrive size={14} />
                        <span>My Drive</span>
                    </button>
                    {folderStack.map((item, i) => (
                        <span key={item.id} className="gdm-crumb-step">
                            <ChevronRight size={14} className="gdm-crumb-arrow" />
                            <button
                                className={`gdm-crumb ${i === folderStack.length - 1 ? 'gdm-crumb--active' : ''}`}
                                onClick={() => navigateToBreadcrumb(i)}
                            >
                                <Folder size={14} />
                                <span>{item.name}</span>
                            </button>
                        </span>
                    ))}
                </div>

                <div className="gdm-breadcrumb-mobile">
                    <Folder size={22} />
                    <span>{folderStack.length > 0 ? folderStack[folderStack.length - 1].name : 'My Drive'}</span>
                </div>
            </div>

            {/* ─── New folder input ────────────────────────────────────── */}
            {showNewFolder && (
                <div className="gdm-new-folder">
                    <Folder size={18} />
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
                        placeholder={t('googleDrive.folderName')}
                        autoFocus
                    />
                    <button onClick={handleCreateFolder}><Check size={16} /></button>
                    <button onClick={() => setShowNewFolder(false)}><X size={16} /></button>
                </div>
            )}

            {/* ─── Search indicator ────────────────────────────────────── */}
            {searchResults && (
                <div className="gdm-search-info">
                    <Search size={14} />
                    <span>{t('googleDrive.searchResults', { count: searchResults.length })}</span>
                    <button onClick={() => { setSearch(''); setSearchResults(null); }}>
                        <X size={14} /> {t('googleDrive.clearSearch')}
                    </button>
                </div>
            )}

            {/* ─── File list ───────────────────────────────────────────── */}
            <div
                className={`gdm-content ${dragOver ? 'gdm-content--dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {loading || searching ? (
                    <div className="gdm-loading">
                        <RefreshCw size={24} className="gdm-spin" />
                        <span>{t('googleDrive.loading')}</span>
                    </div>
                ) : displayFolders.length === 0 && displayFiles.length === 0 ? (
                    <div className="gdm-empty">
                        <Folder size={48} />
                        <p>{t('googleDrive.empty')}</p>
                        <p className="gdm-empty-hint">{t('googleDrive.emptyHint')}</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="gdm-grid">
                        {displayFolders.map(folder => (
                            <div
                                key={folder.id}
                                className={`gdm-grid-item gdm-grid-item--folder ${selectedItems.has(folder.id) ? 'gdm-grid-item--selected' : ''}`}
                            >
                                <div className="gdm-grid-checkbox">
                                    <input type="checkbox" checked={selectedItems.has(folder.id)} onChange={() => toggleSelect(folder.id)} />
                                </div>
                                <div className="gdm-grid-icon" onClick={() => navigateToFolder(folder)}>
                                    <Folder size={40} />
                                    {protectedFolders[folder.id] && <Lock size={14} className="gdm-lock-badge" />}
                                    {isNewItem(folder.createdTime) && <span className="gdm-new-badge">NEW</span>}
                                </div>
                                {renamingItem === folder.id ? (
                                    <div className="gdm-rename-inline">
                                        <input
                                            type="text" value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(folder.id); if (e.key === 'Escape') setRenamingItem(null); }}
                                            autoFocus
                                        />
                                        <button onClick={() => handleRename(folder.id)}><Check size={14} /></button>
                                        <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                                    </div>
                                ) : (
                                    <span className="gdm-grid-name" onClick={() => navigateToFolder(folder)}>{folder.name}</span>
                                )}
                                <div className="gdm-grid-actions">
                                    {protectedFolders[folder.id] ? (
                                        <button className="gdm-action-locked" title={t('googleDrive.password.changeTitle')} onClick={() => { setSetPasswordModal(folder); setNewPassword(''); setShowNewPassword(false); }}><Lock size={14} /></button>
                                    ) : (
                                        <button title={t('googleDrive.password.setTitle')} onClick={() => { setSetPasswordModal(folder); setNewPassword(''); setShowNewPassword(false); setLockTimeout(null); }}><Lock size={14} /></button>
                                    )}
                                    <button title={t('googleDrive.share.title')} onClick={() => setShareModal(folder)}><Share2 size={14} /></button>
                                    {folder.webViewLink && (
                                        <a href={folder.webViewLink} target="_blank" rel="noopener noreferrer" title={t('googleDrive.openInDrive')}>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                    <button title={t('googleDrive.rename')} onClick={() => startRename(folder)}><Pencil size={14} /></button>
                                    <button title={t('googleDrive.delete')} onClick={() => setDeleteConfirm(folder)}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {displayFiles.map(file => {
                            const FileIcon = getDriveFileIcon(file.mimeType, file.name);
                            return (
                                <div
                                    key={file.id}
                                    className={`gdm-grid-item ${selectedItems.has(file.id) ? 'gdm-grid-item--selected' : ''}`}
                                >
                                    <div className="gdm-grid-checkbox">
                                        <input type="checkbox" checked={selectedItems.has(file.id)} onChange={() => toggleSelect(file.id)} />
                                    </div>
                                    <div className="gdm-grid-icon">
                                        {file.thumbnailLink ? (
                                            <img src={file.thumbnailLink} alt={file.name} className="gdm-grid-thumb" onError={e => { e.target.style.display = 'none'; }} />
                                        ) : (
                                            <FileIcon size={40} />
                                        )}
                                        {isNewItem(file.createdTime) && <span className="gdm-new-badge">NEW</span>}
                                    </div>
                                    {renamingItem === file.id ? (
                                        <div className="gdm-rename-inline">
                                            <input
                                                type="text" value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(file.id); if (e.key === 'Escape') setRenamingItem(null); }}
                                                autoFocus
                                            />
                                            <button onClick={() => handleRename(file.id)}><Check size={14} /></button>
                                            <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <span className="gdm-grid-name" title={file.name}>{file.name}</span>
                                    )}
                                    <span className="gdm-grid-size">{formatSize(file.size)}</span>
                                    <div className="gdm-grid-actions">
                                        <button title={t('googleDrive.share.title')} onClick={() => setShareModal(file)}><Share2 size={14} /></button>
                                        {file.webViewLink && (
                                            <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" title={t('googleDrive.openInDrive')}>
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                        <button title={t('googleDrive.download')} onClick={() => handleDownload(file.id)}><Download size={14} /></button>
                                        <button title={t('googleDrive.rename')} onClick={() => startRename(file)}><Pencil size={14} /></button>
                                        <button title={t('googleDrive.delete')} onClick={() => setDeleteConfirm(file)}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ─── List view ─── */
                    <div className="gdm-list-wrapper">
                        <table className="gdm-list-table">
                            <thead>
                                <tr>
                                    <th className="gdm-list-check">
                                        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="gdm-list-name">{t('googleDrive.name')}</th>
                                    <th className="gdm-list-size">{t('googleDrive.size')}</th>
                                    <th className="gdm-list-date">{t('googleDrive.modified')}</th>
                                    <th className="gdm-list-actions">{t('googleDrive.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayFolders.map(folder => (
                                    <tr key={folder.id} className={`gdm-list-row ${selectedItems.has(folder.id) ? 'gdm-list-row--selected' : ''}`}>
                                        <td className="gdm-list-check">
                                            <input type="checkbox" checked={selectedItems.has(folder.id)} onChange={() => toggleSelect(folder.id)} />
                                        </td>
                                        <td className="gdm-list-name">
                                            <div className="gdm-list-name-inner">
                                                <Folder size={18} className="gdm-list-icon gdm-list-icon--folder" />
                                                {renamingItem === folder.id ? (
                                                    <div className="gdm-rename-inline">
                                                        <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(folder.id); if (e.key === 'Escape') setRenamingItem(null); }}
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleRename(folder.id)}><Check size={14} /></button>
                                                        <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="gdm-list-link" onClick={() => navigateToFolder(folder)}>{folder.name}</span>
                                                        {isNewItem(folder.createdTime) && <span className="gdm-new-badge gdm-new-badge--inline">NEW</span>}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="gdm-list-size">{'\u2014'}</td>
                                        <td className="gdm-list-date">{dateStr(folder.modifiedTime)}</td>
                                        <td className="gdm-list-actions">
                                            {protectedFolders[folder.id] ? (
                                                <button className="gdm-action-locked" title={t('googleDrive.password.changeTitle')} onClick={() => { setSetPasswordModal(folder); setNewPassword(''); setOldPassword(''); setOldPasswordError(''); setShowNewPassword(false); setShowOldPassword(false); setLockTimeout(protectedFolders[folder.id]?.lockTimeout || null); }}><Lock size={14} /></button>
                                            ) : (
                                                <button title={t('googleDrive.password.setTitle')} onClick={() => { setSetPasswordModal(folder); setNewPassword(''); setLockTimeout(null); }}><Lock size={14} /></button>
                                            )}
                                            <button title={t('googleDrive.share.title')} onClick={() => setShareModal(folder)}><Share2 size={14} /></button>
                                            {folder.webViewLink && (
                                                <a href={folder.webViewLink} target="_blank" rel="noopener noreferrer" title={t('googleDrive.openInDrive')}>
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <button title={t('googleDrive.rename')} onClick={() => startRename(folder)}><Pencil size={14} /></button>
                                            <button title={t('googleDrive.delete')} onClick={() => setDeleteConfirm(folder)}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {displayFiles.map(file => {
                                    const FileIcon = getDriveFileIcon(file.mimeType, file.name);
                                    return (
                                        <tr key={file.id} className={`gdm-list-row ${selectedItems.has(file.id) ? 'gdm-list-row--selected' : ''}`}>
                                            <td className="gdm-list-check">
                                                <input type="checkbox" checked={selectedItems.has(file.id)} onChange={() => toggleSelect(file.id)} />
                                            </td>
                                            <td className="gdm-list-name">
                                                <div className="gdm-list-name-inner">
                                                    {file.thumbnailLink ? (
                                                        <img src={file.thumbnailLink} alt={file.name} className="gdm-list-thumb" onError={e => { e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <FileIcon size={18} className="gdm-list-icon" />
                                                    )}
                                                    {renamingItem === file.id ? (
                                                        <div className="gdm-rename-inline">
                                                            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(file.id); if (e.key === 'Escape') setRenamingItem(null); }}
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleRename(file.id)}><Check size={14} /></button>
                                                            <button onClick={() => setRenamingItem(null)}><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="gdm-list-filename">{file.name}</span>
                                                            {isNewItem(file.createdTime) && <span className="gdm-new-badge gdm-new-badge--inline">NEW</span>}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="gdm-list-size">{formatSize(file.size)}</td>
                                            <td className="gdm-list-date">{dateStr(file.modifiedTime)}</td>
                                            <td className="gdm-list-actions">
                                                <button title={t('googleDrive.share.title')} onClick={() => setShareModal(file)}><Share2 size={14} /></button>
                                                {file.webViewLink && (
                                                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" title={t('googleDrive.openInDrive')}>
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                                <button title={t('googleDrive.download')} onClick={() => handleDownload(file.id)}><Download size={14} /></button>
                                                <button title={t('googleDrive.rename')} onClick={() => startRename(file)}><Pencil size={14} /></button>
                                                <button title={t('googleDrive.delete')} onClick={() => setDeleteConfirm(file)}><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Drag overlay */}
                {dragOver && (
                    <div className="gdm-drop-overlay">
                        <Upload size={48} />
                        <p>{t('googleDrive.dropHere')}</p>
                    </div>
                )}
            </div>

            {/* ─── Password prompt modal ──────────────────────────────── */}
            {passwordPrompt && (
                <div className="gdm-modal-overlay" onClick={() => { setPasswordPrompt(null); setShowPassword(false); }}>
                    <div className="gdm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3><KeyRound size={18} /> {t('googleDrive.password.enterTitle')}</h3>
                        <p>{t('googleDrive.password.enterMsg', { name: passwordPrompt.name })}</p>
                        <div className="gdm-password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="gdm-password-input"
                                value={passwordInput}
                                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                                placeholder={t('googleDrive.password.placeholder')}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="gdm-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {passwordError && <p className="gdm-password-error">{t('googleDrive.password.wrong')}</p>}
                        <div className="gdm-modal-actions">
                            <button className="gdm-btn gdm-btn--cancel" onClick={() => { setPasswordPrompt(null); setShowPassword(false); }}>
                                {t('googleDrive.cancel')}
                            </button>
                            <button className="gdm-btn gdm-btn--primary" onClick={handlePasswordSubmit}>
                                <Lock size={14} /> {t('googleDrive.password.unlock')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Set password modal ────────────────────────────────── */}
            {setPasswordModal && (() => {
                const folderInfo = protectedFolders[setPasswordModal.id];
                const hasExisting = !!folderInfo;
                return (
                    <div className="gdm-modal-overlay" onClick={() => { setSetPasswordModal(null); setShowNewPassword(false); setShowOldPassword(false); setOldPassword(''); setNewPassword(''); setOldPasswordError(''); }}>
                        <div className="gdm-modal" onClick={(e) => e.stopPropagation()}>
                            <h3><Lock size={18} /> {hasExisting ? t('googleDrive.password.changeTitle') : t('googleDrive.password.setTitle')}</h3>
                            <p>{t('googleDrive.password.setMsg', { name: setPasswordModal.name })}</p>
                            {hasExisting && folderInfo.creatorEmail && (
                                <p className="gdm-creator-info">
                                    {t('googleDrive.password.createdBy')}: <strong>{folderInfo.creatorEmail}</strong>
                                </p>
                            )}

                            {/* Old password (only if folder already has one) */}
                            {hasExisting && (
                                <div className="gdm-password-wrapper">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        className={`gdm-password-input ${oldPasswordError ? 'gdm-password-input--error' : ''}`}
                                        value={oldPassword}
                                        onChange={(e) => { setOldPassword(e.target.value); setOldPasswordError(''); }}
                                        placeholder={t('googleDrive.password.oldPlaceholder')}
                                        autoFocus
                                    />
                                    <button type="button" className="gdm-password-toggle" onClick={() => setShowOldPassword(!showOldPassword)} tabIndex={-1}>
                                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            )}
                            {oldPasswordError && <p className="gdm-password-error">{oldPasswordError}</p>}

                            {/* New password */}
                            <div className="gdm-password-wrapper">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    className="gdm-password-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSetPassword(); }}
                                    placeholder={t('googleDrive.password.newPlaceholder')}
                                    autoFocus={!hasExisting}
                                />
                                <button type="button" className="gdm-password-toggle" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Auto-lock timeout */}
                            <div className="gdm-lock-timeout">
                                <label>{t('googleDrive.password.autoLockLabel')}</label>
                                <select
                                    value={lockTimeout === null ? '' : lockTimeout}
                                    onChange={(e) => setLockTimeout(e.target.value === '' ? null : parseInt(e.target.value))}
                                    className="gdm-lock-timeout-select"
                                >
                                    <option value="">{t('googleDrive.password.noAutoLock')}</option>
                                    <option value="5">5 {t('googleDrive.password.minutes')}</option>
                                    <option value="10">10 {t('googleDrive.password.minutes')}</option>
                                    <option value="15">15 {t('googleDrive.password.minutes')}</option>
                                    <option value="30">30 {t('googleDrive.password.minutes')}</option>
                                </select>
                            </div>

                            <div className="gdm-modal-actions">
                                {hasExisting && (
                                    <>
                                        <button className="gdm-btn gdm-btn--danger" onClick={handleRemovePassword} disabled={!oldPassword}>
                                            <Unlock size={14} /> {t('googleDrive.password.remove')}
                                        </button>
                                        <button className="gdm-btn gdm-btn--reset" onClick={handleRequestReset} title={t('googleDrive.password.resetHint')}>
                                            {t('googleDrive.password.forgot')}
                                        </button>
                                    </>
                                )}
                                <button className="gdm-btn gdm-btn--cancel" onClick={() => { setSetPasswordModal(null); setShowNewPassword(false); setShowOldPassword(false); setOldPassword(''); setNewPassword(''); setOldPasswordError(''); }}>
                                    {t('googleDrive.cancel')}
                                </button>
                                <button className="gdm-btn gdm-btn--primary" onClick={handleSetPassword} disabled={newPassword.length < 4 || (hasExisting && !oldPassword)}>
                                    <Lock size={14} /> {t('googleDrive.password.setBtn')}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ─── Super admin password modal ────────────────────────── */}
            {superPasswordModal && (
                <div className="gdm-modal-overlay" onClick={() => { setSuperPasswordModal(false); setShowSuperPassword(false); }}>
                    <div className="gdm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3><KeyRound size={18} /> {t('googleDrive.superPassword.title')}</h3>
                        <p>{t('googleDrive.superPassword.description')}</p>
                        <div className="gdm-password-wrapper">
                            <input
                                type={showSuperPassword ? 'text' : 'password'}
                                className="gdm-password-input"
                                value={superPwdInput}
                                onChange={(e) => setSuperPwdInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSetSuperPassword(); }}
                                placeholder={t('googleDrive.superPassword.placeholder')}
                                autoFocus
                            />
                            <button type="button" className="gdm-password-toggle" onClick={() => setShowSuperPassword(!showSuperPassword)} tabIndex={-1}>
                                {showSuperPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="gdm-modal-actions">
                            {hasSuperPassword && (
                                <button className="gdm-btn gdm-btn--danger" onClick={handleRemoveSuperPassword}>
                                    <Unlock size={14} /> {t('googleDrive.superPassword.remove')}
                                </button>
                            )}
                            <button className="gdm-btn gdm-btn--cancel" onClick={() => { setSuperPasswordModal(false); setShowSuperPassword(false); }}>
                                {t('googleDrive.cancel')}
                            </button>
                            <button className="gdm-btn gdm-btn--primary" onClick={handleSetSuperPassword} disabled={superPwdInput.length < 4}>
                                <KeyRound size={14} /> {t('googleDrive.superPassword.setBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Share modal ──────────────────────────────────────────── */}
            {shareModal && (
                <DriveShareModal
                    item={shareModal}
                    onClose={() => setShareModal(null)}
                />
            )}

            {/* ─── Delete confirmation modal ───────────────────────────── */}
            {deleteConfirm && (
                <div className="gdm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="gdm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('googleDrive.confirmDelete')}</h3>
                        <p>{t('googleDrive.confirmDeleteMsg', { name: deleteConfirm.name })}</p>
                        <div className="gdm-modal-actions">
                            <button className="gdm-btn gdm-btn--cancel" onClick={() => setDeleteConfirm(null)}>
                                {t('googleDrive.cancel')}
                            </button>
                            <button className="gdm-btn gdm-btn--danger" onClick={handleDelete}>
                                <Trash2 size={14} /> {t('googleDrive.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleDriveManager;
