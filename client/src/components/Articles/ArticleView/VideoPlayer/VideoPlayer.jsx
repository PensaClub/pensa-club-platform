import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faExpand,
  faVolumeUp,
  faVolumeMute,
  faCog,
  faClosedCaptioning,
  faDownload,
  faForward,
  faBackward
} from '@fortawesome/free-solid-svg-icons';
import './videoPlayer.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VideoPlayer = ({ src, thumbnail, alt, subtitles = [], downloadUrl = null, allowDownload = false }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const volumeBarRef = useRef(null);

  // За обработка на YouTube връзки
  const isYouTubeLink = src && typeof src === 'string' && src.includes('youtube.com');
  const youtubeVideoId = isYouTubeLink ?
    src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1] :
    null;

  // Форматиране на време в mm:ss формат
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (isYouTubeLink) {
      // За YouTube видеа логиката е различна
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const changeVolume = (e) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const pos = 1 - ((e.clientY - rect.top) / volumeBarRef.current.offsetHeight);
      const volumeValue = Math.max(0, Math.min(1, pos));

      setVolume(volumeValue);
      if (videoRef.current) {
        videoRef.current.volume = volumeValue;
        if (volumeValue === 0) {
          setIsMuted(true);
          videoRef.current.muted = true;
        } else {
          setIsMuted(false);
          videoRef.current.muted = false;
        }
      }
    }
  };

  const fullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  const updateProgress = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const seek = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / progressBar.offsetWidth;

    if (videoRef.current && !isNaN(pos) && isFinite(pos) && isFinite(videoRef.current.duration)) {
      const newTime = pos * videoRef.current.duration;
      if (isFinite(newTime)) {
        videoRef.current.currentTime = newTime;
      }
    }
  };
  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10; // Пропускаме 10 секунди напред
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10; // Пропускаме 10 секунди назад
    }
  };

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  const selectSubtitle = (subtitle) => {
    setSelectedSubtitle(subtitle);
    setShowSettings(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (isYouTubeLink && youtubeVideoId) {
    return (
      <div className="video-player-container youtube-container">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
          title={alt || t('articles.articleVideoPlayer.youtubePlayer')}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div
      className="video-player-container"
      onMouseMove={handleMouseMove}
    >
      <div className="video-wrapper">
        {(!isVideoLoaded || !isPlaying) && thumbnail && (
          <div className="video-thumbnail-wrapper" onClick={togglePlay}>
            <img
              src={thumbnail}
              alt={alt}
              className="video-thumbnail"
            />
            <div className="video-play-overlay">
              <FontAwesomeIcon icon={faPlay} className="play-icon" />
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={src}
          className="video-element"
          onTimeUpdate={updateProgress}
          onLoadedData={handleVideoLoad}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        >
          {subtitles.map((subtitle, index) => (
            <track
              key={index}
              kind="subtitles"
              src={subtitle.src}
              srcLang={subtitle.lang}
              label={subtitle.label}
              default={index === 0}
            />
          ))}
        </video>

        {showSubtitles && selectedSubtitle && (
          <div className="subtitles-container">
            {/* Тук ще се показват субтитрите */}
          </div>
        )}
      </div>

      <div className={`video-controls ${showControls || !isPlaying ? 'visible' : 'hidden'}`}>
        <div className="progress-container">
          <div className="progress-bar" onClick={seek}>
            <div
              className="progress-filled"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span> / </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="controls-buttons">
          <button className="control-button" onClick={skipBackward} title={t('articles.articleVideoPlayer.back10Seconds')}>
            <FontAwesomeIcon icon={faBackward} />
          </button>

          <button className="control-button" onClick={togglePlay} title={isPlaying ? t('articles.articleVideoPlayer.pause') : t('articles.articleVideoPlayer.play')}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>

          <button className="control-button" onClick={skipForward} title={t('articles.articleVideoPlayer.forward10Seconds')}>
            <FontAwesomeIcon icon={faForward} />
          </button>

          <div className="volume-container">
            <button className="control-button" onClick={toggleMute} title={isMuted ? t('articles.articleVideoPlayer.unmute') : t('articles.articleVideoPlayer.mute')}>
              <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
            </button>

            <div className="volume-slider-container">
              <div
                className="volume-slider"
                ref={volumeBarRef}
                onClick={changeVolume}
              >
                <div
                  className="volume-level"
                  style={{ height: `${volume * 100}%` }}
                />
              </div>
            </div>
          </div>

          {subtitles.length > 0 && (
            <button
              className={`control-button ${showSubtitles ? 'active' : ''}`}
              onClick={toggleSubtitles}
              title={t('articles.articleVideoPlayer.subtitles')}
            >
              <FontAwesomeIcon icon={faClosedCaptioning} />
            </button>
          )}

          <div className="settings-container">
            <button
              className="control-button"
              onClick={() => setShowSettings(!showSettings)}
              title={t('articles.articleVideoPlayer.settings')}
            >
              <FontAwesomeIcon icon={faCog} />
            </button>

            {showSettings && (
              <div className="settings-menu">
                <div className="settings-section">
                  <h4>{t('articles.articleVideoPlayer.speed')}</h4>
                  <div className="speed-options">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        className={`speed-button ${playbackSpeed === speed ? 'active' : ''}`}
                        onClick={() => changePlaybackSpeed(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {subtitles.length > 0 && (
                  <div className="settings-section">
                    <h4>{t('articles.articleVideoPlayer.subtitles')}</h4>
                    <div className="subtitle-options">
                      <button
                        className={`subtitle-button ${selectedSubtitle === null ? 'active' : ''}`}
                        onClick={() => selectSubtitle(null)}
                      >
                        {t('articles.articleVideoPlayer.subtitlesOff')}
                      </button>
                      {subtitles.map((subtitle, index) => (
                        <button
                          key={index}
                          className={`subtitle-button ${selectedSubtitle === subtitle ? 'active' : ''}`}
                          onClick={() => selectSubtitle(subtitle)}
                        >
                          {subtitle.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="control-button" onClick={fullScreen} title={t('articles.articleVideoPlayer.fullScreen')}>
            <FontAwesomeIcon icon={faExpand} />
          </button>

          {allowDownload && downloadUrl && (
            <Link
              to={downloadUrl}
              download
              className="control-button download-button"
              title={t('articles.articleVideoPlayer.download')}
            >
              <FontAwesomeIcon icon={faDownload} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
