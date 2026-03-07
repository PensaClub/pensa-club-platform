// src/components/AcademyCourses/AcademyLessonPlayer/AcademyLessonPlayer.jsx

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academyLessonPlayer.css';
import AcademyLessonPlayerSkeleton from './AcademyLessonPlayerSkeleton/AcademyLessonPlayerSkeleton';
import { TextZoom } from '../../TextZoom/TextZoom';

const AcademyLessonPlayer = () => {
  const { t } = useTranslation('academy');
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useLocalizedNavigate();

  const { isAuthentication, isAdmin, isModerator, isMentor } = useAuthContext();
  const {
    getLessonBySlug,
    getCourseBySlug,
    getLessonMaterials,
    getEnrollmentStatus,
    startLessonBySlug,
    updateLessonProgressBySlug,
    completeLessonBySlug,
    isLoading
  } = useAcademyCourses();

  // State
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState(null);

  // Enrollment & Progress State
  const [lessonsProgress, setLessonsProgress] = useState([]);
  const [enrollmentStats, setEnrollmentStats] = useState(null);
  const [currentLessonStatus, setCurrentLessonStatus] = useState('not_started');
  const [currentLessonProgress, setCurrentLessonProgress] = useState(0);
  const [nextLessonData, setNextLessonData] = useState(null);

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
  const [lessonStarted, setLessonStarted] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  const fetchedRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const videoContainerRef = useRef(null);
  const breadcrumbBarRef = useRef(null);
  const [isBreadcrumbSticky, setIsBreadcrumbSticky] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const privilegedProgressRef = useRef({});
  // Privileged access
  const hasPrivilegedAccess = isAdmin || isModerator || isMentor;
  const hasAccess = isAuthentication && (isEnrolled || hasPrivilegedAccess);

  //SCROLL TOP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonSlug]);

  useEffect(() => {
    const el = breadcrumbBarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsBreadcrumbSticky(!entry.isIntersecting),
      { rootMargin: '-141px 0px 0px 0px' }
    );
    observer.observe(el.previousElementSibling); // наблюдава video player div-а
    return () => observer.disconnect();
  }, [lesson]);
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
        setCurrentLessonProgress(0);
        setCurrentLessonStatus('loading');
        setShowPlayer(false);
        setWatchedSeconds(0);

        // 1. Fetch course
        let courseInfo = course;
        if (!courseInfo || courseInfo.slug !== courseSlug) {
          const courseData = await getCourseBySlug(courseSlug);
          courseInfo = courseData?.course || courseData;
          setCourse(courseInfo);
        }

        // 2. Fetch lesson
        const lessonData = await getLessonBySlug(courseSlug, lessonSlug);
        const lessonInfo = lessonData?.lesson || lessonData;
        setLesson(lessonInfo);

        // 3. Check enrollment + get ALL lessons progress
        if (isAuthentication && courseInfo?.id) {
          const enrollmentData = await getEnrollmentStatus(courseInfo.id);
          setIsEnrolled(enrollmentData?.enrolled || false);

          // Store lessons progress
          if (enrollmentData?.lessonsProgress) {
            setLessonsProgress(enrollmentData.lessonsProgress);

            // Find current lesson status
            const currentProgress = enrollmentData.lessonsProgress.find(
              lp => lp.lessonSlug === lessonSlug || lp.lessonId === lessonInfo?.id
            );

            if (currentProgress) {
              setCurrentLessonStatus(currentProgress.status || 'not_started');
              setCurrentLessonProgress(currentProgress.progress || 0);
              setWatchedSeconds((currentProgress.timeSpentMinutes || 0) * 60);
            } else if (hasPrivilegedAccess && privilegedProgressRef.current[lessonSlug]) {
              setCurrentLessonStatus('completed');
              setCurrentLessonProgress(100);
            } else {
              setCurrentLessonStatus('not_started');
              setCurrentLessonProgress(0);
            }
          }

          // Store stats
          if (enrollmentData?.stats) {
            setEnrollmentStats(enrollmentData.stats);
          }

          // Store next lesson from API
          if (enrollmentData?.nextLesson) {
            setNextLessonData(enrollmentData.nextLesson);
          }
        }

        // 4. Fetch lesson materials
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
    const markLessonStarted = async () => {
      if (!lessonSlug || !hasAccess || lessonStarted) return;
      if (currentLessonStatus === 'completed') return;

      try {
        await startLessonBySlug(lessonSlug);
        setLessonStarted(true);
        if (currentLessonStatus === 'not_started') {
          setCurrentLessonStatus('in_progress');
        }
      } catch (err) {
        console.error('Error starting lesson:', err);
        setLessonStarted(true);
      }
    };

    markLessonStarted();
  }, [lessonSlug, hasAccess, lessonStarted, currentLessonStatus, startLessonBySlug]);

  // =========================================================
  //                    VIDEO PROGRESS TRACKING
  // =========================================================

  useEffect(() => {
    if (!showPlayer || !lessonSlug || !hasAccess) return;
    if (currentLessonStatus === 'completed') return;

    progressIntervalRef.current = setInterval(async () => {
      setWatchedSeconds(prev => prev + 30);
      setCurrentLessonProgress(prev => {
        const newProgress = Math.min(prev + 5, 95);

        updateLessonProgressBySlug(lessonSlug, {
          progress: newProgress,
          watchedSeconds: watchedSeconds + 30
        }).catch(err => {
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
  }, [showPlayer, lessonSlug, hasAccess, currentLessonStatus, watchedSeconds, updateLessonProgressBySlug]);

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
  //                    LESSON ACCESS & STATUS HELPERS
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

  // Get lesson progress data from progress array
  const getLessonProgressData = useCallback((lessonId, lessonSlugParam) => {
    return lessonsProgress.find(
      lp => lp.lessonId === lessonId || lp.lessonSlug === lessonSlugParam
    );
  }, [lessonsProgress]);

  // Get lesson status from progress array
  const getLessonStatus = useCallback((lessonId, lessonSlugParam) => {
    const progress = getLessonProgressData(lessonId, lessonSlugParam);
    return progress?.status || 'not_started';
  }, [getLessonProgressData]);

  // Check if lesson is completed
  const isLessonCompleted = useCallback((lessonId, lessonSlugParam) => {
    return getLessonStatus(lessonId, lessonSlugParam) === 'completed';
  }, [getLessonStatus]);

  // Check if test is passed
  const isTestPassed = useCallback((lessonId, lessonSlugParam) => {
    const progress = getLessonProgressData(lessonId, lessonSlugParam);
    return progress?.testPassed || false;
  }, [getLessonProgressData]);

  // Get test score
  const getTestScore = useCallback((lessonId, lessonSlugParam) => {
    const progress = getLessonProgressData(lessonId, lessonSlugParam);
    return progress?.testScore || null;
  }, [getLessonProgressData]);

  // Get earned credits for lesson
  const getLessonEarnedCredits = useCallback((lessonId, lessonSlugParam) => {
    const progress = getLessonProgressData(lessonId, lessonSlugParam);
    return progress?.earnedCredits || 0;
  }, [getLessonProgressData]);

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
    if (!lessonSlug || isCompleting) return;

    // Already completed - navigate to next
    if (currentLessonStatus === 'completed') {
      if (nextLesson && isLessonAccessible(nextLesson)) {
        fetchedRef.current = null;
        navigate(`/academy/courses/${courseSlug}/lessons/${nextLesson.slug}`);
      }
      return;
    }

    try {
      setIsCompleting(true);
      await completeLessonBySlug(lessonSlug);

      setCurrentLessonStatus('completed');
      setCurrentLessonProgress(100);
      if (hasPrivilegedAccess && !isEnrolled) {
        privilegedProgressRef.current[lessonSlug] = true;
      }
      // Update local lessonsProgress
      setLessonsProgress(prev => {
        const existing = prev.find(lp => lp.lessonSlug === lessonSlug);
        if (existing) {
          return prev.map(lp =>
            lp.lessonSlug === lessonSlug
              ? { ...lp, status: 'completed', progress: 100 }
              : lp
          );
        }
        return [...prev, { lessonSlug, status: 'completed', progress: 100 }];
      });

      // Update stats
      if (enrollmentStats) {
        setEnrollmentStats(prev => ({
          ...prev,
          completedLessons: (prev?.completedLessons || 0) + 1,
          inProgressLessons: Math.max(0, (prev?.inProgressLessons || 0) - 1),
          progressPercentage: Math.round(((prev?.completedLessons || 0) + 1) / (prev?.totalLessons || 1) * 100)
        }));
      }

      // НЕ навигирай автоматично — потребителят решава
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStartTest = async () => {
    if (!lesson?.id || isStartingTest || !lesson?.hasTest) return;
    navigate(`/academy/courses/${courseSlug}/lessons/${lessonSlug}/test`);
  };

  const handleNavigateToLesson = (targetLesson) => {
    if (!targetLesson || !isLessonAccessible(targetLesson)) return;
    fetchedRef.current = null;  // <-- форсирай re-fetch
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
    const type = material.materialType?.toLowerCase() || material.mimeType?.toLowerCase() || '';
    const name = material.originalFileName?.toLowerCase() || material.title?.toLowerCase() || '';

    if (type.includes('pdf') || name.endsWith('.pdf')) return '📄';
    if (type.includes('doc') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('video') || type.includes('mp4') || name.endsWith('.mp4')) return '🎬';
    if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('excel') || type.includes('spreadsheet') || name.endsWith('.xlsx')) return '📊';
    if (type.includes('presentation') || name.endsWith('.pptx')) return '📽️';
    if (type.includes('audio') || name.endsWith('.mp3')) return '🎵';
    return '🔗';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimeSpent = (minutes) => {
    if (!minutes) return '0 мин';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  // =========================================================
  //                    RENDER STATES
  // =========================================================

  if (isLoading && !lesson) {
    return <AcademyLessonPlayerSkeleton />;
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

  // Current lesson progress data
  const currentLessonProgressData = getLessonProgressData(lesson?.id, lessonSlug);
  const currentTestScore = currentLessonProgressData?.testScore;
  const currentEarnedCredits = currentLessonProgressData?.earnedCredits || 0;

  // =========================================================
  //                    MAIN RENDER
  // =========================================================

  return (
    <>
    <TextZoom />
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
          {/* Completed Badge */}
          {currentLessonStatus === 'completed' && (
            <div className="lp-player__completed-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('academyLessonPlayer.completed', 'Завършен')}
            </div>
          )}

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
                {/* <button 
                  className="lp-controls__btn"
                  onClick={() => setIsSidebarOpen(true)}
                  title={t('academyLessonPlayer.courseContent', 'Съдържание')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button> */}
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
        {/* Sticky Navigation Bar */}
        <div ref={breadcrumbBarRef} className="lp-nav-bar">
          <Link to={`/academy/courses/${courseSlug}`} className="lp-nav-bar__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('academyLessonPlayer.backToCourse', '← Към курса')}
          </Link>
          <span className="lp-nav-bar__title">{lesson?.title}</span>
          <button
            className="lp-nav-bar__sidebar-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {t('academyLessonPlayer.courseContent', 'Съдържание')}
          </button>
        </div>
        {/* Info Section */}
        <div className="lp-info">
          {/* <button 
            className="lp-info__toggle"
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={isInfoExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
            </svg>
          </button> */}

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
                {currentLessonStatus === 'completed' && (
                  <span className="lp-info__status lp-info__status--completed">
                    ✅ {t('academyLessonPlayer.completedStatus', 'Завършен')}
                  </span>
                )}
                {currentLessonStatus === 'in_progress' && (
                  <span className="lp-info__status lp-info__status--in-progress">
                    ▶️ {t('academyLessonPlayer.inProgress', 'В процес')}
                  </span>
                )}
              </div>
              {moduleTitle && (
                <span className="lp-info__module-badge">
                  📁 {t('academyLessonPlayer.partOfModule', 'Част от модул')}: {moduleTitle}
                </span>
              )}
              <h1 className="lp-info__title">{lesson?.title}</h1>

              {/* Course Progress Stats */}
              {enrollmentStats && (
                <div className="lp-info__course-stats">
                  <span className="lp-info__course-stat">
                    📚 {enrollmentStats.completedLessons}/{enrollmentStats.totalLessons} урока
                  </span>
                  <span className="lp-info__course-stat">
                    📈 {enrollmentStats.progressPercentage}% завършени
                  </span>
                  {enrollmentStats.inProgressLessons > 0 && (
                    <span className="lp-info__course-stat">
                      ▶️ {enrollmentStats.inProgressLessons} в процес
                    </span>
                  )}
                  {enrollmentStats.passedTests > 0 && (
                    <span className="lp-info__course-stat">
                      ✅ {enrollmentStats.passedTests} теста
                    </span>
                  )}
                  {enrollmentStats.totalEarnedCredits > 0 && (
                    <span className="lp-info__course-stat">
                      🪙 {enrollmentStats.totalEarnedCredits} кредита
                    </span>
                  )}
                  {enrollmentStats.totalTimeSpentMinutes > 0 && (
                    <span className="lp-info__course-stat">
                      ⏱️ {formatTimeSpent(enrollmentStats.totalTimeSpentMinutes)}
                    </span>
                  )}
                </div>
              )}

              {/* Progress indicator */}
              {currentLessonProgress > 0 && currentLessonStatus !== 'completed' && (
                <div className="lp-info__progress-bar">
                  <div className="lp-info__progress-track">
                    <div
                      className="lp-info__progress-fill"
                      style={{ width: `${currentLessonProgress}%` }}
                    ></div>
                  </div>
                  <span className="lp-info__progress-text">{currentLessonProgress}%</span>
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
                {/* Complete Button */}
                {currentLessonStatus === 'completed' ? (
                  <div className="lp-info__completed-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t('academyLessonPlayer.completedStatus', 'Завършен')}
                  </div>
                ) : (
                  <button
                    className="lp-info__complete-btn"
                    onClick={handleCompleteLesson}
                    disabled={isCompleting || currentLessonStatus === 'loading'}
                  >
                    {isCompleting || currentLessonStatus === 'loading' ? (
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
                )}

                {/* Next Lesson Button - separate, always visible when there's a next */}
                {/* {currentLessonStatus === 'completed' && nextLesson && (
                  <button
                    className="lp-info__next-btn"
                    onClick={() => handleNavigateToLesson(nextLesson)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {t('academyLessonPlayer.nextLesson', 'Следващ урок')}
                  </button>
                )} */}

                {/* Test Button */}
                {lesson?.hasTest && (
                  <button
                    className={`lp-info__test-btn ${isTestPassed(lesson.id, lessonSlug) ? 'lp-info__test-btn--passed' : ''}`}
                    onClick={handleStartTest}
                    disabled={isStartingTest}
                  >
                    {isStartingTest ? (
                      <span className="lp-info__spinner lp-info__spinner--purple"></span>
                    ) : isTestPassed(lesson.id, lessonSlug) ? (
                      <>
                        ✅ {t('academyLessonPlayer.testPassed', 'Тестът е преминат')}
                        {currentTestScore && <span className="lp-info__test-score">({currentTestScore}%)</span>}
                      </>
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

              {/* Current lesson earned credits */}
              {currentEarnedCredits > 0 && (
                <div className="lp-info__earned-credits">
                  <span className="lp-info__earned-credits-icon">🏆</span>
                  <span>Спечелени от този урок: <strong>{currentEarnedCredits} кредита</strong></span>
                </div>
              )}

              {/* Test info */}
              {lesson?.hasTest && !isTestPassed(lesson.id, lessonSlug) && (
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
                <div className="lp-materials">
                  <div className="lp-materials__header">
                    <h3>
                      <span className="lp-materials__icon">📎</span>
                      {t('academyLessonPlayer.materials', 'Материали')}
                      <span className="lp-materials__count">{materials.length}</span>
                    </h3>
                  </div>

                  <div className="lp-materials__list">
                    {materials.map((material, idx) => (
                      <a
                        key={material.id || idx}
                        href={material.fileUrl || material.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`lp-materials__item ${material.isRequired ? 'lp-materials__item--required' : ''}`}
                        download={material.isDownloadable !== false}
                        style={{ '--delay': `${idx * 0.05}s` }}
                      >
                        <div className="lp-materials__item-icon">
                          {getMaterialIcon(material)}
                        </div>

                        <div className="lp-materials__item-info">
                          <div className="lp-materials__item-header">
                            <h4 className="lp-materials__item-title">
                              {material.title || material.originalFileName || 'Материал'}
                            </h4>
                            {material.isRequired && (
                              <span className="lp-materials__item-required-badge">
                                {t('academyLessonPlayer.required', 'Задължителен')}
                              </span>
                            )}
                          </div>

                          {material.description && (
                            <p className="lp-materials__item-description">
                              {material.description}
                            </p>
                          )}

                          <div className="lp-materials__item-meta">
                            {material.materialType && (
                              <span className="lp-materials__item-type">
                                {material.materialType.toUpperCase()}
                              </span>
                            )}
                            {material.fileSize && (
                              <span className="lp-materials__item-size">
                                {formatFileSize(material.fileSize)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="lp-materials__item-action">
                          <div className="lp-materials__item-download">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Prev/Next Navigation */}
              <div className="lp-info__nav">
                {previousLesson ? (
                  <button
                    className="lp-info__nav-btn lp-info__nav-btn--prev"
                    onClick={() => handleNavigateToLesson(previousLesson)}
                    disabled={!isLessonAccessible(previousLesson)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <div className="lp-info__nav-text">
                      <span className="lp-info__nav-label">{t('academyLessonPlayer.prevLesson', 'Предишен урок')}</span>
                      <span className="lp-info__nav-title">{previousLesson.title}</span>
                    </div>
                  </button>
                ) : <div />}
                {nextLesson ? (
                  <button
                    className="lp-info__nav-btn lp-info__nav-btn--next"
                    onClick={() => handleNavigateToLesson(nextLesson)}
                    disabled={!isLessonAccessible(nextLesson)}
                  >
                    <div className="lp-info__nav-text">
                      <span className="lp-info__nav-label">{t('academyLessonPlayer.nextLessonLabel', 'Следващ урок')}</span>
                      <span className="lp-info__nav-title">{nextLesson.title}</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : <div />}
              </div>
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

          {/* Course Progress in Sidebar */}
          {enrollmentStats && (
            <div className="lp-sidebar__stats">
              <div className="lp-sidebar__stats-bar">
                <div
                  className="lp-sidebar__stats-fill"
                  style={{ width: `${enrollmentStats.progressPercentage}%` }}
                ></div>
              </div>
              <span className="lp-sidebar__stats-text">
                {enrollmentStats.completedLessons}/{enrollmentStats.totalLessons} завършени ({enrollmentStats.progressPercentage}%)
              </span>
            </div>
          )}

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
                      const lessonStatus = getLessonStatus(l.id, l.slug);
                      const testPassedForLesson = isTestPassed(l.id, l.slug);
                      const testScore = getTestScore(l.id, l.slug);
                      const earnedCredits = getLessonEarnedCredits(l.id, l.slug);

                      return (
                        <button
                          key={l.id || l.slug}
                          onClick={() => isAccessible && handleNavigateToLesson(l)}
                          className={`lp-sidebar__lesson 
                            ${isActive ? 'lp-sidebar__lesson--active' : ''} 
                            ${!isAccessible ? 'lp-sidebar__lesson--locked' : ''}
                            ${lessonStatus === 'completed' ? 'lp-sidebar__lesson--completed' : ''}
                            ${lessonStatus === 'in_progress' ? 'lp-sidebar__lesson--in-progress' : ''}`}
                          disabled={!isAccessible}
                        >
                          <span className="lp-sidebar__lesson-icon">
                            {!isAccessible ? '🔒' :
                              lessonStatus === 'completed' ? '✅' :
                                lessonStatus === 'in_progress' ? '▶️' :
                                  l.lessonType === 'video' ? '🎬' :
                                    l.lessonType === 'live' ? '🔴' :
                                      l.lessonType === 'text' ? '📖' : '❓'}
                          </span>
                          <span className="lp-sidebar__lesson-title">{l.title}</span>
                          <div className="lp-sidebar__lesson-badges">
                            {l.durationMinutes > 0 && (
                              <span className="lp-sidebar__lesson-duration">{l.durationMinutes}м</span>
                            )}
                            {/* Show test score if passed */}
                            {testPassedForLesson && testScore && (
                              <span className="lp-sidebar__lesson-test-score" title={`Резултат: ${testScore}%`}>
                                {testScore}%
                              </span>
                            )}
                            {/* Show test passed badge if no score */}
                            {testPassedForLesson && !testScore && (
                              <span className="lp-sidebar__lesson-test-passed" title="Тестът е преминат">✓</span>
                            )}
                            {/* Show earned credits */}
                            {earnedCredits > 0 && (
                              <span className="lp-sidebar__lesson-credits" title={`${earnedCredits} кредита`}>
                                🪙{earnedCredits}
                              </span>
                            )}
                          </div>
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
    </>
  );
};

export default AcademyLessonPlayer;