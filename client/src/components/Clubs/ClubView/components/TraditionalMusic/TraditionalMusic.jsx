import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic,
  faPlay,
  faPause,
  faDownload,
  faVideo,
  faUsers,
  faCalendarAlt,
  faAward,
  faClock,
  faVolumeUp,
  faShare,
  faTimes,
  faStepForward,
  faStepBackward,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import './traditionalMusic.css';

export const TraditionalMusic = ({ club }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  const audioRef = useRef(null);

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Извличаме САМО реални данни от клуба
  const audioFiles = club.media?.audioFiles || [];
  const videos = club.media?.videos || [];
  const regularActivities = club.activities?.regular || [];
  const allEvents = club.activities?.events || [];
  const awards = club.achievements?.awards || [];

  // Филтрираме музикални дейности
  const musicActivities = regularActivities.filter(activity => 
    activity.name?.toLowerCase().includes('хор') ||
    activity.name?.toLowerCase().includes('музик') ||
    activity.name?.toLowerCase().includes('песни') ||
    activity.name?.toLowerCase().includes('оркестър') ||
    activity.name?.toLowerCase().includes('ансамбъл')
  );

  // Филтрираме музикални събития
  const musicEvents = allEvents.filter(event =>
    event.title?.toLowerCase().includes('концерт') ||
    event.title?.toLowerCase().includes('музик') ||
    event.title?.toLowerCase().includes('песни') ||
    event.title?.toLowerCase().includes('хор') ||
    event.type === 'cultural'
  );

  // Филтрираме музикални видеа
  const musicVideos = videos.filter(video =>
    video.caption?.toLowerCase().includes('музик') ||
    video.caption?.toLowerCase().includes('песен') ||
    video.caption?.toLowerCase().includes('хор') ||
    video.caption?.toLowerCase().includes('концерт') ||
    video.alt?.toLowerCase().includes('музик') ||
    video.alt?.toLowerCase().includes('песен')
  );

  // Филтрираме награди за музика
  const musicAwards = awards.filter(award =>
    award.name?.toLowerCase().includes('музик') ||
    award.name?.toLowerCase().includes('песен') ||
    award.name?.toLowerCase().includes('хор') ||
    award.name?.toLowerCase().includes('култур') ||
    award.name?.toLowerCase().includes('фолклор')
  );

  // Проверяваме дали има РЕАЛНО съдържание за показване
  const hasMusicContent = 
    audioFiles.length > 0 ||
    musicActivities.length > 0 ||
    musicEvents.length > 0 ||
    musicVideos.length > 0 ||
    musicAwards.length > 0;

  if (!hasMusicContent) {
    return null;
  }

  // Audio Player функции
  const playAudio = (audioFile, index) => {
    if (currentAudio === audioFile.src && isPlaying) {
      pauseAudio();
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = audioFile.src;
      audioRef.current.play();
      setCurrentAudio(audioFile.src);
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const nextTrack = () => {
    if (audioFiles.length > 1) {
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      playAudio(audioFiles[nextIndex], nextIndex);
    }
  };

  const prevTrack = () => {
    if (audioFiles.length > 1) {
      const prevIndex = (currentTrackIndex - 1 + audioFiles.length) % audioFiles.length;
      playAudio(audioFiles[prevIndex], prevIndex);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Download функция
  const handleAudioDownload = async (audioFile) => {
    try {
      const response = await fetch(audioFile.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${audioFile.caption || 'audio'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Грешка при изтегляне:', error);
      alert('Възникна грешка при изтеглянето на аудиото');
    }
  };

  // Video функции
  const handleVideoPlay = (video) => {
    setCurrentVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideo(null);
  };

  const handleShare = (item) => {
    const text = item.caption || item.title || item.name || 'Музика от клуба';
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: text,
        text: item.alt || item.description || '',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Линкът е копиран в клипборда!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDayName = (day) => {
    const days = {
      'понеделник': 'Понеделник',
      'вторник': 'Вторник', 
      'сряда': 'Сряда',
      'четвъртък': 'Четвъртък',
      'петък': 'Петък',
      'събота': 'Събота',
      'неделя': 'Неделя'
    };
    return days[day?.toLowerCase()] || day;
  };

  return (
    <section id="traditional-music" className="traditional-music-main-section">
      <div className="traditional-music-container">
        
        {/* Header */}
        <div className="traditional-music-header">
          <div className="traditional-music-badge">
            <FontAwesomeIcon icon={faMusic} />
            <span>Музика и песни</span>
          </div>
          <h2 className="traditional-music-title">Звуците на традицията</h2>
          <p className="traditional-music-subtitle">
            Съхраняваме и представяме музикалното наследство на българската култура
          </p>
        </div>

        <div className="traditional-music-main-grid">
          
          {/* Audio Player - показва се САМО ако има аудио файлове */}
          {audioFiles.length > 0 && (
            <div className="traditional-music-section">
              <div className="traditional-music-section-header">
                <FontAwesomeIcon icon={faVolumeUp} />
                <h3>Аудио записи</h3>
                <p>Слушайте нашите музикални изпълнения</p>
              </div>
              
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={nextTrack}
                style={{ display: 'none' }}
              />

              <div className="traditional-music-player">
                {audioFiles.map((audioFile, index) => (
                  <div 
                    key={index} 
                    className={`traditional-music-track ${currentAudio === audioFile.src ? 'active' : ''}`}
                  >
                    <div className="traditional-music-track-info">
                      <h4>{audioFile.caption}</h4>
                      {audioFile.alt && <p>{audioFile.alt}</p>}
                      {audioFile.duration && (
                        <span className="traditional-music-duration">
                          <FontAwesomeIcon icon={faClock} />
                          {audioFile.duration}
                        </span>
                      )}
                    </div>
                    <div className="traditional-music-track-controls">
                      <button 
                        className="traditional-music-play-btn"
                        onClick={() => playAudio(audioFile, index)}
                      >
                        <FontAwesomeIcon icon={
                          currentAudio === audioFile.src && isPlaying ? faPause : faPlay
                        } />
                      </button>
                      <button 
                        className="traditional-music-download-btn"
                        onClick={() => handleAudioDownload(audioFile)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <button 
                        className="traditional-music-share-btn"
                        onClick={() => handleShare(audioFile)}
                      >
                        <FontAwesomeIcon icon={faShare} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Audio Controls - показва се само ако се възпроизвежда аудио */}
              {currentAudio && (
                <div className="traditional-music-controls">
                  <div className="traditional-music-track-title">
                    {audioFiles[currentTrackIndex]?.caption}
                  </div>
                  <div className="traditional-music-progress-container">
                    <span className="traditional-music-time">{formatTime(currentTime)}</span>
                    <div 
                      className="traditional-music-progress-bar"
                      onClick={handleSeek}
                    >
                      <div 
                        className="traditional-music-progress"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="traditional-music-time">{formatTime(duration)}</span>
                  </div>
                  <div className="traditional-music-control-buttons">
                    {audioFiles.length > 1 && (
                      <button onClick={prevTrack}>
                        <FontAwesomeIcon icon={faStepBackward} />
                      </button>
                    )}
                    <button onClick={isPlaying ? pauseAudio : () => playAudio(audioFiles[currentTrackIndex], currentTrackIndex)}>
                      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                    </button>
                    {audioFiles.length > 1 && (
                      <button onClick={nextTrack}>
                        <FontAwesomeIcon icon={faStepForward} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Music Activities - показва се САМО ако има музикални дейности */}
          {musicActivities.length > 0 && (
            <div className="traditional-music-section">
              <div className="traditional-music-section-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>Музикални формации</h3>
                <p>Нашите редовни музикални дейности</p>
              </div>
              
              <div className="traditional-music-activities">
                {musicActivities.map((activity, index) => (
                  <div key={index} className="traditional-music-activity-card">
                    <div className="traditional-music-activity-icon">
                      <FontAwesomeIcon icon={faMicrophone} />
                    </div>
                    <div className="traditional-music-activity-content">
                      <h4>{activity.name}</h4>
                      <div className="traditional-music-activity-schedule">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span><strong>{getDayName(activity.day)}</strong> от {activity.time}</span>
                      </div>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      <div className="traditional-music-activity-details">
                        {activity.instructor && (
                          <div className="traditional-music-instructor">
                            <FontAwesomeIcon icon={faMicrophone} />
                            <span>Ръководител: {activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="traditional-music-participants">
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

          {/* Music Events - показва се САМО ако има музикални събития */}
          {musicEvents.length > 0 && (
            <div className="traditional-music-section">
              <div className="traditional-music-section-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>Музикални събития</h3>
                <p>Концерти и музикални мероприятия</p>
              </div>
              
              <div className="traditional-music-events">
                {musicEvents.map((event, index) => (
                  <div key={index} className="traditional-music-event-card">
                    <div className="traditional-music-event-icon">
                      <FontAwesomeIcon icon={faMusic} />
                    </div>
                    <div className="traditional-music-event-content">
                      <h4>{event.title}</h4>
                      <div className="traditional-music-event-date">
                        {formatDate(event.date)}
                        {event.time && ` в ${event.time}`}
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      <div className="traditional-music-event-meta">
                        {event.participants && (
                          <span className="traditional-music-event-participants">
                            <FontAwesomeIcon icon={faUsers} />
                            {event.participants} участници
                          </span>
                        )}
                        <span className="traditional-music-event-type">{event.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Music Videos - показва се САМО ако има музикални видеа */}
          {musicVideos.length > 0 && (
            <div className="traditional-music-section">
              <div className="traditional-music-section-header">
                <FontAwesomeIcon icon={faVideo} />
                <h3>Видео записи</h3>
                <p>Гледайте нашите музикални изпълнения</p>
              </div>
              
              <div className="traditional-music-videos">
                {musicVideos.map((video, index) => (
                  <div key={index} className="traditional-music-video-card">
                    <div className="traditional-music-video-thumbnail">
                      <img src={video.thumbnail} alt={video.alt} />
                      <div 
                        className="traditional-music-play-overlay"
                        onClick={() => handleVideoPlay(video)}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </div>
                      {video.duration && (
                        <div className="traditional-music-video-duration">{video.duration}</div>
                      )}
                    </div>
                    <div className="traditional-music-video-info">
                      <h4>{video.caption}</h4>
                      <p>{video.alt}</p>
                      <div className="traditional-music-video-meta">
                        {video.type && (
                          <span className="traditional-music-video-type">{video.type}</span>
                        )}
                        <div className="traditional-music-video-actions">
                          <button 
                            className="traditional-music-video-btn"
                            onClick={() => handleVideoPlay(video)}
                          >
                            <FontAwesomeIcon icon={faPlay} />
                            Гледай
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Music Awards - показва се САМО ако има награди за музика */}
          {musicAwards.length > 0 && (
            <div className="traditional-music-section">
              <div className="traditional-music-section-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>Музикални постижения</h3>
                <p>Нашите награди в областта на музиката</p>
              </div>
              
              <div className="traditional-music-awards">
                {musicAwards.map((award, index) => (
                  <div key={index} className="traditional-music-award-card">
                    <div className="traditional-music-award-icon">
                      <FontAwesomeIcon icon={faAward} />
                    </div>
                    <div className="traditional-music-award-content">
                      <h4>{award.name}</h4>
                      {award.description && <p>{award.description}</p>}
                      <div className="traditional-music-award-details">
                        {award.year && (
                          <span className="traditional-music-award-year">{award.year}</span>
                        )}
                        {award.awardedBy && (
                          <span className="traditional-music-award-by">{award.awardedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ВИДЕО МОДАЛ */}
      {isVideoModalOpen && currentVideo && (
        <div className="traditional-music-video-modal">
          <div className="traditional-music-video-modal-overlay" onClick={closeVideoModal}></div>
          <div className="traditional-music-video-modal-container">
            <button className="traditional-music-video-modal-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-music-video-player">
              <video 
                controls 
                autoPlay
                width="100%"
                poster={currentVideo.thumbnail}
              >
                <source src={currentVideo.src} type="video/mp4" />
                Вашият браузър не поддържа video елемента.
              </video>
            </div>
            
            <div className="traditional-music-video-modal-info">
              <h3>{currentVideo.caption}</h3>
              {currentVideo.alt && <p>{currentVideo.alt}</p>}
              <div className="traditional-music-video-modal-actions">
                <button 
                  className="traditional-music-modal-btn secondary"
                  onClick={() => handleShare(currentVideo)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  Сподели
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalMusic;