// src/components/AcademyLectures/AcademyLectureDetails/components/LectureActionCard.jsx

import { useState, useEffect } from 'react';

// Countdown Hook
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

export const LectureActionCard = ({ lecture, status, isRegistered, onRegister, onShare, isLoading, t }) => {
  const countdown = useCountdown(lecture.scheduledDate);
  const spotsLeft = lecture.maxParticipants ? lecture.maxParticipants - (lecture.registeredCount || 0) : null;
  const totalCredits = (lecture.creditsForAttendance || 0) + (lecture.creditsForTest || 0);

  return (
    <div className="ald-action-card">
      
      {/* UPCOMING - Countdown + Register */}
      {status === 'upcoming' && (
        <>
          <div className="ald-countdown">
            <div className="ald-countdown-label">Започва след</div>
            <div className="ald-countdown-grid">
              <div className="ald-countdown-item">
                <span className="ald-countdown-value">{countdown.days}</span>
                <span className="ald-countdown-unit">дни</span>
              </div>
              <span className="ald-countdown-sep">:</span>
              <div className="ald-countdown-item">
                <span className="ald-countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="ald-countdown-unit">часа</span>
              </div>
              <span className="ald-countdown-sep">:</span>
              <div className="ald-countdown-item">
                <span className="ald-countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="ald-countdown-unit">мин</span>
              </div>
              <span className="ald-countdown-sep">:</span>
              <div className="ald-countdown-item">
                <span className="ald-countdown-value">{String(countdown.seconds).padStart(2, '0')}</span>
                <span className="ald-countdown-unit">сек</span>
              </div>
            </div>
          </div>

          {spotsLeft !== null && (
            <div className="ald-spots">
              <div className="ald-spots-bar">
                <div className="ald-spots-fill" style={{ width: `${(lecture.registeredCount / lecture.maxParticipants) * 100}%` }}></div>
              </div>
              <div className="ald-spots-text">
                <span className={spotsLeft < 10 ? 'ald-spots-warning' : ''}>
                  {spotsLeft > 0 ? `Остават ${spotsLeft} места` : 'Няма свободни места'}
                </span>
                <span>{lecture.registeredCount}/{lecture.maxParticipants}</span>
              </div>
            </div>
          )}

          <button 
            className={`ald-action-btn ${isRegistered ? 'is-registered' : ''}`}
            onClick={onRegister}
            disabled={isLoading || (spotsLeft === 0 && !isRegistered)}
          >
            {isLoading ? (
              <><span className="ald-btn-spinner"></span> Обработка...</>
            ) : isRegistered ? (
              <>✓ Записан сте</>
            ) : (
              <>📝 Запиши се безплатно</>
            )}
          </button>

          {isRegistered && (
            <button className="ald-action-btn-secondary" onClick={onRegister}>
              Отпиши се
            </button>
          )}
        </>
      )}

      {/* LIVE - Join Button */}
      {status === 'live' && (
        <>
          <div className="ald-live-indicator">
            <span className="ald-live-pulse"></span>
            <span>Лекцията е в момента!</span>
          </div>
          <a 
            href={lecture.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ald-action-btn ald-action-btn--live"
          >
            📡 Присъедини се НА ЖИВО
          </a>
        </>
      )}

      {/* RECORDING - Watch Button */}
      {status === 'recording' && (
        <>
          <div className="ald-recording-info">
            <span>📹</span>
            <span>Достъпен запис</span>
          </div>
          <button className="ald-action-btn ald-action-btn--watch">
            ▶️ Гледай записа
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

      {/* Share */}
      <button className="ald-share-btn" onClick={onShare}>
        📤 Сподели
      </button>
    </div>
  );
};