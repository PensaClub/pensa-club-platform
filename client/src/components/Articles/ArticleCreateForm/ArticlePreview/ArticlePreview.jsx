import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import "./articlePreview.css";
import VideoPlayer from "../../ArticleView/VideoPlayer/VideoPlayer";

const ArticlePreview = ({ article, onBack, mediaFiles, convertEditorToHtml }) => {
  // Форматиране на дата
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  // Подготовка на URL за медиафайлове
  const prepareMediaUrls = () => {
    let sources = [...article.mainImage.sources];
    
    // Добавяме временни URL за тъкмо качените файлове
    if (mediaFiles.mainImage.length > 0) {
      const tempUrls = mediaFiles.mainImage.map(file => URL.createObjectURL(file));
      sources = [...tempUrls, ...sources];
    }
    
    return sources;
  };

  // Получаване на URL за видео файл
  const getVideoUrl = () => {
    // За локални файлове
    if (mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && mediaFiles.mainImage[0]) {
      try {
        return URL.createObjectURL(mediaFiles.mainImage[0]);
      } catch (error) {
        console.error("Грешка при създаване на URL за видео:", error);
        return null;
      }
    }
    
    // За външни URLs
    if (article.mainImage.videoUrl && article.mainImage.videoUrl.trim()) {
      return article.mainImage.videoUrl;
    }
    
    // За вече качени видеа
    if (article.mainImage.sources && article.mainImage.sources.length > 0) {
      return article.mainImage.sources[0];
    }
    
    return null;
  };

  const renderMainMedia = () => {
    const sources = prepareMediaUrls();
    
    if (article.mainImage.type === 'slider' && sources.length > 1) {
      return (
        <div className="article-main-image">
          <img src={sources[0]} alt={article.mainImage.alt ? convertEditorToHtml(article.mainImage.alt) : "Слайдер изображение"} />
          <div className="image-slider-indicator">1 / {sources.length}</div>
        </div>
      );
    } else if (article.mainImage.type === 'video') {
      const videoSrc = getVideoUrl();
      // Добавяме проверка дали имаме валиден източник
      if (videoSrc) {
        return (
          <VideoPlayer
            src={videoSrc}
            thumbnail={article.mainImage.thumbnail}
            alt={convertEditorToHtml(article.mainImage.alt)}
            subtitles={article.mainImage.subtitles || []}
            downloadUrl={article.mainImage.downloadUrl}
            allowDownload={article.mainImage.allowDownload}
          />
        );
      } else {
        // Показваме плейсхолдър, ако нямаме видео източник
        return (
          <div className="article-main-video">
            <img 
              src={article.mainImage.thumbnail || "https://via.placeholder.com/800x450?text=Видео+превю"} 
              alt="Видео превю"
            />
            <div className="video-play-button">
              <span>▶</span>
            </div>
          </div>
        );
      }
    } else if (sources.length > 0) {
      return (
        <div className="article-main-image">
          <img src={sources[0]} alt={article.mainImage.alt ? convertEditorToHtml(article.mainImage.alt) : "Основно изображение"} />
        </div>
      );
    }
    
    return (
      <div className="article-placeholder">
        <p>Няма избрано основно изображение</p>
      </div>
    );
  };

  // Подготовка на URL за изображения в секциите
  const getSectionImageSrc = (section, index) => {
    if (mediaFiles.sectionImages && mediaFiles.sectionImages[index]) {
      return URL.createObjectURL(mediaFiles.sectionImages[index]);
    }
    
    return section.image && section.image.src ? section.image.src : null;
  };
  
  // Рендериране на HTML съдържание
  const renderHtml = (content) => {
    if (!content) return <p>Няма съдържание</p>;
    
    const html = typeof content === 'string' 
      ? content 
      : convertEditorToHtml(content);
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="article-preview-container">
      <div className="preview-header">
        <button 
          className="back-to-edit-btn" 
          onClick={onBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Назад към редактирането
        </button>
        <h3>Предпреглед на статията</h3>
      </div>
      
      <div className="preview-watermark">ПРЕДПРЕГЛЕД</div>
      
      <div className="preview-mode">
        <h1 className="article-title view">{article.title || "Заглавие на статията"}</h1>

        <div className="article-summary">
          {renderHtml(article.summary)}
        </div>
        
        <div className="article-meta">
          <div className="meta-item">
            <FontAwesomeIcon icon={faUser} />
            <span>{article.author || "Автор"}</span>
          </div>
          <div className="meta-item">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{formatDate(article.publishDate)}</span>
          </div>
        </div>
        
        {renderMainMedia()}

        <div className="article-body">
          {article.sections.map((section, index) => (
            <section key={index} className="article-section">
              <h2 className="section-title">{section.title || `Заглавие на секция ${index + 1}`}</h2>
              <div className="section-content">
                {renderHtml(section.content)}

                {(section.image || mediaFiles.sectionImages && mediaFiles.sectionImages[index]) && (
                  <figure className="section-figure">
                    <img
                      src={getSectionImageSrc(section, index) || "https://via.placeholder.com/800x450?text=Изображение+на+секцията"}
                      alt={section.image?.alt ? convertEditorToHtml(section.image.alt) : `Изображение към секция ${index + 1}`}
                    />
                    {section.image && section.image.caption && (
                      <figcaption>
                        {typeof section.image.caption === 'string' 
                          ? section.image.caption 
                          : renderHtml(section.image.caption)}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            </section>
          ))}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="article-tags">
            {article.tags.map((tag, index) => (
              <span key={index} className="article-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePreview;