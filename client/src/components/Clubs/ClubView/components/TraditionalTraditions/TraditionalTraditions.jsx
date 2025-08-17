import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLeaf,
  faSun,
  faSnowflake,
  faHeart,
  faMusic,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faCrown,
  faGem,
  faStar,
  faChurch,
  faHome,
  faCookie,
  faBreadSlice,
  faSeedling,
  faTheaterMasks,
  faHandHoldingHeart,
  faGlobe,
  faEnvelope,
  faPhone,
  faUser,
  faTimes,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './traditionalTraditions.css';

export const TraditionalTraditions = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [membershipForm, setMembershipForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    interests: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  if (!club?.name) {
    return null;
  }

  const traditionalEvents = club.activities?.events?.filter(event => 
    event.type === 'traditional' || event.type === 'cultural'
  ) || [];

  const traditionalActivities = club.activities?.regular?.filter(activity => 
    activity.name.toLowerCase().includes('хор') || 
    activity.name.toLowerCase().includes('танци') ||
    activity.name.toLowerCase().includes('народни') ||
    activity.name.toLowerCase().includes('тракийски')
  ) || [];

  const traditionalTrips = club.activities?.trips?.filter(trip =>
    trip.destination.toLowerCase().includes('манастир') ||
    trip.destination.toLowerCase().includes('копривщица') ||
    trip.destination.toLowerCase().includes('мелник') ||
    trip.destination.toLowerCase().includes('несебър') ||
    trip.destination.toLowerCase().includes('велико търново')
  ) || [];

  const regionalInfo = club.regionalInfo;
  const location = club.location;

  const traditionalProjects = club.socialImpact?.communityProjects?.filter(project =>
    project.name.toLowerCase().includes('традиц') ||
    project.name.toLowerCase().includes('култур')
  ) || [];

  const culturalPartnerships = club.socialImpact?.partnerships?.filter(partnership =>
    partnership.type === 'културно' || partnership.type === 'образователно'
  ) || [];

  const hasTraditionalContent = traditionalEvents.length > 0 || 
                               traditionalActivities.length > 0 || 
                               traditionalTrips.length > 0 ||
                               traditionalProjects.length > 0 ||
                               culturalPartnerships.length > 0 ||
                               (regionalInfo && Object.keys(regionalInfo).length > 0) ||
                               (location && (location.city || location.region));

  if (!hasTraditionalContent) {
    return null;
  }

  const getEventIcon = (type) => {
    switch(type) {
      case 'traditional':
        return faCrown;
      case 'cultural':
        return faTheaterMasks;
      default:
        return faStar;
    }
  };

  const getActivityIcon = (name) => {
    if (name.toLowerCase().includes('хор')) return faMusic;
    if (name.toLowerCase().includes('танци')) return faTheaterMasks;
    return faHeart;
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    return dateObj.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const openMembershipModal = () => {
    setIsMembershipModalOpen(true);
  };

  const closeMembershipModal = () => {
    setIsMembershipModalOpen(false);
    setMembershipForm({
      name: '',
      email: '',
      phone: '',
      age: '',
      interests: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setMembershipForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMembershipSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.TraditionalTraditions.membershipModal.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.TraditionalTraditions.membershipModal.emailBody', {
        name: membershipForm.name,
        email: membershipForm.email,
        phone: membershipForm.phone || t('clubs.TraditionalTraditions.membershipModal.notSpecified'),
        age: membershipForm.age || t('clubs.TraditionalTraditions.membershipModal.notSpecified'),
        interests: membershipForm.interests || t('clubs.TraditionalTraditions.membershipModal.generalInterests'),
        message: membershipForm.message || t('clubs.TraditionalTraditions.membershipModal.defaultMessage'),
        clubName: club.name
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeMembershipModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleViewEvents = () => {
    const calendarSection = document.getElementById('traditional-calendar');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (traditionalEvents.length > 0) {
        const eventsList = traditionalEvents.map(event => `• ${event.title} - ${event.date}`).join('\n');
        alert(t('clubs.TraditionalTraditions.messages.upcomingEvents', { events: eventsList }));
      } else {
        alert(t('clubs.TraditionalTraditions.messages.noEvents'));
      }
    }
  };

  const handleCallPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  return (
    <section id="traditional-traditions" className="traditional-traditions-main-section">
      <div className="traditional-traditions-container">
        
        <div className="traditional-traditions-header">
          <div className="traditional-traditions-badge">
            <FontAwesomeIcon icon={faCrown} />
            <span>{t('clubs.TraditionalTraditions.header.badge')}</span>
          </div>
          <h2 className="traditional-traditions-title">{t('clubs.TraditionalTraditions.header.title')}</h2>
          <p className="traditional-traditions-subtitle">
            {t('clubs.TraditionalTraditions.header.subtitle')}
          </p>
        </div>

        <div className="traditional-traditions-main-grid">
          
          {traditionalEvents.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>{t('clubs.TraditionalTraditions.events.title')}</h3>
                <p>{t('clubs.TraditionalTraditions.events.subtitle')}</p>
              </div>
              
              <div className="traditional-traditions-cards">
                {traditionalEvents.map((event, index) => (
                  <div key={index} className="traditional-traditions-card seasonal">
                    <div className="traditional-traditions-card-icon">
                      <FontAwesomeIcon icon={getEventIcon(event.type)} />
                    </div>
                    <div className="traditional-traditions-card-content">
                      <h4>{event.title}</h4>
                      <div className="traditional-traditions-date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{t('clubs.TraditionalTraditions.events.dateTime', { date: event.date, time: event.time })}</span>
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      {event.participants && (
                        <div className="traditional-traditions-participants">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{t('clubs.TraditionalTraditions.common.participants', { count: event.participants })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {traditionalActivities.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faMusic} />
                <h3>{t('clubs.TraditionalTraditions.activities.title')}</h3>
                <p>{t('clubs.TraditionalTraditions.activities.subtitle')}</p>
              </div>
              
              <div className="traditional-traditions-cards">
                {traditionalActivities.map((activity, index) => (
                  <div key={index} className="traditional-traditions-card family">
                    <div className="traditional-traditions-card-icon">
                      <FontAwesomeIcon icon={getActivityIcon(activity.name)} />
                    </div>
                    <div className="traditional-traditions-card-content">
                      <h4>{activity.name}</h4>
                      <div className="traditional-traditions-schedule">
                        <strong>{activity.day}</strong> {t('clubs.TraditionalTraditions.activities.from')} {activity.time}
                      </div>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      {activity.instructor && (
                        <div className="traditional-traditions-instructor">
                          {t('clubs.TraditionalTraditions.activities.instructor')}: {activity.instructor}
                        </div>
                      )}
                      {activity.participants && (
                        <div className="traditional-traditions-participants">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{t('clubs.TraditionalTraditions.common.participants', { count: activity.participants })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {traditionalTrips.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <h3>{t('clubs.TraditionalTraditions.trips.title')}</h3>
                <p>{t('clubs.TraditionalTraditions.trips.subtitle')}</p>
              </div>
              
              <div className="traditional-traditions-cards">
                {traditionalTrips.map((trip, index) => (
                  <div key={index} className="traditional-traditions-card regional">
                    <div className="traditional-traditions-card-icon">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                    <div className="traditional-traditions-card-content">
                      <h4>{trip.destination}</h4>
                      <div className="traditional-traditions-date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{trip.date}</span>
                      </div>
                      {trip.description && (
                        <p>{trip.description}</p>
                      )}
                      <div className="traditional-traditions-trip-details">
                        <div className="traditional-traditions-participants">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{t('clubs.TraditionalTraditions.common.participants', { count: trip.participants })}</span>
                        </div>
                        <div className="traditional-traditions-price">
                          {t('clubs.TraditionalTraditions.trips.price')}: {trip.price} {t('clubs.TraditionalTraditions.currency')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(regionalInfo || location?.city || location?.region) && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faHome} />
                <h3>{t('clubs.TraditionalTraditions.heritage.title')}</h3>
                <p>{t('clubs.TraditionalTraditions.heritage.subtitle')}</p>
              </div>
              
              <div className="traditional-traditions-cards">
                <div className="traditional-traditions-card regional">
                  <div className="traditional-traditions-card-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="traditional-traditions-card-content">
                    <h4>{t('clubs.TraditionalTraditions.heritage.ourRegion')}</h4>
                    <div className="traditional-traditions-location">
                      {location?.city && location?.region ? `${location.city}, ${location.region}` : 
                       location?.city || location?.region || t('clubs.TraditionalTraditions.heritage.defaultCountry')}
                    </div>
                    {regionalInfo?.coverageArea && (
                      <p>{t('clubs.TraditionalTraditions.heritage.coverage')}: {regionalInfo.coverageArea}</p>
                    )}
                    {regionalInfo?.regionalRole && (
                      <div className="traditional-traditions-role">
                        {t('clubs.TraditionalTraditions.heritage.role')}: {regionalInfo.regionalRole === 'central' ? 
                          t('clubs.TraditionalTraditions.heritage.centralClub') : 
                          t('clubs.TraditionalTraditions.heritage.localClub')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {traditionalProjects.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>{t('clubs.TraditionalTraditions.projects.title')}</h3>
                <p>{t('clubs.TraditionalTraditions.projects.subtitle')}</p>
              </div>
              
              <div className="traditional-traditions-cards">
                {traditionalProjects.map((project, index) => (
                  <div key={index} className="traditional-traditions-card culinary">
                    <div className="traditional-traditions-card-icon">
                      <FontAwesomeIcon icon={faGem} />
                    </div>
                    <div className="traditional-traditions-card-content">
                      <h4>{project.name}</h4>
                      {project.description && (
                        <p>{project.description}</p>
                      )}
                      {project.beneficiaries && (
                        <div className="traditional-traditions-participants">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{t('clubs.TraditionalTraditions.projects.beneficiaries', { count: project.beneficiaries })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {culturalPartnerships.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>{t('clubs.TraditionalTraditions.partnerships.title')}</h3>
                <p>{t('clubs.TraditionalTraditions.partnerships.subtitle')}</p>
              </div>
              
              <div className="traditional-traditions-cards">
                {culturalPartnerships.map((partnership, index) => (
                  <div key={index} className="traditional-traditions-card culinary">
                    <div className="traditional-traditions-card-icon">
                      <FontAwesomeIcon icon={faGlobe} />
                    </div>
                    <div className="traditional-traditions-card-content">
                      <h4>{partnership.partner}</h4>
                      <div className="traditional-traditions-partnership-type">
                        {partnership.type}
                      </div>
                      {partnership.description && (
                        <p>{partnership.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="traditional-traditions-cta">
          <div className="traditional-traditions-cta-content">
            <h3>{t('clubs.TraditionalTraditions.cta.title')}</h3>
            <p>{t('clubs.TraditionalTraditions.cta.subtitle')}</p>
            <div className="traditional-traditions-cta-buttons">
              <button 
                className="traditional-traditions-cta-primary"
                onClick={openMembershipModal}
              >
                <FontAwesomeIcon icon={faUsers} />
                {t('clubs.TraditionalTraditions.cta.becomeMember')}
              </button>
              <button 
                className="traditional-traditions-cta-secondary"
                onClick={handleViewEvents}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                {t('clubs.TraditionalTraditions.cta.upcomingEvents')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMembershipModalOpen && (
        <div className="traditional-traditions-membership-modal">
          <div className="traditional-traditions-membership-modal-overlay" onClick={closeMembershipModal}></div>
          <div className="traditional-traditions-membership-modal-container">
            <button className="traditional-traditions-membership-modal-close" onClick={closeMembershipModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-traditions-membership-header">
              <FontAwesomeIcon icon={faUsers} />
              <h3>{t('clubs.TraditionalTraditions.membershipModal.title', { clubName: club.name })}</h3>
              <p>{t('clubs.TraditionalTraditions.membershipModal.subtitle')}</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="traditional-traditions-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.TraditionalTraditions.membershipModal.success.title')}</h4>
                <p>{t('clubs.TraditionalTraditions.membershipModal.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-traditions-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.TraditionalTraditions.membershipModal.error.title')}</h4>
                <p>{t('clubs.TraditionalTraditions.membershipModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleMembershipSubmit} className="traditional-traditions-membership-form">
                <div className="traditional-traditions-form-row">
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.TraditionalTraditions.membershipModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={membershipForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalTraditions.membershipModal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.TraditionalTraditions.membershipModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={membershipForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalTraditions.membershipModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="traditional-traditions-form-row">
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="phone">
                      <FontAwesomeIcon icon={faPhone} />
                      {t('clubs.TraditionalTraditions.membershipModal.form.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={membershipForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder={t('clubs.TraditionalTraditions.membershipModal.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="age">
                      <FontAwesomeIcon icon={faUsers} />
                      {t('clubs.TraditionalTraditions.membershipModal.form.age')}
                    </label>
                    <input
                      type="number"
                      id="age"
                      value={membershipForm.age}
                      onChange={(e) => handleFormChange('age', e.target.value)}
                      placeholder={t('clubs.TraditionalTraditions.membershipModal.form.agePlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="traditional-traditions-form-group">
                  <label htmlFor="interests">
                    <FontAwesomeIcon icon={faHeart} />
                    {t('clubs.TraditionalTraditions.membershipModal.form.interests')}
                  </label>
                  <input
                    type="text"
                    id="interests"
                    value={membershipForm.interests}
                    onChange={(e) => handleFormChange('interests', e.target.value)}
                    placeholder={t('clubs.TraditionalTraditions.membershipModal.form.interestsPlaceholder')}
                  />
                </div>
                
                <div className="traditional-traditions-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.TraditionalTraditions.membershipModal.form.motivation')}
                  </label>
                  <textarea
                    id="message"
                    value={membershipForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    placeholder={t('clubs.TraditionalTraditions.membershipModal.form.motivationPlaceholder')}
                    rows="4"
                  />
                </div>
                
                <div className="traditional-traditions-form-actions">
                  <button 
                    type="submit" 
                    className="traditional-traditions-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? 
                      t('clubs.TraditionalTraditions.membershipModal.form.sending') : 
                      t('clubs.TraditionalTraditions.membershipModal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeMembershipModal}
                    className="traditional-traditions-cancel-btn"
                  >
                    {t('clubs.TraditionalTraditions.membershipModal.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalTraditions;