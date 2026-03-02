// src/components/AcademyLectures/AcademyLectureWatch/AcademyLectureWatch.jsx

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academyLectureWatch.css';
import AcademyLectureWatchSkeleton from './AcademyLectureWatchSkeleton/AcademyLectureWatchSkeleton';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
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

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeEmbedUrl = (url, autoplay = false) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    ...(autoplay && { autoplay: '1' })
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const formatDuration = (minutes, t) => {
  if (!minutes) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) return `${hrs}${t('academyLectureWatch.meta.hours')} ${mins}${t('academyLectureWatch.meta.mins')}`;
  return `${mins} ${t('academyLectureWatch.meta.minutes')}`;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AcademyLectureWatch = () => {
  const { slug } = useParams();
  const { t } = useTranslation('academy');
  const navigate = useLocalizedNavigate();
  const { isAuthentication, userData } = useAuthContext();
  const { getLectureBySlug, getLectureTestStatus, isLoading } = useAcademyCourses(); // ПРОМЕНЕНО

  // State
  const [lecture, setLecture] = useState(null);
  const [error, setError] = useState(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [testStatus, setTestStatus] = useState(null); // НОВО

  // Refs
  const loadingRef = useRef(false);
  const chatEndRef = useRef(null);

  // Load lecture data
  useEffect(() => {
    if (!slug || loadingRef.current) return;

    const loadLecture = async () => {
      loadingRef.current = true;
      try {
        const response = await getLectureBySlug(slug);
        const lectureData = response.lecture || response;
        setLecture(lectureData);

        // НОВО — зареди тест статус
        if (lectureData.hasTest && isAuthentication) {
          try {
            const status = await getLectureTestStatus(lectureData.id);
            setTestStatus(status);
          } catch (err) {
            setTestStatus(null);
          }
        }
      } catch (err) {
        console.error('Error loading lecture:', err);
        setError(err.message);
      } finally {
        loadingRef.current = false;
      }
    };

    loadLecture();
  }, [slug]);

  // Computed
  const status = useMemo(() => getLectureStatus(lecture), [lecture]);
  const isLive = status === 'live';
  const isYouTube = lecture?.videoProvider === 'youtube';
  const videoUrl = lecture?.videoUrl || lecture?.meetingLink;
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(videoUrl, true) : null;
  const hasVideo = !!embedUrl || !!videoUrl;

  // ПРОМЕНЕНО — ползва реален тест статус
  const hasRealTest = lecture?.hasTest && testStatus?.hasTest && testStatus?.test;
  const testPassed = testStatus?.hasPassedTest;
  const testBestScore = testStatus?.bestAttempt?.score ?? null;
  const canTakeTest = hasRealTest && (testStatus?.testAccessible || testStatus?.totalAttempts > 0);

  // Handlers
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !isAuthentication) return;

    const newMessage = {
      id: Date.now(),
      oderId: userData?.oderId,
      userName: userData?.displayName || t('academyLectureWatch.chat.anonymousUser'),
      userPhoto: userData?.photoURL,
      text: chatInput.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGoToTest = () => {
    navigate(`/academy/lectures/${slug}/test`);
  };

  const handleGoBack = () => {
    navigate(`/academy/lectures/${slug}`);
  };

  // Loading
  if (isLoading && !lecture) {
    return <AcademyLectureWatchSkeleton />;
  }

  // Error
  if (error) {
    return (
      <div className="alw-error">
        <div className="alw-error-icon">⚠️</div>
        <h2>{t('academyLectureWatch.error.title')}</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/academy/lectures')} className="alw-error-btn">
          {t('academyLectureWatch.error.backToList')}
        </button>
      </div>
    );
  }

  // No lecture or no video
  if (!lecture || !hasVideo) {
    return (
      <div className="alw-error">
        <div className="alw-error-icon">📹</div>
        <h2>{t('academyLectureWatch.noVideo.title')}</h2>
        <p>{t('academyLectureWatch.noVideo.description')}</p>
        <button onClick={handleGoBack} className="alw-error-btn">
          {t('academyLectureWatch.noVideo.back')}
        </button>
      </div>
    );
  }

  return (
    <div className={`alw ${isTheaterMode ? 'alw--theater' : ''} ${isLive ? 'alw--live' : ''}`}>
      
      {/* Header */}
      <header className="alw-header">
        <div className="alw-header-left">
          <button className="alw-back-btn" onClick={handleGoBack}>
            <span>←</span>
            <span className="alw-back-text">{t('academyLectureWatch.header.back')}</span>
          </button>
          
          <div className="alw-header-info">
            {isLive && (
              <div className="alw-live-badge">
                <span className="alw-live-dot"></span>
                {t('academyLectureWatch.header.live')}
              </div>
            )}
            <h1 className="alw-title">{lecture.title}</h1>
          </div>
        </div>

        <div className="alw-header-right">
          <button 
            className={`alw-theater-btn ${isTheaterMode ? 'is-active' : ''}`}
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            title={isTheaterMode ? t('academyLectureWatch.header.exitTheater') : t('academyLectureWatch.header.theaterMode')}
          >
            {isTheaterMode ? '⊡' : '⊞'}
          </button>
          
          {isYouTube && videoUrl && (
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="alw-youtube-btn"
              title={t('academyLectureWatch.header.openYoutube')}
            >
              🎬 YouTube
            </a>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="alw-content">
        
        {/* Video Section */}
        <div className="alw-video-section">
          <div className="alw-video-container">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={lecture.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="alw-video-iframe"
              ></iframe>
            ) : (
              <div className="alw-video-placeholder">
                <div className="alw-video-placeholder-icon">📹</div>
                <p>{t('academyLectureWatch.video.unsupportedProvider')}</p>
                {videoUrl && (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="alw-external-btn">
                    {t('academyLectureWatch.video.openExternal')}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Video Info Bar */}
          <div className="alw-video-info">
            <div className="alw-video-meta">
              {lecture.lecturer && (
                <div className="alw-lecturer">
                  {lecture.lecturer.photoUrl && (
                    <img src={lecture.lecturer.photoUrl} alt="" className="alw-lecturer-avatar" />
                  )}
                  <span className="alw-lecturer-name">{lecture.lecturer.name}</span>
                </div>
              )}
              
              <div className="alw-meta-items">
                {lecture.durationMinutes && (
                  <span className="alw-meta-item">
                    ⏱️ {formatDuration(lecture.durationMinutes, t)}
                  </span>
                )}
                {lecture.viewsCount > 0 && (
                  <span className="alw-meta-item">
                    👁️ {lecture.viewsCount} {t('academyLectureWatch.meta.views')}
                  </span>
                )}
                {lecture.category && (
                  <span className="alw-meta-item alw-meta-category">
                    {lecture.category}
                  </span>
                )}
              </div>
            </div>

            {/* Actions — ПРОМЕНЕНО */}
            <div className="alw-video-actions">
              {canTakeTest && (
                <button
                  className={`alw-test-btn ${testPassed ? 'alw-test-btn--passed' : ''}`}
                  onClick={handleGoToTest}
                >
                  <span>{testPassed ? '✅' : '📝'}</span>
                  {testPassed
                    ? `${t('academyLectureWatch.actions.testPassed', 'Преминат')} ${Math.round(testBestScore)}%`
                    : testStatus?.totalAttempts > 0
                      ? t('academyLectureWatch.actions.retakeTest', 'Опитай отново')
                      : t('academyLectureWatch.actions.takeTest', 'Реши теста')}
                  {!testPassed && lecture.creditsForTest > 0 && (
                    <span className="alw-test-credits">+{lecture.creditsForTest} 🪙</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section - Only for LIVE */}
        {isLive && (
          <aside className="alw-chat">
            <div className="alw-chat-header">
              <h3 className="alw-chat-title">
                💬 {t('academyLectureWatch.chat.title')}
              </h3>
              <div className="alw-chat-viewers">
                <span className="alw-chat-viewers-dot"></span>
                {lecture.registeredCount || 0} {t('academyLectureWatch.chat.watching')}
              </div>
            </div>

            <div className="alw-chat-messages">
              {chatMessages.length === 0 ? (
                <div className="alw-chat-empty">
                  <div className="alw-chat-empty-icon">💬</div>
                  <p>{t('academyLectureWatch.chat.empty')}</p>
                  <span className="alw-chat-hint">{t('academyLectureWatch.chat.comingSoon')}</span>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="alw-chat-message">
                      <div className="alw-chat-message-avatar">
                        {msg.userPhoto ? (
                          <img src={msg.userPhoto} alt="" />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="alw-chat-message-content">
                        <span className="alw-chat-message-author">{msg.userName}</span>
                        <p className="alw-chat-message-text">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            <form className="alw-chat-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="alw-chat-input"
                placeholder={
                  isAuthentication 
                    ? t('academyLectureWatch.chat.placeholder')
                    : t('academyLectureWatch.chat.loginRequired')
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={!isAuthentication}
              />
              <button 
                type="submit" 
                className="alw-chat-send"
                disabled={!isAuthentication || !chatInput.trim()}
              >
                📤
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* Description Panel (for recording mode) */}
      {!isLive && (
        <div className="alw-description">
          <div className="alw-description-content">
            <h2>{t('academyLectureWatch.description.about')}</h2>
            <p>{lecture.description || lecture.shortDescription}</p>
            
            {lecture.tags && lecture.tags.length > 0 && (
              <div className="alw-tags">
                {lecture.tags.map((tag, i) => (
                  <span key={i} className="alw-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {lecture.course && (
            <div className="alw-course-card">
              <span className="alw-course-label">📚 {t('academyLectureWatch.course.partOf')}</span>
              <h4 className="alw-course-title">{lecture.course.name}</h4>
              <Link to={`/academy/courses/${lecture.course.slug}`} className="alw-course-link">
                {t('academyLectureWatch.course.viewCourse')} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademyLectureWatch;