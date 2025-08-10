import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faComments,
  faUser,
  faUserTie,
  faHeadset,
  faQuestionCircle,
  faClock,
  faCalendarAlt,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimes,
  faChevronDown,
  faChevronUp,
  faShare,
  faCopy,
  faExternalLinkAlt,
  faFax,
  faGlobe,
  faBuilding,
  faDirections,
  faPaperPlane,
  faHandsHelping,
  faHeart,
  faShieldAlt,
  faUsers,
  faLightbulb,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import './socialContacts.css';

export const SocialContacts = ({ club }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [contactStatus, setContactStatus] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  // Проверяваме дали има необходимите данни
  if (!club?.contacts && 
      !club?.location?.address && 
      !club?.socialMedia &&
      !club?.management?.board) {
    return null;
  }

  // Събираме contact данни
  const contacts = club.contacts || {};
  const location = club.location || {};
  const socialMedia = club.socialMedia || {};
  const management = club.management || {};
  const board = management.board || [];

  // Ако няма никакви контакти, не показваме компонента
  if (!contacts.phone && !contacts.email && !location.address && 
      Object.keys(socialMedia).length === 0) {
    return null;
  }

  // Contact types за формата
  const contactTypes = [
    { key: 'general', label: 'Общ въпрос', icon: faQuestionCircle },
    { key: 'membership', label: 'Членство', icon: faUsers },
    { key: 'services', label: 'Услуги', icon: faHandsHelping },
    { key: 'events', label: 'События', icon: faCalendarAlt },
    { key: 'support', label: 'Подкрепа', icon: faHeart },
    { key: 'other', label: 'Друго', icon: faComments }
  ];

  // FAQ данни (ако са налични)
  const faqData = club.faq || [
    {
      question: 'Как мога да стана член на клуба?',
      answer: 'Свържете се с нас по телефон или имейл за информация относно процедурата за членство.'
    },
    {
      question: 'Какви услуги предлагате?',
      answer: 'Предлагаме широк спектър от услуги за нашите членове. За повече информация разгледайте секцията "Наши услуги".'
    },
    {
      question: 'Какво е работното време?',
      answer: 'Работното ни време можете да видите в секцията с контакти или да се свържете с нас директно.'
    }
  ];

  // Social media links
  const socialLinks = [
    { key: 'facebook', icon: faFacebook, color: '#1877f2', url: socialMedia.facebook },
    { key: 'instagram', icon: faInstagram, color: '#e4405f', url: socialMedia.instagram },
    { key: 'youtube', icon: faYoutube, color: '#ff0000', url: socialMedia.youtube },
    { key: 'linkedin', icon: faLinkedin, color: '#0077b5', url: socialMedia.linkedin },
    { key: 'twitter', icon: faTwitter, color: '#1da1f2', url: socialMedia.twitter }
  ].filter(link => link.url);

  // Working hours
  const workingHours = contacts.workingHours || location.workingHours || [
    { day: 'Понеделник', hours: '9:00 - 17:00' },
    { day: 'Вторник', hours: '9:00 - 17:00' },
    { day: 'Сряда', hours: '9:00 - 17:00' },
    { day: 'Четвъртък', hours: '9:00 - 17:00' },
    { day: 'Петък', hours: '9:00 - 17:00' }
  ];

  // Helper функции
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Неуспешно копиране:', err);
    }
  };

  const handleContactChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('sending');

    if (contacts.email) {
      const subject = encodeURIComponent(`${contactForm.subject} - ${contactTypes.find(t => t.key === contactForm.type)?.label}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте ново съобщение от сайта:

Име: ${contactForm.name}
Имейл: ${contactForm.email}
Телефон: ${contactForm.phone}
Тип запитване: ${contactTypes.find(t => t.key === contactForm.type)?.label}

Тема: ${contactForm.subject}

Съобщение:
${contactForm.message}

---
Изпратено от сайта на ${club.name}
      `);
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setContactStatus('sent');
        setTimeout(() => {
          setShowContactForm(false);
          setContactStatus(null);
          setContactForm({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            type: 'general'
          });
        }, 2000);
      } catch (error) {
        setContactStatus('error');
      }
    } else {
      setContactStatus('error');
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <section id="social-contacts" className="social-contacts-section">
      <div className="social-contacts-container">
        
        {/* Header */}
        <div className="social-contacts-header">
          <div className="social-contacts-header-content">
            <div className="social-contacts-badge">
              <FontAwesomeIcon icon={faHeadset} />
              <span>Свържете се с нас</span>
            </div>
            <h2 className="social-contacts-title">
              Тук сме, за да ви помогнем
            </h2>
            <p className="social-contacts-subtitle">
              Имате въпроси или нужда от помощ? Свържете се с нас по удобния за вас начин
            </p>
          </div>
          
          {/* Quick Contact */}
          <div className="social-contacts-quick">
            {contacts.phone && (
              <a href={`tel:${contacts.phone}`} className="social-contacts-quick-btn">
                <FontAwesomeIcon icon={faPhone} />
                <span>Обадете се</span>
              </a>
            )}
            <button 
              onClick={() => setShowContactForm(true)}
              className="social-contacts-quick-btn primary"
            >
              <FontAwesomeIcon icon={faComments} />
              <span>Пишете ни</span>
            </button>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="social-contacts-methods">
          
          {/* Primary Contacts */}
          <div className="social-contacts-primary">
            <h3 className="social-contacts-section-title">
              <FontAwesomeIcon icon={faPhone} />
              Основни контакти
            </h3>
            
            <div className="social-contacts-cards">
              {contacts.phone && (
                <div className="social-contacts-card">
                  <div className="social-contacts-card-icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div className="social-contacts-card-content">
                    <h4>Телефон</h4>
                    <div className="social-contacts-card-value">
                      <a href={`tel:${contacts.phone}`}>{contacts.phone}</a>
                      <button 
                        onClick={() => copyToClipboard(contacts.phone, 'телефон')}
                        className="social-contacts-copy-btn"
                        title="Копирай телефона"
                      >
                        <FontAwesomeIcon icon={copiedText === 'телефон' ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                    <p>Обадете се за бърза помощ</p>
                  </div>
                </div>
              )}

              {contacts.email && (
                <div className="social-contacts-card">
                  <div className="social-contacts-card-icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div className="social-contacts-card-content">
                    <h4>Имейл</h4>
                    <div className="social-contacts-card-value">
                      <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                      <button 
                        onClick={() => copyToClipboard(contacts.email, 'имейл')}
                        className="social-contacts-copy-btn"
                        title="Копирай имейла"
                      >
                        <FontAwesomeIcon icon={copiedText === 'имейл' ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                    <p>Пишете ни за детайлни въпроси</p>
                  </div>
                </div>
              )}

              {(location.address || contacts.address) && (
                <div className="social-contacts-card">
                  <div className="social-contacts-card-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="social-contacts-card-content">
                    <h4>Адрес</h4>
                    <div className="social-contacts-card-value">
                      <span>{location.address || contacts.address}</span>
                      <button 
                        onClick={() => copyToClipboard(location.address || contacts.address, 'адрес')}
                        className="social-contacts-copy-btn"
                        title="Копирай адреса"
                      >
                        <FontAwesomeIcon icon={copiedText === 'адрес' ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                    <p>Посетете ни на място</p>
                  </div>
                </div>
              )}
            </div>

            {copiedText && (
              <div className="social-contacts-copy-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Копирахте {copiedText}!</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="social-contacts-additional">
            
            {/* Working Hours */}
            {workingHours.length > 0 && (
              <div className="social-contacts-hours">
                <h4>
                  <FontAwesomeIcon icon={faClock} />
                  Работно време
                </h4>
                <div className="social-contacts-hours-list">
                  {workingHours.map((schedule, index) => (
                    <div key={index} className="social-contacts-hours-item">
                      <span className="social-contacts-day">{schedule.day}</span>
                      <span className="social-contacts-time">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Contacts */}
            {board.length > 0 && (
              <div className="social-contacts-team">
                <h4>
                  <FontAwesomeIcon icon={faUserTie} />
                  Ключови контакти
                </h4>
                <div className="social-contacts-team-list">
                  {board.slice(0, 3).map((member, index) => (
                    <div key={index} className="social-contacts-team-member">
                      <div className="social-contacts-member-info">
                        <h5>{member.name}</h5>
                        <span>{member.role}</span>
                      </div>
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="social-contacts-member-action">
                          <FontAwesomeIcon icon={faPhone} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="social-contacts-member-action">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="social-contacts-social">
                <h4>
                  <FontAwesomeIcon icon={faShare} />
                  Социални мрежи
                </h4>
                <div className="social-contacts-social-links">
                  {socialLinks.map(link => (
                    <a 
                      key={link.key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-contacts-social-link"
                      style={{ '--social-color': link.color }}
                    >
                      <FontAwesomeIcon icon={link.icon} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        {faqData.length > 0 && (
          <div className="social-contacts-faq">
            <h3 className="social-contacts-section-title">
              <FontAwesomeIcon icon={faQuestionCircle} />
              Често задавани въпроси
            </h3>
            
            <div className="social-contacts-faq-list">
              {faqData.map((faq, index) => (
                <div key={index} className="social-contacts-faq-item">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="social-contacts-faq-question"
                  >
                    <span>{faq.question}</span>
                    <FontAwesomeIcon 
                      icon={expandedFaq === index ? faChevronUp : faChevronDown} 
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="social-contacts-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="social-contacts-modal" onClick={() => setShowContactForm(false)}>
            <div className="social-contacts-modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="social-contacts-modal-close" 
                onClick={() => setShowContactForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="social-contacts-modal-header">
                <FontAwesomeIcon icon={faComments} />
                <h3>Свържете се с нас</h3>
                <p>Изпратете ни съобщение и ще ви отговорим възможно най-скоро</p>
              </div>
              
              {contactStatus === 'sent' ? (
                <div className="social-contacts-form-success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <h4>Съобщението е изпратено успешно!</h4>
                  <p>Благодарим ви! Ще се свържем с вас възможно най-скоро.</p>
                </div>
              ) : contactStatus === 'error' ? (
                <div className="social-contacts-form-error">
                  <FontAwesomeIcon icon={faTimes} />
                  <h4>Възникна грешка</h4>
                  <p>Моля опитайте отново или се свържете с нас директно.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="social-contacts-form">
                  <div className="social-contacts-form-row">
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-name">
                        <FontAwesomeIcon icon={faUser} />
                        Вашето име *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e) => handleContactChange('name', e.target.value)}
                        required
                        placeholder="Въведете вашето име"
                      />
                    </div>
                    
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        Имейл адрес *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        value={contactForm.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        required
                        placeholder="Въведете вашия имейл"
                      />
                    </div>
                  </div>
                  
                  <div className="social-contacts-form-row">
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-phone">
                        <FontAwesomeIcon icon={faPhone} />
                        Телефон
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        value={contactForm.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="Въведете вашия телефон"
                      />
                    </div>
                    
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-type">
                        <FontAwesomeIcon icon={faFileAlt} />
                        Тип запитване *
                      </label>
                      <select
                        id="contact-type"
                        value={contactForm.type}
                        onChange={(e) => handleContactChange('type', e.target.value)}
                        required
                      >
                        {contactTypes.map(type => (
                          <option key={type.key} value={type.key}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="social-contacts-form-group">
                    <label htmlFor="contact-subject">
                      <FontAwesomeIcon icon={faLightbulb} />
                      Тема *
                    </label>
                    <input
                      type="text"
                      id="contact-subject"
                      value={contactForm.subject}
                      onChange={(e) => handleContactChange('subject', e.target.value)}
                      required
                      placeholder="Темата на вашето съобщение"
                    />
                  </div>
                  
                  <div className="social-contacts-form-group">
                    <label htmlFor="contact-message">
                      <FontAwesomeIcon icon={faComments} />
                      Съобщение *
                    </label>
                    <textarea
                      id="contact-message"
                      value={contactForm.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      required
                      placeholder="Напишете вашето съобщение тук..."
                      rows="5"
                    />
                  </div>
                  
                  <div className="social-contacts-form-actions">
                    <button 
                      type="submit" 
                      className="social-contacts-submit-btn"
                      disabled={contactStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                      {contactStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщението'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowContactForm(false)}
                      className="social-contacts-cancel-btn"
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

export default SocialContacts;