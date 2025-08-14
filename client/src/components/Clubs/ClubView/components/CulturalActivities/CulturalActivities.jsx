import { useState } from 'react';
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

  // Проверяваме дали има необходимите данни
  if (!club?.activities) {
    return null;
  }

  const activityIcons = {
    'хор': faMusic,
    'танци': faTheaterMasks,
    'рисуване': faPalette,
    'четене': faBookOpen,
    'курсове': faGraduationCap,
    'музика': faMusic,
    'театър': faTheaterMasks,
    'изкуство': faPalette,
    'default': faUsers
  };

  const getActivityIcon = (activityName) => {
    const name = activityName.toLowerCase();
    for (const [key, icon] of Object.entries(activityIcons)) {
      if (name.includes(key)) return icon;
    }
    return activityIcons.default;
  };

  const weekDays = ['понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота', 'неделя'];

  // Само реални данни от club
  const regularActivities = club.activities?.regular || [];
  const courses = club.activities?.courses || [];
  const specialPrograms = club.activities?.special || [];

  // Проверяваме дали има какво да показваме
  const hasRegularActivities = regularActivities.length > 0;
  const hasCourses = courses.length > 0;
  const hasSpecialPrograms = specialPrograms.length > 0;
  const hasAnyActivities = hasRegularActivities || hasCourses || hasSpecialPrograms;

  // Ако няма никакви дейности, не показваме компонента
  if (!hasAnyActivities) {
    return null;
  }

  // Функции за форми
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
      const subject = encodeURIComponent(`Записване за дейност в ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте заявка за записване за дейност от ${club.name}:

Дейност: ${joinForm.activityName}
Име: ${joinForm.name}
Имейл: ${joinForm.email}
Телефон: ${joinForm.phone || 'Не е посочен'}

Съобщение:
${joinForm.message || 'Няма допълнително съобщение'}

---
Изпратено от ${joinForm.email}
      `);
      
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
      const subject = encodeURIComponent(`Запитване за дейности от ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте запитване за дейности от ${club.name}:

Име: ${contactForm.name}
Имейл: ${contactForm.email}
Телефон: ${contactForm.phone || 'Не е посочен'}

Съобщение:
${contactForm.message}

---
Изпратено от ${contactForm.email}
      `);
      
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
      message: `Моля, изпратете ми повече информация за "${activity.name}".`
    }));
    setShowContactModal(true);
  };

  // Set initial tab based on available content
  if (activeTab === 'regular' && !hasRegularActivities) {
    if (hasCourses) setActiveTab('courses');
    else if (hasSpecialPrograms) setActiveTab('special');
  }

  return (
    <section id="cultural-activities" className="cultural-activities-main-section">
      <div className="cultural-activities-container">
        
        {/* Header */}
        <div className="cultural-activities-header">
          <div className="cultural-activities-badge">
            <FontAwesomeIcon icon={faMusic} />
            <span>Дейности и програми</span>
          </div>
          <h2 className="cultural-activities-title">Нашите културни дейности</h2>
          <p className="cultural-activities-subtitle">
            Открийте богатството на българската култура чрез разнообразни програми и работилници
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="cultural-activities-tabs">
          {hasRegularActivities && (
            <button 
              className={`cultural-activities-tab ${activeTab === 'regular' ? 'active' : ''}`}
              onClick={() => setActiveTab('regular')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              Редовни дейности ({regularActivities.length})
            </button>
          )}
          {hasCourses && (
            <button 
              className={`cultural-activities-tab ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <FontAwesomeIcon icon={faGraduationCap} />
              Курсове и обучения ({courses.length})
            </button>
          )}
          {hasSpecialPrograms && (
            <button 
              className={`cultural-activities-tab ${activeTab === 'special' ? 'active' : ''}`}
              onClick={() => setActiveTab('special')}
            >
              <FontAwesomeIcon icon={faStar} />
              Специални програми ({specialPrograms.length})
            </button>
          )}
        </div>

        {/* Content Based on Active Tab */}
        <div className="cultural-activities-content">
          
          {/* Regular Activities */}
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
                            <span>Инструктор: {activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{activity.participants} участници</span>
                          </div>
                        )}
                        {activity.level && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faStar} />
                            <span>Ниво: {activity.level}</span>
                          </div>
                        )}
                        {activity.duration && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faClock} />
                            <span>Продължителност: {activity.duration}</span>
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
                        Записване
                      </button>
                      <button 
                        className="cultural-activities-btn-secondary"
                        onClick={() => handleInfoRequest(activity)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Повече
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
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
                            <span>Преподавател: {course.instructor}</span>
                          </div>
                        )}
                        {course.participants && (
                          <div className="cultural-activities-course-detail-item">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{course.participants} участници</span>
                          </div>
                        )}
                        {course.schedule && (
                          <div className="cultural-activities-course-detail-item">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>График: {course.schedule}</span>
                          </div>
                        )}
                        {course.startDate && (
                          <div className="cultural-activities-course-detail-item">
                            <FontAwesomeIcon icon={faPlay} />
                            <span>Започва: {new Date(course.startDate).toLocaleDateString('bg-BG')}</span>
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
                        Записване
                      </button>
                      <button 
                        className="cultural-activities-btn-secondary"
                        onClick={() => handleInfoRequest(course)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Детайли
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Programs */}
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
                            <span>{program.participants} участници</span>
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
                        Научете повече
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weekly Schedule Overview */}
        {hasRegularActivities && regularActivities.some(activity => activity.day) && (
          <div className="cultural-activities-schedule">
            <div className="cultural-activities-schedule-header">
              <h3>Седмична програма</h3>
              <p>Преглед на всички дейности по дни</p>
            </div>
            <div className="cultural-activities-weekly-grid">
              {weekDays.map((day, index) => {
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
                          Няма планирани дейности
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="cultural-activities-cta">
          <div className="cultural-activities-cta-content">
            <h3>Готови да се включите?</h3>
            <p>Присъединете се към някоя от нашите програми и открийте нови таланти и приятели</p>
            <div className="cultural-activities-cta-buttons">
              <button className="cultural-activities-cta-primary" onClick={openContactModal}>
                <FontAwesomeIcon icon={faUserPlus} />
                Запишете се сега
              </button>
              <button className="cultural-activities-cta-secondary" onClick={openContactModal}>
                <FontAwesomeIcon icon={faInfoCircle} />
                Свържете се с нас
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Join Activity Modal */}
      {showJoinModal && selectedActivity && (
        <div className="cultural-activities-join-modal">
          <div className="cultural-activities-join-modal-overlay" onClick={closeJoinModal}></div>
          <div className="cultural-activities-join-modal-container">
            <button className="cultural-activities-join-modal-close" onClick={closeJoinModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-activities-join-header">
              <FontAwesomeIcon icon={faUserPlus} />
              <h3>Записване за {selectedActivity.name}</h3>
              <p>Попълнете формата и ще се свържем с вас за потвърждение</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="cultural-activities-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Заявката е изпратена!</h4>
                <p>Благодарим ви! Ще се свържем с вас скоро за потвърждение на записването.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="cultural-activities-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="cultural-activities-join-form">
                <div className="cultural-activities-form-row">
                  <div className="cultural-activities-form-group">
                    <label htmlFor="joinName">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="joinName"
                      value={joinForm.name}
                      onChange={(e) => handleJoinFormChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="cultural-activities-form-group">
                    <label htmlFor="joinEmail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="joinEmail"
                      value={joinForm.email}
                      onChange={(e) => handleJoinFormChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="joinPhone">
                    <FontAwesomeIcon icon={faPhone} />
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="joinPhone"
                    value={joinForm.phone}
                    onChange={(e) => handleJoinFormChange('phone', e.target.value)}
                    required
                    placeholder="Въведете вашия телефон"
                  />
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="joinMessage">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Допълнително съобщение (по желание)
                  </label>
                  <textarea
                    id="joinMessage"
                    value={joinForm.message}
                    onChange={(e) => handleJoinFormChange('message', e.target.value)}
                    placeholder="Опишете нивото си на опит или задайте въпрос..."
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
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявка'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeJoinModal}
                    className="cultural-activities-cancel-btn"
                  >
                    Отказ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="cultural-activities-contact-modal">
          <div className="cultural-activities-contact-modal-overlay" onClick={closeContactModal}></div>
          <div className="cultural-activities-contact-modal-container">
            <button className="cultural-activities-contact-modal-close" onClick={closeContactModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-activities-contact-header">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h3>Свържете се с нас</h3>
              <p>Задайте вашия въпрос и ще ви отговорим възможно най-скоро</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="cultural-activities-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Съобщението е изпратено!</h4>
                <p>Благодарим ви! Ще се свържем с вас скоро.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="cultural-activities-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="cultural-activities-contact-form">
                <div className="cultural-activities-form-row">
                  <div className="cultural-activities-form-group">
                    <label htmlFor="contactName">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      value={contactForm.name}
                      onChange={(e) => handleContactFormChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="cultural-activities-form-group">
                    <label htmlFor="contactEmail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={contactForm.email}
                      onChange={(e) => handleContactFormChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="contactPhone">
                    <FontAwesomeIcon icon={faPhone} />
                    Телефон (по желание)
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={contactForm.phone}
                    onChange={(e) => handleContactFormChange('phone', e.target.value)}
                    placeholder="Въведете вашия телефон"
                  />
                </div>
                
                <div className="cultural-activities-form-group">
                  <label htmlFor="contactMessage">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Съобщение *
                  </label>
                  <textarea
                    id="contactMessage"
                    value={contactForm.message}
                    onChange={(e) => handleContactFormChange('message', e.target.value)}
                    required
                    placeholder="Какво бихте искали да знаете?"
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
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщение'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeContactModal}
                    className="cultural-activities-cancel-btn"
                  >
                    Отказ
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