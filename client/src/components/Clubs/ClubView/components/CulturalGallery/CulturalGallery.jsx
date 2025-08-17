import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImages,
  faVideo,
  faCamera,
  faPlay,
  faDownload,
  faShare,
  faHeart,
  faEye,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faQuoteLeft,
  faStar,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faExpand,
  faMusic,
  faTheaterMasks,
  faPalette,
  faGift,
  faAward,
  faBirthdayCake,
  faTree,
  faEnvelope,
  faPhone,
  faUserCircle,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './culturalGallery.css';

export const CulturalGallery = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [formStatus, setFormStatus] = useState(null);
  
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    interests: [],
    experience: '',
    message: ''
  });

  const [photoForm, setPhotoForm] = useState({
    name: '',
    email: '',
    eventName: '',
    description: '',
    message: ''
  });

  const getAllMediaFromClub = () => {
    const mediaItems = [];
    
    const events = club?.activities?.events || [];
    events.forEach(event => {
      if (event.images && Array.isArray(event.images)) {
        event.images.forEach((image, index) => {
          mediaItems.push({
            id: `event-${event.id}-img-${index}`,
            type: 'image',
            src: image.src,
            thumbnail: image.src,
            title: image.caption || event.title,
            description: image.alt || event.description,
            date: event.date,
            location: event.location || t('clubs.CulturalGallery.defaultLocation'),
            category: event.type || 'events',
            eventTitle: event.title,
            views: Math.floor(Math.random() * 300) + 50,
            likes: Math.floor(Math.random() * 50) + 5
          });
        });
      }
      
      if (event.videos && Array.isArray(event.videos)) {
        event.videos.forEach((video, index) => {
          mediaItems.push({
            id: `event-${event.id}-vid-${index}`,
            type: 'video',
            src: video.src,
            thumbnail: video.thumbnail || `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
            title: video.caption || event.title,
            description: video.alt || event.description,
            date: event.date,
            location: event.location || t('clubs.CulturalGallery.defaultLocation'),
            category: event.type || 'events',
            eventTitle: event.title,
            duration: video.duration || '3:45',
            views: Math.floor(Math.random() * 200) + 30,
            likes: Math.floor(Math.random() * 40) + 8
          });
        });
      }
    });

    if (club?.gallery && Array.isArray(club.gallery)) {
      club.gallery.forEach((item, index) => {
        mediaItems.push({
          id: `gallery-${index}`,
          type: item.type || 'image',
          src: item.src || item.url,
          thumbnail: item.thumbnail || item.src || item.url,
          title: item.title || item.caption || t('clubs.CulturalGallery.defaultImageTitle'),
          description: item.description || item.alt || t('clubs.CulturalGallery.defaultImageDescription'),
          date: item.date || new Date().toISOString(),
          location: item.location || t('clubs.CulturalGallery.defaultClubLocation'),
          category: item.category || 'gallery',
          duration: item.duration,
          views: item.views || Math.floor(Math.random() * 150) + 20,
          likes: item.likes || Math.floor(Math.random() * 30) + 3
        });
      });
    }

    const trips = club?.activities?.trips || [];
    trips.forEach(trip => {
      if (trip.images && Array.isArray(trip.images)) {
        trip.images.forEach((image, index) => {
          mediaItems.push({
            id: `trip-${trip.id}-img-${index}`,
            type: 'image',
            src: image.src,
            thumbnail: image.src,
            title: image.caption || t('clubs.CulturalGallery.tripTitle', { destination: trip.destination }),
            description: image.alt || trip.description,
            date: trip.date,
            location: trip.destination,
            category: 'trips',
            eventTitle: trip.destination,
            views: Math.floor(Math.random() * 250) + 40,
            likes: Math.floor(Math.random() * 45) + 10
          });
        });
      }
    });

    return mediaItems;
  };

  const galleryItems = getAllMediaFromClub();

  if (!galleryItems || galleryItems.length === 0) {
    return null;
  }

  const getDefaultTestimonials = () => [
    {
      id: 1,
      name: "Мария Стоянова",
      age: 68,
      avatar: "https://picsum.photos/100/100?random=201",
      text: t('clubs.CulturalGallery.testimonials.default.maria'),
      rating: 5,
      memberSince: "2020"
    },
    {
      id: 2,
      name: "Георги Петков", 
      age: 72,
      avatar: "https://picsum.photos/100/100?random=202",
      text: t('clubs.CulturalGallery.testimonials.default.georgi'),
      rating: 5,
      memberSince: "2018"
    },
    {
      id: 3,
      name: "Елена Николова",
      age: 65,
      avatar: "https://picsum.photos/100/100?random=203",
      text: t('clubs.CulturalGallery.testimonials.default.elena'),
      rating: 5,
      memberSince: "2021"
    }
  ];

  const testimonials = club?.testimonials || getDefaultTestimonials();

  const getAllCategories = () => {
    const categories = {
      all: { label: t('clubs.CulturalGallery.categories.all'), icon: faImages, count: galleryItems.length }
    };

    const uniqueCategories = [...new Set(galleryItems.map(item => item.category))];
    
    uniqueCategories.forEach(cat => {
      const count = galleryItems.filter(item => item.category === cat).length;
      
      switch(cat) {
        case 'cultural':
        case 'concerts':
          categories.concerts = { label: t('clubs.CulturalGallery.categories.concerts'), icon: faMusic, count };
          break;
        case 'traditional':
        case 'events':
          categories.events = { label: t('clubs.CulturalGallery.categories.events'), icon: faBirthdayCake, count };
          break;
        case 'workshops':
          categories.workshops = { label: t('clubs.CulturalGallery.categories.workshops'), icon: faPalette, count };
          break;
        case 'trips':
          categories.trips = { label: t('clubs.CulturalGallery.categories.trips'), icon: faMapMarkerAlt, count };
          break;
        case 'gallery':
          categories.gallery = { label: t('clubs.CulturalGallery.categories.gallery'), icon: faCamera, count };
          break;
        default:
          categories.other = { label: t('clubs.CulturalGallery.categories.other'), icon: faImages, count };
      }
    });

    return categories;
  };

  const categories = getAllCategories();

  const getFilteredItems = () => {
    if (activeFilter === 'all') return galleryItems;
    return galleryItems.filter(item => {
      if (activeFilter === 'concerts') return ['cultural', 'concerts'].includes(item.category);
      if (activeFilter === 'events') return ['traditional', 'events'].includes(item.category);
      return item.category === activeFilter;
    });
  };

  const getInterestOptions = () => [
    t('clubs.CulturalGallery.interests.choir'),
    t('clubs.CulturalGallery.interests.dance'),
    t('clubs.CulturalGallery.interests.creative'),
    t('clubs.CulturalGallery.interests.trips'),
    t('clubs.CulturalGallery.interests.social'),
    t('clubs.CulturalGallery.interests.educational')
  ];

  const handleJoinClub = () => {
    setShowMemberModal(true);
  };

  const handleSendPhotos = () => {
    setShowPhotoModal(true);
  };

  const handleMemberFormChange = (field, value) => {
    setMemberForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoFormChange = (field, value) => {
    setPhotoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setMemberForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.CulturalGallery.modals.membership.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.CulturalGallery.modals.membership.emailBody', {
        clubName: club.name,
        name: memberForm.name,
        email: memberForm.email,
        phone: memberForm.phone,
        age: memberForm.age,
        interests: memberForm.interests.join(', '),
        experience: memberForm.experience,
        message: memberForm.message || t('clubs.CulturalGallery.form.noMessage'),
        senderEmail: memberForm.email
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          setShowMemberModal(false);
          setFormStatus(null);
          setMemberForm({
            name: '', email: '', phone: '', age: '', interests: [], experience: '', message: ''
          });
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handlePhotoSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.CulturalGallery.modals.photos.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.CulturalGallery.modals.photos.emailBody', {
        clubName: club.name,
        name: photoForm.name,
        email: photoForm.email,
        eventName: photoForm.eventName,
        description: photoForm.description,
        message: photoForm.message,
        senderEmail: photoForm.email,
        contactName: photoForm.name
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          setShowPhotoModal(false);
          setFormStatus(null);
          setPhotoForm({
            name: '', email: '', eventName: '', description: '', message: ''
          });
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setFormStatus(null);
    setMemberForm({
      name: '', email: '', phone: '', age: '', interests: [], experience: '', message: ''
    });
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setFormStatus(null);
    setPhotoForm({
      name: '', email: '', eventName: '', description: '', message: ''
    });
  };

  const handleLike = (itemId) => {
    alert(t('clubs.CulturalGallery.actions.likedMessage', { itemId }));
  };

  const handleShare = (item) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${item.title} - ${window.location.href}`);
      alert(t('clubs.CulturalGallery.actions.linkCopied'));
    }
  };

  const handleDownload = (item) => {
    const link = document.createElement('a');
    link.href = item.src;
    link.download = `${item.title}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openLightbox = (item, index) => {
    const filteredItems = getFilteredItems();
    const actualIndex = filteredItems.findIndex(i => i.id === item.id);
    setSelectedMedia(item);
    setCurrentSlide(actualIndex);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const nextSlide = () => {
    const filteredItems = getFilteredItems();
    const newIndex = (currentSlide + 1) % filteredItems.length;
    setCurrentSlide(newIndex);
    setSelectedMedia(filteredItems[newIndex]);
  };

  const prevSlide = () => {
    const filteredItems = getFilteredItems();
    const newIndex = (currentSlide - 1 + filteredItems.length) % filteredItems.length;
    setCurrentSlide(newIndex);
    setSelectedMedia(filteredItems[newIndex]);
  };

  const formatDate = (dateString) => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return new Date(dateString).toLocaleDateString(locale, { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatistics = () => {
    const imageCount = galleryItems.filter(item => item.type === 'image').length;
    const videoCount = galleryItems.filter(item => item.type === 'video').length;
    const totalViews = galleryItems.reduce((sum, item) => sum + (item.views || 0), 0);
    const eventCount = [...new Set(galleryItems.map(item => item.eventTitle || item.title))].length;

    return {
      images: imageCount,
      videos: videoCount,
      events: eventCount,
      views: totalViews
    };
  };

  const stats = getStatistics();

  return (
    <section id="cultural-gallery" className="cultural-gallery-main-section">
      <div className="cultural-gallery-container">
        
        <div className="cultural-gallery-header">
          <div className="cultural-gallery-badge">
            <FontAwesomeIcon icon={faImages} />
            <span>{t('clubs.CulturalGallery.header.badge')}</span>
          </div>
          <h2 className="cultural-gallery-title">{t('clubs.CulturalGallery.header.title')}</h2>
          <p className="cultural-gallery-subtitle">
            {t('clubs.CulturalGallery.header.subtitle')}
          </p>
        </div>

        <div className="cultural-gallery-filters">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              className={`cultural-gallery-filter ${activeFilter === key ? 'active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              <FontAwesomeIcon icon={category.icon} />
              <span>{category.label}</span>
              <span className="cultural-gallery-filter-count">({category.count})</span>
            </button>
          ))}
        </div>

        <div className="cultural-gallery-grid">
          {getFilteredItems().map((item, index) => (
            <div key={item.id} className="cultural-gallery-item">
              <div className="cultural-gallery-item-image" onClick={() => openLightbox(item, index)}>
                <img src={item.thumbnail} alt={item.title} />
                
                {item.type === 'video' && (
                  <div className="cultural-gallery-video-overlay">
                    <FontAwesomeIcon icon={faPlay} />
                    {item.duration && (
                      <span className="cultural-gallery-duration">{item.duration}</span>
                    )}
                  </div>
                )}
                
                <div className="cultural-gallery-item-overlay">
                  <button className="cultural-gallery-overlay-btn">
                    <FontAwesomeIcon icon={faExpand} />
                  </button>
                </div>
              </div>
              
              <div className="cultural-gallery-item-content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                
                <div className="cultural-gallery-item-meta">
                  <div className="cultural-gallery-meta-info">
                    <span className="cultural-gallery-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(item.date)}
                    </span>
                    <span className="cultural-gallery-location">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {item.location}
                    </span>
                  </div>
                  
                  <div className="cultural-gallery-stats">
                    <span className="cultural-gallery-stat">
                      <FontAwesomeIcon icon={faEye} />
                      {item.views}
                    </span>
                    <span className="cultural-gallery-stat">
                      <FontAwesomeIcon icon={faHeart} />
                      {item.likes}
                    </span>
                  </div>
                </div>
                
                <div className="cultural-gallery-item-actions">
                  <button 
                    className="cultural-gallery-action-btn like"
                    onClick={() => handleLike(item.id)}
                    title={t('clubs.CulturalGallery.actions.like')}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                  <button 
                    className="cultural-gallery-action-btn share"
                    onClick={() => handleShare(item)}
                    title={t('clubs.CulturalGallery.actions.share')}
                  >
                    <FontAwesomeIcon icon={faShare} />
                  </button>
                  <button 
                    className="cultural-gallery-action-btn download"
                    onClick={() => handleDownload(item)}
                    title={t('clubs.CulturalGallery.actions.download')}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cultural-gallery-stats-section">
          <div className="cultural-gallery-stats-grid">
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faImages} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">{stats.images}+</div>
                <div className="cultural-gallery-stat-label">{t('clubs.CulturalGallery.stats.images')}</div>
              </div>
            </div>
            
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faVideo} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">{stats.videos}</div>
                <div className="cultural-gallery-stat-label">{t('clubs.CulturalGallery.stats.videos')}</div>
              </div>
            </div>
            
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">{stats.events}</div>
                <div className="cultural-gallery-stat-label">{t('clubs.CulturalGallery.stats.events')}</div>
              </div>
            </div>
            
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faEye} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">{Math.floor(stats.views / 1000)}K+</div>
                <div className="cultural-gallery-stat-label">{t('clubs.CulturalGallery.stats.views')}</div>
              </div>
            </div>
          </div>
        </div>

        {testimonials && testimonials.length > 0 && (
          <div className="cultural-gallery-testimonials">
            <div className="cultural-gallery-testimonials-header">
              <h3>{t('clubs.CulturalGallery.testimonials.title')}</h3>
              <p>{t('clubs.CulturalGallery.testimonials.subtitle')}</p>
            </div>
            
            <div className="cultural-gallery-testimonials-grid">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="cultural-gallery-testimonial-card">
                  <div className="cultural-gallery-testimonial-quote">
                    <FontAwesomeIcon icon={faQuoteLeft} />
                  </div>
                  
                  <div className="cultural-gallery-testimonial-content">
                    <p>"{testimonial.text}"</p>
                    
                    <div className="cultural-gallery-testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={faStar} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="cultural-gallery-testimonial-author">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                    <div className="cultural-gallery-author-info">
                      <h4>{testimonial.name}</h4>
                      <p>{t('clubs.CulturalGallery.testimonials.memberInfo', { 
                        age: testimonial.age, 
                        memberSince: testimonial.memberSince 
                      })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cultural-gallery-cta">
          <div className="cultural-gallery-cta-content">
            <h3>{t('clubs.CulturalGallery.cta.title')}</h3>
            <p>{t('clubs.CulturalGallery.cta.subtitle')}</p>
            <div className="cultural-gallery-cta-buttons">
              <button className="cultural-gallery-cta-primary" onClick={handleJoinClub}>
                <FontAwesomeIcon icon={faUsers} />
                {t('clubs.CulturalGallery.cta.becomeMember')}
              </button>
              <button className="cultural-gallery-cta-secondary" onClick={handleSendPhotos}>
                <FontAwesomeIcon icon={faCamera} />
                {t('clubs.CulturalGallery.cta.sendPhotos')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedMedia && (
        <div className="cultural-gallery-lightbox" onClick={closeLightbox}>
          <div className="cultural-gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-gallery-lightbox-close" onClick={closeLightbox}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {getFilteredItems().length > 1 && (
              <>
                <button className="cultural-gallery-lightbox-nav prev" onClick={prevSlide}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                
                <button className="cultural-gallery-lightbox-nav next" onClick={nextSlide}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}
            
            <div className="cultural-gallery-lightbox-media">
              {selectedMedia.type === 'video' ? (
                <video controls autoPlay>
                  <source src={selectedMedia.src} type="video/mp4" />
                </video>
              ) : (
                <img src={selectedMedia.src} alt={selectedMedia.title} />
              )}
            </div>
            
            <div className="cultural-gallery-lightbox-info">
              <h3>{selectedMedia.title}</h3>
              <p>{selectedMedia.description}</p>
              <div className="cultural-gallery-lightbox-meta">
                <span>{formatDate(selectedMedia.date)}</span>
                <span>{selectedMedia.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="cultural-gallery-modal-overlay" onClick={closeMemberModal}>
          <div className="cultural-gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-gallery-modal-close" onClick={closeMemberModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-gallery-modal-content">
              <div className="cultural-gallery-modal-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>{t('clubs.CulturalGallery.modals.membership.title')}</h3>
                <p>{t('clubs.CulturalGallery.modals.membership.subtitle')}</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-gallery-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>{t('clubs.CulturalGallery.modals.membership.success.title')}</h4>
                  <p>{t('clubs.CulturalGallery.modals.membership.success.message')}</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-gallery-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>{t('clubs.CulturalGallery.form.error.title')}</h4>
                  <p>{t('clubs.CulturalGallery.form.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handleMemberSubmit} className="cultural-gallery-modal-form">
                  <div className="cultural-gallery-form-row">
                    <div className="cultural-gallery-form-group">
                      <label htmlFor="memberName">
                        <FontAwesomeIcon icon={faUserCircle} />
                        {t('clubs.CulturalGallery.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="memberName"
                        value={memberForm.name}
                        onChange={(e) => handleMemberFormChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalGallery.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="cultural-gallery-form-group">
                      <label htmlFor="memberAge">
                        <FontAwesomeIcon icon={faUsers} />
                        {t('clubs.CulturalGallery.form.age')} *
                      </label>
                      <input
                        type="number"
                        id="memberAge"
                        min="18"
                        max="120"
                        value={memberForm.age}
                        onChange={(e) => handleMemberFormChange('age', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalGallery.form.agePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="cultural-gallery-form-row">
                    <div className="cultural-gallery-form-group">
                      <label htmlFor="memberEmail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.CulturalGallery.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="memberEmail"
                        value={memberForm.email}
                        onChange={(e) => handleMemberFormChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalGallery.form.emailPlaceholder')}
                      />
                    </div>
                    
                    <div className="cultural-gallery-form-group">
                      <label htmlFor="memberPhone">
                        <FontAwesomeIcon icon={faPhone} />
                        {t('clubs.CulturalGallery.form.phone')} *
                      </label>
                      <input
                        type="tel"
                        id="memberPhone"
                        value={memberForm.phone}
                        onChange={(e) => handleMemberFormChange('phone', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalGallery.form.phonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="cultural-gallery-form-group">
                    <label>
                      <FontAwesomeIcon icon={faHeart} />
                      {t('clubs.CulturalGallery.modals.membership.interestsLabel')}
                    </label>
                    <div className="cultural-gallery-interests-grid">
                      {getInterestOptions().map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          className={`cultural-gallery-interest-btn ${memberForm.interests.includes(interest) ? 'selected' : ''}`}
                          onClick={() => handleInterestToggle(interest)}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cultural-gallery-form-group">
                    <label htmlFor="memberExperience">
                      <FontAwesomeIcon icon={faStar} />
                      {t('clubs.CulturalGallery.form.experience')}
                    </label>
                    <input
                      type="text"
                      id="memberExperience"
                      value={memberForm.experience}
                      onChange={(e) => handleMemberFormChange('experience', e.target.value)}
                      placeholder={t('clubs.CulturalGallery.form.experiencePlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-gallery-form-group">
                    <label htmlFor="memberMessage">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalGallery.form.message')}
                    </label>
                    <textarea
                      id="memberMessage"
                      value={memberForm.message}
                      onChange={(e) => handleMemberFormChange('message', e.target.value)}
                      placeholder={t('clubs.CulturalGallery.form.messagePlaceholder')}
                      rows="3"
                    />
                  </div>
                  
                  <div className="cultural-gallery-form-actions">
                    <button 
                      type="submit" 
                      className="cultural-gallery-submit-btn"
                      disabled={formStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faUsers} />
                      {formStatus === 'sending' ? t('clubs.CulturalGallery.form.sending') : t('clubs.CulturalGallery.form.submitRequest')}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeMemberModal}
                      className="cultural-gallery-cancel-btn"
                    >
                      {t('clubs.CulturalGallery.form.cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div className="cultural-gallery-modal-overlay" onClick={closePhotoModal}>
          <div className="cultural-gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-gallery-modal-close" onClick={closePhotoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-gallery-modal-content">
              <div className="cultural-gallery-modal-header">
                <FontAwesomeIcon icon={faCamera} />
                <h3>{t('clubs.CulturalGallery.modals.photos.title')}</h3>
                <p>{t('clubs.CulturalGallery.modals.photos.subtitle')}</p>
              </div>
              
              {formStatus === 'sent' ? (
                <div className="cultural-gallery-form-success">
                  <FontAwesomeIcon icon={faCheck} />
                  <h4>{t('clubs.CulturalGallery.modals.photos.success.title')}</h4>
                  <p>{t('clubs.CulturalGallery.modals.photos.success.message')}</p>
                </div>
              ) : formStatus === 'error' ? (
                <div className="cultural-gallery-form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>{t('clubs.CulturalGallery.form.error.title')}</h4>
                  <p>{t('clubs.CulturalGallery.form.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handlePhotoSubmit} className="cultural-gallery-modal-form">
                  <div className="cultural-gallery-form-row">
                    <div className="cultural-gallery-form-group">
                      <label htmlFor="photoName">
                        <FontAwesomeIcon icon={faUserCircle} />
                        {t('clubs.CulturalGallery.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="photoName"
                        value={photoForm.name}
                        onChange={(e) => handlePhotoFormChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalGallery.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="cultural-gallery-form-group">
                      <label htmlFor="photoEmail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.CulturalGallery.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="photoEmail"
                        value={photoForm.email}
                        onChange={(e) => handlePhotoFormChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.CulturalGallery.form.emailPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="cultural-gallery-form-group">
                    <label htmlFor="photoEvent">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {t('clubs.CulturalGallery.modals.photos.eventLabel')} *
                    </label>
                    <input
                      type="text"
                      id="photoEvent"
                      value={photoForm.eventName}
                      onChange={(e) => handlePhotoFormChange('eventName', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalGallery.modals.photos.eventPlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-gallery-form-group">
                    <label htmlFor="photoDescription">
                      <FontAwesomeIcon icon={faImages} />
                      {t('clubs.CulturalGallery.modals.photos.descriptionLabel')} *
                    </label>
                    <input
                      type="text"
                      id="photoDescription"
                      value={photoForm.description}
                      onChange={(e) => handlePhotoFormChange('description', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalGallery.modals.photos.descriptionPlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-gallery-form-group">
                    <label htmlFor="photoMessage">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalGallery.form.message')}
                    </label>
                    <textarea
                      id="photoMessage"
                      value={photoForm.message}
                      onChange={(e) => handlePhotoFormChange('message', e.target.value)}
                      placeholder={t('clubs.CulturalGallery.modals.photos.messagePlaceholder')}
                      rows="3"
                    />
                  </div>
                  
                  <div className="cultural-gallery-form-actions">
                    <button 
                      type="submit" 
                      className="cultural-gallery-submit-btn"
                      disabled={formStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faCamera} />
                      {formStatus === 'sending' ? t('clubs.CulturalGallery.form.sending') : t('clubs.CulturalGallery.form.sendMessage')}
                    </button>
                    <button 
                      type="button" 
                      onClick={closePhotoModal}
                      className="cultural-gallery-cancel-btn"
                    >
                      {t('clubs.CulturalGallery.form.cancel')}
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

export default CulturalGallery;