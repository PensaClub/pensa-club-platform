
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './articlesList.css';
import { articles } from '../data/articlesData';
import { ArticleCard } from './ArticleCard/ArticleCard';
import { ArticlesSlider } from './ArticlesSlider/ArticlesSlider';

const ArticlesList = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [sliderArticles, setSliderArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  useEffect(() => {
    // В реално приложение тук би имало заявка към API
    setTimeout(() => {
      setAllArticles(articles);
      // Взимаме най-новата статия за featured
      setFeaturedArticle(articles[0]);
      // Вземаме следващите 3 статии за слайдера
      setSliderArticles(articles.slice(1, 4));
      setLoading(false);
    }, 300);
  }, []);

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

  return (
    <div className="articles-list-container">
      <div className="articles-hero">
        <div className="hero-content">
          <h1>Нашите статии</h1>
          <p>Информация, съвети и полезни ресурси за дигитална грамотност</p>
        </div>
      </div>

      {loading ? (
        <div className="articles-loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="articles-content">
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
            {allArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesList;