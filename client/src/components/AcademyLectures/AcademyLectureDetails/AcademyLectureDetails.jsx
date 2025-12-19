// src/components/AcademyLectures/AcademyLectureDetails/AcademyLectureDetails.jsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academyLectureDetails.css';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS (същите като преди)
// ═══════════════════════════════════════════════════════════════════════════

const getLectureStatus = (lecture) => {
  if (!lecture) return 'unknown';
  if (lecture.status === 'cancelled') return 'cancelled';

  const now = new Date();
  const startTime = lecture.scheduledDate ? new Date(lecture.scheduledDate) : null;
  const endTime = lecture.scheduledEndDate ? new Date(lecture.scheduledEndDate) : null;

  if (startTime && endTime && now >= startTime && now <= endTime) return 'live';

  if (startTime && !endTime && lecture.durationMinutes) {
    const estimatedEnd = new Date(startTime.getTime() + lecture.durationMinutes * 60 * 1000);
    if (now >= startTime && now <= estimatedEnd) return 'live';
  }

  if (startTime && now < startTime) return 'upcoming';

  if (lecture.status === 'completed') return 'recording';
  if (lecture.status === 'scheduled' && startTime && now > startTime) return 'recording';

  return 'recording';
};

const formatDate = (dateStr, locale = 'bg-BG') => {
  if (!dateStr) return { full: '', short: '', time: '', iso: '' };
  const date = new Date(dateStr);
  return {
    full: date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    short: date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
    time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    iso: date.toISOString()
  };
};

