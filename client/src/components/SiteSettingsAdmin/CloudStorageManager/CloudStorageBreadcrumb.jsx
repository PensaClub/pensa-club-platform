import { useTranslation } from 'react-i18next';
import { Home, ChevronRight, ArrowLeft, Folder } from 'lucide-react';
import './cloudStorageBreadcrumb.css';

const CloudStorageBreadcrumb = ({ currentPath, breadcrumbs, onNavigate }) => {
    const { t } = useTranslation('admin');

    const handleGoBack = () => {
        if (!currentPath) return;
        const parts = currentPath.replace(/\/$/, '').split('/');
        parts.pop();
        onNavigate(parts.length > 0 ? parts.join('/') + '/' : '');
    };

    return (
        <div className="csnav">
            {currentPath && (
                <button className="csnav-back" onClick={handleGoBack} title="Назад">
                    <ArrowLeft size={16} />
                </button>
            )}

            {/* Desktop: full breadcrumb */}
            <div className="csnav-desktop">
                <button className={`csnav-link ${!currentPath ? 'csnav-link--active' : ''}`} onClick={() => onNavigate('')}>
                    <Home size={14} />
                    <span>{t('cloudStorage.root', 'Начало')}</span>
                </button>
                {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.path} className="csnav-step">
                        <ChevronRight size={14} className="csnav-arrow" />
                        <button className={`csnav-link ${i === breadcrumbs.length - 1 ? 'csnav-link--active' : ''}`} onClick={() => onNavigate(crumb.path)}>
                            <Folder size={14} />
                            <span>{crumb.name}</span>
                        </button>
                    </span>
                ))}
            </div>

            {/* Mobile: only current folder */}
            <div className="csnav-mobile">
                <Folder size={22} />
                <span>{currentPath ? currentPath.replace(/\/$/, '').split('/').pop() : t('cloudStorage.root', 'Начало')}</span>
            </div>
        </div>
    );
};

export default CloudStorageBreadcrumb;
