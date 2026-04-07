import { useTranslation } from 'react-i18next';
import {
    Image, FileText, Video, File, FileSpreadsheet, Presentation,
    RefreshCw, X
} from 'lucide-react';
import './cloudStorageAnalytics.css';

const getFileIcon = (contentType, name) => {
    if (contentType?.startsWith('image/')) return Image;
    if (contentType === 'application/pdf') return FileText;
    if (contentType?.includes('video')) return Video;
    if (contentType?.includes('presentation') || name?.endsWith('.pptx') || name?.endsWith('.ppt')) return Presentation;
    if (contentType?.includes('word') || name?.endsWith('.docx') || name?.endsWith('.doc')) return FileText;
    if (contentType?.includes('excel') || name?.endsWith('.xlsx') || name?.endsWith('.xls')) return FileSpreadsheet;
    return File;
};

const CloudStorageAnalytics = ({ open, onClose, analytics, loading, formatSize }) => {
    const { t } = useTranslation('admin');

    if (!open) return null;

    return (
        <div className="csa-modal-overlay" onClick={onClose}>
            <div className="csa-analytics-panel" onClick={(e) => e.stopPropagation()}>
                <div className="csa-analytics-header">
                    <h3>{t('cloudStorage.analytics')}</h3>
                    <button className="csa-btn csa-btn--small csa-btn--icon" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                {loading ? (
                    <div className="csa-loading">
                        <RefreshCw size={24} className="csa-spin" />
                        <span>{t('cloudStorage.loading')}</span>
                    </div>
                ) : analytics ? (
                    <div className="csa-analytics-body">
                        {/* Storage usage overview */}
                        <div className="csa-analytics-section">
                            <h4>{t('cloudStorage.storageUsed')}</h4>
                            <div className="csa-analytics-usage">
                                <div className="csa-analytics-stat">
                                    <span className="csa-analytics-stat-value">{formatSize(analytics.usage?.totalSize || 0)}</span>
                                    <span className="csa-analytics-stat-label">{t('cloudStorage.totalSize')}</span>
                                </div>
                                <div className="csa-analytics-stat">
                                    <span className="csa-analytics-stat-value">{analytics.usage?.totalFiles || 0}</span>
                                    <span className="csa-analytics-stat-label">{t('cloudStorage.totalFiles')}</span>
                                </div>
                            </div>
                            <div className="csa-storage-track" style={{ height: '8px', marginTop: '12px' }}>
                                <div
                                    className="csa-storage-fill"
                                    style={{ width: `${Math.min(100, ((analytics.usage?.totalSize || 0) / (5 * 1024 * 1024 * 1024)) * 100)}%` }}
                                />
                            </div>
                            <div className="csa-analytics-usage-label">
                                {formatSize(analytics.usage?.totalSize || 0)} / {formatSize(5 * 1024 * 1024 * 1024)}
                            </div>
                        </div>

                        {/* Top folders */}
                        <div className="csa-analytics-section">
                            <h4>{t('cloudStorage.topFolders')}</h4>
                            <div className="csa-analytics-folders">
                                {(analytics.usage?.folderBreakdown || []).slice(0, 8).map(folder => {
                                    const maxSize = analytics.usage?.folderBreakdown?.[0]?.size || 1;
                                    const pct = Math.max(2, (folder.size / maxSize) * 100);
                                    return (
                                        <div key={folder.folder} className="csa-analytics-folder-row">
                                            <div className="csa-analytics-folder-info">
                                                <span className="csa-analytics-folder-name">{folder.folder}/</span>
                                                <span className="csa-analytics-folder-size">{folder.sizeFormatted} ({folder.files} files)</span>
                                            </div>
                                            <div className="csa-analytics-folder-bar-track">
                                                <div className="csa-analytics-folder-bar-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent files */}
                        <div className="csa-analytics-section">
                            <h4>{t('cloudStorage.recentFiles')}</h4>
                            <div className="csa-analytics-recent">
                                {(analytics.recentFiles || []).map((file, idx) => {
                                    const FileIcon = getFileIcon(file.contentType, file.name);
                                    return (
                                        <div key={idx} className="csa-analytics-recent-item">
                                            <FileIcon size={16} className="csa-list-icon" />
                                            <span className="csa-analytics-recent-name" title={file.path}>{file.name}</span>
                                            <span className="csa-analytics-recent-size">{formatSize(file.size)}</span>
                                            <span className="csa-analytics-recent-date">
                                                {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '\u2014'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Activity log */}
                        <div className="csa-analytics-section">
                            <h4>{t('cloudStorage.activityLog')} ({t('cloudStorage.last7days')})</h4>
                            {(analytics.activityLog || []).length === 0 ? (
                                <p className="csa-analytics-empty">{t('cloudStorage.noActivity')}</p>
                            ) : (
                                <div className="csa-analytics-activity">
                                    {(analytics.activityLog || []).map((entry, idx) => (
                                        <div key={idx} className="csa-analytics-activity-item">
                                            <span className={`csa-analytics-activity-badge csa-analytics-activity-badge--${entry.action}`}>
                                                {entry.action === 'upload' ? t('cloudStorage.uploaded') : entry.action === 'delete' ? t('cloudStorage.deleted') : t('cloudStorage.shared')}
                                            </span>
                                            <span className="csa-analytics-activity-file">{entry.fileName}</span>
                                            <span className="csa-analytics-activity-user">{entry.userName}</span>
                                            <span className="csa-analytics-activity-date">
                                                {entry.date ? new Date(entry.date).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default CloudStorageAnalytics;
