import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic,
  faTheaterMasks,
  faPalette,
  faBookOpen,
  faUsers,
  faClock,
  faCalendarAlt,
  faUser,
  faMapMarkerAlt,
  faPlay,
  faStop,
  faUserPlus,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faStar,
  faGraduationCap,
  faAward,
  faHeart,
  faTimes,
  faPhone,
  faEnvelope,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './culturalActivities.css';

export const CulturalActivities = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [activeTab, setActiveTab] = useState('regular');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    activityName: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  if (!club?.activities) {
    return null;
  }

  const activityIcons = {
    'хор': faMusic,
    'choir': faMusic,
    'chor': faMusic,
    'танци': faTheaterMasks,
    'dance': faTheaterMasks,
    'tanz': faTheaterMasks,
    'рисуване': faPalette,
    'painting': faPalette,
    'malen': faPalette,
    'четене': faBookOpen,
    'reading': faBookOpen,
    'lesen': faBookOpen,
    'курсове': faGraduationCap,
    'courses': faGraduationCap,
    'kurse': faGraduationCap,
    'музика': faMusic,
    'music': faMusic,
    'musik': faMusic,
    'театър': faTheaterMasks,
    'theater': faTheaterMasks,
    'театер': faTheaterMasks,
    'изкуство': faPalette,
    'art': faPalette,
    'kunst': faPalette,
    'default': faUsers
  };

  const getActivityIcon = (activityName) => {
    const name = activityName.toLowerCase();
    for (const [key, icon] of Object.entries(activityIcons)) {
      if (name.includes(key)) return icon;
    }
    return activityIcons.default;
  };

  const getWeekDays = () => [
    t('clubs.CulturalActivities.weekDays.monday'),
    t('clubs.CulturalActivities.weekDays.tuesday'),
    t('clubs.CulturalActivities.weekDays.wednesday'),
    t('clubs.CulturalActivities.weekDays.thursday'),
    t('clubs.CulturalActivities.weekDays.friday'),
    t('clubs.CulturalActivities.weekDays.saturday'),
    t('clubs.CulturalActivities.weekDays.sunday')
  ];

  const formatDate = (dateString) => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    return new Date(dateString).toLocaleDateString(locale);
  };

  const regularActivities = club.activities?.regular || [];
  const courses = club.activities?.courses || [];
  const specialPrograms = club.activities?.special || [];

  const hasRegularActivities = regularActivities.length > 0;
  const hasCourses = courses.length > 0;
  const hasSpecialPrograms = specialPrograms.length > 0;
  const hasAnyActivities = hasRegularActivities || hasCourses || hasSpecialPrograms;

  if (!hasAnyActivities) {
    return null;
  }

  const openJoinModal = (activity) => {
    setSelectedActivity(activity);
    setJoinForm(prev => ({
      ...prev,
      activityName: activity.name
    }));
    setShowJoinModal(true);
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setSelectedActivity(null);
    setJoinForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      activityName: ''
    });
    setFormStatus(null);
  };

  const openContactModal = () => {
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleJoinFormChange = (field, value) => {
    setJoinForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.CulturalActivities.modals.join.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.CulturalActivities.modals.join.emailBody', {
        clubName: club.name,
        activityName: joinForm.activityName,
        name: joinForm.name,
        email: joinForm.email,
        phone: joinForm.phone || t('clubs.CulturalActivities.form.notSpecified'),
        message: joinForm.message || t('clubs.CulturalActivities.form.noMessage'),
        senderEmail: joinForm.email
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeJoinModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.CulturalActivities.modals.contact.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.CulturalActivities.modals.contact.emailBody', {
        clubName: club.name,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || t('clubs.CulturalActivities.form.notSpecified'),
        message: contactForm.message,
        senderEmail: contactForm.email
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeContactModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleInfoRequest = (activity) => {
    setSelectedActivity(activity);
    setContactForm(prev => ({
      ...prev,
      message: t('clubs.CulturalActivities.modals.contact.infoRequestMessage', { activityName: activity.name })
    }));
    setShowContactModal(true);
  };

  if (activeTab === 'regular' && !hasRegularActivities) {
    if (hasCourses) setActiveTab('courses');
    else if (hasSpecialPrograms) setActiveTab('special');
  }

  return (
    <section id="cultural-activities" className="cultural-activities-main-section">
      <div className="cultural-activities-container">
        
        <div className="cultural-activities-header">
          <div className="cultural-activities-badge">
            <FontAwesomeIcon icon={faMusic} />
            <span>{t('clubs.CulturalActivities.header.badge')}</span>
          </div>
          <h2 className="cultural-activities-title">{t('clubs.CulturalActivities.header.title')}</h2>
          <p className="cultural-activities-subtitle">
            {t('clubs.CulturalActivities.header.subtitle')}
          </p>
        </div>

        <div className="cultural-activities-tabs">
          {hasRegularActivities && (
            <button 
              className={`cultural-activities-tab ${activeTab === 'regular' ? 'active' : ''}`}
              onClick={() => setActiveTab('regular')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              {t('clubs.CulturalActivities.tabs.regular')} ({regularActivities.length})
            </button>
          )}
          {hasCourses && (
            <button 
              className={`cultural-activities-tab ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <FontAwesomeIcon icon={faGraduationCap} />
              {t('clubs.CulturalActivities.tabs.courses')} ({courses.length})
            </button>
          )}
          {hasSpecialPrograms && (
            <button 
              className={`cultural-activities-tab ${activeTab === 'special' ? 'active' : ''}`}
              onClick={() => setActiveTab('special')}
            >
              <FontAwesomeIcon icon={faStar} />
              {t('clubs.CulturalActivities.tabs.special')} ({specialPrograms.length})
            </button>
          )}
        </div>

        <div className="cultural-activities-content">
          
          {activeTab === 'regular' && hasRegularActivities && (
            <div className="cultural-activities-regular">
              <div className="cultural-activities-grid">
                {regularActivities.map((activity, index) => (
                  <div key={index} className="cultural-activities-card">
                    <div className="cultural-activities-card-header">
                      <div className="cultural-activities-card-icon">
                        <FontAwesomeIcon icon={getActivityIcon(activity.name)} />
                      </div>
                      <div className="cultural-activities-card-title">
                        <h3>{activity.name}</h3>
                        <div className="cultural-activities-card-meta">
                          {activity.day && <span className="cultural-activities-day">{activity.day}</span>}
                          {activity.time && <span className="cultural-activities-time">{activity.time}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="cultural-activities-card-content">
                      {activity.description && (
                        <p className="cultural-activities-description">{activity.description}</p>
                      )}
                      
                      <div className="cultural-activities-details">
                        {activity.instructor && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faUser} />
                            <span>{t('clubs.CulturalActivities.activity.instructor')}: {activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{activity.participants} {t('clubs.CulturalActivities.activity.participants')}</span>
                          </div>
                        )}
                        {activity.level && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faStar} />
                            <span>{t('clubs.CulturalActivities.activity.level')}: {activity.level}</span>
                          </div>
                        )}
                        {activity.duration && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{t('clubs.CulturalActivities.activity.duration')}: {activity.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="cultural-activities-card-actions">
                      <button 
                        className="cultural-activities-btn-primary"
                        onClick={() => openJoinModal(activity)}
                      >
                        <FontAwesomeIcon icon={faUserPlus} />
                        {t('clubs.CulturalActivities.activity.buttons.register')}
                      </button>
                      <button 
                        className="cultural-activities-btn-secondary"
                        onClick={() => handleInfoRequest(activity)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        {t('clubs.CulturalActivities.activity.buttons.more')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'courses' && hasCourses && (
            <div className="cultural-activities-courses">
              <div className="cultural-activities-grid">
                {courses.map((course, index) => (
                  <div key={index} className="cultural-activities-course-card">
                    <div className="cultural-activities-course-header">
                      <div className="cultural-activities-course-icon">
                        <FontAwesomeIcon icon={faGraduationCap} />
                      </div>
                      <div className="cultural-activities-course-title">
                        <h3>{course.name}</h3>
                        {course.duration && (
                          <div className="cultural-activities-course-duration">{course.duration}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="cultural-activities-course-content">
                      {course.description && (
                        <p className="cultural-activities-course-description">{course.description}</p>
                      )}
                      
                      <div className="cultural-activities-course-details">
                        {course.instructor && (
                          <div className="cultural-activities-course-detail-item">
                            <FontAwesomeIcon icon={faUser} />
                            <span>{t('clubs.CulturalActivities.course.teacher')}: {course.instructor}</span>
                          </div>
                        )}
                        {course.participants && (
                          <div className="cultural-activities-course-detail-item">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{course.participants} {t('clubs.CulturalActivities.activity.participants')}</span>
                          </div>
                        )}
                        {course.schedule && (
                          <div className="cultural-activities-course-detail-item">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>{t('clubs.CulturalActivities.course.schedule')}: {course.schedule}</span>
                          </div>
                        )}
                        {course.startDate && (
                          <div className="cultural-activities-course-detail-item">
                            <FontAwesomeIcon icon={faPlay} />
                            <span>{t('clubs.CulturalActivities.course.starts')}: {formatDate(course.startDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="cultural-activities-course-actions">
                      <button 
                        className="cultural-activities-btn-primary"
                        onClick={() => openJoinModal(course)}
                      >
                        <FontAwesomeIcon icon={faUserPlus} />
                        {t('clubs.CulturalActivities.activity.buttons.register')}
                      </button>
                      <button 
                        className="cultural-activities-btn-secondary"
                        onClick={() => handleInfoRequest(course)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        {t('clubs.CulturalActivities.course.buttons.details')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'special' && hasSpecialPrograms && (
            <div className="cultural-activities-special">
              <div className="cultural-activities-special-grid">
                {specialPrograms.map((program, index) => (
                  <div key={index} className="cultural-activities-special-card">
                    <div className="cultural-activities-special-icon">
                      <FontAwesomeIcon icon={getActivityIcon(program.name)} />
                    </div>
                    <div className="cultural-activities-special-content">
                      <h3>{program.name}</h3>
                      {program.description && <p>{program.description}</p>}
                      <div className="cultural-activities-special-stats">
                        {program.participants && (
                          <div className="cultural-activities-special-stat">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{program.participants} {t('clubs.CulturalActivities.activity.participants')}</span>
                          </div>
                        )}
                        {program.frequency && (
                          <div className="cultural-activities-special-stat">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{program.frequency}</span>
                          </div>
                        )}
                      </div>
                      <button 
                        className="cultural-activities-special-btn"
                        onClick={() => handleInfoRequest(program)}
                      >
                        {t('clubs.CulturalActivities.special.learnMore')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasRegularActivities && regularActivities.some(activity => activity.day) && (
          <div className="cultural-activities-schedule">
            <div className="cultural-activities-schedule-header">
              <h3>{t('clubs.CulturalActivities.schedule.title')}</h3>
              <p>{t('clubs.CulturalActivities.schedule.subtitle')}</p>
            </div>
            <div className="cultural-activities-weekly-grid">
              {getWeekDays().map((day, index) => {
                const dayActivities = regularActivities.filter(activity => 
                  activity.day && activity.day.toLowerCase() === day.toLowerCase()
                );
                
                return (
                  <div key={index} className="cultural-activities-day-column">
                    <div className="cultural-activities-day-header">
                      <h4>{day}</h4>
                    </div>
                    <div className="cultural-activities-day-content">
                      {dayActivities.length > 0 ? (
                        dayActivities.map((activity, actIndex) => (
                          <div key={actIndex} className="cultural-activities-day-activity">
                            {activity.time && <div className="cultural-activities-day-time">{activity.time}</div>}
                            <div className="cultural-activities-day-name">{activity.name}</div>
                            {activity.instructor && <div className="cultural-activities-day-instructor">{activity.instructor}</div>}
                          </div>
                        ))
                      ) : (
                        <div className="cultural-activities-no-activities">
                          {t('clubs.CulturalActivities.schedule.noActivities')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="cultural-activities-cta">
          <div className="cultural-activities-cta-content">
            <h3>{t('clubs.CulturalActivities.cta.title')}</h3>
            <p>{t('clubs.CulturalActivities.cta.subtitle')}</p>
            <div className="cultural-activities-cta-buttons">
              <button className="cultural-activities-cta-primary" onClick={openContactModal}>
                <FontAwesomeIcon icon={faUserPlus} />
                {t('clubs.CulturalActivities.cta.registerNow')}
              </button>
              <button className="cultural-activities-cta-secondary" onClick={openContactModal}>
                <FontAwesomeIcon icon={faInfoCircle} />
                {t('clubs.CulturalActivities.cta.contactUs')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showJoinModal && selectedActivity && (
        <div className="cultural-activities-join-modal">
          <div className="cultural-activities-join-modal-overlay" onClick={closeJoinModal}></div>
          <div className="cultural-activities-join-modal-container">
            <button className="cultural-activities-join-modal-close" onClick={closeJoinModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-activities-join-header">
              <FontAwesomeIcon icon={faUserPlus} />
              <h3>{t('clubs.CulturalActivities.modals.join.title', { activityName: selectedActivity.name })}</h3>
              <p>{t('clubs.CulturalActivities.modals.join.subtitle')}</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="cultural-activities-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.CulturalActivities.modals.join.success.title')}</h4>
                <p>{t('clubs.CulturalActivities.modals.join.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="cultural-activities-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.CulturalActivities.form.error.title')}</h4>
                <p>{t('clubs.CulturalActivities.form.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="cultural-activities-join-form">
                <div className="cultural-activities-form-row">
                  <div className="cultural-activities-form-group">
                    <label htmlFor="joinName">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.CulturalActivities.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="joinName"
                      value={joinForm.name}
                      onChange={(e) => handleJoinFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalActivities.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-activities-form-group">
                    <label htmlFor="joinEmail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalActivities.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="joinEmail"
                      value={joinForm.email}
                      onChange={(e) => handleJoinFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalActivities.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="joinPhone">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.CulturalActivities.form.phoneRequired')} *
                  </label>
                  <input
                    type="tel"
                    id="joinPhone"
                    value={joinForm.phone}
                    onChange={(e) => handleJoinFormChange('phone', e.target.value)}
                    required
                    placeholder={t('clubs.CulturalActivities.form.phonePlaceholder')}
                  />
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="joinMessage">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.CulturalActivities.form.messageOptional')}
                  </label>
                  <textarea
                    id="joinMessage"
                    value={joinForm.message}
                    onChange={(e) => handleJoinFormChange('message', e.target.value)}
                    placeholder={t('clubs.CulturalActivities.form.messagePlaceholder')}
                    rows="4"
                  />
                </div>
                
                <div className="cultural-activities-form-actions">
                  <button 
                    type="submit" 
                    className="cultural-activities-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    {formStatus === 'sending' ? t('clubs.CulturalActivities.form.sending') : t('clubs.CulturalActivities.form.submitRequest')}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeJoinModal}
                    className="cultural-activities-cancel-btn"
                  >
                    {t('clubs.CulturalActivities.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="cultural-activities-contact-modal">
          <div className="cultural-activities-contact-modal-overlay" onClick={closeContactModal}></div>
          <div className="cultural-activities-contact-modal-container">
            <button className="cultural-activities-contact-modal-close" onClick={closeContactModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-activities-contact-header">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h3>{t('clubs.CulturalActivities.modals.contact.title')}</h3>
              <p>{t('clubs.CulturalActivities.modals.contact.subtitle')}</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="cultural-activities-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.CulturalActivities.modals.contact.success.title')}</h4>
                <p>{t('clubs.CulturalActivities.modals.contact.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="cultural-activities-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.CulturalActivities.form.error.title')}</h4>
                <p>{t('clubs.CulturalActivities.form.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="cultural-activities-contact-form">
                <div className="cultural-activities-form-row">
                  <div className="cultural-activities-form-group">
                    <label htmlFor="contactName">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.CulturalActivities.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      value={contactForm.name}
                      onChange={(e) => handleContactFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalActivities.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-activities-form-group">
                    <label htmlFor="contactEmail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalActivities.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={contactForm.email}
                      onChange={(e) => handleContactFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalActivities.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="contactPhone">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.CulturalActivities.form.phoneOptional')}
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={contactForm.phone}
                    onChange={(e) => handleContactFormChange('phone', e.target.value)}
                    placeholder={t('clubs.CulturalActivities.form.phonePlaceholder')}
                  />
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="contactMessage">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.CulturalActivities.form.messageRequired')} *
                  </label>
                  <textarea
                    id="contactMessage"
                    value={contactForm.message}
                    onChange={(e) => handleContactFormChange('message', e.target.value)}
                    required
                    placeholder={t('clubs.CulturalActivities.modals.contact.messagePlaceholder')}
                    rows="4"
                  />
                </div>
                
                <div className="cultural-activities-form-actions">
                  <button 
                    type="submit" 
                    className="cultural-activities-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? t('clubs.CulturalActivities.form.sending') : t('clubs.CulturalActivities.form.sendMessage')}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeContactModal}
                    className="cultural-activities-cancel-btn"
                  >
                    {t('clubs.CulturalActivities.form.cancel')}
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

export default CulturalActivities;