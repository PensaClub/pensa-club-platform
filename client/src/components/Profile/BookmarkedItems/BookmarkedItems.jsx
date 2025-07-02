import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBookmark, 
    faTrash, 
    faEye, 
    faClock, 
    faMapMarkerAlt,
    faUsers,
    faCalendar,
    faFilter,
    faTimes,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import './bookmarkedItems.css';
import { SkeletonCard } from './SkeletonCard';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';

export const BookmarkedItems = () => {
    const { t } = useTranslation();
    const { 
        bookmarkedInitiatives,
        bookMarkedProjects,
        toggleBookmark,
        toggleBookmarkProjects,
        initiatives,
        projects,
        getInitiativeById,
        getProjectById,
        isLoading
    } = useInitiativeContext();

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookmarkedItemsData, setBookmarkedItemsData] = useState({
        initiatives: [],
        projects: []
    });
    const [isLoadingData, setIsLoadingData] = useState(true);
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);
    // Зареждаме данните за bookmarked items
    useEffect(() => {
        const loadBookmarkedData = async () => {
            setIsLoadingData(true);
            
            // Зареждаме инициативи
            const initiativesData = [];
            for (const id of bookmarkedInitiatives) {
                try {
                    // Първо проверяваме дали вече имаме данните
                    const existingInitiative = initiatives.find(init => init.id === id);
                    if (existingInitiative) {
                        initiativesData.push(existingInitiative);
                    } else {
                        // Ако не, зареждаме от API
                        const data = await getInitiativeById(id);
                        if (data) initiativesData.push(data);
                    }
                } catch (error) {
                    console.error(`Error loading initiative ${id}:`, error);
                }
            }

            // Зареждаме проекти
            const projectsData = [];
            for (const id of bookMarkedProjects) {
                try {
                    // Първо проверяваме дали вече имаме данните
                    const existingProject = projects.find(proj => proj.id === id);
                    if (existingProject) {
                        projectsData.push(existingProject);
                    } else {
                        // Ако не, зареждаме от API
                        const data = await getProjectById(id);
                        if (data) projectsData.push(data);
                    }
                } catch (error) {
                    console.error(`Error loading project ${id}:`, error);
                }
            }

            setBookmarkedItemsData({
                initiatives: initiativesData,
                projects: projectsData
            });
            setIsLoadingData(false);
        };

        loadBookmarkedData();
    }, [bookmarkedInitiatives, bookMarkedProjects]);

    // Филтриране на елементи според търсенето
    const getFilteredItems = () => {
        let items = [];

        if (activeTab === 'all' || activeTab === 'initiatives') {
            items = [...items, ...bookmarkedItemsData.initiatives.map(item => ({ 
                ...item, 
                type: 'initiative' 
            }))];
        }

        if (activeTab === 'all' || activeTab === 'projects') {
            items = [...items, ...bookmarkedItemsData.projects.map(item => ({ 
                ...item, 
                type: 'project' 
            }))];
        }

        // Филтриране по търсене
        if (searchTerm) {
            items = items.filter(item => 
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return items;
    };

    const handleUnbookmark = async (id, type) => {
        if (type === 'initiative') {
            await toggleBookmark(id);
        } else {
            await toggleBookmarkProjects(id);
        }
    };
const extractCityAndCountry = (fullAddress) => {
    if (!fullAddress) return '';
    
    // Разделяме адреса по запетаи
    const parts = fullAddress.split(',').map(part => part.trim());
    
    // Ако има поне 2 части, взимаме последните 2 (обикновено град и държава)
    if (parts.length >= 2) {
        return parts.slice(-2).join(', ');
    }
    
    // Ако има само 1 част, връщаме я
    return parts[0] || fullAddress;
};

    const filteredItems = getFilteredItems();
    const totalCount = bookmarkedInitiatives.length + bookMarkedProjects.length;

    return (
        <div className="bookmarked-items-container">
            {/* Header */}
            <div className="bookmarked-header">
                <div className="bookmarked-title-section">
                    <FontAwesomeIcon icon={faBookmark} className="header-icon-bookmarkItems" />
                    <h2>{t('bookmarks.title')}</h2>
                    <span className="total-count">{totalCount}</span>
                </div>

                {/* Search Bar */}
                <div className="bookmarked-search">
                    <FontAwesomeIcon icon={faSearch} className="search-icon-bookmarks" />
                    <input
                        type="text"
                        placeholder={t('bookmarks.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-bookmarks"
                    />
                    {searchTerm && (
                        <button 
                            className="clear-search-bookmarks"
                            onClick={() => setSearchTerm('')}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bookmarked-tabs">
                <button
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <FontAwesomeIcon icon={faFilter} />
                    {t('bookmarks.tabs.all')} ({totalCount})
                </button>
                <button
                    className={`tab-button ${activeTab === 'initiatives' ? 'active' : ''}`}
                    onClick={() => setActiveTab('initiatives')}
                >
                    <FontAwesomeIcon icon={faUsers} />
                    {t('bookmarks.tabs.initiatives')} ({bookmarkedInitiatives.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                >
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {t('bookmarks.tabs.projects')} ({bookMarkedProjects.length})
                </button>
            </div>

            {/* Content */}
            <div className="bookmarked-content">
                {isLoadingData ? (
                    <div className="bookmarked-grid">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <FontAwesomeIcon icon={faBookmark} className="empty-icon" />
                        <h3>{t('bookmarks.empty.title')}</h3>
                        <p>{t('bookmarks.empty.description')}</p>
                        <Link to="/initiatives" className="explore-button">
                            {t('bookmarks.empty.exploreButton')}
                        </Link>
                    </div>
                ) : (
                    <div className="bookmarked-grid">
                        {filteredItems.map(item => (
                            <div key={`${item.type}-${item.id}`} className="bookmarked-card">
                                {/* Type Badge */}
                                <div className="bookmarked-card-header">
                                    <span className={`type-badge ${item.type}`}>
                                        {item.type === 'initiative' ? t('bookmarks.type.initiative') : t('bookmarks.type.project')}
                                    </span>
                                    <button
                                        className="unbookmark-button"
                                        onClick={() => handleUnbookmark(item.id, item.type)}
                                        title={t('bookmarks.unbookmark')}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>

                                {/* Card Image */}
                                {item.mainImage?.src && (
                                    <div className="bookmarked-card-image">
                                        <img 
                                            src={item.mainImage.src} 
                                            alt={item.title}
                                            loading="lazy"
                                        />
                                        <div className="image-overlay">
                                            <Link 
                                                to={item.type === 'initiative' 
                                                    ? `/initiatives/${item.slug || item.id}` 
                                                    : `/projects/${item.slug || item.id}`}
                                                className="view-button"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                {t('bookmarks.viewDetails')}
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Card Content */}
                                <div className="bookmarked-card-content">
                                    <h3 className="card-title">
                                        <Link 
                                            to={item.type === 'initiative' 
                                                ? `/initiatives/${item.slug || item.id}` 
                                                : `/projects/${item.slug || item.id}`}
                                        >
                                            {item.title}
                                        </Link>
                                    </h3>

                                    <p className="card-description">
                                        {item.shortDescription || item.description}
                                    </p>

                                    {/* Meta Information */}
                                    <div className="card-meta">
                                        {item.location?.address && (
                                            <div className="meta-item">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                <span>{extractCityAndCountry(item.location.address)}</span>
                                            </div>
                                        )}

                                        {item.startDate && (
                                            <div className="meta-item">
                                                <FontAwesomeIcon icon={faCalendar} />
                                                <span>{new Date(item.startDate).toLocaleDateString()}</span>
                                            </div>
                                        )}

                                        {item.status && (
                                            <div className="meta-item">
                                                <span className={`status-badge-bookmarks ${item.status}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="card-footer">
                                        <Link 
                                            to={item.type === 'initiative' 
                                                ? `/initiatives/${item.slug || item.id}` 
                                                : `/projects/${item.slug || item.id}`}
                                            className="read-more-link"
                                        >
                                            {t('bookmarks.readMore')} →
                                        </Link>

                                        <span className="bookmarked-date">
                                            <FontAwesomeIcon icon={faClock} />
                                            {t('bookmarks.bookmarkedOn')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ScrollToTop />
        </div>
    );
};