import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteSettingsAdminContext } from '../contexts/SiteSettingsAdminContext';
import './christmasGreetingModal.css';

// Simple lighten/darken utilities for CSS variables
const lightenColor = (hex, amount = 40) => {
    if (!hex) return null;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const darkenColor = (hex, amount = 80) => {
    if (!hex) return null;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

export const ChristmasGreetingModal = () => {
    const { t, i18n } = useTranslation();
    const { settings } = useSiteSettingsAdminContext();
    const [isVisible, setIsVisible] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const videoRef = useRef(null);

    // Custom texts — override i18n if admin provided them
    const lang = i18n.language || 'bg';
    const customTitle = settings[`greeting_title_${lang}`];
    const customSubtitle = settings[`greeting_subtitle_${lang}`];
    const title = customTitle || t('christmasGreeting.title');
    const subtitle = customSubtitle || t('christmasGreeting.subtitle');

    // Custom colors — override CSS variables
    const primaryColor = settings.greeting_primary_color;
    const bgColor = settings.greeting_bg_color;
    const textColor = settings.greeting_text_color;
    const accentColor = settings.greeting_accent_color;

    const colorOverrides = {};
    if (primaryColor) {
        colorOverrides['--xmas-gold'] = primaryColor;
        colorOverrides['--xmas-gold-light'] = lightenColor(primaryColor);
        colorOverrides['--xmas-glow'] = `${primaryColor}4D`;
    }
    if (bgColor) {
        colorOverrides['--xmas-green-deep'] = bgColor;
    }
    if (textColor) {
        colorOverrides['--xmas-cream'] = textColor;
    }
    if (accentColor) {
        colorOverrides['--xmas-red-bright'] = accentColor;
        colorOverrides['--xmas-red-deep'] = darkenColor(accentColor);
    }

    // Проверка дали модалът вече е бил показан в тази сесия
    useEffect(() => {
        const hasSeenGreeting = sessionStorage.getItem('xmas-greeting-seen-2024');

        if (!hasSeenGreeting) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem('xmas-greeting-seen-2024', 'true');
            }, 800);

            return () => clearTimeout(timer);
        }
    }, []);

    // Auto-play видеото когато модалът се покаже
   useEffect(() => {
    if (isVisible && videoRef.current) {
        // Първо опитваме СЪС ЗВУК
        videoRef.current.muted = false;

        videoRef.current.play().catch((error) => {
            // Ако браузърът блокира, тогава mute-ваме
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play();
        });
    }
}, [isVisible]);

    // Затваряне на модала с анимация
    const handleClose = useCallback(() => {
        setIsClosing(true);

        if (videoRef.current) {
            videoRef.current.pause();
        }

        setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
        }, 500);
    }, []);

    // Toggle mute/unmute
    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    }, []);

    // Когато видеото свърши
    const handleVideoEnd = useCallback(() => {
        setIsVideoEnded(true);

        setTimeout(() => {
            handleClose();
        }, 3000);
    }, [handleClose]);

    if (!settings.christmas_greeting_enabled) return null;
    if (!isVisible) return null;

    return (
        <div
            className={`xmas-greeting-overlay ${isClosing ? 'xmas-greeting-overlay--closing' : ''}`}
            style={colorOverrides}
        >
            {/* Декоративни снежинки */}
            <div className="xmas-greeting-snowflakes" aria-hidden="true">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="xmas-greeting-snowflake"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}
                    >
                        ❄
                    </div>
                ))}
            </div>

            <div className={`xmas-greeting-modal ${isClosing ? 'xmas-greeting-modal--closing' : ''}`}>
                {/* Бутон за затваряне */}
                <button
                    className="xmas-greeting-close-btn"
                    onClick={handleClose}
                    aria-label={t('christmasGreeting.close', 'Затвори')}
                >
                    <span className="xmas-greeting-close-icon">✕</span>
                </button>

                {/* Декорация отгоре */}
                <div className="xmas-greeting-decoration-top" aria-hidden="true">
                    <span className="xmas-greeting-holly">🎄</span>
                    <span className="xmas-greeting-star">⭐</span>
                    <span className="xmas-greeting-holly">🎄</span>
                </div>

                {/* Видео контейнер */}
                <div className="xmas-greeting-video-container">
                    <video
                        ref={videoRef}
                        className="xmas-greeting-video"
                        src={settings.greeting_video_url || '/videos/christmas.mp4'}
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnd}
                    />

                    {/* Контроли за звук */}
                    <button
                        className="xmas-greeting-mute-btn"
                        onClick={toggleMute}
                        aria-label={isMuted ? t('christmasGreeting.unmute', 'Включи звук') : t('christmasGreeting.mute', 'Изключи звук')}
                    >
                        {isMuted ? (
                            <span className="xmas-greeting-sound-icon">🔇</span>
                        ) : (
                            <span className="xmas-greeting-sound-icon">🔊</span>
                        )}
                    </button>
                </div>

                {/* Поздравителен текст */}
                <div className={`xmas-greeting-text-container ${isVideoEnded ? 'xmas-greeting-text-container--ended' : ''}`}>
                    <h2 className="xmas-greeting-title">
                        {title}
                    </h2>
                    <p className="xmas-greeting-subtitle">
                        {subtitle}
                    </p>

                    {/* Декоративни елементи */}
                    <div className="xmas-greeting-ornaments" aria-hidden="true">
                        <span className="xmas-greeting-ornament xmas-greeting-ornament--1">🎁</span>
                        <span className="xmas-greeting-ornament xmas-greeting-ornament--2">🔔</span>
                        <span className="xmas-greeting-ornament xmas-greeting-ornament--3">🎁</span>
                    </div>
                </div>

                {/* Бутон за затваряне отдолу */}
                <button
                    className="xmas-greeting-continue-btn"
                    onClick={handleClose}
                >
                    {t('christmasGreeting.continue', 'Продължи към сайта')}
                </button>

                {/* Гирлянда отдолу */}
                <div className="xmas-greeting-decoration-bottom" aria-hidden="true">
                    <div className="xmas-greeting-garland"></div>
                </div>
            </div>
        </div>
    );
};

export default ChristmasGreetingModal;
