/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { useClubContext } from '../../contexts/ClubContext';
import {
    Bookmark, Trash2, Eye, Clock, MapPin, Users, Calendar,
    Filter, X, Search, LayoutGrid, List, Heart, MessageSquare
} from 'lucide-react';
import './bookmarkedItems.css';
import { SkeletonCard } from './SkeletonCard';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { useAuthContext } from '../../contexts/UserContext';
import { forumServiceFactory } from '../../Services/forumServiceFactory';

export const BookmarkedItems = () => {
    const { t } = useTranslation('content');
    const {
        bookmarkedInitiatives, bookMarkedProjects, toggleBookmark, toggleBookmarkProjects,
        initiatives, projects, getInitiativeById, getProjectById, isLoading,
    } = useInitiativeContext();
    const { bookmarkedClubs, toggleBookmarkClub, clubs, getClubById, getAllBookmarkedClubs, bookmarksLoaded } = useClubContext();
    const { isAuthentication, userEmail } = useAuthContext();

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [bookmarkedItemsData, setBookmarkedItemsData] = useState({ initiatives: [], projects: [], clubs: [], forum: [] });
    const [isLoadingData, setIsLoadingData] = useState(true);
    const forumService = forumServiceFactory();

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

    useEffect(() => {
        const loadBookmarkedData = async () => {
            setIsLoadingData(true);
            if (isAuthentication && userEmail && !bookmarksLoaded && bookmarkedClubs.length === 0) {
                try { await getAllBookmarkedClubs(userEmail); } catch (error) { console.error('Error loading bookmarked clubs:', error); }
            }

            const initiativesData = [];
            for (const id of bookmarkedInitiatives || []) {
                try {
                    const existing = initiatives.find(init => init.id === id);
                    if (existing) initiativesData.push(existing);
                    else { const data = await getInitiativeById(id); if (data) initiativesData.push(data); }
                } catch (error) { console.error(`Error loading initiative ${id}:`, error); }
            }

            const projectsData = [];
            for (const id of bookMarkedProjects || []) {
                try {
                    const existing = projects.find(proj => proj.id === id);
                    if (existing) projectsData.push(existing);
                    else { const data = await getProjectById(id); if (data) projectsData.push(data); }
                } catch (error) { console.error(`Error loading project ${id}:`, error); }
            }

            const clubsData = [];
            for (const id of bookmarkedClubs || []) {
                try {
                    const existing = clubs.find(club => club.id === id);
                    if (existing) clubsData.push(existing);
                    else { const data = await getClubById(id); if (data) clubsData.push(data); }
                } catch (error) { console.error(`Error loading club ${id}:`, error); }
            }

            // Forum bookmarks
            let forumData = [];
            if (isAuthentication) {
                try {
                    const res = await forumService.getBookmarks({ limit: 50 });
                    forumData = (res.bookmarks || []).map(b => ({
                        ...b.post,
                        bookmarkId: b.id,
                        type: 'forum',
                    })).filter(Boolean);
                } catch (e) {
                    console.error('Error loading forum bookmarks:', e);
                }
            }

            setBookmarkedItemsData({ initiatives: initiativesData, projects: projectsData, clubs: clubsData, forum: forumData });
            setIsLoadingData(false);
        };
        loadBookmarkedData();
    }, [bookmarkedInitiatives?.length, bookMarkedProjects?.length, bookmarkedClubs?.length, isAuthentication, userEmail]);

    const getFilteredItems = () => {
        let items = [];
        if (activeTab === 'all' || activeTab === 'initiatives') items = [...items, ...bookmarkedItemsData.initiatives.map(item => ({ ...item, type: 'initiative' }))];
        if (activeTab === 'all' || activeTab === 'projects') items = [...items, ...bookmarkedItemsData.projects.map(item => ({ ...item, type: 'project' }))];
        if (activeTab === 'all' || activeTab === 'clubs') items = [...items, ...bookmarkedItemsData.clubs.map(item => ({ ...item, type: 'club' }))];
        if (activeTab === 'all' || activeTab === 'forum') items = [...items, ...bookmarkedItemsData.forum];
        if (searchTerm) {
            items = items.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.fullDescription?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return items;
    };

    const handleUnbookmark = async (id, type) => {
        if (type === 'initiative') await toggleBookmark(id);
        else if (type === 'project') await toggleBookmarkProjects(id);
        else if (type === 'club') await toggleBookmarkClub(id);
        else if (type === 'forum') {
            try {
                await forumService.toggleBookmark(id);
                setBookmarkedItemsData(prev => ({ ...prev, forum: prev.forum.filter(f => f.id !== id) }));
            } catch (e) { console.error('Error unbookmarking forum post:', e); }
        }
    };

    const extractCityAndCountry = (fullAddress) => {
        if (!fullAddress) return '';
        const parts = fullAddress.split(',').map(part => part.trim());
        return parts.length >= 2 ? parts.slice(-2).join(', ') : parts[0] || fullAddress;
    };

    const getItemLink = (item) => {
        if (item.type === 'initiative') return `/initiatives/${item.slug || item.id}`;
        if (item.type === 'project') return `/projects/${item.slug || item.id}`;
        if (item.type === 'forum') return `/academy/community/post/${item.slug || item.id}`;
        return `/clubs/${item.slug || item.id}`;
    };

    const getTypeName = (type) => {
        if (type === 'initiative') return t('bookmarks.type.initiative');
        if (type === 'project') return t('bookmarks.type.project');
        if (type === 'forum') return t('bookmarks.type.forum');
        return t('bookmarks.type.club');
    };

    const filteredItems = getFilteredItems();
    const totalCount = (bookmarkedInitiatives?.length || 0) + (bookMarkedProjects?.length || 0) + (bookmarkedClubs?.length || 0) + (bookmarkedItemsData.forum?.length || 0);

    return (
        <div className="bki-container">
            <div className="bki-header">
                <div className="bki-title-row">
                    <Bookmark size={22} className="bki-title-icon" />
                    <h2 className="bki-title">{t('bookmarks.title')}</h2>
                    <span className="bki-total-count">{totalCount}</span>
                </div>

                <div className="bki-search-wrap">
                    <Search size={15} className="bki-search-icon" />
                    <input
                        type="text"
                        placeholder={t('bookmarks.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bki-search-input"
                    />
                    {searchTerm && (
                        <button className="bki-search-clear" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="bki-tabs-row">
                <div className="bki-tabs">
                    {[
                        { key: 'all', icon: Filter, count: totalCount },
                        { key: 'initiatives', icon: Users, count: bookmarkedInitiatives?.length || 0 },
                        { key: 'projects', icon: MapPin, count: bookMarkedProjects?.length || 0 },
                        { key: 'clubs', icon: Heart, count: bookmarkedClubs?.length || 0 },
                        { key: 'forum', icon: MessageSquare, count: bookmarkedItemsData.forum?.length || 0 },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`bki-tab ${activeTab === tab.key ? 'bki-tab-active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <tab.icon size={14} />
                            {t(`bookmarks.tabs.${tab.key}`)} ({tab.count})
                        </button>
                    ))}
                </div>

                <div className="bki-view-switch">
                    <button className={`bki-view-btn ${viewMode === 'grid' ? 'bki-view-btn-active' : ''}`} onClick={() => setViewMode('grid')} title={t('bookmarks.viewMode.grid')}>
                        <LayoutGrid size={16} />
                    </button>
                    <button className={`bki-view-btn ${viewMode === 'list' ? 'bki-view-btn-active' : ''}`} onClick={() => setViewMode('list')} title={t('bookmarks.viewMode.list')}>
                        <List size={16} />
                    </button>
                </div>
            </div>

            <div className="bki-content">
                {isLoadingData ? (
                    <div className={`bki-${viewMode}`}>
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} viewMode={viewMode} />)}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bki-empty">
                        <Bookmark size={48} className="bki-empty-icon" />
                        <h3 className="bki-empty-title">{t('bookmarks.empty.title')}</h3>
                        <p className="bki-empty-text">{t('bookmarks.empty.description')}</p>
                        <Link to="/initiatives" className="bki-explore-btn">
                            {t('bookmarks.empty.exploreButton')}
                        </Link>
                    </div>
                ) : (
                    <div className={`bki-${viewMode}`}>
                        {filteredItems.map(item => (
                            <div key={`${item.type}-${item.id}`} className={`bki-card bki-card-${viewMode}`}>
                                {(item.mainImage?.src || item.mainImage || item.logo || item.coverImage) && (
                                    <div className="bki-card-image">
                                        <img src={item.coverImage || item.mainImage?.src || item.mainImage || item.logo} alt={item.title || item.name} loading="lazy" />
                                        <div className="bki-card-image-overlay">
                                            <Link to={getItemLink(item)} className="bki-view-link">
                                                <Eye size={16} /> {t('bookmarks.viewDetails')}
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                <div className="bki-card-body">
                                    <div className="bki-card-top">
                                        <span className={`bki-type-badge bki-type-${item.type}`}>{getTypeName(item.type)}</span>
                                        <button className="bki-unbookmark" onClick={() => handleUnbookmark(item.id, item.type)} title={t('bookmarks.unbookmark')}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="bki-card-info">
                                        <h3 className="bki-card-title">
                                            <Link to={getItemLink(item)}>{item.title || item.name}</Link>
                                        </h3>
                                        <p className="bki-card-desc">{item.shortDescription || item.fullDescription || item.description}</p>

                                        <div className="bki-card-meta">
                                            {(item.location?.address || item.location?.city) && (
                                                <span className="bki-meta-item">
                                                    <MapPin size={12} />
                                                    {item.type === 'club' ? item.location.city : extractCityAndCountry(item.location.address)}
                                                </span>
                                            )}
                                            {(item.startDate || item.foundedYear) && (
                                                <span className="bki-meta-item">
                                                    <Calendar size={12} />
                                                    {item.startDate ? new Date(item.startDate).toLocaleDateString() : item.foundedYear}
                                                </span>
                                            )}
                                            {item.status && (
                                                <span className={`bki-status bki-status-${item.status}`}>{item.status}</span>
                                            )}
                                        </div>

                                        <div className="bki-card-footer">
                                            <Link to={getItemLink(item)} className="bki-read-more">{t('bookmarks.readMore')} →</Link>
                                            <span className="bki-saved-date"><Clock size={11} /> {t('bookmarks.bookmarkedOn')}</span>
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
