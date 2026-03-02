import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers,
  faCalendarAlt,
  faMapMarkerAlt,
  faAward,
  faHeart,
  faHandshake,
  faGem,
  faCrown,
  faLeaf,
  faTree,
  faStar,
  faQuoteLeft,
  faHistory,
  faEye,
  faLightbulb,
  faChurch,
  faGlobe,
  faListCheck
} from '@fortawesome/free-solid-svg-icons';
import './traditionalAbout.css';

export const TraditionalAbout = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');

  if (!club?.name) {
    return null;
  }

  const hasBasicInfo = club.fullDescription || club.shortDescription;
  
  const getAboutStats = () => {
    const stats = [];
    if (club.membership?.totalMembers) {
      stats.push({
        icon: faUsers,
        label: t('clubs.TraditionalAbout.stats.activeMembers'),
        value: club.membership.totalMembers,
        color: '#dc2626'
      });
    }
    if (club.foundedYear) {
      const yearsActive = new Date().getFullYear() - club.foundedYear;
      stats.push({
        icon: faCalendarAlt,
        label: t('clubs.TraditionalAbout.stats.yearsTradition'),
        value: yearsActive,
        color: '#d97706'
      });
    }
    if (club.stats?.programs) {
      stats.push({
        icon: faListCheck,
        label: t('clubs.TraditionalAbout.stats.programs'),
        value: club.stats.programs,
        color: '#059669'
      });
    }
    if (club.stats?.events) {
      stats.push({
        icon: faAward,
        label: t('clubs.TraditionalAbout.stats.eventsYearly'),
        value: club.stats.events,
        color: '#7c3aed'
      });
    }
    return stats;
  };

  const aboutStats = getAboutStats();
  const ageGroups = club.membership?.ageGroups;
  const hasAgeGroups = ageGroups && Object.keys(ageGroups).length > 0;
  const benefits = club.membership?.benefits || [];
  const requirements = club.membership?.requirements || [];
  const achievements = club.achievements?.awards || [];
  const recognitions = club.achievements?.recognitions || [];
  const volunteering = club.socialImpact?.volunteering || [];
  const partnerships = club.socialImpact?.partnerships || [];

  if (!hasBasicInfo && aboutStats.length === 0 && !hasAgeGroups && benefits.length === 0) {
    return null;
  }

  return (
    <section id="traditional-about" className="traditional-about-main-section">
      <div className="traditional-about-container">
        
        <div className="traditional-about-header">
          <div className="traditional-about-badge">
            <FontAwesomeIcon icon={faHistory} />
            <span>{t('clubs.TraditionalAbout.header.badge')}</span>
          </div>
          <h2 className="traditional-about-title">{t('clubs.TraditionalAbout.header.title')}</h2>
          {club.shortDescription && (
            <p className="traditional-about-subtitle">
              {club.shortDescription}
            </p>
          )}
        </div>

        <div className="traditional-about-main-grid">
          
          {club.fullDescription && (
            <div className="traditional-about-story">
              <div className="traditional-about-story-header">
                <FontAwesomeIcon icon={faQuoteLeft} />
                <h3>{t('clubs.TraditionalAbout.story.title')}</h3>
              </div>
              <div className="traditional-about-story-content">
                <p>{club.fullDescription}</p>
                {club.foundedYear && (
                  <div className="traditional-about-founded">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{t('clubs.TraditionalAbout.story.founded', { year: club.foundedYear })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {aboutStats.length > 0 && (
            <div className="traditional-about-stats">
              <h3>{t('clubs.TraditionalAbout.stats.title')}</h3>
              <div className="traditional-about-stats-grid">
                {aboutStats.map((stat, index) => (
                  <div key={index} className="traditional-about-stat-card">
                    <div 
                      className="traditional-about-stat-icon"
                      style={{ backgroundColor: stat.color }}
                    >
                      <FontAwesomeIcon icon={stat.icon} />
                    </div>
                    <div className="traditional-about-stat-content">
                      <div className="traditional-about-stat-value">{stat.value}</div>
                      <div className="traditional-about-stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(hasAgeGroups || benefits.length > 0 || requirements.length > 0) && (
          <div className="traditional-about-info-grid">
            
            {hasAgeGroups && (
              <div className="traditional-about-demographics">
                <div className="traditional-about-section-header">
                  <FontAwesomeIcon icon={faUsers} />
                  <h3>{t('clubs.TraditionalAbout.demographics.title')}</h3>
                </div>
                <div className="traditional-about-age-groups">
                  {Object.entries(ageGroups).map(([range, count]) => (
                    <div key={range} className="traditional-about-age-group">
                      <div className="traditional-about-age-range">
                        {t('clubs.TraditionalAbout.demographics.ageRange', { range })}
                      </div>
                      <div className="traditional-about-age-count">
                        {t('clubs.TraditionalAbout.demographics.people', { count })}
                      </div>
                      <div 
                        className="traditional-about-age-bar"
                        style={{ 
                          width: `${(count / club.membership.totalMembers) * 100}%` 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {benefits.length > 0 && (
              <div className="traditional-about-benefits">
                <div className="traditional-about-section-header">
                  <FontAwesomeIcon icon={faGem} />
                  <h3>{t('clubs.TraditionalAbout.benefits.title')}</h3>
                </div>
                <div className="traditional-about-benefits-list">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="traditional-about-benefit-item">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {requirements.length > 0 && (
              <div className="traditional-about-requirements">
                <div className="traditional-about-section-header">
                  <FontAwesomeIcon icon={faHandshake} />
                  <h3>{t('clubs.TraditionalAbout.requirements.title')}</h3>
                </div>
                <div className="traditional-about-requirements-list">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="traditional-about-requirement-item">
                      <FontAwesomeIcon icon={faLeaf} />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
                {club.membership?.membershipFee && (
                  <div className="traditional-about-membership-fee">
                    <h4>{t('clubs.TraditionalAbout.membershipFee.title')}</h4>
                    <div className="traditional-about-fee-options">
                      {club.membership.membershipFee.monthly && (
                        <div className="traditional-about-fee-option">
                          <span className="traditional-about-fee-amount">
                            {club.membership.membershipFee.monthly} {club.membership.membershipFee.currency}
                          </span>
                          <span className="traditional-about-fee-period">
                            {t('clubs.TraditionalAbout.membershipFee.monthly')}
                          </span>
                        </div>
                      )}
                      {club.membership.membershipFee.yearly && (
                        <div className="traditional-about-fee-option">
                          <span className="traditional-about-fee-amount">
                            {club.membership.membershipFee.yearly} {club.membership.membershipFee.currency}
                          </span>
                          <span className="traditional-about-fee-period">
                            {t('clubs.TraditionalAbout.membershipFee.yearly')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(achievements.length > 0 || recognitions.length > 0) && (
          <div className="traditional-about-achievements">
            <div className="traditional-about-achievements-header">
              <FontAwesomeIcon icon={faCrown} />
              <h3>{t('clubs.TraditionalAbout.achievements.title')}</h3>
              <p>{t('clubs.TraditionalAbout.achievements.subtitle')}</p>
            </div>
            
            <div className="traditional-about-achievements-grid">
              {achievements.length > 0 && (
                <div className="traditional-about-awards">
                  <h4>{t('clubs.TraditionalAbout.achievements.awards')}</h4>
                  <div className="traditional-about-awards-list">
                    {achievements.map((award, index) => (
                      <div key={index} className="traditional-about-award-item">
                        <div className="traditional-about-award-icon">
                          <FontAwesomeIcon icon={faAward} />
                        </div>
                        <div className="traditional-about-award-content">
                          <h5>{award.name}</h5>
                          <p>{award.description}</p>
                          <div className="traditional-about-award-details">
                            <span>{award.year}</span>
                            <span>•</span>
                            <span>{award.awardedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recognitions.length > 0 && (
                <div className="traditional-about-recognitions">
                  <h4>{t('clubs.TraditionalAbout.achievements.recognitions')}</h4>
                  <div className="traditional-about-recognitions-list">
                    {recognitions.map((recognition, index) => (
                      <div key={index} className="traditional-about-recognition-item">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{recognition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(volunteering.length > 0 || partnerships.length > 0) && (
          <div className="traditional-about-impact">
            <div className="traditional-about-impact-header">
              <FontAwesomeIcon icon={faGlobe} />
              <h3>{t('clubs.TraditionalAbout.impact.title')}</h3>
              <p>{t('clubs.TraditionalAbout.impact.subtitle')}</p>
            </div>
            
            <div className="traditional-about-impact-grid">
              {volunteering.length > 0 && (
                <div className="traditional-about-volunteering">
                  <h4>{t('clubs.TraditionalAbout.impact.volunteering')}</h4>
                  <div className="traditional-about-volunteering-list">
                    {volunteering.map((project, index) => (
                      <div key={index} className="traditional-about-volunteer-project">
                        <h5>{project.project}</h5>
                        <p>{project.description || t('clubs.TraditionalAbout.impact.participants', { count: project.participants })}</p>
                        {project.coordinator && (
                          <div className="traditional-about-coordinator">
                            {t('clubs.TraditionalAbout.impact.coordinator')}: {project.coordinator}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {partnerships.length > 0 && (
                <div className="traditional-about-partnerships">
                  <h4>{t('clubs.TraditionalAbout.impact.partnerships')}</h4>
                  <div className="traditional-about-partnerships-list">
                    {partnerships.map((partnership, index) => (
                      <div key={index} className="traditional-about-partnership-item">
                        <h5>{partnership.partner}</h5>
                        <div className="traditional-about-partnership-type">{partnership.type}</div>
                        {partnership.description && (
                          <p>{partnership.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TraditionalAbout;