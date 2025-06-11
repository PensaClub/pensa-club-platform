import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './shareButton.css';

export const ShareButton = ({ 
  contentId, 
  contentTitle, 
  contentType, 
  onShare,
  className = '',
  showText = true 
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const getCurrentUrl = () => {
    return window.location.href;
  };

  const copyToClipboard = async () => {
    try {
      const url = getCurrentUrl();
      
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback за по-стари browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      // Track share event
      if (onShare) {
        onShare(contentId, contentTitle, contentType, 'clipboard');
      }

      // Show success feedback
      setCopied(true);
      setShowToast(true);

      // Reset після 2 секунди
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);

    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Можем да добавим error toast тук
    }
  };

  return (
    <>
      <button 
        className={`share-btn ${className} ${copied ? 'copied' : ''}`}
        onClick={copyToClipboard}
        title={t('share.tooltip', 'Споделяне')}
      >
        <span className="share-icon">
          {copied ? '✅' : '📤'}
        </span>
        {showText && (
          <span className="share-text">
            {copied 
              ? t('share.copied', 'Копирано!') 
              : t('share.button', 'Споделяне')
            }
          </span>
        )}
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="share-toast">
          <div className="share-toast-content">
            <span className="share-toast-icon">✅</span>
            <span className="share-toast-text">
              {t('share.toastMessage', 'Линкът е копиран в clipboard!')}
            </span>
          </div>
        </div>
      )}
    </>
  );
};