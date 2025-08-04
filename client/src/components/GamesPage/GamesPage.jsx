import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGamepad,
    faFilter,
    faSearch,
    faTrophy,
    faUsers,
    faClock,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import GameCard from './GameCard';
import { gamesData, gameCategories } from './gameData';
import './gamesPage.css';

const GamesPage = () => {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFiltersStickyActive, setIsFiltersStickyActive] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

    // 🆕 Sticky ефект за филтрите
    useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.querySelector('.games-hero');
            const filtersSection = document.querySelector('.games-filters-section');

            if (heroSection && filtersSection) {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                const scrollTop = window.pageYOffset;

                if (scrollTop >= heroBottom - 100) {
                    setIsFiltersStickyActive(true);
                    filtersSection.classList.add('sticky');
                } else {
                    setIsFiltersStickyActive(false);
                    filtersSection.classList.remove('sticky');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🆕 Parallax ефект за фона
    useEffect(() => {
        const handleParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElement = document.querySelector('.games-page::before');
            const rate = scrolled * -0.5;

            if (parallaxElement) {
                parallaxElement.style.transform = `translateY(${rate}px)`;
            }
        };

        window.addEventListener('scroll', handleParallax);
        return () => window.removeEventListener('scroll', handleParallax);
    }, []);

    // Филтрираме игрите според категория и търсене
    const filteredGames = useMemo(() => {
        return gamesData.filter(game => {
            const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
            const gameName = t(game.name).toLowerCase();
            const gameDescription = t(game.description).toLowerCase();
            const matchesSearch = gameName.includes(searchTerm.toLowerCase()) ||
                gameDescription.includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchTerm, t]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setIsMobileDropdownOpen(false); // Затвори dropdown след избор
    };

    const toggleMobileDropdown = () => {
        setIsMobileDropdownOpen(!isMobileDropdownOpen);
    };

    return (
        <div className="games-page">
            {/* Hero Section */}
            <div className="games-hero">
                <div className="games-hero-content">
                    <div className="games-hero-text">
                        <h1 className="games-title">
                            <FontAwesomeIcon icon={faGamepad} className="games-title-icon" />
                            {t('games.title')}
                        </h1>
                        <p className="games-subtitle">
                            {t('games.subtitle')}
                        </p>
                        <div className="games-stats">
                            <div className="games-stat">
                                <FontAwesomeIcon icon={faTrophy} />
                                <span>{t('games.stats.totalGames', { count: gamesData.length })}</span>
                            </div>
                            <div className="games-stat">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>{t('games.stats.allAges')}</span>
                            </div>
                            <div className="games-stat">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{t('games.stats.available24_7')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="games-hero-image">
                        <img
                            src="/images/games/gaming-room.jpg"
                            alt={t('games.heroImageAlt')}
                        />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="games-filters-section">
                <div className="games-container">
                    <div className="games-filters">
                        <div className="games-search">
                            <div className="search-input-container">
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder={t('games.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input-games"
                                />
                            </div>
                        </div>

                        <div className="games-categories">
                            {/* 🖥️ Desktop версия */}
                            <div className="categories-header desktop-only">
                                <svg
                                    className="categories-header-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span>{t('games.categories.title')}:</span>
                            </div>
                            <div className="categories-list desktop-only">
                                {gameCategories.map(category => (
                                    <button
                                        key={category}
                                        className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                        onClick={() => handleCategoryChange(category)}
                                    >
                                        {t(`games.categories.${category}`)}
                                    </button>
                                ))}
                            </div>

                            {/* 📱 Mobile падащо меню */}
                            <div className="mobile-category-dropdown mobile-only">
                                <button 
                                    className="mobile-dropdown-trigger"
                                    onClick={toggleMobileDropdown}
                                >
                                    <svg
                                        className="categories-header-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span>{t(`games.categories.${selectedCategory}`)}</span>
                                    <FontAwesomeIcon 
                                        icon={isMobileDropdownOpen ? faChevronUp : faChevronDown} 
                                        className="dropdown-arrow"
                                    />
                                </button>
                                
                                {isMobileDropdownOpen && (
                                    <div className="mobile-dropdown-menu">
                                        {gameCategories.map(category => (
                                            <button
                                                key={category}
                                                className={`mobile-category-option ${selectedCategory === category ? 'active' : ''}`}
                                                onClick={() => handleCategoryChange(category)}
                                            >
                                                {t(`games.categories.${category}`)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="games-content">
                <div className="games-container">
                    {filteredGames.length > 0 ? (
                        <>
                            <div className="games-results-header">
                                <h2>
                                    {selectedCategory === 'all'
                                        ? t('games.results.allGames', { count: filteredGames.length })
                                        : t('games.results.categoryGames', {
                                            category: t(`games.categories.${selectedCategory}`),
                                            count: filteredGames.length
                                        })
                                    }
                                </h2>
                                {searchTerm && (
                                    <p className="search-results-text">
                                        {t('games.results.searchFor')}: <span className="search-term">{searchTerm}</span>
                                    </p>
                                )}
                            </div>

                            <div className="games-grid">
                                {filteredGames.map(game => (
                                    <GameCard key={game.id} {...game} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-games-found">
                            <FontAwesomeIcon icon={faGamepad} className="no-games-icon" />
                            <h3>{t('games.noGamesFound.title')}</h3>
                            <p>{t('games.noGamesFound.description')}</p>
                            <button
                                className="reset-filters-btn"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                            >
                                {t('games.noGamesFound.resetButton')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GamesPage;