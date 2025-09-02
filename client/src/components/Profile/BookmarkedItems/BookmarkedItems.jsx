/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { useClubContext } from '../../contexts/ClubContext'; // Добави това
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
    faSearch,
    faThList,
    faThLarge,
    faHeart // Добави икона за клубове
} from '@fortawesome/free-solid-svg-icons';
import './bookmarkedItems.css';
import { SkeletonCard } from './SkeletonCard';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { useAuthContext } from '../../contexts/UserContext';

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
        isLoading,
    } = useInitiativeContext();

    // Добави club context
    const {
        bookmarkedClubs,
        toggleBookmarkClub,
        clubs,
        getClubById,
        getAllBookmarkedClubs,
        bookmarksLoaded
    } = useClubContext();
    const {
        isAuthentication,
        userEmail
    } = useAuthContext();
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid')
    const [bookmarkedItemsData, setBookmarkedItemsData] = useState({
        initiatives: [],
        projects: [],
        clubs: [] 
    });
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

   useEffect(() => {
    const loadBookmarkedData = async () => {
        setIsLoadingData(true);

        // Зареди bookmarks от API ако е нужно (но само веднъж)
        if (isAuthentication && userEmail && !bookmarksLoaded && bookmarkedClubs.length === 0) {
            try {
                await getAllBookmarkedClubs(userEmail);
            } catch (error) {
                console.error('Error loading bookmarked clubs:', error);
            }
        }

        const initiativesData = [];
        for (const id of bookmarkedInitiatives || []) {
            try {
                const existingInitiative = initiatives.find(init => init.id === id);
                if (existingInitiative) {
                    initiativesData.push(existingInitiative);
                } else {
                    const data = await getInitiativeById(id);
                    if (data) initiativesData.push(data);
                }
            } catch (error) {
                console.error(`Error loading initiative ${id}:`, error);
            }
        }

        const projectsData = [];
        for (const id of bookMarkedProjects || []) {
            try {
                const existingProject = projects.find(proj => proj.id === id);
                if (existingProject) {
                    projectsData.push(existingProject);
                } else {
                    const data = await getProjectById(id);
                    if (data) projectsData.push(data);
                }
            } catch (error) {
                console.error(`Error loading project ${id}:`, error);
            }
        }

        // Зареждане на клубове
        const clubsData = [];
        for (const id of bookmarkedClubs || []) {
            try {
                const existingClub = clubs.find(club => club.id === id);
                if (existingClub) {
                    clubsData.push(existingClub);
                } else {
                    const data = await getClubById(id);
                    if (data) clubsData.push(data);
                }
            } catch (error) {
                console.error(`Error loading club ${id}:`, error);
            }
        }

        setBookmarkedItemsData({
            initiatives: initiativesData,
            projects: projectsData,
            clubs: clubsData
        });
        setIsLoadingData(false);
    };

    loadBookmarkedData();
}, [
    bookmarkedInitiatives?.length,
    bookMarkedProjects?.length, 
    bookmarkedClubs?.length,
    isAuthentication,
    userEmail
]); 

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

        // Добави клубове
        if (activeTab === 'all' || activeTab === 'clubs') {
            items = [...items, ...bookmarkedItemsData.clubs.map(item => ({
                ...item,
                type: 'club'
            }))];
        }

        if (searchTerm) {
            items = items.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || // За клубове
                item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.fullDescription?.toLowerCase().includes(searchTerm.toLowerCase()) // За клубове
            );
        }

        return items;
    };

    const handleUnbookmark = async (id, type) => {
        if (type === 'initiative') {
            await toggleBookmark(id);
        } else if (type === 'project') {
            await toggleBookmarkProjects(id);
        } else if (type === 'club') { // Добави обработка за клубове
            await toggleBookmarkClub(id);
        }
    };

    const extractCityAndCountry = (fullAddress) => {
        if (!fullAddress) return '';

        const parts = fullAddress.split(',').map(part => part.trim());

        if (parts.length >= 2) {
            return parts.slice(-2).join(', ');
        }

        return parts[0] || fullAddress;
    };

    const filteredItems = getFilteredItems();
    const totalCount = bookmarkedInitiatives.length + bookMarkedProjects.length + (bookmarkedClubs?.length || 0); // Добави клубове с проверка

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

            {/* Filter Tabs with View Switcher */}
            <div className="bookmarked-tabs-container">
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
                    {/* Добави таб за клубове */}
                    <button
                        className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('clubs')}
                    >
                        <FontAwesomeIcon icon={faHeart} />
                        {t('bookmarks.tabs.clubs')} ({bookmarkedClubs?.length || 0})
                    </button>
                </div>

                {/* View Mode Switcher */}
                <div className="view-mode-switcher">
                    <button
                        className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title={t('bookmarks.viewMode.grid')}
                    >
                        <FontAwesomeIcon icon={faThLarge} />
                    </button>
                    <button
                        className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title={t('bookmarks.viewMode.list')}
                    >
                        <FontAwesomeIcon icon={faThList} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bookmarked-content">
                {isLoadingData ? (
                    <div className={`bookmarked-${viewMode}`}>
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} viewMode={viewMode} />)}
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
                    <div className={`bookmarked-${viewMode}`}>
                        {filteredItems.map(item => (
                            <div key={`${item.type}-${item.id}`} className={`bookmarked-card ${viewMode}`}>
                                {/* Card Image */}
                                {(item.mainImage?.src || item.mainImage || item.logo) && (
                                    <div className="bookmarked-card-image">
                                        <img
                                            src={item.mainImage?.src || item.mainImage || item.logo}
                                            alt={item.title || item.name}
                                            loading="lazy"
                                        />
                                        <div className="image-overlay">
                                            <Link
                                                to={item.type === 'initiative'
                                                    ? `/initiatives/${item.slug || item.id}`
                                                    : item.type === 'project'
                                                        ? `/projects/${item.slug || item.id}`
                                                        : `/clubs/${item.slug || item.id}`} // Добави route за клубове
                                                className="view-button"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                {t('bookmarks.viewDetails')}
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Card Content Wrapper */}
                                <div className="bookmarked-card-content-wrapper">
                                    {/* Type Badge */}
                                    <div className="bookmarked-card-header">
                                        <span className={`type-badge ${item.type}`}>
                                            {item.type === 'initiative'
                                                ? t('bookmarks.type.initiative')
                                                : item.type === 'project'
                                                    ? t('bookmarks.type.project')
                                                    : t('bookmarks.type.club')} {/* Добави текст за клубове */}
                                        </span>
                                        <button
                                            className="unbookmark-button"
                                            onClick={() => handleUnbookmark(item.id, item.type)}
                                            title={t('bookmarks.unbookmark')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>

                                    {/* Card Content */}
                                    <div className="bookmarked-card-content">
                                        <h3 className="card-title">
                                            <Link
                                                to={item.type === 'initiative'
                                                    ? `/initiatives/${item.slug || item.id}`
                                                    : item.type === 'project'
                                                        ? `/projects/${item.slug || item.id}`
                                                        : `/clubs/${item.slug || item.id}`} // Добави route за клубове
                                            >
                                                {item.title || item.name} {/* За клубове използвай name */}
                                            </Link>
                                        </h3>

                                        <p className="card-description">
                                            {item.shortDescription || item.fullDescription || item.description}
                                        </p>

                                        {/* Meta Information */}
                                        <div className="card-meta">
                                            {(item.location?.address || item.location?.city) && (
                                                <div className="meta-item">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                    <span>
                                                        {item.type === 'club'
                                                            ? item.location.city
                                                            : extractCityAndCountry(item.location.address)}
                                                    </span>
                                                </div>
                                            )}

                                            {(item.startDate || item.foundedYear) && (
                                                <div className="meta-item">
                                                    <FontAwesomeIcon icon={faCalendar} />
                                                    <span>
                                                        {item.startDate
                                                            ? new Date(item.startDate).toLocaleDateString()
                                                            : item.foundedYear} {/* За клубове показвай година на основаване */}
                                                    </span>
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
                                                    : item.type === 'project'
                                                        ? `/projects/${item.slug || item.id}`
                                                        : `/clubs/${item.slug || item.id}`} // Добави route за клубове
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ScrollToTop />
        </div>
    );
};