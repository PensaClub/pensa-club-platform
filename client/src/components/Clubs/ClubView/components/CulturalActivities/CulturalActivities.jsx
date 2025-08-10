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
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import './culturalActivities.css';

export const CulturalActivities = ({ club }) => {
  const [activeTab, setActiveTab] = useState('regular');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const activityIcons = {
    'хор': faMusic,
    'танци': faTheaterMasks,
    'рисуване': faPalette,
    'четене': faBookOpen,
    'курсове': faGraduationCap,
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

  const regularActivities = club.activities?.regular || [
    {
      name: "Хор 'Родопски звуци'",
      day: "понеделник",
      time: "16:00-18:00",
      instructor: "Мария Димитрова",
      participants: 24,
      description: "Традиционни български песни и класическа музика",
      level: "всички нива",
      duration: "2 часа"
    },
    {
      name: "Народни танци",
      day: "сряда", 
      time: "17:00-19:00",
      instructor: "Георги Стойков",
      participants: 18,
      description: "Български народни танци за начинаещи и напреднали",
      level: "начинаещи",
      duration: "2 часа"
    }
  ];

  const courses = club.activities?.courses || [
    {
      name: "Основи на дигиталните технологии",
      duration: "8 седмици",
      participants: 15,
      instructor: "Млади доброволци",
      description: "Как да използваме смартфон, имейл и онлайн услуги",
      startDate: "2025-02-01",
      schedule: "петък 14:00-16:00"
    }
  ];

  const specialPrograms = [
    {
      name: "Междупоколенческа програма",
      description: "Свързване на пенсионери с ученици за културен обмен",
      participants: 30,
      frequency: "месечно",
      icon: faHeart
    },
    {
      name: "Културни експедиции",
      description: "Посещения на музеи, театри и исторически места",
      participants: 25,
      frequency: "тримесечно", 
      icon: faMapMarkerAlt
    },
    {
      name: "Творчески работилници",
      description: "Занаяти, рисуване и художествено творчество",
      participants: 20,
      frequency: "седмично",
      icon: faPalette
    },
    {
      name: "Литературен клуб",
      description: "Четения, дискусии и срещи с автори",
      participants: 15,
      frequency: "двуседмично",
      icon: faBookOpen
    }
  ];

  const handleJoinActivity = (activity) => {
    alert(`Записвате се за: ${activity.name}`);
  };

  const handleInfoRequest = (activity) => {
    alert(`Повече информация за: ${activity.name}`);
  };

  return (
    <section id="club-activities" className="cultural-activities-main-section">
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
          <button 
            className={`cultural-activities-tab ${activeTab === 'regular' ? 'active' : ''}`}
            onClick={() => setActiveTab('regular')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            Редовни дейности
          </button>
          <button 
            className={`cultural-activities-tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <FontAwesomeIcon icon={faGraduationCap} />
            Курсове и обучения
          </button>
          <button 
            className={`cultural-activities-tab ${activeTab === 'special' ? 'active' : ''}`}
            onClick={() => setActiveTab('special')}
          >
            <FontAwesomeIcon icon={faStar} />
            Специални програми
          </button>
        </div>

        {/* Content Based on Active Tab */}
        <div className="cultural-activities-content">
          
          {/* Regular Activities */}
          {activeTab === 'regular' && (
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
                          <span className="cultural-activities-day">{activity.day}</span>
                          <span className="cultural-activities-time">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cultural-activities-card-content">
                      <p className="cultural-activities-description">{activity.description}</p>
                      
                      <div className="cultural-activities-details">
                        <div className="cultural-activities-detail-item">
                          <FontAwesomeIcon icon={faUser} />
                          <span>Инструктор: {activity.instructor}</span>
                        </div>
                        <div className="cultural-activities-detail-item">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{activity.participants} участници</span>
                        </div>
                        {activity.level && (
                          <div className="cultural-activities-detail-item">
                            <FontAwesomeIcon icon={faStar} />
                            <span>Ниво: {activity.level}</span>
                          </div>
                        )}
                        <div className="cultural-activities-detail-item">
                          <FontAwesomeIcon icon={faClock} />
                          <span>Продължителност: {activity.duration || '2 часа'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cultural-activities-card-actions">
                      <button 
                        className="cultural-activities-btn-primary"
                        onClick={() => handleJoinActivity(activity)}
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
          {activeTab === 'courses' && (
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
                        <div className="cultural-activities-course-duration">{course.duration}</div>
                      </div>
                    </div>
                    
                    <div className="cultural-activities-course-content">
                      <p className="cultural-activities-course-description">{course.description}</p>
                      
                      <div className="cultural-activities-course-details">
                        <div className="cultural-activities-course-detail-item">
                          <FontAwesomeIcon icon={faUser} />
                          <span>Преподавател: {course.instructor}</span>
                        </div>
                        <div className="cultural-activities-course-detail-item">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{course.participants} участници</span>
                        </div>
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
                        onClick={() => handleJoinActivity(course)}
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
          {activeTab === 'special' && (
            <div className="cultural-activities-special">
              <div className="cultural-activities-special-grid">
                {specialPrograms.map((program, index) => (
                  <div key={index} className="cultural-activities-special-card">
                    <div className="cultural-activities-special-icon">
                      <FontAwesomeIcon icon={program.icon} />
                    </div>
                    <div className="cultural-activities-special-content">
                      <h3>{program.name}</h3>
                      <p>{program.description}</p>
                      <div className="cultural-activities-special-stats">
                        <div className="cultural-activities-special-stat">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{program.participants} участници</span>
                        </div>
                        <div className="cultural-activities-special-stat">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{program.frequency}</span>
                        </div>
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
        <div className="cultural-activities-schedule">
          <div className="cultural-activities-schedule-header">
            <h3>Седмична програма</h3>
            <p>Преглед на всички дейности по дни</p>
          </div>
          <div className="cultural-activities-weekly-grid">
            {weekDays.map((day, index) => {
              const dayActivities = regularActivities.filter(activity => 
                activity.day.toLowerCase() === day.toLowerCase()
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
                          <div className="cultural-activities-day-time">{activity.time}</div>
                          <div className="cultural-activities-day-name">{activity.name}</div>
                          <div className="cultural-activities-day-instructor">{activity.instructor}</div>
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

        {/* Call to Action */}
        <div className="cultural-activities-cta">
          <div className="cultural-activities-cta-content">
            <h3>Готови да се включите?</h3>
            <p>Присъединете се към някоя от нашите програми и открийте нови таланти и приятели</p>
            <div className="cultural-activities-cta-buttons">
              <button className="cultural-activities-cta-primary">
                <FontAwesomeIcon icon={faUserPlus} />
                Запишете се сега
              </button>
              <button className="cultural-activities-cta-secondary">
                <FontAwesomeIcon icon={faInfoCircle} />
                Свържете се с нас
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalActivities;