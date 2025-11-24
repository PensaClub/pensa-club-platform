import { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import './SEOStatisticAdmin.css';
import { useAuthContext } from '../contexts/UserContext';
import { adminServiceFactory } from '../Services/adminService';

export const SEOStatisticAdmin = () => {
    const { t } = useTranslation();
    const { token } = useAuthContext();
    const adminService = adminServiceFactory(token);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('articles');

    useEffect(() => {
        fetchBotSummary();
    }, []);

    const fetchBotSummary = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getBotSummary();
            setData(response);
        } catch (err) {
            console.error('Error fetching bot summary:', err);
            setError(err.message || 'Failed to load bot statistics');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        return num?.toLocaleString('bg-BG') || '0';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' });
    };

    if (loading) {
        return (
            <div className="SEOStatisticAdmin">
                <div className="SEOStatisticAdmin-loading">
                    <div className="SEOStatisticAdmin-spinner"></div>
                    <p>Зареждане на статистика...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="SEOStatisticAdmin">
                <div className="SEOStatisticAdmin-error">
                    <h3>❌ Грешка</h3>
                    <p>{error}</p>
                    <button onClick={fetchBotSummary} className="SEOStatisticAdmin-retry-btn">
                        Опитай отново
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { summary, topBots, contentTypeDistribution, topContent, dailyActivity } = data;

    return (
        <div className="SEOStatisticAdmin">
            <div className="SEOStatisticAdmin-header">
                <h1>📊 SEO & Bot Статистика</h1>
                <button onClick={fetchBotSummary} className="SEOStatisticAdmin-refresh-btn">
                    🔄 Обнови
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="SEOStatisticAdmin-summary">
                <div className="SEOStatisticAdmin-card SEOStatisticAdmin-card-blue">
                    <div className="SEOStatisticAdmin-card-icon">📅</div>
                    <div className="SEOStatisticAdmin-card-content">
                        <h3>{formatNumber(summary?.last24Hours)}</h3>
                        <p>Последните 24 часа</p>
                    </div>
                </div>
                <div className="SEOStatisticAdmin-card SEOStatisticAdmin-card-green">
                    <div className="SEOStatisticAdmin-card-icon">📈</div>
                    <div className="SEOStatisticAdmin-card-content">
                        <h3>{formatNumber(summary?.last7Days)}</h3>
                        <p>Последната седмица</p>
                    </div>
                </div>
                <div className="SEOStatisticAdmin-card SEOStatisticAdmin-card-orange">
                    <div className="SEOStatisticAdmin-card-icon">📊</div>
                    <div className="SEOStatisticAdmin-card-content">
                        <h3>{formatNumber(summary?.last30Days)}</h3>
                        <p>Последният месец</p>
                    </div>
                </div>
                <div className="SEOStatisticAdmin-card SEOStatisticAdmin-card-purple">
                    <div className="SEOStatisticAdmin-card-icon">🎯</div>
                    <div className="SEOStatisticAdmin-card-content">
                        <h3>{formatNumber(summary?.total)}</h3>
                        <p>Общо споделяния</p>
                    </div>
                </div>
            </div>

            {/* TOP BOTS & CONTENT TYPE */}
            <div className="SEOStatisticAdmin-grid">
                {/* TOP BOTS */}
                <div className="SEOStatisticAdmin-section">
                    <h2>🤖 Топ Ботове</h2>
                    <div className="SEOStatisticAdmin-bot-list">
                        {topBots?.map((bot, index) => (
                            <div key={index} className="SEOStatisticAdmin-bot-item">
                                <div className="SEOStatisticAdmin-bot-info">
                                    <span className="SEOStatisticAdmin-bot-rank">#{index + 1}</span>
                                    <span className="SEOStatisticAdmin-bot-name">{bot.bot}</span>
                                </div>
                                <div className="SEOStatisticAdmin-bot-bar">
                                    <div 
                                        className="SEOStatisticAdmin-bot-bar-fill"
                                        style={{ 
                                            width: `${(bot.count / topBots[0].count) * 100}%`,
                                            backgroundColor: index === 0 ? '#4CAF50' : '#2196F3'
                                        }}
                                    ></div>
                                    <span className="SEOStatisticAdmin-bot-count">{formatNumber(bot.count)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT TYPE DISTRIBUTION */}
                <div className="SEOStatisticAdmin-section">
                    <h2>📁 Тип Съдържание</h2>
                    <div className="SEOStatisticAdmin-content-list">
                        {contentTypeDistribution?.map((item, index) => {
                            const icons = {
                                article: '📰',
                                project: '📁',
                                initiative: '🎯',
                                club: '🏛️',
                                page: '📄',
                                mentor: '👨‍🏫'
                            };
                            return (
                                <div key={index} className="SEOStatisticAdmin-content-item">
                                    <div className="SEOStatisticAdmin-content-info">
                                        <span className="SEOStatisticAdmin-content-icon">{icons[item.contentType] || '📄'}</span>
                                        <span className="SEOStatisticAdmin-content-type">{item.contentType}</span>
                                    </div>
                                    <span className="SEOStatisticAdmin-content-count">{formatNumber(item.count)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* TOP CONTENT TABS */}
            <div className="SEOStatisticAdmin-section SEOStatisticAdmin-full-width">
                <h2>🏆 Най-Споделяно Съдържание (Последната седмица)</h2>
                
                <div className="SEOStatisticAdmin-tabs">
                    <button 
                        className={`SEOStatisticAdmin-tab ${activeTab === 'articles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('articles')}
                    >
                        📰 Статии ({topContent?.articles?.length || 0})
                    </button>
                    <button 
                        className={`SEOStatisticAdmin-tab ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        📁 Проекти ({topContent?.projects?.length || 0})
                    </button>
                    <button 
                        className={`SEOStatisticAdmin-tab ${activeTab === 'initiatives' ? 'active' : ''}`}
                        onClick={() => setActiveTab('initiatives')}
                    >
                        🎯 Инициативи ({topContent?.initiatives?.length || 0})
                    </button>
                    <button 
                        className={`SEOStatisticAdmin-tab ${activeTab === 'clubs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('clubs')}
                    >
                        🏛️ Клубове ({topContent?.clubs?.length || 0})
                    </button>
                </div>

                <div className="SEOStatisticAdmin-tab-content">
                    {activeTab === 'articles' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.articles?.length > 0 ? (
                                topContent.articles.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <span className="SEOStatisticAdmin-top-rank">#{index + 1}</span>
                                        <div className="SEOStatisticAdmin-top-info">
                                            <a 
                                                href={`/articles/${item.slug}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="SEOStatisticAdmin-top-title"
                                            >
                                                {item.title}
                                            </a>
                                            <span className="SEOStatisticAdmin-top-slug">{item.slug}</span>
                                        </div>
                                        <span className="SEOStatisticAdmin-top-shares">
                                            {formatNumber(item.shares)} споделяния
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="SEOStatisticAdmin-empty">Няма данни за статии</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.projects?.length > 0 ? (
                                topContent.projects.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <span className="SEOStatisticAdmin-top-rank">#{index + 1}</span>
                                        <div className="SEOStatisticAdmin-top-info">
                                            <a 
                                                href={`/projects/${item.slug}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="SEOStatisticAdmin-top-title"
                                            >
                                                {item.title}
                                            </a>
                                            <span className="SEOStatisticAdmin-top-slug">{item.slug}</span>
                                        </div>
                                        <span className="SEOStatisticAdmin-top-shares">
                                            {formatNumber(item.shares)} споделяния
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="SEOStatisticAdmin-empty">Няма данни за проекти</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'initiatives' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.initiatives?.length > 0 ? (
                                topContent.initiatives.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <span className="SEOStatisticAdmin-top-rank">#{index + 1}</span>
                                        <div className="SEOStatisticAdmin-top-info">
                                            <a 
                                                href={`/initiatives/${item.slug}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="SEOStatisticAdmin-top-title"
                                            >
                                                {item.title}
                                            </a>
                                            <span className="SEOStatisticAdmin-top-slug">{item.slug}</span>
                                        </div>
                                        <span className="SEOStatisticAdmin-top-shares">
                                            {formatNumber(item.shares)} споделяния
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="SEOStatisticAdmin-empty">Няма данни за инициативи</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'clubs' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.clubs?.length > 0 ? (
                                topContent.clubs.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <span className="SEOStatisticAdmin-top-rank">#{index + 1}</span>
                                        <div className="SEOStatisticAdmin-top-info">
                                            <a 
                                                href={`/clubs/${item.slug}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="SEOStatisticAdmin-top-title"
                                            >
                                                {item.name}
                                            </a>
                                            <span className="SEOStatisticAdmin-top-slug">{item.slug}</span>
                                        </div>
                                        <span className="SEOStatisticAdmin-top-shares">
                                            {formatNumber(item.shares)} споделяния
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="SEOStatisticAdmin-empty">Няма данни за клубове</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* DAILY ACTIVITY */}
            <div className="SEOStatisticAdmin-section SEOStatisticAdmin-full-width">
                <h2>📈 Дневна Активност (Последната седмица)</h2>
                <div className="SEOStatisticAdmin-chart">
                    {dailyActivity?.map((day, index) => {
                        const maxCount = Math.max(...dailyActivity.map(d => d.count));
                        const height = (day.count / maxCount) * 100;
                        return (
                            <div key={index} className="SEOStatisticAdmin-chart-bar">
                                <div 
                                    className="SEOStatisticAdmin-chart-bar-fill"
                                    style={{ height: `${height}%` }}
                                >
                                    <span className="SEOStatisticAdmin-chart-value">{day.count}</span>
                                </div>
                                <span className="SEOStatisticAdmin-chart-label">{formatDate(day.date)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};