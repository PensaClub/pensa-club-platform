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
  faRunning,
  faCalendarDay,
  faRoute,
  faStar
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

  // Безопасна функция за конвертиране на номер на ден в име на ден
  const getNumericDayName = (dayOfWeek) => {
    if (dayOfWeek === undefined || dayOfWeek === null) return '';
    
    const dayNames = {
      0: 'sunday',
      1: 'monday', 
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    return dayNames[dayOfWeek] || '';
  };

  // Безопасна функция за получаване на ден от дата
  const getEventDay = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return dayNames[date.getDay()] || '';
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return '';
    }
  };

  // ОБЕДИНЯВАНЕ НА ВСИЧКИ ДЕЙНОСТИ със защити - ОБНОВЕНО ЗА НОВАТА СТРУКТУРА
  const getAllActivities = () => {
    const allActivities = [];

    try {
      // Regular activities - ОБНОВЕНО
      if (club?.activities?.regular && Array.isArray(club.activities.regular)) {
        club.activities.regular.forEach((activity, index) => {
          try {
            if (activity && typeof activity === 'object' && activity.name) {
              allActivities.push({
                ...activity,
                type: 'regular',
                displayName: activity.name,
                day: getNumericDayName(activity.schedule?.dayOfWeek),
                time: activity.schedule?.startTime || '—',
                duration: activity.schedule?.duration || null,
                participants: activity.capacity?.max || 0,
                instructor: activity.instructor || null,
                location: activity.location || null,
                price: activity.fee?.required ? `${activity.fee.amount} лв. / ${activity.fee.period}` : null,
                category: activity.category || 'general',
                requirements: activity.requirements || null,
                equipment: activity.equipment || [],
                ageGroup: activity.ageGroup || null,
                id: activity.id || `regular-${index}`
              });
            }
          } catch (error) {
            console.error('Error processing regular activity:', activity, error);
          }
        });
      }

      // Events - ОБНОВЕНО
      if (club?.activities?.events && Array.isArray(club.activities.events)) {
        club.activities.events.forEach((event, index) => {
          try {
            if (event && typeof event === 'object' && event.title) {
              allActivities.push({
                ...event,
                type: 'event',
                displayName: event.title,
                name: event.title,
                day: getEventDay(event.date),
                time: event.time || '—',
                participants: event.participants || 0,
                instructor: event.organizer || null,
                location: event.location || null,
                price: event.price || null,
                featured: event.featured || false,
                highlights: event.highlights || [],
                images: event.images || [],
                videos: event.videos || [],
                date: event.date || null,
                id: event.id || `event-${index}`
              });
            }
          } catch (error) {
            console.error('Error processing event:', event, error);
          }
        });
      }

      // Trips - ОБНОВЕНО
      if (club?.activities?.trips && Array.isArray(club.activities.trips)) {
        club.activities.trips.forEach((trip, index) => {
          try {
            if (trip && typeof trip === 'object' && trip.destination) {
              allActivities.push({
                ...trip,
                type: 'trip',
                displayName: trip.destination,
                name: trip.destination,
                day: getEventDay(trip.date),
                time: '—',
                participants: trip.participants || 0,
                instructor: null,
                location: trip.destination,
                price: trip.price ? `${trip.price} лв.` : null,
                date: trip.date || null,
                id: trip.id || `trip-${index}`
              });
            }
          } catch (error) {
            console.error('Error processing trip:', trip, error);
          }
        });
      }

      // Courses - ОБНОВЕНО  
      if (club?.activities?.courses && Array.isArray(club.activities.courses)) {
        club.activities.courses.forEach((course, index) => {
          try {
            if (course && typeof course === 'object' && course.name) {
              allActivities.push({
                ...course,
                type: 'course',
                displayName: course.name,
                name: course.name,
                day: '—',
                time: '—',
                participants: course.participants || 0,
                instructor: course.instructor || null,
                location: null,
                price: null,
                duration: course.duration || null,
                id: course.id || `course-${index}`
              });
            }
          } catch (error) {
            console.error('Error processing course:', course, error);
          }
        });
      }
    } catch (error) {
      console.error('Error processing activities:', error);
    }

    return allActivities;
  };

  const activities = getAllActivities();

  // Ако няма дейности, не показваме компонента
  if (!activities || activities.length === 0) {
    return null;
  }

  // Получаване на икона според типа дейност
  const getActivityIcon = (activity) => {
    if (!activity) return faHeart;
    
    const activityName = activity.displayName?.toLowerCase() || '';
    const activityType = activity.type;

    // По тип дейност
    if (activityType === 'event') {
      return faCalendarDay;
    } else if (activityType === 'trip') {
      return faRoute;
    } else if (activityType === 'course') {
      return faGraduationCap;
    }

    // По име на дейността
    if (activityName.includes('хор') || activityName.includes('пеене') || activityName.includes('музика') || 
        activityName.includes('choir') || activityName.includes('music') || activityName.includes('singing')) {
      return faMusic;
    } else if (activityName.includes('танц') || activityName.includes('народни') || 
               activityName.includes('dance') || activityName.includes('traditional')) {
      return faTheaterMasks;
    } else if (activityName.includes('рисуване') || activityName.includes('изкуство') || activityName.includes('творчески') ||
               activityName.includes('art') || activityName.includes('drawing') || activityName.includes('creative')) {
      return faPalette;
    } else if (activityName.includes('четене') || activityName.includes('книги') || activityName.includes('литература') ||
               activityName.includes('reading') || activityName.includes('books') || activityName.includes('literature')) {
      return faBookOpen;
    } else if (activityName.includes('готвене') || activityName.includes('кулинария') || activityName.includes('храна') ||
               activityName.includes('cooking') || activityName.includes('culinary') || activityName.includes('food')) {
      return faUtensils;
    } else if (activityName.includes('гимнастика') || activityName.includes('упражнения') || activityName.includes('фитнес') ||
               activityName.includes('gym') || activityName.includes('exercise') || activityName.includes('fitness') ||
               activityName.includes('йога') || activityName.includes('yoga')) {
      return faDumbbell;
    } else if (activityName.includes('разходка') || activityName.includes('туризъм') || activityName.includes('спорт') ||
               activityName.includes('walk') || activityName.includes('tourism') || activityName.includes('sport')) {
      return faRunning;
    } else {
      return faHeart;
    }
  };

  const getDayInBulgarian = (day) => {
    if (!day || day === '—' || day === '') return 'Не е определен';
    
    const dayTranslations = {
      'monday': 'Понеделник',
      'tuesday': 'Вторник', 
      'wednesday': 'Сряда',
      'thursday': 'Четвъртък',
      'friday': 'Петък',
      'saturday': 'Събота',
      'sunday': 'Неделя'
    };
    
    return dayTranslations[day] || day;
  };

  // Групиране на дейности по дни
  const getWeeklySchedule = () => {
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule = {};
    
    try {
      daysOrder.forEach(day => {
        schedule[day] = activities.filter(activity => 
          activity && activity.day === day
        ).sort((a, b) => {
          try {
            const timeA = a.time && a.time !== '—' ? a.time.split(':')[0] : '00';
            const timeB = b.time && b.time !== '—' ? b.time.split(':')[0] : '00';
            return parseInt(timeA) - parseInt(timeB);
          } catch (error) {
            return 0;
          }
        });
      });
    } catch (error) {
      console.error('Error creating weekly schedule:', error);
    }
    
    return schedule;
  };

  const weeklySchedule = getWeeklySchedule();

  // Отваряне на модал за записване
  const openRegistrationModal = (activity) => {
    if (!activity) return;
    
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
    if (!field) return;
    setRegistrationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    if (!selectedActivity) return;
    
    setFormStatus('sending');

    const recipientEmail = club?.contacts?.basic?.email || club?.contacts?.email;
    
    if (recipientEmail) {
      try {
        const subject = encodeURIComponent(`Записване за ${selectedActivity.displayName || 'дейност'}`);
        
        const body = encodeURIComponent(`Здравейте,

Искам да се запиша за: ${selectedActivity.displayName || 'дейност'}
Ден: ${getDayInBulgarian(selectedActivity.day)}
Час: ${selectedActivity.time || '—'}
${selectedActivity.instructor ? `Инструктор: ${selectedActivity.instructor}` : ''}

Моите данни:
Име: ${registrationForm.firstName}
Фамилия: ${registrationForm.lastName}
Телефон: ${registrationForm.phone}
Email: ${registrationForm.email}
${registrationForm.experience ? `Опит: ${registrationForm.experience}` : ''}
${registrationForm.notes ? `Бележки: ${registrationForm.notes}` : ''}

С уважение,
${registrationForm.firstName} ${registrationForm.lastName}`);

        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        setFormStatus('success');
        
        setTimeout(() => {
          closeRegistrationModal();
        }, 2000);
      } catch (error) {
        console.error('Error sending email:', error);
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
            <span>Дейности на клуба</span>
          </div>
          <h2 className="general-activities-title">Нашите дейности</h2>
          <p className="general-activities-subtitle">
            Разнообразна програма за активен и здравословен живот
          </p>
          
          {/* Stats overview */}
          <div className="general-activities-stats">
            <div className="general-activities-stat">
              <span>{activities.length}</span>
              <label>Дейности</label>
            </div>
            <div className="general-activities-stat">
              <span>{activities.reduce((sum, act) => sum + (act.participants || 0), 0)}</span>
              <label>Участници</label>
            </div>
            <div className="general-activities-stat">
              <span>{new Set(activities.filter(act => act.day && act.day !== '—' && act.day !== '').map(act => act.day)).size}</span>
              <label>Дни в седмицата</label>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="general-activities-grid">
          {activities.map((activity, index) => (
            <div key={activity.id || index} className={`general-activity-card activity-type-${activity.type}`}>
              <div className="general-activity-icon">
                <FontAwesomeIcon icon={getActivityIcon(activity)} />
                {activity.featured && (
                  <div className="general-activity-featured-badge">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                )}
              </div>
              
              <div className="general-activity-content">
                <h3 className="general-activity-name">{activity.displayName || 'Без име'}</h3>
                
                {/* Activity type badge */}
                <div className="general-activity-type-badge">
                  {activity.type === 'regular' && 'Редовна дейност'}
                  {activity.type === 'event' && 'Събитие'}
                  {activity.type === 'trip' && 'Екскурзия'}
                  {activity.type === 'course' && 'Курс'}
                </div>
                
                <div className="general-activity-details">
                  {/* Schedule - само за дейности с ден и час */}
                  {(activity.day !== '—' || activity.time !== '—') && (
                    <div className="general-activity-schedule">
                      {activity.day !== '—' && (
                        <div className="general-schedule-item">
                          <FontAwesomeIcon icon={faCalendarWeek} />
                          <span>{getDayInBulgarian(activity.day)}</span>
                        </div>
                      )}
                      {activity.time !== '—' && (
                        <div className="general-schedule-item">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{activity.time}</span>
                          {activity.duration && <small>({activity.duration} мин)</small>}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* За курсове показваме продължителността */}
                  {activity.type === 'course' && activity.duration && (
                    <div className="general-activity-duration">
                      <FontAwesomeIcon icon={faClock} />
                      <span>Продължителност: {activity.duration}</span>
                    </div>
                  )}
                  
                  {activity.instructor && (
                    <div className="general-activity-instructor">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{activity.instructor}</span>
                    </div>
                  )}

                  {activity.location && (
                    <div className="general-activity-location">
                      <FontAwesomeIcon icon={faMapPin} />
                      <span>{activity.location}</span>
                    </div>
                  )}

                  {activity.price && (
                    <div className="general-activity-price">
                      <span>💰 {activity.price}</span>
                    </div>
                  )}
                  
                  {activity.description && (
                    <p className="general-activity-description">{activity.description}</p>
                  )}
                  
                  {/* Показваме участниците само ако има стойност > 0 */}
                  {activity.participants > 0 && (
                    <div className="general-activity-participants">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{activity.participants} участници</span>
                    </div>
                  )}

                  {/* За събития показваме highlights ако има */}
                  {activity.type === 'event' && activity.highlights && activity.highlights.length > 0 && (
                    <div className="general-activity-highlights">
                      {activity.highlights.slice(0, 3).map((highlight, i) => (
                        <span key={i} className="general-highlight-tag">{highlight}</span>
                      ))}
                    </div>
                  )}

                  {/* За редовни дейности показваме възрастова група */}
                  {activity.type === 'regular' && activity.ageGroup && (
                    <div className="general-activity-age-group">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>Възраст: {activity.ageGroup.min}-{activity.ageGroup.max} г.</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="general-activity-actions">
                <button 
                  className="general-register-btn"
                  onClick={() => openRegistrationModal(activity)}
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  Записване
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Schedule */}
        <div className="general-weekly-schedule">
          <h3>
            <FontAwesomeIcon icon={faCalendarWeek} />
            Седмичен график
          </h3>
          
          <div className="general-schedule-grid">
            {Object.entries(weeklySchedule).map(([day, dayActivities]) => (
              <div key={day} className="general-day-column">
                <div className="general-day-header">
                  <h4>{getDayInBulgarian(day)}</h4>
                </div>
                
                <div className="general-day-activities">
                  {dayActivities && dayActivities.length > 0 ? (
                    dayActivities.map((activity, index) => (
                      <div key={activity.id || index} className="general-schedule-activity">
                        <div className="general-schedule-time">
                          {activity.time || '—'}
                        </div>
                        <div className="general-schedule-name">
                          {activity.displayName || 'Без име'}
                        </div>
                        <div className="general-schedule-type">
                          {activity.type === 'event' ? '📅' : 
                           activity.type === 'trip' ? '🚌' : 
                           activity.type === 'course' ? '📚' : '🔄'}
                        </div>
                        {activity.participants > 0 && (
                          <div className="general-schedule-participants">
                            {activity.participants} души
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="general-no-activity">
                      Няма дейности
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
                Записване за {selectedActivity.displayName || 'дейност'}
              </h3>
              <button className="general-modal-close" onClick={closeRegistrationModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              {/* Activity Info */}
              <div className="general-selected-activity">
                <div className="general-selected-activity-icon">
                  <FontAwesomeIcon icon={getActivityIcon(selectedActivity)} />
                </div>
                <div className="general-selected-activity-info">
                  <h4>{selectedActivity.displayName || 'Дейност'}</h4>
                  <div className="general-selected-activity-meta">
                    <span>📅 {getDayInBulgarian(selectedActivity.day)}</span>
                    <span>🕐 {selectedActivity.time || '—'}</span>
                    {selectedActivity.instructor && (
                      <span>👨‍🏫 {selectedActivity.instructor}</span>
                    )}
                    {selectedActivity.location && (
                      <span>📍 {selectedActivity.location}</span>
                    )}
                    {selectedActivity.price && (
                      <span>💰 {selectedActivity.price}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegistrationSubmit} className="general-registration-form">
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>Име *</label>
                    <input
                      type="text"
                      value={registrationForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder="Въведете вашето име"
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>Фамилия *</label>
                    <input
                      type="text"
                      value={registrationForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder="Въведете вашата фамилия"
                      required
                    />
                  </div>
                </div>
                
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>Телефон *</label>
                    <input
                      type="tel"
                      value={registrationForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="0888 123 456"
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={registrationForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="име@email.com"
                    />
                  </div>
                </div>
                
                <div className="general-form-group">
                  <label>Опит</label>
                  <select
                    value={registrationForm.experience}
                    onChange={(e) => handleFormChange('experience', e.target.value)}
                  >
                    <option value="">Изберете ниво</option>
                    <option value="none">Няма опит</option>
                    <option value="beginner">Начинаещ</option>
                    <option value="intermediate">Среднонапреднал</option>
                    <option value="advanced">Напреднал</option>
                  </select>
                </div>
                
                <div className="general-form-group">
                  <label>Бележки</label>
                  <textarea
                    value={registrationForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Допълнителна информация или въпроси..."
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
                      Изпращане...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      Изпрати заявка
                    </>
                  )}
                </button>
                
                {formStatus === 'success' && (
                  <div className="general-success-message">
                    <FontAwesomeIcon icon={faCheck} />
                    Заявката е изпратена успешно!
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="general-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Възникна грешка при изпращането!
                  </div>
                )}
              </form>

              {/* Contact info */}
              <div className="general-contact-info">
                <p>Можете да се свържете директно:</p>
                <div className="general-contact-methods">
                  {(club?.contacts?.basic?.phone || club?.contacts?.phone) && (
                    <a href={`tel:${club.contacts.basic?.phone || club.contacts.phone}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faPhone} />
                      {club.contacts.basic?.phone || club.contacts.phone}
                    </a>
                  )}
                  {(club?.contacts?.basic?.email || club?.contacts?.email) && (
                    <a href={`mailto:${club.contacts.basic?.email || club.contacts.email}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {club.contacts.basic?.email || club.contacts.email}
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