/* eslint-disable no-useless-escape */
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
  const { t } = useTranslation('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bufferedTime, setBufferedTime] = useState(0);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  // За обработка на YouTube връзки
  const isYouTubeLink = src && typeof src === 'string' && 
  (src.includes('youtube.com') || src.includes('youtu.be'));
  
  const youtubeVideoId = isYouTubeLink ?
  src.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1] :
  null;

  // Добавяне на поддръжка за Vimeo
  const isVimeoLink = src && typeof src === 'string' && src.includes('vimeo.com');
  const vimeoId = isVimeoLink ? 
    src.match(/(?:vimeo\.com\/(?:video\/|channels\/.*\/|groups\/.*\/videos\/|album\/.*\/video\/|))?(\d+)(?:$|\/|\?)/i)?.[1] :
    null;

  // Форматиране на време
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Функция за старт/пауза на видео
  const togglePlay = (e) => {
    // Спираме разпространението на събитието и предотвратяваме стандартното действие
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Задаваме глобален флаг, който ще бъде проверен в handleUpdateArticle
    window.preventNavigationFlag = true;
    
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
  const toggleMute = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.preventNavigationFlag = true;
    
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  // Функция за промяна на силата на звука
  const handleVolumeChange = (e) => {
    e.stopPropagation();
    window.preventNavigationFlag = true;
    
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

  // Следене на буфера
  const handleBufferProgress = () => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBufferedTime(bufferedEnd);
    }
  };

  // Функция за промяна на позицията на плеъра
  const handleSeek = (e) => {
    e.stopPropagation();
    e.preventDefault();
    window.preventNavigationFlag = true;
    
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  // Функция за цял екран
  const handleFullScreen = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.preventNavigationFlag = true;
    
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
      if (video) {
        setVolume(video.volume);
        setIsMuted(video.muted);
      }
    };
    
    if (video) {
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('volumechange', handleVolumeEvent);
      video.addEventListener('progress', handleBufferProgress);
      video.addEventListener('waiting', handleBufferProgress);
    }
    
    return () => {
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('volumechange', handleVolumeEvent);
        video.removeEventListener('progress', handleBufferProgress);
        video.removeEventListener('waiting', handleBufferProgress);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Клавиатурни контроли
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (document.activeElement.tagName.toLowerCase() === 'input' || 
          document.activeElement.tagName.toLowerCase() === 'textarea') {
        return;
      }
      
      // Премахваме проверката за активен елемент - така клавишите работят навсякъде
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          window.preventNavigationFlag = true;
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          window.preventNavigationFlag = true;
          handleFullScreen();
          break;
        case 'm':
          e.preventDefault();
          window.preventNavigationFlag = true;
          toggleMute();
          break;
        case 'ArrowRight':
          e.preventDefault();
          window.preventNavigationFlag = true;
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          window.preventNavigationFlag = true;
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying]);

  // За YouTube видеа
 // Алтернативно решение - заменете YouTube iframe логиката с:
if (isYouTubeLink && youtubeVideoId) {
  return (
    <div className="html5-player-container">
      <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden'}}>
        <iframe 
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0}}
          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
          allowFullScreen
          title="YouTube video"
        ></iframe>
      </div>
    </div>
  );
}

  // За Vimeo видеа
  if (isVimeoLink && vimeoId) {
    return (
      <div className="html5-player-container">
        <iframe
          width="100%"
          height="100%"
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={alt || t('articles.videoPlayer.vimeoVideo')}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
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
      onClick={(e) => e.stopPropagation()}
    >
      {(thumbnail && !isPlaying && !isLoaded) && (
        <div className="thumbnail-container" onClick={(e) => togglePlay(e)}>
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
        onClick={(e) => togglePlay(e)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onProgress={handleBufferProgress}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        playsInline
      />

      <div className={`player-controls ${hideControls ? 'hidden' : ''}`}>
        <div className="progress-bar" onClick={handleSeek}>
          <div className="progress-background"></div>
          
          {/* Нов буфер елемент */}
          <div 
            className="progress-buffered"
            style={{ width: `${(bufferedTime / duration) * 100}%` }}
          ></div>
          
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
            <button 
              type="button" 
              onClick={(e) => togglePlay(e)} 
              className="control-button"
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            
            <div className="volume-control">
              <button 
                type="button"
                onClick={(e) => toggleMute(e)} 
                className="control-button"
              >
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
              >
                <FontAwesomeIcon icon={faDownload} />
              </Link>
            )}
            
            <button 
              type="button"
              onClick={(e) => handleFullScreen(e)} 
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