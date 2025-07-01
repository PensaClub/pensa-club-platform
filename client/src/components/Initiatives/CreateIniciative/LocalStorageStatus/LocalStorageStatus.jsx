import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import './localStorageStatus.css';
import { useTranslation } from 'react-i18next';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export const LocalStorageStatus = ({ 
    hasLocalStorageDraft, 
    localStorageTimestamp, 
    onClearDraft,
    onLoadDraft,
    onIgnore,
    onStartNew,
    autoLoaded = false
}) => {
    const { t } = useTranslation();
    const { clearLocalStorageDraft } = useInitiativeContext();
    
    if (!hasLocalStorageDraft) return null;
    
    const handleClearDraft = async () => {
        try {
            // Използваме новата функция която изтрива и от сървъра
            await clearLocalStorageDraft();
            
            // Извикваме оригиналния callback ако има
            if (onClearDraft) {
                onClearDraft();
            }
        } catch (error) {
            console.error('Error clearing draft:', error);
            // Ако има грешка, все пак извикваме оригиналния callback
            if (onClearDraft) {
                onClearDraft();
            }
        }
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
                        className="storage-action-btn new"
                        onClick={onStartNew}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Нова чернова
                    </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};