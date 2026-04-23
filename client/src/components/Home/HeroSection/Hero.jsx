import { useEffect, useRef, useState } from 'react';
import './hero.css';
import { useTranslation, Trans } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';

export const Hero = () => {
  const { t } = useTranslation('home');
  const bgRef = useRef(null);
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(true);
  const videoUrl = 'https://www.youtube.com/embed/_Q-TeezmAkw';

  useEffect(() => {
    // Remove the static LCP placeholder once React's own hero-bg-image is mounted.
    // The placeholder is rendered in index.html so LCP can paint without waiting
    // for the JS bundle. After mount, the React-rendered .hero-bg-image takes over.
    const placeholder = document.getElementById('lcp-hero-bg');
    if (placeholder) placeholder.remove();

    // Проверка дали URL-а на видеото съдържа youtube
    setIsYouTubeVideo(videoUrl.includes('youtube') || videoUrl.includes('youtu.be'));

    const handleScroll = () => {
      if (bgRef.current) {
        const scrollY = window.scrollY;
        bgRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [videoUrl]);

  return (
    <div className='new-hero-container'>
      {/* Parallax Background */}
      <div className='hero-bg-image' ref={bgRef}></div>
      <div className='hero-overlay'></div>

      {/* Main Content */}
      <div className='hero-content-wrapper'>
        <div className='hero-text-container'>
          <div className='hero-subtitle'>{t('hero.short-desc')}</div>
          <h1 className='hero-title'>
            <Trans ns="home" i18nKey="hero.title-part1" />
            <br />
            {t('hero.title-part2')}
          </h1>
          <div className='hero-description'>
            <Trans ns="home" i18nKey="hero.desc" components={{ span: <strong /> }} />
          </div>
          <Link to='/profile/data' className='hero-button'>
            <span>{t('hero.join-the-club')}</span>
            <svg viewBox='0 0 24 24' width='24' height='24'>
              <path fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M5 12h14m-6-6l6 6-6 6' />
            </svg>
          </Link>
        </div>

        <div className='hero-video-container'>
          <div className='video-frame'>
            <div className='video-frame-inner'>
              {isYouTubeVideo ? (
                <iframe
                  id='youtube-player'
                  src={`${videoUrl}?autoplay=1&mute=1&loop=1&controls=1&showinfo=0&modestbranding=1&playlist=_Q-TeezmAkw`}
                  title='Video player'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  referrerPolicy='strict-origin-when-cross-origin'
                  allowFullScreen
                ></iframe>
              ) : (
                <video id='custom-player' src={videoUrl} autoPlay loop muted controls={false}></video>
              )}
            </div>
            <div className='video-frame-effect'></div>

            {/* Показваме собствените контроли само ако НЕ е YouTube видео */}
            {!isYouTubeVideo && (
              <div className='video-controls'>
                <div
                  className='control-btn tooltip'
                  onClick={() => {
                    const video = document.getElementById('custom-player');
                    if (video) {
                      if (video.paused) video.play();
                      else video.pause();
                    }
                  }}
                >
                  <span className='tooltip-text'>{t('hero.play-pause')}</span>
                  <svg viewBox='0 0 24 24' width='24' height='24'>
                    <path fill='none' stroke='currentColor' strokeWidth='2' d='M5 3l14 9-14 9V3z' />
                  </svg>
                </div>
                <div
                  className='control-btn tooltip'
                  onClick={() => {
                    const video = document.getElementById('custom-player');
                    if (video) video.muted = !video.muted;
                  }}
                >
                  <span className='tooltip-text'>{t('hero.sound')}</span>
                  <svg viewBox='0 0 24 24' width='24' height='24'>
                    <path fill='none' stroke='currentColor' strokeWidth='2' d='M11 5L6 9H2v6h4l5 4V5z' />
                    <path fill='none' stroke='currentColor' strokeWidth='2' d='M15.54 8.46a5 5 0 0 1 0 7.07' />
                    <path fill='none' stroke='currentColor' strokeWidth='2' d='M19.07 4.93a10 10 0 0 1 0 14.14' />
                  </svg>
                </div>
                <div
                  className='control-btn tooltip'
                  onClick={() => {
                    const video = document.getElementById('custom-player');
                    if (video && video.requestFullscreen) video.requestFullscreen();
                  }}
                >
                  <span className='tooltip-text'>{t('hero.fullscreen')}</span>
                  <svg viewBox='0 0 24 24' width='24' height='24'>
                    <path
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      d='M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wave Transition */}
      <div className='wave-container'>
        <svg viewBox='0 0 1440 120' preserveAspectRatio='none'>
          <path
            d='M0,32L48,48C96,64,192,96,288,96C384,96,480,64,576,53.3C672,43,768,53,864,58.7C960,64,1056,64,1152,53.3C1248,43,1344,21,1392,10.7L1440,0L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z'
            fill='#f7f7f7'
            fillOpacity='1'
          ></path>
        </svg>
      </div>

      {/* Scrolling Info Banner */}
      <div className='scrolling-info'>
        <div className='info-content'>
          <span>{t('hero.slide-info')}</span>
          <span>{t('hero.slide-info')}</span>
          <span>{t('hero.slide-info')}</span>
          <span>{t('hero.slide-info')}</span>
          <span>{t('hero.slide-info')}</span>
        </div>
      </div>
    </div>
  );
};
