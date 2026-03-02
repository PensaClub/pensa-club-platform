import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation('clubs');
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

  const events = club?.activities?.events || [];
  const trips = club?.activities?.trips || [];
  
  const getEventTypes = () => ({
    'cultural': { icon: faTheaterMasks, color: '#8b5cf6', label: t('clubs.CulturalEvents.eventTypes.cultural') },
    'social': { icon: faUsers, color: '#10b981', label: t('clubs.CulturalEvents.eventTypes.social') },
    'educational': { icon: faGraduationCap, color: '#3b82f6', label: t('clubs.CulturalEvents.eventTypes.educational') },
    'traditional': { icon: faTree, color: '#f59e0b', label: t('clubs.CulturalEvents.eventTypes.traditional') },
    'celebration': { icon: faBirthdayCake, color: '#ef4444', label: t('clubs.CulturalEvents.eventTypes.celebration') },
    'charity': { icon: faHeart, color: '#ec4899', label: t('clubs.CulturalEvents.eventTypes.charity') },
    'community': { icon: faUsers, color: '#06b6d4', label: t('clubs.CulturalEvents.eventTypes.community') },
    'sports_competition': { icon: faStar, color: '#f97316', label: t('clubs.CulturalEvents.eventTypes.sports') },
    'wellness_event': { icon: faHeart, color: '#84cc16', label: t('clubs.CulturalEvents.eventTypes.wellness') },
    'sports_festival': { icon: faUsers, color: '#8b5cf6', label: t('clubs.CulturalEvents.eventTypes.sportsGames') },
    'swimming_competition': { icon: faUsers, color: '#0ea5e9', label: t('clubs.CulturalEvents.eventTypes.swimming') },
    'trip': { icon: faMapMarkerAlt, color: '#84cc16', label: t('clubs.CulturalEvents.eventTypes.trips') }
  });

  const allEvents = [
    ...events.map(event => ({
      ...event,
      isTrip: false,
      location: event.location || club?.location?.address || t('clubs.CulturalEvents.notSpecified'),
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
      title: t('clubs.CulturalEvents.tripTo', { destination: trip.destination }),
      type: 'trip',
      location: trip.destination,
      images: trip.images && trip.images.length > 0 ? trip.images : [{
        src: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        alt: t('clubs.CulturalEvents.tripTo', { destination: trip.destination }),
        caption: t('clubs.CulturalEvents.tripTo', { destination: trip.destination }),
        isMain: true
      }]
    }))
  ];

  if (allEvents.length === 0) {
    return null;
  }

  const eventTypes = getEventTypes();
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
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return date.toLocaleDateString(locale, { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatShortMonth = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return date.toLocaleDateString(locale, { month: 'short' });
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

  const openGallery = (event) => {
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

  const getAllMedia = (event) => {
    if (!event) return [];
    
    const media = [];
    
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
    
    setCurrentMediaIndex(newIndex);
    setIsVideoPlaying(false);
    setImageLoading(true);
  };

  const selectMedia = (index) => {
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
      alert(t('clubs.CulturalEvents.messages.linkCopied'));
    }
  };

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
      const subject = encodeURIComponent(t('clubs.CulturalEvents.modals.subscribe.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.CulturalEvents.modals.subscribe.emailBody', {
        clubName: club.name,
        name: subscribeForm.name,
        email: subscribeForm.email,
        phone: subscribeForm.phone || t('clubs.CulturalEvents.form.notSpecified'),
        interests: subscribeForm.interests.join(', ') || t('clubs.CulturalEvents.modals.subscribe.allEvents'),
        senderEmail: subscribeForm.email
      }));
      
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
      const subject = encodeURIComponent(t('clubs.CulturalEvents.modals.register.emailSubject', { eventTitle: registerForm.eventTitle }));
      const body = encodeURIComponent(t('clubs.CulturalEvents.modals.register.emailBody', {
        clubName: club.name,
        eventTitle: registerForm.eventTitle,
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone || t('clubs.CulturalEvents.form.notSpecified'),
        message: registerForm.message || t('clubs.CulturalEvents.form.noMessage'),
        senderEmail: registerForm.email
      }));
      
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
      const subject = encodeURIComponent(contactForm.subject || t('clubs.CulturalEvents.modals.contact.defaultSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.CulturalEvents.modals.contact.emailBody', {
        clubName: club.name,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || t('clubs.CulturalEvents.form.notSpecified'),
        subject: contactForm.subject || t('clubs.CulturalEvents.modals.contact.generalInquiry'),
        message: contactForm.message,
        senderEmail: contactForm.email
      }));
      
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
        
        <div className="cultural-events-header">
          <div className="cultural-events-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{t('clubs.CulturalEvents.header.badge')}</span>
          </div>
          <h2 className="cultural-events-title">{t('clubs.CulturalEvents.header.title')}</h2>
          <p className="cultural-events-subtitle">
            {t('clubs.CulturalEvents.header.subtitle')}
          </p>
        </div>

        {featuredEvent && (
          <div className="cultural-events-featured">
            <div className="cultural-events-featured-content">
              <div className="cultural-events-featured-info">
                <div className="cultural-events-featured-badge">
                  <FontAwesomeIcon icon={faStar} />
                  <span>{t('clubs.CulturalEvents.featured.badge')}</span>
                </div>
                <h3>{featuredEvent.title}</h3>
                <p>{featuredEvent.description}</p>
                
                <div className="cultural-events-featured-details">
                  <div className="cultural-events-featured-detail">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(featuredEvent.date)} {featuredEvent.time && t('clubs.CulturalEvents.featured.timeAt', { time: featuredEvent.time })}</span>
                  </div>
                  <div className="cultural-events-featured-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{featuredEvent.location}</span>
                  </div>
                  {featuredEvent.participants && (
                    <div className="cultural-events-featured-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{featuredEvent.participants} {t('clubs.CulturalEvents.participants')}</span>
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
                      {t('clubs.CulturalEvents.buttons.register')}
                    </button>
                  )}
                  <button 
                    className="cultural-events-btn-secondary"
                    onClick={() => openGallery(featuredEvent)}
                  >
                    <FontAwesomeIcon icon={faImages} />
                    {t('clubs.CulturalEvents.buttons.gallery')}
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

        <div className="cultural-events-filters">
          <button 
            className={`cultural-events-filter ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            {t('clubs.CulturalEvents.filters.upcoming')} ({upcomingEvents.length})
          </button>
          {pastEvents.length > 0 && (
            <button 
              className={`cultural-events-filter ${activeFilter === 'past' ? 'active' : ''}`}
              onClick={() => setActiveFilter('past')}
            >
              <FontAwesomeIcon icon={faImages} />
              {t('clubs.CulturalEvents.filters.past')} ({pastEvents.length})
            </button>
          )}
          {allEvents.some(e => e.type === 'cultural') && (
            <button 
              className={`cultural-events-filter ${activeFilter === 'cultural' ? 'active' : ''}`}
              onClick={() => setActiveFilter('cultural')}
            >
              <FontAwesomeIcon icon={faTheaterMasks} />
              {t('clubs.CulturalEvents.filters.cultural')}
            </button>
          )}
          {allEvents.some(e => e.type === 'traditional') && (
            <button 
              className={`cultural-events-filter ${activeFilter === 'traditional' ? 'active' : ''}`}
              onClick={() => setActiveFilter('traditional')}
            >
              <FontAwesomeIcon icon={faTree} />
              {t('clubs.CulturalEvents.filters.traditional')}
            </button>
          )}
        </div>

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
                    {formatShortMonth(event.date)}
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
                        <span>{event.participants} {t('clubs.CulturalEvents.participants')}</span>
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
                    title={t('clubs.CulturalEvents.tooltips.register')}
                  >
                    <FontAwesomeIcon icon={faTicketAlt} />
                  </button>
                )}
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => openGallery(event)}
                  title={t('clubs.CulturalEvents.tooltips.gallery')}
                >
                  <FontAwesomeIcon icon={faImages} />
                </button>
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => handleShareEvent(event)}
                  title={t('clubs.CulturalEvents.tooltips.share')}
                >
                  <FontAwesomeIcon icon={faShare} />
                </button>
                <button 
                  className="cultural-events-card-btn secondary"
                  onClick={() => handleEventInfo(event)}
                  title={t('clubs.CulturalEvents.tooltips.info')}
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {(club.stats || events.length > 0) && (
          <div className="cultural-events-stats">
            <div className="cultural-events-stats-grid">
              <div className="cultural-events-stat-card">
                <div className="cultural-events-stat-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className="cultural-events-stat-info">
                  <div className="cultural-events-stat-number">{allEvents.length}+</div>
                  <div className="cultural-events-stat-label">{t('clubs.CulturalEvents.stats.eventsYearly')}</div>
                </div>
              </div>
              
              {club.stats?.events && (
                <div className="cultural-events-stat-card">
                  <div className="cultural-events-stat-icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="cultural-events-stat-info">
                    <div className="cultural-events-stat-number">{club.stats.events}+</div>
                    <div className="cultural-events-stat-label">{t('clubs.CulturalEvents.stats.totalParticipants')}</div>
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
                    <div className="cultural-events-stat-label">{t('clubs.CulturalEvents.stats.concerts')}</div>
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
                    <div className="cultural-events-stat-label">{t('clubs.CulturalEvents.stats.averageRating')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="cultural-events-cta">
          <div className="cultural-events-cta-content">
            <h3>{t('clubs.CulturalEvents.cta.title')}</h3>
            <p>{t('clubs.CulturalEvents.cta.subtitle')}</p>
            <div className="cultural-events-cta-buttons">
              <button className="cultural-events-cta-primary" onClick={openSubscribeModal}>
                <FontAwesomeIcon icon={faHeart} />
                {t('clubs.CulturalEvents.cta.subscribe')}
              </button>
              <button 
                className="cultural-events-cta-secondary"
                onClick={openContactModal}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                {t('clubs.CulturalEvents.cta.contact')}
              </button>
            </div>
          </div>
        </div>
      </div>

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
                    return <div className="cultural-events-no-media">{t('clubs.CulturalEvents.gallery.noMedia')}</div>;
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
                        alt={media.alt || t('clubs.CulturalEvents.gallery.videoAlt', { index: index + 1 })} 
                      />
                      <div className="cultural-events-thumb-play">
                        <FontAwesomeIcon icon={faPlay} />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={media.src} 
                      alt={media.alt || media.caption || t('clubs.CulturalEvents.gallery.imageAlt', { index: index + 1 })} 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSubscribeModal && (
        <div className="cultural-events-modal-overlay" onClick={closeSubscribeModal}>
          <div className="cultural-events-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-events-modal-close" onClick={closeSubscribeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-events-modal-content">
              <div className="cultural-events-modal-header">
                <FontAwesomeIcon icon={faHeart} />
                <h3>{t('clubs.CulturalEvents.modals.subscribe.title')}</h3>
                <p>{t('clubs.CulturalEvents.modals.subscribe.subtitle')}</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-events-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>{t('clubs.CulturalEvents.modals.subscribe.success.title')}</h4>
                  <p>{t('clubs.CulturalEvents.modals.subscribe.success.message')}</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-events-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>{t('clubs.CulturalEvents.form.error.title')}</h4>
                  <p>{t('clubs.CulturalEvents.form.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} className="cultural-events-modal-form">
                  <div className="cultural-events-form-row">
                    <div className="cultural-events-form-group">
                      <label htmlFor="subscribeName">
                        <FontAwesomeIcon icon={faUserCircle} />
                        {t('clubs.CulturalEvents.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="subscribeName"
                        value={subscribeForm.name}
                        onChange={(e) => handleSubscribeFormChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalEvents.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="cultural-events-form-group">
                      <label htmlFor="subscribeEmail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.CulturalEvents.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="subscribeEmail"
                        value={subscribeForm.email}
                        onChange={(e) => handleSubscribeFormChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalEvents.form.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="subscribePhone">
                      <FontAwesomeIcon icon={faPhone} />
                      {t('clubs.CulturalEvents.form.phoneOptional')}
                    </label>
                    <input
                      type="tel"
                      id="subscribePhone"
                      value={subscribeForm.phone}
                      onChange={(e) => handleSubscribeFormChange('phone', e.target.value)}
                      placeholder={t('clubs.CulturalEvents.form.phonePlaceholder')}
                    />
                  </div>

                  <div className="cultural-events-form-group">
                    <label>
                      <FontAwesomeIcon icon={faHeart} />
                      {t('clubs.CulturalEvents.modals.subscribe.interestsLabel')}
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
                      {formStatus === 'sending' ? t('clubs.CulturalEvents.form.sending') : t('clubs.CulturalEvents.form.subscribe')}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeSubscribeModal}
                      className="cultural-events-cancel-btn"
                    >
                      {t('clubs.CulturalEvents.form.cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="cultural-events-modal-overlay" onClick={closeContactModal}>
          <div className="cultural-events-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-events-modal-close" onClick={closeContactModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-events-modal-content">
              <div className="cultural-events-modal-header">
                <FontAwesomeIcon icon={faEnvelope} />
                <h3>{t('clubs.CulturalEvents.modals.contact.title')}</h3>
                <p>{t('clubs.CulturalEvents.modals.contact.subtitle')}</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-events-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>{t('clubs.CulturalEvents.modals.contact.success.title')}</h4>
                  <p>{t('clubs.CulturalEvents.modals.contact.success.message')}</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-events-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>{t('clubs.CulturalEvents.form.error.title')}</h4>
                  <p>{t('clubs.CulturalEvents.form.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="cultural-events-modal-form">
                  <div className="cultural-events-form-row">
                    <div className="cultural-events-form-group">
                      <label htmlFor="contactName">
                        <FontAwesomeIcon icon={faUserCircle} />
                        {t('clubs.CulturalEvents.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        value={contactForm.name}
                        onChange={(e) => handleContactFormChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalEvents.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="cultural-events-form-group">
                      <label htmlFor="contactEmail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.CulturalEvents.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        value={contactForm.email}
                        onChange={(e) => handleContactFormChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalEvents.form.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="contactPhone">
                      <FontAwesomeIcon icon={faPhone} />
                      {t('clubs.CulturalEvents.form.phoneOptional')}
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={contactForm.phone}
                      onChange={(e) => handleContactFormChange('phone', e.target.value)}
                      placeholder={t('clubs.CulturalEvents.form.phonePlaceholder')}
                    />
                  </div>

                  <div className="cultural-events-form-group">
                    <label htmlFor="contactSubject">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalEvents.modals.contact.subjectLabel')} *
                    </label>
                    <input
                      type="text"
                      id="contactSubject"
                      value={contactForm.subject}
                      onChange={(e) => handleContactFormChange('subject', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalEvents.modals.contact.subjectPlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="contactMessage">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalEvents.form.messageRequired')} *
                    </label>
                    <textarea
                      id="contactMessage"
                      value={contactForm.message}
                      onChange={(e) => handleContactFormChange('message', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalEvents.modals.contact.messagePlaceholder')}
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
                      {formStatus === 'sending' ? t('clubs.CulturalEvents.form.sending') : t('clubs.CulturalEvents.form.sendMessage')}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeContactModal}
                      className="cultural-events-cancel-btn"
                    >
                      {t('clubs.CulturalEvents.form.cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showEventModal && selectedEvent && (
        <div className="cultural-events-modal-overlay" onClick={closeEventModal}>
          <div className="cultural-events-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-events-modal-close" onClick={closeEventModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-events-modal-content">
              <div className="cultural-events-modal-header">
                <FontAwesomeIcon icon={faTicketAlt} />
                <h3>{t('clubs.CulturalEvents.modals.register.title', { eventTitle: selectedEvent.title })}</h3>
                <p>{t('clubs.CulturalEvents.modals.register.subtitle')}</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-events-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>{t('clubs.CulturalEvents.modals.register.success.title')}</h4>
                  <p>{t('clubs.CulturalEvents.modals.register.success.message')}</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-events-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>{t('clubs.CulturalEvents.form.error.title')}</h4>
                  <p>{t('clubs.CulturalEvents.form.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="cultural-events-modal-form">
                  <div className="cultural-events-form-row">
                    <div className="cultural-events-form-group">
                      <label htmlFor="registerName">
                        <FontAwesomeIcon icon={faUserCircle} />
                        {t('clubs.CulturalEvents.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="registerName"
                        value={registerForm.name}
                        onChange={(e) => handleRegisterFormChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalEvents.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="cultural-events-form-group">
                      <label htmlFor="registerEmail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.CulturalEvents.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="registerEmail"
                        value={registerForm.email}
                        onChange={(e) => handleRegisterFormChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalEvents.form.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="registerPhone">
                      <FontAwesomeIcon icon={faPhone} />
                      {t('clubs.CulturalEvents.form.phoneRequired')} *
                    </label>
                    <input
                      type="tel"
                      id="registerPhone"
                      value={registerForm.phone}
                      onChange={(e) => handleRegisterFormChange('phone', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalEvents.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-events-form-group">
                    <label htmlFor="registerMessage">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalEvents.modals.register.messageLabel')}
                    </label>
                    <textarea
                      id="registerMessage"
                      value={registerForm.message}
                      onChange={(e) => handleRegisterFormChange('message', e.target.value)}
                      placeholder={t('clubs.CulturalEvents.modals.register.messagePlaceholder')}
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
                      {formStatus === 'sending' ? t('clubs.CulturalEvents.form.sending') : t('clubs.CulturalEvents.form.submitRequest')}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeEventModal}
                      className="cultural-events-cancel-btn"
                    >
                      {t('clubs.CulturalEvents.form.cancel')}
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