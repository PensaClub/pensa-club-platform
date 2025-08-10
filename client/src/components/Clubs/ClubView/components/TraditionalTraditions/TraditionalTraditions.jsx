import { useState } from 'react';
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
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [membershipForm, setMembershipForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    interests: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null); // 'sending', 'sent', 'error'

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // ИЗПОЛЗВАМЕ РЕАЛНИТЕ ДАННИ ОТ MOCK ФАЙЛА
  
  // Традиционни събития от activities.events
  const traditionalEvents = club.activities?.events?.filter(event => 
    event.type === 'traditional' || event.type === 'cultural'
  ) || [];

  // Регулярни традиционни дейности 
  const traditionalActivities = club.activities?.regular?.filter(activity => 
    activity.name.toLowerCase().includes('хор') || 
    activity.name.toLowerCase().includes('танци') ||
    activity.name.toLowerCase().includes('народни') ||
    activity.name.toLowerCase().includes('тракийски')
  ) || [];

  // Екскурзии до традиционни места
  const traditionalTrips = club.activities?.trips?.filter(trip =>
    trip.destination.toLowerCase().includes('манастир') ||
    trip.destination.toLowerCase().includes('копривщица') ||
    trip.destination.toLowerCase().includes('мелник') ||
    trip.destination.toLowerCase().includes('несебър') ||
    trip.destination.toLowerCase().includes('велико търново')
  ) || [];

  // Региональна информация
  const regionalInfo = club.regionalInfo;
  const location = club.location;

  // Социални проекти свързани с традиции
  const traditionalProjects = club.socialImpact?.communityProjects?.filter(project =>
    project.name.toLowerCase().includes('традиц') ||
    project.name.toLowerCase().includes('култур')
  ) || [];

  // Партньорства с културни институции
  const culturalPartnerships = club.socialImpact?.partnerships?.filter(partnership =>
    partnership.type === 'културно' || partnership.type === 'образователно'
  ) || [];

  // Ако няма никакви традиционни елементи, не показваме компонента
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

  // ФУНКЦИОНАЛНИ HANDLERS

  // Membership modal handlers
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
      const subject = encodeURIComponent(`Заявка за членство в ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Заявка за членство:

Име: ${membershipForm.name}
Имейл: ${membershipForm.email}
Телефон: ${membershipForm.phone || 'Не е посочен'}
Възраст: ${membershipForm.age || 'Не е посочена'}
Интереси: ${membershipForm.interests || 'Общи'}

Съобщение:
${membershipForm.message || 'Искам да стана член на клуба'}

---
Изпратено от сайта на ${club.name}
      `);
      
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
    // Scroll to calendar section if exists
    const calendarSection = document.getElementById('traditional-calendar');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Show available events in alert
      if (traditionalEvents.length > 0) {
        const eventsList = traditionalEvents.map(event => `• ${event.title} - ${event.date}`).join('\n');
        alert(`Предстоящи традиционни събития:\n\n${eventsList}`);
      } else {
        alert('В момента няма предстоящи традиционни събития.');
      }
    }
  };

  const handleCallPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bg-BG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section id="traditional-traditions" className="traditional-traditions-main-section">
      <div className="traditional-traditions-container">
        
        {/* Header */}
        <div className="traditional-traditions-header">
          <div className="traditional-traditions-badge">
            <FontAwesomeIcon icon={faCrown} />
            <span>Традиции и култура</span>
          </div>
          <h2 className="traditional-traditions-title">Нашите корени и обичаи</h2>
          <p className="traditional-traditions-subtitle">
            Съхраняваме и предаваме българската култура и традиции
          </p>
        </div>

        {/* Main Content */}
        <div className="traditional-traditions-main-grid">
          
          {/* Traditional Events - показва се САМО ако има събития */}
          {traditionalEvents.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>Традиционни събития</h3>
                <p>Празници и културни мероприятия</p>
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
                        <span>{event.date} в {event.time}</span>
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      {event.participants && (
                        <div className="traditional-traditions-participants">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{event.participants} участници</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traditional Activities - показва се САМО ако има дейности */}
          {traditionalActivities.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faMusic} />
                <h3>Традиционни дейности</h3>
                <p>Редовни културни занимания</p>
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
                        <strong>{activity.day}</strong> от {activity.time}
                      </div>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      {activity.instructor && (
                        <div className="traditional-traditions-instructor">
                          Инструктор: {activity.instructor}
                        </div>
                      )}
                      {activity.participants && (
                        <div className="traditional-traditions-participants">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{activity.participants} участници</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traditional Trips - показва се САМО ако има екскурзии */}
          {traditionalTrips.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <h3>Културни екскурзии</h3>
                <p>Посещения на традиционни места</p>
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
                          <span>{trip.participants} участници</span>
                        </div>
                        <div className="traditional-traditions-price">
                          Цена: {trip.price} лв.
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regional Heritage - показва се САМО ако има региональна информация */}
          {(regionalInfo || location?.city || location?.region) && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faHome} />
                <h3>Регионално наследство</h3>
                <p>Местни традиции и култура</p>
              </div>
              
              <div className="traditional-traditions-cards">
                <div className="traditional-traditions-card regional">
                  <div className="traditional-traditions-card-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="traditional-traditions-card-content">
                    <h4>Наш регион</h4>
                    <div className="traditional-traditions-location">
                      {location?.city && location?.region ? `${location.city}, ${location.region}` : 
                       location?.city || location?.region || 'България'}
                    </div>
                    {regionalInfo?.coverageArea && (
                      <p>Обхватваме: {regionalInfo.coverageArea}</p>
                    )}
                    {regionalInfo?.regionalRole && (
                      <div className="traditional-traditions-role">
                        Роля: {regionalInfo.regionalRole === 'central' ? 'Централен клуб' : 'Местен клуб'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Traditional Projects - показва се САМО ако има проекти */}
          {traditionalProjects.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>Културни проекти</h3>
                <p>Нашите инициативи за съхраняване на традициите</p>
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
                          <span>{project.beneficiaries} бенефициенти</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Partnerships - показва се САМО ако има партньорства */}
          {culturalPartnerships.length > 0 && (
            <div className="traditional-traditions-section">
              <div className="traditional-traditions-section-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>Културни партньорства</h3>
                <p>Сътрудничество с институции</p>
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

        {/* Call to Action */}
        <div className="traditional-traditions-cta">
          <div className="traditional-traditions-cta-content">
            <h3>Станете част от традицията</h3>
            <p>Присъединете се към нас и помогнете за съхраняването на българската култура</p>
            <div className="traditional-traditions-cta-buttons">
              <button 
                className="traditional-traditions-cta-primary"
                onClick={openMembershipModal}
              >
                <FontAwesomeIcon icon={faUsers} />
                Станете член
              </button>
              <button 
                className="traditional-traditions-cta-secondary"
                onClick={handleViewEvents}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                Предстоящи събития
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP MODAL */}
      {isMembershipModalOpen && (
        <div className="traditional-traditions-membership-modal">
          <div className="traditional-traditions-membership-modal-overlay" onClick={closeMembershipModal}></div>
          <div className="traditional-traditions-membership-modal-container">
            <button className="traditional-traditions-membership-modal-close" onClick={closeMembershipModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-traditions-membership-header">
              <FontAwesomeIcon icon={faUsers} />
              <h3>Станете член на {club.name}</h3>
              <p>Присъединете се към нашата общност и съхранявайте традициите заедно с нас</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="traditional-traditions-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Заявката е изпратена!</h4>
                <p>Благодарим ви! Ще се свържем с вас скоро за потвърждение.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-traditions-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleMembershipSubmit} className="traditional-traditions-membership-form">
                <div className="traditional-traditions-form-row">
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={membershipForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={membershipForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="traditional-traditions-form-row">
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="phone">
                      <FontAwesomeIcon icon={faPhone} />
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={membershipForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="traditional-traditions-form-group">
                    <label htmlFor="age">
                      <FontAwesomeIcon icon={faUsers} />
                      Възраст
                    </label>
                    <input
                      type="number"
                      id="age"
                      value={membershipForm.age}
                      onChange={(e) => handleFormChange('age', e.target.value)}
                      placeholder="Въведете вашата възраст"
                    />
                  </div>
                </div>
                
                <div className="traditional-traditions-form-group">
                  <label htmlFor="interests">
                    <FontAwesomeIcon icon={faHeart} />
                    Интереси в традиционната култура
                  </label>
                  <input
                    type="text"
                    id="interests"
                    value={membershipForm.interests}
                    onChange={(e) => handleFormChange('interests', e.target.value)}
                    placeholder="Напр. фолклор, занаяти, кулинария..."
                  />
                </div>
                
                <div className="traditional-traditions-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Защо искате да станете член?
                  </label>
                  <textarea
                    id="message"
                    value={membershipForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    placeholder="Разкажете ни повече за вашата мотивация..."
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
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявката'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeMembershipModal}
                    className="traditional-traditions-cancel-btn"
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

export default TraditionalTraditions;