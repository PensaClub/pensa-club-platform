import { useTranslation } from 'react-i18next';
import { Home, ChevronRight, ArrowLeft, Folder } from 'lucide-react';
import './cloudStorageBreadcrumb.css';

const CloudStorageBreadcrumb = ({ currentPath, breadcrumbs, onNavigate }) => {
    const { t } = useTranslation('admin');

    const handleGoBack = () => {
        if (!currentPath) return;
        const parts = currentPath.replace(/\/$/, '').split('/');
        parts.pop();
        const parentPath = parts.length > 0 ? parts.join('/') + '/' : '';
        onNavigate(parentPath);
    };

    return (
        <div className="csnav-container">
            {/* Back button — visible on mobile, useful on desktop too */}
            {currentPath && (
                <button className="csnav-back" onClick={handleGoBack}>
                    <ArrowLeft size={16} />
                </button>
            )}

            {/* Breadcrumb — desktop full, mobile shows only current folder */}
            <div className="csnav-breadcrumb">
                <button
                    className={`csnav-item ${!currentPath ? 'csnav-item--active' : ''}`}
                    onClick={() => onNavigate('')}
                >
                    <Home size={13} />
                    <span>{t('cloudStorage.root', 'Начало')}</span>
                </button>
                {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.path} className="csnav-segment">
                        <ChevronRight size={12} className="csnav-sep" />
                        <button
                            className={`csnav-item ${i === breadcrumbs.length - 1 ? 'csnav-item--active' : ''}`}
                            onClick={() => onNavigate(crumb.path)}
                        >
                            <Folder size={12} />
                            {crumb.name}
                        </button>
                    </span>
                ))}
            </div>

            {/* Mobile: show only current folder name */}
            <div className="csnav-mobile-path">
                {currentPath ? currentPath.replace(/\/$/, '').split('/').pop() : t('cloudStorage.root', 'Начало')}
            </div>
        </div>
    );
};

export default CloudStorageBreadcrumb;
