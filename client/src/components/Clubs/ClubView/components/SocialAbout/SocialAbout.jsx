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
  faListCheck,
  faHandHoldingHeart,
  faUserFriends,
  faMedkit,
  faHome,
  faHandsHelping
} from '@fortawesome/free-solid-svg-icons';
import './socialAbout.css';

export const SocialAbout = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');

  if (!club?.name) {
    return null;
  }

  const hasBasicInfo = club.fullDescription || club.shortDescription;
  
  const getAboutStats = () => {
    const stats = [];
    if (club.stats?.totalMembers) {
      stats.push({
        icon: faUsers,
        label: t('clubs.SocialAbout.stats.activeMembers'),
        value: club.stats.totalMembers,
        color: '#16a34a'
      });
    }
    if (club.foundedYear) {
      const yearsActive = new Date().getFullYear() - club.foundedYear;
      stats.push({
        icon: faCalendarAlt,
        label: t('clubs.SocialAbout.stats.yearsActive'),
        value: yearsActive,
        color: '#0891b2'
      });
    }
    if (club.stats?.programs) {
      stats.push({
        icon: faListCheck,
        label: t('clubs.SocialAbout.stats.programs'),
        value: club.stats.programs,
        color: '#dc2626'
      });
    }
    if (club.stats?.projectsBeneficiaries) {
      stats.push({
        icon: faHandHoldingHeart,
        label: t('clubs.SocialAbout.stats.helpedPeople'),
        value: club.stats.projectsBeneficiaries,
        color: '#7c3aed'
      });
    }
    return stats;
  };

  const aboutStats = getAboutStats();
  const benefits = club.membership?.benefits || [];
  const requirements = club.membership?.requirements || [];
  const achievements = club.achievements?.awards || [];
  const recognitions = club.achievements?.recognitions || [];
  const volunteering = club.socialImpact?.volunteering || [];
  const communityProjects = club.socialImpact?.communityProjects || [];
  const supportServices = club.pensionersSpecific?.supportServices;
  const healthServices = club.pensionersSpecific?.healthServices;
  
  const hasSpecialPrograms = club.pensionersSpecific?.specialPrograms && 
    (club.pensionersSpecific.specialPrograms.memoryActivities?.length > 0 ||
     club.pensionersSpecific.specialPrograms.intergenerationalPrograms?.length > 0 ||
     club.pensionersSpecific.specialPrograms.volunteerPrograms?.length > 0);

  const getFoundedText = () => {
    if (!club.foundedYear) return '';
    return t('clubs.SocialAbout.story.foundedIn', { year: club.foundedYear });
  };

  const getServiceItems = () => {
    const services = [];
    
    if (supportServices?.homeVisits) {
      services.push({
        icon: faHome,
        label: t('clubs.SocialAbout.services.homeVisits')
      });
    }
    if (supportServices?.shoppingAssistance) {
      services.push({
        icon: faHandsHelping,
        label: t('clubs.SocialAbout.services.shoppingAssistance')
      });
    }
    if (supportServices?.documentHelp) {
      services.push({
        icon: faListCheck,
        label: t('clubs.SocialAbout.services.documentHelp')
      });
    }
    if (supportServices?.companionship) {
      services.push({
        icon: faUserFriends,
        label: t('clubs.SocialAbout.services.companionship')
      });
    }
    if (supportServices?.transportService) {
      services.push({
        icon: faMapMarkerAlt,
        label: t('clubs.SocialAbout.services.transportService')
      });
    }
    if (supportServices?.mealDelivery) {
      services.push({
        icon: faHeart,
        label: t('clubs.SocialAbout.services.mealDelivery')
      });
    }
    if (supportServices?.cleaningHelp) {
      services.push({
        icon: faHome,
        label: t('clubs.SocialAbout.services.cleaningHelp')
      });
    }
    if (healthServices?.regularCheckups || healthServices?.bloodPressureMonitoring || healthServices?.healthLectures?.length > 0) {
      services.push({
        icon: faMedkit,
        label: t('clubs.SocialAbout.services.healthServices')
      });
    }
    
    return services;
  };

  const serviceItems = getServiceItems();

  const getProjectStatusTranslation = (status) => {
    const statusMap = {
      'active': t('clubs.SocialAbout.impact.projectStatus.active'),
      'completed': t('clubs.SocialAbout.impact.projectStatus.completed'),
      'pending': t('clubs.SocialAbout.impact.projectStatus.pending'),
      'cancelled': t('clubs.SocialAbout.impact.projectStatus.cancelled'),
      'активен': t('clubs.SocialAbout.impact.projectStatus.active'),
      'завършен': t('clubs.SocialAbout.impact.projectStatus.completed'),
      'предстоящ': t('clubs.SocialAbout.impact.projectStatus.pending'),
      'отменен': t('clubs.SocialAbout.impact.projectStatus.cancelled')
    };
    return statusMap[status] || status;
  };

  const getMembershipFeeLabels = () => ({
    monthly: t('clubs.SocialAbout.membership.fee.monthly'),
    yearly: t('clubs.SocialAbout.membership.fee.yearly'),
    currency: club.membership?.membershipFee?.currency || 'лв.'
  });

  const feeLabels = getMembershipFeeLabels();

  if (!hasBasicInfo && aboutStats.length === 0 && benefits.length === 0 && 
      achievements.length === 0 && volunteering.length === 0 && 
      communityProjects.length === 0 && !supportServices && !healthServices) {
    return null;
  }

  return (
    <section id="social-about" className="social-about-main-section">
      <div className="social-about-container">
        
        <div className="social-about-header">
          <div className="social-about-badge">
            <FontAwesomeIcon icon={faHeart} />
            <span>{t('clubs.SocialAbout.header.badge')}</span>
          </div>
          <h2 className="social-about-title">{t('clubs.SocialAbout.header.title')}</h2>
          {club.shortDescription && (
            <p className="social-about-subtitle">
              {club.shortDescription}
            </p>
          )}
        </div>

        <div className="social-about-main-grid">
          
          {club.fullDescription && (
            <div className="social-about-story">
              <div className="social-about-story-header">
                <FontAwesomeIcon icon={faQuoteLeft} />
                <h3>{t('clubs.SocialAbout.story.title')}</h3>
              </div>
              <div className="social-about-story-content">
                <p>{club.fullDescription}</p>
                {club.foundedYear && (
                  <div className="social-about-founded">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{getFoundedText()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {aboutStats.length > 0 && (
            <div className="social-about-stats">
              <h3>{t('clubs.SocialAbout.stats.title')}</h3>
              <div className="social-about-stats-grid">
                {aboutStats.map((stat, index) => (
                  <div key={index} className="social-about-stat-card">
                    <div 
                      className="social-about-stat-icon"
                      style={{ backgroundColor: stat.color }}
                    >
                      <FontAwesomeIcon icon={stat.icon} />
                    </div>
                    <div className="social-about-stat-content">
                      <div className="social-about-stat-value">{stat.value}</div>
                      <div className="social-about-stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(benefits.length > 0 || requirements.length > 0 || serviceItems.length > 0) && (
          <div className="social-about-info-grid">
            
            {benefits.length > 0 && (
              <div className="social-about-benefits">
                <div className="social-about-section-header">
                  <FontAwesomeIcon icon={faGem} />
                  <h3>{t('clubs.SocialAbout.benefits.title')}</h3>
                </div>
                <div className="social-about-benefits-list">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="social-about-benefit-item">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {requirements.length > 0 && (
              <div className="social-about-requirements">
                <div className="social-about-section-header">
                  <FontAwesomeIcon icon={faHandshake} />
                  <h3>{t('clubs.SocialAbout.membership.title')}</h3>
                </div>
                <div className="social-about-requirements-list">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="social-about-requirement-item">
                      <FontAwesomeIcon icon={faLeaf} />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
                {club.membership?.membershipFee && (
                  <div className="social-about-membership-fee">
                    <h4>{t('clubs.SocialAbout.membership.fee.title')}</h4>
                    <div className="social-about-fee-options">
                      {club.membership.membershipFee.monthly && (
                        <div className="social-about-fee-option">
                          <span className="social-about-fee-amount">
                            {club.membership.membershipFee.monthly} {feeLabels.currency}
                          </span>
                          <span className="social-about-fee-period">{feeLabels.monthly}</span>
                        </div>
                      )}
                      {club.membership.membershipFee.yearly && (
                        <div className="social-about-fee-option">
                          <span className="social-about-fee-amount">
                            {club.membership.membershipFee.yearly} {feeLabels.currency}
                          </span>
                          <span className="social-about-fee-period">{feeLabels.yearly}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {serviceItems.length > 0 && (
              <div className="social-about-support-services">
                <div className="social-about-section-header">
                  <FontAwesomeIcon icon={faHandHoldingHeart} />
                  <h3>{t('clubs.SocialAbout.services.title')}</h3>
                </div>
                <div className="social-about-services-grid">
                  {serviceItems.map((service, index) => (
                    <div key={index} className="social-about-service-item">
                      <FontAwesomeIcon icon={service.icon} />
                      <span>{service.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(volunteering.length > 0 || communityProjects.length > 0) && (
          <div className="social-about-impact">
            <div className="social-about-impact-header">
              <FontAwesomeIcon icon={faGlobe} />
              <h3>{t('clubs.SocialAbout.impact.title')}</h3>
              <p>{t('clubs.SocialAbout.impact.subtitle')}</p>
            </div>
            
            <div className="social-about-impact-grid">
              {volunteering.length > 0 && (
                <div className="social-about-volunteering">
                  <h4>{t('clubs.SocialAbout.impact.volunteering.title')}</h4>
                  <div className="social-about-volunteering-list">
                    {volunteering.map((project, index) => (
                      <div key={index} className="social-about-volunteer-project">
                        <h5>{project.project}</h5>
                        <p>{project.description || t('clubs.SocialAbout.impact.volunteering.participants', { count: project.participants })}</p>
                        {project.coordinator && (
                          <div className="social-about-coordinator">
                            {t('clubs.SocialAbout.impact.volunteering.coordinator')}: {project.coordinator}
                          </div>
                        )}
                        {project.hoursPerMonth && (
                          <div className="social-about-hours">
                            {t('clubs.SocialAbout.impact.volunteering.hoursPerMonth', { hours: project.hoursPerMonth })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {communityProjects.length > 0 && (
                <div className="social-about-projects">
                  <h4>{t('clubs.SocialAbout.impact.projects.title')}</h4>
                  <div className="social-about-projects-list">
                    {communityProjects.map((project, index) => (
                      <div key={index} className="social-about-project-item">
                        <h5>{project.name}</h5>
                        <p>{project.description}</p>
                        <div className="social-about-project-details">
                          {project.beneficiaries && (
                            <span className="social-about-beneficiaries">
                              <FontAwesomeIcon icon={faUsers} />
                              {t('clubs.SocialAbout.impact.projects.beneficiaries', { count: project.beneficiaries })}
                            </span>
                          )}
                          <span className={`social-about-status ${project.status}`}>
                            {getProjectStatusTranslation(project.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(achievements.length > 0 || recognitions.length > 0) && (
          <div className="social-about-achievements">
            <div className="social-about-achievements-header">
              <FontAwesomeIcon icon={faCrown} />
              <h3>{t('clubs.SocialAbout.achievements.title')}</h3>
              <p>{t('clubs.SocialAbout.achievements.subtitle')}</p>
            </div>
            
            <div className="social-about-achievements-grid">
              {achievements.length > 0 && (
                <div className="social-about-awards">
                  <h4>{t('clubs.SocialAbout.achievements.awards.title')}</h4>
                  <div className="social-about-awards-list">
                    {achievements.map((award, index) => (
                      <div key={index} className="social-about-award-item">
                        <div className="social-about-award-icon">
                          <FontAwesomeIcon icon={faAward} />
                        </div>
                        <div className="social-about-award-content">
                          <h5>{award.name}</h5>
                          <p>{award.description}</p>
                          <div className="social-about-award-details">
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
                <div className="social-about-recognitions">
                  <h4>{t('clubs.SocialAbout.achievements.recognitions.title')}</h4>
                  <div className="social-about-recognitions-list">
                    {recognitions.map((recognition, index) => (
                      <div key={index} className="social-about-recognition-item">
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
      </div>
    </section>
  );
};

export default SocialAbout;