const getMaterialIcon = (material) => {
  const type = material?.materialType?.toLowerCase() || material?.mimeType?.toLowerCase() || '';
  const name = material?.originalFileName?.toLowerCase() || material?.title?.toLowerCase() || '';

  if (type.includes('pdf') || name.endsWith('.pdf')) return '📄';
  if (type.includes('doc') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
  if (type.includes('video') || type.includes('mp4') || name.endsWith('.mp4')) return '🎬';
  if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️';
  if (type.includes('zip') || type.includes('rar')) return '📦';
  if (type.includes('excel') || type.includes('spreadsheet') || name.endsWith('.xlsx')) return '📊';
  if (type.includes('presentation') || name.endsWith('.pptx')) return '📽️';
  if (type.includes('audio') || name.endsWith('.mp3')) return '🎵';
  if (type.includes('link') || material?.externalUrl) return '🔗';
  return '📁';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const CATEGORY_COLORS = {
  'Интернет сигурност': { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', icon: '🔒' },
  'Мобилни устройства': { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', icon: '📱' },
  'Дигитална грамотност': { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', icon: '📚' },
  'Социални мрежи': { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', icon: '💬' },
  'Онлайн услуги': { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', icon: '🌐' },
  'Здраве и технологии': { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', icon: '🏥' },
  'default': { primary: '#ff6347', glow: 'rgba(255, 99, 71, 0.4)', icon: '🎓' }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AcademyLectureDetails = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthentication } = useAuthContext();
  const {
    getLectureBySlug,
    getLectureMaterials,
    registerForLecture,
    unregisterFromLecture,
    checkLectureRegistration,
    getLectureTestStatus,
    isLoading
  } = useAcademyCourses();

  // State
  const [lecture, setLecture] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS за предотвратяване на дублирани заявки
  // ═══════════════════════════════════════════════════════════════════════════
  const loadingRef = useRef(false);
  const lastSlugRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Countdown за upcoming лекции
  const countdown = useCountdown(lecture?.scheduledDate);

  // ═══════════════════════════════════════════════════════════════════════════
  // ОПТИМИЗИРАН useEffect - само slug като dependency
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Ако няма slug или вече зареждаме за същия slug - изход
    if (!slug) return;
    if (loadingRef.current && lastSlugRef.current === slug) return;

    // Ако slug-ът е същият и данните са заредени - изход
    if (lastSlugRef.current === slug && dataLoaded) return;

    // Отмени предишни заявки
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const loadData = async () => {
      // Маркирай че зареждаме
      loadingRef.current = true;
      lastSlugRef.current = slug;
      setDataLoaded(false);

      try {
        // 1. Зареди лекцията
        const response = await getLectureBySlug(slug);

        // Провери дали заявката е отменена
        if (abortControllerRef.current?.signal.aborted) return;

        const lectureData = response.lecture || response;
        setLecture(lectureData);

        // 2. Паралелни заявки за останалите данни
        const promises = [];

        // Материали
        promises.push(
          getLectureMaterials(slug)
            .then(res => {
              const data = res?.materials || res || [];
              setMaterials(Array.isArray(data) ? data : []);
            })
            .catch(err => {
              console.error('Materials error:', err);
              setMaterials([]);
            })
        );

        // Регистрация (само ако е логнат)
        if (isAuthentication && lectureData.id) {
          promises.push(
            checkLectureRegistration(lectureData.id)
              .then(res => setIsRegistered(res.registered || false))
              .catch(err => console.error('Registration check error:', err))
          );
        }

        // Тест статус (само ако има тест и е логнат)
        if (lectureData.hasTest && isAuthentication) {
          promises.push(
            getLectureTestStatus(lectureData.id)
              .then(res => setTestStatus(res))
              .catch(() => { }) // OK ако няма статус
          );
        }

        // Изчакай всички паралелни заявки
        await Promise.allSettled(promises);

        // Провери дали заявката е отменена
        if (abortControllerRef.current?.signal.aborted) return;

        setDataLoaded(true);

      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) return;
        console.error('Error loading lecture:', err);
        setError(err.message || 'Грешка при зареждане');
      } finally {
        loadingRef.current = false;
      }
    };

    loadData();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [slug]); // ✅ САМО slug като dependency!

  // ═══════════════════════════════════════════════════════════════════════════
  // Отделен useEffect за auth промени (само регистрация и тест статус)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Само ако вече имаме лекция и auth статусът се е променил
    if (!lecture?.id || !dataLoaded) return;

    const updateAuthData = async () => {
      if (isAuthentication) {
        // Провери регистрация
        try {
          const regStatus = await checkLectureRegistration(lecture.id);
          setIsRegistered(regStatus.registered || false);
        } catch (err) {
          console.error('Auth registration check error:', err);
        }

        // Провери тест статус
        if (lecture.hasTest) {
          try {
            const status = await getLectureTestStatus(lecture.id);
            setTestStatus(status);
          } catch (err) {
            // OK
          }
        }
      } else {
        // Logout - reset auth-related state
        setIsRegistered(false);
        setTestStatus(null);
      }
    };

    updateAuthData();
  }, [isAuthentication, lecture?.id]); // Зависи от auth и lecture.id

  // Status и category
  const status = useMemo(() => getLectureStatus(lecture), [lecture]);
  const categoryStyle = useMemo(() => {
    if (!lecture) return CATEGORY_COLORS.default;
    return CATEGORY_COLORS[lecture.category] || CATEGORY_COLORS.default;
  }, [lecture]);

  // Computed values
  const isYouTube = lecture?.videoProvider === 'youtube';
  const hasVideo = lecture?.videoUrl || (isYouTube && lecture?.meetingLink);
  const canWatch = (status === 'live' || status === 'recording') && hasVideo;
  const canTakeTest = lecture?.hasTest && (lecture?.isFree || isRegistered);

  // Handlers
  const handleRegister = useCallback(async () => {
    if (!lecture) return;

    if (!isAuthentication) {
      navigate('/sign-up?view=login');
      return;
    }

    setRegistering(true);
    try {
      if (isRegistered) {
        await unregisterFromLecture(lecture.id);
        setIsRegistered(false);
      } else {
        await registerForLecture(lecture.id);
        setIsRegistered(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setRegistering(false);
    }
  }, [lecture, isRegistered, isAuthentication, registerForLecture, unregisterFromLecture, navigate]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: lecture?.title,
      text: lecture?.shortDescription,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  }, [lecture]);

  const handleWatchLecture = useCallback(() => {
    navigate(`/academy/lectures/${slug}/watch`);
  }, [navigate, slug]);

  const handleStartTest = useCallback(() => {
    navigate(`/academy/lectures/${slug}/test`);
  }, [navigate, slug]);

  // Loading state
  if (isLoading && !lecture) {
    return (
      <div className="ald-loading">
        <div className="ald-loading-content">
          <div className="ald-loading-spinner">
            <div className="ald-loading-ring"></div>
            <div className="ald-loading-ring"></div>
            <div className="ald-loading-ring"></div>
          </div>
          <p className="ald-loading-text">{t('academyLectureDetails.loading', 'Зареждане...')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ald-error">
        <div className="ald-error-content">
          <div className="ald-error-icon">⚠️</div>
          <h2>{t('academyLectureDetails.error.title', 'Грешка')}</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/academy/lectures')} className="ald-error-btn">
            {t('academyLectureDetails.error.back', '← Към лекциите')}
          </button>
        </div>
      </div>
    );
  }

  // No lecture
  if (!lecture) {
    return (
      <div className="ald-error">
        <div className="ald-error-content">
          <div className="ald-error-icon">🔍</div>
          <h2>{t('academyLectureDetails.error.notFound', 'Лекцията не е намерена')}</h2>
          <button onClick={() => navigate('/academy/lectures')} className="ald-error-btn">
            {t('academyLectureDetails.error.back', '← Към лекциите')}
          </button>
        </div>
      </div>
    );
  }

  // Computed values
  const scheduledDate = formatDate(lecture.scheduledDate);
  const spotsLeft = lecture.maxParticipants ? lecture.maxParticipants - (lecture.registeredCount || 0) : null;
  const totalCredits = (lecture.creditsForAttendance || 0) + (lecture.creditsForTest || 0);

  return (
    <div className="ald" style={{ '--accent-color': categoryStyle.primary, '--accent-glow': categoryStyle.glow }}>

      {/* HERO SECTION */}
      <section className="ald-hero">
        <div className="ald-hero-bg">
          {lecture.thumbnailUrl && (
            <img src={lecture.thumbnailUrl} alt="" className="ald-hero-bg-img" />
          )}
          <div className="ald-hero-overlay"></div>
          <div className="ald-hero-gradient"></div>
          <div className="ald-hero-noise"></div>
          <div className="ald-hero-grid"></div>
          <div className="ald-hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="ald-hero-particle" style={{ '--delay': `${i * 0.5}s`, '--x': `${Math.random() * 100}%` }}></div>
            ))}
          </div>
        </div>

        <div className="ald-hero-content">
          <nav className="ald-breadcrumb">
            <Link to="/academy" className="ald-breadcrumb-link">{t('academyLectureDetails.breadcrumb.academy', 'Академия')}</Link>
            <span className="ald-breadcrumb-sep">›</span>
            <Link to="/academy/lectures" className="ald-breadcrumb-link">{t('academyLectureDetails.breadcrumb.lectures', 'Лекции')}</Link>
            <span className="ald-breadcrumb-sep">›</span>
            <span className="ald-breadcrumb-current">{lecture.title}</span>
          </nav>

          <div className={`ald-status ald-status--${status}`}>
            {status === 'live' && (
              <>
                <span className="ald-status-pulse"></span>
                <span className="ald-status-icon">📡</span>
                <span className="ald-status-text">{t('academyLectureDetails.status.live', 'НА ЖИВО')}</span>
              </>
            )}
            {status === 'upcoming' && (
              <>
                <span className="ald-status-icon">📅</span>
                <span className="ald-status-text">{t('academyLectureDetails.status.upcoming', 'ПРЕДСТОЯЩА')}</span>
              </>
            )}
            {status === 'recording' && (
              <>
                <span className="ald-status-icon">📹</span>
                <span className="ald-status-text">{t('academyLectureDetails.status.recording', 'ЗАПИС')}</span>
              </>
            )}
            {status === 'cancelled' && (
              <>
                <span className="ald-status-icon">❌</span>
                <span className="ald-status-text">{t('academyLectureDetails.status.cancelled', 'ОТМЕНЕНА')}</span>
              </>
            )}
          </div>

          <div className="ald-category">
            <span className="ald-category-icon">{categoryStyle.icon}</span>
            <span className="ald-category-name">{lecture.category}</span>
          </div>

          <h1 className="ald-title">{lecture.title}</h1>

          {lecture.shortDescription && (
            <p className="ald-description">{lecture.shortDescription}</p>
          )}

          <div className="ald-meta">
            <div className="ald-meta-item">
              <span className="ald-meta-icon">📆</span>
              <span className="ald-meta-label">{scheduledDate.full}</span>
            </div>
            <div className="ald-meta-item">
              <span className="ald-meta-icon">🕐</span>
              <span className="ald-meta-label">{scheduledDate.time}</span>
            </div>
            <div className="ald-meta-item">
              <span className="ald-meta-icon">⏱️</span>
              <span className="ald-meta-label">{lecture.durationMinutes} {t('academyLectureDetails.meta.minutes', 'мин')}</span>
            </div>
            {lecture.isOnline && (
              <div className="ald-meta-item ald-meta-item--online">
                <span className="ald-meta-icon">🌐</span>
                <span className="ald-meta-label">{t('academyLectureDetails.meta.online', 'Онлайн')}</span>
              </div>
            )}
          </div>

          <div className="ald-quick-stats">
            <div className="ald-quick-stat">
              <span className="ald-quick-stat-value">{totalCredits}</span>
              <span className="ald-quick-stat-label">🪙 {t('academyLectureDetails.stats.credits', 'Кредита')}</span>
            </div>
            {lecture.viewsCount > 0 && (
              <div className="ald-quick-stat">
                <span className="ald-quick-stat-value">{lecture.viewsCount}</span>
                <span className="ald-quick-stat-label">👁️ {t('academyLectureDetails.stats.views', 'Гледания')}</span>
              </div>
            )}
            {lecture.rating && (
              <div className="ald-quick-stat">
                <span className="ald-quick-stat-value">{parseFloat(lecture.rating).toFixed(1)}</span>
                <span className="ald-quick-stat-label">⭐ {t('academyLectureDetails.stats.rating', 'Рейтинг')}</span>
              </div>
            )}
            {lecture.registeredCount > 0 && (
              <div className="ald-quick-stat">
                <span className="ald-quick-stat-value">{lecture.registeredCount}</span>
                <span className="ald-quick-stat-label">👥 {t('academyLectureDetails.stats.registered', 'Записани')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Card */}
        <div className="ald-action-card">
          {status === 'upcoming' && (
            <>
              {countdown.total > 0 && (
                <div className="ald-countdown">
                  <div className="ald-countdown-label">{t('academyLectureDetails.countdown.startsIn', 'Започва след')}</div>
                  <div className="ald-countdown-grid">
                    <div className="ald-countdown-item">
                      <span className="ald-countdown-value">{countdown.days}</span>
                      <span className="ald-countdown-unit">{t('academyLectureDetails.countdown.days', 'дни')}</span>
                    </div>
                    <div className="ald-countdown-sep">:</div>
                    <div className="ald-countdown-item">
                      <span className="ald-countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                      <span className="ald-countdown-unit">{t('academyLectureDetails.countdown.hours', 'часа')}</span>
                    </div>
                    <div className="ald-countdown-sep">:</div>
                    <div className="ald-countdown-item">
                      <span className="ald-countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                      <span className="ald-countdown-unit">{t('academyLectureDetails.countdown.minutes', 'мин')}</span>
                    </div>
                    <div className="ald-countdown-sep">:</div>
                    <div className="ald-countdown-item">
                      <span className="ald-countdown-value">{String(countdown.seconds).padStart(2, '0')}</span>
                      <span className="ald-countdown-unit">{t('academyLectureDetails.countdown.seconds', 'сек')}</span>
                    </div>
                  </div>
                </div>
              )}

              {spotsLeft !== null && lecture.maxParticipants > 0 && (
                <div className="ald-spots">
                  <div className="ald-spots-bar">
                    <div
                      className="ald-spots-fill"
                      style={{ width: `${Math.min((lecture.registeredCount / lecture.maxParticipants) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="ald-spots-text">
                    <span className={spotsLeft < 10 ? 'ald-spots-warning' : ''}>
                      {spotsLeft > 0
                        ? t('academyLectureDetails.spots.remaining', 'Остават {{count}} места', { count: spotsLeft })
                        : t('academyLectureDetails.spots.full', 'Няма свободни места')}
                    </span>
                    <span>{lecture.registeredCount}/{lecture.maxParticipants}</span>
                  </div>
                </div>
              )}

              <button
                className={`ald-action-btn ${isRegistered ? 'is-registered' : ''}`}
                onClick={handleRegister}
                disabled={registering || (spotsLeft === 0 && !isRegistered)}
              >
                {registering ? (
                  <span className="ald-action-btn-loading">
                    <span className="ald-btn-spinner"></span>
                    {t('academyLectureDetails.registration.processing', 'Обработка...')}
                  </span>
                ) : isRegistered ? (
                  <>
                    <span className="ald-action-btn-icon">✓</span>
                    {t('academyLectureDetails.registration.registered', 'Записан сте')}
                  </>
                ) : (
                  <>
                    <span className="ald-action-btn-icon">📝</span>
                    {t('academyLectureDetails.registration.signUp', 'Запиши се безплатно')}
                  </>
                )}
              </button>

              {isRegistered && (
                <button className="ald-action-btn-secondary" onClick={handleRegister} disabled={registering}>
                  {t('academyLectureDetails.registration.unregister', 'Отпиши се')}
                </button>
              )}
            </>
          )}

          {status === 'live' && (
            <>
              <div className="ald-live-indicator">
                <span className="ald-live-pulse"></span>
                <span className="ald-live-text">{t('academyLectureDetails.live.happening', 'Лекцията е в момента!')}</span>
              </div>

              {canWatch ? (
                <button
                  className="ald-action-btn ald-action-btn--live"
                  onClick={handleWatchLecture}
                >
                  <span className="ald-action-btn-icon">▶️</span>
                  {t('academyLectureDetails.live.watchNow', 'Гледай НА ЖИВО')}
                </button>
              ) : lecture.meetingLink && (
                <a
                  href={lecture.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ald-action-btn ald-action-btn--live"
                >
                  <span className="ald-action-btn-icon">📡</span>
                  {t('academyLectureDetails.live.joinNow', 'Присъедини се НА ЖИВО')}
                </a>
              )}

              {isYouTube && lecture.meetingLink && (
                <a
                  href={lecture.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ald-action-btn-secondary ald-action-btn-youtube"
                >
                  <span>🎬</span> {t('academyLectureDetails.live.openYoutube', 'Отвори в YouTube')}
                </a>
              )}
            </>
          )}

          {status === 'recording' && (
            <>
              <div className="ald-recording-info">
                <span className="ald-recording-icon">📹</span>
                <span>
                  {hasVideo
                    ? t('academyLectureDetails.recording.available', 'Достъпен запис')
                    : t('academyLectureDetails.recording.processing', 'Записът се обработва')}
                </span>
              </div>

              {canWatch && (
                <>
                  <button
                    className="ald-action-btn ald-action-btn--watch"
                    onClick={handleWatchLecture}
                  >
                    <span className="ald-action-btn-icon">▶️</span>
                    {t('academyLectureDetails.recording.watch', 'Гледай записа')}
                  </button>

                  {isYouTube && (
                    <a
                      href={lecture.meetingLink || lecture.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ald-action-btn-secondary ald-action-btn-youtube"
                    >
                      <span>🎬</span> {t('academyLectureDetails.live.openYoutube', 'Отвори в YouTube')}
                    </a>
                  )}
                </>
              )}

              {lecture.hasTest && (
                <button
                  className="ald-action-btn-secondary ald-action-btn-test"
                  onClick={handleStartTest}
                  disabled={!canTakeTest}
                >
                  <span>📝</span>
                  {testStatus?.completed
                    ? t('academyLectureDetails.test.viewResults', 'Виж резултата')
                    : t('academyLectureDetails.test.takeTest', 'Реши теста')}
                </button>
              )}
            </>
          )}

          <div className="ald-credits-info">
            <div className="ald-credits-row">
              <span>{t('academyLectureDetails.credits.forAttendance', 'За присъствие')}</span>
              <span className="ald-credits-value">+{lecture.creditsForAttendance || 0} 🪙</span>
            </div>
            {lecture.hasTest && (
              <div className="ald-credits-row">
                <span>{t('academyLectureDetails.credits.forTest', 'За тест')}</span>
                <span className="ald-credits-value">+{lecture.creditsForTest || 0} 🪙</span>
              </div>
            )}
            <div className="ald-credits-row ald-credits-total">
              <span>{t('academyLectureDetails.credits.total', 'Общо')}</span>
              <span className="ald-credits-value">+{totalCredits} 🪙</span>
            </div>
          </div>

          <button className="ald-share-btn" onClick={handleShare}>
            <span>📤</span> {t('academyLectureDetails.actions.share', 'Сподели')}
          </button>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="ald-main">
        <div className="ald-container">
          <div className="ald-content">
            <div className="ald-tabs">
              <button
                className={`ald-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="ald-tab-icon">📋</span>
                <span className="ald-tab-label">{t('academyLectureDetails.tabs.overview', 'Преглед')}</span>
              </button>

              {materials.length > 0 && (
                <button
                  className={`ald-tab ${activeTab === 'materials' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('materials')}
                >
                  <span className="ald-tab-icon">📁</span>
                  <span className="ald-tab-label">{t('academyLectureDetails.tabs.materials', 'Материали')}</span>
                  <span className="ald-tab-badge">{materials.length}</span>
                </button>
              )}

              {lecture.hasTest && (
                <button
                  className={`ald-tab ${activeTab === 'test' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('test')}
                >
                  <span className="ald-tab-icon">📝</span>
                  <span className="ald-tab-label">{t('academyLectureDetails.tabs.test', 'Тест')}</span>
                  {testStatus?.completed && (
                    <span className={`ald-tab-badge ${testStatus.passed ? 'ald-tab-badge--passed' : 'ald-tab-badge--failed'}`}>
                      {testStatus.score}%
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="ald-tab-content">
              {activeTab === 'overview' && (
                <div className="ald-overview">
                  <section className="ald-section">
                    <h2 className="ald-section-title">
                      <span className="ald-section-icon">📖</span>
                      {t('academyLectureDetails.overview.description', 'Описание')}
                    </h2>
                    <div className="ald-section-content">
                      <p className="ald-text" style={{ whiteSpace: 'pre-line' }}>
                        {lecture.description || lecture.shortDescription}
                      </p>
                    </div>
                  </section>

                  <section className="ald-section">
                    <h2 className="ald-section-title">
                      <span className="ald-section-icon">🎯</span>
                      {t('academyLectureDetails.overview.whatYouLearn', 'Какво ще научите')}
                    </h2>
                    <div className="ald-learn-grid">
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>{t('academyLectureDetails.overview.learn1', 'Основни понятия и концепции')}</span>
                      </div>
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>{t('academyLectureDetails.overview.learn2', 'Практически примери и демонстрации')}</span>
                      </div>
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>{t('academyLectureDetails.overview.learn3', 'Полезни съвети и трикове')}</span>
                      </div>
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>{t('academyLectureDetails.overview.learn4', 'Отговори на често задавани въпроси')}</span>
                      </div>
                    </div>
                  </section>

                  {lecture.tags && lecture.tags.length > 0 && (
                    <section className="ald-section">
                      <h2 className="ald-section-title">
                        <span className="ald-section-icon">🏷️</span>
                        {t('academyLectureDetails.overview.tags', 'Тагове')}
                      </h2>
                      <div className="ald-tags">
                        {lecture.tags.map((tag, index) => (
                          <span key={index} className="ald-tag">#{tag}</span>
                        ))}
                      </div>
                    </section>
                  )}

                  {(canWatch || canTakeTest) && (
                    <section className="ald-section">
                      <h2 className="ald-section-title">
                        <span className="ald-section-icon">⚡</span>
                        {t('academyLectureDetails.overview.quickActions', 'Бързи действия')}
                      </h2>
                      <div className="ald-quick-actions">
                        {canWatch && (
                          <button className="ald-quick-action" onClick={handleWatchLecture}>
                            <span className="ald-quick-action-icon">▶️</span>
                            <span className="ald-quick-action-text">
                              {status === 'live'
                                ? t('academyLectureDetails.quickActions.watchLive', 'Гледай на живо')
                                : t('academyLectureDetails.quickActions.watchRecording', 'Гледай записа')}
                            </span>
                          </button>
                        )}
                        {canTakeTest && (
                          <button className="ald-quick-action" onClick={handleStartTest}>
                            <span className="ald-quick-action-icon">📝</span>
                            <span className="ald-quick-action-text">
                              {testStatus?.completed
                                ? t('academyLectureDetails.quickActions.retakeTest', 'Опитай теста отново')
                                : t('academyLectureDetails.quickActions.takeTest', 'Реши теста')}
                            </span>
                          </button>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="ald-materials-section">
                  {materials.length > 0 ? (
                    <div className="ald-materials-grid">
                      {materials.map((material, idx) => (
                        <a
                          key={material.id || idx}
                          href={material.fileUrl || material.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`ald-material-card ${material.isRequired ? 'ald-material-card--required' : ''}`}
                          download={material.isDownloadable !== false && material.fileUrl ? (material.originalFileName || material.title || 'download') : undefined}
                          style={{ '--delay': `${idx * 0.05}s` }}
                        >
                          <div className="ald-material-icon">
                            {getMaterialIcon(material)}
                          </div>
                          <div className="ald-material-info">
                            <div className="ald-material-header">
                              <h4 className="ald-material-title">
                                {material.title || material.originalFileName || 'Материал'}
                              </h4>
                              {material.isRequired && (
                                <span className="ald-material-required-badge">
                                  {t('academyLectureDetails.materials.required', 'Задължителен')}
                                </span>
                              )}
                            </div>
                            {material.description && (
                              <p className="ald-material-desc">{material.description}</p>
                            )}
                            <div className="ald-material-meta">
                              {material.materialType && (
                                <span className="ald-material-type">
                                  {material.materialType.toUpperCase()}
                                </span>
                              )}
                              {material.fileSize && (
                                <span className="ald-material-size">
                                  {formatFileSize(material.fileSize)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ald-material-action">
                            <div className="ald-material-download-icon">
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
                  ) : (
                    <div className="ald-materials-empty">
                      <div className="ald-materials-empty-icon">📁</div>
                      <p>{t('academyLectureDetails.materials.empty', 'Няма налични материали за тази лекция')}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'test' && lecture.hasTest && (
                <div className="ald-test-section">
                  <div className="ald-test-card">
                    <div className="ald-test-header">
                      <div className="ald-test-icon">📝</div>
                      <div className="ald-test-info">
                        <h3>{t('academyLectureDetails.test.title', 'Тест към лекцията')}</h3>
                        <p>{t('academyLectureDetails.test.description', 'Проверете знанията си и спечелете допълнителни кредити')}</p>
                      </div>
                    </div>

                    <div className="ald-test-details">
                      <div className="ald-test-detail">
                        <span className="ald-test-detail-label">{t('academyLectureDetails.test.credits', 'Кредити')}</span>
                        <span className="ald-test-detail-value">+{lecture.creditsForTest || 0} 🪙</span>
                      </div>
                      <div className="ald-test-detail">
                        <span className="ald-test-detail-label">{t('academyLectureDetails.test.passingScore', 'Минимум за преминаване')}</span>
                        <span className="ald-test-detail-value">{lecture.testPassingScore || 70}%</span>
                      </div>
                      {lecture.testTimeLimit && (
                        <div className="ald-test-detail">
                          <span className="ald-test-detail-label">{t('academyLectureDetails.test.timeLimit', 'Време')}</span>
                          <span className="ald-test-detail-value">{lecture.testTimeLimit} {t('academyLectureDetails.meta.minutes', 'мин')}</span>
                        </div>
                      )}
                    </div>

                    {testStatus?.completed && (
                      <div className={`ald-test-result ${testStatus.passed ? 'passed' : 'failed'}`}>
                        <div className="ald-test-result-icon">
                          {testStatus.passed ? '🎉' : '😔'}
                        </div>
                        <div className="ald-test-result-info">
                          <span className="ald-test-result-label">{t('academyLectureDetails.test.yourScore', 'Вашият резултат')}</span>
                          <span className="ald-test-result-value">
                            {testStatus.score}%
                          </span>
                        </div>
                        {testStatus.passed && (
                          <div className="ald-test-result-credits">
                            +{lecture.creditsForTest || 0} 🪙
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      className="ald-test-btn"
                      disabled={!canTakeTest}
                      onClick={handleStartTest}
                    >
                      {canTakeTest ? (
                        testStatus?.completed ? (
                          <>
                            <span>🔄</span> {t('academyLectureDetails.test.retake', 'Опитай отново')}
                          </>
                        ) : (
                          <>
                            <span>🚀</span> {t('academyLectureDetails.test.start', 'Започни теста')}
                          </>
                        )
                      ) : (
                        <>
                          <span>🔒</span> {t('academyLectureDetails.test.locked', 'Достъпен след лекцията')}
                        </>
                      )}
                    </button>

                    {!canTakeTest && (
                      <p className="ald-test-hint">
                        {lecture?.isFree
                          ? t('academyLectureDetails.test.hintFree', 'Тестът ще бъде достъпен скоро.')
                          : t('academyLectureDetails.test.hintRegister', 'Запишете се за лекцията, за да получите достъп до теста.')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="ald-sidebar">
            {lecture.lecturer && (
              <div className="ald-lecturer-card">
                <div className="ald-lecturer-header">
                  <h3 className="ald-lecturer-label">{t('academyLectureDetails.lecturer.title', 'Лектор')}</h3>
                </div>
                <div className="ald-lecturer-content">
                  <div className="ald-lecturer-avatar">
                    {lecture.lecturer.photoUrl ? (
                      <img src={lecture.lecturer.photoUrl} alt={lecture.lecturer.name} />
                    ) : (
                      <div className="ald-lecturer-avatar-placeholder">👤</div>
                    )}
                    <div className="ald-lecturer-avatar-glow"></div>
                  </div>
                  <h4 className="ald-lecturer-name">{lecture.lecturer.name}</h4>
                  {lecture.lecturer.specialization && (
                    <p className="ald-lecturer-spec">{lecture.lecturer.specialization}</p>
                  )}
                </div>
              </div>
            )}

            {lecture.course && (
              <div className="ald-course-card">
                <div className="ald-course-header">
                  <span className="ald-course-badge">📚 {t('academyLectureDetails.course.partOf', 'Част от курс')}</span>
                </div>
                <div className="ald-course-content">
                  <h4 className="ald-course-title">{lecture.course.name}</h4>
                  <Link to={`/academy/courses/${lecture.course.slug}`} className="ald-course-link">
                    {t('academyLectureDetails.course.viewCourse', 'Виж курса')} →
                  </Link>
                </div>
              </div>
            )}

            <div className="ald-info-card">
              <h3 className="ald-info-title">{t('academyLectureDetails.info.title', 'Информация')}</h3>
              <div className="ald-info-list">
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">📅</span> {t('academyLectureDetails.info.date', 'Дата')}
                  </span>
                  <span className="ald-info-value">{scheduledDate.short}</span>
                </div>
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">🕐</span> {t('academyLectureDetails.info.time', 'Час')}
                  </span>
                  <span className="ald-info-value">{scheduledDate.time}</span>
                </div>
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">⏱️</span> {t('academyLectureDetails.info.duration', 'Продължителност')}
                  </span>
                  <span className="ald-info-value">{lecture.durationMinutes} {t('academyLectureDetails.meta.minutes', 'мин')}</span>
                </div>
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">🌐</span> {t('academyLectureDetails.info.format', 'Формат')}
                  </span>
                  <span className="ald-info-value">
                    {lecture.isOnline
                      ? t('academyLectureDetails.info.online', 'Онлайн')
                      : t('academyLectureDetails.info.onsite', 'На място')}
                  </span>
                </div>
                {lecture.videoProvider && (
                  <div className="ald-info-row">
                    <span className="ald-info-label">
                      <span className="ald-info-icon">📺</span> {t('academyLectureDetails.info.platform', 'Платформа')}
                    </span>
                    <span className="ald-info-value">
                      {lecture.videoProvider === 'youtube' && 'YouTube'}
                      {lecture.videoProvider === 'google_meet' && 'Google Meet'}
                      {lecture.videoProvider === 'zoom' && 'Zoom'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <button className="ald-back-btn" onClick={() => navigate('/academy/lectures')}>
        <span>←</span>
        <span>{t('academyLectureDetails.actions.backToLectures', 'Всички лекции')}</span>
      </button>
    </div>
  );
};

export default AcademyLectureDetails;