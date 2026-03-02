// components/Projects/DraftProjects/DraftProjects.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faEdit, faEye, faTrash, faShare, faImage,
    faCalendarAlt, faInfoCircle, faCheckCircle, faExclamationTriangle,
    faProjectDiagram, faUser, faSpinner
} from '@fortawesome/free-solid-svg-icons';

import { calculateProjectProgress } from '../utils/projectProgressUtils';
import './draftProjects.css';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { notify } from '../../../../utils/notify.jsx';

const DraftProjects = () => {
    const { t } = useTranslation('content');
    const navigate = useLocalizedNavigate();
    
    const {
        getAllProjectDrafts,
        deleteDraftProject,
        toggleProjectDraftStatus,
        projectDrafts,
        projectDraftsLoaded,
        projectDraftsHasMore,
        projectDraftsCurrentPage,
        isLoading,
        invalidateProjectDraftsCache
    } = useInitiativeContext();

    const [selectedDrafts, setSelectedDrafts] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

   useEffect(() => {
    if (!projectDraftsLoaded) {
        getAllProjectDrafts(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectDraftsLoaded]);

    // Handle draft actions
    const handleEdit = useCallback((draft) => {
        navigate('/profile/projects-create', {
            state: {
                editMode: true,
                draftData: draft
            }
        });
    }, [navigate]);

    const handlePreview = useCallback((draft) => {
        navigate('/profile/project-preview', {
            state: {
                previewData: draft
            }
        });
    }, [navigate]);

    const handleDelete = useCallback(async (draft) => {
        if (deleteConfirm?.id === draft.id) {
            try {
                setIsDeleting(true);
                await deleteDraftProject(draft.id);
                setDeleteConfirm(null);
                notify('success', t('projects.drafts.deleteSuccess'));
            } catch (error) {
                console.error('Error deleting draft:', error);
                notify('error', t('projects.drafts.deleteError'));
            } finally {
                setIsDeleting(false);
            }
        } else {
            setDeleteConfirm(draft);
        }
    }, [deleteDraftProject, deleteConfirm, t]);

    const handlePublish = useCallback(async (draft) => {
        try {
            setIsPublishing(true);
            await toggleProjectDraftStatus(draft.id);
            notify('success', t('projects.drafts.publishSuccess'));
        } catch (error) {
            console.error('Error publishing draft:', error);
            notify('error', t('projects.drafts.publishError'));
        } finally {
            setIsPublishing(false);
        }
    }, [toggleProjectDraftStatus, t]);

    const handleNewProject = useCallback(() => {
        navigate('/profile/project-create');
    }, [navigate]);

    const handleLoadMore = useCallback(async () => {
        if (!isLoading && projectDraftsHasMore) {
            await getAllProjectDrafts(projectDraftsCurrentPage + 1);
        }
    }, [getAllProjectDrafts, isLoading, projectDraftsHasMore, projectDraftsCurrentPage]);

    const handleRefresh = useCallback(() => {
        invalidateProjectDraftsCache();
        getAllProjectDrafts(1, true);
    }, [invalidateProjectDraftsCache, getAllProjectDrafts]);

    // Format date helper
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bg-BG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        const statusColors = {
            'planned': '#3498db',
            'active': '#2ecc71',
            'in-progress': '#f39c12',
            'completed': '#9b59b6'
        };
        return statusColors[status] || '#95a5a6';
    };

    // Get progress color
    const getProgressColor = (progress) => {
        if (progress < 30) return '#e74c3c';
        if (progress < 70) return '#f39c12';
        return '#2ecc71';
    };

    return (
        <div className="draft-projects-container">
            {/* Header */}
            <div className="draft-projects-header">
                <div className="draft-projects-title-section">
                    <h1 className="draft-projects-title">
                        <FontAwesomeIcon icon={faProjectDiagram} />
                        {t('projects.drafts.title')}
                    </h1>
                    <p className="draft-projects-subtitle">
                        {t('projects.drafts.subtitle')}
                    </p>
                </div>

                <div className="draft-projects-actions">
                    <button
                        className="draft-projects-btn refresh"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={faSpinner} spin={isLoading} />
                        {t('projects.drafts.refresh')}
                    </button>
                    
                    <button
                        className="draft-projects-btn primary"
                        onClick={handleNewProject}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        {t('projects.drafts.newProject')}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="draft-projects-stats">
                <div className="draft-projects-stat">
                    <div className="stat-number-draft">{projectDrafts.length}</div>
                    <div className="stat-label-draft">{t('projects.drafts.totalDrafts')}</div>
                </div>
                <div className="draft-projects-stat">
                    <div className="stat-number-draft">
                        {projectDrafts.filter(d => calculateProjectProgress(d) > 70).length}
                    </div>
                    <div className="stat-label-draft">{t('projects.drafts.readyToPublish')}</div>
                </div>
                <div className="draft-projects-stat">
                    <div className="stat-number-draft">
                        {projectDrafts.filter(d => {
                            const daysSinceUpdate = Math.floor((Date.now() - new Date(d.updatedAt)) / (1000 * 60 * 60 * 24));
                            return daysSinceUpdate > 7;
                        }).length}
                    </div>
                    <div className="stat-label-draft">{t('projects.drafts.oldDrafts')}</div>
                </div>
            </div>

            {/* Content */}
            <div className="draft-projects-content">
                {!projectDraftsLoaded && isLoading ? (
                    <div className="draft-projects-loading">
                        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                        <p>{t('projects.drafts.loading')}</p>
                    </div>
                ) : projectDrafts.length === 0 ? (
                    <div className="draft-projects-empty">
                        <FontAwesomeIcon icon={faProjectDiagram} size="4x" />
                        <h3>{t('projects.drafts.noDrafts')}</h3>
                        <p>{t('projects.drafts.noDraftsDescription')}</p>
                        <button
                            className="draft-projects-btn primary"
                            onClick={handleNewProject}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {t('projects.drafts.createFirst')}
                        </button>
                    </div>
                ) : (
                    <div className="draft-projects-grid">
                        {projectDrafts.map((draft) => {
                            const progress = calculateProjectProgress(draft);
                            const isConfirmingDelete = deleteConfirm?.id === draft.id;
                            
                            return (
                                <div key={draft.id} className="draft-project-card">
                                    {/* Card Header */}
                                    <div className="draft-project-card-header">
                                        <div className="draft-project-card-image">
                                            {draft.mainImage?.src ? (
                                                <img 
                                                    src={draft.mainImage.src} 
                                                    alt={draft.mainImage.alt || draft.title}
                                                />
                                            ) : (
                                                <div className="draft-project-card-placeholder">
                                                    <FontAwesomeIcon icon={faImage} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="draft-project-card-badges">
                                            {draft.status && (
                                                <span 
                                                    className="draft-project-status-badge"
                                                    style={{ backgroundColor: getStatusColor(draft.status) }}
                                                >
                                                    {t(`projects.status.${draft.status}`)}
                                                </span>
                                            )}
                                            {draft.priority && (
                                                <span className={`draft-project-priority-badge ${draft.priority}`}>
                                                    {t(`projects.priority.${draft.priority}`)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="draft-project-card-content">
                                        <h3 className="draft-project-card-title">
                                            {draft.title || t('projects.drafts.untitled')}
                                        </h3>
                                        
                                        {draft.shortDescription && (
                                            <p className="draft-project-card-description">
                                                {draft.shortDescription}
                                            </p>
                                        )}

                                        <div className="draft-project-card-meta">
                                            <div className="draft-project-meta-item">
                                                <FontAwesomeIcon icon={faCalendarAlt} />
                                                <span>{formatDate(draft.updatedAt || draft.createdAt)}</span>
                                            </div>
                                            {draft.category && (
                                                <div className="draft-project-meta-item">
                                                    <FontAwesomeIcon icon={faInfoCircle} />
                                                    <span>{draft.category}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="draft-project-progress">
                                            <div className="draft-project-progress-header">
                                                <span className="draft-project-progress-label">
                                                    {t('projects.drafts.completion')}
                                                </span>
                                                <span 
                                                    className="draft-project-progress-percentage"
                                                    style={{ color: getProgressColor(progress) }}
                                                >
                                                    {progress}%
                                                </span>
                                            </div>
                                            <div className="draft-project-progress-bar">
                                                <div 
                                                    className="draft-project-progress-fill"
                                                    style={{ 
                                                        width: `${progress}%`,
                                                        backgroundColor: getProgressColor(progress)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="draft-project-card-actions">
                                        <button
                                            className="draft-project-action-btn edit"
                                            onClick={() => handleEdit(draft)}
                                            title={t('projects.drafts.edit')}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        
                                        <button
                                            className="draft-project-action-btn preview"
                                            onClick={() => handlePreview(draft)}
                                            title={t('projects.drafts.preview')}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>

                                        <button
                                            className={`draft-project-action-btn delete ${isConfirmingDelete ? 'confirming' : ''}`}
                                            onClick={() => handleDelete(draft)}
                                            disabled={isDeleting}
                                            title={isConfirmingDelete ? t('projects.drafts.confirmDelete') : t('projects.drafts.delete')}
                                        >
                                            <FontAwesomeIcon 
                                                icon={isConfirmingDelete ? faExclamationTriangle : faTrash} 
                                                spin={isDeleting}
                                            />
                                        </button>

                                        <button
                                            className="draft-project-action-btn publish"
                                            onClick={() => handlePublish(draft)}
                                            disabled={isPublishing || progress < 50}
                                            title={
                                                progress < 50 
                                                    ? t('projects.drafts.completeMore')
                                                    : t('projects.drafts.publish')
                                            }
                                        >
                                            <FontAwesomeIcon 
                                                icon={faShare} 
                                                spin={isPublishing}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Load More */}
                {projectDraftsHasMore && (
                    <div className="draft-projects-load-more">
                        <button
                            className="draft-projects-btn secondary"
                            onClick={handleLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                t('projects.drafts.loadMore')
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DraftProjects;