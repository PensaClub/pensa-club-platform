import './localStorageStatus.css';
import { useTranslation } from 'react-i18next';

export const LocalStorageStatus = ({ 
    hasLocalStorageDraft, 
    localStorageTimestamp, 
    onClearDraft,
    onLoadDraft,
    onIgnore,
    autoLoaded = false
}) => {
    const { t } = useTranslation();
    
    if (!hasLocalStorageDraft) return null;
    
    const handleClearDraft = () => {
        onClearDraft();
    };

    const handleLoadDraft = () => {
        if (onLoadDraft) {
            onLoadDraft();
        }
    };

    const handleIgnore = () => {
        if (onIgnore) {
            onIgnore();
        }
    };
    
    return (
        <div className="localStorage-status">
            <div className="localStorage-notification">
                <span className="localStorage-icon">💾</span>
                <div className="localStorage-content">
                    <div className="localStorage-text">
                        {autoLoaded ? (
                            <>
                                <strong>{t('localStorage.draftRestored')}</strong> {t('localStorage.from')} {localStorageTimestamp?.toLocaleString('bg-BG')}
                                <br />
                                <small>{t('localStorage.autoLoadedDescription')}</small>
                            </>
                        ) : (
                            <>
                                {t('localStorage.draftFound')} {t('localStorage.from')} {localStorageTimestamp?.toLocaleString('bg-BG')}
                            </>
                        )}
                    </div>
                    <div className="localStorage-actions">
                        {!autoLoaded && onLoadDraft && (
                            <button 
                                type="button" 
                                className="btn-load-draft"
                                onClick={handleLoadDraft}
                                title={t('localStorage.loadDraftTooltip')}
                            >
                                📥 {t('localStorage.load')}
                            </button>
                        )}
                        <button 
                            type="button" 
                            className="btn-clear-draft"
                            onClick={handleClearDraft}
                            title={t('localStorage.clearDraftTooltip')}
                        >
                            🗑️ {t('localStorage.delete')}
                        </button>
                        {autoLoaded && onIgnore && (
                            <button 
                                type="button" 
                                className="btn-ignore-draft"
                                onClick={handleIgnore}
                                title={t('localStorage.hideTooltip')}
                            >
                                ✕ {t('localStorage.hide')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};