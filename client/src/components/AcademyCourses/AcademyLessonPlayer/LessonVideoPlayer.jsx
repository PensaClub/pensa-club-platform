// src/components/AcademyCourses/AcademyLessonPlayer/components/LessonVideoPlayer.jsx

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const LessonVideoPlayer = ({ lesson, t }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoWrapperRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // =========================================================
  //                    LIVE STATUS
  // =========================================================

  useEffect(() => {
    if (!lesson || lesson.lessonType !== 'live' || !lesson.scheduledDate) {
      setLiveStatus(null);
      setCountdown(null);
      return;
    }

    const updateLiveStatus = () => {
      const now = new Date();
      const scheduled = new Date(lesson.scheduledDate);
      const fiveMinBefore = new Date(scheduled.getTime() - 5 * 60 * 1000);
      const duration = lesson.durationMinutes || 60;
      const estimatedEnd = new Date(scheduled.getTime() + duration * 60 * 1000);

      if (now < fiveMinBefore) {
        setLiveStatus('upcoming');
        const diff = scheduled - now;
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      } else if (now >= fiveMinBefore && now < scheduled) {
        setLiveStatus('starting');
        const diff = scheduled - now;
        setCountdown({
          minutes: Math.floor(diff / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      } else if (now >= scheduled && now < estimatedEnd) {
        setLiveStatus('live');
        setCountdown(null);
      } else {
        setLiveStatus('ended');
        setCountdown(null);
      }
    };

    updateLiveStatus();
    countdownIntervalRef.current = setInterval(updateLiveStatus, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [lesson]);

  // =========================================================
  //                    VIDEO HELPERS
  // =========================================================

  const extractYouTubeId = useCallback((url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, []);

  const getVideoUrl = useCallback(() => {
    if (lesson?.lessonType === 'live') {
      if ((liveStatus === 'live' || liveStatus === 'starting') && lesson?.liveStreamUrl) {
        return lesson.liveStreamUrl;
      }
      // After ended, use recorded video if available
      if (liveStatus === 'ended' && lesson?.videoUrl) {
        return lesson.videoUrl;
      }
    }
    return lesson?.videoUrl || null;
  }, [lesson, liveStatus]);

  const embedUrl = useMemo(() => {
    const videoUrl = getVideoUrl();
    if (!videoUrl) return null;

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    const isLive = lesson?.lessonType === 'live' && liveStatus === 'live';
    
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      autoplay: showPlayer ? '1' : '0',
      ...(isLive && { live: '1' })
    });

    return `https://www.youtube.com/embed/${videoId}?${params}`;
  }, [getVideoUrl, extractYouTubeId, lesson, liveStatus, showPlayer]);

  const thumbnailUrl = useMemo(() => {
    if (lesson?.thumbnailUrl) return lesson.thumbnailUrl;
    const videoId = extractYouTubeId(lesson?.videoUrl);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return '/images/default-lesson-thumbnail.jpg';
  }, [lesson, extractYouTubeId]);

  // =========================================================
  //                    FULLSCREEN
  // =========================================================

  const toggleFullscreen = useCallback(() => {
    if (!videoWrapperRef.current) return;

    if (!document.fullscreenElement) {
      videoWrapperRef.current.requestFullscreen?.() ||
      videoWrapperRef.current.webkitRequestFullscreen?.() ||
      videoWrapperRef.current.msRequestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.() ||
      document.msExitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // =========================================================
  //                    FORMAT HELPERS
  // =========================================================

  const formatScheduledDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // =========================================================
  //                    RENDER
  // =========================================================

  const canShowVideo = lesson?.lessonType === 'video' || 
    (lesson?.lessonType === 'live' && (liveStatus === 'live' || liveStatus === 'starting' || (liveStatus === 'ended' && lesson?.videoUrl)));

  return (
    <div 
      ref={videoWrapperRef}
      className={`alp-video ${isFullscreen ? 'alp-video--fullscreen' : ''}`}
    >
      {/* Live Badge */}
      {lesson?.lessonType === 'live' && liveStatus && (
        <div className={`alp-video__badge alp-video__badge--${liveStatus}`}>
          {liveStatus === 'live' && (
            <>
              <span className="alp-video__badge-dot"></span>
              {t('academyLessonPlayer.live', 'НА ЖИВО')}
            </>
          )}
          {liveStatus === 'starting' && t('academyLessonPlayer.starting', 'Започва скоро')}
          {liveStatus === 'upcoming' && t('academyLessonPlayer.upcoming', 'Предстоящо')}
          {liveStatus === 'ended' && t('academyLessonPlayer.ended', 'Приключило')}
        </div>
      )}

      {/* Fullscreen Toggle */}
      {canShowVideo && embedUrl && (
        <button 
          className="alp-video__fullscreen"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Изход от цял екран' : 'Цял екран'}
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>
      )}

      {/* Video Content */}
      {canShowVideo && embedUrl ? (
        !showPlayer ? (
          <div className="alp-video__placeholder" onClick={() => setShowPlayer(true)}>
            <img 
              src={thumbnailUrl} 
              alt={lesson?.title}
              onError={(e) => { e.target.src = '/images/default-lesson-thumbnail.jpg'; }}
            />
            <button className="alp-video__play">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
            {liveStatus === 'starting' && countdown && (
              <div className="alp-video__starting">
                <p>{t('academyLessonPlayer.startsIn', 'Започва след')}</p>
                <span>{countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}</span>
              </div>
            )}
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={lesson?.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="alp-video__iframe"
          />
        )
      ) : lesson?.lessonType === 'live' && liveStatus === 'upcoming' ? (
        <div className="alp-video__countdown">
          <img 
            src={thumbnailUrl} 
            alt={lesson?.title}
            className="alp-video__countdown-bg"
            onError={(e) => { e.target.src = '/images/default-lesson-thumbnail.jpg'; }}
          />
          <div className="alp-video__countdown-content">
            <div className="alp-video__countdown-icon">📅</div>
            <h3>{t('academyLessonPlayer.liveScheduled', 'Урокът на живо е насрочен за')}</h3>
            <p className="alp-video__countdown-date">
              {formatScheduledDate(lesson?.scheduledDate)}
            </p>
            {countdown && (
              <div className="alp-video__countdown-timer">
                {countdown.days > 0 && (
                  <div className="alp-video__countdown-unit">
                    <span className="alp-video__countdown-value">{countdown.days}</span>
                    <span className="alp-video__countdown-label">{t('academyLessonPlayer.days', 'дни')}</span>
                  </div>
                )}
                <div className="alp-video__countdown-unit">
                  <span className="alp-video__countdown-value">{countdown.hours}</span>
                  <span className="alp-video__countdown-label">{t('academyLessonPlayer.hours', 'часа')}</span>
                </div>
                <div className="alp-video__countdown-unit">
                  <span className="alp-video__countdown-value">{countdown.minutes}</span>
                  <span className="alp-video__countdown-label">{t('academyLessonPlayer.minutes', 'мин')}</span>
                </div>
                <div className="alp-video__countdown-unit">
                  <span className="alp-video__countdown-value">{countdown.seconds}</span>
                  <span className="alp-video__countdown-label">{t('academyLessonPlayer.seconds', 'сек')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : lesson?.lessonType === 'live' && liveStatus === 'ended' && !lesson?.videoUrl ? (
        <div className="alp-video__message">
          <div className="alp-video__message-icon">📹</div>
          <h3>{t('academyLessonPlayer.recordingProcessing', 'Записът се обработва')}</h3>
          <p>{t('academyLessonPlayer.recordingProcessingDesc', 'Записът от живото ще бъде наличен скоро.')}</p>
        </div>
      ) : lesson?.lessonType === 'text' ? (
        <div className="alp-video__message">
          <div className="alp-video__message-icon">📖</div>
          <h3>{t('academyLessonPlayer.textLesson', 'Текстов урок')}</h3>
        </div>
      ) : (
        <div className="alp-video__message">
          <div className="alp-video__message-icon">🎬</div>
          <h3>{t('academyLessonPlayer.noVideo', 'Няма налично видео')}</h3>
        </div>
      )}
    </div>
  );
};

export default LessonVideoPlayer;