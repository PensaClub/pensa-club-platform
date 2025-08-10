import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay,
  faUsers,
  faCalendarAlt,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faChevronDown,
  faMusic,
  faTheaterMasks,
  faDrum,
  faHeart,
  faAward,
  faCrown,
  faGem,
  faTree,
  faLeaf,
  faStar,
  faClock,
  faTag,
  faTimes,
  faUser,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './traditionalHero.css';

export const TraditionalHero = ({ club }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null); // 'sending', 'sent', 'error'

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Строим hero данни от основните клуб данни
  const heroImages = [];
  
  // Добавяме main image ако има
  if (club.mainImage) {
    heroImages.push(club.mainImage);
  }
  
  // Добавяме gallery images ако има
  if (club.gallery && club.gallery.length > 0) {
    heroImages.push(...club.gallery);
  }
  
  // Ако няма никакви изображения, използваме placeholder
  if (heroImages.length === 0) {
    heroImages.push('https://picsum.photos/1920/1080?random=501');
  }

  // Статистики от club.stats - САМО реални данни
  const availableStats = [];
  if (club.stats?.totalMembers) {
    availableStats.push({
      icon: faUsers,
      label: 'Членове',
      value: `${club.stats.totalMembers}+`,
      color: '#dc2626'
    });
  }
  if (club.foundedYear) {
    availableStats.push({
      icon: faCalendarAlt,
      label: 'Основан',
      value: club.foundedYear,
      color: '#d97706'
    });
  }
  if (club.stats?.performances) {
    availableStats.push({
      icon: faTheaterMasks,
      label: 'Изпълнения',
      value: `${club.stats.performances}+`,
      color: '#059669'
    });
  }
  if (club.stats?.yearsActive) {
    availableStats.push({
      icon: faAward,
      label: 'Години опит',
      value: club.stats.yearsActive,
      color: '#7c3aed'
    });
  }

  // Първото видео от media ако има
  const firstVideo = club.media?.videos && club.media.videos.length > 0 ? club.media.videos[0] : null;

  // Проверяваме дали има контактна информация
  const hasContacts = club.contacts?.phone || club.contacts?.mobile || club.contacts?.email;

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const handleScrollToContent = () => {
    const aboutSection = document.getElementById('traditional-about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Scroll down by viewport height if no about section
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleVideoPlay = () => {
    if (firstVideo) {
      setIsVideoModalOpen(true);
    }
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  // Email modal handlers
  const openEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailForm({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setEmailForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(`Запитване до ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте ново съобщение от сайта на ${club.name}:

Име: ${emailForm.name}
Имейл: ${emailForm.email}
Телефон: ${emailForm.phone || 'Не е посочен'}

Съобщение:
${emailForm.message}

---
Изпратено от ${emailForm.email}
      `);
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeEmailModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleContactAction = (type) => {
    switch(type) {
      case 'phone':
        if (club.contacts?.phone || club.contacts?.mobile) {
          window.open(`tel:${club.contacts.phone || club.contacts.mobile}`);
        }
        break;
      case 'email':
        openEmailModal();
        break;
      case 'visit':
        const locationSection = document.getElementById('traditional-location');
        if (locationSection) {
          locationSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert('Информация за локацията може да бъде намерена в контактните данни.');
        }
        break;
      default:
        break;
    }
  };

  return (
    <section className="traditional-hero-main-section">
      {/* Background Slideshow */}
      <div className="traditional-hero-background">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`traditional-hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="traditional-hero-overlay" />
      </div>

      <div className="traditional-hero-container">
        {/* Main Content */}
        <div className="traditional-hero-content">
          <div className="traditional-hero-badge">
            <FontAwesomeIcon icon={faCrown} />
            <span>Традиционен български клуб</span>
          </div>

          <h1 className="traditional-hero-title">
            {club.name}
          </h1>

          {club.shortDescription && (
            <p className="traditional-hero-subtitle">
              {club.shortDescription}
            </p>
          )}

          {club.fullDescription && (
            <p className="traditional-hero-description">
              {club.fullDescription}
            </p>
          )}

          {/* Action Buttons - показваме само ако има действия */}
          {(firstVideo || club.location || club.contacts) && (
            <div className="traditional-hero-actions">
              {firstVideo && (
                <button 
                  className="traditional-hero-btn primary"
                  onClick={handleVideoPlay}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Гледайте видео
                </button>
              )}
              <button 
                className="traditional-hero-btn secondary"
                onClick={() => handleContactAction('visit')}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Посетете ни
              </button>
            </div>
          )}

          {/* Quick Contact - показваме само ако има контакти */}
          {hasContacts && (
            <div className="traditional-hero-quick-contact">
              {(club.contacts?.phone || club.contacts?.mobile) && (
                <button 
                  className="traditional-hero-contact-btn"
                  onClick={() => handleContactAction('phone')}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{club.contacts.phone || club.contacts.mobile}</span>
                </button>
              )}
              {club.contacts?.email && (
                <button 
                  className="traditional-hero-contact-btn"
                  onClick={() => handleContactAction('email')}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>Пишете ни</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards - показваме само ако има статистики */}
        {availableStats.length > 0 && (
          <div className="traditional-hero-stats">
            {availableStats.map((stat, index) => (
              <div key={index} className="traditional-hero-stat-card">
                <div 
                  className="traditional-hero-stat-icon"
                  style={{ backgroundColor: stat.color }}
                >
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="traditional-hero-stat-content">
                  <div className="traditional-hero-stat-value">{stat.value}</div>
                  <div className="traditional-hero-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="traditional-hero-scroll-indicator">
        <button onClick={handleScrollToContent}>
          <FontAwesomeIcon icon={faChevronDown} />
          <span>Научете повече</span>
        </button>
      </div>

      {/* Video Modal - показваме само ако има видео */}
      {isVideoModalOpen && firstVideo && (
        <div className="traditional-hero-video-modal" onClick={closeVideoModal}>
          <div className="traditional-hero-video-container" onClick={(e) => e.stopPropagation()}>
            <button className="traditional-hero-video-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {/* РЕАЛЕН VIDEO PLAYER */}
            <div className="traditional-hero-video-player">
              <video 
                controls 
                autoPlay
                width="100%"
                height="400"
                poster={firstVideo.thumbnail}
              >
                <source src={firstVideo.src} type="video/mp4" />
                Вашият браузър не поддържа video елемента.
              </video>
            </div>
            
            {/* Информация за видеото */}
            <div className="traditional-hero-video-info-section">
              <h3>{firstVideo.caption || 'Видео от клуба'}</h3>
              {firstVideo.alt && <p>{firstVideo.alt}</p>}
              <div className="traditional-hero-video-details">
                {firstVideo.duration && (
                  <span className="traditional-hero-video-duration">
                    <FontAwesomeIcon icon={faClock} />
                    Продължителност: {firstVideo.duration}
                  </span>
                )}
                {firstVideo.type && (
                  <span className="traditional-hero-video-type">
                    <FontAwesomeIcon icon={faTag} />
                    Тип: {firstVideo.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {isEmailModalOpen && (
        <div className="traditional-hero-email-modal">
          <div className="traditional-hero-email-modal-overlay" onClick={closeEmailModal}></div>
          <div className="traditional-hero-email-modal-container">
            <button className="traditional-hero-email-modal-close" onClick={closeEmailModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-hero-email-header">
              <FontAwesomeIcon icon={faEnvelope} />
              <h3>Свържете се с нас</h3>
              <p>Изпратете ни съобщение и ще ви отговорим възможно най-скоро</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="traditional-hero-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Съобщението е изпратено!</h4>
                <p>Благодарим ви! Ще се свържем с вас скоро.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="traditional-hero-email-form">
                <div className="traditional-hero-form-row">
                  <div className="traditional-hero-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={emailForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="traditional-hero-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={emailForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="traditional-hero-form-group">
                  <label htmlFor="phone">
                    <FontAwesomeIcon icon={faPhone} />
                    Телефон (по желание)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={emailForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="Въведете вашия телефон"
                  />
                </div>
                
                <div className="traditional-hero-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Съобщение *
                  </label>
                  <textarea
                    id="message"
                    value={emailForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    required
                    placeholder="Какво бихте искали да ни споделите?"
                    rows="4"
                  />
                </div>
                
                <div className="traditional-hero-form-actions">
                  <button 
                    type="submit" 
                    className="traditional-hero-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщение'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeEmailModal}
                    className="traditional-hero-cancel-btn"
                  >
                    Отказ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Slide Indicators - показваме само ако има повече от 1 снимка */}
      {heroImages.length > 1 && (
        <div className="traditional-hero-slide-indicators">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`traditional-hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TraditionalHero;