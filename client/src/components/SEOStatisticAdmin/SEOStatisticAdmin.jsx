import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SEOStatisticAdmin.css';
import { useAuthContext } from '../contexts/UserContext';
import { adminServiceFactory } from '../Services/adminService';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area
} from 'recharts';

// 🎨 ЦВЕТОВЕ ЗА ГРАФИКИТЕ
const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
const BOT_COLORS = {
    'Facebook': '#1877F2',
    'Twitter': '#1DA1F2',
    'LinkedIn': '#0A66C2',
    'Google': '#4285F4',
    'WhatsApp': '#25D366',
    'Telegram': '#0088cc',
    'Slack': '#4A154B',
    'Bing': '#008373',
    'Yandex': '#FF0000',
    'Baidu': '#2319DC'
};

const CONTENT_COLORS = {
    'article': '#667eea',
    'project': '#f093fb',
    'initiative': '#4facfe',
    'club': '#43e97b',
    'page': '#f5576c',
    'mentor': '#764ba2'
};

const CONTENT_LABELS = {
    'article': 'Статии',
    'project': 'Проекти',
    'initiative': 'Инициативи',
    'club': 'Клубове',
    'page': 'Страници',
    'mentor': 'Ментори'
};

// 🌍 ФЛАГОВЕ ЗА ДЪРЖАВИ
const COUNTRY_FLAGS = {
    'BG': '🇧🇬',
    'DE': '🇩🇪',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'FR': '🇫🇷',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'RO': '🇷🇴',
    'GR': '🇬🇷',
    'TR': '🇹🇷',
    'RU': '🇷🇺',
    'UA': '🇺🇦',
    'PL': '🇵🇱',
    'NL': '🇳🇱',
    'BE': '🇧🇪',
    'AT': '🇦🇹',
    'CH': '🇨🇭',
    'SE': '🇸🇪',
    'NO': '🇳🇴',
    'DK': '🇩🇰',
    'FI': '🇫🇮',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'JP': '🇯🇵',
    'CN': '🇨🇳',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'MX': '🇲🇽',
    'AR': '🇦🇷'
};

