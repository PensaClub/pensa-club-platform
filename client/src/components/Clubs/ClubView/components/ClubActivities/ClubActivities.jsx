import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarWeek, 
  faClock, 
  faUser,
  faUsers,
  faChevronDown,
  faChevronUp,
  faMapPin
} from '@fortawesome/free-solid-svg-icons';
import './clubActivities.css';

export const ClubActivities = ({ club }) => {
  const [expandedActivity, setExpandedActivity] = useState(null);

  const getDayInBulgarian = (day) => {
    const days = {
      'monday': 'понеделник',
      'tuesday': 'вторник', 
      'wednesday': 'сряда',
      'thursday': 'четвъртък',
      'friday': 'петък',
      'saturday': 'събота',
      'sunday': 'неделя',
      'всеки ден': 'всеки ден'
    };
    return days[day] || day;
  };

  const toggleActivity = (index) => {
    setExpandedActivity(expandedActivity === index ? null : index);
  };

  if (!club.activities.regular || club.activities.regular.length === 0) {
    return (
      <section id="club-activities" className="club-activities">
        <div className="activities-container">
          <h2>Редовни дейности</h2>
          <div className="no-activities">
            <FontAwesomeIcon icon={faCalendarWeek} className="no-activities-icon" />
            <p>Все още няма въведени редовни дейности</p>
            <span>Скоро ще бъдат добавени нови активности!</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="club-activities" className="club-activities">
      <div className="activities-container">
        <div className="activities-header">
          <h2>Редовни дейности</h2>
          <p className="activities-subtitle">
            Всяка седмица в нашия клуб се провеждат разнообразни активности за членовете
          </p>
        </div>

        <div className="activities-grid">
          {club.activities.regular.map((activity, index) => (
            <div key={index} className="activity-card">
              <div className="activity-header" onClick={() => toggleActivity(index)}>
                <div className="activity-main-info">
                  <h3 className="activity-name">{activity.name}</h3>
                  <div className="activity-meta">
                    <div className="activity-schedule">
                      <FontAwesomeIcon icon={faCalendarWeek} />
                      <span>{getDayInBulgarian(activity.day)}</span>
                      <FontAwesomeIcon icon={faClock} />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="activity-participants">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{activity.participants}</span>
                </div>

                <button className="expand-btn">
                  <FontAwesomeIcon 
                    icon={expandedActivity === index ? faChevronUp : faChevronDown} 
                  />
                </button>
              </div>

              {expandedActivity === index && (
                <div className="activity-details">
                  <p className="activity-description">{activity.description}</p>
                  
                  {activity.instructor && (
                    <div className="activity-instructor">
                      <FontAwesomeIcon icon={faUser} />
                      <span>Инструктор: <strong>{activity.instructor}</strong></span>
                    </div>
                  )}

                  <div className="activity-stats">
                    <div className="stat">
                      <span className="stat-label">Участници:</span>
                      <span className="stat-value">{activity.participants} души</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Ден:</span>
                      <span className="stat-value">{getDayInBulgarian(activity.day)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Час:</span>
                      <span className="stat-value">{activity.time}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Програма за седмицата */}
        <div className="weekly-schedule">
          <h3>Програма за седмицата</h3>
          <div className="schedule-grid">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
              const dayActivities = club.activities.regular.filter(
                activity => activity.day.toLowerCase() === day || activity.day === 'всеки ден'
              );
              
              return (
                <div key={day} className="day-schedule">
                  <div className="day-header">
                    <h4>{getDayInBulgarian(day)}</h4>
                  </div>
                  <div className="day-activities">
                    {dayActivities.length > 0 ? (
                      dayActivities.map((activity, index) => (
                        <div key={index} className="schedule-activity">
                          <span className="schedule-time">{activity.time}</span>
                          <span className="schedule-name">{activity.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-activity">Няма дейности</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubActivities;