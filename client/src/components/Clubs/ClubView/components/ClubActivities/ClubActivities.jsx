import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarWeek, 
  faClock, 
  faUser,
  faUsers,
  faMapPin,
  faInfoCircle,
  faUserPlus,
  faTimes,
  faPhone,
  faEnvelope,
  faCheck,
  faExclamationTriangle,
  faGraduationCap,
  faHeart,
  faDumbbell,
  faMusic,
  faPalette,
  faBookOpen,
  faUtensils,
  faTheaterMasks,
  faRunning
} from '@fortawesome/free-solid-svg-icons';
import './clubActivities.css';

export const ClubActivities = ({ club }) => {
  const { t } = useTranslation();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    experience: '',
    notes: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  // ПРОВЕРКА ЗА ДАННИ - ако няма дейности, не показваме компонента
  if (!club?.activities?.regular || club.activities.regular.length === 0) {
    return null;
  }

  const activities = club.activities.regular.filter(activity => 
    activity && activity.name && (activity.day || activity.time)
  );

  if (activities.length === 0) {
    return null;
  }

  // Получаване на икона според типа дейност
  const getActivityIcon = (activityName) => {
    const name = activityName.toLowerCase();
    
    if (name.includes('хор') || name.includes('пеене') || name.includes('музика') || 
        name.includes('choir') || name.includes('music') || name.includes('singing')) {
      return faMusic;
    } else if (name.includes('танц') || name.includes('народни') || 
               name.includes('dance') || name.includes('traditional')) {
      return faTheaterMasks;
    } else if (name.includes('рисуване') || name.includes('изкуство') || name.includes('творчески') ||
               name.includes('art') || name.includes('drawing') || name.includes('creative')) {
      return faPalette;
    } else if (name.includes('четене') || name.includes('книги') || name.includes('литература') ||
               name.includes('reading') || name.includes('books') || name.includes('literature')) {
      return faBookOpen;
    } else if (name.includes('готвене') || name.includes('кулинария') || name.includes('храна') ||
               name.includes('cooking') || name.includes('culinary') || name.includes('food')) {
      return faUtensils;
    } else if (name.includes('гимнастика') || name.includes('упражнения') || name.includes('фитнес') ||
               name.includes('gym') || name.includes('exercise') || name.includes('fitness')) {
      return faDumbbell;
    } else if (name.includes('разходка') || name.includes('туризъм') || name.includes('спорт') ||
               name.includes('walk') || name.includes('tourism') || name.includes('sport')) {
      return faRunning;
    } else if (name.includes('образование') || name.includes('курс') || name.includes('обучение') ||
               name.includes('education') || name.includes('course') || name.includes('learning')) {
      return faGraduationCap;
    } else {
      return faHeart; // За общи дейности
    }
  };

  const getDayInBulgarian = (day) => {
    if (!day) return t('clubs.ClubActivities.schedule.noDay');
    return t(`clubs.ClubActivities.days.${day.toLowerCase()}`, { 
      defaultValue: day 
    });
  };

  // Групиране на дейности по дни
  const getWeeklySchedule = () => {
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule = {};
    
    daysOrder.forEach(day => {
      schedule[day] = activities.filter(activity => 
        activity.day?.toLowerCase() === day
      ).sort((a, b) => {
        const timeA = a.time ? a.time.split(':')[0] : '00';
        const timeB = b.time ? b.time.split(':')[0] : '00';
        return parseInt(timeA) - parseInt(timeB);
      });
    });
    
    return schedule;
  };

  const weeklySchedule = getWeeklySchedule();

  // Отваряне на модал за записване
  const openRegistrationModal = (activity) => {
    setSelectedActivity(activity);
    setShowRegistrationModal(true);
    setFormStatus(null);
    setRegistrationForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      experience: '',
      notes: ''
    });
  };

  // Затваряне на модал
  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setSelectedActivity(null);
    setFormStatus(null);
  };

  // Обработка на формата
  const handleFormChange = (field, value) => {
    setRegistrationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    // Симулация на изпращане - в реалност би се изпратил към сървър
    const recipientEmail = club.contacts?.email;
    
    if (recipientEmail) {
      const subject = encodeURIComponent(t('clubs.ClubActivities.registration.emailSubject', { 
        activityName: selectedActivity.name 
      }));
      
      const body = encodeURIComponent(t('clubs.ClubActivities.registration.emailBody', {
        firstName: registrationForm.firstName,
        lastName: registrationForm.lastName,
        phone: registrationForm.phone,
        email: registrationForm.email,
        activityName: selectedActivity.name,
        day: getDayInBulgarian(selectedActivity.day),
        time: selectedActivity.time,
        instructor: selectedActivity.instructor || t('clubs.ClubActivities.registration.notSpecified'),
        experience: registrationForm.experience ? t(`clubs.ClubActivities.experience.${registrationForm.experience}`) : t('clubs.ClubActivities.registration.notSpecified'),
        notes: registrationForm.notes || t('clubs.ClubActivities.registration.none'),
        clubName: club.name
      }));

      try {
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        setFormStatus('success');
        
        setTimeout(() => {
          closeRegistrationModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
        setTimeout(() => setFormStatus(null), 3000);
      }
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  return (
    <section id="general-activities" className="general-activities-main">
      <div className="general-activities-container">
        
        {/* Header */}
        <div className="general-activities-header">
          <div className="general-activities-badge">
            <FontAwesomeIcon icon={faCalendarWeek} />
            <span>{t('clubs.ClubActivities.header.badge')}</span>
          </div>
          <h2 className="general-activities-title">{t('clubs.ClubActivities.header.title')}</h2>
          <p className="general-activities-subtitle">
            {t('clubs.ClubActivities.header.subtitle')}
          </p>
          
          {/* Stats overview */}
          <div className="general-activities-stats">
            <div className="general-activities-stat">
              <span>{activities.length}</span>
              <label>{t('clubs.ClubActivities.stats.activities')}</label>
            </div>
            <div className="general-activities-stat">
              <span>{activities.reduce((sum, act) => sum + (act.participants || 0), 0)}</span>
              <label>{t('clubs.ClubActivities.stats.participants')}</label>
            </div>
            <div className="general-activities-stat">
              <span>{new Set(activities.map(act => act.day)).size}</span>
              <label>{t('clubs.ClubActivities.stats.daysPerWeek')}</label>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="general-activities-grid">
          {activities.map((activity, index) => (
            <div key={index} className="general-activity-card">
              <div className="general-activity-icon">
                <FontAwesomeIcon icon={getActivityIcon(activity.name)} />
              </div>
              
              <div className="general-activity-content">
                <h3 className="general-activity-name">{activity.name}</h3>
                
                <div className="general-activity-details">
                  <div className="general-activity-schedule">
                    <div className="general-schedule-item">
                      <FontAwesomeIcon icon={faCalendarWeek} />
                      <span>{getDayInBulgarian(activity.day)}</span>
                    </div>
                    <div className="general-schedule-item">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{activity.time || t('clubs.ClubActivities.schedule.noTime')}</span>
                    </div>
                  </div>
                  
                  {activity.instructor && (
                    <div className="general-activity-instructor">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{activity.instructor}</span>
                    </div>
                  )}
                  
                  {activity.description && (
                    <p className="general-activity-description">{activity.description}</p>
                  )}
                  
                  <div className="general-activity-participants">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{activity.participants || 0} {t('clubs.ClubActivities.activity.participants')}</span>
                  </div>
                </div>
              </div>
              
              <div className="general-activity-actions">
                <button 
                  className="general-register-btn"
                  onClick={() => openRegistrationModal(activity)}
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  {t('clubs.ClubActivities.activity.register')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Schedule */}
        <div className="general-weekly-schedule">
          <h3>
            <FontAwesomeIcon icon={faCalendarWeek} />
            {t('clubs.ClubActivities.weeklySchedule.title')}
          </h3>
          
          <div className="general-schedule-grid">
            {Object.entries(weeklySchedule).map(([day, dayActivities]) => (
              <div key={day} className="general-day-column">
                <div className="general-day-header">
                  <h4>{getDayInBulgarian(day)}</h4>
                </div>
                
                <div className="general-day-activities">
                  {dayActivities.length > 0 ? (
                    dayActivities.map((activity, index) => (
                      <div key={index} className="general-schedule-activity">
                        <div className="general-schedule-time">
                          {activity.time || '—'}
                        </div>
                        <div className="general-schedule-name">
                          {activity.name}
                        </div>
                        {activity.participants && (
                          <div className="general-schedule-participants">
                            {activity.participants} {t('clubs.ClubActivities.weeklySchedule.people')}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="general-no-activity">
                      {t('clubs.ClubActivities.weeklySchedule.noActivities')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedActivity && (
        <div className="general-modal-overlay" onClick={closeRegistrationModal}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faUserPlus} />
                {t('clubs.ClubActivities.modal.title')}
              </h3>
              <button className="general-modal-close" onClick={closeRegistrationModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              {/* Activity Info */}
              <div className="general-selected-activity">
                <div className="general-selected-activity-icon">
                  <FontAwesomeIcon icon={getActivityIcon(selectedActivity.name)} />
                </div>
                <div className="general-selected-activity-info">
                  <h4>{selectedActivity.name}</h4>
                  <div className="general-selected-activity-meta">
                    <span>📅 {getDayInBulgarian(selectedActivity.day)}</span>
                    <span>🕐 {selectedActivity.time}</span>
                    {selectedActivity.instructor && (
                      <span>👨‍🏫 {selectedActivity.instructor}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegistrationSubmit} className="general-registration-form">
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>{t('clubs.ClubActivities.form.firstName')} *</label>
                    <input
                      type="text"
                      value={registrationForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder={t('clubs.ClubActivities.form.firstNamePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>{t('clubs.ClubActivities.form.lastName')} *</label>
                    <input
                      type="text"
                      value={registrationForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder={t('clubs.ClubActivities.form.lastNamePlaceholder')}
                      required
                    />
                  </div>
                </div>
                
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>{t('clubs.ClubActivities.form.phone')} *</label>
                    <input
                      type="tel"
                      value={registrationForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder={t('clubs.ClubActivities.form.phonePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>{t('clubs.ClubActivities.form.email')}</label>
                    <input
                      type="email"
                      value={registrationForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder={t('clubs.ClubActivities.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="general-form-group">
                  <label>{t('clubs.ClubActivities.form.experience')}</label>
                  <select
                    value={registrationForm.experience}
                    onChange={(e) => handleFormChange('experience', e.target.value)}
                  >
                    <option value="">{t('clubs.ClubActivities.form.selectLevel')}</option>
                    <option value="none">{t('clubs.ClubActivities.experience.none')}</option>
                    <option value="beginner">{t('clubs.ClubActivities.experience.beginner')}</option>
                    <option value="intermediate">{t('clubs.ClubActivities.experience.intermediate')}</option>
                    <option value="advanced">{t('clubs.ClubActivities.experience.advanced')}</option>
                  </select>
                </div>
                
                <div className="general-form-group">
                  <label>{t('clubs.ClubActivities.form.notes')}</label>
                  <textarea
                    value={registrationForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder={t('clubs.ClubActivities.form.notesPlaceholder')}
                    rows="3"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="general-submit-btn"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="general-spinner"></div>
                      {t('clubs.ClubActivities.form.sending')}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      {t('clubs.ClubActivities.form.submit')}
                    </>
                  )}
                </button>
                
                {formStatus === 'success' && (
                  <div className="general-success-message">
                    <FontAwesomeIcon icon={faCheck} />
                    {t('clubs.ClubActivities.messages.success')}
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="general-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {t('clubs.ClubActivities.messages.error')}
                  </div>
                )}
              </form>

              {/* Contact info */}
              <div className="general-contact-info">
                <p>{t('clubs.ClubActivities.contact.directContact')}</p>
                <div className="general-contact-methods">
                  {club.contacts?.phone && (
                    <a href={`tel:${club.contacts.phone}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faPhone} />
                      {club.contacts.phone}
                    </a>
                  )}
                  {club.contacts?.email && (
                    <a href={`mailto:${club.contacts.email}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {club.contacts.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubActivities;