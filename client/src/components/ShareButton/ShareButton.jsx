import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CopyIcon, 
  ViberIcon, 
  TelegramIcon, 
  InstagramIcon, 
  EmailIcon, 
  ShareIcon, 
  CheckIcon 
} from './icons';
import { generateShareUrls, detectBulgarianPreferences } from '../../utils/shareUtils';
import './shareButton.css';

export const ShareButton = ({
    contentId,
    contentTitle,
    contentType,
    onShare,
    className = '',
    showText = true
}) => {
    const { t } = useTranslation('content');
    const [copied, setCopied] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [toastType, setToastType] = useState('default');
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const getCurrentUrl = () => {
        return window.location.href;
    };

    const getShareText = () => {
        return `${contentTitle} - ${t('share.readMore', 'Прочетете повече в Pensa Club')}`;
    };

    const shareUrls = generateShareUrls(
        getCurrentUrl(), 
        contentTitle, 
        getShareText()
    );

    const preferences = detectBulgarianPreferences();

    const hasNativeShare = () => {
        return navigator.share && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: contentTitle,
                text: getShareText(),
                url: getCurrentUrl()
            });

            if (onShare) {
                onShare(contentId, contentTitle, contentType, 'native');
            }

            setShowDropdown(false);
        } catch (err) {
            // console.log('Native share cancelled or failed:', err);
        }
    };

    const showToastMessage = (type = 'default') => {
        setToastType(type);
        setShowToast(true);
        setShowDropdown(false);

        const duration = type === 'instagram' ? 4000 : 2000;
        setTimeout(() => {
            setShowToast(false);
            if (type !== 'instagram') {
                setCopied(false);
            }
        }, duration);
    };

    const copyToClipboard = async () => {
        try {
            const url = getCurrentUrl();

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
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

            if (onShare) {
                onShare(contentId, contentTitle, contentType, 'clipboard');
            }

            setCopied(true);
            showToastMessage('default');

        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const shareToViber = () => {
        const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
        const viberUrl = isMobile ? shareUrls.viber.mobile : shareUrls.viber.desktop;

        window.open(viberUrl, '_blank', 'noopener,noreferrer');

        if (onShare) {
            onShare(contentId, contentTitle, contentType, 'viber');
        }

        setShowDropdown(false);
    };

    const shareToTelegram = () => {
        window.open(shareUrls.telegram, '_blank', 'noopener,noreferrer');

        if (onShare) {
            onShare(contentId, contentTitle, contentType, 'telegram');
        }

        setShowDropdown(false);
    };

    const shareToInstagram = async () => {
        try {
            const url = getCurrentUrl();

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
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

            if (onShare) {
                onShare(contentId, contentTitle, contentType, 'instagram');
            }

            setCopied(true);
            showToastMessage('instagram');

        } catch (err) {
            console.error('Failed to copy URL for Instagram:', err);
        }
    };

    const shareToEmail = () => {
        window.location.href = shareUrls.email;

        if (onShare) {
            onShare(contentId, contentTitle, contentType, 'email');
        }

        setShowDropdown(false);
    };

    const getPlatformOrder = () => {
        const allPlatforms = [
            { 
                key: 'clipboard', 
                component: CopyIcon, 
                text: t('share.copyLink', 'Копирай линк'), 
                action: copyToClipboard 
            },
            { 
                key: 'viber', 
                component: ViberIcon, 
                text: 'Viber', 
                action: shareToViber 
            },
            { 
                key: 'telegram', 
                component: TelegramIcon, 
                text: 'Telegram', 
                action: shareToTelegram 
            },
            { 
                key: 'instagram', 
                component: InstagramIcon, 
                text: 'Instagram', 
                action: shareToInstagram 
            },
            { 
                key: 'email', 
                component: EmailIcon, 
                text: t('share.email', 'Email'), 
                action: shareToEmail 
            }
        ];

        if (preferences.isBulgarian) {
            return allPlatforms;
        } else {
            const reordered = [...allPlatforms];
            const viber = reordered.splice(1, 1)[0];
            reordered.splice(2, 0, viber);
            return reordered;
        }
    };

    const handleMainButtonClick = () => {
        if (hasNativeShare()) {
            handleNativeShare();
        } else {
            setShowDropdown(!showDropdown);
        }
    };

    return (
        <>
            <div className="pensa-share-container">
                <button
                    ref={buttonRef}
                    className={`pensa-share-btn ${className} ${copied ? 'pensa-share-btn-copied' : ''}`}
                    onClick={handleMainButtonClick}
                    title={t('share.tooltip', 'Споделяне')}
                >
                    <span className="pensa-share-icon">
                        {copied ? (
                            <CheckIcon size={18} />
                        ) : (
                            <ShareIcon size={18} />
                        )}
                    </span>
                    {showText && (
                        <span className="pensa-share-text">
                            {copied
                                ? t('share.copied', 'Копирано!')
                                : t('share.button', 'Споделяне')
                            }
                        </span>
                    )}
                    {!hasNativeShare() && (
                        <span className={`pensa-share-arrow ${showDropdown ? 'pensa-share-arrow-open' : ''}`}>
                            ▼
                        </span>
                    )}
                </button>

                {showDropdown && !hasNativeShare() && (
                    <div ref={dropdownRef} className="pensa-share-dropdown">
                        <div className="pensa-share-dropdown-content">
                            {getPlatformOrder().map(platform => (
                                <button 
                                    key={platform.key}
                                    className="pensa-share-option" 
                                    onClick={platform.action}
                                    data-platform={platform.key}
                                >
                                    <span className="pensa-share-option-icon">
                                        <platform.component size={18} />
                                    </span>
                                    <span className="pensa-share-option-text">
                                        {platform.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showToast && (
                <div className={`pensa-share-toast ${toastType === 'instagram' ? 'pensa-share-toast-instagram' : ''}`}>
                    <div className="pensa-share-toast-content">
                        <span className="pensa-share-toast-icon">
                            <CheckIcon size={20} />
                        </span>
                        <span className="pensa-share-toast-text">
                            {toastType === 'instagram' 
                                ? t('share.instagramToast', 'Линкът е копиран! Отворете Instagram и го поставете в Story или съобщение.')
                                : t('share.toastMessage', 'Линкът е копиран в clipboard!')
                            }
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};