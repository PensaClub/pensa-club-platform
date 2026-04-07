import { useTranslation } from 'react-i18next';
import {
    FolderPlus, Upload, LayoutGrid, List, Search, RefreshCw,
    Camera, BarChart3, Globe, FolderSearch, X
} from 'lucide-react';
import './cloudStorageToolbar.css';

const CloudStorageToolbar = ({
    currentPath,
    onNewFolder,
    onUpload,
    onInitialize,
    onCreateProject,
    viewMode,
    onViewModeChange,
    search,
    onSearchChange,
    searchMode,
    onSearchModeChange,
    typeFilter,
    onTypeFilterChange,
    onRefresh,
    onSync,
    onAnalytics,
    loading,
    syncing,
    storageUsage,
    uploading,
    onClearSearch,
    fileInputRef,
    cameraInputRef,
    formatSize,
}) => {
    const { t } = useTranslation('admin');

    return (
        <div className="cst-toolbar">
            {/* Ред 1: Действия */}
            <div className="cst-row">
                <button className="cst-btn cst-btn--primary" onClick={onNewFolder}>
                    <FolderPlus size={15} />
                    <span>{t('cloudStorage.newFolder')}</span>
                </button>
                <button className="cst-btn cst-btn--primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload size={15} />
                    <span>{uploading ? t('cloudStorage.uploading') : t('cloudStorage.upload')}</span>
                </button>
                <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => { onUpload(e.target.files); e.target.value = ''; }} />
                <button className="cst-btn cst-btn--primary cst-camera-btn" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                    <Camera size={15} />
                    <span>{t('cloudStorage.camera')}</span>
                </button>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { onUpload(e.target.files); e.target.value = ''; }} />
                {!currentPath && (
                    <button className="cst-btn cst-btn--primary" onClick={onInitialize}>
                        <FolderPlus size={15} />
                        <span>{t('cloudStorage.initialize', 'Инициализирай')}</span>
                    </button>
                )}
                {currentPath === 'pensa-foundation/projects/' && (
                    <button className="cst-btn cst-btn--primary" onClick={onCreateProject}>
                        <FolderPlus size={15} />
                        <span>{t('cloudStorage.newProject', 'Нов проект')}</span>
                    </button>
                )}
            </div>

            {/* Ред 2: Търсене — цял ред */}
            <div className="cst-row">
                <div className="cst-search-full">
                    <Search size={14} />
                    <input
                        type="text"
                        className="cst-search-input"
                        placeholder={t('cloudStorage.searchPlaceholder')}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {search && (
                        <button className="cst-search-clear" onClick={onClearSearch}>
                            <X size={13} />
                        </button>
                    )}
                    <button
                        className={`cst-search-mode ${searchMode === 'global' ? 'cst-active' : ''}`}
                        onClick={() => onSearchModeChange(searchMode === 'local' ? 'global' : 'local')}
                        title={searchMode === 'local' ? t('cloudStorage.searchEverywhere') : t('cloudStorage.searchInFolder')}
                    >
                        {searchMode === 'global' ? <Globe size={15} /> : <FolderSearch size={15} />}
                    </button>
                    <select className="cst-type-filter" value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)}>
                        <option value="all">{t('cloudStorage.allTypes')}</option>
                        <option value="image">{t('cloudStorage.images')}</option>
                        <option value="document">{t('cloudStorage.documents')}</option>
                        <option value="presentation">{t('cloudStorage.presentations')}</option>
                    </select>
                </div>
            </div>

            {/* Ред 3: Изглед + инструменти */}
            <div className="cst-row">
                <button className={`cst-btn cst-btn--icon ${viewMode === 'grid' ? 'cst-active' : ''}`} onClick={() => onViewModeChange('grid')}>
                    <LayoutGrid size={15} />
                </button>
                <button className={`cst-btn cst-btn--icon ${viewMode === 'list' ? 'cst-active' : ''}`} onClick={() => onViewModeChange('list')}>
                    <List size={15} />
                </button>
                <div className="cst-divider" />
                <button className="cst-btn cst-btn--icon" onClick={onRefresh} title={t('cloudStorage.refresh')}>
                    <RefreshCw size={15} className={loading ? 'cst-spin' : ''} />
                </button>
                <button className="cst-btn cst-btn--sync" onClick={onSync} disabled={syncing}>
                    <RefreshCw size={14} className={syncing ? 'cst-spin' : ''} />
                    <span>Sync</span>
                </button>
                <button className="cst-btn cst-btn--analytics" onClick={onAnalytics}>
                    <BarChart3 size={14} />
                    <span>{t('cloudStorage.analytics')}</span>
                </button>
                {storageUsage && (
                    <div className="cst-storage">
                        <span>{formatSize(storageUsage.usedBytes)} / {formatSize(storageUsage.totalBytes)}</span>
                        <div className="cst-storage-track">
                            <div className="cst-storage-fill" style={{ width: `${Math.min(100, (storageUsage.usedBytes / storageUsage.totalBytes) * 100)}%` }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CloudStorageToolbar;
