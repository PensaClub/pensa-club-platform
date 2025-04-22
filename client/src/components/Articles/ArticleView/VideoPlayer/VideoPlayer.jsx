// HTML5VideoPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faExpand,
  faVolumeUp,
  faVolumeMute,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import './videoPlayer.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VideoPlayer = ({ src, thumbnail, alt, downloadUrl = null, allowDownload = false }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  // За обработка на YouTube връзки
  const isYouTubeLink = src && typeof src === 'string' && src.includes('youtube.com');
  const youtubeVideoId = isYouTubeLink ?
    src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1] :
    null;

  // Форматиране на време
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Функция за старт/пауза на видео
  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(err => {
          console.error("Грешка при стартиране на видео:", err);
        });
      } else {
        video.pause();
      }
      setIsPlaying(!video.paused);
    }
  };

  // Функция за смяна на звука
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  // Функция за промяна на силата на звука
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
      videoRef.current.muted = newVolume === 0;
    }
  };

  // Функция за промяна на текущото време
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Функция за промяна на позицията на плеъра
  const handleSeek = (e) => {
    if (videoRef.current) {
      const percentage = e.nativeEvent.offsetX / e.currentTarget.offsetWidth;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  // Функция за цял екран
  const handleFullScreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    }
  };

  // Скриване на контролите след период на неактивност
  const handleMouseMove = () => {
    setHideControls(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isPlaying) {
      timeoutRef.current = setTimeout(() => {
        setHideControls(true);
      }, 3000);
    }
  };

  // Функция за зареждане на метаданни
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
    }
  };

  // Слушане за събития от видеото
  useEffect(() => {
    const video = videoRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeEvent = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    if (video) {
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('volumechange', handleVolumeEvent);
    }
    
    return () => {
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('volumechange', handleVolumeEvent);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Клавиатурни контроли
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (document.activeElement.tagName.toLowerCase() === 'input') return;
      
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        switch (e.key) {
          case ' ':
          case 'k':
            e.preventDefault();
            togglePlay();
            break;
          case 'f':
            handleFullScreen();
            break;
          case 'm':
            toggleMute();
            break;
          case 'ArrowRight':
            if (videoRef.current) {
              videoRef.current.currentTime += 10;
            }
            break;
          case 'ArrowLeft':
            if (videoRef.current) {
              videoRef.current.currentTime -= 10;
            }
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying]);

  // За YouTube видеа
  if (isYouTubeLink && youtubeVideoId) {
    return (
      <div className="html5-player-container">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
          title={alt || t('articles.videoPlayer.youtubeVideo')}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="html5-player-container" 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setHideControls(true)}
    >
      {(thumbnail && !isPlaying && !isLoaded) && (
        <div className="thumbnail-container" onClick={togglePlay}>
          <img src={thumbnail} alt={alt || ''} className="video-thumbnail" />
          <div className="play-button-overlay">
            <FontAwesomeIcon icon={faPlay} />
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="native-video-player"
        src={src}
        poster={thumbnail}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        playsInline
      />

      <div className={`player-controls ${hideControls ? 'hidden' : ''}`}>
        <div className="progress-bar" onClick={handleSeek}>
          <div className="progress-background"></div>
          <div 
            className="progress-filled"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
          <div 
            className="progress-handle"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        
        <div className="bottom-controls">
          <div className="left-controls">
            <button onClick={togglePlay} className="control-button">
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            
            <div className="volume-control">
              <button onClick={toggleMute} className="control-button">
                <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
            
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="right-controls">
            {allowDownload && downloadUrl && (
              <Link 
                to={downloadUrl} 
                download 
                className="control-button"
                title={t('articles.videoPlayer.download')}
              >
                <FontAwesomeIcon icon={faDownload} />
              </Link>
            )}
            
            <button 
              onClick={handleFullScreen} 
              className="control-button"
              title={t('articles.videoPlayer.fullscreen')}
            >
              <FontAwesomeIcon icon={faExpand} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;