import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faImage, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './videoThumbnailGenerator.css';

const VideoThumbnailGenerator = ({ videoFile, onThumbnailGenerated }) => {
  const { t } = useTranslation('content');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // При зареждане на видеото, запазваме продължителността му
  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      // Задаваме началната позиция на 3 секунди или в средата на видеото
      const initialTime = Math.min(3, videoRef.current.duration / 2);
      videoRef.current.currentTime = initialTime;
      setCurrentTime(initialTime);
    }
  };

  // При промяна на плъзгача, преместваме времевата линия на видеото
  const handleTimelineChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Създаваме thumbnail от текущия кадър
  const captureCurrentFrame = () => {
    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);

      // Създаваме canvas елемент със същите размери като видеото
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Рисуваме текущия кадър
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Конвертираме canvas в Blob вместо base64
      canvas.toBlob((blob) => {
        // Създаваме файл от blob
        const fileName = `thumbnail-${Date.now()}.jpg`;
        const thumbnailFile = new File([blob], fileName, { type: 'image/jpeg' });

        // Показваме превю
        const thumbnailUrl = URL.createObjectURL(blob);
        setThumbnailPreview(thumbnailUrl);

        // Връщаме файла на родителския компонент
        onThumbnailGenerated(thumbnailFile);

        setIsProcessing(false);
      }, 'image/jpeg', 0.8);
    }
  };

  // Форматираме времето във формат MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Обработваме създаване на видео източник
  useEffect(() => {
    if (videoRef.current && videoFile) {
      const videoUrl = URL.createObjectURL(videoFile);
      videoRef.current.src = videoUrl;

      // Автоматично зареждаме видеото
      videoRef.current.load();
    }

    return () => {
      // Почистваме URL обекта при демонтиране
      if (videoRef.current && videoRef.current.src && videoRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoRef.current.src);
      }

      // Почистваме thumbnail превю URL
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [videoFile]);

  return (
    <div className="thumbnail-generator">
      <h4>{t('articles.thumbnailGenerator.title')}</h4>

      <div className="video-player-container">
        <video
          ref={videoRef}
          onLoadedMetadata={handleVideoLoad}
          onLoadedData={handleVideoLoad}
          className="thumbnail-video-player"
          controls
          muted
        />
      </div>

      {videoDuration > 0 && (
        <div className="video-timeline">
          <div className="timeline-controls">
            <div className="time-display start-time">
              {formatTime(currentTime)}
            </div>
            <input
              type="range"
              min="0"
              max={videoDuration}
              step="0.1"
              value={currentTime}
              onChange={handleTimelineChange}
              className="timeline-slider"
            />
            <div className="time-display end-time">
              {formatTime(videoDuration)}
            </div>
          </div>

          <button
            onClick={captureCurrentFrame}
            className="capture-frame-btn"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} spin /> {t('articles.thumbnailGenerator.processing')}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCamera} /> {t('articles.thumbnailGenerator.useThisFrame')}
              </>
            )}
          </button>
        </div>
      )}

      {/* Скрит canvas за генериране на изображения */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {thumbnailPreview && (
        <div className="thumbnail-preview">
          <h5>{t('articles.thumbnailGenerator.selectedThumbnail')}:</h5>
          <div className="preview-image-container">
            <img src={thumbnailPreview} alt={t('articles.thumbnailGenerator.selectedThumbnail')} />
          </div>
          <p className="success-message">
            <span className="success-icon">✓</span> {t('articles.thumbnailGenerator.readyToUpload')}
          </p>
        </div>
      )}

      <div className="thumbnail-help">
        <p>
          <FontAwesomeIcon icon={faImage} /> <strong>{t('articles.thumbnailGenerator.howTo')}</strong>
        </p>
        <ol>
          <li>{t('articles.thumbnailGenerator.step1')}</li>
          <li>{t('articles.thumbnailGenerator.step2')}</li>
          <li>{t('articles.thumbnailGenerator.step3')}</li>
          <li>{t('articles.thumbnailGenerator.step4')}</li>
        </ol>
      </div>
    </div>
  );
};

export default VideoThumbnailGenerator;
