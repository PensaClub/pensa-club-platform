import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTheaterMasks,
  faMusic,
  faBookOpen,
  faAward,
  faHeart,
  faPalette,
  faUsers,
  faHandsHelping,
  faStar,
  faQuoteLeft,
  faCalendarAlt,
  faGem,
  faTimes,
  faUser,
  faPhone,
  faEnvelope,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './culturalAbout.css';

export const CulturalAbout = ({ club }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interests: []
  });
  const [formStatus, setFormStatus] = useState(null); // 'sending', 'sent', 'error'

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const yearsActive = currentYear - (club.foundedYear || currentYear);

  // Само реални данни от club
  const achievements = club.achievements?.awards || [];
  const hasAchievements = achievements.length > 0;

  // Проверяваме дали има статистики
  const hasStats = club.membership?.totalMembers || club.activities?.regular?.length || hasAchievements || yearsActive > 0;

  // Проверяваме дали има принос към общността
  const communityImpact = club.stats?.communityImpact || {};
  const hasCommunityImpact = Object.keys(communityImpact).length > 0;

  // Функции за форма
  const openJoinModal = () => {
    setShowJoinModal(true);
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setJoinForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      interests: []
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setJoinForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setJoinForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(`Заявка за присъединяване към ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте заявка за присъединяване към ${club.name}:

Име: ${joinForm.name}
Имейл: ${joinForm.email}
Телефон: ${joinForm.phone || 'Не е посочен'}
Интереси: ${joinForm.interests.join(', ') || 'Няма посочени'}

Съобщение:
${joinForm.message || 'Няма допълнително съобщение'}

---
Изпратено от ${joinForm.email}
      `);
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeJoinModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleViewActivities = () => {
    const activitiesSection = document.getElementById('club-activities');
    if (activitiesSection) {
      activitiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const availableInterests = ['Хорово пеене', 'Народни танци', 'Изобразително изкуство', 'Литературни четения', 'Музика', 'Театър'];

  return (
    <section id="club-about" className="cultural-about-main-section">
      <div className="cultural-about-container">
        
        {/* Header */}
        <div className="cultural-about-header">
          <div className="cultural-about-badge">
            <FontAwesomeIcon icon={faBookOpen} />
            <span>За клуба</span>
          </div>
          <h2 className="cultural-about-title">Нашата история и мисия</h2>
          {yearsActive > 0 && (
            <p className="cultural-about-subtitle">
              Повече от {yearsActive} години създаваме незабравими моменти и съхраняваме българската култура
            </p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="cultural-about-content-grid">
          
          {/* Left Column - Story & Mission */}
          <div className="cultural-about-main-content">
            
            {/* Club Story */}
            {(club.fullDescription || club.foundedYear) && (
              <div className="cultural-about-story-card">
                <div className="cultural-about-story-header">
                  <FontAwesomeIcon icon={faBookOpen} />
                  <h3>Нашата история</h3>
                </div>
                <div className="cultural-about-story-content">
                  {club.fullDescription && (
                    <p className="cultural-about-story-text">
                      {club.fullDescription}
                    </p>
                  )}
                  
                  {club.foundedYear && (
                    <div className="cultural-about-timeline-highlight">
                      <div className="cultural-about-timeline-year">{club.foundedYear}</div>
                      <div className="cultural-about-timeline-event">Основаване на клуба</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mission & Values */}
            {club.mission && (
              <div className="cultural-about-mission-card">
                <div className="cultural-about-mission-header">
                  <FontAwesomeIcon icon={faGem} />
                  <h3>Нашата мисия</h3>
                </div>
                <div className="cultural-about-mission-content">
                  <p className="cultural-about-mission-text">{club.mission}</p>
                </div>
              </div>
            )}

            {/* Quote Section */}
            {(club.testimonials?.length > 0 || club.management?.board?.[0]?.name) && (
              <div className="cultural-about-quote-card">
                <div className="cultural-about-quote-content">
                  <FontAwesomeIcon icon={faQuoteLeft} className="cultural-about-quote-icon" />
                  <blockquote>
                    {club.testimonials?.[0]?.text || 
                     "Културата е мостът между поколенията. В нашия клуб всеки ден строим този мост с песни, танци и топли усмивки."
                    }
                  </blockquote>
                  <cite>
                    - {club.testimonials?.[0]?.author || club.management?.board?.[0]?.name || 'Председател на клуба'}
                  </cite>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Achievements */}
          <div className="cultural-about-sidebar">
            
            {/* Key Numbers */}
            {hasStats && (
              <div className="cultural-about-stats-card">
                <div className="cultural-about-stats-header">
                  <FontAwesomeIcon icon={faStar} />
                  <h3>Ключови цифри</h3>
                </div>
                <div className="cultural-about-stats-list">
                  {club.membership?.totalMembers && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{club.membership.totalMembers}</div>
                      <div className="cultural-about-stat-label">Активни членове</div>
                    </div>
                  )}
                  {yearsActive > 0 && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{yearsActive}</div>
                      <div className="cultural-about-stat-label">Години опит</div>
                    </div>
                  )}
                  {club.activities?.regular?.length && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{club.activities.regular.length}</div>
                      <div className="cultural-about-stat-label">Редовни програми</div>
                    </div>
                  )}
                  {hasAchievements && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{achievements.length}</div>
                      <div className="cultural-about-stat-label">Престижни награди</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievements */}
            {hasAchievements && (
              <div className="cultural-about-achievements-card">
                <div className="cultural-about-achievements-header">
                  <FontAwesomeIcon icon={faAward} />
                  <h3>Постижения</h3>
                </div>
                <div className="cultural-about-achievements-list">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="cultural-about-achievement-item">
                      <div className="cultural-about-achievement-year">{achievement.year}</div>
                      <div className="cultural-about-achievement-content">
                        <h4>{achievement.name}</h4>
                        {achievement.awardedBy && <p>{achievement.awardedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties from activities */}
            {club.activities?.regular?.length > 0 && (
              <div className="cultural-about-specialties-card">
                <div className="cultural-about-specialties-header">
                  <FontAwesomeIcon icon={faPalette} />
                  <h3>Нашите специалности</h3>
                </div>
                <div className="cultural-about-specialties-list">
                  {club.activities.regular.slice(0, 4).map((activity, index) => (
                    <div key={index} className="cultural-about-specialty-item">
                      <div className="cultural-about-specialty-icon">
                        <FontAwesomeIcon icon={activity.icon ? eval(activity.icon) : faMusic} />
                      </div>
                      <div className="cultural-about-specialty-content">
                        <h4>{activity.name}</h4>
                        {activity.description && <p>{activity.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Community Impact */}
        {hasCommunityImpact && (
          <div className="cultural-about-community-impact">
            <div className="cultural-about-impact-header">
              <FontAwesomeIcon icon={faHandsHelping} />
              <h3>Нашият принос към общността</h3>
            </div>
            <div className="cultural-about-impact-grid">
              {communityImpact.events && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.events}+</div>
                  <div className="cultural-about-impact-label">Културни eventi годишно</div>
                </div>
              )}
              {communityImpact.visitors && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.visitors}+</div>
                  <div className="cultural-about-impact-label">Посетители на концерти</div>
                </div>
              )}
              {communityImpact.initiatives && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.initiatives}+</div>
                  <div className="cultural-about-impact-label">Доброволни инициативи</div>
                </div>
              )}
              {communityImpact.familiesSupported && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.familiesSupported}+</div>
                  <div className="cultural-about-impact-label">Семейства подкрепени</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="cultural-about-cta-section">
          <div className="cultural-about-cta-content">
            <h3>Станете част от нашето културно семейство</h3>
            <p>Присъединете се към нас и откройте красотата на българската култура заедно с нови приятели</p>
            <div className="cultural-about-cta-buttons">
              <button className="cultural-about-btn-primary" onClick={openJoinModal}>
                <FontAwesomeIcon icon={faUsers} />
                Присъединете се
              </button>
              <button className="cultural-about-btn-secondary" onClick={handleViewActivities}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Разгледайте програмата
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="cultural-about-join-modal">
          <div className="cultural-about-join-modal-overlay" onClick={closeJoinModal}></div>
          <div className="cultural-about-join-modal-container">
            <button className="cultural-about-join-modal-close" onClick={closeJoinModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-about-join-header">
              <FontAwesomeIcon icon={faUsers} />
              <h3>Присъединете се към {club.name}</h3>
              <p>Попълнете формата и ще се свържем с вас скоро</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="cultural-about-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Заявката е изпратена!</h4>
                <p>Благодарим ви за интереса! Ще се свържем с вас скоро.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="cultural-about-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="cultural-about-join-form">
                <div className="cultural-about-form-row">
                  <div className="cultural-about-form-group">
                    <label htmlFor="joinName">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="joinName"
                      value={joinForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="cultural-about-form-group">
                    <label htmlFor="joinEmail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="joinEmail"
                      value={joinForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="cultural-about-form-group">
                  <label htmlFor="joinPhone">
                    <FontAwesomeIcon icon={faPhone} />
                    Телефон (по желание)
                  </label>
                  <input
                    type="tel"
                    id="joinPhone"
                    value={joinForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="Въведете вашия телефон"
                  />
                </div>

                {/* Interest Selection */}
                <div className="cultural-about-form-group">
                  <label>
                    <FontAwesomeIcon icon={faHeart} />
                    Какво ви интересува? (изберете едно или повече)
                  </label>
                  <div className="cultural-about-interests-grid">
                    {availableInterests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        className={`cultural-about-interest-btn ${joinForm.interests.includes(interest) ? 'selected' : ''}`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="cultural-about-form-group">
                  <label htmlFor="joinMessage">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Допълнително съобщение (по желание)
                  </label>
                  <textarea
                    id="joinMessage"
                    value={joinForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    placeholder="Разкажете ни повече за себе си или задайте въпрос..."
                    rows="4"
                  />
                </div>
                
                <div className="cultural-about-form-actions">
                  <button 
                    type="submit" 
                    className="cultural-about-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявка'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeJoinModal}
                    className="cultural-about-cancel-btn"
                  >
                    Отказ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CulturalAbout;