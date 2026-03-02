/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { useLoading } from '../../contexts/LoadingContext';
import { getLocationFromCoordinates } from '../../../utils/getLocationFromCoordinates';

import ProjectCard from './ProjectCard/ProjectCard';
import ProjectFilters from './ProjectFilters/ProjectFilters';
import ProjectSearch from './ProjectSearch/ProjectSearch';
import ProjectsSlider from './ProjectsSlider/ProjectsSlider';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';

import './projectsList.css';
import SEOHead from '../../SEO/SEOHead';

const ProjectsList = () => {
    const { t } = useTranslation('content');
    const location = useLocation();
    const { setIsLoading } = useLoading();

    const {
        getAllProjects,
        projects: contextProjects,
        projectsLoaded,
        projectsHasMore,
        projectsCurrentPage,
        isLoading: contextLoading
    } = useInitiativeContext();

    // State management
    const [allProjects, setAllProjects] = useState([]);
    const [featuredProject, setFeaturedProject] = useState(null);
    const [featuredLocationText, setFeaturedLocationText] = useState('');
    const [sliderProjects, setSliderProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const isFetchingRef = useRef(false);

    // Filter states
    const [activeFilters, setActiveFilters] = useState({
        category: '',
        status: '',
        priority: '',
        initiative: '',
        canApply: false
    });

    const [sortBy, setSortBy] = useState('newest');

    // Зареждаме локацията за featured project
    useEffect(() => {
        const loadFeaturedLocation = async () => {
            if (featuredProject?.location?.[0]?.coordinates) {
                const coords = featuredProject.location[0].coordinates;
                const location = await getLocationFromCoordinates(coords.lat, coords.lng);
                setFeaturedLocationText(location);
            } else {
                setFeaturedLocationText(t('location.unknownLocation'));
            }
        };

        if (featuredProject) {
            loadFeaturedLocation();
        }
    }, [featuredProject, t]);

    // Initial load
    useEffect(() => {
        const fetchProjects = async () => {
            if (isFetchingRef.current) return;

            try {
                isFetchingRef.current = true;
                setIsLoading(true);

                const query = new URLSearchParams(location.search);
                const shouldRefresh = query.get('refresh') === 'true';

                let projectsData;

                if (projectsLoaded && contextProjects.length > 0 && !shouldRefresh) {
                    projectsData = contextProjects;
                } else {
                    await getAllProjects(1, shouldRefresh);
                    projectsData = contextProjects;

                    if (shouldRefresh) {
                        window.history.replaceState({}, document.title, '/projects');
                    }
                }

                processProjects(projectsData);

            } catch (error) {
                console.error("Error loading projects:", error);
                setAllProjects([]);
                setFeaturedProject(null);
                setSliderProjects([]);
            } finally {
                setIsLoading(false);
                isFetchingRef.current = false;
            }
        };

        fetchProjects();
    }, [projectsLoaded, location.search]);

    // Update projects when context changes
    useEffect(() => {
        if (contextProjects.length > 0) {
            processProjects(contextProjects);
        }
    }, [contextProjects]);

    // Process projects for featured/slider
    const processProjects = useCallback((projects) => {
        if (!projects || projects.length === 0) {
            setAllProjects([]);
            setFeaturedProject(null);
            setSliderProjects([]);
            return;
        }

        // Sort by date - newest first
        const sortedProjects = [...projects].sort((a, b) =>
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );

        setAllProjects(sortedProjects);
        setFeaturedProject(sortedProjects[0]);
        setSliderProjects(sortedProjects.slice(1, 7));
    }, []);

    // Handle Load More
    const handleLoadMore = useCallback(() => {
        if (projectsHasMore && !contextLoading) {
            getAllProjects(projectsCurrentPage + 1);
        }
    }, [projectsHasMore, contextLoading, projectsCurrentPage, getAllProjects]);

    // Handle search
    const handleSearch = useCallback((searchTerm) => {
        setSearchTerm(searchTerm);
        applySearchAndFilters(allProjects, searchTerm, activeFilters, sortBy);
    }, [allProjects, activeFilters, sortBy]);

    // Handle filters
    const handleFiltersChange = useCallback((newFilters) => {
        setActiveFilters(newFilters);
        applySearchAndFilters(allProjects, searchTerm, newFilters, sortBy);
    }, [allProjects, searchTerm, sortBy]);

    // Handle sort
    const handleSort = useCallback((sortOption) => {
        setSortBy(sortOption);
        applySearchAndFilters(allProjects, searchTerm, activeFilters, sortOption);
    }, [allProjects, searchTerm, activeFilters]);

    // Combined search and filter function
    const applySearchAndFilters = useCallback((projects, search, filters, currentSort) => {
        let filtered = [...projects];

        // Apply search
        if (search && search.trim()) {
            filtered = filtered.filter(project =>
                project.title?.toLowerCase().includes(search.toLowerCase()) ||
                project.shortDescription?.toLowerCase().includes(search.toLowerCase()) ||
                project.category?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply filters
        if (filters.category) {
            filtered = filtered.filter(project => project.category === filters.category);
        }

        if (filters.status) {
            filtered = filtered.filter(project => project.status === filters.status);
        }

        if (filters.priority) {
            filtered = filtered.filter(project => project.priority === filters.priority);
        }

        if (filters.canApply) {
            filtered = filtered.filter(project => {
                if (!project.applicationDeadline) return false;
                return new Date(project.applicationDeadline) > new Date();
            });
        }

        if (filters.initiative === 'linked') {
            filtered = filtered.filter(project =>
                project.initiativeId || project.initiativeSlug
            );
        } else if (filters.initiative === 'standalone') {
            filtered = filtered.filter(project =>
                !project.initiativeId && !project.initiativeSlug
            );
        }

        // Apply sorting
        filtered = applySorting(filtered, currentSort);

        setFilteredProjects(filtered);
        setIsSearchActive(search.trim() || Object.values(filters).some(f => f));
    }, []);

    const applySorting = useCallback((projects, sortOption) => {
        const sorted = [...projects];

        switch (sortOption) {
            case 'newest':
                return sorted.sort((a, b) =>
                    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
                );
            case 'oldest':
                return sorted.sort((a, b) =>
                    new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
                );
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return sorted.sort((a, b) =>
                    (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
                );
            case 'status':
                const statusOrder = { active: 4, 'in-progress': 3, planned: 2, completed: 1 };
                return sorted.sort((a, b) =>
                    (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0)
                );
            case 'budget':
                return sorted.sort((a, b) =>
                    (b.budget?.total || 0) - (a.budget?.total || 0)
                );
            case 'deadline':
                return sorted.sort((a, b) => {
                    const aDeadline = a.applicationDeadline ? new Date(a.applicationDeadline) : new Date('2099-12-31');
                    const bDeadline = b.applicationDeadline ? new Date(b.applicationDeadline) : new Date('2099-12-31');
                    return aDeadline - bDeadline;
                });
            default:
                return sorted;
        }
    }, []);

    const getStatLabel = (count, type) => {
        const isPlural = count !== 1;
        return t(`projects.stats.${type}.${isPlural ? 'plural' : 'singular'}`);
    };

    // Get displayed projects
    const displayedProjects = isSearchActive ? filteredProjects : allProjects;

    const hasMoreProjects = !isSearchActive && projectsHasMore;

    useEffect(() => {
        if (allProjects.length > 0) {
            applySearchAndFilters(allProjects, searchTerm, activeFilters, sortBy);
        }
    }, [allProjects, applySearchAndFilters, searchTerm, activeFilters, sortBy]);

    // Handle slider click
    const handleSlideClick = useCallback((project) => {
        setFeaturedProject(project);
        const newSliderProjects = [...sliderProjects];
        const index = newSliderProjects.findIndex(item => item.id === project.id);
        if (index !== -1) {
            newSliderProjects[index] = featuredProject;
            setSliderProjects(newSliderProjects);
        }

        setTimeout(() => {
            document.querySelector('.featured-project')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }, [featuredProject, sliderProjects]);

    const getStatusInfo = (status) => {
        const statusMap = {
            planned: { color: '#64748b', icon: '📋' },
            active: { color: '#059669', icon: '⚡' },
            'in-progress': { color: '#d97706', icon: '🔄' },
            completed: { color: '#7c3aed', icon: '✅' }
        };
        return statusMap[status] || statusMap.planned;
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Проверка дали да се показва секцията с участници
    const shouldShowParticipants = (project) => {
        return (project.currentParticipants && project.currentParticipants > 0) ||
            (project.maxParticipants && project.maxParticipants > 0);
    };

    // Calculate stats
    const stats = {
        total: allProjects.length,
        active: allProjects.filter(p => p.status === 'active').length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        canApply: allProjects.filter(p => p.applicationDeadline && new Date(p.applicationDeadline) > new Date()).length
    };
    const metaData = useMemo(() => {
        let title, description;

        if (searchTerm) {
            title = `${t('projects.meta.searchResults')} "${searchTerm}" | Pensa Club`;
            description = `${t('projects.meta.searchDescription')} "${searchTerm}". ${t('projects.meta.foundProjects')} ${filteredProjects.length} ${getStatLabel(filteredProjects.length, 'total')}.`;
        } else if (activeFilters.category) {
            title = `${t('projects.meta.categoryProjects')} ${activeFilters.category} | Pensa Club`;
            description = `${t('projects.meta.categoryDescription')} ${activeFilters.category}. ${t('projects.meta.availableProjects')} ${filteredProjects.length} ${getStatLabel(filteredProjects.length, 'total')}.`;
        } else {
            title = `${t('projects.meta.title')} | Pensa Club`;
            description = `${t('projects.meta.description')} ${stats.total} ${getStatLabel(stats.total, 'total')}, ${stats.active} ${getStatLabel(stats.active, 'active')}.`;
        }

        const baseKeywords = [
            'проекти за пенсионери',
            'инициативи България',
            'дигитална грамотност',
            'активни пенсионери',
            'обучение възрастни',
            'Pensa Club',
            'EU проекти'
        ];

        if (activeFilters.category) {
            baseKeywords.push(activeFilters.category.toLowerCase());
        }

        if (searchTerm) {
            baseKeywords.push(searchTerm.toLowerCase());
        }

        const keywords = baseKeywords.join(', ');
        const image = featuredProject?.mainImage?.src || '/images/iniciatives/iniciatives-2.jpg';

        return { title, description, keywords, image };
    }, [searchTerm, activeFilters.category, filteredProjects.length, stats.total, stats.active, t, featuredProject]);

    const structuredData = useMemo(() => {
        const projectsToShow = isSearchActive ? filteredProjects.slice(0, 10) : allProjects.slice(0, 10);

        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Проекти за пенсионери - Pensa Club",
            "description": metaData.description,
            "url": "https://pensa.club/projects",
            "numberOfItems": isSearchActive ? filteredProjects.length : stats.total,
            "itemListElement": projectsToShow.map((project, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "CreativeWork",
                    "name": project.title,
                    "description": project.shortDescription,
                    "url": `https://pensa.club/projects/${project.slug}`,
                    "image": project.mainImage?.src || "https://pensa.club/images/iniciatives/iniciatives-2.jpg",
                    "genre": project.category,
                    "keywords": project.tags?.join(', '),
                    ...(project.budget?.total && {
                        "offers": {
                            "@type": "Offer",
                            "price": project.budget.total,
                            "priceCurrency": project.budget.currency || "BGN"
                        }
                    }),
                    ...(project.timeline?.startDate && {
                        "datePublished": project.timeline.startDate
                    }),
                    "creator": {
                        "@type": "Organization",
                        "name": "Pensa Club"
                    },
                    "inLanguage": "bg"
                }
            }))
        };
    }, [isSearchActive, filteredProjects, allProjects, stats.total, metaData.description]);

    return (
        <>
            <SEOHead
                title={metaData.title}
                description={metaData.description}
                keywords={metaData.keywords}
                image={metaData.image}
                type="website"
                structuredData={structuredData}
            />
            <div className="projects-list-container">
                {/* Hero Section */}
                <div className="starfield"></div>
                <section className="projects-hero">
                    <div className="projects-hero-content-wrapper">
                        <div className="floating-keywords">
                            <div className="connecting-lines">
                                <svg className="line-svg">
                                    <path
                                        d="M0,50 Q150,170 300,160 Q400,150 500,180"
                                        className="animated-line"
                                    />
                                    <path
                                        d="M-50,130 Q150,210 300,180 Q400,210 500,200"
                                        className="animated-line"
                                        style={{ animationDelay: '-2s' }}
                                    />
                                    <path
                                        d="M0,220 Q100,200 300,230 Q400,270 500,250"
                                        className="animated-line"
                                        style={{ animationDelay: '-4s' }}
                                    />
                                    <path
                                        d="M0,320 Q150,300 310,320 Q500,300 500,220"
                                        className="animated-line"
                                        style={{ animationDelay: '-4s' }}
                                    />
                                </svg>
                            </div>
                            <div className="keyword-tag">{t('projects.hero.keywords.innovation')}</div>
                            <div className="keyword-tag">{t('projects.hero.keywords.technology')}</div>
                            <div className="keyword-tag">{t('projects.hero.keywords.future')}</div>
                            <div className="keyword-tag">{t('projects.hero.keywords.development')}</div>
                        </div>

                        <div className="hero-content">
                            <div className="hero-badge">
                                <span className="badge-icon">🚀</span>
                                <span>{t('projects.list.badge')}</span>
                            </div>
                            <h1 className="hero-title">{t('projects.list.title')}</h1>
                            <p className="hero-subtitle">{t('projects.list.subtitle')}</p>
                        </div>

                        <div className="hero-visual">
                            <div className="right-connecting-lines">
                                <svg className="line-svg">
                                    <path
                                        d="M500,50 Q350,170 200,160 Q100,160 0,200"
                                        className="animated-line"
                                    />
                                    <path
                                        d="M500,150 Q350,210 300,200 Q100,210 0,200"
                                        className="animated-line"
                                        style={{ animationDelay: '-2s' }}
                                    />
                                    <path
                                        d="M500,240 Q370,240 290,260 Q100,300 0,200"
                                        className="animated-line"
                                        style={{ animationDelay: '-4s' }}
                                    />
                                    <path
                                        d="M500,320 Q350,300 200,320 Q100,320 0,250"
                                        className="animated-line"
                                        style={{ animationDelay: '-4s' }}
                                    />
                                </svg>
                            </div>
                            <div className="right-floating-keywords">
                                <div className="keyword-tag">{t('projects.hero.keywords.causes')}</div>
                                <div className="keyword-tag">{t('projects.hero.keywords.health')}</div>
                                <div className="keyword-tag">{t('projects.hero.keywords.society')}</div>
                                <div className="keyword-tag">{t('projects.hero.keywords.culture')}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="projects-stats">
                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <div className="stat-number-projects">{stats.total}</div>
                                <div className="stat-label">{getStatLabel(stats.total, 'total')}</div>
                            </div>
                        </div>
                        <div className="stat-card featured">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-content">
                                <div className="stat-number-projects">{stats.active}</div>
                                <div className="stat-label">{getStatLabel(stats.active, 'active')}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <div className="stat-number-projects">{stats.completed}</div>
                                <div className="stat-label">{getStatLabel(stats.completed, 'completed')}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👋</div>
                            <div className="stat-content">
                                <div className="stat-number-projects">{stats.canApply}</div>
                                <div className="stat-label">{getStatLabel(stats.canApply, 'canApply')}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="projects-content">
                    {/* Featured Project */}
                    {featuredProject && (
                        <section className="featured-project-section">
                            <div className="featured-project-container">
                                <div className="featured-project-header">
                                    <h2 className="featured-project-title">{t('projects.list.featured')}</h2>
                                    <div className="featured-project-line"></div>
                                </div>

                                <div className="featured-project-card">
                                    <div className="featured-project-image">
                                        {featuredProject.mainImage?.src ? (
                                            <img
                                                src={featuredProject.mainImage.src}
                                                alt={featuredProject.mainImage.alt || featuredProject.title}
                                                className="featured-project-img"
                                            />
                                        ) : (
                                            <div className="featured-project-placeholder">
                                                <span className="featured-placeholder-icon">🚀</span>
                                            </div>
                                        )}

                                        <div className="featured-project-badges">
                                            {featuredProject.status && (
                                                <span className={`featured-status-badge featured-status-${featuredProject.status}`}>
                                                    {getStatusInfo(featuredProject.status).icon} {t(`projects.status.${featuredProject.status}`)}
                                                </span>
                                            )}
                                            {featuredProject.priority && (
                                                <span className={`featured-priority-badge featured-priority-${featuredProject.priority}`}>
                                                    {t(`projects.priority.${featuredProject.priority}`)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="featured-project-content">
                                        <div className="featured-project-meta">
                                            {featuredProject.category && (
                                                <span className="featured-meta-category">
                                                    🏷️ {featuredProject.category}
                                                </span>
                                            )}
                                            {featuredProject.timeline?.startDate && (
                                                <span className="featured-meta-date">
                                                    📅 {formatDate(featuredProject.timeline.startDate)}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="featured-project-name">{featuredProject.title}</h3>

                                        {featuredProject.shortDescription && (
                                            <p className="featured-project-description">{featuredProject.shortDescription}</p>
                                        )}

                                        {/* Project Details */}
                                        <div className="featured-project-details">
                                            {featuredProject.budget?.total && (
                                                <div className="featured-detail-item">
                                                    <span className="featured-detail-icon">💰</span>
                                                    <span className="featured-detail-label">{t('projects.card.budget')}</span>
                                                    <span className="featured-detail-value">
                                                        {featuredProject.budget.total} {featuredProject.budget.currency || 'лв.'}
                                                    </span>
                                                </div>
                                            )}

                                            {shouldShowParticipants(featuredProject) && (
                                                <div className="featured-detail-item">
                                                    <span className="featured-detail-icon">👥</span>
                                                    <span className="featured-detail-label">{t('projects.card.participants')}</span>
                                                    <span className="featured-detail-value">
                                                        {featuredProject.currentParticipants || 0} / {featuredProject.maxParticipants || '∞'}
                                                    </span>
                                                </div>
                                            )}

                                            {featuredLocationText && (
                                                <div className="featured-detail-item">
                                                    <span className="featured-detail-icon">📍</span>
                                                    <span className="featured-detail-label">{t('projects.card.location')}</span>
                                                    <span className="featured-detail-value">{featuredLocationText}</span>
                                                </div>
                                            )}
                                        </div>

                                        {featuredProject.milestones?.length > 0 && (
                                            <div className="featured-progress-section">
                                                <div className="featured-progress-header">
                                                    <span className="featured-progress-label">{t('projects.card.progress')}</span>
                                                    <span className="featured-progress-value">
                                                        {Math.round((featuredProject.completedMilestones || 0) / featuredProject.milestones.length * 100)}%
                                                    </span>
                                                </div>
                                                <div className="featured-progress-bar">
                                                    <div
                                                        className="featured-progress-fill"
                                                        style={{
                                                            width: `${(featuredProject.completedMilestones || 0) / featuredProject.milestones.length * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {featuredProject.initiativeSlug && (
                                            <div className="featured-initiative-link">
                                                <span className="featured-link-icon">🔗</span>
                                                <span className="featured-link-text">
                                                    {t('projects.card.partOf')}
                                                    <strong>{featuredProject.initiativeTitle || t('projects.card.initiative')}</strong>
                                                </span>
                                            </div>
                                        )}

                                        <div className="featured-project-actions">
                                            <Link
                                                to={`/projects/${featuredProject.slug || featuredProject.id}`}
                                                className="featured-view-btn"
                                            >
                                                <span className="featured-btn-text">{t('projects.card.viewMore')}</span>
                                                <span className="featured-btn-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                                                    </svg>
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Projects Slider */}
                    {sliderProjects.length > 0 && (
                        <section className="slider-section">
                            <div className="section-header">
                                <h2 className="section-title">{t('projects.list.latest')}</h2>
                                <div className="section-line"></div>
                            </div>
                            <ProjectsSlider
                                projects={sliderProjects}
                                onSlideClick={handleSlideClick}
                            />
                        </section>
                    )}

                    {/* Controls Section */}
                    <section className="controls-section">
                        <div className="controls-header">
                            <h2 className="section-title">{t('projects.list.allProjects')}</h2>
                            <div className="controls-right">
                                <ProjectSearch onSearch={handleSearch} />
                            </div>
                        </div>

                        <div className="controls-filters">
                            <ProjectFilters
                                activeFilters={activeFilters}
                                onFiltersChange={handleFiltersChange}
                                sortBy={sortBy}
                                onSortChange={handleSort}
                            />
                        </div>
                    </section>

                    {/* Search Results Info */}
                    {isSearchActive && (
                        <section className="proj-search-results">
                            <div className="proj-search-results__info">
                                <p className="proj-search-results__text">
                                    Намерени <strong>{filteredProjects.length}</strong> резултата за:
                                    <span className="proj-search-results__term">"{searchTerm}"</span>
                                </p>
                                <button
                                    className="proj-search-results__clear"
                                    onClick={() => {
                                        setIsSearchActive(false);
                                        setFilteredProjects([]);
                                        setSearchTerm('');
                                    }}
                                >
                                    Изчисти търсенето ✕
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Projects Grid */}
                    <section className="projects-grid-section">
                        {displayedProjects.length > 0 ? (
                            <div className="projects-grid">
                                {displayedProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3 className="empty-title">
                                    {isSearchActive
                                        ? t('projects.list.noSearchResults')
                                        : t('projects.list.noProjects')
                                    }
                                </h3>
                                <p className="empty-subtitle">
                                    {t('projects.list.emptySubtitle')}
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Load More Section */}
                    {hasMoreProjects && !contextLoading && (
                        <section className="projects-list-load-more-section">
                            <button
                                type="button"
                                className="projects-list-load-more-btn"
                                onClick={handleLoadMore}
                                disabled={contextLoading}
                            >
                                {contextLoading ? (
                                    <>
                                        <div className="projects-list-load-more-spinner"></div>
                                        {t('projects.loadMore.loading')}
                                    </>
                                ) : (
                                    <>
                                        {t('projects.loadMore.button')}
                                        <span className="projects-list-load-more-arrow">↓</span>
                                    </>
                                )}
                            </button>
                            <div className="projects-list-load-more-info">
                                {t('projects.loadMore.info', {
                                    displayed: displayedProjects.length,
                                    page: projectsCurrentPage
                                })}
                            </div>
                        </section>
                    )}

                    {/* Loading indicator */}
                    {contextLoading && (
                        <div className="projects-list-loading-container">
                            <div className="projects-list-loading-spinner"></div>
                            <p>{t('projects.loadMore.loading')}</p>
                        </div>
                    )}
                </div>

                <ScrollToTop />
            </div>
        </>
    );
};

export default ProjectsList;