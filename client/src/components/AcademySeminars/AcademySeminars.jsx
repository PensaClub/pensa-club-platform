// src/components/AcademySeminars/AcademySeminars.jsx
// Prefix: asem-

import { useState, useEffect, useCallback, useMemo } from 'react'; // НОВО
import { useTranslation } from 'react-i18next'; // НОВО
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate'; // НОВО
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider'; // НОВО
import { useAuthContext } from '../contexts/UserContext'; // НОВО
import { useLocation } from 'react-router-dom'; // НОВО
import ScrollToTop from '../ScrollToTop/ScrollToTop'; // НОВО
import { TextZoom } from '../TextZoom/TextZoom'; // НОВО
import SeminarsHero from './SeminarsHero/SeminarsHero'; // НОВО
import SeminarsFilters from './SeminarsFilters/SeminarsFilters'; // НОВО
import SeminarCatalogCard from './SeminarCatalogCard/SeminarCatalogCard'; // НОВО
import './academySeminars.css'; // НОВО

const SEMINAR_CATEGORY_COLORS = { // НОВО
    'Интернет сигурност': { primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', icon: '🔒' },
    'Мобилни устройства': { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', icon: '📱' },
    'Дигитална грамотност': { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', icon: '📚' },
    'Социални мрежи': { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', icon: '💬' },
    'Онлайн услуги': { primary: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', icon: '🌐' },
    'Здраве и технологии': { primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', icon: '🏥' },
    'Онлайн банкиране': { primary: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', icon: '💳' },
    'Офис приложения': { primary: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', icon: '📄' },
    'Комуникация': { primary: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', icon: '📞' },
    'Електронно управление': { primary: '#a78bfa', gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', icon: '🏛️' },
    'default': { primary: '#ff6347', gradient: 'linear-gradient(135deg, #ff6347 0%, #c0392b 100%)', icon: '🎓' },
};

const FILTER_TABS = [ // НОВО
    { id: 'all', icon: '📋' },
    { id: 'upcoming', icon: '📅' },
    { id: 'completed', icon: '✅' },
];

const ITEMS_PER_PAGE = 3; // НОВО

const getSeminarStatus = (seminar) => { // НОВО
    if (!seminar) return 'unknown';
    if (seminar.status === 'cancelled') return 'cancelled';

    const now = new Date();
    const startTime = seminar.scheduledDate ? new Date(seminar.scheduledDate) : null;
    const endTime = seminar.scheduledEndDate ? new Date(seminar.scheduledEndDate) : null;

    if (startTime && endTime && now >= startTime && now <= endTime) return 'live';
    if (startTime && !endTime) {
        const duration = seminar.durationMinutes || 90;
        const estimatedEnd = new Date(startTime.getTime() + duration * 60 * 1000);
        if (now >= startTime && now <= estimatedEnd) return 'live';
    }
    if (startTime && now < startTime) return 'upcoming';
    return 'completed';
};

const AcademySeminars = () => { // НОВО
    const { t } = useTranslation('academy');
    const navigate = useLocalizedNavigate();
    const { isAuthentication } = useAuthContext();
    const { getSeminars, getSeminarCategories } = useAcademyCourses(); // ПРОМЕНЕНО — без seminars от state
    const location = useLocation();
    const [initialLoad, setInitialLoad] = useState(true);
    // Data
    const [seminars, setSeminars] = useState([]); // НОВО — локален state
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // НОВО
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 }); // НОВО

    // Filters
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [page, setPage] = useState(1); // НОВО

    // Stats (initial load)
    const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, totalCredits: 0 }); // НОВО

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    
    // Load categories + stats once
    useEffect(() => { // НОВО
        getSeminarCategories().then(data => {
            if (Array.isArray(data)) {
                const normalized = data.map((name, index) => ({
                    id: index,
                    slug: name,
                    name,
                    ...(SEMINAR_CATEGORY_COLORS[name] || SEMINAR_CATEGORY_COLORS.default),
                }));
                setCategories(normalized);
            }
        });

        // Stats — зареди общо, upcoming и completed counts
        const loadStats = async () => {
            try {
                const [allData, upData, compData] = await Promise.all([
                    getSeminars({ page: 1, limit: 1 }),
                    getSeminars({ page: 1, limit: 1, status: 'upcoming' }),
                    getSeminars({ page: 1, limit: 1, status: 'completed' }),
                ]);
                setStats({
                    total: allData.pagination?.total || 0,
                    upcoming: upData.pagination?.total || 0,
                    completed: compData.pagination?.total || 0,
                    totalCredits: 0, // Не може да се изчисли без всички, не е критично
                });
            } catch (err) {
                console.error('Error loading stats:', err);
            }
        };
        loadStats();
    }, []);

    // Build server params from filters
    const buildParams = useCallback((pageNum) => { // НОВО
        const params = {
            page: pageNum,
            limit: ITEMS_PER_PAGE,
        };

        // Status filter → backend status param
        if (activeFilter === 'upcoming') {
            params.status = 'upcoming';
        } else if (activeFilter === 'completed') {
            params.status = 'completed';
        }

        // Category
        if (selectedCategory) {
            params.category = selectedCategory;
        }

        // Search
        if (searchQuery.trim()) {
            params.search = searchQuery.trim();
        }

        // Sort mapping
        if (sortBy === 'date') {
            params.sortBy = 'newest';
        } else if (sortBy === 'title') {
            params.sortBy = 'title';
        } else if (sortBy === 'popular') {
            params.sortBy = 'popular';
        }

        return params;
    }, [activeFilter, selectedCategory, searchQuery, sortBy]);

    // Fetch seminars from server
    const fetchSeminars = useCallback(async (pageNum, append = false) => { // НОВО
        setIsLoading(true);
        try {
            const params = buildParams(pageNum);
            const data = await getSeminars(params);
            const newSeminars = data.seminars || [];

            if (append) {
                setSeminars(prev => [...prev, ...newSeminars]);
            } else {
                setSeminars(newSeminars);
            }

            setPagination(data.pagination || { page: pageNum, total: 0, totalPages: 0 });
            setPage(pageNum);
        } catch (err) {
            console.error('Error fetching seminars:', err);
        } finally {
            setIsLoading(false);
        }
    }, [buildParams, getSeminars]);

    // Refetch on filter/search/sort change — reset to page 1
    useEffect(() => { // НОВО
        fetchSeminars(1, false);
    }, [activeFilter, selectedCategory, sortBy]);

    // Debounced search
     useEffect(() => {
        if (initialLoad) {
            setInitialLoad(false);
            return;
        }
        const timeout = setTimeout(() => {
            fetchSeminars(1, false);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Load more
    const handleLoadMore = useCallback(() => { // НОВО
        if (page < pagination.totalPages && !isLoading) {
            fetchSeminars(page + 1, true);
        }
    }, [page, pagination.totalPages, isLoading, fetchSeminars]);

    const hasMore = page < pagination.totalPages; // НОВО
    const remaining = pagination.total - seminars.length; // НОВО

    const getCategoryColor = useCallback((seminar) => {
        return SEMINAR_CATEGORY_COLORS[seminar.category] || SEMINAR_CATEGORY_COLORS.default;
    }, []);

    const handleSeminarClick = useCallback((seminar) => {
        navigate(`/academy/seminars/${seminar.slug}`);
    }, [navigate]);

    const handleClearFilters = useCallback(() => {
        setActiveFilter('all');
        setSelectedCategory(null);
        setSearchQuery('');
        setSortBy('date');
    }, []);

    if (!isAuthentication) return null;

    const hasActiveFilters = activeFilter !== 'all' || selectedCategory || searchQuery.trim();

    return (
        <div className="asem">
            <TextZoom />

            <SeminarsHero stats={stats} />

            <main className="asem-main">
                <div className="asem-container">
                    <SeminarsFilters
                        tabs={FILTER_TABS}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        stats={stats}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                        getCategoryColor={getCategoryColor}
                    />

                    {/* Results */}
                    {isLoading && seminars.length === 0 ? (
                        <div className="asem-loading">
                            <div className="asem-spinner" />
                            <p>{t('academySeminars.loading', 'Зареждане на семинари...')}</p>
                        </div>
                    ) : seminars.length === 0 && !isLoading ? (
                        <div className="asem-empty">
                            <span className="asem-empty-icon">🎓</span>
                            <h3>{t('academySeminars.empty.title', 'Няма намерени семинари')}</h3>
                            <p>{t('academySeminars.empty.description', 'Променете филтрите или търсенето')}</p>
                            {hasActiveFilters && (
                                <button className="asem-empty-btn" onClick={handleClearFilters}>
                                    {t('academySeminars.empty.clearFilters', 'Изчисти филтрите')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="asem-results-info">
                                <span>
                                    {seminars.length} {t('academySeminars.of', 'от')} {pagination.total} {t('academySeminars.results', 'семинара')}
                                </span>
                            </div>

                            <div className="asem-grid">
                                {seminars.map((sem) => (
                                    <SeminarCatalogCard
                                        key={sem.id}
                                        seminar={sem}
                                        status={getSeminarStatus(sem)}
                                        categoryColor={getCategoryColor(sem)}
                                        onClick={() => handleSeminarClick(sem)}
                                    />
                                ))}
                            </div>

                            {/* Load more */}
                            {hasMore && (
                                <div className="asem-load-more">
                                    <button
                                        className="asem-load-more-btn"
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="asem-spinner-small" />
                                        ) : (
                                            <>
                                                {t('academySeminars.loadMore', 'Зареди още')}
                                                <span className="asem-load-more-count">
                                                    +{Math.min(ITEMS_PER_PAGE, remaining)}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                    <div className="asem-load-more-progress">
                                        <div
                                            className="asem-load-more-progress-fill"
                                            style={{ width: `${(seminars.length / pagination.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="asem-load-more-info">
                                        {seminars.length} / {pagination.total}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <ScrollToTop />
        </div>
    );
};

export default AcademySeminars;