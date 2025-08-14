import { useState } from 'react';
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
    
    if (name.includes('хор') || name.includes('пеене') || name.includes('музика')) {
      return faMusic;
    } else if (name.includes('танц') || name.includes('народни')) {
      return faTheaterMasks;
    } else if (name.includes('рисуване') || name.includes('изкуство') || name.includes('творчески')) {
      return faPalette;
    } else if (name.includes('четене') || name.includes('книги') || name.includes('литература')) {
      return faBookOpen;
    } else if (name.includes('готвене') || name.includes('кулинария') || name.includes('храна')) {
      return faUtensils;
    } else if (name.includes('гимнастика') || name.includes('упражнения') || name.includes('фитнес')) {
      return faDumbbell;
    } else if (name.includes('разходка') || name.includes('туризъм') || name.includes('спорт')) {
      return faRunning;
    } else if (name.includes('образование') || name.includes('курс') || name.includes('обучение')) {
      return faGraduationCap;
    } else {
      return faHeart; // За общи дейности
    }
  };

  const getDayInBulgarian = (day) => {
    const days = {
      'monday': 'Понеделник',
      'tuesday': 'Вторник', 
      'wednesday': 'Сряда',
      'thursday': 'Четвъртък',
      'friday': 'Петък',
      'saturday': 'Събота',
      'sunday': 'Неделя'
    };
    return days[day?.toLowerCase()] || day || 'Не е посочен';
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
      const subject = encodeURIComponent(`Заявка за записване - ${selectedActivity.name}`);
      const body = encodeURIComponent(`
Заявка за записване в дейност

Име: ${registrationForm.firstName} ${registrationForm.lastName}
Телефон: ${registrationForm.phone}
Email: ${registrationForm.email}

Дейност: ${selectedActivity.name}
Ден: ${getDayInBulgarian(selectedActivity.day)}
Час: ${selectedActivity.time}
Инструктор: ${selectedActivity.instructor || 'Не е посочен'}

Опит: ${registrationForm.experience || 'Не е посочен'}
Допълнителни бележки: ${registrationForm.notes || 'Няма'}

---
Изпратено от ${club.name}
      `);

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
            <span>Редовни дейности</span>
          </div>
          <h2 className="general-activities-title">Нашите дейности</h2>
          <p className="general-activities-subtitle">
            Разнообразни активности всяка седмица за всички членове на клуба
          </p>
          
          {/* Stats overview */}
          <div className="general-activities-stats">
            <div className="general-activities-stat">
              <span>{activities.length}</span>
              <label>активности</label>
            </div>
            <div className="general-activities-stat">
              <span>{activities.reduce((sum, act) => sum + (act.participants || 0), 0)}</span>
              <label>участници</label>
            </div>
            <div className="general-activities-stat">
              <span>{new Set(activities.map(act => act.day)).size}</span>
              <label>дни в седмицата</label>
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
                      <span>{activity.time || 'Час не е посочен'}</span>
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
                    <span>{activity.participants || 0} участници</span>
                  </div>
                </div>
              </div>
              
              <div className="general-activity-actions">
                <button 
                  className="general-register-btn"
                  onClick={() => openRegistrationModal(activity)}
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  Запиши се
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Schedule */}
        <div className="general-weekly-schedule">
          <h3>
            <FontAwesomeIcon icon={faCalendarWeek} />
            Седмична програма
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
                Записване за дейност
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
                    <label>Име *</label>
                    <input
                      type="text"
                      value={registrationForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder="Вашето име"
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>Фамилия *</label>
                    <input
                      type="text"
                      value={registrationForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder="Вашата фамилия"
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
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div className="general-form-group">
                  <label>Предишен опит</label>
                  <select
                    value={registrationForm.experience}
                    onChange={(e) => handleFormChange('experience', e.target.value)}
                  >
                    <option value="">Изберете ниво</option>
                    <option value="none">Без опит</option>
                    <option value="beginner">Начинаещ</option>
                    <option value="intermediate">Среден</option>
                    <option value="advanced">Напреднал</option>
                  </select>
                </div>
                
                <div className="general-form-group">
                  <label>Допълнителни бележки</label>
                  <textarea
                    value={registrationForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Имате ли въпроси или специални изисквания?"
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
                      Изпращам...
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
                    Заявката е изпратена успешно! Ще се свържем с вас скоро.
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="general-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Възникна грешка. Моля опитайте отново или се свържете директно с нас.
                  </div>
                )}
              </form>

              {/* Contact info */}
              <div className="general-contact-info">
                <p>Можете да се свържете и директно:</p>
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