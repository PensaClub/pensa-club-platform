/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import './articlesList.css';
import { ArticleCard } from './ArticleCard/ArticleCard';
import { ArticlesSlider } from './ArticlesSlider/ArticlesSlider';
import { useLoading } from '../../contexts/LoadingContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import Pagination from '../Pagination/Pagination';
import ClubCardPromo from './ClubCardPromo/ClubCardPromo';
import { useArticleContext } from '../../contexts/ArticleContext';
import { createEditorState } from '../articleUtils/editor';
import { useLocation } from 'react-router-dom';
import { filterArticles } from '../articleUtils/search'; 

const ArticlesList = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [sliderArticles, setSliderArticles] = useState([]);
  const { setIsLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(3); 
  const { getAllArticles, articles: contextArticles, articlesLoaded } = useArticleContext();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Функция за трансформиране на статиите от сървъра в подходящия формат за компонентите
  const transformServerArticles = (articlesFromServer) => {
    // Съществуващата функция остава непроменена
    return articlesFromServer.map(article => {
      // Копираме основните полета
      const transformedArticle = {
        ...article,
        summary: typeof article.summary === 'string' ? article.summary.replace(/<[^>]+>/g, '') : article.summary,
        mainImage: {
          ...article.mainImage,

          alt: typeof article.mainImage.alt === 'string' ? article.mainImage.alt.replace(/<[^>]+>/g, '') : article.mainImage.alt
        }
      };

      // Трансформираме sections и техните изображения
      if (article.sections) {
        transformedArticle.sections = article.sections.map(section => {
          // Създаваме EditorState за content ако е string
          const content = typeof section.content === 'string' 
            ? createEditorState(section.content) 
            : section.content;

          // Трансформираме sectionImages към формата, който компонентът очаква
          const image = Array.isArray(section.sectionImages) 
            ? section.sectionImages.map(img => ({
                src: img.src,
                alt: typeof img.alt === 'string' ? createEditorState(img.alt) : img.alt,
                caption: typeof img.caption === 'string' ? createEditorState(img.caption) : img.caption
              }))
            : [];

          return {
            ...section,
            content,
            image
          };
        });
      }

      return transformedArticle;
    });
  };
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        
        // Проверка дали в URL има параметър за принудително обновяване
        const query = new URLSearchParams(location.search);
        const shouldRefresh = query.get('refresh') === 'true';
        
        // Опитваме да вземем статиите от контекста/сървъра
        let articlesData;
        
        // Проверяваме дали вече имаме заредени статии в контекста
        if (articlesLoaded && contextArticles.length > 0 && !shouldRefresh) {

          articlesData = contextArticles;
        } else {

          articlesData = await getAllArticles(shouldRefresh);
          
          // Изчистваме URL-a от refresh параметъра ако е необходимо
          if (shouldRefresh) {
            window.history.replaceState({}, document.title, '/articles');
          }
        }
        
        // Трансформираме статиите за правилно показване
        const transformedArticles = transformServerArticles(articlesData);
        
        // Сортираме статиите по дата (от най-нови към най-стари)
        const sortedArticles = transformedArticles.sort((a, b) => {
          return new Date(b.publishDate) - new Date(a.publishDate);
        });

        processArticles(sortedArticles);
      } catch (error) {
        console.error("Грешка при зареждане на статии:", error);
        setAllArticles([]);
        setFeaturedArticle(null);
        setSliderArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticles();
  }, [articlesLoaded, location.search, location.key]);
  
  // Помощна функция за обработка на статиите и настройка на featured/slider статии
  const processArticles = (articles) => {
    if (!articles || articles.length === 0) {
      console.warn("Няма налични статии за показване");
      setAllArticles([]);
      setFeaturedArticle(null);
      setSliderArticles([]);
      return;
    }

    setAllArticles(articles);
    
    setFeaturedArticle(articles[0]);
    setSliderArticles(articles.slice(1));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const term = searchTerm.trim();
    if (!term) {
      setIsSearchActive(false);
      setFilteredArticles([]);
      return;
    }
    
    const results = filterArticles(allArticles, term);
    setFilteredArticles(results);
    setIsSearchActive(true);
    setCurrentPage(1);
  };
  
  // Функция за изчистване на търсенето
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchActive(false);
    setFilteredArticles([]);
  };
  
  // Изчисляване на статиите, които ще се покажат
  const displayedArticles = isSearchActive ? filteredArticles : allArticles;
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = displayedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  
  // Изчисляване на общия брой страници
  const totalPages = Math.ceil(displayedArticles.length / articlesPerPage);
  
  const handleSlideClick = (article) => {
    // Разменяме статията от слайдера с featured статията
    setFeaturedArticle(article);
    const newSliderArticles = [...sliderArticles];
    const index = newSliderArticles.findIndex(item => item.id === article.id);
    if (index !== -1) {
      newSliderArticles[index] = featuredArticle;
      setSliderArticles(newSliderArticles);
    }

    window.scrollTo({
      top: document.querySelector('.featured-article-container').offsetTop - 100,
      behavior: 'smooth'
    });
  };
  
  // Функция за смяна на страницата
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    
    // Скролваме до началото на секцията "Всички статии"
    const allArticlesSection = document.querySelector('.all-articles-title');
    if (allArticlesSection) {
      window.scrollTo({
        top: allArticlesSection.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="articles-list-container">
      <div className="articles-hero">
        <div className="hero-content">
          <h1>Нашите статии</h1>
          <p>Информация, съвети и полезни ресурси за дигитална грамотност</p>
        </div>
      </div>
  
      <div className="articles-content-with-sidebar">
        <div className="sidebar-promo">
          <ClubCardPromo />
        </div>
        
        <div className="articles-main-content">
          {featuredArticle && (
            <div className="featured-article-container">
              <ArticleCard article={featuredArticle} featured={true} />
            </div>
          )}

          <div className="articles-divider"></div>

          <div className="slider-section">
            <h2 className="slider-title">Последни статии</h2>
            {sliderArticles.length > 0 ? (
              <ArticlesSlider 
                articles={sliderArticles} 
                onSlideClick={handleSlideClick} 
              />
            ) : (
              <p className="no-articles-message">Няма налични статии за показване в слайдера.</p>
            )}
          </div>

          <div className="articles-divider"></div>

          <div className="all-articles-header-list">
            <h2 className="all-articles-title">Всички статии</h2>
            
            <div className="articles-search-list">
              <form onSubmit={handleSearch}>
                <div className="search-input-wrapper-list">
                  <input
                    type="text"
                    placeholder="Търсене в публикациите..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="search-button-list">
                    <svg width="24px" height="24px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="search">
                        <g id="search_2">
                          <path id="Combined Shape" fillRule="evenodd" clipRule="evenodd" d="M33.2768 28.9321C34.9961 26.3812 35.9996 23.3078 35.9996 19.9994C35.9996 11.1624 28.8372 3.9994 19.9996 3.9994C11.1633 3.9994 3.99957 11.1631 3.99957 19.9994C3.99957 28.837 11.1626 35.9994 19.9996 35.9994C24.8047 35.9994 29.1142 33.8826 32.0467 30.5304L41.6591 40.1427C42.0745 40.5582 42.0745 41.229 41.6591 41.6445C41.4569 41.8467 41.1888 41.9556 40.9102 41.9556C40.6297 41.9556 40.3616 41.8468 40.1593 41.6445L32.6653 34.1505C32.2748 33.76 31.6416 33.76 31.2511 34.1505C30.8605 34.541 30.8605 35.1742 31.2511 35.5647L38.7451 43.0587C39.3261 43.6398 40.1044 43.9556 40.9102 43.9556C41.7144 43.9556 42.4925 43.6395 43.0733 43.0587C44.2698 41.8622 44.2698 39.925 43.0733 38.7285L33.2768 28.9321ZM31.8319 27.4872C33.2048 25.3219 33.9996 22.7537 33.9996 19.9994C33.9996 12.267 27.7326 5.9994 19.9996 5.9994C12.2679 5.9994 5.99957 12.2677 5.99957 19.9994C5.99957 27.7324 12.2671 33.9994 19.9996 33.9994C24.2525 33.9994 28.0616 32.1044 30.6289 29.1126L28.3871 26.8707C27.9965 26.4802 27.9965 25.847 28.3871 25.4565C28.7776 25.066 29.4108 25.066 29.8013 25.4565L31.8319 27.4872ZM25.4238 28.4021C23.8214 29.4393 21.9526 29.9996 19.9992 29.9996C14.4767 29.9996 9.99917 25.5226 9.99917 19.9996C9.99917 19.4473 9.55146 18.9996 8.99917 18.9996C8.44689 18.9996 7.99917 19.4473 7.99917 19.9996C7.99917 26.6272 13.3722 31.9996 19.9992 31.9996C22.3411 31.9996 24.5867 31.3263 26.5105 30.0811C26.9742 29.781 27.1068 29.1619 26.8067 28.6982C26.5066 28.2346 25.8874 28.102 25.4238 28.4021Z" fill="black" />
                        </g>
                      </g>
                    </svg>
                  </button>
                </div>
              </form>
              
              {isSearchActive && (
                <div className="search-results-info-list">
                  <p>
                    Резултати за "{searchTerm}": {filteredArticles.length}
                    <button className="clear-search-list" onClick={clearSearch}>
                      Изчисти
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {currentArticles.length > 0 ? (
            <div className="articles-grid">
              {currentArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="no-articles-message">
              {isSearchActive ? `Няма намерени статии за "${searchTerm}"` : "Няма налични статии."}
            </p>
          )}
              
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default ArticlesList;