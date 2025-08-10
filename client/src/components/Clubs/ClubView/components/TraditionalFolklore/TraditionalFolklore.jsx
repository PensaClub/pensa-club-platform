import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic,
  faTheaterMasks,
  faDrum,
  faPlay,
  faPause,
  faVolumeUp,
  faUsers,
  faAward,
  faStar,
  faHeart,
  faCrown,
  faGem,
  faCalendarAlt,
  faDownload,
  faShare,
  faEye,
  faGlobe,
  faMicrophone,
  faGuitar,
  faCompactDisc,
  faHeadphones,
  faTimes,
  faEnvelope,
  faPhone,
  faUser,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './traditionalFolklore.css';

export const TraditionalFolklore = ({ club }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    activity: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null); // 'sending', 'sent', 'error'

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // ИЗПОЛЗВАМЕ РЕАЛНИТЕ ДАННИ ОТ MOCK ФАЙЛА

  // Музикални и танцови дейности
  const folkloreActivities = club.activities?.regular?.filter(activity => 
    activity.name.toLowerCase().includes('хор') ||
    activity.name.toLowerCase().includes('танци') ||
    activity.name.toLowerCase().includes('музик') ||
    activity.name.toLowerCase().includes('песни') ||
    activity.name.toLowerCase().includes('тракийски') ||
    activity.name.toLowerCase().includes('родопски')
  ) || [];

  // Културни и фолклорни събития
  const folkloreEvents = club.activities?.events?.filter(event =>
    event.type === 'cultural' || 
    event.type === 'traditional' ||
    event.title.toLowerCase().includes('концерт') ||
    event.title.toLowerCase().includes('фестивал') ||
    event.title.toLowerCase().includes('танц')
  ) || [];

  // Видео записи
  const folkloreVideos = club.media?.videos?.filter(video =>
    video.type === 'cultural' ||
    video.type === 'event' ||
    video.alt.toLowerCase().includes('танц') ||
    video.alt.toLowerCase().includes('песен') ||
    video.alt.toLowerCase().includes('концерт')
  ) || [];

  // Аудио файлове
  const folkloreAudio = club.media?.audioFiles || [];

  // Награди свързани с култура
  const culturalAwards = club.achievements?.awards?.filter(award =>
    award.name.toLowerCase().includes('култур') ||
    award.name.toLowerCase().includes('фолклор') ||
    award.name.toLowerCase().includes('музик') ||
    award.name.toLowerCase().includes('танц')
  ) || [];

  // Статистики свързани с изпълнения - САМО ако има реални данни
  const performanceStats = {
    performances: club.stats?.performances || 0,
    members: club.stats?.totalMembers || 0,
    years: club.stats?.yearsActive || 0
  };

  // Ако няма фолклорно съдържание, не показваме компонента
  const hasFolkloreContent = folkloreActivities.length > 0 ||
                            folkloreEvents.length > 0 ||
                            folkloreVideos.length > 0 ||
                            folkloreAudio.length > 0 ||
                            culturalAwards.length > 0;

  if (!hasFolkloreContent) {
    return null;
  }

  // Проверяваме дали има поне една статистика за показване
  const hasStats = performanceStats.performances > 0 || 
                   performanceStats.members > 0 || 
                   performanceStats.years > 0;

  const getActivityIcon = (name) => {
    if (name.toLowerCase().includes('хор')) return faMusic;
    if (name.toLowerCase().includes('танци')) return faTheaterMasks;
    if (name.toLowerCase().includes('музик')) return faGuitar;
    return faDrum;
  };

  // ФУНКЦИОНИРАЩИ HANDLERS

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const handleAudioPlay = (audioIndex) => {
    if (currentlyPlaying === audioIndex) {
      setCurrentlyPlaying(null); // Pause
    } else {
      setCurrentlyPlaying(audioIndex); // Play
    }
  };

  const handleDownload = async (media) => {
    try {
      const response = await fetch(media.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${media.caption || 'файл'}.${media.type === 'video' ? 'mp4' : 'mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Грешка при изтегляне:', error);
      alert('Възникна грешка при изтеглянето');
    }
  };

  const handleShare = (media) => {
    const text = `${media.caption || media.alt} - ${club.name}`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: media.caption || media.alt,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Информацията е копирана в клипборда!');
    }
  };

  // Registration modal handlers
  const openRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      age: '',
      experience: '',
      activity: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(`Записване за фолклорни дейности - ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Заявка за записване в фолклорна формация:

Име: ${registrationForm.name}
Имейл: ${registrationForm.email}
Телефон: ${registrationForm.phone || 'Не е посочен'}
Възраст: ${registrationForm.age || 'Не е посочена'}
Опит: ${registrationForm.experience || 'Без опит'}
Предпочитана дейност: ${registrationForm.activity || 'Всяка'}

Съобщение:
${registrationForm.message || 'Няма допълнително съобщение'}

---
Изпратено от сайта на ${club.name}
      `);
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeRegistrationModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleWatchVideos = () => {
    if (folkloreVideos.length > 0) {
      handleVideoPlay(folkloreVideos[0]);
    } else {
      alert('В момента няма налични видеа.');
    }
  };

  return (
    <section id="traditional-folklore" className="traditional-folklore-main-section">
      <div className="traditional-folklore-container">
        
        {/* Header */}
        <div className="traditional-folklore-header">
          <div className="traditional-folklore-badge">
            <FontAwesomeIcon icon={faTheaterMasks} />
            <span>Български фолклор</span>
          </div>
          <h2 className="traditional-folklore-title">Музика, танци и изпълнения</h2>
          <p className="traditional-folklore-subtitle">
            Автентични български песни и танци, предавани през поколенията
          </p>
        </div>

        {/* Performance Stats - показва се САМО ако има данни */}
        {hasStats && (
          <div className="traditional-folklore-stats">
            <div className="traditional-folklore-stats-grid">
              {performanceStats.performances > 0 && (
                <div className="traditional-folklore-stat-card">
                  <div className="traditional-folklore-stat-icon">
                    <FontAwesomeIcon icon={faTheaterMasks} />
                  </div>
                  <div className="traditional-folklore-stat-content">
                    <div className="traditional-folklore-stat-value">{performanceStats.performances}+</div>
                    <div className="traditional-folklore-stat-label">Изпълнения</div>
                  </div>
                </div>
              )}
              {performanceStats.members > 0 && (
                <div className="traditional-folklore-stat-card">
                  <div className="traditional-folklore-stat-icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="traditional-folklore-stat-content">
                    <div className="traditional-folklore-stat-value">{performanceStats.members}</div>
                    <div className="traditional-folklore-stat-label">Участници</div>
                  </div>
                </div>
              )}
              {performanceStats.years > 0 && (
                <div className="traditional-folklore-stat-card">
                  <div className="traditional-folklore-stat-icon">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div className="traditional-folklore-stat-content">
                    <div className="traditional-folklore-stat-value">{performanceStats.years}</div>
                    <div className="traditional-folklore-stat-label">Години опит</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="traditional-folklore-main-grid">
          
          {/* Folklore Activities - показва се САМО ако има дейности */}
          {folkloreActivities.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faMusic} />
                <h3>Фолклорни формации</h3>
                <p>Нашите музикални и танцови групи</p>
              </div>
              
              <div className="traditional-folklore-cards">
                {folkloreActivities.map((activity, index) => (
                  <div key={index} className="traditional-folklore-card activity">
                    <div className="traditional-folklore-card-icon">
                      <FontAwesomeIcon icon={getActivityIcon(activity.name)} />
                    </div>
                    <div className="traditional-folklore-card-content">
                      <h4>{activity.name}</h4>
                      <div className="traditional-folklore-schedule">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span><strong>{activity.day}</strong> от {activity.time}</span>
                      </div>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      <div className="traditional-folklore-details">
                        {activity.instructor && (
                          <div className="traditional-folklore-instructor">
                            <FontAwesomeIcon icon={faMicrophone} />
                            <span>Инструктор: {activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="traditional-folklore-participants">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{activity.participants} участници</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folklore Events - показва се САМО ако има събития */}
          {folkloreEvents.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faStar} />
                <h3>Културни събития</h3>
                <p>Концерти, фестивали и представления</p>
              </div>
              
              <div className="traditional-folklore-cards">
                {folkloreEvents.map((event, index) => (
                  <div key={index} className="traditional-folklore-card event">
                    <div className="traditional-folklore-card-icon">
                      <FontAwesomeIcon icon={faTheaterMasks} />
                    </div>
                    <div className="traditional-folklore-card-content">
                      <h4>{event.title}</h4>
                      <div className="traditional-folklore-event-date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{event.date} в {event.time}</span>
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      <div className="traditional-folklore-event-info">
                        <div className="traditional-folklore-event-type">{event.type}</div>
                        {event.participants && (
                          <div className="traditional-folklore-audience">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{event.participants} зрители</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Gallery - показва се САМО ако има видеа */}
          {folkloreVideos.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faPlay} />
                <h3>Видео галерия</h3>
                <p>Записи от нашите изпълнения</p>
              </div>
              
              <div className="traditional-folklore-videos">
                {folkloreVideos.map((video, index) => (
                  <div key={index} className="traditional-folklore-video-card">
                    <div className="traditional-folklore-video-thumbnail">
                      <img src={video.thumbnail} alt={video.alt} />
                      <div 
                        className="traditional-folklore-play-overlay"
                        onClick={() => handleVideoPlay(video)}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </div>
                      {video.duration && (
                        <div className="traditional-folklore-duration">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <div className="traditional-folklore-video-info">
                      <h4>{video.caption}</h4>
                      <p>{video.alt}</p>
                      <div className="traditional-folklore-video-meta">
                        <span className="traditional-folklore-video-type">{video.type}</span>
                        <div className="traditional-folklore-video-actions">
                          <button 
                            className="traditional-folklore-action-btn"
                            onClick={() => handleVideoPlay(video)}
                          >
                            <FontAwesomeIcon icon={faPlay} />
                            Гледай
                          </button>
                          <button 
                            className="traditional-folklore-action-btn"
                            onClick={() => handleShare(video)}
                          >
                            <FontAwesomeIcon icon={faShare} />
                            Сподели
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Collection - показва се САМО ако има аудио */}
          {folkloreAudio.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faVolumeUp} />
                <h3>Аудио колекция</h3>
                <p>Традиционни песни и музика</p>
              </div>
              
              <div className="traditional-folklore-audio">
                {folkloreAudio.map((audio, index) => (
                  <div key={index} className="traditional-folklore-audio-card">
                    <div className="traditional-folklore-audio-icon">
                      <FontAwesomeIcon icon={faCompactDisc} />
                    </div>
                    <div className="traditional-folklore-audio-info">
                      <h4>{audio.caption}</h4>
                      <p>{audio.alt}</p>
                      {audio.duration && (
                        <div className="traditional-folklore-audio-duration">
                          <FontAwesomeIcon icon={faHeadphones} />
                          <span>{audio.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className="traditional-folklore-audio-actions">
                      <button 
                        className="traditional-folklore-play-btn"
                        onClick={() => handleAudioPlay(index)}
                      >
                        <FontAwesomeIcon icon={currentlyPlaying === index ? faPause : faPlay} />
                      </button>
                      <button 
                        className="traditional-folklore-download-btn"
                        onClick={() => handleDownload(audio)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Awards - показва се САМО ако има награди */}
          {culturalAwards.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>Културни награди</h3>
                <p>Признание за нашата фолклорна дейност</p>
              </div>
              
              <div className="traditional-folklore-awards">
                {culturalAwards.map((award, index) => (
                  <div key={index} className="traditional-folklore-award-card">
                    <div className="traditional-folklore-award-icon">
                      <FontAwesomeIcon icon={faCrown} />
                    </div>
                    <div className="traditional-folklore-award-content">
                      <h4>{award.name}</h4>
                      <p>{award.description}</p>
                      <div className="traditional-folklore-award-details">
                        <span className="traditional-folklore-award-year">{award.year}</span>
                        <span className="traditional-folklore-award-by">{award.awardedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="traditional-folklore-cta">
          <div className="traditional-folklore-cta-content">
            <h3>Присъединете се към фолклорната традиция</h3>
            <p>Научете автентични български песни и танци в нашите формации</p>
            <div className="traditional-folklore-cta-buttons">
              <button 
                className="traditional-folklore-cta-primary"
                onClick={openRegistrationModal}
              >
                <FontAwesomeIcon icon={faMusic} />
                Запишете се
              </button>
              <button 
                className="traditional-folklore-cta-secondary"
                onClick={handleWatchVideos}
              >
                <FontAwesomeIcon icon={faEye} />
                Гледайте видеа
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO MODAL */}
      {isVideoModalOpen && selectedVideo && (
        <div className="traditional-folklore-video-modal">
          <div className="traditional-folklore-video-modal-overlay" onClick={closeVideoModal}></div>
          <div className="traditional-folklore-video-modal-container">
            <button className="traditional-folklore-video-modal-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-folklore-video-player">
              <video 
                controls 
                autoPlay
                width="100%"
                poster={selectedVideo.thumbnail}
              >
                <source src={selectedVideo.src} type="video/mp4" />
                Вашият браузър не поддържа video елемента.
              </video>
            </div>
            
            <div className="traditional-folklore-video-modal-info">
              <h3>{selectedVideo.caption}</h3>
              <p>{selectedVideo.alt}</p>
              <div className="traditional-folklore-video-modal-actions">
                <button 
                  className="traditional-folklore-modal-btn primary"
                  onClick={() => handleDownload(selectedVideo)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Изтегли
                </button>
                <button 
                  className="traditional-folklore-modal-btn secondary"
                  onClick={() => handleShare(selectedVideo)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  Сподели
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {isRegistrationModalOpen && (
        <div className="traditional-folklore-registration-modal">
          <div className="traditional-folklore-registration-modal-overlay" onClick={closeRegistrationModal}></div>
          <div className="traditional-folklore-registration-modal-container">
            <button className="traditional-folklore-registration-modal-close" onClick={closeRegistrationModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-folklore-registration-header">
              <FontAwesomeIcon icon={faMusic} />
              <h3>Запишете се за фолклорни дейности</h3>
              <p>Присъединете се към нашите автентични български традиции</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="traditional-folklore-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Заявката е изпратена!</h4>
                <p>Благодарим ви! Ще се свържем с вас скоро за потвърждение.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-folklore-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="traditional-folklore-registration-form">
                <div className="traditional-folklore-form-row">
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={registrationForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={registrationForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="traditional-folklore-form-row">
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="phone">
                      <FontAwesomeIcon icon={faPhone} />
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={registrationForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="age">
                      <FontAwesomeIcon icon={faUsers} />
                      Възраст
                    </label>
                    <input
                      type="number"
                      id="age"
                      value={registrationForm.age}
                      onChange={(e) => handleFormChange('age', e.target.value)}
                      placeholder="Въведете вашата възраст"
                    />
                  </div>
                </div>
                
                <div className="traditional-folklore-form-row">
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="experience">
                      <FontAwesomeIcon icon={faAward} />
                      Опит във фолклора
                    </label>
                    <select
                      id="experience"
                      value={registrationForm.experience}
                      onChange={(e) => handleFormChange('experience', e.target.value)}
                    >
                      <option value="">Изберете опит</option>
                      <option value="beginner">Начинаещ</option>
                      <option value="intermediate">Средно ниво</option>
                      <option value="advanced">Напреднал</option>
                      <option value="professional">Професионалист</option>
                    </select>
                  </div>
                  
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="activity">
                      <FontAwesomeIcon icon={faTheaterMasks} />
                      Предпочитана дейност
                    </label>
                    <select
                      id="activity"
                      value={registrationForm.activity}
                      onChange={(e) => handleFormChange('activity', e.target.value)}
                    >
                      <option value="">Изберете дейност</option>
                      {folkloreActivities.map((activity, index) => (
                        <option key={index} value={activity.name}>{activity.name}</option>
                      ))}
                      <option value="any">Каквото е подходящо</option>
                    </select>
                  </div>
                </div>
                
                <div className="traditional-folklore-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Допълнително съобщение
                  </label>
                  <textarea
                    id="message"
                    value={registrationForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    placeholder="Разкажете ни повече за вашия интерес към фолклора..."
                    rows="4"
                  />
                </div>
                
                <div className="traditional-folklore-form-actions">
                  <button 
                    type="submit" 
                    className="traditional-folklore-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявката'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeRegistrationModal}
                    className="traditional-folklore-cancel-btn"
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

export default TraditionalFolklore;