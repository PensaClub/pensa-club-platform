import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandsHelping,
  faUsers,
  faClock,
  faHeart,
  faUser,
  faPhone,
  faEnvelope,
  faChartBar,
  faAward,
  faHandHoldingHeart,
  faUserFriends,
  faGraduationCap,
  faClipboardList,
  faLightbulb,
  faMedkit,
  faUtensils,
  faHome,
  faHandshake,
  faCalendarAlt,
  faCheckCircle,
  faTimes,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import './socialVolunteering.css';

export const SocialVolunteering = ({ club }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('programs');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    interests: [],
    availability: '',
    message: ''
  });
  const [registrationStatus, setRegistrationStatus] = useState(null);

  if (!club?.socialImpact?.volunteering && 
      !club?.pensionersSpecific?.specialPrograms?.volunteerPrograms && 
      !club?.management?.board) {
    return null;
  }

  const getVolunteerCategory = (project) => {
    const lowerProject = project.toLowerCase();
    const elderlyTerms = t('clubs.SocialVolunteering.categories.elderlyTerms', { returnObjects: true });
    const foodTerms = t('clubs.SocialVolunteering.categories.foodTerms', { returnObjects: true });
    const healthTerms = t('clubs.SocialVolunteering.categories.healthTerms', { returnObjects: true });
    const homeTerms = t('clubs.SocialVolunteering.categories.homeTerms', { returnObjects: true });
    
    if (elderlyTerms.some(term => lowerProject.includes(term))) return 'elderly';
    if (foodTerms.some(term => lowerProject.includes(term))) return 'food';
    if (healthTerms.some(term => lowerProject.includes(term))) return 'health';
    if (homeTerms.some(term => lowerProject.includes(term))) return 'home';
    return 'support';
  };

  const volunteeringPrograms = club.socialImpact?.volunteering || [];
  const specialVolunteerPrograms = club.pensionersSpecific?.specialPrograms?.volunteerPrograms || [];
  
  const allPrograms = [
    ...volunteeringPrograms.map(v => ({
      id: `main-${v.project}`,
      name: v.project,
      description: v.description,
      participants: v.participants,
      coordinator: v.coordinator,
      hoursPerMonth: v.hoursPerMonth,
      type: 'community',
      impact: t('clubs.SocialVolunteering.impact.hoursPerMonth', { hours: v.hoursPerMonth }),
      category: getVolunteerCategory(v.project)
    })),
    ...specialVolunteerPrograms.map(v => ({
      id: `special-${v.name}`,
      name: v.name,
      description: v.description,
      participants: v.volunteers,
      coordinator: v.coordinator,
      hoursPerWeek: v.hoursPerWeek,
      training: v.training,
      type: 'special',
      impact: v.hoursPerWeek ? 
        t('clubs.SocialVolunteering.impact.hoursPerWeek', { hours: v.hoursPerWeek }) : 
        t('clubs.SocialVolunteering.impact.permanent'),
      category: 'support'
    }))
  ];

  const volunteers = club.management?.board?.filter(member => 
    allPrograms.some(program => program.coordinator === member.name)
  ) || [];

  if (allPrograms.length === 0) {
    return null;
  }

  const totalVolunteers = allPrograms.reduce((sum, program) => sum + (program.participants || 0), 0);
  const totalHoursPerMonth = allPrograms.reduce((sum, program) => 
    sum + (program.hoursPerMonth || (program.hoursPerWeek ? program.hoursPerWeek * 4 : 0)), 0);
  const activePrograms = allPrograms.length;

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'elderly': return faUserFriends;
      case 'food': return faUtensils;
      case 'health': return faMedkit;
      case 'home': return faHome;
      case 'support': return faHandsHelping;
      default: return faHeart;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'elderly': return '#8b5cf6';
      case 'food': return '#f59e0b';
      case 'health': return '#ef4444';
      case 'home': return '#10b981';
      case 'support': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getProgramTypeLabel = (type) => {
    return type === 'community' ? 
      t('clubs.SocialVolunteering.programTypes.community') : 
      t('clubs.SocialVolunteering.programTypes.special');
  };

  const getAvailabilityOptions = () => [
    { value: '', label: t('clubs.SocialVolunteering.form.availability.placeholder') },
    { value: 'weekdays', label: t('clubs.SocialVolunteering.form.availability.weekdays') },
    { value: 'weekends', label: t('clubs.SocialVolunteering.form.availability.weekends') },
    { value: 'evenings', label: t('clubs.SocialVolunteering.form.availability.evenings') },
    { value: 'flexible', label: t('clubs.SocialVolunteering.form.availability.flexible') },
    { value: 'emergency', label: t('clubs.SocialVolunteering.form.availability.emergency') }
  ];

  const getInterestOptions = () => [
    t('clubs.SocialVolunteering.form.interests.elderlycare'),
    t('clubs.SocialVolunteering.form.interests.foodHelp'),
    t('clubs.SocialVolunteering.form.interests.transport'),
    t('clubs.SocialVolunteering.form.interests.health'),
    t('clubs.SocialVolunteering.form.interests.homeHelp'),
    t('clubs.SocialVolunteering.form.interests.education'),
    t('clubs.SocialVolunteering.form.interests.events'),
    t('clubs.SocialVolunteering.form.interests.technical')
  ];

  const availabilityOptions = getAvailabilityOptions();
  const interestOptions = getInterestOptions();

  const openVolunteerModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
  };

  const closeVolunteerModal = () => {
    setSelectedVolunteer(null);
  };

  const openRegistrationModal = () => {
    setShowRegistrationModal(true);
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      age: '',
      experience: '',
      interests: [],
      availability: '',
      message: ''
    });
    setRegistrationStatus(null);
  };

  const handleRegistrationChange = (field, value) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setRegistrationForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    setRegistrationStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.SocialVolunteering.email.subject', { name: registrationForm.name }));
      const body = encodeURIComponent(t('clubs.SocialVolunteering.email.body', {
        name: registrationForm.name,
        email: registrationForm.email,
        phone: registrationForm.phone,
        age: registrationForm.age,
        experience: registrationForm.experience,
        interests: registrationForm.interests.join(', '),
        availability: availabilityOptions.find(opt => opt.value === registrationForm.availability)?.label || registrationForm.availability,
        message: registrationForm.message,
        clubName: club.name
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setRegistrationStatus('sent');
        setTimeout(() => {
          closeRegistrationModal();
        }, 2000);
      } catch (error) {
        setRegistrationStatus('error');
      }
    } else {
      setRegistrationStatus('error');
    }
  };

  return (
    <section id="social-volunteering" className="social-volunteering-section">
      <div className="social-volunteering-container">
        
        <div className="social-volunteering-header">
          <div className="social-volunteering-header-content">
            <div className="social-volunteering-badge">
              <FontAwesomeIcon icon={faHandsHelping} />
              <span>{t('clubs.SocialVolunteering.header.badge')}</span>
            </div>
            <h2 className="social-volunteering-title">
              {t('clubs.SocialVolunteering.header.title')}
            </h2>
            <p className="social-volunteering-subtitle">
              {t('clubs.SocialVolunteering.header.subtitle')}
            </p>
          </div>
          
          <div className="social-volunteering-dashboard">
            <div className="social-volunteering-stat-box">
              <div className="social-volunteering-stat-icon volunteers">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="social-volunteering-stat-info">
                <span className="social-volunteering-stat-number">{totalVolunteers}</span>
                <span className="social-volunteering-stat-label">{t('clubs.SocialVolunteering.stats.volunteers')}</span>
              </div>
            </div>
            
            <div className="social-volunteering-stat-box">
              <div className="social-volunteering-stat-icon hours">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div className="social-volunteering-stat-info">
                <span className="social-volunteering-stat-number">{totalHoursPerMonth}</span>
                <span className="social-volunteering-stat-label">{t('clubs.SocialVolunteering.stats.hoursPerMonth')}</span>
              </div>
            </div>
            
            <div className="social-volunteering-stat-box">
              <div className="social-volunteering-stat-icon programs">
                <FontAwesomeIcon icon={faHandsHelping} />
              </div>
              <div className="social-volunteering-stat-info">
                <span className="social-volunteering-stat-number">{activePrograms}</span>
                <span className="social-volunteering-stat-label">{t('clubs.SocialVolunteering.stats.activePrograms')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="social-volunteering-tabs">
          <button 
            className={`social-volunteering-tab ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <FontAwesomeIcon icon={faClipboardList} />
            <span>{t('clubs.SocialVolunteering.tabs.programs')}</span>
          </button>
          <button 
            className={`social-volunteering-tab ${activeTab === 'volunteers' ? 'active' : ''}`}
            onClick={() => setActiveTab('volunteers')}
          >
            <FontAwesomeIcon icon={faUserFriends} />
            <span>{t('clubs.SocialVolunteering.tabs.volunteers')}</span>
          </button>
          <button 
            className={`social-volunteering-tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            <FontAwesomeIcon icon={faHandshake} />
            <span>{t('clubs.SocialVolunteering.tabs.join')}</span>
          </button>
        </div>

        <div className="social-volunteering-content">
          
          {activeTab === 'programs' && (
            <div className="social-volunteering-programs">
              <div className="social-volunteering-timeline">
                {allPrograms.map((program, index) => (
                  <div key={program.id} className="social-volunteering-timeline-item">
                    <div className="social-volunteering-timeline-marker">
                      <div 
                        className="social-volunteering-timeline-icon"
                        style={{ backgroundColor: getCategoryColor(program.category) }}
                      >
                        <FontAwesomeIcon icon={getCategoryIcon(program.category)} />
                      </div>
                    </div>
                    
                    <div className="social-volunteering-program-card">
                      <div className="social-volunteering-program-header">
                        <h3 className="social-volunteering-program-title">{program.name}</h3>
                        <div 
                          className="social-volunteering-program-type"
                          style={{ backgroundColor: getCategoryColor(program.category) }}
                        >
                          {getProgramTypeLabel(program.type)}
                        </div>
                      </div>
                      
                      <p className="social-volunteering-program-description">
                        {program.description}
                      </p>
                      
                      <div className="social-volunteering-program-metrics">
                        <div className="social-volunteering-metric">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{t('clubs.SocialVolunteering.metrics.volunteers', { count: program.participants })}</span>
                        </div>
                        <div className="social-volunteering-metric">
                          <FontAwesomeIcon icon={faChartBar} />
                          <span>{program.impact}</span>
                        </div>
                        {program.coordinator && (
                          <div className="social-volunteering-metric">
                            <FontAwesomeIcon icon={faUser} />
                            <span>{t('clubs.SocialVolunteering.metrics.coordinator')}: {program.coordinator}</span>
                          </div>
                        )}
                        {program.training && (
                          <div className="social-volunteering-metric">
                            <FontAwesomeIcon icon={faGraduationCap} />
                            <span>{program.training}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="social-volunteering-volunteers">
              {volunteers.length > 0 ? (
                <>
                  <div className="social-volunteering-volunteers-intro">
                    <h3>{t('clubs.SocialVolunteering.volunteers.introTitle')}</h3>
                    <p>{t('clubs.SocialVolunteering.volunteers.introSubtitle')}</p>
                  </div>
                  
                  <div className="social-volunteering-volunteers-grid">
                    {volunteers.map((volunteer) => (
                      <div 
                        key={volunteer.name} 
                        className="social-volunteering-volunteer-card"
                        onClick={() => openVolunteerModal(volunteer)}
                      >
                        <div className="social-volunteering-volunteer-avatar">
                          <img src={volunteer.avatar} alt={volunteer.name} />
                          <div className="social-volunteering-volunteer-badge">
                            <FontAwesomeIcon icon={faAward} />
                          </div>
                        </div>
                        
                        <div className="social-volunteering-volunteer-info">
                          <h4 className="social-volunteering-volunteer-name">{volunteer.name}</h4>
                          <p className="social-volunteering-volunteer-role">{volunteer.role}</p>
                          <p className="social-volunteering-volunteer-bio">{volunteer.bio}</p>
                          
                          <div className="social-volunteering-volunteer-programs">
                            {allPrograms
                              .filter(program => program.coordinator === volunteer.name)
                              .map(program => (
                                <span 
                                  key={program.id}
                                  className="social-volunteering-volunteer-program"
                                  style={{ backgroundColor: getCategoryColor(program.category) }}
                                >
                                  {program.name}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="social-volunteering-no-volunteers">
                  <FontAwesomeIcon icon={faUsers} />
                  <h3>{t('clubs.SocialVolunteering.volunteers.noVolunteers.title')}</h3>
                  <p>{t('clubs.SocialVolunteering.volunteers.noVolunteers.message')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'join' && (
            <div className="social-volunteering-join">
              <div className="social-volunteering-join-content">
                <div className="social-volunteering-join-header">
                  <FontAwesomeIcon icon={faHandHoldingHeart} />
                  <h3>{t('clubs.SocialVolunteering.join.header.title')}</h3>
                  <p>{t('clubs.SocialVolunteering.join.header.subtitle')}</p>
                </div>
                
                <div className="social-volunteering-join-steps">
                  <div className="social-volunteering-step">
                    <div className="social-volunteering-step-number">1</div>
                    <div className="social-volunteering-step-content">
                      <h4>{t('clubs.SocialVolunteering.join.steps.step1.title')}</h4>
                      <p>{t('clubs.SocialVolunteering.join.steps.step1.description')}</p>
                    </div>
                  </div>
                  
                  <div className="social-volunteering-step">
                    <div className="social-volunteering-step-number">2</div>
                    <div className="social-volunteering-step-content">
                      <h4>{t('clubs.SocialVolunteering.join.steps.step2.title')}</h4>
                      <p>{t('clubs.SocialVolunteering.join.steps.step2.description')}</p>
                    </div>
                  </div>
                  
                  <div className="social-volunteering-step">
                    <div className="social-volunteering-step-number">3</div>
                    <div className="social-volunteering-step-content">
                      <h4>{t('clubs.SocialVolunteering.join.steps.step3.title')}</h4>
                      <p>{t('clubs.SocialVolunteering.join.steps.step3.description')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="social-volunteering-join-cta">
                  <h4>{t('clubs.SocialVolunteering.join.cta.title')}</h4>
                  <div className="social-volunteering-join-buttons">
                    <button 
                      onClick={openRegistrationModal}
                      className="social-volunteering-cta-btn primary"
                    >
                      <FontAwesomeIcon icon={faUserFriends} />
                      <span>{t('clubs.SocialVolunteering.join.cta.register')}</span>
                    </button>
                    
                    {club.contacts?.phone && (
                      <a 
                        href={`tel:${club.contacts.phone}`}
                        className="social-volunteering-cta-btn secondary"
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{t('clubs.SocialVolunteering.join.cta.call')}</span>
                      </a>
                    )}
                    {club.contacts?.email && (
                      <a 
                        href={`mailto:${club.contacts.email}?subject=${encodeURIComponent(t('clubs.SocialVolunteering.join.cta.emailSubject'))}`}
                        className="social-volunteering-cta-btn secondary"
                      >
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{t('clubs.SocialVolunteering.join.cta.email')}</span>
                      </a>
                    )}
                  </div>
                  
                  <div className="social-volunteering-join-note">
                    <FontAwesomeIcon icon={faLightbulb} />
                    <span>{t('clubs.SocialVolunteering.join.cta.note')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedVolunteer && (
          <div className="social-volunteering-modal" onClick={closeVolunteerModal}>
            <div className="social-volunteering-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-volunteering-modal-close" onClick={closeVolunteerModal}>
                ×
              </button>
              
              <div className="social-volunteering-modal-header">
                <img 
                  src={selectedVolunteer.avatar} 
                  alt={selectedVolunteer.name}
                  className="social-volunteering-modal-avatar"
                />
                <div className="social-volunteering-modal-info">
                  <h3>{selectedVolunteer.name}</h3>
                  <p className="social-volunteering-modal-role">{selectedVolunteer.role}</p>
                  <p className="social-volunteering-modal-bio">{selectedVolunteer.bio}</p>
                </div>
              </div>
              
              <div className="social-volunteering-modal-body">
                <h4>{t('clubs.SocialVolunteering.modal.coordinatesPrograms')}:</h4>
                <div className="social-volunteering-modal-programs">
                  {allPrograms
                    .filter(program => program.coordinator === selectedVolunteer.name)
                    .map(program => (
                      <div key={program.id} className="social-volunteering-modal-program">
                        <FontAwesomeIcon 
                          icon={getCategoryIcon(program.category)} 
                          style={{ color: getCategoryColor(program.category) }}
                        />
                        <div>
                          <h5>{program.name}</h5>
                          <p>{program.description}</p>
                          <span className="social-volunteering-modal-impact">{program.impact}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
                
                <div className="social-volunteering-modal-contact">
                  <h4>{t('clubs.SocialVolunteering.modal.contact')}:</h4>
                  <div className="social-volunteering-modal-contact-info">
                    {selectedVolunteer.phone && (
                      <a href={`tel:${selectedVolunteer.phone}`}>
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{selectedVolunteer.phone}</span>
                      </a>
                    )}
                    {selectedVolunteer.email && (
                      <a href={`mailto:${selectedVolunteer.email}`}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{selectedVolunteer.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRegistrationModal && (
          <div className="social-volunteering-registration-modal" onClick={closeRegistrationModal}>
            <div className="social-volunteering-registration-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-volunteering-registration-close" onClick={closeRegistrationModal}>
                ×
              </button>
              
              <div className="social-volunteering-registration-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>{t('clubs.SocialVolunteering.form.title')}</h3>
                <p>{t('clubs.SocialVolunteering.form.subtitle')}</p>
              </div>
              
              {registrationStatus === 'sent' ? (
                <div className="social-volunteering-registration-success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <h4>{t('clubs.SocialVolunteering.form.success.title')}</h4>
                  <p>{t('clubs.SocialVolunteering.form.success.message')}</p>
                </div>
              ) : registrationStatus === 'error' ? (
                <div className="social-volunteering-registration-error">
                  <FontAwesomeIcon icon={faTimes} />
                  <h4>{t('clubs.SocialVolunteering.form.error.title')}</h4>
                  <p>{t('clubs.SocialVolunteering.form.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handleRegistrationSubmit} className="social-volunteering-registration-form">
                  <div className="social-volunteering-form-row">
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-name">
                        <FontAwesomeIcon icon={faUser} />
                        {t('clubs.SocialVolunteering.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="reg-name"
                        value={registrationForm.name}
                        onChange={(e) => handleRegistrationChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.SocialVolunteering.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.SocialVolunteering.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="reg-email"
                        value={registrationForm.email}
                        onChange={(e) => handleRegistrationChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.SocialVolunteering.form.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="social-volunteering-form-row">
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-phone">
                        <FontAwesomeIcon icon={faPhone} />
                        {t('clubs.SocialVolunteering.form.phone')} *
                      </label>
                      <input
                        type="tel"
                        id="reg-phone"
                        value={registrationForm.phone}
                        onChange={(e) => handleRegistrationChange('phone', e.target.value)}
                        required
                        placeholder={t('clubs.SocialVolunteering.form.phonePlaceholder')}
                      />
                    </div>
                    
                    <div className="social-volunteering-form-group">
                      <label htmlFor="reg-age">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {t('clubs.SocialVolunteering.form.age')}
                      </label>
                      <input
                        type="number"
                        id="reg-age"
                        value={registrationForm.age}
                        onChange={(e) => handleRegistrationChange('age', e.target.value)}
                        placeholder={t('clubs.SocialVolunteering.form.agePlaceholder')}
                        min="16"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label htmlFor="reg-experience">
                      <FontAwesomeIcon icon={faAward} />
                      {t('clubs.SocialVolunteering.form.experience')}
                    </label>
                    <textarea
                      id="reg-experience"
                      value={registrationForm.experience}
                      onChange={(e) => handleRegistrationChange('experience', e.target.value)}
                      placeholder={t('clubs.SocialVolunteering.form.experiencePlaceholder')}
                      rows="3"
                    />
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label>
                      <FontAwesomeIcon icon={faHeart} />
                      {t('clubs.SocialVolunteering.form.interestsLabel')}
                    </label>
                    <div className="social-volunteering-interests-grid">
                      {interestOptions.map(interest => (
                        <label key={interest} className="social-volunteering-interest-item">
                          <input
                            type="checkbox"
                            checked={registrationForm.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                          />
                          <span>{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label htmlFor="reg-availability">
                      <FontAwesomeIcon icon={faClock} />
                      {t('clubs.SocialVolunteering.form.availabilityLabel')}
                    </label>
                    <select
                      id="reg-availability"
                      value={registrationForm.availability}
                      onChange={(e) => handleRegistrationChange('availability', e.target.value)}
                    >
                      {availabilityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="social-volunteering-form-group">
                    <label htmlFor="reg-message">
                      <FontAwesomeIcon icon={faComments} />
                      {t('clubs.SocialVolunteering.form.message')}
                    </label>
                    <textarea
                      id="reg-message"
                      value={registrationForm.message}
                      onChange={(e) => handleRegistrationChange('message', e.target.value)}
                      placeholder={t('clubs.SocialVolunteering.form.messagePlaceholder')}
                      rows="4"
                    />
                  </div>
                  
                  <div className="social-volunteering-form-actions">
                    <button 
                      type="submit" 
                      className="social-volunteering-submit-btn"
                      disabled={registrationStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faHandHoldingHeart} />
                      {registrationStatus === 'sending' ? t('clubs.SocialVolunteering.form.sending') : t('clubs.SocialVolunteering.form.submit')}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeRegistrationModal}
                      className="social-volunteering-cancel-btn"
                    >
                      {t('clubs.SocialVolunteering.form.cancel')}
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

export default SocialVolunteering;