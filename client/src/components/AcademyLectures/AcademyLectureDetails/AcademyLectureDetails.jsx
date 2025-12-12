// src/components/AcademyLectures/AcademyLectureDetails/AcademyLectureDetails.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academyLectureDetails.css';

// Helper - статус на лекция
const getLectureStatus = (lecture) => {
  if (!lecture) return 'unknown';
  if (lecture.status === 'cancelled') return 'cancelled';
  
  const now = new Date();
  const startTime = lecture.scheduledDate ? new Date(lecture.scheduledDate) : null;
  const endTime = lecture.scheduledEndDate ? new Date(lecture.scheduledEndDate) : null;
  
  if (startTime && endTime && now >= startTime && now <= endTime) return 'live';
  if (startTime && !endTime) {
    const duration = lecture.durationMinutes || 60;
    const estimatedEnd = new Date(startTime.getTime() + duration * 60 * 1000);
    if (now >= startTime && now <= estimatedEnd) return 'live';
  }
  if (startTime && now < startTime) return 'upcoming';
  return 'recording';
};

// Helper - форматиране на дата
const formatDate = (dateStr, locale = 'bg-BG') => {
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

// Countdown Hook
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

// Категории цветове
const CATEGORY_COLORS = {
  'Интернет сигурност': { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', icon: '🔒' },
  'Мобилни устройства': { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', icon: '📱' },
  'Дигитална грамотност': { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', icon: '📚' },
  'Социални мрежи': { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', icon: '💬' },
  'Онлайн услуги': { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', icon: '🌐' },
  'Здраве и технологии': { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', icon: '🏥' },
  'default': { primary: '#ff6347', glow: 'rgba(255, 99, 71, 0.4)', icon: '🎓' }
};

export const AcademyLectureDetails = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthentication, profileData } = useAuthContext();
  const { 
    getLectureBySlug, 
    getLectureMaterials,
    registerForLecture,
    unregisterFromLecture,
    isLoading 
  } = useAcademyCourses();

  // State
  const [lecture, setLecture] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  // Countdown за upcoming лекции
  const countdown = useCountdown(lecture?.scheduledDate);

  // Зареждане на данни
  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      try {
        const lectureData = await getLectureBySlug(slug);
        setLecture(lectureData.lecture || lectureData);
        setIsRegistered(lectureData.isRegistered || false);

        // Зареди материали
        const materialsData = await getLectureMaterials(slug);
        setMaterials(materialsData || []);
      } catch (err) {
        console.error('Error loading lecture:', err);
        setError(err.message);
      }
    };

    loadData();
  }, [slug, getLectureBySlug, getLectureMaterials]);

  // Status и category
  const status = useMemo(() => getLectureStatus(lecture), [lecture]);
  const categoryStyle = useMemo(() => {
    if (!lecture) return CATEGORY_COLORS.default;
    return CATEGORY_COLORS[lecture.category] || CATEGORY_COLORS.default;
  }, [lecture]);

  // Handlers
  const handleRegister = useCallback(async () => {
    if (!lecture) return;
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
  }, [lecture, isRegistered, registerForLecture, unregisterFromLecture]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: lecture?.title,
        text: lecture?.shortDescription,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [lecture]);

  // Loading state
  if (isLoading || !lecture) {
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
            {t('academyLectureDetails.error.back', 'Към лекциите')}
          </button>
        </div>
      </div>
    );
  }

  const scheduledDate = formatDate(lecture.scheduledDate);
  const spotsLeft = lecture.maxParticipants ? lecture.maxParticipants - (lecture.registeredCount || 0) : null;
  const totalCredits = (lecture.creditsForAttendance || 0) + (lecture.creditsForTest || 0);

  return (
    <div className="ald" style={{ '--accent-color': categoryStyle.primary, '--accent-glow': categoryStyle.glow }}>
      
      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════ */}
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
          {/* Breadcrumb */}
          <nav className="ald-breadcrumb">
            <Link to="/academy" className="ald-breadcrumb-link">Академия</Link>
            <span className="ald-breadcrumb-sep">›</span>
            <Link to="/academy/lectures" className="ald-breadcrumb-link">Лекции</Link>
            <span className="ald-breadcrumb-sep">›</span>
            <span className="ald-breadcrumb-current">{lecture.title}</span>
          </nav>

          {/* Status Badge */}
          <div className={`ald-status ald-status--${status}`}>
            {status === 'live' && (
              <>
                <span className="ald-status-pulse"></span>
                <span className="ald-status-icon">📡</span>
                <span className="ald-status-text">НА ЖИВО</span>
              </>
            )}
            {status === 'upcoming' && (
              <>
                <span className="ald-status-icon">📅</span>
                <span className="ald-status-text">ПРЕДСТОЯЩА</span>
              </>
            )}
            {status === 'recording' && (
              <>
                <span className="ald-status-icon">📹</span>
                <span className="ald-status-text">ЗАПИС</span>
              </>
            )}
            {status === 'cancelled' && (
              <>
                <span className="ald-status-icon">❌</span>
                <span className="ald-status-text">ОТМЕНЕНА</span>
              </>
            )}
          </div>

          {/* Category */}
          <div className="ald-category">
            <span className="ald-category-icon">{categoryStyle.icon}</span>
            <span className="ald-category-name">{lecture.category}</span>
          </div>

          {/* Title */}
          <h1 className="ald-title">{lecture.title}</h1>

          {/* Description */}
          <p className="ald-description">{lecture.shortDescription}</p>

          {/* Meta Info */}
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
              <span className="ald-meta-label">{lecture.durationMinutes} мин</span>
            </div>
            {lecture.isOnline && (
              <div className="ald-meta-item ald-meta-item--online">
                <span className="ald-meta-icon">🌐</span>
                <span className="ald-meta-label">Онлайн</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="ald-quick-stats">
            <div className="ald-quick-stat">
              <span className="ald-quick-stat-value">{totalCredits}</span>
              <span className="ald-quick-stat-label">🪙 Кредита</span>
            </div>
            {lecture.viewsCount > 0 && (
              <div className="ald-quick-stat">
                <span className="ald-quick-stat-value">{lecture.viewsCount}</span>
                <span className="ald-quick-stat-label">👁️ Гледания</span>
              </div>
            )}
            {lecture.rating && (
              <div className="ald-quick-stat">
                <span className="ald-quick-stat-value">{parseFloat(lecture.rating).toFixed(1)}</span>
                <span className="ald-quick-stat-label">⭐ Рейтинг</span>
              </div>
            )}
            {lecture.registeredCount > 0 && (
              <div className="ald-quick-stat">
                <span className="ald-quick-stat-value">{lecture.registeredCount}</span>
                <span className="ald-quick-stat-label">👥 Записани</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Card */}
        <div className="ald-action-card">
          {status === 'upcoming' && (
            <>
              {/* Countdown */}
              <div className="ald-countdown">
                <div className="ald-countdown-label">Започва след</div>
                <div className="ald-countdown-grid">
                  <div className="ald-countdown-item">
                    <span className="ald-countdown-value">{countdown.days}</span>
                    <span className="ald-countdown-unit">дни</span>
                  </div>
                  <div className="ald-countdown-sep">:</div>
                  <div className="ald-countdown-item">
                    <span className="ald-countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                    <span className="ald-countdown-unit">часа</span>
                  </div>
                  <div className="ald-countdown-sep">:</div>
                  <div className="ald-countdown-item">
                    <span className="ald-countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                    <span className="ald-countdown-unit">мин</span>
                  </div>
                  <div className="ald-countdown-sep">:</div>
                  <div className="ald-countdown-item">
                    <span className="ald-countdown-value">{String(countdown.seconds).padStart(2, '0')}</span>
                    <span className="ald-countdown-unit">сек</span>
                  </div>
                </div>
              </div>

              {/* Spots Left */}
              {spotsLeft !== null && (
                <div className="ald-spots">
                  <div className="ald-spots-bar">
                    <div 
                      className="ald-spots-fill" 
                      style={{ width: `${(lecture.registeredCount / lecture.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                  <div className="ald-spots-text">
                    <span className={spotsLeft < 10 ? 'ald-spots-warning' : ''}>
                      {spotsLeft > 0 ? `Остават ${spotsLeft} места` : 'Няма свободни места'}
                    </span>
                    <span>{lecture.registeredCount}/{lecture.maxParticipants}</span>
                  </div>
                </div>
              )}

              {/* Register Button */}
              <button 
                className={`ald-action-btn ${isRegistered ? 'is-registered' : ''}`}
                onClick={handleRegister}
                disabled={registering || (spotsLeft === 0 && !isRegistered)}
              >
                {registering ? (
                  <span className="ald-action-btn-loading">
                    <span className="ald-btn-spinner"></span>
                    Обработка...
                  </span>
                ) : isRegistered ? (
                  <>
                    <span className="ald-action-btn-icon">✓</span>
                    Записан сте
                  </>
                ) : (
                  <>
                    <span className="ald-action-btn-icon">📝</span>
                    Запиши се безплатно
                  </>
                )}
              </button>

              {isRegistered && (
                <button className="ald-action-btn-secondary" onClick={handleRegister}>
                  Отпиши се
                </button>
              )}
            </>
          )}

          {status === 'live' && (
            <>
              <div className="ald-live-indicator">
                <span className="ald-live-pulse"></span>
                <span className="ald-live-text">Лекцията е в момента!</span>
              </div>
              <a 
                href={lecture.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ald-action-btn ald-action-btn--live"
              >
                <span className="ald-action-btn-icon">📡</span>
                Присъедини се НА ЖИВО
              </a>
            </>
          )}

          {status === 'recording' && (
            <>
              <div className="ald-recording-info">
                <span className="ald-recording-icon">📹</span>
                <span>Достъпен запис</span>
              </div>
              <button className="ald-action-btn ald-action-btn--watch">
                <span className="ald-action-btn-icon">▶️</span>
                Гледай записа
              </button>
            </>
          )}

          {/* Credits Info */}
          <div className="ald-credits-info">
            <div className="ald-credits-row">
              <span>За присъствие</span>
              <span className="ald-credits-value">+{lecture.creditsForAttendance || 0} 🪙</span>
            </div>
            {lecture.hasTest && (
              <div className="ald-credits-row">
                <span>За тест</span>
                <span className="ald-credits-value">+{lecture.creditsForTest || 0} 🪙</span>
              </div>
            )}
            <div className="ald-credits-row ald-credits-total">
              <span>Общо</span>
              <span className="ald-credits-value">+{totalCredits} 🪙</span>
            </div>
          </div>

          {/* Share Button */}
          <button className="ald-share-btn" onClick={handleShare}>
            <span>📤</span> Сподели
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <main className="ald-main">
        <div className="ald-container">
          
          {/* Content Area */}
          <div className="ald-content">
            
            {/* Tabs */}
            <div className="ald-tabs">
              <button 
                className={`ald-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="ald-tab-icon">📋</span>
                <span className="ald-tab-label">Преглед</span>
              </button>
              {status === 'live' && (
                <button 
                  className={`ald-tab ${activeTab === 'live' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('live')}
                >
                  <span className="ald-tab-icon">📡</span>
                  <span className="ald-tab-label">На живо</span>
                  <span className="ald-tab-badge ald-tab-badge--live">LIVE</span>
                </button>
              )}
              {status === 'recording' && lecture.videoUrl && (
                <button 
                  className={`ald-tab ${activeTab === 'video' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('video')}
                >
                  <span className="ald-tab-icon">▶️</span>
                  <span className="ald-tab-label">Видео</span>
                </button>
              )}
              {materials.length > 0 && (
                <button 
                  className={`ald-tab ${activeTab === 'materials' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('materials')}
                >
                  <span className="ald-tab-icon">📁</span>
                  <span className="ald-tab-label">Материали</span>
                  <span className="ald-tab-badge">{materials.length}</span>
                </button>
              )}
              {lecture.hasTest && (
                <button 
                  className={`ald-tab ${activeTab === 'test' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('test')}
                >
                  <span className="ald-tab-icon">📝</span>
                  <span className="ald-tab-label">Тест</span>
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="ald-tab-content">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="ald-overview">
                  {/* Full Description */}
                  <section className="ald-section">
                    <h2 className="ald-section-title">
                      <span className="ald-section-icon">📖</span>
                      Описание
                    </h2>
                    <div className="ald-section-content">
                      <p className="ald-text">{lecture.description || lecture.shortDescription}</p>
                    </div>
                  </section>

                  {/* What You'll Learn */}
                  <section className="ald-section">
                    <h2 className="ald-section-title">
                      <span className="ald-section-icon">🎯</span>
                      Какво ще научите
                    </h2>
                    <div className="ald-learn-grid">
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>Основни понятия и концепции</span>
                      </div>
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>Практически примери и демонстрации</span>
                      </div>
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>Полезни съвети и трикове</span>
                      </div>
                      <div className="ald-learn-item">
                        <span className="ald-learn-icon">✓</span>
                        <span>Отговори на често задавани въпроси</span>
                      </div>
                    </div>
                  </section>

                  {/* Tags */}
                  {lecture.tags && lecture.tags.length > 0 && (
                    <section className="ald-section">
                      <h2 className="ald-section-title">
                        <span className="ald-section-icon">🏷️</span>
                        Тагове
                      </h2>
                      <div className="ald-tags">
                        {lecture.tags.map((tag, index) => (
                          <span key={index} className="ald-tag">#{tag}</span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Live Tab */}
              {activeTab === 'live' && status === 'live' && (
                <div className="ald-live-section">
                  {/* Video Stream Placeholder */}
                  <div className="ald-video-container">
                    <div className="ald-video-placeholder">
                      <div className="ald-video-live-badge">
                        <span className="ald-video-live-dot"></span>
                        НА ЖИВО
                      </div>
                      <div className="ald-video-icon">📡</div>
                      <p>Видео стриймът е в отделен прозорец</p>
                      <a 
                        href={lecture.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ald-video-btn"
                      >
                        Отвори в {lecture.videoProvider === 'youtube' ? 'YouTube' : 'Google Meet'}
                      </a>
                    </div>
                  </div>

                  {/* Chat Placeholder - Firebase */}
                  <div className="ald-chat-container">
                    <div className="ald-chat-header">
                      <h3 className="ald-chat-title">
                        <span>💬</span> Чат на живо
                      </h3>
                      <div className="ald-chat-viewers">
                        <span className="ald-chat-viewers-dot"></span>
                        <span>{lecture.registeredCount || 0} участници</span>
                      </div>
                    </div>
                    <div className="ald-chat-messages">
                      <div className="ald-chat-placeholder">
                        <div className="ald-chat-placeholder-icon">💬</div>
                        <p>Чатът ще бъде активен по време на лекцията</p>
                        <span className="ald-chat-placeholder-hint">Powered by Firebase</span>
                      </div>
                    </div>
                    <div className="ald-chat-input-container">
                      <input 
                        type="text" 
                        className="ald-chat-input" 
                        placeholder="Напишете съобщение..."
                        disabled
                      />
                      <button className="ald-chat-send" disabled>
                        <span>📤</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Tab */}
              {activeTab === 'video' && status === 'recording' && (
                <div className="ald-video-section">
                  <div className="ald-video-player">
                    {lecture.videoUrl ? (
                      <div className="ald-video-embed">
                        <iframe
                          src={lecture.videoUrl.replace('watch?v=', 'embed/')}
                          title={lecture.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="ald-video-placeholder">
                        <div className="ald-video-icon">📹</div>
                        <p>Записът ще бъде достъпен скоро</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Progress */}
                  <div className="ald-video-progress">
                    <div className="ald-video-progress-bar">
                      <div className="ald-video-progress-fill" style={{ width: '0%' }}></div>
                    </div>
                    <div className="ald-video-progress-text">
                      <span>0:00</span>
                      <span>{lecture.durationMinutes}:00</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Materials Tab */}
              {activeTab === 'materials' && (
                <div className="ald-materials-section">
                  <div className="ald-materials-grid">
                    {materials.map((material, index) => (
                      <div key={index} className="ald-material-card">
                        <div className="ald-material-icon">
                          {material.type === 'pdf' && '📄'}
                          {material.type === 'video' && '🎬'}
                          {material.type === 'link' && '🔗'}
                          {material.type === 'document' && '📝'}
                          {!['pdf', 'video', 'link', 'document'].includes(material.type) && '📁'}
                        </div>
                        <div className="ald-material-info">
                          <h4 className="ald-material-title">{material.title}</h4>
                          <p className="ald-material-desc">{material.description}</p>
                          <span className="ald-material-type">{material.type?.toUpperCase()}</span>
                        </div>
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="ald-material-download">
                          <span>⬇️</span>
                        </a>
                      </div>
                    ))}
                  </div>
                  
                  {materials.length === 0 && (
                    <div className="ald-materials-empty">
                      <div className="ald-materials-empty-icon">📁</div>
                      <p>Няма налични материали за тази лекция</p>
                    </div>
                  )}
                </div>
              )}

              {/* Test Tab */}
              {activeTab === 'test' && lecture.hasTest && (
                <div className="ald-test-section">
                  <div className="ald-test-card">
                    <div className="ald-test-header">
                      <div className="ald-test-icon">📝</div>
                      <div className="ald-test-info">
                        <h3>Тест към лекцията</h3>
                        <p>Проверете знанията си и спечелете допълнителни кредити</p>
                      </div>
                    </div>
                    <div className="ald-test-details">
                      <div className="ald-test-detail">
                        <span className="ald-test-detail-label">Кредити</span>
                        <span className="ald-test-detail-value">+{lecture.creditsForTest} 🪙</span>
                      </div>
                      <div className="ald-test-detail">
                        <span className="ald-test-detail-label">Минимум за преминаване</span>
                        <span className="ald-test-detail-value">{lecture.testPassingScore || 70}%</span>
                      </div>
                    </div>
                    <button className="ald-test-btn" disabled={status !== 'recording'}>
                      {status === 'recording' ? (
                        <>
                          <span>🚀</span> Започни теста
                        </>
                      ) : (
                        <>
                          <span>🔒</span> Достъпен след лекцията
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="ald-sidebar">
            
            {/* Lecturer Card */}
            <div className="ald-lecturer-card">
              <div className="ald-lecturer-header">
                <h3 className="ald-lecturer-label">Лектор</h3>
              </div>
              <div className="ald-lecturer-content">
                <div className="ald-lecturer-avatar">
                  {lecture.lecturer?.photoUrl ? (
                    <img src={lecture.lecturer.photoUrl} alt={lecture.lecturer.name} />
                  ) : (
                    <div className="ald-lecturer-avatar-placeholder">👤</div>
                  )}
                  <div className="ald-lecturer-avatar-glow"></div>
                </div>
                <h4 className="ald-lecturer-name">{lecture.lecturer?.name || 'Неизвестен лектор'}</h4>
                {lecture.lecturer?.specialization && (
                  <p className="ald-lecturer-spec">{lecture.lecturer.specialization}</p>
                )}
              </div>
            </div>

            {/* Related Course */}
            {lecture.course && (
              <div className="ald-course-card">
                <div className="ald-course-header">
                  <span className="ald-course-badge">📚 Част от курс</span>
                </div>
                <div className="ald-course-content">
                  <h4 className="ald-course-title">{lecture.course.name}</h4>
                  <Link to={`/academy/courses/${lecture.course.slug}`} className="ald-course-link">
                    Виж курса →
                  </Link>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="ald-info-card">
              <h3 className="ald-info-title">Информация</h3>
              <div className="ald-info-list">
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">📅</span> Дата
                  </span>
                  <span className="ald-info-value">{scheduledDate.short}</span>
                </div>
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">🕐</span> Час
                  </span>
                  <span className="ald-info-value">{scheduledDate.time}</span>
                </div>
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">⏱️</span> Продължителност
                  </span>
                  <span className="ald-info-value">{lecture.durationMinutes} мин</span>
                </div>
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">🌐</span> Формат
                  </span>
                  <span className="ald-info-value">{lecture.isOnline ? 'Онлайн' : 'На място'}</span>
                </div>
                <div className="ald-info-row">
                  <span className="ald-info-label">
                    <span className="ald-info-icon">🎬</span> Тип
                  </span>
                  <span className="ald-info-value">
                    {lecture.lectureType === 'live' ? 'На живо' : 'Запис'}
                  </span>
                </div>
                {lecture.videoProvider && (
                  <div className="ald-info-row">
                    <span className="ald-info-label">
                      <span className="ald-info-icon">📺</span> Платформа
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

      {/* Back Button - Fixed */}
      <button className="ald-back-btn" onClick={() => navigate('/academy/lectures')}>
        <span>←</span>
        <span>Всички лекции</span>
      </button>
    </div>
  );
};

export default AcademyLectureDetails;