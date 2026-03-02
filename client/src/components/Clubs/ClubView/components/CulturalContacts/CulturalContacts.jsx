import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faGlobe,
  faMobile,
  faCalendarAlt,
  faPaperPlane,
  faUser,
  faQuestionCircle,
  faInfoCircle,
  faHandshake,
  faUsers,
  faComments,
  faCheckCircle,
  faExclamationTriangle,
  faPhoneAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook,
  faInstagram,
  faYoutube,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';
import './culturalContacts.css';

export const CulturalContacts = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'email'
  });

  const [formStatus, setFormStatus] = useState(null);

  if (!club?.contacts || (!club.contacts.phone && !club.contacts.email)) {
    return null;
  }

  const contacts = {
    phone: club.contacts.phone || null,
    mobile: club.contacts.mobile || null,
    email: club.contacts.email || null,
    website: club.contacts.website || null,
    socialMedia: club.contacts.socialMedia || {},
    workingHours: club.contacts.workingHours || {}
  };

  const getEmergencyContacts = () => {
    const emergencyList = [];
    
    if (club.contacts?.emergency) {
      emergencyList.push(...club.contacts.emergency);
    } else {
      if (contacts.phone) {
        emergencyList.push({
          title: t('clubs.CulturalContacts.emergency.mainPhone'),
          name: t('clubs.CulturalContacts.emergency.reception'),
          phone: contacts.phone,
          available: t('clubs.CulturalContacts.emergency.workingHours'),
          icon: faPhone
        });
      }
      
      if (contacts.mobile) {
        emergencyList.push({
          title: t('clubs.CulturalContacts.emergency.mobilePhone'),
          name: t('clubs.CulturalContacts.emergency.onDuty'),
          phone: contacts.mobile,
          available: t('clubs.CulturalContacts.emergency.afterHours'),
          icon: faMobile
        });
      }

      if (club.management?.board?.[0]) {
        const president = club.management.board[0];
        if (president.phone) {
          emergencyList.push({
            title: t('clubs.CulturalContacts.emergency.chairman'),
            name: president.name,
            phone: president.phone,
            available: '09:00-20:00',
            icon: faUser
          });
        }
      }
    }
    
    return emergencyList;
  };

  const emergencyContacts = getEmergencyContacts();

  const getContactMethods = () => [
    {
      id: 'visit',
      title: t('clubs.CulturalContacts.methods.visit.title'),
      description: t('clubs.CulturalContacts.methods.visit.description'),
      icon: faMapMarkerAlt,
      color: '#ef4444',
      details: club.location?.address ? 
        `${club.location.address}, ${club.location.city || ''}` : 
        t('clubs.CulturalContacts.methods.visit.byAppointment')
    },
    contacts.phone ? {
      id: 'call',
      title: t('clubs.CulturalContacts.methods.call.title'),
      description: t('clubs.CulturalContacts.methods.call.description'),
      icon: faPhone,
      color: '#10b981',
      details: contacts.phone
    } : null,
    contacts.email ? {
      id: 'email',
      title: t('clubs.CulturalContacts.methods.email.title'),
      description: t('clubs.CulturalContacts.methods.email.description'),
      icon: faEnvelope,
      color: '#3b82f6',
      details: contacts.email
    } : null,
    contacts.website ? {
      id: 'online',
      title: t('clubs.CulturalContacts.methods.online.title'),
      description: t('clubs.CulturalContacts.methods.online.description'),
      icon: faGlobe,
      color: '#8b5cf6',
      details: contacts.website
    } : null
  ].filter(Boolean);

  const contactMethods = getContactMethods();

  const socialMedia = [
    contacts.socialMedia?.facebook ? {
      platform: 'Facebook',
      url: contacts.socialMedia.facebook,
      icon: faFacebook,
      color: '#1877f2'
    } : null,
    contacts.socialMedia?.instagram ? {
      platform: 'Instagram',
      url: contacts.socialMedia.instagram,
      icon: faInstagram,
      color: '#e4405f'
    } : null,
    contacts.socialMedia?.youtube ? {
      platform: 'YouTube',
      url: contacts.socialMedia.youtube,
      icon: faYoutube,
      color: '#ff0000'
    } : null,
    contacts.socialMedia?.twitter ? {
      platform: 'Twitter',
      url: contacts.socialMedia.twitter,
      icon: faTwitter,
      color: '#1da1f2'
    } : null
  ].filter(Boolean);

  const getWorkingHours = () => {
    const defaultHours = {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00', 
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: '10:00-15:00',
      sunday: t('clubs.CulturalContacts.workingHours.closed')
    };

    const dayNames = {
      monday: t('clubs.CulturalContacts.workingHours.days.monday'),
      tuesday: t('clubs.CulturalContacts.workingHours.days.tuesday'),
      wednesday: t('clubs.CulturalContacts.workingHours.days.wednesday'),
      thursday: t('clubs.CulturalContacts.workingHours.days.thursday'),
      friday: t('clubs.CulturalContacts.workingHours.days.friday'),
      saturday: t('clubs.CulturalContacts.workingHours.days.saturday'),
      sunday: t('clubs.CulturalContacts.workingHours.days.sunday')
    };

    return [
      { day: dayNames.monday, time: contacts.workingHours?.monday || defaultHours.monday },
      { day: dayNames.tuesday, time: contacts.workingHours?.tuesday || defaultHours.tuesday },
      { day: dayNames.wednesday, time: contacts.workingHours?.wednesday || defaultHours.wednesday },
      { day: dayNames.thursday, time: contacts.workingHours?.thursday || defaultHours.thursday },
      { day: dayNames.friday, time: contacts.workingHours?.friday || defaultHours.friday },
      { day: dayNames.saturday, time: contacts.workingHours?.saturday || defaultHours.saturday },
      { day: dayNames.sunday, time: contacts.workingHours?.sunday || defaultHours.sunday }
    ];
  };

  const workingHours = getWorkingHours();

  const getFaqItems = () => {
    if (club.faq && Array.isArray(club.faq)) {
      return club.faq;
    }

    const faqList = [
      {
        question: t('clubs.CulturalContacts.faq.membership.question'),
        answer: club.membership ? 
          t('clubs.CulturalContacts.faq.membership.answerWithFee', { 
            fee: club.membership.membershipFee?.monthly || t('clubs.CulturalContacts.faq.byAgreement') 
          }) :
          t('clubs.CulturalContacts.faq.membership.answerGeneral')
      }
    ];

    if (club.membership?.membershipFee) {
      const monthlyFee = club.membership.membershipFee.monthly || t('clubs.CulturalContacts.faq.byAgreement');
      const yearlyFee = club.membership.membershipFee.yearly;
      
      faqList.push({
        question: t('clubs.CulturalContacts.faq.fees.question'),
        answer: yearlyFee ? 
          t('clubs.CulturalContacts.faq.fees.answerWithYearly', { monthly: monthlyFee, yearly: yearlyFee }) :
          t('clubs.CulturalContacts.faq.fees.answerMonthly', { monthly: monthlyFee })
      });
    }

    if (club.membership?.requirements?.minAge) {
      faqList.push({
        question: t('clubs.CulturalContacts.faq.ageLimit.question'),
        answer: t('clubs.CulturalContacts.faq.ageLimit.answerWithAge', { 
          age: club.membership.requirements.minAge 
        })
      });
    } else {
      faqList.push({
        question: t('clubs.CulturalContacts.faq.ageLimit.question'),
        answer: t('clubs.CulturalContacts.faq.ageLimit.answerDefault')
      });
    }

    if (club.activities) {
      const activities = [];
      if (club.activities.events?.length) activities.push(t('clubs.CulturalContacts.faq.activities.events'));
      if (club.activities.trips?.length) activities.push(t('clubs.CulturalContacts.faq.activities.trips'));
      if (club.activities.classes?.length) activities.push(t('clubs.CulturalContacts.faq.activities.classes'));
      
      if (activities.length > 0) {
        faqList.push({
          question: t('clubs.CulturalContacts.faq.activities.question'),
          answer: t('clubs.CulturalContacts.faq.activities.answer', { 
            activities: activities.join(', ') 
          })
        });
      }
    }

    return faqList;
  };

  const faqItems = getFaqItems();

  const getSubjectOptions = () => [
    { value: '', label: t('clubs.CulturalContacts.form.subjectPlaceholder') },
    { value: 'membership', label: t('clubs.CulturalContacts.form.subjects.membership') },
    { value: 'activities', label: t('clubs.CulturalContacts.form.subjects.activities') },
    { value: 'events', label: t('clubs.CulturalContacts.form.subjects.events') },
    { value: 'volunteering', label: t('clubs.CulturalContacts.form.subjects.volunteering') },
    { value: 'complaint', label: t('clubs.CulturalContacts.form.subjects.complaint') },
    { value: 'other', label: t('clubs.CulturalContacts.form.subjects.other') }
  ];

  const subjectOptions = getSubjectOptions();

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    if (contacts.email) {
      const selectedSubject = subjectOptions.find(opt => opt.value === contactForm.subject);
      const subjectLabel = selectedSubject ? selectedSubject.label : contactForm.subject;
      
      const subject = encodeURIComponent(t('clubs.CulturalContacts.form.emailSubject', { 
        subject: subjectLabel || t('clubs.CulturalContacts.form.inquiry'),
        clubName: club.name 
      }));
      
      const contactMethodLabel = contactForm.contactMethod === 'email' ? 
        t('clubs.CulturalContacts.form.contactMethods.email') : 
        t('clubs.CulturalContacts.form.contactMethods.phone');
      
      const body = encodeURIComponent(t('clubs.CulturalContacts.form.emailBody', {
        clubName: club.name,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || t('clubs.CulturalContacts.form.notSpecified'),
        subject: subjectLabel,
        contactMethod: contactMethodLabel,
        message: contactForm.message
      }));
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('success');
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          contactMethod: 'email'
        });
        
        setTimeout(() => setFormStatus(null), 5000);
      } catch (error) {
        setFormStatus('error');
        setTimeout(() => setFormStatus(null), 3000);
      }
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  const handleCall = () => {
    const phone = contacts.phone || contacts.mobile;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert(t('clubs.CulturalContacts.actions.noPhone'));
    }
  };

  const handleVisit = () => {
    if (club.location?.coordinates) {
      const coords = `${club.location.coordinates.lat},${club.location.coordinates.lng}`;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords}`, '_blank');
    } else if (club.location?.address) {
      const address = encodeURIComponent(`${club.location.address}, ${club.location.city || ''}`);
      window.open(`https://www.google.com/maps/search/${address}`, '_blank');
    } else {
      alert(t('clubs.CulturalContacts.actions.noAddress'));
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isOpenNow = () => {
    const currentDay = getCurrentDay();
    const todayHours = contacts.workingHours?.[currentDay];
    const closedValue = t('clubs.CulturalContacts.workingHours.closed');
    if (!todayHours || todayHours === 'closed' || todayHours === closedValue) return false;
    
    try {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const [start, end] = todayHours.split('-').map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 100 + minutes;
      });
      
      return currentTime >= start && currentTime <= end;
    } catch {
      return false;
    }
  };

  return (
    <section id="cultural-contacts" className="cultural-contacts-main-section">
      <div className="cultural-contacts-container">
        
        <div className="cultural-contacts-header">
          <div className="cultural-contacts-badge">
            <FontAwesomeIcon icon={faComments} />
            <span>{t('clubs.CulturalContacts.header.badge')}</span>
          </div>
          <h2 className="cultural-contacts-title">{t('clubs.CulturalContacts.header.title')}</h2>
          <p className="cultural-contacts-subtitle">
            {t('clubs.CulturalContacts.header.subtitle')}
          </p>
        </div>

        <div className="cultural-contacts-quick-info">
          {Object.keys(contacts.workingHours).length > 0 && (
            <div className="cultural-contacts-status">
              <div className={`cultural-contacts-status-indicator ${isOpenNow() ? 'open' : 'closed'}`}>
                <div className="cultural-contacts-status-dot"></div>
                <span>{isOpenNow() ? t('clubs.CulturalContacts.status.open') : t('clubs.CulturalContacts.status.closed')}</span>
              </div>
            </div>
          )}
          
          <div className="cultural-contacts-quick-grid">
            {contacts.phone && (
              <div className="cultural-contacts-quick-item" onClick={handleCall} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faPhone} />
                <div>
                  <span className="cultural-contacts-quick-label">{t('clubs.CulturalContacts.quickInfo.phone')}</span>
                  <span className="cultural-contacts-quick-value">{contacts.phone}</span>
                </div>
              </div>
            )}
            
            {contacts.mobile && (
              <div className="cultural-contacts-quick-item" onClick={() => window.location.href = `tel:${contacts.mobile}`} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faMobile} />
                <div>
                  <span className="cultural-contacts-quick-label">{t('clubs.CulturalContacts.quickInfo.mobile')}</span>
                  <span className="cultural-contacts-quick-value">{contacts.mobile}</span>
                </div>
              </div>
            )}
            
            {contacts.email && (
              <div className="cultural-contacts-quick-item" onClick={() => window.location.href = `mailto:${contacts.email}`} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faEnvelope} />
                <div>
                  <span className="cultural-contacts-quick-label">{t('clubs.CulturalContacts.quickInfo.email')}</span>
                  <span className="cultural-contacts-quick-value">{contacts.email}</span>
                </div>
              </div>
            )}
            
            {contacts.website && (
              <div className="cultural-contacts-quick-item" onClick={() => window.open(`https://${contacts.website}`, '_blank')} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faGlobe} />
                <div>
                  <span className="cultural-contacts-quick-label">{t('clubs.CulturalContacts.quickInfo.website')}</span>
                  <span className="cultural-contacts-quick-value">{contacts.website}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="cultural-contacts-main-grid">
          
          <div className="cultural-contacts-methods">
            <h3>{t('clubs.CulturalContacts.methods.title')}</h3>
            <div className="cultural-contacts-methods-grid">
              {contactMethods.map(method => (
                <div key={method.id} className="cultural-contacts-method-card">
                  <div 
                    className="cultural-contacts-method-icon"
                    style={{ background: method.color }}
                  >
                    <FontAwesomeIcon icon={method.icon} />
                  </div>
                  <div className="cultural-contacts-method-content">
                    <h4>{method.title}</h4>
                    <p>{method.description}</p>
                    <span className="cultural-contacts-method-details">{method.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {contacts.email && (
            <div className="cultural-contacts-form-section">
              <h3>{t('clubs.CulturalContacts.form.title')}</h3>
              <form onSubmit={handleSubmit} className="cultural-contacts-form">
                <div className="cultural-contacts-form-row">
                  <div className="cultural-contacts-form-group">
                    <label>{t('clubs.CulturalContacts.form.name')} *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('clubs.CulturalContacts.form.namePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="cultural-contacts-form-group">
                    <label>{t('clubs.CulturalContacts.form.email')} *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('clubs.CulturalContacts.form.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>
                
                <div className="cultural-contacts-form-row">
                  <div className="cultural-contacts-form-group">
                    <label>{t('clubs.CulturalContacts.form.phone')}</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('clubs.CulturalContacts.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-contacts-form-group">
                    <label>{t('clubs.CulturalContacts.form.subject')} *</label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    >
                      {subjectOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="cultural-contacts-form-group">
                  <label>{t('clubs.CulturalContacts.form.preferredResponse')}</label>
                  <div className="cultural-contacts-radio-group">
                    <label className="cultural-contacts-radio-label">
                      <input
                        type="radio"
                        value="email"
                        checked={contactForm.contactMethod === 'email'}
                        onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      />
                      <span>{t('clubs.CulturalContacts.form.contactMethods.email')}</span>
                    </label>
                    {(contacts.phone || contacts.mobile) && (
                      <label className="cultural-contacts-radio-label">
                        <input
                          type="radio"
                          value="phone"
                          checked={contactForm.contactMethod === 'phone'}
                          onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                        />
                        <span>{t('clubs.CulturalContacts.form.contactMethods.phone')}</span>
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="cultural-contacts-form-group">
                  <label>{t('clubs.CulturalContacts.form.message')} *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder={t('clubs.CulturalContacts.form.messagePlaceholder')}
                    rows="5"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="cultural-contacts-submit-btn"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="cultural-contacts-spinner"></div>
                      {t('clubs.CulturalContacts.form.sending')}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      {t('clubs.CulturalContacts.form.submit')}
                    </>
                  )}
                </button>
                
                {formStatus === 'success' && (
                  <div className="cultural-contacts-success-message">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {t('clubs.CulturalContacts.form.success')}
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="cultural-contacts-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {t('clubs.CulturalContacts.form.error')}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        <div className="cultural-contacts-info-grid">
          
          {Object.keys(contacts.workingHours).length > 0 && (
            <div className="cultural-contacts-hours-card">
              <div className="cultural-contacts-hours-header">
                <FontAwesomeIcon icon={faClock} />
                <h3>{t('clubs.CulturalContacts.workingHours.title')}</h3>
              </div>
              <div className="cultural-contacts-hours-list">
                {workingHours.map((day, index) => (
                  <div 
                    key={index} 
                    className={`cultural-contacts-hours-row ${
                      day.day.toLowerCase().includes(getCurrentDay()) ? 'today' : ''
                    }`}
                  >
                    <span className="cultural-contacts-day">{day.day}</span>
                    <span className={`cultural-contacts-time ${
                      day.time === t('clubs.CulturalContacts.workingHours.closed') ? 'closed' : ''
                    }`}>
                      {day.time === t('clubs.CulturalContacts.workingHours.closed') ? 
                        t('clubs.CulturalContacts.workingHours.closed') : day.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {emergencyContacts.length > 0 && (
            <div className="cultural-contacts-emergency-card">
              <div className="cultural-contacts-emergency-header">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h3>{t('clubs.CulturalContacts.emergency.title')}</h3>
              </div>
              <div className="cultural-contacts-emergency-list">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="cultural-contacts-emergency-item">
                    <div className="cultural-contacts-emergency-icon">
                      <FontAwesomeIcon icon={contact.icon} />
                    </div>
                    <div className="cultural-contacts-emergency-info">
                      <h4>{contact.title}</h4>
                      <p>{contact.name}</p>
                      <span 
                        className="cultural-contacts-emergency-phone"
                        onClick={() => window.location.href = `tel:${contact.phone}`}
                        style={{cursor: 'pointer'}}
                      >
                        {contact.phone}
                      </span>
                      <span className="cultural-contacts-emergency-time">{contact.available}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {socialMedia.length > 0 && (
            <div className="cultural-contacts-social-card">
              <div className="cultural-contacts-social-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>{t('clubs.CulturalContacts.social.title')}</h3>
              </div>
              <div className="cultural-contacts-social-list">
                {socialMedia.map((social, index) => (
                  <div key={index} className="cultural-contacts-social-item">
                    <div 
                      className="cultural-contacts-social-icon"
                      style={{ background: social.color }}
                    >
                      <FontAwesomeIcon icon={social.icon} />
                    </div>
                    <div className="cultural-contacts-social-info">
                      <h4>{social.platform}</h4>
                      <a 
                        href={social.url.startsWith('http') ? social.url : `https://${social.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {t('clubs.CulturalContacts.social.follow')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {faqItems.length > 0 && (
          <div className="cultural-contacts-faq">
            <div className="cultural-contacts-faq-header">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <h3>{t('clubs.CulturalContacts.faq.title')}</h3>
              <p>{t('clubs.CulturalContacts.faq.subtitle')}</p>
            </div>
            <div className="cultural-contacts-faq-grid">
              {faqItems.map((item, index) => (
                <div key={index} className="cultural-contacts-faq-item">
                  <div className="cultural-contacts-faq-question">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <h4>{item.question}</h4>
                  </div>
                  <p className="cultural-contacts-faq-answer">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cultural-contacts-cta">
          <div className="cultural-contacts-cta-content">
            <h3>{t('clubs.CulturalContacts.cta.title')}</h3>
            <p>{t('clubs.CulturalContacts.cta.subtitle')}</p>
            <div className="cultural-contacts-cta-buttons">
              {(contacts.phone || contacts.mobile) && (
                <button className="cultural-contacts-cta-primary" onClick={handleCall}>
                  <FontAwesomeIcon icon={faPhone} />
                  {t('clubs.CulturalContacts.cta.callNow')}
                </button>
              )}
              {club.location && (
                <button className="cultural-contacts-cta-secondary" onClick={handleVisit}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {t('clubs.CulturalContacts.cta.visitUs')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalContacts;