import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandsHelping,
  faUsers,
  faClock,
  faHeart,
  faUser,
  faPhone,
  faEnvelope,
  faChartBar,
  faAward,
  faHandHoldingHeart,
  faUserFriends,
  faGraduationCap,
  faClipboardList,
  faLightbulb,
  faMedkit,
  faUtensils,
  faHome,
  faHandshake,
  faCalendarAlt,
  faCheckCircle,
  faTimes,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import './socialVolunteering.css';

export const SocialVolunteering = ({ club }) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    interests: [],
    availability: '',
    message: ''
  });
  const [registrationStatus, setRegistrationStatus] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.socialImpact?.volunteering && 
      !club?.pensionersSpecific?.specialPrograms?.volunteerPrograms && 
      !club?.management?.board) {
    return null;
  }

  // Събираме доброволческите програми
  const volunteeringPrograms = club.socialImpact?.volunteering || [];
  const specialVolunteerPrograms = club.pensionersSpecific?.specialPrograms?.volunteerPrograms || [];
  
  // Обединяваме всички доброволчески програми
  const allPrograms = [
    ...volunteeringPrograms.map(v => ({
      id: `main-${v.project}`,
      name: v.project,
      description: v.description,
      participants: v.participants,
      coordinator: v.coordinator,
      hoursPerMonth: v.hoursPerMonth,
      type: 'community',
      impact: `${v.hoursPerMonth} часа месечно`,
      category: getVolunteerCategory(v.project)
    })),
    ...specialVolunteerPrograms.map(v => ({
      id: `special-${v.name}`,
      name: v.name,
      description: v.description,
      participants: v.volunteers,
      coordinator: v.coordinator,
      hoursPerWeek: v.hoursPerWeek,
      training: v.training,
      type: 'special',
      impact: v.hoursPerWeek ? `${v.hoursPerWeek} часа седмично` : 'Постоянна дейност',
      category: 'support'
    }))
  ];

  // Координатори от ръководството които участват в доброволчество
  const volunteers = club.management?.board?.filter(member => 
    allPrograms.some(program => program.coordinator === member.name)
  ) || [];

  // Ако няма програми, не показваме компонента
  if (allPrograms.length === 0) {
    return null;
  }

  // Общи статистики
  const totalVolunteers = allPrograms.reduce((sum, program) => sum + (program.participants || 0), 0);
  const totalHoursPerMonth = allPrograms.reduce((sum, program) => 
    sum + (program.hoursPerMonth || (program.hoursPerWeek ? program.hoursPerWeek * 4 : 0)), 0);
  const activePrograms = allPrograms.length;

  // Helper функции
  function getVolunteerCategory(project) {
    if (project.toLowerCase().includes('самотни') || project.toLowerCase().includes('възрастни')) return 'elderly';
    if (project.toLowerCase().includes('храна') || project.toLowerCase().includes('обяд')) return 'food';
    if (project.toLowerCase().includes('лекарство') || project.toLowerCase().includes('здрав')) return 'health';
    if (project.toLowerCase().includes('дом') || project.toLowerCase().includes('почистване')) return 'home';
    return 'support';
  }

  function getCategoryIcon(category) {
    switch(category) {
      case 'elderly': return faUserFriends;
      case 'food': return faUtensils;
      case 'health': return faMedkit;
      case 'home': return faHome;
      case 'support': return faHandsHelping;
      default: return faHeart;
    }
  }

  function getCategoryColor(category) {
    switch(category) {
      case 'elderly': return '#8b5cf6';
      case 'food': return '#f59e0b';
      case 'health': return '#ef4444';
      case 'home': return '#10b981';
      case 'support': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  const openVolunteerModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
  };

  const closeVolunteerModal = () => {
    setSelectedVolunteer(null);
  };

  const openRegistrationModal = () => {
    setShowRegistrationModal(true);
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      age: '',
      experience: '',
      interests: [],
      availability: '',
      message: ''
    });
    setRegistrationStatus(null);
  };

  const handleRegistrationChange = (field, value) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setRegistrationForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    setRegistrationStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(`Заявка за доброволчество - ${registrationForm.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте нова заявка за доброволчество:

Име: ${registrationForm.name}
Имейл: ${registrationForm.email}
Телефон: ${registrationForm.phone}
Възраст: ${registrationForm.age}

Предишен опит: ${registrationForm.experience}
Области на интерес: ${registrationForm.interests.join(', ')}
Наличност: ${registrationForm.availability}

Съобщение:
${registrationForm.message}

---
Изпратено от сайта на ${club.name}
      `);
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setRegistrationStatus('sent');
        setTimeout(() => {
          closeRegistrationModal();
        }, 2000);
      } catch (error) {
        setRegistrationStatus('error');
      }
    } else {
      setRegistrationStatus('error');
    }
  };

  return (
    <section id="social-volunteering" className="social-volunteering-section">
      <div className="social-volunteering-container">
        
        {/* Header with Dashboard Style */}
        <div className="social-volunteering-header">
          <div className="social-volunteering-header-content">
            <div className="social-volunteering-badge">
              <FontAwesomeIcon icon={faHandsHelping} />
              <span>Доброволчество</span>
            </div>
            <h2 className="social-volunteering-title">
              Заедно правим разлика
            </h2>
            <p className="social-volunteering-subtitle">
              Нашите доброволци са сърцето на всяка промяна в общността
            </p>
          </div>
          
          {/* Dashboard Stats */}
          <div className="social-volunteering-dashboard">
            <div className="social-volunteering-stat-box">
              <div className="social-volunteering-stat-icon volunteers">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="social-volunteering-stat-info">
                <span className="social-volunteering-stat-number">{totalVolunteers}</span>
                <span className="social-volunteering-stat-label">Доброволци</span>
              </div>
            </div>
            
            <div className="social-volunteering-stat-box">
              <div className="social-volunteering-stat-icon hours">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div className="social-volunteering-stat-info">
                <span className="social-volunteering-stat-number">{totalHoursPerMonth}</span>
                <span className="social-volunteering-stat-label">Часа месечно</span>
              </div>
            </div>
            
            <div className="social-volunteering-stat-box">
              <div className="social-volunteering-stat-icon programs">
                <FontAwesomeIcon icon={faHandsHelping} />
              </div>
              <div className="social-volunteering-stat-info">
                <span className="social-volunteering-stat-number">{activePrograms}</span>
                <span className="social-volunteering-stat-label">Активни програми</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="social-volunteering-tabs">
          <button 
            className={`social-volunteering-tab ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Наши програми</span>
          </button>
          <button 
            className={`social-volunteering-tab ${activeTab === 'volunteers' ? 'active' : ''}`}
            onClick={() => setActiveTab('volunteers')}
          >
            <FontAwesomeIcon icon={faUserFriends} />
            <span>Нашите доброволци</span>
          </button>
          <button 
            className={`social-volunteering-tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            <FontAwesomeIcon icon={faHandshake} />
            <span>Включете се</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="social-volunteering-content">
          
          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div className="social-volunteering-programs">
              <div className="social-volunteering-timeline">
                {allPrograms.map((program, index) => (
                  <div key={program.id} className="social-volunteering-timeline-item">
                    <div className="social-volunteering-timeline-marker">
                      <div 
                        className="social-volunteering-timeline-icon"
                        style={{ backgroundColor: getCategoryColor(program.category) }}
                      >
                        <FontAwesomeIcon icon={getCategoryIcon(program.category)} />
                      </div>
                    </div>
                    
                    <div className="social-volunteering-program-card">
                      <div className="social-volunteering-program-header">
                        <h3 className="social-volunteering-program-title">{program.name}</h3>
                        <div 
                          className="social-volunteering-program-type"
                          style={{ backgroundColor: getCategoryColor(program.category) }}
                        >
                          {program.type === 'community' ? 'Общностен' : 'Специален'}
                        </div>
                      </div>
                      
                      <p className="social-volunteering-program-description">
                        {program.description}
                      </p>
                      
                      <div className="social-volunteering-program-metrics">
                        <div className="social-volunteering-metric">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{program.participants} доброволци</span>
                        </div>
                        <div className="social-volunteering-metric">
                          <FontAwesomeIcon icon={faChartBar} />
                          <span>{program.impact}</span>
                        </div>
                        {program.coordinator && (
                          <div className="social-volunteering-metric">
                            <FontAwesomeIcon icon={faUser} />
                            <span>Координатор: {program.coordinator}</span>
                          </div>
                        )}
                        {program.training && (
                          <div className="social-volunteering-metric">
                            <FontAwesomeIcon icon={faGraduationCap} />
                            <span>{program.training}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <div className="social-volunteering-volunteers">
              {volunteers.length > 0 ? (
                <>
                  <div className="social-volunteering-volunteers-intro">
                    <h3>Запознайте се с нашите координатори</h3>
                    <p>Хората, които правят възможни нашите доброволчески програми</p>
                  </div>
                  
                  <div className="social-volunteering-volunteers-grid">
                    {volunteers.map((volunteer) => (
                      <div 
                        key={volunteer.name} 
                        className="social-volunteering-volunteer-card"
                        onClick={() => openVolunteerModal(volunteer)}
                      >
                        <div className="social-volunteering-volunteer-avatar">
                          <img src={volunteer.avatar} alt={volunteer.name} />
                          <div className="social-volunteering-volunteer-badge">
                            <FontAwesomeIcon icon={faAward} />
                          </div>
                        </div>
                        
                        <div className="social-volunteering-volunteer-info">
                          <h4 className="social-volunteering-volunteer-name">{volunteer.name}</h4>
                          <p className="social-volunteering-volunteer-role">{volunteer.role}</p>
                          <p className="social-volunteering-volunteer-bio">{volunteer.bio}</p>
                          
                          <div className="social-volunteering-volunteer-programs">
                            {allPrograms
                              .filter(program => program.coordinator === volunteer.name)
                              .map(program => (
                                <span 
                                  key={program.id}
                                  className="social-volunteering-volunteer-program"
                                  style={{ backgroundColor: getCategoryColor(program.category) }}
                                >
                                  {program.name}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="social-volunteering-no-volunteers">
                  <FontAwesomeIcon icon={faUsers} />
                  <h3>Информацията за доброволците не е налична</h3>
                  <p>Свържете се с нас за повече информация за нашите доброволци</p>
                </div>
              )}
            </div>
          )}

          {/* Join Tab */}
          {activeTab === 'join' && (
            <div className="social-volunteering-join">
              <div className="social-volunteering-join-content">
                <div className="social-volunteering-join-header">
                  <FontAwesomeIcon icon={faHandHoldingHeart} />
                  <h3>Станете част от промяната</h3>
                  <p>Всеки може да направи разлика в живота на друг човек</p>
                </div>
                
                <div className="social-volunteering-join-steps">
                  <div className="social-volunteering-step">
                    <div className="social-volunteering-step-number">1</div>
                    <div className="social-volunteering-step-content">
                      <h4>Запишете се</h4>
                      <p>Попълнете формата за записване и споделете за вашите интереси</p>
                    </div>
                  </div>
                  
                  <div className="social-volunteering-step">
                    <div className="social-volunteering-step-number">2</div>
                    <div className="social-volunteering-step-content">
                      <h4>Ще се свържем с вас</h4>
                      <p>Ще ви контактираме за да обсъдим възможностите и отговорим на въпросите ви</p>
                    </div>
                  </div>
                  
                  <div className="social-volunteering-step">
                    <div className="social-volunteering-step-number">3</div>
                    <div className="social-volunteering-step-content">
                      <h4>Започнете да помагате</h4>
                      <p>Започнете своето пътуване като доброволец и направете разлика</p>
                    </div>
                  </div>
                </div>
                
                <div className="social-volunteering-join-cta">
                  <h4>Готови ли сте да се включите?</h4>
                  <div className="social-volunteering-join-buttons">
                    <button 
                      onClick={openRegistrationModal}
                      className="social-volunteering-cta-btn primary"
                    >
                      <FontAwesomeIcon icon={faUserFriends} />
                      <span>Запишете се</span>
                    </button>
                    
                    {club.contacts?.phone && (
                      <a 
                        href={`tel:${club.contacts.phone}`}
                        className="social-volunteering-cta-btn secondary"
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        <span>Обадете се</span>
                      </a>
                    )}
                    {club.contacts?.email && (
                      <a 
                        href={`mailto:${club.contacts.email}?subject=Искам да стана доброволец`}
                        className="social-volunteering-cta-btn secondary"
                      >
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>Пишете ни</span>
                      </a>
                    )}
                  </div>
                  
                  <div className="social-volunteering-join-note">
                    <FontAwesomeIcon icon={faLightbulb} />
                    <span>Не е нужен предварителен опит - ще ви обучим за всичко необходимо!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Volunteer Modal */}
        {selectedVolunteer && (
          <div className="social-volunteering-modal" onClick={closeVolunteerModal}>
            <div className="social-volunteering-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-volunteering-modal-close" onClick={closeVolunteerModal}>
                ×
              </button>
              
              <div className="social-volunteering-modal-header">
                <img 
                  src={selectedVolunteer.avatar} 
                  alt={selectedVolunteer.name}
                  className="social-volunteering-modal-avatar"
                />
                <div className="social-volunteering-modal-info">
                  <h3>{selectedVolunteer.name}</h3>
                  <p className="social-volunteering-modal-role">{selectedVolunteer.role}</p>
                  <p className="social-volunteering-modal-bio">{selectedVolunteer.bio}</p>
                </div>
              </div>
              
              <div className="social-volunteering-modal-body">
                <h4>Координира програми:</h4>
                <div className="social-volunteering-modal-programs">
                  {allPrograms
                    .filter(program => program.coordinator === selectedVolunteer.name)
                    .map(program => (
                      <div key={program.id} className="social-volunteering-modal-program">
                        <FontAwesomeIcon 
                          icon={getCategoryIcon(program.category)} 
                          style={{ color: getCategoryColor(program.category) }}
                        />
                        <div>
                          <h5>{program.name}</h5>
                          <p>{program.description}</p>
                          <span className="social-volunteering-modal-impact">{program.impact}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
                
                <div className="social-volunteering-modal-contact">
                  <h4>Контакт:</h4>
                  <div className="social-volunteering-modal-contact-info">
                    {selectedVolunteer.phone && (
                      <a href={`tel:${selectedVolunteer.phone}`}>
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{selectedVolunteer.phone}</span>
                      </a>
                    )}
                    {selectedVolunteer.email && (
                      <a href={`mailto:${selectedVolunteer.email}`}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{selectedVolunteer.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Modal */}
        {showRegistrationModal && (
          <div className="social-volunteering-registration-modal" onClick={closeRegistrationModal}>
            <div className="social-volunteering-registration-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-volunteering-registration-close" onClick={closeRegistrationModal}>
                ×
              </button>
              
              <div className="social-volunteering-registration-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>Запишете се като доброволец</h3>
                <p>Споделете повече за себе си и как искате да помогнете</p>
              </div>
              
              {registrationStatus === 'sent' ? (
                <div className="social-volunteering-registration-success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <h4>Заявката е изпратена успешно!</h4>
                  <p>Благодарим ви за интереса! Ще се свържем с вас възможно най-скоро.</p>
                </div>
              ) : registrationStatus === 'error' ? (
                <div className="social-volunteering-registration-error">
                  <FontAwesomeIcon icon={faTimes} />
                  <h4>Възникна грешка</h4>
                  <p>Моля опитайте отново или се свържете с нас директно.</p>
                </div>
              ) : (
                <form onSubmit={handleRegistrationSubmit} className="social-volunteering-registration-form">
                  <div className="social-volunteering-form-row">
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-name">
                        <FontAwesomeIcon icon={faUser} />
                        Вашето име *
                      </label>
                      <input
                        type="text"
                        id="reg-name"
                        value={registrationForm.name}
                        onChange={(e) => handleRegistrationChange('name', e.target.value)}
                        required
                        placeholder="Въведете вашето име"
                      />
                    </div>
                    
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        Имейл адрес *
                      </label>
                      <input
                        type="email"
                        id="reg-email"
                        value={registrationForm.email}
                        onChange={(e) => handleRegistrationChange('email', e.target.value)}
                        required
                        placeholder="Въведете вашия имейл"
                      />
                    </div>
                  </div>
                  
                  <div className="social-volunteering-form-row">
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-phone">
                        <FontAwesomeIcon icon={faPhone} />
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        id="reg-phone"
                        value={registrationForm.phone}
                        onChange={(e) => handleRegistrationChange('phone', e.target.value)}
                        required
                        placeholder="Въведете вашия телефон"
                      />
                    </div>
                    
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-age">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        Възраст
                      </label>
                      <input
                        type="number"
                        id="reg-age"
                        value={registrationForm.age}
                        onChange={(e) => handleRegistrationChange('age', e.target.value)}
                        placeholder="Вашата възраст"
                        min="16"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label htmlFor="reg-experience">
                      <FontAwesomeIcon icon={faAward} />
                      Предишен опит като доброволец
                    </label>
                    <textarea
                      id="reg-experience"
                      value={registrationForm.experience}
                      onChange={(e) => handleRegistrationChange('experience', e.target.value)}
                      placeholder="Разкажете за предишния си опит (или напишете 'Няма' ако сте начинаещ)"
                      rows="3"
                    />
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label>
                      <FontAwesomeIcon icon={faHeart} />
                      В какви области искате да помагате?
                    </label>
                    <div className="social-volunteering-interests-grid">
                      {[
                        'Грижа за възрастни хора',
                        'Помощ с храна и покупки', 
                        'Транспорт и придружаване',
                        'Здравна помощ',
                        'Домашна помощ',
                        'Образователни дейности',
                        'Организиране на събития',
                        'Техническа поддръжка'
                      ].map(interest => (
                        <label key={interest} className="social-volunteering-interest-item">
                          <input
                            type="checkbox"
                            checked={registrationForm.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                          />
                          <span>{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label htmlFor="reg-availability">
                      <FontAwesomeIcon icon={faClock} />
                      Кога сте налични?
                    </label>
                    <select
                      id="reg-availability"
                      value={registrationForm.availability}
                      onChange={(e) => handleRegistrationChange('availability', e.target.value)}
                    >
                      <option value="">Изберете наличност</option>
                      <option value="weekdays">Работни дни</option>
                      <option value="weekends">Уикенди</option>
                      <option value="evenings">Вечери</option>
                      <option value="flexible">Гъвкаво време</option>
                      <option value="emergency">При спешност</option>
                    </select>
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label htmlFor="reg-message">
                      <FontAwesomeIcon icon={faComments} />
                      Допълнително съобщение
                    </label>
                    <textarea
                      id="reg-message"
                      value={registrationForm.message}
                      onChange={(e) => handleRegistrationChange('message', e.target.value)}
                      placeholder="Споделете какво ви мотивира да станете доброволец..."
                      rows="4"
                    />
                  </div>
                  
                  <div className="social-volunteering-form-actions">
                    <button 
                      type="submit" 
                      className="social-volunteering-submit-btn"
                      disabled={registrationStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faHandHoldingHeart} />
                      {registrationStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявката'}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeRegistrationModal}
                      className="social-volunteering-cancel-btn"
                    >
                      Отказ
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialVolunteering;