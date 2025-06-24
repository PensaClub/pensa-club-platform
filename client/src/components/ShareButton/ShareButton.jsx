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
    const { t } = useTranslation();
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

    // Generate share URLs using utility
    const shareUrls = generateShareUrls(
        getCurrentUrl(), 
        contentTitle, 
        getShareText()
    );

    // Detect user preferences
    const preferences = detectBulgarianPreferences();

    // Detect if device supports native sharing
    const hasNativeShare = () => {
        return navigator.share && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    };

    // Close dropdown when clicking outside
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

    // Native share
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
            console.log('Native share cancelled or failed:', err);
        }
    };

    // Show toast with specific type
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

    // Copy to clipboard
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

    // Viber share - using utility with smart device detection
    const shareToViber = () => {
        const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
        const viberUrl = isMobile ? shareUrls.viber.mobile : shareUrls.viber.desktop;

        window.open(viberUrl, '_blank', 'noopener,noreferrer');

        if (onShare) {
            onShare(contentId, contentTitle, contentType, 'viber');
        }

        setShowDropdown(false);
    };

    // Telegram share - using utility
    const shareToTelegram = () => {
        window.open(shareUrls.telegram, '_blank', 'noopener,noreferrer');

        if (onShare) {
            onShare(contentId, contentTitle, contentType, 'telegram');
        }

        setShowDropdown(false);
    };

    // Instagram share (copy link with instructions)
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

    // Email share - using utility
    const shareToEmail = () => {
        window.location.href = shareUrls.email;

        if (onShare) {
            onShare(contentId, contentTitle, contentType, 'email');
        }

        setShowDropdown(false);
    };

    // Dynamic platform ordering based on user preferences
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

        // За български потребители: Copy, Viber, Telegram, Instagram, Email
        if (preferences.isBulgarian) {
            return allPlatforms;
        } else {
            // За международни потребители: Copy, Telegram, Viber, Instagram, Email
            const reordered = [...allPlatforms];
            const viber = reordered.splice(1, 1)[0]; // Премахваме Viber от позиция 1
            reordered.splice(2, 0, viber); // Слагаме го на позиция 2 (след Telegram)
            return reordered;
        }
    };

    // Main button click handler
    const handleMainButtonClick = () => {
        if (hasNativeShare()) {
            handleNativeShare();
        } else {
            setShowDropdown(!showDropdown);
        }
    };

    return (
        <>
            <div className="share-button-container">
                <button
                    ref={buttonRef}
                    className={`share-btn ${className} ${copied ? 'copied' : ''}`}
                    onClick={handleMainButtonClick}
                    title={t('share.tooltip', 'Споделяне')}
                >
                    <span className="share-icon">
                        {copied ? (
                            <CheckIcon size={18} />
                        ) : (
                            <ShareIcon size={18} />
                        )}
                    </span>
                    {showText && (
                        <span className="share-text">
                            {copied
                                ? t('share.copied', 'Копирано!')
                                : t('share.button', 'Споделяне')
                            }
                        </span>
                    )}
                    {!hasNativeShare() && (
                        <span className={`share-dropdown-arrow ${showDropdown ? 'open' : ''}`}>
                            ▼
                        </span>
                    )}
                </button>

                {/* Dropdown Menu with Dynamic Ordering */}
                {showDropdown && !hasNativeShare() && (
                    <div ref={dropdownRef} className="share-dropdown">
                        <div className="share-dropdown-content">
                            {getPlatformOrder().map(platform => (
                                <button 
                                    key={platform.key}
                                    className="share-option" 
                                    onClick={platform.action}
                                    data-platform={platform.key}
                                >
                                    <span className="share-option-icon">
                                        <platform.component size={18} />
                                    </span>
                                    <span className="share-option-text">
                                        {platform.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className={`share-toast ${toastType === 'instagram' ? 'instagram' : ''}`}>
                    <div className="share-toast-content">
                        <span className="share-toast-icon">
                            <CheckIcon size={20} />
                        </span>
                        <span className="share-toast-text">
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