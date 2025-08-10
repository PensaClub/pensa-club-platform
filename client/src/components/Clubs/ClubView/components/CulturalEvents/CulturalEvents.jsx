import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faMusic,
  faTheaterMasks,
  faPalette,
  faUsers,
  faClock,
  faMapMarkerAlt,
  faTicketAlt,
  faEuroSign,
  faInfoCircle,
  faBookmark,
  faShare,
  faChevronLeft,
  faChevronRight,
  faStar,
  faCamera,
  faGift,
  faHeart,
  faTrophy,
  faGraduationCap,
  faBirthdayCake,
  faTree
} from '@fortawesome/free-solid-svg-icons';
import './culturalEvents.css';

export const CulturalEvents = ({ club }) => {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventTypes = {
    'cultural': { icon: faTheaterMasks, color: '#8b5cf6', label: 'Културни' },
    'social': { icon: faUsers, color: '#10b981', label: 'Социални' },
    'educational': { icon: faGraduationCap, color: '#3b82f6', label: 'Образователни' },
    'traditional': { icon: faTree, color: '#f59e0b', label: 'Традиционни' },
    'celebration': { icon: faBirthdayCake, color: '#ef4444', label: 'Празници' }
  };

  // Mock данни за събития (ще използваме club.activities?.events ако има)
  const upcomingEvents = [
    {
      id: 1,
      title: "Коледен концерт 2025",
      date: "2025-12-20",
      time: "18:00",
      type: "cultural",
      location: "Основна зала",
      description: "Традиционен коледен концерт с участието на нашия хор и танцова група. Специални изпълнения на коледни песни и народни танци.",
      participants: 120,
      price: "безплатно",
      featured: true,
      image: "https://picsum.photos/600/400?random=101",
      organizer: "Елка Николова",
      highlights: ["Хор 'Родопски звуци'", "Танцова група", "Коледни песни", "Топли напитки"]
    },
    {
      id: 2,
      title: "Великденски базар",
      date: "2025-04-20",
      time: "10:00",
      type: "traditional",
      location: "Клубна зала и тераса",
      description: "Традиционен великденски базар с домашно приготвени лакомства, занаятчийски изделия и великденски украси.",
      participants: 80,
      price: "безплатен вход",
      featured: false,
      image: "https://picsum.photos/600/400?random=102",
      organizer: "Мария Петкова",
      highlights: ["Домашни лакомства", "Занаятчийски изделия", "Великденски украси", "Детски кътче"]
    },
    {
      id: 3,
      title: "Творческа работилница 'Мартеници'",
      date: "2025-02-25",
      time: "15:00",
      type: "educational",
      location: "Работилница",
      description: "Научете как да правите традиционни мартеници и други пролетни украси заедно с опитни майстори.",
      participants: 25,
      price: "10 лв за материали",
      featured: false,
      image: "https://picsum.photos/600/400?random=103",
      organizer: "Анка Димитрова",
      highlights: ["Традиционни техники", "Материали включени", "Майстор-клас", "Взимате си изделието"]
    },
    {
      id: 4,
      title: "Среща с писателя Иван Петров",
      date: "2025-03-15",
      time: "17:00",
      type: "cultural",
      location: "Библиотека",
      description: "Литературна среща с известния български писател Иван Петров. Четене, дискусия и автограф сесия.",
      participants: 40,
      price: "безплатно",
      featured: false,
      image: "https://picsum.photos/600/400?random=104",
      organizer: "Невена Георгиева",
      highlights: ["Литературно четене", "Дискусия", "Автографи", "Освежаване"]
    }
  ];

  const pastEvents = [
    {
      id: 5,
      title: "Новогодишна вечер 2025",
      date: "2024-12-31",
      time: "20:00",
      type: "celebration",
      location: "Основна зала",
      description: "Незабравима новогодишна вечер с музика, танци и богата програма.",
      participants: 95,
      rating: 4.8,
      image: "https://picsum.photos/600/400?random=105",
      gallery: ["https://picsum.photos/400/300?random=201", "https://picsum.photos/400/300?random=202"]
    },
    {
      id: 6,
      title: "Есенен концерт",
      date: "2024-10-15",
      time: "18:30",
      type: "cultural",
      location: "Основна зала",
      description: "Красив есенен концерт с народни песни и танци.",
      participants: 78,
      rating: 4.6,
      image: "https://picsum.photos/600/400?random=106",
      gallery: ["https://picsum.photos/400/300?random=203", "https://picsum.photos/400/300?random=204"]
    }
  ];

  const allEvents = [...upcomingEvents, ...pastEvents];
  const featuredEvent = upcomingEvents.find(event => event.featured);

  const getEventsToShow = () => {
    switch(activeFilter) {
      case 'upcoming':
        return upcomingEvents;
      case 'past':
        return pastEvents;
      case 'cultural':
        return allEvents.filter(event => event.type === 'cultural');
      case 'social':
        return allEvents.filter(event => event.type === 'social');
      default:
        return upcomingEvents;
    }
  };

  const handleEventAction = (action, event) => {
    switch(action) {
      case 'register':
        alert(`Записвате се за: ${event.title}`);
        break;
      case 'bookmark':
        alert(`Запазихте: ${event.title}`);
        break;
      case 'share':
        alert(`Споделяте: ${event.title}`);
        break;
      case 'info':
        setSelectedEvent(event);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  return (
    <section id="club-events" className="cultural-events-main-section">
      <div className="cultural-events-container">
        
        {/* Header */}
        <div className="cultural-events-header">
          <div className="cultural-events-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Събития и мероприятия</span>
          </div>
          <h2 className="cultural-events-title">Културният ни календар</h2>
          <p className="cultural-events-subtitle">
            Открийте вълнуващи събития, концерти и празненства през цялата година
          </p>
        </div>

        {/* Featured Event */}
        {featuredEvent && (
          <div className="cultural-events-featured">
            <div className="cultural-events-featured-content">
              <div className="cultural-events-featured-info">
                <div className="cultural-events-featured-badge">
                  <FontAwesomeIcon icon={faStar} />
                  <span>Препоръчано събитие</span>
                </div>
                <h3>{featuredEvent.title}</h3>
                <p>{featuredEvent.description}</p>
                
                <div className="cultural-events-featured-details">
                  <div className="cultural-events-featured-detail">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(featuredEvent.date)} в {featuredEvent.time}</span>
                  </div>
                  <div className="cultural-events-featured-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="cultural-events-featured-detail">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{featuredEvent.participants} участници</span>
                  </div>
                  <div className="cultural-events-featured-detail">
                    <FontAwesomeIcon icon={faTicketAlt} />
                    <span>{featuredEvent.price}</span>
                  </div>
                </div>

                <div className="cultural-events-featured-highlights">
                  {featuredEvent.highlights?.map((highlight, index) => (
                    <span key={index} className="cultural-events-highlight-tag">
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="cultural-events-featured-actions">
                  <button 
                    className="cultural-events-btn-primary"
                    onClick={() => handleEventAction('register', featuredEvent)}
                  >
                    <FontAwesomeIcon icon={faTicketAlt} />
                    Запишете се
                  </button>
                  <button 
                    className="cultural-events-btn-secondary"
                    onClick={() => handleEventAction('info', featuredEvent)}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Повече информация
                  </button>
                </div>
              </div>
              <div className="cultural-events-featured-image">
                <img src={featuredEvent.image} alt={featuredEvent.title} />
                <div className="cultural-events-featured-type">
                  <FontAwesomeIcon icon={eventTypes[featuredEvent.type].icon} />
                  <span>{eventTypes[featuredEvent.type].label}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="cultural-events-filters">
          <button 
            className={`cultural-events-filter ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            Предстоящи
          </button>
          <button 
            className={`cultural-events-filter ${activeFilter === 'past' ? 'active' : ''}`}
            onClick={() => setActiveFilter('past')}
          >
            <FontAwesomeIcon icon={faCamera} />
            Минали събития
          </button>
          <button 
            className={`cultural-events-filter ${activeFilter === 'cultural' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cultural')}
          >
            <FontAwesomeIcon icon={faTheaterMasks} />
            Културни
          </button>
          <button 
            className={`cultural-events-filter ${activeFilter === 'social' ? 'active' : ''}`}
            onClick={() => setActiveFilter('social')}
          >
            <FontAwesomeIcon icon={faUsers} />
            Социални
          </button>
        </div>

        {/* Events Grid */}
        <div className="cultural-events-grid">
          {getEventsToShow().map((event) => (
            <div key={event.id} className="cultural-events-card">
              <div className="cultural-events-card-image">
                <img src={event.image} alt={event.title} />
                <div className="cultural-events-card-type" style={{background: eventTypes[event.type].color}}>
                  <FontAwesomeIcon icon={eventTypes[event.type].icon} />
                </div>
                {!isUpcoming(event.date) && event.rating && (
                  <div className="cultural-events-card-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{event.rating}</span>
                  </div>
                )}
              </div>
              
              <div className="cultural-events-card-content">
                <div className="cultural-events-card-date">
                  <div className="cultural-events-card-day">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="cultural-events-card-month">
                    {new Date(event.date).toLocaleDateString('bg-BG', { month: 'short' })}
                  </div>
                </div>
                
                <div className="cultural-events-card-info">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  
                  <div className="cultural-events-card-details">
                    <div className="cultural-events-card-detail">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{event.time}</span>
                    </div>
                    <div className="cultural-events-card-detail">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{event.location}</span>
                    </div>
                    <div className="cultural-events-card-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{event.participants} участници</span>
                    </div>
                    {event.price && (
                      <div className="cultural-events-card-detail">
                        <FontAwesomeIcon icon={faTicketAlt} />
                        <span>{event.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="cultural-events-card-actions">
                {isUpcoming(event.date) ? (
                  <>
                    <button 
                      className="cultural-events-card-btn primary"
                      onClick={() => handleEventAction('register', event)}
                    >
                      <FontAwesomeIcon icon={faTicketAlt} />
                    </button>
                    <button 
                      className="cultural-events-card-btn secondary"
                      onClick={() => handleEventAction('bookmark', event)}
                    >
                      <FontAwesomeIcon icon={faBookmark} />
                    </button>
                  </>
                ) : (
                  <button 
                    className="cultural-events-card-btn secondary"
                    onClick={() => handleEventAction('info', event)}
                  >
                    <FontAwesomeIcon icon={faCamera} />
                  </button>
                )}
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => handleEventAction('share', event)}
                >
                  <FontAwesomeIcon icon={faShare} />
                </button>
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => handleEventAction('info', event)}
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="cultural-events-stats">
          <div className="cultural-events-stats-grid">
            <div className="cultural-events-stat-card">
              <div className="cultural-events-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="cultural-events-stat-info">
                <div className="cultural-events-stat-number">24+</div>
                <div className="cultural-events-stat-label">Събития годишно</div>
              </div>
            </div>
            
            <div className="cultural-events-stat-card">
              <div className="cultural-events-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="cultural-events-stat-info">
                <div className="cultural-events-stat-number">500+</div>
                <div className="cultural-events-stat-label">Общо участници</div>
              </div>
            </div>
            
            <div className="cultural-events-stat-card">
              <div className="cultural-events-stat-icon">
                <FontAwesomeIcon icon={faTheaterMasks} />
              </div>
              <div className="cultural-events-stat-info">
                <div className="cultural-events-stat-number">12+</div>
                <div className="cultural-events-stat-label">Концерти и представления</div>
              </div>
            </div>
            
            <div className="cultural-events-stat-card">
              <div className="cultural-events-stat-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="cultural-events-stat-info">
                <div className="cultural-events-stat-number">4.8</div>
                <div className="cultural-events-stat-label">Средна оценка</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cultural-events-cta">
          <div className="cultural-events-cta-content">
            <h3>Не пропускайте нито едно събитие!</h3>
            <p>Абонирайте се за нашия бюлетин и бъдете първите, които ще научат за новите събития</p>
            <div className="cultural-events-cta-buttons">
              <button className="cultural-events-cta-primary">
                <FontAwesomeIcon icon={faHeart} />
                Абонирайте се
              </button>
              <button className="cultural-events-cta-secondary">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Календар на събитията
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="cultural-events-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="cultural-events-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="cultural-events-modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>
            
            <div className="cultural-events-modal-content">
              <img src={selectedEvent.image} alt={selectedEvent.title} />
              <div className="cultural-events-modal-info">
                <h3>{selectedEvent.title}</h3>
                <p>{selectedEvent.description}</p>
                
                <div className="cultural-events-modal-details">
                  <div className="cultural-events-modal-detail">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(selectedEvent.date)} в {selectedEvent.time}</span>
                  </div>
                  <div className="cultural-events-modal-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="cultural-events-modal-detail">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{selectedEvent.participants} участници</span>
                  </div>
                  {selectedEvent.organizer && (
                    <div className="cultural-events-modal-detail">
                      <FontAwesomeIcon icon={faUser} />
                      <span>Организатор: {selectedEvent.organizer}</span>
                    </div>
                  )}
                </div>

                {isUpcoming(selectedEvent.date) && (
                  <button 
                    className="cultural-events-modal-btn"
                    onClick={() => handleEventAction('register', selectedEvent)}
                  >
                    <FontAwesomeIcon icon={faTicketAlt} />
                    Запишете се за събитието
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CulturalEvents;