const COUNTRY_NAMES = {
    'BG': 'България',
    'DE': 'Германия',
    'US': 'САЩ',
    'GB': 'Великобритания',
    'FR': 'Франция',
    'IT': 'Италия',
    'ES': 'Испания',
    'RO': 'Румъния',
    'GR': 'Гърция',
    'TR': 'Турция',
    'RU': 'Русия',
    'UA': 'Украйна',
    'PL': 'Полша',
    'NL': 'Холандия',
    'BE': 'Белгия',
    'AT': 'Австрия',
    'CH': 'Швейцария',
    'SE': 'Швеция',
    'NO': 'Норвегия',
    'DK': 'Дания',
    'FI': 'Финландия',
    'CA': 'Канада',
    'AU': 'Австралия',
    'JP': 'Япония',
    'CN': 'Китай',
    'IN': 'Индия',
    'BR': 'Бразилия',
    'MX': 'Мексико',
    'AR': 'Аржентина'
};

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

    const formatDayName = (dateString) => {
        const date = new Date(dateString);
        const days = ['Нед', 'Пон', 'Вт', 'Ср', 'Чет', 'Пет', 'Съб'];
        return days[date.getDay()];
    };

    const getCountryFlag = (countryCode) => {
        return COUNTRY_FLAGS[countryCode] || '🌍';
    };

    const getCountryName = (countryCode) => {
        return COUNTRY_NAMES[countryCode] || countryCode;
    };

    const getPageDisplayName = (slug) => {
        const pageNames = {
            'home': 'Начална страница',
            'academy': 'DigiBridge Academy',
            'about': 'За нас',
            'contact': 'Контакти',
            'mentors': 'Ментори'
        };
        return pageNames[slug] || slug;
    };

    // Custom Tooltip за графиките
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="SEOStatisticAdmin-custom-tooltip">
                    <p className="SEOStatisticAdmin-tooltip-label">{label}</p>
                    <p className="SEOStatisticAdmin-tooltip-value">
                        {payload[0].value} посещения
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom Tooltip за Pie Chart
    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="SEOStatisticAdmin-custom-tooltip">
                    <p className="SEOStatisticAdmin-tooltip-label">{payload[0].name}</p>
                    <p className="SEOStatisticAdmin-tooltip-value">
                        {payload[0].value} ({((payload[0].value / data?.summary?.total) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
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

    const { summary, topBots, contentTypeDistribution, topContent, dailyActivity, geography } = data;

    // Подготви данни за графиките
    const dailyChartData = dailyActivity?.map(day => ({
        date: formatDate(day.date),
        dayName: formatDayName(day.date),
        count: parseInt(day.count),
        fullDate: day.date
    })) || [];

    const botChartData = topBots?.map(bot => ({
        name: bot.bot,
        value: parseInt(bot.count),
        fill: BOT_COLORS[bot.bot] || '#667eea'
    })) || [];

    const contentChartData = contentTypeDistribution?.map(item => ({
        name: CONTENT_LABELS[item.contentType] || item.contentType,
        value: parseInt(item.count),
        fill: CONTENT_COLORS[item.contentType] || '#667eea'
    })) || [];

    return (
        <div className="SEOStatisticAdmin">
            <div className="SEOStatisticAdmin-header">
                <div className="SEOStatisticAdmin-header-left">
                    <h1>📊 SEO & Bot Статистика</h1>
                    <p className="SEOStatisticAdmin-subtitle">Проследявайте как социалните мрежи индексират съдържанието ви</p>
                </div>
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

            {/* DAILY ACTIVITY CHART - AREA CHART */}
            <div className="SEOStatisticAdmin-section SEOStatisticAdmin-full-width">
                <h2>📈 Дневна Активност (Последната седмица)</h2>
                <div className="SEOStatisticAdmin-chart-container">
                    {dailyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailyChartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fill: '#7f8c8d', fontSize: 12 }}
                                    tickLine={{ stroke: '#e0e0e0' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#7f8c8d', fontSize: 12 }}
                                    tickLine={{ stroke: '#e0e0e0' }}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#667eea" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="SEOStatisticAdmin-no-data">
                            <p>📭 Няма данни за последната седмица</p>
                        </div>
                    )}
                </div>
            </div>

            {/* TOP BOTS & CONTENT TYPE - CHARTS */}
            <div className="SEOStatisticAdmin-grid">
                {/* TOP BOTS - BAR CHART */}
                <div className="SEOStatisticAdmin-section">
                    <h2>🤖 Топ Ботове</h2>
                    <div className="SEOStatisticAdmin-chart-container SEOStatisticAdmin-chart-small">
                        {botChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={botChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis type="number" tick={{ fill: '#7f8c8d', fontSize: 12 }} />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        tick={{ fill: '#2c3e50', fontSize: 12 }}
                                        width={80}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`${value} посещения`, 'Брой']}
                                        contentStyle={{ 
                                            backgroundColor: '#fff',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                        {botChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="SEOStatisticAdmin-no-data">
                                <p>🤖 Няма данни за ботове</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENT TYPE DISTRIBUTION - PIE CHART */}
                <div className="SEOStatisticAdmin-section">
                    <h2>📁 Тип Съдържание</h2>
                    <div className="SEOStatisticAdmin-chart-container SEOStatisticAdmin-chart-small">
                        {contentChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={contentChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {contentChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                    <Legend 
                                        layout="vertical" 
                                        align="right" 
                                        verticalAlign="middle"
                                        formatter={(value) => <span style={{ color: '#2c3e50', fontSize: '12px' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="SEOStatisticAdmin-no-data">
                                <p>📁 Няма данни за типове съдържание</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ГЕОГРАФИЯ - ТОП ДЪРЖАВИ */}
            {geography?.topCountries && geography.topCountries.length > 0 && (
                <div className="SEOStatisticAdmin-section SEOStatisticAdmin-full-width">
                    <h2>🌍 Географско Разпределение</h2>
                    <div className="SEOStatisticAdmin-country-grid">
                        {geography.topCountries.map((item, index) => (
                            <div key={index} className="SEOStatisticAdmin-country-card">
                                <div className="SEOStatisticAdmin-country-rank">#{index + 1}</div>
                                <div className="SEOStatisticAdmin-country-flag-large">
                                    {getCountryFlag(item.country)}
                                </div>
                                <div className="SEOStatisticAdmin-country-info">
                                    <h4>{getCountryName(item.country)}</h4>
                                    <p className="SEOStatisticAdmin-country-code">{item.country}</p>
                                </div>
                                <div className="SEOStatisticAdmin-country-count-badge">
                                    {formatNumber(item.count)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                    <button 
                        className={`SEOStatisticAdmin-tab ${activeTab === 'pages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pages')}
                    >
                        📄 Страници ({topContent?.pages?.length || 0})
                    </button>
                </div>

                <div className="SEOStatisticAdmin-tab-content">
                    {activeTab === 'articles' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.articles?.length > 0 ? (
                                topContent.articles.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <div className="SEOStatisticAdmin-top-rank-badge">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
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
                                        <div className="SEOStatisticAdmin-top-shares-badge">
                                            <span className="SEOStatisticAdmin-shares-number">{formatNumber(item.shares)}</span>
                                            <span className="SEOStatisticAdmin-shares-label">споделяния</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="SEOStatisticAdmin-empty-state">
                                    <span className="SEOStatisticAdmin-empty-icon">📰</span>
                                    <p>Няма споделени статии тази седмица</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.projects?.length > 0 ? (
                                topContent.projects.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <div className="SEOStatisticAdmin-top-rank-badge">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
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
                                        <div className="SEOStatisticAdmin-top-shares-badge">
                                            <span className="SEOStatisticAdmin-shares-number">{formatNumber(item.shares)}</span>
                                            <span className="SEOStatisticAdmin-shares-label">споделяния</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="SEOStatisticAdmin-empty-state">
                                    <span className="SEOStatisticAdmin-empty-icon">📁</span>
                                    <p>Няма споделени проекти тази седмица</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'initiatives' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.initiatives?.length > 0 ? (
                                topContent.initiatives.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <div className="SEOStatisticAdmin-top-rank-badge">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
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
                                        <div className="SEOStatisticAdmin-top-shares-badge">
                                            <span className="SEOStatisticAdmin-shares-number">{formatNumber(item.shares)}</span>
                                            <span className="SEOStatisticAdmin-shares-label">споделяния</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="SEOStatisticAdmin-empty-state">
                                    <span className="SEOStatisticAdmin-empty-icon">🎯</span>
                                    <p>Няма споделени инициативи тази седмица</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'clubs' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.clubs?.length > 0 ? (
                                topContent.clubs.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <div className="SEOStatisticAdmin-top-rank-badge">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
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
                                        <div className="SEOStatisticAdmin-top-shares-badge">
                                            <span className="SEOStatisticAdmin-shares-number">{formatNumber(item.shares)}</span>
                                            <span className="SEOStatisticAdmin-shares-label">споделяния</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="SEOStatisticAdmin-empty-state">
                                    <span className="SEOStatisticAdmin-empty-icon">🏛️</span>
                                    <p>Няма споделени клубове тази седмица</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'pages' && (
                        <div className="SEOStatisticAdmin-top-list">
                            {topContent?.pages?.length > 0 ? (
                                topContent.pages.map((item, index) => (
                                    <div key={index} className="SEOStatisticAdmin-top-item">
                                        <div className="SEOStatisticAdmin-top-rank-badge">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
                                        <div className="SEOStatisticAdmin-top-info">
                                            <a 
                                                href={`/${item.slug === 'home' ? '' : item.slug}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="SEOStatisticAdmin-top-title"
                                            >
                                                {getPageDisplayName(item.slug)}
                                            </a>
                                            <span className="SEOStatisticAdmin-top-slug">/{item.slug}</span>
                                        </div>
                                        <div className="SEOStatisticAdmin-top-shares-badge">
                                            <span className="SEOStatisticAdmin-shares-number">{formatNumber(item.shares)}</span>
                                            <span className="SEOStatisticAdmin-shares-label">споделяния</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="SEOStatisticAdmin-empty-state">
                                    <span className="SEOStatisticAdmin-empty-icon">📄</span>
                                    <p>Няма споделени страници тази седмица</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER INFO */}
            <div className="SEOStatisticAdmin-footer">
                <p>
                    📌 Последно обновяване: {new Date(data?.meta?.generatedAt).toLocaleString('bg-BG')}
                </p>
                <p className="SEOStatisticAdmin-footer-hint">
                    💡 Тази статистика показва колко пъти социални мрежи (Facebook, Twitter, LinkedIn и др.) 
                    са поискали preview на вашето съдържание при споделяне.
                </p>
            </div>
        </div>
    );
};