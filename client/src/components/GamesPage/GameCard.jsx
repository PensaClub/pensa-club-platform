import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faPlay, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './gameCard.css';

const GameCard = ({ 
    name, 
    description, 
    image, 
    url, 
    category, 
    difficulty, 
    playerCount,
    icon 
}) => {
    const { t } = useTranslation();

    const handleGameClick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'easy': '#10b981',
            'medium': '#f59e0b', 
            'hard': '#ef4444',
            'expert': '#8b5cf6'
        };
        return colors[difficulty] || '#3b82f6';
    };

    return (
        <div 
            className="game-card" 
            data-category={category}
            onClick={handleGameClick}
        >
            <div className="game-card-header">
                <div className="game-image-container">
                    <img 
                        src={image} 
                        alt={t(name)}
                        className="game-image"
                        onError={(e) => {
                            e.target.src = '/images/games/default-game.png';
                        }}
                    />
                    <div className="game-overlay">
                        <FontAwesomeIcon icon={faPlay} className="play-icon" />
                    </div>
                </div>
                <div className="game-category-badge">
                    <FontAwesomeIcon icon={icon || faGamepad} />
                    {t(`games.categories.${category}`)}
                </div>
            </div>

            <div className="game-card-content">
                <div className="game-title-section">
                    <h3 className="game-name">{t(name)}</h3>
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="external-link-icon" />
                </div>
                
                <p className="game-description">{t(description)}</p>
                
                <div className="game-meta">
                    <div className="game-difficulty">
                        <span 
                            className="difficulty-indicator"
                            style={{ backgroundColor: getDifficultyColor(difficulty) }}
                        >
                            {t(`games.difficulty.${difficulty}`)}
                        </span>
                    </div>
                    <div className="game-players">
                        👥 {t(playerCount)}
                    </div>
                </div>
            </div>

            <div className="game-card-footer">
                <button className="play-button">
                    <FontAwesomeIcon icon={faPlay} />
                    {t('games.playNow')}
                </button>
            </div>
        </div>
    );
};

export default GameCard;