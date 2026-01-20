import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, Users, MapPin, ArrowRight } from 'lucide-react';
import './studentUpcomingEvents.css';

const StudentUpcomingEvents = ({ events = [] }) => {
  const { t } = useTranslation();

  const getEventIcon = (type) => {
    switch (type) {
      case 'lecture':
        return <Video className="sue-event-type-icon" />;
      case 'seminar':
        return <Users className="sue-event-type-icon" />;
      default:
        return <Calendar className="sue-event-type-icon" />;
    }
  };

  const getEventTypeLabel = (type) => {
    return t(`studentUpcomingEvents.types.${type}`, type);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (dateString) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffMs = eventDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) return t('studentUpcomingEvents.started');
    if (diffDays === 0) {
      if (diffHours === 0) return t('studentUpcomingEvents.soon');
      return t('studentUpcomingEvents.hoursLeft', { hours: diffHours });
    }
    if (diffDays === 1) return t('studentUpcomingEvents.tomorrow');
    return t('studentUpcomingEvents.daysLeft', { days: diffDays });
  };

  const isLive = (dateString) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffMs = now - eventDate;
    return diffMs >= 0 && diffMs < 2 * 60 * 60 * 1000; // в рамките на 2 часа
  };

  if (!events || events.length === 0) {
    return (
      <div className="sue-container">
        <div className="sue-header">
          <h3 className="sue-title">
            <Calendar className="sue-title-icon" />
            {t('studentUpcomingEvents.title')}
          </h3>
        </div>
        <div className="sue-empty">
          <Calendar className="sue-empty-icon" />
          <p className="sue-empty-text">{t('studentUpcomingEvents.noEvents')}</p>
          <Link to="/academy/lectures" className="sue-empty-link">
            {t('studentUpcomingEvents.browseLectures')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sue-container">
      <div className="sue-header">
        <h3 className="sue-title">
          <Calendar className="sue-title-icon" />
          {t('studentUpcomingEvents.title')}
        </h3>
        <Link to="/academy/my/schedule" className="sue-view-all">
          {t('studentUpcomingEvents.viewAll')}
          <ArrowRight className="sue-view-all-icon" />
        </Link>
      </div>

      <div className="sue-list">
        {events.slice(0, 4).map((event) => (
          <Link
            key={event.id}
            to={`/academy/${event.type === 'lecture' ? 'lectures' : 'seminars'}/${event.slug}`}
            className={`sue-event ${isLive(event.scheduled_at) ? 'sue-event-live' : ''}`}
          >
            {isLive(event.scheduled_at) && (
              <span className="sue-live-badge">
                <span className="sue-live-dot"></span>
                LIVE
              </span>
            )}

            <div className="sue-event-type">
              {getEventIcon(event.type)}
              <span className="sue-event-type-label">{getEventTypeLabel(event.type)}</span>
            </div>

            <h4 className="sue-event-title">{event.title}</h4>

            <div className="sue-event-meta">
              <span className="sue-event-date">
                <Calendar className="sue-meta-icon" />
                {formatDate(event.scheduled_at)}
              </span>
              <span className="sue-event-time">
                <Clock className="sue-meta-icon" />
                {formatTime(event.scheduled_at)}
              </span>
              {event.location && (
                <span className="sue-event-location">
                  <MapPin className="sue-meta-icon" />
                  {event.location}
                </span>
              )}
            </div>

            <span className="sue-event-countdown">{getTimeUntil(event.scheduled_at)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentUpcomingEvents;