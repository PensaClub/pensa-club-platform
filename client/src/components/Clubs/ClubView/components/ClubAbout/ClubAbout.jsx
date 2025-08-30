import { 
  faAward, 
  faChevronDown, 
  faChevronUp, 
  faHandHoldingHeart, 
  faHandsHelping, 
  faHeart, 
  faHistory, 
  faMapMarkerAlt, 
  faTrophy, 
  faUsers,
  faCalendarAlt,
  faInfoCircle,
  faShieldAlt,
  faUserShield,
  faHeartbeat,
  faHome,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faBuilding,
  faUniversalAccess,
  faUserCheck,
  faEuroSign,
  faClock,
  faCheck,
  faTimes,
  faCoins
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import './clubAbout.css';

export const ClubAbout = ({ club }) => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState('description');

  if (!club?.name || (!club.fullDescription && !club.shortDescription)) {
    return null;
  }

  const getClubData = () => {
    const achievements = club.achievements || { awards: [], recognitions: [], certificates: [] };
    const socialImpact = club.socialImpact || { volunteering: [], communityProjects: [], partnerships: [] };
    const pensionersSpecific = club.pensionersSpecific || {
      healthServices: { regularCheckups: false, bloodPressureMonitoring: false, healthLectures: [] },
      supportServices: {},
      accessibility: {}
    };
    const regionalInfo = club.regionalInfo || null;
    const membership = club.membership || {};

    return { achievements, socialImpact, pensionersSpecific, regionalInfo, membership };
  };

  const { achievements, socialImpact, pensionersSpecific, regionalInfo, membership } = getClubData();

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const calculateAgeData = () => {
    if (!club.membership?.ageGroups || !club.members?.length || !club.membership?.totalMembers ) {
      return [];
    }

    const total = club.membership.totalMembers || club.members.length;
    const ageGroups = club.membership.ageGroups;
    
    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  };

  const ageData = calculateAgeData();

  const hasMembershipInfo = () => {
    return (membership.requirements && membership.requirements.length > 0) ||
           membership.minimumAge ||
           (membership.trialPeriod && membership.trialPeriod.enabled) ||
           (membership.fees && membership.fees.list && membership.fees.list.length > 0) ||
           (membership.membershipFee && (membership.membershipFee.monthly > 0 || membership.membershipFee.yearly > 0));
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'BGN': 'лв.',
      'EUR': '€',
      'USD': '$'
    };
    return symbols[currency] || 'лв.';
  };

  const hasAchievements = () => {
    return achievements.awards.length > 0 || 
           achievements.recognitions.length > 0 || 
           achievements.certificates.length > 0;
  };

  const hasSocialImpact = () => {
    return socialImpact.volunteering.length > 0 || 
           socialImpact.communityProjects.length > 0 || 
           socialImpact.partnerships.length > 0;
  };

  const hasServices = () => {
    const healthServices = pensionersSpecific.healthServices || {};
    const supportServices = pensionersSpecific.supportServices || {};
    const accessibility = pensionersSpecific.accessibility || {};

    return Object.values(healthServices).some(value => value === true || (Array.isArray(value) && value.length > 0)) ||
           Object.values(supportServices).some(value => value === true) ||
           Object.values(accessibility).some(value => value === true);
  };

  const getActiveServices = () => {
    const healthServices = pensionersSpecific.healthServices || {};
    const supportServices = pensionersSpecific.supportServices || {};
    const accessibility = pensionersSpecific.accessibility || {};

    const services = {
      health: [],
      support: [],
      accessibility: []
    };

    Object.entries(healthServices).forEach(([key, value]) => {
      if (value === true || (Array.isArray(value) && value.length > 0)) {
        const label = t(`clubs.ClubAbout.services.health.${key}`);
        if (label) {
          services.health.push({
            key,
            label,
            value: Array.isArray(value) ? `${label} (${value.length})` : label,
            active: true
          });
        }
      }
    });

    Object.entries(supportServices).forEach(([key, value]) => {
      if (value === true) {
        const label = t(`clubs.ClubAbout.services.support.${key}`);
        if (label) {
          services.support.push({
            key,
            label,
            active: true
          });
        }
      }
    });

    Object.entries(accessibility).forEach(([key, value]) => {
      const label = t(`clubs.ClubAbout.services.accessibility.${key}`);
      if (label) {
        services.accessibility.push({
          key,
          label,
          active: value === true
        });
      }
    });

    return services;
  };

  const activeServices = getActiveServices();

  return (
    <section id="general-club-about" className="general-about-main">
      <div className="general-about-container">
        
        <div className="general-about-header">
          <div className="general-about-header-content">
            <div className="general-about-badge">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>{t('clubs.ClubAbout.header.badge')}</span>
            </div>
            <h2 className="general-about-title">{t('clubs.ClubAbout.header.title')}</h2>
            <p className="general-about-subtitle">
              {t('clubs.ClubAbout.header.subtitle')}
            </p>
          </div>
          
          {club.preferences?.showStatistics && (
            <div className="general-about-stats">
              <div className="general-about-stat">
                <FontAwesomeIcon icon={faHistory} />
                <span>{club.foundedYear ? new Date().getFullYear() - club.foundedYear : '—'}</span>
                <label>{t('clubs.ClubAbout.stats.years')}</label>
              </div>
              {club.preferences?.showMembersList && (
                <div className="general-about-stat">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{club.membership?.totalMembers || '—'}</span>
                  <label>{t('clubs.ClubAbout.stats.members')}</label>
                </div>
              )}
              <div className="general-about-stat">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{club.location?.city || '—'}</span>
                <label>{t('clubs.ClubAbout.stats.city')}</label>
              </div>
            </div>
          )}
        </div>

        <div className="general-about-content">
          
          <div className="general-about-section">
            <div 
              className="general-section-header"
              onClick={() => toggleSection('description')}
            >
              <div className="general-section-title">
                <FontAwesomeIcon icon={faUsers} />
                <h3>{t('clubs.ClubAbout.sections.description.title')}</h3>
              </div>
              <FontAwesomeIcon 
                icon={expandedSection === 'description' ? faChevronUp : faChevronDown}
                className="general-toggle-icon"
              />
            </div>
            
            {expandedSection === 'description' && (
              <div className="general-section-content">
                <div className="general-description-layout">
                  
                  <div className="general-description-main">
                    <div className="general-description-text">
                      <p>{club.fullDescription || club.shortDescription}</p>
                    </div>
                    
                    <div className="general-key-facts">
                      {club.foundedYear && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faHistory} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">{t('clubs.ClubAbout.facts.founded')}</span>
                            <span className="general-fact-value">
                              {club.foundedYear} {t('clubs.ClubAbout.facts.year')} ({new Date().getFullYear() - club.foundedYear} {t('clubs.ClubAbout.facts.yearsActivity')})
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {(club.location?.city || club.location?.region) && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">{t('clubs.ClubAbout.facts.location')}</span>
                            <span className="general-fact-value">
                              {club.location.city}{club.location.region && `, ${club.location.region}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {club.membership?.totalMembers && club.preferences?.showMembersList && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">{t('clubs.ClubAbout.facts.members')}</span>
                            <span className="general-fact-value">{club.membership.totalMembers} {t('clubs.ClubAbout.facts.people')}</span>
                          </div>
                        </div>
                      )}

                      {club.location?.venue && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faBuilding} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">{t('clubs.ClubAbout.facts.venue')}</span>
                            <span className="general-fact-value">
                              {club.location.venue.size} • {club.location.venue.capacity} {t('clubs.ClubAbout.facts.seats')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {ageData.length > 0 && club.preferences?.showStatistics && club.preferences?.showMembersList && (
                    <div className="general-age-demographics">
                      <h4>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {t('clubs.ClubAbout.demographics.title')}
                      </h4>
                      <div className="general-age-chart">
                        {ageData.map(({ range, count, percentage }) => (
                          <div key={range} className="general-age-group">
                            <div className="general-age-info">
                              <span className="general-age-range">{range} {t('clubs.ClubAbout.demographics.years')}</span>
                              <span className="general-age-percentage">{percentage}%</span>
                            </div>
                            <div className="general-age-bar">
                              <div 
                                className="general-age-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="general-age-count">{count} {t('clubs.ClubAbout.demographics.people')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {hasMembershipInfo() && club.preferences?.allowOnlineRegistration && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('membership')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faUserCheck} />
                  <h3>Условия за членство</h3>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'membership' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'membership' && (
                <div className="general-section-content">
                  <div className="general-membership-layout">
                    
                    <div className="general-membership-basics">
                      <div className="general-membership-basic-info">
                        
                        {membership.minimumAge && (
                          <div className="general-membership-basic-item">
                            <div className="general-membership-basic-icon">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                            </div>
                            <div className="general-membership-basic-content">
                              <span className="general-membership-basic-label">Минимална възраст</span>
                              <span className="general-membership-basic-value">{membership.minimumAge} години</span>
                            </div>
                          </div>
                        )}

                        {membership.trialPeriod?.enabled && (
                          <div className="general-membership-basic-item">
                            <div className="general-membership-basic-icon">
                              <FontAwesomeIcon icon={faClock} />
                            </div>
                            <div className="general-membership-basic-content">
                              <span className="general-membership-basic-label">Пробен период</span>
                              <span className="general-membership-basic-value">
                                {membership.trialPeriod.days ? `${membership.trialPeriod.days} дни` : 'Наличен'}
                              </span>
                            </div>
                          </div>
                        )}

                        {membership.type && (
                          <div className="general-membership-basic-item">
                            <div className="general-membership-basic-icon">
                              <FontAwesomeIcon icon={faUserShield} />
                            </div>
                            <div className="general-membership-basic-content">
                              <span className="general-membership-basic-label">Тип прием</span>
                              <span className="general-membership-basic-value">
                                {membership.type === 'open' && 'Отворено членство'}
                                {membership.type === 'invitation' && 'По покана'}
                                {membership.type === 'application' && 'По заявление'}
                                {membership.type === 'recommendation' && 'По препоръка'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {membership.requirements && membership.requirements.length > 0 && (
                      <div className="general-membership-requirements">
                        <h4>
                          <FontAwesomeIcon icon={faCheck} />
                          Изисквания за членство
                        </h4>
                        <div className="general-membership-requirements-list">
                          {membership.requirements.map((requirement, index) => (
                            <div key={index} className="general-membership-requirement-item">
                              <FontAwesomeIcon icon={faCheck} />
                              <span>{requirement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {club.preferences?.showFinances && ((membership.membershipFee && (membership.membershipFee.monthly > 0 || membership.membershipFee.yearly > 0)) || 
                      (membership.fees && membership.fees.list && membership.fees.list.length > 0)) && (
                      <div className="general-membership-fees">
                        <h4>
                          <FontAwesomeIcon icon={faCoins} />
                          Членски внос
                        </h4>
                        
                        {membership.membershipFee && (membership.membershipFee.monthly > 0 || membership.membershipFee.yearly > 0) && (
                          <div className="general-membership-fees-summary">
                            {membership.membershipFee.monthly > 0 && (
                              <div className="general-membership-fee-item primary">
                                <div className="general-membership-fee-amount">
                                  {membership.membershipFee.monthly} {getCurrencySymbol(membership.membershipFee.currency)}
                                </div>
                                <div className="general-membership-fee-period">месечно</div>
                              </div>
                            )}
                            {membership.membershipFee.yearly > 0 && (
                              <div className="general-membership-fee-item primary">
                                <div className="general-membership-fee-amount">
                                  {membership.membershipFee.yearly} {getCurrencySymbol(membership.membershipFee.currency)}
                                </div>
                                <div className="general-membership-fee-period">годишно</div>
                              </div>
                            )}
                          </div>
                        )}

                        {membership.fees?.list && membership.fees.list.length > 0 && (
                          <div className="general-membership-fees-detailed">
                            {membership.fees.list.map((fee, index) => (
                              <div key={fee.id || index} className="general-membership-fee-detail">
                                <div className="general-membership-fee-detail-header">
                                  <span className="general-membership-fee-detail-type">{fee.type}</span>
                                  <span className="general-membership-fee-detail-amount">
                                    {fee.amount} {getCurrencySymbol(fee.currency || 'BGN')}
                                    <span className="general-membership-fee-detail-period">
                                      / {fee.period === 'monthly' ? 'месец' : 
                                          fee.period === 'yearly' ? 'година' : 
                                          fee.period === 'quarterly' ? 'тримесечие' : 
                                          fee.period === 'onetime' ? 'еднократно' : fee.period}
                                    </span>
                                  </span>
                                </div>
                                {fee.description && (
                                  <p className="general-membership-fee-detail-description">{fee.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {membership.benefits && membership.benefits.length > 0 && (
                      <div className="general-membership-benefits">
                        <h4>
                          <FontAwesomeIcon icon={faHeart} />
                          Ползи от членството
                        </h4>
                        <div className="general-membership-benefits-list">
                          {membership.benefits.map((benefit, index) => (
                            <div key={index} className="general-membership-benefit-item">
                              <FontAwesomeIcon icon={faHeart} />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasAchievements() && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('achievements')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faTrophy} />
                  <h3>{t('clubs.ClubAbout.sections.achievements.title')}</h3>
                  <span className="general-section-count">
                    {achievements.awards.length + achievements.recognitions.length + achievements.certificates.length}
                  </span>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'achievements' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'achievements' && (
                <div className="general-section-content">
                  <div className="general-achievements-grid">
                    
                    {achievements.awards.map((award, index) => (
                      <div key={`award-${index}`} className="general-achievement-card award">
                        <div className="general-achievement-icon">
                          <FontAwesomeIcon icon={faTrophy} />
                        </div>
                        <div className="general-achievement-content">
                          <h4>{award.name}</h4>
                          <p>{award.description}</p>
                          <div className="general-achievement-meta">
                            {award.year && <span>📅 {award.year} {t('clubs.ClubAbout.achievements.year')}</span>}
                            {award.awardedBy && <span>🏛️ {award.awardedBy}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {achievements.recognitions.map((recognition, index) => (
                      <div key={`recognition-${index}`} className="general-achievement-card recognition">
                        <div className="general-achievement-icon">
                          <FontAwesomeIcon icon={faAward} />
                        </div>
                        <div className="general-achievement-content">
                          <h4>{t('clubs.ClubAbout.achievements.recognition')}</h4>
                          <p>{recognition}</p>
                        </div>
                      </div>
                    ))}

                    {achievements.certificates.map((certificate, index) => (
                      <div key={`certificate-${index}`} className="general-achievement-card certificate">
                        <div className="general-achievement-icon">
                          <FontAwesomeIcon icon={faShieldAlt} />
                        </div>
                        <div className="general-achievement-content">
                          <h4>{certificate.name}</h4>
                          <div className="general-achievement-meta">
                            {certificate.issueDate && <span>📅 {t('clubs.ClubAbout.achievements.issued')}: {new Date(certificate.issueDate).getFullYear()}</span>}
                            {certificate.issuedBy && <span>🏛️ {certificate.issuedBy}</span>}
                            {certificate.validUntil && <span>⏰ {t('clubs.ClubAbout.achievements.validUntil')}: {new Date(certificate.validUntil).getFullYear()}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasSocialImpact() && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('impact')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faHandsHelping} />
                  <h3>{t('clubs.ClubAbout.sections.socialImpact.title')}</h3>
                  <span className="general-section-count">
                    {socialImpact.volunteering.length + socialImpact.communityProjects.length + socialImpact.partnerships.length}
                  </span>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'impact' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'impact' && (
                <div className="general-section-content">
                  <div className="general-impact-layout">
                    
                    {socialImpact.volunteering.length > 0 && (
                      <div className="general-impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faHandHoldingHeart} />
                          {t('clubs.ClubAbout.socialImpact.volunteering.title')}
                        </h4>
                        <div className="general-impact-items">
                          {socialImpact.volunteering.map((project, index) => (
                            <div key={index} className="general-impact-item">
                              <div className="general-impact-header">
                                <h5>{project.project}</h5>
                                <div className="general-impact-stats">
                                  <span>👥 {project.participants} {t('clubs.ClubAbout.socialImpact.volunteering.volunteers')}</span>
                                  {project.hoursPerMonth && <span>⏱️ {project.hoursPerMonth}{t('clubs.ClubAbout.socialImpact.volunteering.hoursPerMonth')}</span>}
                                </div>
                              </div>
                              {project.coordinator && (
                                <p>{t('clubs.ClubAbout.socialImpact.coordinator')}: <strong>{project.coordinator}</strong></p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {socialImpact.communityProjects.length > 0 && (
                      <div className="general-impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faUsers} />
                          {t('clubs.ClubAbout.socialImpact.communityProjects.title')}
                        </h4>
                        <div className="general-impact-items">
                          {socialImpact.communityProjects.map((project, index) => (
                            <div key={index} className="general-impact-item">
                              <div className="general-impact-header">
                                <h5>{project.name}</h5>
                                <div className="general-impact-stats">
                                  {project.beneficiaries && <span>👥 {project.beneficiaries} {t('clubs.ClubAbout.socialImpact.communityProjects.beneficiaries')}</span>}
                                  {project.status && (
                                    <span className={`general-status ${project.status.toLowerCase()}`}>
                                      {project.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {project.description && <p>{project.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {socialImpact.partnerships.length > 0 && (
                      <div className="general-impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faHandsHelping} />
                          {t('clubs.ClubAbout.socialImpact.partnerships.title')}
                        </h4>
                        <div className="general-impact-items">
                          {socialImpact.partnerships.map((partnership, index) => (
                            <div key={index} className="general-impact-item">
                              <div className="general-impact-header">
                                <h5>{partnership.partner}</h5>
                                <span className="general-partnership-type">{partnership.type}</span>
                              </div>
                              {partnership.description && <p>{partnership.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasServices() && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('services')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faHeart} />
                  <h3>{t('clubs.ClubAbout.sections.services.title')}</h3>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'services' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'services' && (
                <div className="general-section-content">
                  <div className="general-services-grid">
                    
                    {activeServices.health.length > 0 && (
                      <div className="general-service-category">
                        <h4>
                          <FontAwesomeIcon icon={faHeartbeat} />
                          {t('clubs.ClubAbout.services.categories.health')}
                        </h4>
                        <div className="general-service-list">
                          {activeServices.health.map((service, index) => (
                            <div key={index} className="general-service-item active">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              <span>{service.value || service.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeServices.support.length > 0 && (
                      <div className="general-service-category">
                        <h4>
                          <FontAwesomeIcon icon={faHome} />
                          {t('clubs.ClubAbout.services.categories.support')}
                        </h4>
                        <div className="general-service-list">
                          {activeServices.support.map((service, index) => (
                            <div key={index} className="general-service-item active">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              <span>{service.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeServices.accessibility.length > 0 && (
                      <div className="general-service-category">
                        <h4>
                          <FontAwesomeIcon icon={faUniversalAccess} />
                          {t('clubs.ClubAbout.services.categories.accessibility')}
                        </h4>
                        <div className="general-service-list">
                          {activeServices.accessibility.map((service, index) => (
                            <div key={index} className={`general-service-item ${service.active ? 'active' : 'inactive'}`}>
                              <FontAwesomeIcon icon={service.active ? faCheckCircle : faTimesCircle} />
                              <span>{service.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {regionalInfo && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('regional')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <h3>{t('clubs.ClubAbout.sections.regional.title')}</h3>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'regional' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'regional' && (
                <div className="general-section-content">
                  <div className="general-regional-info">
                    <div className="general-regional-grid">
                      <div className="general-regional-item">
                        <div className="general-regional-icon">
                          <FontAwesomeIcon icon={faUserShield} />
                        </div>
                        <div className="general-regional-content">
                          <span className="general-regional-label">{t('clubs.ClubAbout.regional.clubType')}</span>
                          <span className={`general-club-type ${regionalInfo.regionalRole}`}>
                            {regionalInfo.isCentralClub ? t('clubs.ClubAbout.regional.centralClub') : t('clubs.ClubAbout.regional.localClub')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="general-regional-item">
                        <div className="general-regional-icon">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </div>
                        <div className="general-regional-content">
                          <span className="general-regional-label">{t('clubs.ClubAbout.regional.coverageArea')}</span>
                          <span className="general-regional-value">{regionalInfo.coverageArea}</span>
                        </div>
                      </div>
                      
                      {regionalInfo.affiliatedClubs?.length > 0 && (
                        <div className="general-regional-item">
                          <div className="general-regional-icon">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <div className="general-regional-content">
                            <span className="general-regional-label">{t('clubs.ClubAbout.regional.affiliatedClubs')}</span>
                            <span className="general-regional-value">
                              {regionalInfo.affiliatedClubs.length} {t('clubs.ClubAbout.regional.clubsInNetwork')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClubAbout;