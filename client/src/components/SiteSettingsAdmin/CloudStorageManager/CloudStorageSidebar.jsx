import { useTranslation } from 'react-i18next';
import {
    Folder, FolderOpen, ChevronDown, ChevronRight as TreeArrow, Inbox
} from 'lucide-react';
import './cloudStorageSidebar.css';

const getFileName = (fullPath) => {
    if (!fullPath) return '';
    const parts = fullPath.replace(/\/$/, '').split('/');
    return parts[parts.length - 1];
};

const DEFAULT_QUICK_LINKS = [
    { id: 'seminars', label: 'Семинари', emoji: '📚', path: 'seminars/' },
    { id: 'projects', label: 'Проекти', emoji: '📁', path: 'pensa-foundation/projects/' },
    { id: 'admin', label: 'Администрация', emoji: '🏢', path: 'pensa-foundation/administration/' },
    { id: 'comms', label: 'Комуникации', emoji: '📢', path: 'pensa-foundation/communications/' },
    { id: 'meetings', label: 'Срещи', emoji: '📋', path: 'pensa-foundation/meetings/' },
];

const CloudStorageSidebar = ({
    customLinks,
    onNavigate,
    onAddLink,
    onRemoveLink,
    currentPath,
    sharedWithMeView,
    onSharedWithMe,
    sharedFilesCount,
    folderTree,
    expandedFolders,
    onToggleFolder,
    showAddLink,
    onToggleAddLink,
    newLinkLabel,
    onNewLinkLabelChange,
    onSubmitAddLink,
    onRemoveLinkConfirm,
}) => {
    const { t } = useTranslation('admin');

    const renderTreeNode = (folderPath, depth = 0) => {
        const children = folderTree[folderPath] || [];
        const isExpanded = expandedFolders.has(folderPath);
        const folderName = getFileName(folderPath) || t('cloudStorage.root');
        const isActive = currentPath === (folderPath ? folderPath + '/' : '') || currentPath === folderPath;

        return (
            <div key={folderPath || 'root'} className="csb-tree-node">
                <div
                    className={`csb-tree-item ${isActive ? 'csb-tree-item--active' : ''}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                >
                    <button
                        className="csb-tree-toggle"
                        onClick={(e) => { e.stopPropagation(); onToggleFolder(folderPath); }}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <TreeArrow size={14} />}
                    </button>
                    <button
                        className="csb-tree-label"
                        onClick={() => onNavigate(folderPath ? folderPath + '/' : '')}
                    >
                        {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                        <span>{folderName}</span>
                    </button>
                </div>
                {isExpanded && children.length > 0 && (
                    <div className="csb-tree-children">
                        {children.map(child => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="csb-sidebar">
            <div className="csb-quick-links">
                <div className="csb-quick-links-title">
                    <span>Бързи връзки</span>
                    {currentPath && (
                        <button
                            className="csb-quick-links-add"
                            onClick={onToggleAddLink}
                            title="Добави бърза връзка за текущата папка"
                        >
                            +
                        </button>
                    )}
                </div>
                {showAddLink && (
                    <div className="csb-quick-links-form">
                        <input
                            type="text"
                            placeholder="Име на връзката"
                            value={newLinkLabel}
                            onChange={(e) => onNewLinkLabelChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onSubmitAddLink();
                                if (e.key === 'Escape') onToggleAddLink();
                            }}
                            autoFocus
                        />
                        <button className="csb-btn csb-btn--small csb-btn--primary" onClick={onSubmitAddLink}>
                            Добави
                        </button>
                    </div>
                )}
                <button
                    className={`csb-quick-link ${sharedWithMeView ? 'csb-quick-link--active' : ''}`}
                    onClick={onSharedWithMe}
                >
                    <span><Inbox size={14} /></span> <span>{t('cloudStorage.sharedWithMe', 'Споделени с мен')}</span>
                    {sharedFilesCount > 0 && (
                        <span className="csb-share-user-badge">
                            {sharedFilesCount}
                        </span>
                    )}
                </button>
                <div className="csb-quick-links-divider" />
                {DEFAULT_QUICK_LINKS.map(link => (
                    <button
                        key={link.id}
                        className={`csb-quick-link ${currentPath.startsWith(link.path) ? 'csb-quick-link--active' : ''}`}
                        onClick={() => onNavigate(link.path)}
                    >
                        <span>{link.emoji}</span> <span>{link.label}</span>
                    </button>
                ))}
                {customLinks.length > 0 && (
                    <>
                        <div className="csb-quick-links-divider" />
                        {customLinks.map(link => (
                            <div key={link.id} className="csb-quick-link-wrapper">
                                <button
                                    className={`csb-quick-link ${currentPath === link.path ? 'csb-quick-link--active' : ''}`}
                                    onClick={() => onNavigate(link.path)}
                                >
                                    <span>{link.emoji}</span> <span>{link.label}</span>
                                </button>
                                <button
                                    className="csb-quick-link-remove"
                                    onClick={() => onRemoveLinkConfirm(link)}
                                    title="Премахни бърза връзка"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
            <div className="csb-sidebar-title">{t('cloudStorage.folders')}</div>
            <div className="csb-tree">
                {renderTreeNode('')}
            </div>
        </div>
    );
};

export default CloudStorageSidebar;
