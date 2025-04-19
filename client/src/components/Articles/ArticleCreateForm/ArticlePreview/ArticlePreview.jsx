import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import "./articlePreview.css";
import VideoPlayer from "../../ArticleView/VideoPlayer/VideoPlayer";
import ScrollToTop from "../../../ScrollToTop/ScrollToTop";
import ImageSlider from "../../ArticleView/ImageSlider/ImageSlider";
import {useTranslation} from 'react-i18next';

const ArticlePreview = ({ article, onBack, mediaFiles, convertEditorToHtml }) => {
  const { t } = useTranslation();
  // Състояние за активния слайд
  const [activeSlides, setActiveSlides] = useState({});

  // Референция за съхранение на временните URL-и
  const tempUrlsRef = React.useRef({
    mainImages: [],
    sectionImages: {}
  });

  // Освобождаване на временните URL-и при размонтиране
  useEffect(() => {
    return () => {
      // Освобождаване на URL-и за основните изображения
      if (Array.isArray(tempUrlsRef.current.mainImages)) {
        tempUrlsRef.current.mainImages.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Грешка при освобождаване на URL:", error);
          }
        });
      }

      // Освобождаване на URL-и за секционни изображения
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

  // Функция за управление на активния слайд
  const handleSlideChange = (sectionIndex, slideIndex) => {
    setActiveSlides(prev => ({
      ...prev,
      [sectionIndex]: slideIndex
    }));
  };

  // Форматиране на дата
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  // Подготовка на URL за медиафайлове
  const prepareMediaUrls = () => {
    let sources = [];

    // Първо проверяваме дали имаме нови файлове
    if (mediaFiles.mainImage && mediaFiles.mainImage.length > 0) {
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

      // Ако имаме нови файлове, САМО тях връщаме
      if (tempUrls.length > 0) {
        return tempUrls;
      }
    }

    // Само ако нямаме нови файлове, взимаме от article.mainImage.sources
    if (article.mainImage.sources && article.mainImage.sources.length > 0) {
      return [...article.mainImage.sources];
    }

    return sources;
  };

  // Получаване на URL за видео файл
  const getVideoUrl = () => {
    // За локални файлове
    if (mediaFiles.mainImage && mediaFiles.mainImage.length > 0 && mediaFiles.mainImage[0]) {
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
        <div className="article-main-slider">
          <ImageSlider
            images={sources}
            alt={article.mainImage.alt ? convertEditorToHtml(article.mainImage.alt) : t('articles.preview.sliderImage')}
          />
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
        <div className="article-main-image">
          <img src={sources[0]} alt={article.mainImage.alt ? convertEditorToHtml(article.mainImage.alt) : t('articles.preview.mainImage')} />
        </div>
      );
    }

    return (
      <div className="article-placeholder">
        <p>{t('articles.preview.noMainImage')}</p>
      </div>
    );
  };

  // Новата имплементация на getSectionImageSources
  const getSectionImageSources = (section, index) => {
    console.log(`Обработка на изображения за секция ${index}`);
    const sources = [];

    // СТЪПКА 1: Извличаме текущите метаданни от section.image
    let existingImages = [];
    if (section.image) {
      if (Array.isArray(section.image)) {
        existingImages = section.image;
      } else if (section.image.src) {
        existingImages = [section.image];
      }
    }

    // СТЪПКА 2: Проверяваме за нови файлове от потребителя
    if (mediaFiles.sectionImages && mediaFiles.sectionImages[index]) {
      console.log(`Намерени нови файлове в mediaFiles за секция ${index}`);

      const files = Array.isArray(mediaFiles.sectionImages[index])
        ? mediaFiles.sectionImages[index]
        : [mediaFiles.sectionImages[index]];

      if (files.length > 0) {
        // Обработваме всеки файл
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (file instanceof File || file instanceof Blob) {
            try {
              const tempUrl = URL.createObjectURL(file);

              // Добавяме URL към референцията за по-късно почистване
              if (!tempUrlsRef.current.sectionImages[index]) {
                tempUrlsRef.current.sectionImages[index] = [];
              }
              tempUrlsRef.current.sectionImages[index].push(tempUrl);

              // КЛЮЧОВА ПРОМЯНА: Запазваме съществуващите alt и caption ако има такива
              let altText = t('articles.preview.temporaryImage');
              let captionHtml = null;

              // Опитваме се да използваме метаданни от съответния индекс в existingImages
              if (existingImages[i]) {
                // За alt
                if (existingImages[i].alt) {
                  try {
                    altText = typeof existingImages[i].alt === 'object'
                      ? convertEditorToHtml(existingImages[i].alt)
                      : String(existingImages[i].alt);
                  } catch (error) {
                    console.error(`Грешка при запазване на alt за файл ${i}:`, error);
                  }
                }

                // За caption
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

              // Добавяме към източници със запазени метаданни
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

        // Ако имаме успешно обработени файлове, връщаме резултата
        if (sources.length > 0) {
          console.log(`Връщаме ${sources.length} нови изображения със запазени метаданни`);
          return sources;
        }
      }
    }

    // СТЪПКА 3: Ако нямаме нови файлове, използваме съществуващите изображения
    if (existingImages.length > 0) {
      console.log(`Използваме ${existingImages.length} съществуващи изображения`);

      for (let i = 0; i < existingImages.length; i++) {
        const img = existingImages[i];

        if (img && img.src) {
          // Обработка на alt
          let altText = "";
          try {
            if (img.alt) {
              altText = typeof img.alt === 'object'
                ? convertEditorToHtml(img.alt)
                : String(img.alt);
            } else {
              altText = `Изображение към секция ${index + 1}`;
            }
          } catch (error) {
            console.error(`Грешка при обработка на alt:`, error);
            altText = `Изображение към секция ${index + 1}`;
          }

          // Обработка на caption
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

          // Добавяме към източници
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

  // Рендериране на HTML съдържание
  const renderHtml = (content) => {
    if (!content) return <p>{t('articles.preview.noContent')}</p>;

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
          <FontAwesomeIcon icon={faArrowLeft} />  {t('articles.preview.backToEditing')}
        </button>
        <h3>{t('articles.preview.articlePreview')}</h3>
      </div>

      <div className="preview-watermark">{t('articles.preview.preview')}</div>

      <div className="preview-mode">
        <h1 className="article-title view">{article.title || t('articles.preview.articleTitle')}</h1>

        <div className="article-summary">
          {renderHtml(article.summary)}
        </div>

        <div className="article-meta-preview">
          <div className="meta-item">
            <FontAwesomeIcon icon={faUser} />
            <span>{article.author || t('articles.preview.author')}</span>
          </div>
          <div className="meta-item">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{formatDate(article.publishDate)}</span>
          </div>
        </div>

        {renderMainMedia()}

        <div className="article-body">
          {article.sections.map((section, index) => {
            const sectionImages = getSectionImageSources(section, index);

            return (
              <section key={index} className="article-section-preview">
                <h2 className="section-title-preview">{section.title || t('articles.preview.sectionTitle', { number: index + 1 })}</h2>
                <div className="section-content-preview">
                  {renderHtml(section.content)}

                  {sectionImages.length > 0 && (
                    <div className="section-images">
                      {sectionImages.length > 1 ? (
                        // За множество изображения (слайдер)
                        <div className="slider-container-preview">
                          <ImageSlider
                            images={sectionImages.map(img => img.src)}
                            alt={t('articles.preview.sectionImage', { number: index + 1 })}
                            onSlideChange={(slideIndex) => handleSlideChange(index, slideIndex)}
                          />

                          {/* Показваме caption за текущия слайд */}
                          {sectionImages.some(img => img.caption && img.caption.trim() !== '') && (
                            <div className="slider-caption-container">
                              <div className="single-slide-caption">
                                {sectionImages[activeSlides[index] || 0]?.caption &&
                                  sectionImages[activeSlides[index] || 0]?.caption.trim() !== '<p></p>'  ? (
                                  <div className="caption-content"
                                    dangerouslySetInnerHTML={{ __html: sectionImages[activeSlides[index] || 0].caption }} />
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // За единично изображение
                        <figure className="section-figure-preview">
                          <img
                            src={sectionImages[0].src}
                            alt={t('articles.preview.sectionImage', { number: index + 1 })}
                          />
                          {sectionImages[0].caption && (
                            <figcaption dangerouslySetInnerHTML={{ __html: sectionImages[0].caption }} />
                          )}
                        </figure>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
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
      <ScrollToTop />
    </div>
  );
};

export default ArticlePreview;
