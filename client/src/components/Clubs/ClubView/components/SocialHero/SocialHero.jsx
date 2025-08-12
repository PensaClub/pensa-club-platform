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
  faHeart,
  faHandHoldingHeart,
  faHandsHelping,
  faGlobe,
  faClock,
  faTag,
  faTimes,
  faUser,
  faCheck,
  faExclamationTriangle,
  faUserFriends,
  faIdCard,
  faAddressCard,
  faCopy,
  faCheckCircle,
  faAward,
   faSearch,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './socialHero.css';

export const SocialHero = ({ club }) => {
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
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
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
      color: '#16a34a'
    });
  }
  if (club.foundedYear) {
    availableStats.push({
      icon: faCalendarAlt,
      label: 'Основан',
      value: club.foundedYear,
      color: '#0891b2'
    });
  }
  if (club.stats?.projectsBeneficiaries) {
    availableStats.push({
      icon: faHandHoldingHeart,
      label: 'Помогнати',
      value: `${club.stats.projectsBeneficiaries}+`,
      color: '#dc2626'
    });
  }
  if (club.stats?.donationsDistributed) {
    availableStats.push({
      icon: faHeart,
      label: 'Раздадени лв.',
      value: `${club.stats.donationsDistributed}+`,
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
    const aboutSection = document.getElementById('social-about');
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
    switch (type) {
      case 'phone':
        if (club.contacts?.phone || club.contacts?.mobile) {
          window.open(`tel:${club.contacts.phone || club.contacts.mobile}`);
        }
        break;
      case 'email':
        openEmailModal();
        break;
      case 'visit':
        const locationSection = document.getElementById('social-location');
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
  const members = club.members || [];

  // Функция за филтриране на членовете:
const filteredMembers = members.filter(member => {
  const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
  const searchLower = memberSearchTerm.toLowerCase();
  return fullName.includes(searchLower) || 
         member.phone?.includes(searchLower) ||
         member.email?.toLowerCase().includes(searchLower);
});

// Функция за изчистване на търсенето:
const clearSearch = () => {
  setMemberSearchTerm('');
};

// Функция за затваряне на модала (reset search):
const closeMembersModal = () => {
  setShowMembersModal(false);
  setMemberSearchTerm('');
};

  const copyMemberData = async (data, type, memberName) => {
    try {
      await navigator.clipboard.writeText(data);
      setCopiedItems(prev => ({
        ...prev,
        [`${memberName}-${type}`]: true
      }));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newState = { ...prev };
          delete newState[`${memberName}-${type}`];
          return newState;
        });
      }, 2000);
    } catch (error) {
      console.error('Грешка при копиране:', error);
    }
  };

  return (
    <section id="social-hero" className="social-hero-main-section">
      {/* Background Slideshow */}
      <div className="social-hero-background">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`social-hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="social-hero-overlay" />
      </div>

      <div className="social-hero-container">
        {/* Main Content */}
        <div className="social-hero-content">
          <div className="social-hero-badge">
            <FontAwesomeIcon icon={faHandsHelping} />
            <span>Социален клуб за пенсионери</span>
          </div>

          <h1 className="social-hero-title">
            {club.name}
          </h1>

          {club.shortDescription && (
            <p className="social-hero-subtitle">
              {club.shortDescription}
            </p>
          )}

          {club.fullDescription && (
            <p className="social-hero-description">
              {club.fullDescription}
            </p>
          )}

          {/* Action Buttons - показваме само ако има действия */}
          {(firstVideo || club.location || club.contacts) && (
            <div className="social-hero-actions">
              {firstVideo && (
                <button
                  className="social-hero-btn primary"
                  onClick={handleVideoPlay}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Гледайте видео
                </button>
              )}
              <button
                className="social-hero-btn secondary"
                onClick={() => handleContactAction('visit')}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Посетете ни
              </button>
            </div>
          )}

          {/* Quick Contact - показваме само ако има контакти */}
          {hasContacts && (
            <div className="social-hero-quick-contact">
              {(club.contacts?.phone || club.contacts?.mobile) && (
                <button
                  className="social-hero-contact-btn"
                  onClick={() => handleContactAction('phone')}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{club.contacts.phone || club.contacts.mobile}</span>
                </button>
              )}
              {club.contacts?.email && (
                <button
                  className="social-hero-contact-btn"
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
          <div className="social-hero-stats">
            {availableStats.map((stat, index) => (
              <div key={index} className="social-hero-stat-card">
                <div
                  className="social-hero-stat-icon"
                  style={{ backgroundColor: stat.color }}
                >
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="social-hero-stat-content">
                  <div className="social-hero-stat-value">{stat.value}</div>
                  <div className="social-hero-stat-label">{stat.label}</div>
                </div>

              </div>
            ))}
            {members.length > 0 && (
              <button
                className="social-hero-btn secondary"
                onClick={() => setShowMembersModal(true)}
              >
                <FontAwesomeIcon icon={faUserFriends} />
                Нашите членове ({members.length})
              </button>
            )}
          </div>

        )}

      </div>

      {/* Scroll Indicator */}
      <div className="social-hero-scroll-indicator">
        <button onClick={handleScrollToContent}>
          <FontAwesomeIcon icon={faChevronDown} />
          <span>Научете повече</span>
        </button>
      </div>

      {/* Video Modal - показваме само ако има видео */}
      {isVideoModalOpen && firstVideo && (
        <div className="social-hero-video-modal" onClick={closeVideoModal}>
          <div className="social-hero-video-container" onClick={(e) => e.stopPropagation()}>
            <button className="social-hero-video-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* РЕАЛЕН VIDEO PLAYER */}
            <div className="social-hero-video-player">
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
            <div className="social-hero-video-info-section">
              <h3>{firstVideo.caption || 'Видео от клуба'}</h3>
              {firstVideo.alt && <p>{firstVideo.alt}</p>}
              <div className="social-hero-video-details">
                {firstVideo.duration && (
                  <span className="social-hero-video-duration">
                    <FontAwesomeIcon icon={faClock} />
                    Продължителност: {firstVideo.duration}
                  </span>
                )}
                {firstVideo.type && (
                  <span className="social-hero-video-type">
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
        <div className="social-hero-email-modal">
          <div className="social-hero-email-modal-overlay" onClick={closeEmailModal}></div>
          <div className="social-hero-email-modal-container">
            <button className="social-hero-email-modal-close" onClick={closeEmailModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="social-hero-email-header">
              <FontAwesomeIcon icon={faEnvelope} />
              <h3>Свържете се с нас</h3>
              <p>Изпратете ни съобщение и ще ви отговорим възможно най-скоро</p>
            </div>

            {formStatus === 'sent' ? (
              <div className="social-hero-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Съобщението е изпратено!</h4>
                <p>Благодарим ви! Ще се свържем с вас скоро.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="social-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="social-hero-email-form">
                <div className="social-hero-form-row">
                  <div className="social-hero-form-group">
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

                  <div className="social-hero-form-group">
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

                <div className="social-hero-form-group">
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

                <div className="social-hero-form-group">
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

                <div className="social-hero-form-actions">
                  <button
                    type="submit"
                    className="social-hero-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщение'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEmailModal}
                    className="social-hero-cancel-btn"
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
        <div className="social-hero-slide-indicators">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`social-hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    {/* Members Modal */}
{showMembersModal && (
  <div className="social-hero-email-modal">
    <div className="social-hero-email-modal-overlay" onClick={closeMembersModal}></div>
    <div className="social-hero-email-modal-container social-hero-members-modal">
      <button 
        className="social-hero-email-modal-close" 
        onClick={closeMembersModal}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      
      <div className="social-hero-email-header">
        <FontAwesomeIcon icon={faUserFriends} />
        <h3>Членове на клуба</h3>
        <p>Нашата дружна общност от {members.length} {members.length === 1 ? 'член' : 'членове'}</p>
      </div>

      {/* Search Section */}
      <div className="social-hero-members-search">
        <div className="social-hero-search-container">
          <div className="social-hero-search-input-wrapper">
            <FontAwesomeIcon icon={faSearch} className="social-hero-search-icon" />
            <input
              type="text"
              placeholder="Търсене по име, телефон или имейл..."
              value={memberSearchTerm}
              onChange={(e) => setMemberSearchTerm(e.target.value)}
              className="social-hero-search-input"
            />
            {memberSearchTerm && (
              <button 
                onClick={clearSearch}
                className="social-hero-search-clear"
                title="Изчисти търсенето"
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            )}
          </div>
          
          {memberSearchTerm && (
            <div className="social-hero-search-results">
              {filteredMembers.length === 0 ? (
                <span className="social-hero-no-results">
                  Няма намерени резултати за "{memberSearchTerm}"
                </span>
              ) : (
                <span className="social-hero-results-count">
                  {filteredMembers.length === 1 
                    ? `Намерен 1 член` 
                    : `Намерени ${filteredMembers.length} членове`
                  }
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="social-hero-members-container">
        {filteredMembers.length === 0 && !memberSearchTerm ? (
          <div className="social-hero-no-members">
            <FontAwesomeIcon icon={faUsers} />
            <h4>Няма регистрирани членове</h4>
            <p>Все още няма добавени членове в системата.</p>
          </div>
        ) : filteredMembers.length === 0 && memberSearchTerm ? (
          <div className="social-hero-no-members">
            <FontAwesomeIcon icon={faSearch} />
            <h4>Няма намерени резултати</h4>
            <p>Опитайте с различни ключови думи или изчистете търсенето.</p>
            <button onClick={clearSearch} className="social-hero-clear-search-btn">
              <FontAwesomeIcon icon={faTimesCircle} />
              Изчисти търсенето
            </button>
          </div>
        ) : (
          <div className="social-hero-members-grid">
            {filteredMembers.map((member) => (
              <div key={member.id} className="social-hero-member-card">
                <div className="social-hero-member-photo">
                  {member.photo ? (
                    <img 
                      src={member.photo.src} 
                      alt={member.photo.alt}
                      className="social-hero-member-image"
                    />
                  ) : (
                    <div className="social-hero-member-placeholder">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  )}
                  {member.role && member.role !== 'член' && (
                    <div className="social-hero-member-role">
                      <FontAwesomeIcon icon={faAward} />
                      <span>{member.role}</span>
                    </div>
                  )}
                </div>
                
                <div className="social-hero-member-info">
                  <div className="social-hero-member-name">
                    <h4>
                      {/* Highlight search term in name */}
                      {memberSearchTerm ? (
                        <span dangerouslySetInnerHTML={{
                          __html: `${member.firstName} ${member.lastName}`.replace(
                            new RegExp(`(${memberSearchTerm})`, 'gi'),
                            '<mark>$1</mark>'
                          )
                        }} />
                      ) : (
                        `${member.firstName} ${member.lastName}`
                      )}
                    </h4>
                    <button
                      className={`social-hero-copy-icon ${copiedItems[`${member.id}-name`] ? 'copied' : ''}`}
                      onClick={() => copyMemberData(`${member.firstName} ${member.lastName}`, 'name', member.id)}
                      title="Копирай името"
                    >
                      <FontAwesomeIcon icon={copiedItems[`${member.id}-name`] ? faCheckCircle : faCopy} />
                    </button>
                  </div>
                  
                  <div className="social-hero-member-details">
                    {member.phone && (
                      <div className="social-hero-member-detail">
                        <FontAwesomeIcon icon={faPhone} />
                        <span>
                          {memberSearchTerm ? (
                            <span dangerouslySetInnerHTML={{
                              __html: member.phone.replace(
                                new RegExp(`(${memberSearchTerm})`, 'gi'),
                                '<mark>$1</mark>'
                              )
                            }} />
                          ) : (
                            member.phone
                          )}
                        </span>
                        <button
                          className={`social-hero-copy-icon ${copiedItems[`${member.id}-phone`] ? 'copied' : ''}`}
                          onClick={() => copyMemberData(member.phone, 'phone', member.id)}
                          title="Копирай телефона"
                        >
                          <FontAwesomeIcon icon={copiedItems[`${member.id}-phone`] ? faCheckCircle : faCopy} />
                        </button>
                      </div>
                    )}
                    
                    {member.email && (
                      <div className="social-hero-member-detail">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>
                          {memberSearchTerm ? (
                            <span dangerouslySetInnerHTML={{
                              __html: member.email.replace(
                                new RegExp(`(${memberSearchTerm})`, 'gi'),
                                '<mark>$1</mark>'
                              )
                            }} />
                          ) : (
                            member.email
                          )}
                        </span>
                        <button
                          className={`social-hero-copy-icon ${copiedItems[`${member.id}-email`] ? 'copied' : ''}`}
                          onClick={() => copyMemberData(member.email, 'email', member.id)}
                          title="Копирай имейла"
                        >
                          <FontAwesomeIcon icon={copiedItems[`${member.id}-email`] ? faCheckCircle : faCopy} />
                        </button>
                      </div>
                    )}
                    
                    {member.address && (
                      <div className="social-hero-member-detail">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{member.address}</span>
                        <button
                          className={`social-hero-copy-icon ${copiedItems[`${member.id}-address`] ? 'copied' : ''}`}
                          onClick={() => copyMemberData(member.address, 'address', member.id)}
                          title="Копирай адреса"
                        >
                          <FontAwesomeIcon icon={copiedItems[`${member.id}-address`] ? faCheckCircle : faCopy} />
                        </button>
                      </div>
                    )}
                    
                    {member.joinDate && (
                      <div className="social-hero-member-detail">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Член от {new Date(member.joinDate).toLocaleDateString('bg-BG')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </section>
  );
};

export default SocialHero;