import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faUsers, 
    faMapMarkerAlt,
    faCalendarAlt,
    faClock,
    faStar,
    faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import './membershipClubsCard.css';

const MembershipClubsCard = ({ club, onView, isMember }) => {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);

    const handleImageError = (e) => {
        if (!imageError) {
            e.target.src = '/images/placeholder-club.jpg';
            setImageError(true);
        }
    };

    const formatMemberSince = (date) => {
        if (!date) return t('membershipClubsCard.memberSince.unknown');
        const memberDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - memberDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return t('membershipClubsCard.memberSince.days', { count: diffDays });
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return t('membershipClubsCard.memberSince.months', { count: months });
        } else {
            const years = Math.floor(diffDays / 365);
            return t('membershipClubsCard.memberSince.years', { count: years });
        }
    };

    const getActivityLevel = () => {
        const totalActivities = (club.activities?.events?.length || 0) + 
                              (club.activities?.regular?.length || 0) + 
                              (club.activities?.trips?.length || 0) + 
                              (club.activities?.courses?.length || 0);
        
        if (totalActivities >= 10) return { level: 'high', text: t('membershipClubsCard.activity.high'), color: '#10b981' };
        if (totalActivities >= 5) return { level: 'medium', text: t('membershipClubsCard.activity.medium'), color: '#f59e0b' };
        if (totalActivities >= 1) return { level: 'low', text: t('membershipClubsCard.activity.low'), color: '#6b7280' };
        return { level: 'none', text: t('membershipClubsCard.activity.none'), color: '#dc2626' };
    };

    const getCategoryName = (category) => {
        const categoryMap = {
            'general': t('membershipClubsCard.categories.general'),
            'cultural': t('membershipClubsCard.categories.cultural'),
            'traditional': t('membershipClubsCard.categories.traditional'),
            'social': t('membershipClubsCard.categories.social'),
            'sports': t('membershipClubsCard.categories.sports')
        };
        return categoryMap[category] || category;
    };

    const activity = getActivityLevel();

    return (
        <div className="membershipclubscard-wrapper">
            <div className="membershipclubscard-container">
                <div className="membershipclubscard-header">
                    <img
                        src={club.mainImage || club.logo || '/images/placeholder-club.jpg'}
                        alt={club.name}
                        className="membershipclubscard-image"
                        onError={handleImageError}
                    />
                    <div className="membershipclubscard-overlay">
                        <div className="membershipclubscard-actions">
                            <button
                                className="membershipclubscard-action-btn membershipclubscard-action-btn--view"
                                onClick={() => onView(club)}
                                title={t('membershipClubsCard.actions.view')}
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                        </div>
                    </div>

                    {/* Member Badge */}
                    <div className="membershipclubscard-member-badge">
                        <FontAwesomeIcon icon={faUserCheck} />
                        <span>{t('membershipClubsCard.memberBadge')}</span>
                    </div>

                    {/* Status Badge */}
                    <div className={`membershipclubscard-status membershipclubscard-status--${club.status || 'active'}`}>
                        <span>{club.status === 'active' ? t('membershipClubsCard.status.active') : t('membershipClubsCard.status.inactive')}</span>
                    </div>
                </div>
                
                <div className="membershipclubscard-content">
                    <div className="membershipclubscard-title-section">
                        <h3 className="membershipclubscard-title">{club.name}</h3>
                        <div className={`membershipclubscard-category membershipclubscard-category--${club.category || 'general'}`}>
                            {getCategoryName(club.category)}
                        </div>
                    </div>
                    
                    <p className="membershipclubscard-description">
                        {club.shortDescription || t('membershipClubsCard.noDescription')}
                    </p>
                    
                    <div className="membershipclubscard-meta">
                        {club.location?.city && (
                            <div className="membershipclubscard-meta-item">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="membershipclubscard-meta-icon" />
                                <span>{club.location.city}</span>
                            </div>
                        )}
                        
                        <div className="membershipclubscard-meta-item">
                            <FontAwesomeIcon icon={faUsers} className="membershipclubscard-meta-icon" />
                            <span>{t('membershipClubsCard.membersCount', { count: club.membership?.totalMembers || 0 })}</span>
                        </div>

                        <div className="membershipclubscard-meta-item">
                            <FontAwesomeIcon icon={faClock} className="membershipclubscard-meta-icon" />
                            <span>{t('membershipClubsCard.memberFor')} {formatMemberSince(club.memberSince)}</span>
                        </div>
                    </div>

                    <div className="membershipclubscard-footer">
                        <div className="membershipclubscard-activity-level">
                            <div 
                                className="membershipclubscard-activity-dot"
                                style={{ backgroundColor: activity.color }}
                            />
                            <span className="membershipclubscard-activity-text">
                                {activity.text}
                            </span>
                        </div>

                        {club.activities?.events?.length > 0 && (
                            <div className="membershipclubscard-next-event">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>
                                    {t('membershipClubsCard.eventsCount', { count: club.activities.events.length })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipClubsCard;