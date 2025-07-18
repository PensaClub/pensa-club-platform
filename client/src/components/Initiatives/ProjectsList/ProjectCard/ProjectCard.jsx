import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { getLocationFromCoordinates } from '../../../../utils/getLocationFromCoordinates';
import { truncateText } from '../../../../utils/truncateText';
import './projectCard.css';

const ProjectCard = ({ project, featured = false }) => {
    const { t } = useTranslation();
    const { toggleBookmarkProjects, isBookmarkedProject } = useInitiativeContext();
    const [locationText, setLocationText] = useState('');

    const isBookmarked = isBookmarkedProject(project.id);

    const handleBookmark = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmarkProjects(project.id);
    };

    // Зареждаме локацията от координатите
    useEffect(() => {
        const loadLocation = async () => {
            if (project?.location?.[0]?.coordinates) {
                const coords = project.location[0].coordinates;
                const location = await getLocationFromCoordinates(coords.lat, coords.lng);
                setLocationText(location);
            } else {
                setLocationText(t('location.unknownLocation'));
            }
        };

        loadLocation();
    }, [project, t]);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getProgressPercentage = () => {
        if (!project.milestones?.length) return 0;
        return Math.round((project.completedMilestones || 0) / project.milestones.length * 100);
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            planned: { color: '#64748b', label: t('projects.status.planned') },
            active: { color: '#059669', label: t('projects.status.active') },
            'in-progress': { color: '#d97706', label: t('projects.status.in-progress') },
            completed: { color: '#7c3aed', label: t('projects.status.completed') }
        };
        return statusMap[status] || statusMap.planned;
    };

    const getPriorityInfo = (priority) => {
        const priorityMap = {
            high: { color: '#dc2626', label: t('projects.priority.high') },
            medium: { color: '#d97706', label: t('projects.priority.medium') },
            low: { color: '#059669', label: t('projects.priority.low') }
        };
        return priorityMap[priority] || priorityMap.medium;
    };

    const statusInfo = getStatusInfo(project.status);
    const priorityInfo = getPriorityInfo(project.priority);
    const progressPercentage = getProgressPercentage();

    return (
        <article className={`proj-card ${featured ? 'proj-card--featured' : ''}`}>
            <Link to={`/projects/${project.slug || project.id}`} className="proj-card__link">

                {/* Image Section */}
                <div className="proj-card__image-section">
                    {project.mainImage?.src ? (
                        <img
                            src={project.mainImage.src}
                            alt={project.mainImage.alt || project.title}
                            className="proj-card__image"
                            loading="lazy"
                        />
                    ) : (
                        <div className="proj-card__image-placeholder">
                            <div className="proj-card__placeholder-content">
                                <div className="proj-card__placeholder-title">
                                    {project.title?.substring(0, 2).toUpperCase() || 'PR'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="proj-card__status-overlay">
                        <span
                            className="proj-card__status-badge"
                            style={{ backgroundColor: statusInfo.color }}
                        >
                            {statusInfo.label}
                        </span>
                    </div>

                    {/* Bookmark Button */}
                    <button
                        className={`proj-card__bookmark ${isBookmarked ? 'proj-card__bookmark--active' : ''}`}
                        onClick={handleBookmark}
                        aria-label={isBookmarked ? t('projects.card.removeBookmark') : t('projects.card.addBookmark')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z" />
                        </svg>
                    </button>
                </div>

                {/* Content Section */}
                <div className="proj-card__content">

                    {/* Header Meta */}
                    <div className="proj-card__header-meta">
                        {project.category && (
                            <span className="proj-card__category">{project.category}</span>
                        )}
                        {project.timeline?.startDate && (
                            <span className="proj-card__date">{formatDate(project.timeline.startDate)}</span>
                        )}
                    </div>

                    {/* Title & Description */}
                    <div className="proj-card__text-content">
                        <h3 className="proj-card__title">{project.title}</h3>

                        {project.shortDescription && (
                            <p className="proj-card__description">
                                {truncateText(project.shortDescription, featured ? 120 : 80)}
                            </p>
                        )}
                    </div>

                    {/* Project Metrics */}
                    <div className="proj-card__metrics">
                        {project.budget?.total && (
                            <div className="proj-card__metric">
                                <span className="proj-card__metric-label">{t('projects.card.budget')}</span>
                                <span className="proj-card__metric-value">
                                    {project.budget.total} {project.budget.currency || 'лв'}
                                </span>
                            </div>
                        )}

                        {(project.currentParticipants !== undefined || project.maxParticipants !== undefined) && (
                            <div className="proj-card__metric">
                                <span className="proj-card__metric-label">{t('projects.card.participants')}</span>
                                <span className="proj-card__metric-value">
                                    {project.currentParticipants || 0} / {project.maxParticipants || '∞'}
                                </span>
                            </div>
                        )}

                        {/* Локация - винаги се показва */}
                        <div className="proj-card__metric proj-card__metric--full">
                            <span className="proj-card__metric-label">{t('projects.card.location')}</span>
                            <span className="proj-card__metric-value">
                                {locationText || t('location.loading')}
                            </span>
                        </div>
                    </div>

                    {/* Прогрес бар - винаги се показва */}
                    <div className="proj-card__progress">
                        <div className="proj-card__progress-header">
                            <span className="proj-card__progress-label">{t('projects.card.progress')}</span>
                            <span className="proj-card__progress-percentage">
                                {progressPercentage}%
                            </span>
                        </div>
                        <div className="proj-card__progress-bar">
                            <div
                                className="proj-card__progress-fill"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Initiative Link - винаги се показва */}
                    <div className="proj-card__initiative">
                        <span className="proj-card__initiative-text">
                            {project.initiativeSlug ? (
                                <>
                                    {t('projects.card.partOf')}
                                    <Link
                                        to={`/initiatives/${project.initiativeSlug}`}
                                        className="proj-card__initiative-link"
                                        onClick={(e) => e.stopPropagation()} 
                                    >
                                        <strong>{project.initiativeTitle || t('projects.card.initiative')}</strong>
                                    </Link>
                                </>
                            ) : (
                                <>{t('projects.card.independentProject')}</>
                            )}
                        </span>
                    </div>
                    {/* Priority */}
                    {project.priority && (
                        <div className="proj-card__priority">
                            <span
                                className="proj-card__priority-badge"
                                style={{ color: priorityInfo.color }}
                            >
                                {priorityInfo.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="proj-card__footer">
                    <span className="proj-card__cta">{t('projects.card.viewMore')}</span>
                    <div className="proj-card__arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default ProjectCard;