/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import './articlesList.css';
import { articles } from '../data/articlesData';
import { ArticleCard } from './ArticleCard/ArticleCard';
import { ArticlesSlider } from './ArticlesSlider/ArticlesSlider';
import { useLoading } from '../../contexts/LoadingContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import Pagination from '../Pagination/Pagination';
import ClubCardPromo from './ClubCardPromo/ClubCardPromo';

const ArticlesList = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [sliderArticles, setSliderArticles] = useState([]);
  const { setIsLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(3); 
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  useEffect(() => {
    const getArticles = async () => {
      try {
        const response = await fetch('/data/articles.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const articlesData = await response.json();
        // Сортираме статиите по дата (от най-нови към най-стари)
        const sortedArticles = articlesData.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        setAllArticles(sortedArticles);

        if (sortedArticles.length > 0) {
          setFeaturedArticle(sortedArticles[0]);         
          // Взимаме всички останали статии за слайдера
          setSliderArticles(sortedArticles.slice(1));
        }
        
      } catch (error) {
        console.error("Error fetching articles:", error);       
        // В случай на грешка, импортираме данните директно като fallback
        import('../data/articlesData').then(module => {
          const sortedArticles = [...module.articles].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          
          setAllArticles(sortedArticles);
          
          if (sortedArticles.length > 0) {
            setFeaturedArticle(sortedArticles[0]);
            setSliderArticles(sortedArticles.slice(1));
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getArticles();
  }, []);

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
      top:document.querySelector('.featured-article-container').offsetTop - 100,
      behavior: 'smooth'
    })
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
              <ArticlesSlider 
                articles={sliderArticles} 
                onSlideClick={handleSlideClick} 
              />
            </div>

            <div className="articles-divider"></div>

            <h2 className="all-articles-title">Всички статии</h2>
            <div className="articles-grid">
              {currentArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
                
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