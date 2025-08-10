import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope,
  faPhone,
  faGlobe,
  faClock,
  faMapMarkerAlt,
  faPaperPlane,
  faUser,
  faTag,
  faComments,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, 
  faInstagram, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import './clubContact.css';

export const ClubContact = ({ club }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'membership',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: '', message: '' });

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: 'error',
        message: 'Моля попълнете всички задължителни полета'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormStatus({
        type: 'success',
        message: 'Съобщението е изпратено! Ще ви отговорим скоро.'
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'membership',
        message: ''
      });
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: 'Възникна грешка. Опитайте отново.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'facebook': return faFacebook;
      case 'instagram': return faInstagram;
      case 'youtube': return faYoutube;
      default: return faGlobe;
    }
  };

  const getSocialUrl = (platform, handle) => {
    if (handle.startsWith('http')) return handle;
    
    switch (platform) {
      case 'facebook': return `https://${handle}`;
      case 'instagram': return `https://instagram.com/${handle}`;
      case 'youtube': return `https://youtube.com/${handle}`;
      default: return `https://${handle}`;
    }
  };

  const getTodayHours = () => {
    const today = new Date().getDay();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
    return club.contacts.workingHours[dayIndex] || 'closed';
  };

  return (
    <section id="club-contact" className="club-contact">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Свържете се с нас</h2>
          <p>Готови сме да отговорим на всички ваши въпроси</p>
        </div>

        <div className="contact-layout">
          {/* Лява страна - Quick info */}
          <div className="quick-info">
            
            {/* Instant Contact */}
            <div className="instant-contact">
              <h3>Бърз контакт</h3>
              <div className="contact-buttons">
                <a href={`tel:${club.contacts.phone}`} className="contact-btn phone-btn">
                  <FontAwesomeIcon icon={faPhone} />
                  <div>
                    <span className="btn-label">Обадете се</span>
                    <span className="btn-value">{club.contacts.phone}</span>
                  </div>
                </a>
                
                <a href={`mailto:${club.contacts.email}`} className="contact-btn email-btn">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <div>
                    <span className="btn-label">Имейл</span>
                    <span className="btn-value">{club.contacts.email}</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Today's Hours */}
            <div className="today-hours">
              <div className="hours-header">
                <FontAwesomeIcon icon={faClock} />
                <span>Днес сме</span>
              </div>
              <div className="hours-status">
                {getTodayHours() === 'closed' ? (
                  <span className="closed">Затворени</span>
                ) : (
                  <span className="open">Отворени до {getTodayHours().split('-')[1]}</span>
                )}
              </div>
            </div>

            {/* Location Quick */}
            <div className="location-quick">
              <div className="location-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>Намерете ни</span>
              </div>
              <div className="location-text">
                {club.location.address}, {club.location.city}
              </div>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${club.location.address}, ${club.location.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-btn"
              >
                Покажи на картата
              </a>
            </div>

            {/* Social Links */}
            {club.contacts.socialMedia && Object.keys(club.contacts.socialMedia).length > 0 && (
              <div className="social-section">
                <h4>Последвайте ни</h4>
                <div className="social-buttons">
                  {Object.entries(club.contacts.socialMedia).map(([platform, handle]) => (
                    
                     <a key={platform}
                      href={getSocialUrl(platform, handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-btn ${platform}`}
                    >
                      <FontAwesomeIcon icon={getSocialIcon(platform)} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Working Hours Compact */}
            <div className="hours-compact">
              <h4>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Работно време
              </h4>
              <div className="hours-grid">
                {Object.entries(club.contacts.workingHours).map(([day, hours]) => {
                  const dayNames = {
                    monday: 'Пн',
                    tuesday: 'Вт',
                    wednesday: 'Ср',
                    thursday: 'Чт',
                    friday: 'Пт',
                    saturday: 'Сб',
                    sunday: 'Нд'
                  };
                  
                  const today = new Date().getDay();
                  const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
                  const isToday = day === dayIndex;
                  
                  return (
                    <div key={day} className={`hours-item ${isToday ? 'today' : ''}`}>
                      <span className="day">{dayNames[day]}</span>
                      <span className={`hours ${hours === 'closed' ? 'closed' : ''}`}>
                        {hours === 'closed' ? 'Затв.' : hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Дясна страна - Contact Form */}
          <div className="contact-form-section">
            <div className="form-wrapper">
              <div className="form-header">
                <h3>Изпратете съобщение</h3>
                <p>Ще ви отговорим в рамките на 24 часа</p>
              </div>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-grid">
                  <div className="form-field">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Вашето име *"
                      required
                    />
                    <FontAwesomeIcon icon={faUser} className="field-icon" />
                  </div>
                  
                  <div className="form-field">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Имейл адрес *"
                      required
                    />
                    <FontAwesomeIcon icon={faEnvelope} className="field-icon" />
                  </div>

                  <div className="form-field">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Телефон (опционално)"
                    />
                    <FontAwesomeIcon icon={faPhone} className="field-icon" />
                  </div>
                  
                  <div className="form-field">
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                    >
                      <option value="membership">Членство в клуба</option>
                      <option value="activities">Дейности и програми</option>
                      <option value="events">Събития</option>
                      <option value="volunteer">Доброволчество</option>
                      <option value="general">Общи въпроси</option>
                      <option value="complaint">Жалба/предложение</option>
                    </select>
                    <FontAwesomeIcon icon={faTag} className="field-icon" />
                  </div>
                </div>

                <div className="form-field full-width">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Вашето съобщение *"
                    rows="4"
                    required
                  ></textarea>
                  <FontAwesomeIcon icon={faComments} className="field-icon" />
                </div>

                {formStatus.message && (
                  <div className={`form-alert ${formStatus.type}`}>
                    <FontAwesomeIcon 
                      icon={formStatus.type === 'success' ? faCheckCircle : faExclamationTriangle} 
                    />
                    <span>{formStatus.message}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="spinning" />
                      Изпращане...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Изпрати съобщение
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubContact;