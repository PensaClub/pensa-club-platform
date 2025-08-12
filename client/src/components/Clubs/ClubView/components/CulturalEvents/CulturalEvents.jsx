import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faMusic,
  faTheaterMasks,
  faUsers,
  faClock,
  faMapMarkerAlt,
  faTicketAlt,
  faInfoCircle,
  faShare,
  faStar,
  faHeart,
  faGraduationCap,
  faBirthdayCake,
  faTree,
  faTimes,
  faEnvelope,
  faPhone,
  faUserCircle,
  faCheck,
  faExclamationTriangle,
  faImages,
  faPlay,
  faChevronLeft,
  faChevronRight,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './culturalEvents.css';

export const CulturalEvents = ({ club }) => {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [galleryEvent, setGalleryEvent] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  const [subscribeForm, setSubscribeForm] = useState({
    name: '',
    email: '',
    phone: '',
    interests: []
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    eventTitle: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  // Проверяваме дали има събития
  const events = club?.activities?.events || [];
  const trips = club?.activities?.trips || [];
  
  // Комбинираме събития и екскурзии
  const allEvents = [
    ...events.map(event => ({
      ...event,
      isTrip: false,
      location: event.location || club?.location?.address || 'Не е посочена',
      // ПОПРАВЕНО: Използваме правилните снимки от събитието
      images: event.images && event.images.length > 0 ? event.images : (event.image ? [{
        src: event.image,
        alt: event.title,
        caption: event.title,
        isMain: true
      }] : [{
        src: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        alt: event.title,
        caption: event.title,
        isMain: true
      }])
    })),
    ...trips.map(trip => ({
      ...trip,
      isTrip: true,
      title: `Екскурзия до ${trip.destination}`,
      type: 'trip',
      location: trip.destination,
      images: trip.images && trip.images.length > 0 ? trip.images : [{
        src: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        alt: `Екскурзия до ${trip.destination}`,
        caption: `Екскурзия до ${trip.destination}`,
        isMain: true
      }]
    }))
  ];

  // Ако няма събития, не показваме компонента
  if (allEvents.length === 0) {
    return null;
  }

  const eventTypes = {
    'cultural': { icon: faTheaterMasks, color: '#8b5cf6', label: 'Културни' },
    'social': { icon: faUsers, color: '#10b981', label: 'Социални' },
    'educational': { icon: faGraduationCap, color: '#3b82f6', label: 'Образователни' },
    'traditional': { icon: faTree, color: '#f59e0b', label: 'Традиционни' },
    'celebration': { icon: faBirthdayCake, color: '#ef4444', label: 'Празници' },
    'charity': { icon: faHeart, color: '#ec4899', label: 'Благотворителни' },
    'community': { icon: faUsers, color: '#06b6d4', label: 'Общностни' },
    'sports_competition': { icon: faStar, color: '#f97316', label: 'Спортни' },
    'wellness_event': { icon: faHeart, color: '#84cc16', label: 'Wellness' },
    'sports_festival': { icon: faUsers, color: '#8b5cf6', label: 'Спортни игри' },
    'swimming_competition': { icon: faUsers, color: '#0ea5e9', label: 'Плуване' },
    'trip': { icon: faMapMarkerAlt, color: '#84cc16', label: 'Екскурзии' }
  };

  const currentDate = new Date();
  const upcomingEvents = allEvents.filter(event => new Date(event.date) >= currentDate);
  const pastEvents = allEvents.filter(event => new Date(event.date) < currentDate);
  const featuredEvent = upcomingEvents.find(event => event.featured) || upcomingEvents[0];

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
      case 'traditional':
        return allEvents.filter(event => event.type === 'traditional');
      default:
        return upcomingEvents;
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
    return new Date(dateString) >= currentDate;
  };

  const getMainImage = (event) => {
    if (!event.images || event.images.length === 0) {
      return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
    }
    const mainImg = event.images.find(img => img.isMain);
    return mainImg ? mainImg.src : event.images[0].src;
  };

  // НАПЪЛНО ПОПРАВЕНА Gallery Functions
  const openGallery = (event) => {
    console.log('Opening gallery for event:', event);
    setGalleryEvent(event);
    setCurrentMediaIndex(0);
    setShowGalleryModal(true);
    setIsVideoPlaying(false);
    setImageLoading(false);
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
    setGalleryEvent(null);
    setCurrentMediaIndex(0);
    setIsVideoPlaying(false);
    setImageLoading(false);
  };

  // НАПЪЛНО ПОПРАВЕНА getAllMedia функция
  const getAllMedia = (event) => {
    if (!event) return [];
    
    const media = [];
    
    // Добавяме снимките от събитието
    if (event.images && Array.isArray(event.images) && event.images.length > 0) {
      event.images.forEach((img, index) => {
        media.push({ 
          ...img, 
          type: 'image',
          id: `image-${index}`,
          index: index
        });
      });
    }
    
    // Добавяме видеата от събитието
    if (event.videos && Array.isArray(event.videos) && event.videos.length > 0) {
      event.videos.forEach((video, index) => {
        media.push({ 
          ...video, 
          type: 'video',
          id: `video-${index}`,
          index: media.length + index
        });
      });
    }
    
    console.log('All media for event:', media);
    return media;
  };

  const navigateGallery = (direction) => {
    const allMedia = getAllMedia(galleryEvent);
    if (allMedia.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentMediaIndex + 1) % allMedia.length;
    } else {
      newIndex = (currentMediaIndex - 1 + allMedia.length) % allMedia.length;
    }
    
    console.log('Navigating to index:', newIndex);
    setCurrentMediaIndex(newIndex);
    setIsVideoPlaying(false);
    setImageLoading(true);
  };

  // ПОПРАВЕНА setCurrentMediaIndex за миниатюрите
  const selectMedia = (index) => {
    console.log('Selecting media at index:', index);
    setCurrentMediaIndex(index);
    setIsVideoPlaying(false);
    setImageLoading(true);
  };

  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  // Event Actions
  const handleRegisterForEvent = (event) => {
    setSelectedEvent(event);
    setRegisterForm(prev => ({
      ...prev,
      eventTitle: event.title
    }));
    setShowEventModal(true);
  };

  const handleEventInfo = (event) => {
    setSelectedEvent(event);
    // Show detailed info - можеш да добавиш отделен модал за детайли
  };

  const handleShareEvent = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(`${event.title} - ${shareUrl}`);
      alert('Линкът е копиран в клипборда!');
    }
  };

  // Subscribe Modal
  const openSubscribeModal = () => {
    setShowSubscribeModal(true);
  };

  const closeSubscribeModal = () => {
    setShowSubscribeModal(false);
    setSubscribeForm({
      name: '',
      email: '',
      phone: '',
      interests: []
    });
    setFormStatus(null);
  };

  // Contact Modal
  const openContactModal = () => {
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setFormStatus(null);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setRegisterForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      eventTitle: ''
    });
    setFormStatus(null);
  };

  // Form handlers
  const handleSubscribeFormChange = (field, value) => {
    setSubscribeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegisterFormChange = (field, value) => {
    setRegisterForm(prev => ({
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

  const handleInterestToggle = (interest) => {
    setSubscribeForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(`Абониране за бюлетин - ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте заявка за абониране за бюлетин от ${club.name}:

Име: ${subscribeForm.name}
Имейл: ${subscribeForm.email}
Телефон: ${subscribeForm.phone || 'Не е посочен'}
Интереси: ${subscribeForm.interests.join(', ') || 'Всички събития'}

---
Изпратено от ${subscribeForm.email}
      `);
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeSubscribeModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(`Записване за събитие - ${registerForm.eventTitle}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте заявка за записване за събитие от ${club.name}:

Събитие: ${registerForm.eventTitle}
Име: ${registerForm.name}
Имейл: ${registerForm.email}
Телефон: ${registerForm.phone || 'Не е посочен'}

Съобщение:
${registerForm.message || 'Няма допълнително съобщение'}

---
Изпратено от ${registerForm.email}
      `);
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeEventModal();
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
      const subject = encodeURIComponent(contactForm.subject || `Запитване за събития - ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте запитване за събития от ${club.name}:

Име: ${contactForm.name}
Имейл: ${contactForm.email}
Телефон: ${contactForm.phone || 'Не е посочен'}
Тема: ${contactForm.subject || 'Общо запитване'}

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

  return (
    <section id="cultural-events" className="cultural-events-main-section">
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
                    <span>{formatDate(featuredEvent.date)} {featuredEvent.time && `в ${featuredEvent.time}`}</span>
                  </div>
                  <div className="cultural-events-featured-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{featuredEvent.location}</span>
                  </div>
                  {featuredEvent.participants && (
                    <div className="cultural-events-featured-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{featuredEvent.participants} участници</span>
                    </div>
                  )}
                  {featuredEvent.price && (
                    <div className="cultural-events-featured-detail">
                      <FontAwesomeIcon icon={faTicketAlt} />
                      <span>{featuredEvent.price}</span>
                    </div>
                  )}
                </div>

                {featuredEvent.highlights && (
                  <div className="cultural-events-featured-highlights">
                    {featuredEvent.highlights.map((highlight, index) => (
                      <span key={index} className="cultural-events-highlight-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}

                <div className="cultural-events-featured-actions">
                  {isUpcoming(featuredEvent.date) && (
                    <button 
                      className="cultural-events-btn-primary"
                      onClick={() => handleRegisterForEvent(featuredEvent)}
                    >
                      <FontAwesomeIcon icon={faTicketAlt} />
                      Запишете се
                    </button>
                  )}
                  <button 
                    className="cultural-events-btn-secondary"
                    onClick={() => openGallery(featuredEvent)}
                  >
                    <FontAwesomeIcon icon={faImages} />
                    Галерия
                  </button>
                </div>
              </div>
              <div className="cultural-events-featured-image">
                <img src={getMainImage(featuredEvent)} alt={featuredEvent.title} />
                {featuredEvent.type && eventTypes[featuredEvent.type] && (
                  <div className="cultural-events-featured-type">
                    <FontAwesomeIcon icon={eventTypes[featuredEvent.type].icon} />
                    <span>{eventTypes[featuredEvent.type].label}</span>
                  </div>
                )}
                {(featuredEvent.images?.length > 1 || featuredEvent.videos?.length > 0) && (
                  <div className="cultural-events-featured-gallery-indicator">
                    <FontAwesomeIcon icon={faImages} />
                    <span>{(featuredEvent.images?.length || 0) + (featuredEvent.videos?.length || 0)}</span>
                  </div>
                )}
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
            Предстоящи ({upcomingEvents.length})
          </button>
          {pastEvents.length > 0 && (
            <button 
              className={`cultural-events-filter ${activeFilter === 'past' ? 'active' : ''}`}
              onClick={() => setActiveFilter('past')}
            >
              <FontAwesomeIcon icon={faImages} />
              Минали събития ({pastEvents.length})
            </button>
          )}
          {allEvents.some(e => e.type === 'cultural') && (
            <button 
              className={`cultural-events-filter ${activeFilter === 'cultural' ? 'active' : ''}`}
              onClick={() => setActiveFilter('cultural')}
            >
              <FontAwesomeIcon icon={faTheaterMasks} />
              Културни
            </button>
          )}
          {allEvents.some(e => e.type === 'traditional') && (
            <button 
              className={`cultural-events-filter ${activeFilter === 'traditional' ? 'active' : ''}`}
              onClick={() => setActiveFilter('traditional')}
            >
              <FontAwesomeIcon icon={faTree} />
              Традиционни
            </button>
          )}
        </div>

        {/* Events Grid */}
        <div className="cultural-events-grid">
          {getEventsToShow().map((event) => (
            <div key={event.id} className="cultural-events-card">
              <div className="cultural-events-card-image">
                <img src={getMainImage(event)} alt={event.title} />
                {event.type && eventTypes[event.type] && (
                  <div className="cultural-events-card-type" style={{background: eventTypes[event.type].color}}>
                    <FontAwesomeIcon icon={eventTypes[event.type].icon} />
                  </div>
                )}
                {(event.images?.length > 1 || event.videos?.length > 0) && (
                  <div className="cultural-events-card-gallery-indicator">
                    <FontAwesomeIcon icon={faImages} />
                    <span>{(event.images?.length || 0) + (event.videos?.length || 0)}</span>
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
                    {event.time && (
                      <div className="cultural-events-card-detail">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="cultural-events-card-detail">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{event.location}</span>
                    </div>
                    {event.participants && (
                      <div className="cultural-events-card-detail">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{event.participants} участници</span>
                      </div>
                    )}
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
                {isUpcoming(event.date) && (
                  <button 
                    className="cultural-events-card-btn primary"
                    onClick={() => handleRegisterForEvent(event)}
                    title="Запишете се за събитието"
                  >
                    <FontAwesomeIcon icon={faTicketAlt} />
                  </button>
                )}
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => openGallery(event)}
                  title="Вижте галерията"
                >
                  <FontAwesomeIcon icon={faImages} />
                </button>
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => handleShareEvent(event)}
                  title="Споделете събитието"
                >
                  <FontAwesomeIcon icon={faShare} />
                </button>
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => handleEventInfo(event)}
                  title="Повече информация"
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics - само ако има данни */}
        {(club.stats || events.length > 0) && (
          <div className="cultural-events-stats">
            <div className="cultural-events-stats-grid">
              <div className="cultural-events-stat-card">
                <div className="cultural-events-stat-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className="cultural-events-stat-info">
                  <div className="cultural-events-stat-number">{allEvents.length}+</div>
                  <div className="cultural-events-stat-label">Събития годишно</div>
                </div>
              </div>
              
              {club.stats?.events && (
                <div className="cultural-events-stat-card">
                  <div className="cultural-events-stat-icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="cultural-events-stat-info">
                    <div className="cultural-events-stat-number">{club.stats.events}+</div>
                    <div className="cultural-events-stat-label">Общо участници</div>
                  </div>
                </div>
              )}
              
              {club.stats?.performances && (
                <div className="cultural-events-stat-card">
                  <div className="cultural-events-stat-icon">
                    <FontAwesomeIcon icon={faTheaterMasks} />
                  </div>
                  <div className="cultural-events-stat-info">
                    <div className="cultural-events-stat-number">{club.stats.performances}+</div>
                    <div className="cultural-events-stat-label">Концерти и представления</div>
                  </div>
                </div>
              )}
              
              {club.metadata?.rating && (
                <div className="cultural-events-stat-card">
                  <div className="cultural-events-stat-icon">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <div className="cultural-events-stat-info">
                    <div className="cultural-events-stat-number">{club.metadata.rating}</div>
                    <div className="cultural-events-stat-label">Средна оценка</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="cultural-events-cta">
          <div className="cultural-events-cta-content">
            <h3>Не пропускайте нито едно събитие!</h3>
            <p>Абонирайте се за нашия бюлетин и бъдете първите, които ще научат за новите събития</p>
            <div className="cultural-events-cta-buttons">
              <button className="cultural-events-cta-primary" onClick={openSubscribeModal}>
                <FontAwesomeIcon icon={faHeart} />
                Абонирайте се
              </button>
              <button 
                className="cultural-events-cta-secondary"
                onClick={openContactModal}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                Свържете се с нас
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* НАПЪЛНО ПОПРАВЕНА Gallery Modal */}
      {showGalleryModal && galleryEvent && (
        <div className="cultural-events-gallery-modal" onClick={closeGallery}>
          <div className="cultural-events-gallery-container" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-events-gallery-close" onClick={closeGallery}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-events-gallery-header">
              <h3>{galleryEvent.title}</h3>
              <div className="cultural-events-gallery-counter">
                {currentMediaIndex + 1} / {getAllMedia(galleryEvent).length}
              </div>
            </div>
            
            <div className="cultural-events-gallery-content">
              {getAllMedia(galleryEvent).length > 1 && (
                <button 
                  className="cultural-events-gallery-nav prev"
                  onClick={() => navigateGallery('prev')}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              )}
              
              <div className="cultural-events-gallery-media">
                {imageLoading && (
                  <div className="cultural-events-loading">
                    <FontAwesomeIcon icon={faSpinner} spin />
                  </div>
                )}
                
                {(() => {
                  const allMedia = getAllMedia(galleryEvent);
                  const currentMedia = allMedia[currentMediaIndex];
                  
                  if (!currentMedia) {
                    return <div className="cultural-events-no-media">Няма налични медийни файлове</div>;
                  }
                  
                  if (currentMedia.type === 'video') {
                    return (
                      <div className="cultural-events-gallery-video">
                        <video 
                          src={currentMedia.src}
                          poster={currentMedia.thumbnail}
                          controls={isVideoPlaying}
                          onClick={toggleVideo}
                          onLoadStart={() => setImageLoading(false)}
                          onError={handleImageError}
                        />
                        {!isVideoPlaying && (
                          <button className="cultural-events-video-play" onClick={toggleVideo}>
                            <FontAwesomeIcon icon={faPlay} />
                          </button>
                        )}
                        {currentMedia.duration && (
                          <div className="cultural-events-video-info">
                            <span className="cultural-events-video-duration">{currentMedia.duration}</span>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <img 
                        src={currentMedia.src} 
                        alt={currentMedia.alt || currentMedia.caption || galleryEvent.title}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{
                          display: imageLoading ? 'none' : 'block',
                          maxWidth: '100%',
                          maxHeight: '70vh',
                          objectFit: 'contain'
                        }}
                      />
                    );
                  }
                })()}
              </div>
              
              {getAllMedia(galleryEvent).length > 1 && (
                <button 
                  className="cultural-events-gallery-nav next"
                  onClick={() => navigateGallery('next')}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              )}
            </div>
            
            <div className="cultural-events-gallery-caption">
              <p>{getAllMedia(galleryEvent)[currentMediaIndex]?.caption || getAllMedia(galleryEvent)[currentMediaIndex]?.alt || galleryEvent.title}</p>
            </div>
            
            <div className="cultural-events-gallery-thumbnails">
              {getAllMedia(galleryEvent).map((media, index) => (
                <button
                  key={media.id}
                  className={`cultural-events-gallery-thumb ${index === currentMediaIndex ? 'active' : ''}`}
                  onClick={() => selectMedia(index)}
                >
                  {media.type === 'video' ? (
                    <div className="cultural-events-thumb-video">
                      <img 
                        src={media.thumbnail || `https://picsum.photos/80/60?random=${index}`} 
                        alt={media.alt || `Video ${index + 1}`} 
                      />
                      <div className="cultural-events-thumb-play">
                        <FontAwesomeIcon icon={faPlay} />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={media.src} 
                      alt={media.alt || media.caption || `Image ${index + 1}`} 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="cultural-events-modal-overlay" onClick={closeSubscribeModal}>
          <div className="cultural-events-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-events-modal-close" onClick={closeSubscribeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-events-modal-content">
              <div className="cultural-events-modal-header">
                <FontAwesomeIcon icon={faHeart} />
                <h3>Абонирайте се за нашия бюлетин</h3>
                <p>Получавайте новини за всички събития директно в имейла си</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-events-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>Успешно се абонирахте!</h4>
                  <p>Благодарим ви! Ще получавате новини за нашите събития.</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-events-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>Възникна грешка</h4>
                  <p>Моля опитайте отново или се свържете с нас директно.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} className="cultural-events-modal-form">
                  <div className="cultural-events-form-row">
                    <div className="cultural-events-form-group">
                      <label htmlFor="subscribeName">
                        <FontAwesomeIcon icon={faUserCircle} />
                        Вашето име *
                      </label>
                      <input
                        type="text"
                        id="subscribeName"
                        value={subscribeForm.name}
                        onChange={(e) => handleSubscribeFormChange('name', e.target.value)}
                        required
                        placeholder="Въведете вашето име"
                      />
                    </div>
                    
                    <div className="cultural-events-form-group">
                      <label htmlFor="subscribeEmail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        Имейл адрес *
                      </label>
                      <input
                        type="email"
                        id="subscribeEmail"
                        value={subscribeForm.email}
                        onChange={(e) => handleSubscribeFormChange('email', e.target.value)}
                        required
                        placeholder="Въведете вашия имейл"
                      />
                    </div>
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="subscribePhone">
                      <FontAwesomeIcon icon={faPhone} />
                      Телефон (по желание)
                    </label>
                    <input
                      type="tel"
                      id="subscribePhone"
                      value={subscribeForm.phone}
                      onChange={(e) => handleSubscribeFormChange('phone', e.target.value)}
                      placeholder="Въведете вашия телефон"
                    />
                  </div>

                  <div className="cultural-events-form-group">
                    <label>
                      <FontAwesomeIcon icon={faHeart} />
                      Какво ви интересува? (изберете едно или повече)
                    </label>
                    <div className="cultural-events-interests-grid">
                      {Object.values(eventTypes).map((type) => (
                        <button
                          key={type.label}
                          type="button"
                          className={`cultural-events-interest-btn ${subscribeForm.interests.includes(type.label) ? 'selected' : ''}`}
                          onClick={() => handleInterestToggle(type.label)}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="cultural-events-form-actions">
                    <button 
                      type="submit" 
                      className="cultural-events-submit-btn"
                      disabled={formStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                      {formStatus === 'sending' ? 'Изпраща се...' : 'Абонирайте се'}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeSubscribeModal}
                      className="cultural-events-cancel-btn"
                    >
                      Отказ
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="cultural-events-modal-overlay" onClick={closeContactModal}>
          <div className="cultural-events-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-events-modal-close" onClick={closeContactModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-events-modal-content">
              <div className="cultural-events-modal-header">
                <FontAwesomeIcon icon={faEnvelope} />
                <h3>Свържете се с нас</h3>
                <p>Задайте вашия въпрос за събитията и ще ви отговорим възможно най-скоро</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-events-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>Съобщението е изпратено!</h4>
                  <p>Благодарим ви! Ще се свържем с вас скоро.</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-events-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>Възникна грешка</h4>
                  <p>Моля опитайте отново или се свържете с нас директно.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="cultural-events-modal-form">
                  <div className="cultural-events-form-row">
                    <div className="cultural-events-form-group">
                      <label htmlFor="contactName">
                        <FontAwesomeIcon icon={faUserCircle} />
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
                    
                    <div className="cultural-events-form-group">
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
                  
                  <div className="cultural-events-form-group">
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

                  <div className="cultural-events-form-group">
                    <label htmlFor="contactSubject">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Тема на запитването *
                    </label>
                    <input
                      type="text"
                      id="contactSubject"
                      value={contactForm.subject}
                      onChange={(e) => handleContactFormChange('subject', e.target.value)}
                      required
                      placeholder="Кратко опишете темата"
                    />
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="contactMessage">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Съобщение *
                    </label>
                    <textarea
                      id="contactMessage"
                      value={contactForm.message}
                      onChange={(e) => handleContactFormChange('message', e.target.value)}
                      required
                      placeholder="Какво бихте искали да знаете за нашите събития?"
                      rows="4"
                    />
                  </div>
                  
                  <div className="cultural-events-form-actions">
                    <button 
                      type="submit" 
                      className="cultural-events-submit-btn"
                      disabled={formStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                      {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщение'}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeContactModal}
                      className="cultural-events-cancel-btn"
                    >
                      Отказ
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Registration Modal */}
      {showEventModal && selectedEvent && (
        <div className="cultural-events-modal-overlay" onClick={closeEventModal}>
          <div className="cultural-events-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-events-modal-close" onClick={closeEventModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-events-modal-content">
              <div className="cultural-events-modal-header">
                <FontAwesomeIcon icon={faTicketAlt} />
                <h3>Записване за {selectedEvent.title}</h3>
                <p>Попълнете формата и ще се свържем с вас за потвърждение</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-events-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>Заявката е изпратена!</h4>
                  <p>Благодарим ви! Ще се свържем с вас скоро за потвърждение на записването.</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-events-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>Възникна грешка</h4>
                  <p>Моля опитайте отново или се свържете с нас директно.</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="cultural-events-modal-form">
                  <div className="cultural-events-form-row">
                    <div className="cultural-events-form-group">
                      <label htmlFor="registerName">
                        <FontAwesomeIcon icon={faUserCircle} />
                        Вашето име *
                      </label>
                      <input
                        type="text"
                        id="registerName"
                        value={registerForm.name}
                        onChange={(e) => handleRegisterFormChange('name', e.target.value)}
                        required
                        placeholder="Въведете вашето име"
                      />
                    </div>
                    
                    <div className="cultural-events-form-group">
                      <label htmlFor="registerEmail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        Имейл адрес *
                      </label>
                      <input
                        type="email"
                        id="registerEmail"
                        value={registerForm.email}
                        onChange={(e) => handleRegisterFormChange('email', e.target.value)}
                        required
                        placeholder="Въведете вашия имейл"
                      />
                    </div>
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="registerPhone">
                      <FontAwesomeIcon icon={faPhone} />
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      id="registerPhone"
                      value={registerForm.phone}
                      onChange={(e) => handleRegisterFormChange('phone', e.target.value)}
                      required
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="registerMessage">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Допълнително съобщение (по желание)
                    </label>
                    <textarea
                      id="registerMessage"
                      value={registerForm.message}
                      onChange={(e) => handleRegisterFormChange('message', e.target.value)}
                      placeholder="Имате ли специални изисквания или въпроси?"
                      rows="4"
                    />
                  </div>
                  
                  <div className="cultural-events-form-actions">
                    <button 
                      type="submit" 
                      className="cultural-events-submit-btn"
                      disabled={formStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faTicketAlt} />
                      {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявка'}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeEventModal}
                      className="cultural-events-cancel-btn"
                    >
                      Отказ
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CulturalEvents;