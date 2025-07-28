import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faArrowLeft,
  faEye,
  faEdit,
  faShare
} from "@fortawesome/free-solid-svg-icons";
import "./articlePreview.css";
import VideoPlayer from "../../ArticleView/VideoPlayer/VideoPlayer";
import ScrollToTop from "../../../ScrollToTop/ScrollToTop";
import ImageSlider from "../../ArticleView/ImageSlider/ImageSlider";
import { useTranslation } from 'react-i18next';

const ArticlePreview = ({ article, onBack, mediaFiles, convertEditorToHtml }) => {
  const { t } = useTranslation();
  const [activeSectionSlides, setActiveSectionSlides] = useState({});

  const tempUrlsRef = React.useRef({
    mainImages: [],
    sectionImages: {}
  });

  useEffect(() => {
    return () => {
      if (Array.isArray(tempUrlsRef.current.mainImages)) {
        tempUrlsRef.current.mainImages.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Грешка при освобождаване на URL:", error);
          }
        });
      }

      if (tempUrlsRef.current.sectionImages) {
        Object.values(tempUrlsRef.current.sectionImages).forEach(urls => {
          if (Array.isArray(urls)) {
            urls.forEach(url => {
              try {
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error("Грешка при освобождаване на URL:", error);
              }
            });
          }
        });
      }
    };
  }, []);

  const handleBackToForm = () => {
    onBack();
  };

  const handleEditArticle = () => {
    onBack();
  };

  const handleSectionSlideChange = (sectionIndex, slideIndex) => {
    setActiveSectionSlides(prev => ({
      ...prev,
      [sectionIndex]: slideIndex
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  const prepareMediaUrls = () => {
    let sources = [];

    if (mediaFiles?.mainImage && mediaFiles.mainImage.length > 0) {
      const tempUrls = [];
      mediaFiles.mainImage.forEach(file => {
        if (file instanceof File || file instanceof Blob) {
          try {
            const tempUrl = URL.createObjectURL(file);
            tempUrls.push(tempUrl);
            tempUrlsRef.current.mainImages.push(tempUrl);
          } catch (error) {
            console.error("Грешка при създаване на URL за главно изображение:", error);
          }
        }
      });

      if (tempUrls.length > 0) {
        return tempUrls;
      }
    }

    if (article?.mainImage?.sources && article.mainImage.sources.length > 0) {
      return [...article.mainImage.sources];
    }

    return sources;
  };

  const getVideoUrl = () => {
    if (mediaFiles?.mainImage && mediaFiles.mainImage.length > 0 && mediaFiles.mainImage[0]) {
      if (mediaFiles.mainImage[0] instanceof File || mediaFiles.mainImage[0] instanceof Blob) {
        try {
          const tempUrl = URL.createObjectURL(mediaFiles.mainImage[0]);
          tempUrlsRef.current.mainImages.push(tempUrl);
          return tempUrl;
        } catch (error) {
          console.error("Грешка при създаване на URL за видео:", error);
          return null;
        }
      }
    }

    if (article?.mainImage?.videoUrl && article.mainImage.videoUrl.trim()) {
      return article.mainImage.videoUrl;
    }

    if (article?.mainImage?.sources && article.mainImage.sources.length > 0) {
      return article.mainImage.sources[0];
    }

    return null;
  };

  const renderMainMedia = () => {
    if (!article?.mainImage) return null;

    const sources = prepareMediaUrls();

    if (article.mainImage.type === 'slider' && sources.length > 1) {
      return (
        <div className="main-media-container">
          <ImageSlider
            images={sources}
            alt={article.mainImage.alt ? convertEditorToHtml(article.mainImage.alt) : t('articles.preview.sliderImage')}
          />
          {article.mainImage.caption && (
            <div className="main-image-caption-container">
              <div className="main-image-caption" 
                dangerouslySetInnerHTML={{ __html: convertEditorToHtml(article.mainImage.caption) }} />
            </div>
          )}
        </div>
      );
    } else if (article.mainImage.type === 'video') {
      const videoSrc = getVideoUrl();
      if (videoSrc) {
        return (
          <div className="main-media-container">
            <VideoPlayer
              src={videoSrc}
              thumbnail={article.mainImage.thumbnail}
              alt={convertEditorToHtml(article.mainImage.alt)}
              subtitles={article.mainImage.subtitles || []}
              downloadUrl={article.mainImage.downloadUrl}
              allowDownload={article.mainImage.allowDownload}
            />
            {article.mainImage.caption && (
              <div className="main-image-caption-container">
                <div className="main-image-caption" 
                  dangerouslySetInnerHTML={{ __html: convertEditorToHtml(article.mainImage.caption) }} />
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="article-main-video">
            <img
              src={article.mainImage.thumbnail || "https://via.placeholder.com/800x450?text=Видео+превю"}
              alt={t('articles.preview.videoPreview')}
            />
            <div className="video-play-button">
              <span>▶</span>
            </div>
          </div>
        );
      }
    } else if (sources.length > 0) {
      return (
        <figure className="article-main-image">
          <img 
            src={sources[0]} 
            alt={article.mainImage.alt ? convertEditorToHtml(article.mainImage.alt) : t('articles.preview.mainImage')} 
          />
          {article.mainImage.caption && (
            <figcaption dangerouslySetInnerHTML={{ __html: convertEditorToHtml(article.mainImage.caption) }} />
          )}
        </figure>
      );
    }

    return null;
  };

  const getSectionImageSources = (section, index) => {
    const sources = [];

    let existingImages = [];
    if (section.image) {
      if (Array.isArray(section.image)) {
        existingImages = section.image;
      } else if (section.image.src) {
        existingImages = [section.image];
      }
    }

    if (mediaFiles?.sectionImages && mediaFiles.sectionImages[index]) {
      const files = Array.isArray(mediaFiles.sectionImages[index])
        ? mediaFiles.sectionImages[index]
        : [mediaFiles.sectionImages[index]];

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (file instanceof File || file instanceof Blob) {
            try {
              const tempUrl = URL.createObjectURL(file);

              if (!tempUrlsRef.current.sectionImages[index]) {
                tempUrlsRef.current.sectionImages[index] = [];
              }
              tempUrlsRef.current.sectionImages[index].push(tempUrl);

              let altText = t('articles.preview.temporaryImage');
              let captionHtml = null;

              if (existingImages[i]) {
                if (existingImages[i].alt) {
                  try {
                    altText = typeof existingImages[i].alt === 'object'
                      ? convertEditorToHtml(existingImages[i].alt)
                      : String(existingImages[i].alt);
                  } catch (error) {
                    console.error(`Грешка при запазване на alt за файл ${i}:`, error);
                  }
                }

                if (existingImages[i].caption) {
                  try {
                    captionHtml = typeof existingImages[i].caption === 'object'
                      ? convertEditorToHtml(existingImages[i].caption)
                      : String(existingImages[i].caption);
                  } catch (error) {
                    console.error(`Грешка при запазване на caption за файл ${i}:`, error);
                  }
                }
              }

              sources.push({
                src: tempUrl,
                alt: altText,
                caption: captionHtml
              });

            } catch (error) {
              console.error(`Грешка при обработка на файл:`, error);
            }
          }
        }

        if (sources.length > 0) {
          return sources;
        }
      }
    }

    if (existingImages.length > 0) {
      for (let i = 0; i < existingImages.length; i++) {
        const img = existingImages[i];

        if (img && img.src) {
          let altText = "";
          try {
            if (img.alt) {
              altText = typeof img.alt === 'object'
                ? convertEditorToHtml(img.alt)
                : String(img.alt);
            } else {
              altText = t('articles.preview.sectionImage', { number: index + 1 });
            }
          } catch (error) {
            altText = t('articles.preview.sectionImage', { number: index + 1 });
          }

          let captionHtml = null;
          try {
            if (img.caption) {
              captionHtml = typeof img.caption === 'object'
                ? convertEditorToHtml(img.caption)
                : String(img.caption);
            }
          } catch (error) {
            console.error(`Грешка при обработка на caption:`, error);
          }

          sources.push({
            src: img.src,
            alt: altText,
            caption: captionHtml
          });
        }
      }
    }

    return sources;
  };

  const renderSectionImages = (section, sectionIndex) => {
    const sectionImages = getSectionImageSources(section, sectionIndex);

    if (sectionImages.length === 0) {
      return null;
    }

    if (sectionImages.length === 1) {
      const image = sectionImages[0];
      return (
        <figure className="section-figure">
          <img
            src={image.src}
            alt={image.alt || t('articles.articleView.imageFor', { title: section.title })}
          />
          {image.caption && (
            <figcaption dangerouslySetInnerHTML={{ __html: image.caption }} />
          )}
        </figure>
      );
    }

    if (sectionImages.length > 1) {
      const sectionImageUrls = sectionImages.map(img => img.src);
      return (
        <div className="section-slider-container">
          <ImageSlider
            images={sectionImageUrls}
            alt={`${t('articles.articleView.imagesFor')} ${section.title}`}
            onSlideChange={(slideIndex) => handleSectionSlideChange(sectionIndex, slideIndex)}
          />

          {sectionImages[activeSectionSlides[sectionIndex] || 0]?.caption && (
            <div className="single-slider-caption-container">
              <div className="single-slide-caption">
                <div className="single-caption-content-view"
                  dangerouslySetInnerHTML={{
                    __html: sectionImages[activeSectionSlides[sectionIndex] || 0].caption
                  }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  const renderHtml = (content) => {
    if (!content) return null;

    const html = typeof content === 'string'
      ? content
      : convertEditorToHtml(content);

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!article) {
    return (
      <div className="article-preview-loading">
        <p>{t('articles.preview.noData')}</p>
      </div>
    );
  }

  return (
    <div className="article-preview-container">
      {/* Preview Header - Same as ProjectPreview */}
      <div className="article-preview-header">
        <div className="container">
          <div className="article-preview-header-content">
            <div className="article-preview-header-left">
              <button
                className="article-preview-back-btn"
                onClick={handleBackToForm}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                {t('articles.preview.backToForm')}
              </button>
              
              <div className="article-preview-header-info">
                <h1 className="article-preview-header-title">
                  <FontAwesomeIcon icon={faEye} />
                  {t('articles.preview.previewMode')}
                </h1>
                <p className="article-preview-header-subtitle">
                  {t('articles.preview.previewDescription')}
                </p>
              </div>
            </div>

            <div className="article-preview-header-actions">
              <button
                className="article-preview-action-btn edit"
                onClick={handleEditArticle}
              >
                <FontAwesomeIcon icon={faEdit} />
                {t('articles.preview.editArticle')}
              </button>

              {/* Може да добавиш publish бутон ако е нужен */}
              {/* 
              <button
                className="article-preview-action-btn publish"
                onClick={handlePublishArticle}
              >
                <FontAwesomeIcon icon={faShare} />
                {t('articles.preview.publishArticle')}
              </button>
              */}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Watermark */}
      <div className="article-preview-watermark">{t('articles.preview.preview')}</div>

      {/* ArticleView Structure */}
      <div className="article-main">
        {/* <div className="articles-hero-view">
          <div className="hero-content-view"></div>
        </div> */}
        
        <div className="article-container-preview">
          <div className="article-layout-preview">
            <main className="article-content">
              <h1 className="article-title-view view">{article.title}</h1>
              
              <div className="article-meta-view">
                <div className="meta-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span>{article.author}</span>
                </div>
                <div className="meta-item">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(article.publishDate)}</span>
                </div>
              </div>

              {renderMainMedia()}

              <div className="article-summary-view">
                {renderHtml(article.summary)}
              </div>

              <div className="article-body-view">
                {article.sections?.map((section, index) => (
                  <section key={index} className="article-section">
                    <h2 className="section-title">{section.title}</h2>
                    <div className="section-content">
                      {renderHtml(section.content)}
                      {renderSectionImages(section, index)}
                    </div>
                  </section>
                ))}
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="article-tags-view">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="article-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      
      <ScrollToTop />
    </div>
  );
};

export default ArticlePreview;