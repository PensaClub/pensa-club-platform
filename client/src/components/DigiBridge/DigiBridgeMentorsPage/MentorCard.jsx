import { useTranslation } from 'react-i18next';
import './mentorCard.css';

export const MentorCard = ({ mentor, index, onViewProfile }) => {
  const { t } = useTranslation();

  const isImageRight = index % 2 !== 0;
  const isAvailable = mentor.isOnline;

  return (
    <div className={`mentor-full-section ${isImageRight ? 'image-right' : 'image-left'}`}>

      {/* IMAGE SIDE */}
      <div className="mentor-section-image">
        <div className="mentor-image-background">
          <div className="mentor-image-frame">
            <img
              src={mentor.photoUrl}
              alt={`${mentor.name} - ${mentor.specialization} ${t('digiBridge.mentorsPage.card.mentor')}`}
            />
          </div>

          {/* Badge */}
          <div className={`mentor-section-badge ${isAvailable ? 'available' : 'busy'}`}>
            {isAvailable && <span className="mentor-section-badge-dot"></span>}
            {t(`digiBridge.mentorsPage.card.${isAvailable ? 'available' : 'busy'}`)}
          </div>
        </div>
      </div>

      {/* CONTENT SIDE */}
      <div className="mentor-section-content">

        <h2 className="mentor-section-name">{mentor.name}</h2>
        <p className="mentor-section-age">{mentor.age} {t('digiBridge.mentorsPage.card.years')}</p>

        <div className="mentor-section-specialization">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>{mentor.specialization}</span>
        </div>

        <p className="mentor-section-bio">{mentor.bio}</p>

        {/* Stats Row */}
        <div className="mentor-section-stats">
          <div className="mentor-section-stat">
            <div className="mentor-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="mentor-stat-info">
              <span className="mentor-stat-number">{mentor.studentsCount}</span>
              <span className="mentor-stat-label">{t('digiBridge.mentorsPage.card.students')}</span>
            </div>
          </div>

          <div className="mentor-section-stat">
            <div className="mentor-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="mentor-stat-info">
              <span className="mentor-stat-number">{parseInt(mentor.reviewsAvgRating || 0).toFixed(1)}</span>
              <span className="mentor-stat-label">{t('digiBridge.mentorsPage.card.rating')}</span>
            </div>
          </div>

          <div className="mentor-section-stat">
            <div className="mentor-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="mentor-stat-info">
              <span className="mentor-stat-number">{mentor.experience}</span>
              <span className="mentor-stat-label">{t('digiBridge.mentorsPage.card.experience')}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className="mentor-section-button"
          onClick={onViewProfile}
        >
          <span>{t('digiBridge.mentorsPage.card.viewProfile')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </div>
  );
};