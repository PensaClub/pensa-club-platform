import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './christmasGreetingModal.css';

export const ChristmasGreetingModal = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const videoRef = useRef(null);

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

    if (!isVisible) return null;

    return (
        <div className={`xmas-greeting-overlay ${isClosing ? 'xmas-greeting-overlay--closing' : ''}`}>
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
                        src="/videos/christmas.mp4"
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
                        {t('christmasGreeting.title')}
                    </h2>
                    <p className="xmas-greeting-subtitle">
                        {t('christmasGreeting.subtitle')}
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