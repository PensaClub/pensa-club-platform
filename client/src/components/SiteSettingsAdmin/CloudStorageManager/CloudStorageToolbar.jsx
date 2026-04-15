import { useTranslation } from 'react-i18next';
import {
    FolderPlus, Upload, LayoutGrid, List, Search, RefreshCw,
    Camera, BarChart3, X, ClipboardList
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
    typeFilter,
    onTypeFilterChange,
    onRefresh,
    onSync,
    onShowSyncReport,
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
            {/* Действия */}
            <div className="cst-actions">
                <button className="cst-action" onClick={onNewFolder}>
                    <FolderPlus size={16} />
                    <span>{t('cloudStorage.newFolder')}</span>
                </button>
                <button className="cst-action" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload size={16} />
                    <span>{uploading ? '...' : t('cloudStorage.upload')}</span>
                </button>
                <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => { onUpload(e.target.files); e.target.value = ''; }} />
                <button className="cst-action cst-mobile-only" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                    <Camera size={16} />
                    <span>{t('cloudStorage.camera')}</span>
                </button>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { onUpload(e.target.files); e.target.value = ''; }} />
                {!currentPath && (
                    <button className="cst-action" onClick={onInitialize}>
                        <FolderPlus size={16} />
                        <span>{t('cloudStorage.initialize', 'Инициализирай')}</span>
                    </button>
                )}
                {currentPath === 'pensa-foundation/projects/' && (
                    <button className="cst-action" onClick={onCreateProject}>
                        <FolderPlus size={16} />
                        <span>{t('cloudStorage.newProject', 'Нов проект')}</span>
                    </button>
                )}
            </div>

            {/* Търсене */}
            <div className="cst-search">
                <Search size={16} className="cst-search-icon" />
                <input
                    type="text"
                    className="cst-search-field"
                    placeholder={t('cloudStorage.searchPlaceholder')}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {search && (
                    <button className="cst-search-x" onClick={onClearSearch}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Филтър + инструменти */}
            <div className="cst-controls">
                <select className="cst-filter" value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)}>
                    <option value="all">{t('cloudStorage.allTypes', 'Всички')}</option>
                    <option value="image">{t('cloudStorage.images', 'Снимки')}</option>
                    <option value="document">{t('cloudStorage.documents', 'Документи')}</option>
                    <option value="presentation">{t('cloudStorage.presentations', 'Презентации')}</option>
                </select>

                <div className="cst-view-toggle">
                    <button className={viewMode === 'grid' ? 'cst-vt-active' : ''} onClick={() => onViewModeChange('grid')}>
                        <LayoutGrid size={15} />
                    </button>
                    <button className={viewMode === 'list' ? 'cst-vt-active' : ''} onClick={() => onViewModeChange('list')}>
                        <List size={15} />
                    </button>
                </div>

                <button className="cst-icon-btn" onClick={onRefresh} title={t('cloudStorage.refresh')}>
                    <RefreshCw size={15} className={loading ? 'cst-spin' : ''} />
                </button>
                <button className="cst-icon-btn cst-icon-sync" onClick={onSync} disabled={syncing} title="Sync">
                    <RefreshCw size={15} className={syncing ? 'cst-spin' : ''} />
                </button>
                <button
                    className="cst-icon-btn"
                    onClick={onShowSyncReport}
                    title={t('cloudStorage.syncReport.buttonTooltip', 'Sync Report')}
                >
                    <ClipboardList size={15} />
                </button>
                <button className="cst-icon-btn cst-icon-analytics" onClick={onAnalytics} title={t('cloudStorage.analytics')}>
                    <BarChart3 size={15} />
                </button>

                {storageUsage && (
                    <div className="cst-usage">
                        <div className="cst-usage-bar">
                            <div className="cst-usage-fill" style={{ width: `${Math.min(100, (storageUsage.usedBytes / storageUsage.totalBytes) * 100)}%` }} />
                        </div>
                        <span className="cst-usage-text">{formatSize(storageUsage.usedBytes)} / {formatSize(storageUsage.totalBytes)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CloudStorageToolbar;
