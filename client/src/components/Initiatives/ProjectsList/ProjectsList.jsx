/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { useLoading } from '../../contexts/LoadingContext';

import ProjectCard from './ProjectCard/ProjectCard';
import ProjectFilters from './ProjectFilters/ProjectFilters';
import ProjectSearch from './ProjectSearch/ProjectSearch';
import ProjectsSlider from './ProjectsSlider/ProjectsSlider';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';

import './projectsList.css';
import Pagination from '../../Articles/Pagination/Pagination';
import { formatLocation } from '../../../utils/formatLocation';

const ProjectsList = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { setIsLoading } = useLoading();

    const {
        getAllProjects,
        projects: contextProjects,
        projectsLoaded,
        projectsHasMore,
        projectsCurrentPage
    } = useInitiativeContext();

    // State management
    const [allProjects, setAllProjects] = useState([]);
    const [featuredProject, setFeaturedProject] = useState(null);
    const [sliderProjects, setSliderProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(9);
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

    useEffect(() => {
        const fetchProjects = async () => {
            // Предотвратяваме duplicate заявки
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
                    const response = await getAllProjects(1, shouldRefresh);
                    projectsData = response.data || [];

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
        setSliderProjects(sortedProjects.slice(1, 7)); // Show 6 in slider
    }, []);

    // Handle search
    const handleSearch = useCallback((searchTerm) => {

        setSearchTerm(searchTerm);

        if (!searchTerm.trim()) {
            setIsSearchActive(false);
            setFilteredProjects([]);
            setCurrentPage(1);
            return;
        }

        const results = allProjects.filter(project =>
            project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredProjects(results);
        setIsSearchActive(true);
        setCurrentPage(1);
    }, [allProjects]);

    // Handle filters
    const handleFiltersChange = useCallback((newFilters) => {
        setActiveFilters(newFilters);
        setCurrentPage(1);

        applyFilters(newFilters, sortBy);
    }, [sortBy]);

    const applyFilters = useCallback((filters, currentSort) => {

        let filtered = [...allProjects];

        // Филтър по категория
        if (filters.category) {
            filtered = filtered.filter(project =>
                project.category === filters.category
            );
        }

        // Филтър по статус
        if (filters.status) {
            filtered = filtered.filter(project =>
                project.status === filters.status
            );
        }

        // Филтър по приоритет
        if (filters.priority) {
            filtered = filtered.filter(project =>
                project.priority === filters.priority
            );
        }

        // Филтър "Мога да кандидатствам"
        if (filters.canApply) {
            filtered = filtered.filter(project => {
                // Провери дали има отворени кандидатури
                if (!project.applicationDeadline) return false;
                return new Date(project.applicationDeadline) > new Date();
            });
        }

        // Филтър по инициатива
        if (filters.initiative === 'linked') {
            filtered = filtered.filter(project =>
                project.initiativeId || project.initiativeSlug
            );
        } else if (filters.initiative === 'standalone') {
            filtered = filtered.filter(project =>
                !project.initiativeId && !project.initiativeSlug
            );
        }

        // Приложи сортиране
        filtered = applySorting(filtered, currentSort);

        setFilteredProjects(filtered);
        setIsSearchActive(filtered.length !== allProjects.length || Object.values(filters).some(f => f));
    }, [allProjects]);

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
    // Handle sort
    const handleSort = useCallback((sortOption) => {
        setSortBy(sortOption);
        applyFilters(activeFilters, sortOption);
    }, [activeFilters, applyFilters]);

    // Get displayed projects
    const displayedProjects = isSearchActive ? filteredProjects : allProjects;
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = displayedProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(displayedProjects.length / projectsPerPage);

    useEffect(() => {
        if (allProjects.length > 0) {
            applyFilters(activeFilters, sortBy);
        }
    }, [allProjects, applyFilters, activeFilters, sortBy]);
    // Handle slider click
    const handleSlideClick = useCallback((project) => {
        setFeaturedProject(project);
        const newSliderProjects = [...sliderProjects];
        const index = newSliderProjects.findIndex(item => item.id === project.id);
        if (index !== -1) {
            newSliderProjects[index] = featuredProject;
            setSliderProjects(newSliderProjects);
        }

        // Smooth scroll to featured
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
    // Calculate stats
    const stats = {
        total: allProjects.length,
        active: allProjects.filter(p => p.status === 'active').length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        canApply: allProjects.filter(p => p.applicationDeadline && new Date(p.applicationDeadline) > new Date()).length
    };
    const getPageTitle = () => {
        if (searchTerm) {
            return `${t('projects.meta.searchResults')} "${searchTerm}" | Pensa Club`;
        }

        if (activeFilters.category) {
            return `${t('projects.meta.categoryProjects')} ${activeFilters.category} | Pensa Club`;
        }

        return `${t('projects.meta.title')} | Pensa Club`;
    };

    const getPageDescription = () => {
        if (searchTerm) {
            return `${t('projects.meta.searchDescription')} "${searchTerm}". ${t('projects.meta.foundProjects')} ${filteredProjects.length} ${getStatLabel(filteredProjects.length, 'total')}.`;
        }

        if (activeFilters.category) {
            return `${t('projects.meta.categoryDescription')} ${activeFilters.category}. ${t('projects.meta.availableProjects')} ${filteredProjects.length} ${getStatLabel(filteredProjects.length, 'total')}.`;
        }

        return `${t('projects.meta.description')} ${stats.total} ${getStatLabel(stats.total, 'total')}, ${stats.active} ${getStatLabel(stats.active, 'active')}.`;
    };

    const getKeywords = () => {
        const baseKeywords = [
            'проекти за пенсионери',
            'инициативи България',
            'дигитална грамотност',
            'активни пенсионери',
            'обучение възрастни',
            'Pensa Club'
        ];

        if (activeFilters.category) {
            baseKeywords.push(activeFilters.category.toLowerCase());
        }

        if (searchTerm) {
            baseKeywords.push(searchTerm.toLowerCase());
        }

        return baseKeywords.join(', ');
    };

    const getStructuredData = () => {
        const projectsToShow = isSearchActive ? filteredProjects.slice(0, 10) : allProjects.slice(0, 10);

        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Проекти за пенсионери",
            "description": getPageDescription(),
            "url": "https://www.pensa.club/projects",
            "numberOfItems": isSearchActive ? filteredProjects.length : allProjects.length,
            "itemListElement": projectsToShow.map((project, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Project",
                    "name": project.title,
                    "description": project.shortDescription,
                    "url": `https://www.pensa.club/projects/${project.slug}`,
                    "image": project.mainImage?.src,
                    "category": project.category,
                    "status": project.status
                }
            }))
        };
    };

    return (
        <>
            <Helmet>
                <title>{getPageTitle()}</title>
                <meta name="description" content={getPageDescription()} />
                <meta name="keywords" content={getKeywords()} />

                {/* Open Graph мета данни */}
                <meta property="og:title" content={getPageTitle()} />
                <meta property="og:description" content={getPageDescription()} />
                <meta property="og:image" content="https://www.pensa.club/images/projects-og-image.jpg" />
                <meta property="og:url" content="https://www.pensa.club/projects" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Pensa Club" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={getPageTitle()} />
                <meta name="twitter:description" content={getPageDescription()} />
                <meta name="twitter:image" content="https://www.pensa.club/images/projects-twitter-image.jpg" />

                {/* Допълнителни мета данни */}
                <meta name="robots" content="index, follow" />
                <meta name="author" content="Pensa Club" />
                <link rel="canonical" href="https://www.pensa.club/projects" />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(getStructuredData())}
                </script>

                {/* Алтернативни езици */}
                <link rel="alternate" hreflang="bg" href="https://www.pensa.club/bg/projects" />
                <link rel="alternate" hreflang="en" href="https://www.pensa.club/en/projects" />
            </Helmet>
            <div className="projects-list-container">
                {/* Hero Section */}
                <div className="starfield"></div>
                <section className="projects-hero">
                    <div className="projects-hero-content-wrapper">
                        {/* ЛЯВО: Floating keywords + Connecting lines */}
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
                            <div className="keyword-tag">Иновации</div>
                            <div className="keyword-tag">Технологии</div>
                            <div className="keyword-tag">Бъдеще</div>
                            <div className="keyword-tag">Развитие</div>
                        </div>

                        {/* СРЕДАТА: Hero content */}
                        <div className="hero-content">
                            <div className="hero-badge">
                                <span className="badge-icon">🚀</span>
                                <span>{t('projects.list.badge')}</span>
                            </div>
                            <h1 className="hero-title">{t('projects.list.title')}</h1>
                            <p className="hero-subtitle">{t('projects.list.subtitle')}</p>
                        </div>

                        {/* ДЯСНО: Right floating keywords + Right connecting lines */}
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
                                <div className="keyword-tag">Каузи</div>
                                <div className="keyword-tag">Здраве</div>
                                <div className="keyword-tag">Общество</div>
                                <div className="keyword-tag">Култура</div>
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

                                        {/* Badges */}
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

                                            {(featuredProject.currentParticipants !== undefined || featuredProject.maxParticipants !== undefined) && (
                                                <div className="featured-detail-item">
                                                    <span className="featured-detail-icon">👥</span>
                                                    <span className="featured-detail-label">{t('projects.card.participants')}</span>
                                                    <span className="featured-detail-value">
                                                        {featuredProject.currentParticipants || 0} / {featuredProject.maxParticipants || '∞'}
                                                    </span>
                                                </div>
                                            )}

                                            {featuredProject.location?.[0]?.address && (
                                                <div className="featured-detail-item">
                                                    <span className="featured-detail-icon">📍</span>
                                                    <span className="featured-detail-label">{t('projects.card.location')}</span>
                                                    <span className="featured-detail-value">{formatLocation(featuredProject.location)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress if available */}
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

                                        {/* Initiative Link */}
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
                        {currentProjects.length > 0 ? (
                            <div className="projects-grid">
                                {currentProjects.map(project => (
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <section className="pagination-section">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </section>
                    )}
                </div>

                <ScrollToTop />
            </div>
        </>
    );
};

export default ProjectsList;