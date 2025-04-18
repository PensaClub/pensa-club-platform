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

const ArticlesList = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [sliderArticles, setSliderArticles] = useState([]);
  const { setIsLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(3); 
  const { getAllArticles, articles: contextArticles, articlesLoaded } = useArticleContext();
  const location = useLocation();
  
  // Функция за трансформиране на статиите от сървъра в подходящия формат за компонентите
  const transformServerArticles = (articlesFromServer) => {
    return articlesFromServer.map(article => {
      // Копираме основните полета
      const transformedArticle = {
        ...article,
        // Проверяваме формата на summary - ако е HTML, а не EditorState
        summary: typeof article.summary === 'string' ? article.summary.replace(/<[^>]+>/g, '') : article.summary,
        mainImage: {
          ...article.mainImage,
          // Проверяваме формата на alt - ако е HTML, а не EditorState
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
          console.log('Използваме статии от контекста:', contextArticles);
          articlesData = contextArticles;
        } else {
          // Иначе правим заявка за нови статии
          console.log('Заявяваме нови статии от сървъра');
          // Ако shouldRefresh е true, подаваме forceRefresh=true на getAllArticles
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
        
        console.log('Обработени статии:', sortedArticles);
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
    
    console.log("Обработка на статии:", articles.length);
    setAllArticles(articles);
    
    setFeaturedArticle(articles[0]);
    setSliderArticles(articles.slice(1));
  };

  // Изчисляване на текущите статии, които трябва да се покажат
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = allArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  
  // Изчисляване на общия брой страници
  const totalPages = Math.ceil(allArticles.length / articlesPerPage);
  
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

          <h2 className="all-articles-title">Всички статии</h2>
          {currentArticles.length > 0 ? (
            <div className="articles-grid">
              {currentArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="no-articles-message">Няма налични статии.</p>
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