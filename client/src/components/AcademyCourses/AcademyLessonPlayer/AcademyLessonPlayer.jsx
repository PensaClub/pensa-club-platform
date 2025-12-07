// src/components/AcademyCourses/AcademyLessonPlayer/AcademyLessonPlayer.jsx

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academylessonplayer.css';

const AcademyLessonPlayer = () => {
  const { t } = useTranslation();
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  
  const { isAuthentication, isAdmin, isModerator, isMentor } = useAuthContext();
  const { 
    getLessonBySlug, 
    getCourseBySlug,
    getLessonMaterials,
    getEnrollmentStatus,
    updateLessonProgress,
    completeLesson,
    startTest,
    isLoading 
  } = useAcademyCourses();

  // State
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState(null);
  
  // UI State
  const [showPlayer, setShowPlayer] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);

  const fetchedRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Privileged access
  const hasPrivilegedAccess = isAdmin || isModerator || isMentor;
  const hasAccess = isAuthentication && (isEnrolled || hasPrivilegedAccess);

  // =========================================================
  //                    DATA FETCHING
  // =========================================================

  useEffect(() => {
    const fetchData = async () => {
      if (!courseSlug || !lessonSlug) return;
      if (fetchedRef.current === `${courseSlug}-${lessonSlug}`) return;

      try {
        fetchedRef.current = `${courseSlug}-${lessonSlug}`;
        setError(null);
        setLessonStarted(false);
        setLessonProgress(0);
        setShowPlayer(false);
        
        // Fetch course first
        const courseData = await getCourseBySlug(courseSlug);
        const courseInfo = courseData?.course || courseData;
        setCourse(courseInfo);

        // Check enrollment
        if (isAuthentication && courseInfo?.id) {
          const enrollmentStatus = await getEnrollmentStatus(courseInfo.id);
          setIsEnrolled(enrollmentStatus?.enrolled || false);
        }

        // Fetch lesson
        const lessonData = await getLessonBySlug(courseSlug, lessonSlug);
        const lessonInfo = lessonData?.lesson || lessonData;
        setLesson(lessonInfo);

        // Fetch lesson materials
        try {
          const materialsData = await getLessonMaterials(lessonSlug);
          setMaterials(materialsData || []);
        } catch (err) {
          console.error('Error fetching materials:', err);
          setMaterials([]);
        }

      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError(err.message || 'Грешка при зареждане');
      }
    };

    fetchData();
  }, [courseSlug, lessonSlug, isAuthentication, getCourseBySlug, getEnrollmentStatus, getLessonBySlug, getLessonMaterials]);

  // =========================================================
  //                    START LESSON ON LOAD
  // =========================================================

  useEffect(() => {
    const startLessonProgress = async () => {
      if (!lesson?.id || !hasAccess || lessonStarted) return;

      try {
        await updateLessonProgress(lesson.id, { progress: 0 });
        setLessonStarted(true);
      } catch (err) {
        console.error('Error starting lesson:', err);
        setLessonStarted(true);
      }
    };

    startLessonProgress();
  }, [lesson?.id, hasAccess, lessonStarted, updateLessonProgress]);

  // =========================================================
  //                    VIDEO PROGRESS TRACKING
  // =========================================================

  useEffect(() => {
    if (!showPlayer || !lesson?.id || !hasAccess) return;

    progressIntervalRef.current = setInterval(async () => {
      setLessonProgress(prev => {
        const newProgress = Math.min(prev + 10, 90);
        updateLessonProgress(lesson.id, { progress: newProgress }).catch(err => {
          console.error('Error updating progress:', err);
        });
        return newProgress;
      });
    }, 30000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [showPlayer, lesson?.id, hasAccess, updateLessonProgress]);

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
  //                    CONTROLS VISIBILITY
  // =========================================================

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (showPlayer) {
        setControlsVisible(false);
      }
    }, 3000);
  }, [showPlayer]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

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
    if (lesson?.thumbnailUrl) {
      return lesson.thumbnailUrl;
    }
    
    const videoUrl = lesson?.videoUrl;
    if (videoUrl) {
      const videoId = extractYouTubeId(videoUrl);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return '/images/default-lesson-thumbnail.jpg';
  }, [lesson?.thumbnailUrl, lesson?.videoUrl, extractYouTubeId]);

  // =========================================================
  //                    FULLSCREEN
  // =========================================================

  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
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
  //                    LESSON ACCESS
  // =========================================================

  const isLessonAccessible = useCallback((lessonData) => {
    if (!lessonData) return false;
    
    if (!lessonData.isPublished && lessonData.status !== 'published') {
      return hasPrivilegedAccess;
    }

    if (lessonData.lessonType === 'live' && lessonData.scheduledDate) {
      const now = new Date();
      const scheduled = new Date(lessonData.scheduledDate);
      const fiveMinBefore = new Date(scheduled.getTime() - 5 * 60 * 1000);
      return now >= fiveMinBefore;
    }

    if (!lessonData.scheduledDate) return true;

    const now = new Date();
    const scheduled = new Date(lessonData.scheduledDate);
    return now >= scheduled;
  }, [hasPrivilegedAccess]);

  // =========================================================
  //                    NAVIGATION
  // =========================================================

  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap(module => 
      (module.lessons || [])
        .filter(l => l.isPublished || l.status === 'published')
        .map(l => ({
          ...l,
          moduleTitle: module.title,
          moduleId: module.id
        }))
    );
  }, [course]);

  const currentLessonIndex = useMemo(() => {
    return allLessons.findIndex(l => l.slug === lessonSlug);
  }, [allLessons, lessonSlug]);

  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // =========================================================
  //                    HANDLERS
  // =========================================================

  const handleCompleteLesson = async () => {
    if (!lesson?.id || isCompleting) return;
    
    try {
      setIsCompleting(true);
      await completeLesson(lesson.id);
      setLessonProgress(100);
      
      if (nextLesson && isLessonAccessible(nextLesson)) {
        navigate(`/academy/courses/${courseSlug}/lessons/${nextLesson.slug}`);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStartTest = async () => {
    if (!lesson?.id || isStartingTest || !lesson?.hasTest) return;
    
    try {
      setIsStartingTest(true);
      await startTest(lesson.id);
      navigate(`/academy/courses/${courseSlug}/lessons/${lessonSlug}/test`);
    } catch (error) {
      console.error('Error starting test:', error);
    } finally {
      setIsStartingTest(false);
    }
  };

  const handleNavigateToLesson = (targetLesson) => {
    if (!targetLesson || !isLessonAccessible(targetLesson)) return;
    navigate(`/academy/courses/${courseSlug}/lessons/${targetLesson.slug}`);
    setIsSidebarOpen(false);
    setShowPlayer(false);
  };

  // =========================================================
  //                    FORMAT HELPERS
  // =========================================================

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  const formatScheduledDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMaterialIcon = (material) => {
    const type = material.type?.toLowerCase() || material.fileType?.toLowerCase() || '';
    const name = material.name?.toLowerCase() || material.title?.toLowerCase() || '';
    
    if (type.includes('pdf') || name.endsWith('.pdf')) return '📄';
    if (type.includes('doc') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('video') || name.endsWith('.mp4')) return '🎬';
    if (type.includes('image') || name.endsWith('.jpg') || name.endsWith('.png')) return '🖼️';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '🔗';
  };

  // =========================================================
  //                    RENDER STATES
  // =========================================================

  if (isLoading && !lesson) {
    return (
      <div className="lp">
        <div className="lp-state">
          <div className="lp-state__spinner"></div>
          <p>{t('academyLessonPlayer.loading', 'Зареждане...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lp">
        <div className="lp-state">
          <div className="lp-state__icon">⚠️</div>
          <h2>{t('academyLessonPlayer.error', 'Грешка')}</h2>
          <p>{error}</p>
          <Link to={`/academy/courses/${courseSlug}`} className="lp-state__btn">
            {t('academyLessonPlayer.backToCourse', 'Към курса')}
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthentication) {
    return (
      <div className="lp">
        <div className="lp-state">
          <div className="lp-state__icon">🔐</div>
          <h2>{t('academyLessonPlayer.loginRequired', 'Влезте в профила си')}</h2>
          <p>{t('academyLessonPlayer.loginRequiredDesc', 'Трябва да влезете, за да гледате този урок.')}</p>
          <Link to="/sign-in" className="lp-state__btn">
            {t('academyLessonPlayer.login', 'Вход')}
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="lp">
        <div className="lp-state">
          <div className="lp-state__icon">📚</div>
          <h2>{t('academyLessonPlayer.enrollRequired', 'Запишете се')}</h2>
          <p>{t('academyLessonPlayer.enrollRequiredDesc', 'Трябва да сте записани в този курс.')}</p>
          <Link to={`/academy/courses/${courseSlug}`} className="lp-state__btn">
            {t('academyLessonPlayer.goToCourse', 'Към курса')}
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lp">
        <div className="lp-state">
          <div className="lp-state__icon">🔍</div>
          <h2>{t('academyLessonPlayer.notFound', 'Урокът не е намерен')}</h2>
          <Link to={`/academy/courses/${courseSlug}`} className="lp-state__btn">
            {t('academyLessonPlayer.backToCourse', 'Към курса')}
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson.isPublished && lesson.status !== 'published' && !hasPrivilegedAccess) {
    return (
      <div className="lp">
        <div className="lp-state">
          <div className="lp-state__icon">🚫</div>
          <h2>{t('academyLessonPlayer.unpublished', 'Не е публикуван')}</h2>
          <p>{t('academyLessonPlayer.unpublishedDesc', 'Този урок все още не е наличен.')}</p>
          <Link to={`/academy/courses/${courseSlug}`} className="lp-state__btn">
            {t('academyLessonPlayer.backToCourse', 'Към курса')}
          </Link>
        </div>
      </div>
    );
  }

  const courseName = lesson?.course?.name || course?.name || '';
  const moduleTitle = lesson?.module?.title || '';
  const canShowVideo = lesson?.lessonType === 'video' || 
    (lesson?.lessonType === 'live' && (liveStatus === 'live' || liveStatus === 'starting' || (liveStatus === 'ended' && lesson?.videoUrl)));

  // =========================================================
  //                    MAIN RENDER
  // =========================================================

  return (
    <div className="lp">
      {/* Background */}
      <div className="lp-bg">
        <div className="lp-bg__gradient"></div>
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="lp-bg__image" />}
      </div>

      {/* Main Container */}
      <div className="lp-container">
        {/* Video Section */}
        <div 
          ref={videoContainerRef}
          className={`lp-player ${isFullscreen ? 'lp-player--fullscreen' : ''}`}
          onMouseMove={showControls}
          onMouseLeave={() => showPlayer && setControlsVisible(false)}
        >
          {/* Video Content */}
          <div className="lp-player__video">
            {canShowVideo && embedUrl ? (
              !showPlayer ? (
                <div className="lp-player__thumbnail" onClick={() => setShowPlayer(true)}>
                  <img 
                    src={thumbnailUrl} 
                    alt={lesson?.title}
                    onError={(e) => {
                      e.target.src = '/images/default-lesson-thumbnail.jpg';
                    }}
                  />
                  <div className="lp-player__overlay">
                    <button className="lp-player__play-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                    {liveStatus === 'starting' && countdown && (
                      <div className="lp-player__starting-badge">
                        {t('academyLessonPlayer.startsIn', 'Започва след')} {countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <iframe
                  src={embedUrl}
                  title={lesson?.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )
            ) : lesson?.lessonType === 'live' && liveStatus === 'upcoming' ? (
              <div className="lp-player__countdown">
                <img 
                  src={thumbnailUrl} 
                  alt="" 
                  className="lp-player__countdown-bg"
                  onError={(e) => {
                    e.target.src = '/images/default-lesson-thumbnail.jpg';
                  }}
                />
                <div className="lp-player__countdown-content">
                  <span className="lp-player__countdown-badge">
                    <span className="lp-player__countdown-dot"></span>
                    {t('academyLessonPlayer.upcoming', 'Предстоящо')}
                  </span>
                  <h2>{t('academyLessonPlayer.liveScheduled', 'Урок на живо')}</h2>
                  <p className="lp-player__countdown-date">{formatScheduledDate(lesson?.scheduledDate)}</p>
                  {countdown && (
                    <div className="lp-player__countdown-timer">
                      {countdown.days > 0 && (
                        <div className="lp-player__countdown-unit">
                          <span>{countdown.days}</span>
                          <small>{t('academyLessonPlayer.days', 'дни')}</small>
                        </div>
                      )}
                      <div className="lp-player__countdown-unit">
                        <span>{countdown.hours}</span>
                        <small>{t('academyLessonPlayer.hours', 'часа')}</small>
                      </div>
                      <div className="lp-player__countdown-unit">
                        <span>{countdown.minutes}</span>
                        <small>{t('academyLessonPlayer.minutes', 'мин')}</small>
                      </div>
                      <div className="lp-player__countdown-unit">
                        <span>{countdown.seconds}</span>
                        <small>{t('academyLessonPlayer.seconds', 'сек')}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : lesson?.lessonType === 'live' && liveStatus === 'ended' && !lesson?.videoUrl ? (
              <div className="lp-player__message">
                <span className="lp-player__message-icon">📹</span>
                <h3>{t('academyLessonPlayer.recordingProcessing', 'Записът се обработва')}</h3>
                <p>{t('academyLessonPlayer.recordingProcessingDesc', 'Ще бъде наличен скоро.')}</p>
              </div>
            ) : lesson?.lessonType === 'text' ? (
              <div className="lp-player__message">
                <img 
                  src={thumbnailUrl} 
                  alt="" 
                  className="lp-player__message-bg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="lp-player__message-icon">📖</span>
                <h3>{t('academyLessonPlayer.textLesson', 'Текстов урок')}</h3>
                <p>{t('academyLessonPlayer.readBelowDesc', 'Прочетете съдържанието по-долу')}</p>
              </div>
            ) : (
              <div className="lp-player__message">
                <img 
                  src={thumbnailUrl} 
                  alt="" 
                  className="lp-player__message-bg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="lp-player__message-icon">🎬</span>
                <h3>{t('academyLessonPlayer.noVideo', 'Няма видео')}</h3>
              </div>
            )}
          </div>

          {/* Floating Controls */}
          <div className={`lp-controls ${controlsVisible ? 'lp-controls--visible' : ''}`}>
            {/* Top Bar */}
            <div className="lp-controls__top">
              <Link to={`/academy/courses/${courseSlug}`} className="lp-controls__back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>

              <div className="lp-controls__title">
                <span className="lp-controls__course">{courseName}</span>
                {moduleTitle && <span className="lp-controls__module">{moduleTitle}</span>}
              </div>

              <div className="lp-controls__actions">
                <button 
                  className="lp-controls__btn"
                  onClick={() => setIsSidebarOpen(true)}
                  title={t('academyLessonPlayer.courseContent', 'Съдържание')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {canShowVideo && (
                  <button 
                    className="lp-controls__btn"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? t('academyLessonPlayer.exitFullscreen', 'Изход') : t('academyLessonPlayer.fullscreen', 'Цял екран')}
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
              </div>
            </div>

            {/* Live Badge */}
            {lesson?.lessonType === 'live' && liveStatus === 'live' && (
              <div className="lp-controls__live">
                <span className="lp-controls__live-dot"></span>
                {t('academyLessonPlayer.live', 'НА ЖИВО')}
              </div>
            )}

            {/* Bottom Bar */}
            <div className="lp-controls__bottom">
              <div className="lp-controls__nav">
                <button 
                  className="lp-controls__nav-btn"
                  onClick={() => previousLesson && handleNavigateToLesson(previousLesson)}
                  disabled={!previousLesson || !isLessonAccessible(previousLesson)}
                  title={previousLesson?.title || ''}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="lp-controls__progress">
                  {currentLessonIndex + 1} / {allLessons.length}
                </span>

                <button 
                  className="lp-controls__nav-btn"
                  onClick={() => nextLesson && handleNavigateToLesson(nextLesson)}
                  disabled={!nextLesson || !isLessonAccessible(nextLesson)}
                  title={nextLesson?.title || ''}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className={`lp-info ${isInfoExpanded ? 'lp-info--expanded' : ''}`}>
          <button 
            className="lp-info__toggle"
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={isInfoExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
            </svg>
          </button>

          <div className="lp-info__content">
            {/* Header */}
            <div className="lp-info__header">
              <div className="lp-info__meta">
                <span className="lp-info__type">
                  {lesson?.lessonType === 'video' && '🎬'}
                  {lesson?.lessonType === 'live' && '🔴'}
                  {lesson?.lessonType === 'text' && '📖'}
                  {lesson?.lessonType === 'quiz' && '❓'}
                  {lesson?.lessonType === 'video' && t('academyLessonPlayer.typeVideo', 'Видео')}
                  {lesson?.lessonType === 'live' && t('academyLessonPlayer.typeLive', 'На живо')}
                  {lesson?.lessonType === 'text' && t('academyLessonPlayer.typeText', 'Текст')}
                  {lesson?.lessonType === 'quiz' && t('academyLessonPlayer.typeQuiz', 'Тест')}
                </span>
                {lesson?.durationMinutes > 0 && (
                  <span className="lp-info__duration">⏱️ {formatDuration(lesson.durationMinutes)}</span>
                )}
                {lesson?.maxCredits > 0 && (
                  <span className="lp-info__credits">🪙 +{lesson.maxCredits}</span>
                )}
                {lesson?.viewsCount > 0 && (
                  <span className="lp-info__views">👁️ {lesson.viewsCount.toLocaleString()}</span>
                )}
              </div>
              <h1 className="lp-info__title">{lesson?.title}</h1>
              
              {/* Progress indicator */}
              {lessonProgress > 0 && (
                <div className="lp-info__progress-bar">
                  <div className="lp-info__progress-track">
                    <div 
                      className="lp-info__progress-fill" 
                      style={{ width: `${lessonProgress}%` }}
                    ></div>
                  </div>
                  <span className="lp-info__progress-text">{lessonProgress}%</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="lp-info__body">
              {lesson?.description && (
                <p className="lp-info__description">{lesson.description}</p>
              )}

              {/* Mentor */}
              {lesson?.mentor && (
                <div className="lp-info__mentor">
                  <img 
                    src={lesson.mentor.photoUrl || '/images/default-avatar.png'} 
                    alt={lesson.mentor.name}
                    onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
                  />
                  <div>
                    <span className="lp-info__mentor-name">{lesson.mentor.name}</span>
                    {lesson.mentor.specialization && (
                      <span className="lp-info__mentor-role">{lesson.mentor.specialization}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="lp-info__actions">
                <button 
                  className="lp-info__complete-btn"
                  onClick={handleCompleteLesson}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <span className="lp-info__spinner"></span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('academyLessonPlayer.complete', 'Завърши урока')}
                    </>
                  )}
                </button>

                {lesson?.hasTest && (
                  <button 
                    className="lp-info__test-btn"
                    onClick={handleStartTest}
                    disabled={isStartingTest}
                  >
                    {isStartingTest ? (
                      <span className="lp-info__spinner lp-info__spinner--purple"></span>
                    ) : (
                      <>
                        📝 {t('academyLessonPlayer.startTest', 'Започни теста')}
                        {lesson?.creditsForTest > 0 && (
                          <span className="lp-info__test-credits">+{lesson.creditsForTest} 🪙</span>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Test info */}
              {lesson?.hasTest && (
                <div className="lp-info__test-info">
                  <div className="lp-info__test-info-icon">📋</div>
                  <div className="lp-info__test-info-content">
                    <h4>{t('academyLessonPlayer.testAvailable', 'Тест към урока')}</h4>
                    <p>
                      {t('academyLessonPlayer.passingScore', 'Минимален резултат')}: {lesson.testPassingScore || 70}%
                      {lesson?.creditsForTest > 0 && (
                        <> • {t('academyLessonPlayer.earnCredits', 'Печели')}: +{lesson.creditsForTest} 🪙</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Materials */}
              {materials.length > 0 && (
                <div className="lp-info__materials">
                  <h3>📎 {t('academyLessonPlayer.materials', 'Материали')} ({materials.length})</h3>
                  <div className="lp-info__materials-list">
                    {materials.map((material, idx) => (
                      <a 
                        key={material.id || idx}
                        href={material.url || material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lp-info__material"
                        download={material.downloadable !== false}
                      >
                        <span className="lp-info__material-icon">
                          {getMaterialIcon(material)}
                        </span>
                        <span className="lp-info__material-name">
                          {material.name || material.title || 'Материал'}
                        </span>
                        <svg className="lp-info__material-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div className={`lp-sidebar ${isSidebarOpen ? 'lp-sidebar--open' : ''}`}>
        <div className="lp-sidebar__overlay" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="lp-sidebar__panel">
          <div className="lp-sidebar__header">
            <h2>{t('academyLessonPlayer.courseContent', 'Съдържание')}</h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="lp-sidebar__content">
            {course?.modules?.map((module, moduleIdx) => {
              const moduleLessons = (module.lessons || []).filter(l => l.isPublished || l.status === 'published');
              if (moduleLessons.length === 0) return null;

              const isCurrentModule = module.id === lesson?.moduleId;

              return (
                <div 
                  key={module.id} 
                  className={`lp-sidebar__module ${isCurrentModule ? 'lp-sidebar__module--current' : ''}`}
                >
                  <div className="lp-sidebar__module-header">
                    <span className="lp-sidebar__module-num">{moduleIdx + 1}</span>
                    <span className="lp-sidebar__module-title">{module.title}</span>
                  </div>

                  <div className="lp-sidebar__lessons">
                    {moduleLessons.map((l) => {
                      const isActive = l.slug === lessonSlug;
                      const isAccessible = isLessonAccessible(l);

                      return (
                        <button
                          key={l.id || l.slug}
                          onClick={() => isAccessible && handleNavigateToLesson(l)}
                          className={`lp-sidebar__lesson 
                            ${isActive ? 'lp-sidebar__lesson--active' : ''} 
                            ${!isAccessible ? 'lp-sidebar__lesson--locked' : ''}`}
                          disabled={!isAccessible}
                        >
                          <span className="lp-sidebar__lesson-icon">
                            {!isAccessible ? '🔒' : 
                              l.lessonType === 'video' ? '▶️' :
                              l.lessonType === 'live' ? '🔴' :
                              l.lessonType === 'text' ? '📖' : '❓'}
                          </span>
                          <span className="lp-sidebar__lesson-title">{l.title}</span>
                          {l.durationMinutes > 0 && (
                            <span className="lp-sidebar__lesson-duration">{l.durationMinutes}м</span>
                          )}
                          {isActive && <span className="lp-sidebar__lesson-playing">▶</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyLessonPlayer;