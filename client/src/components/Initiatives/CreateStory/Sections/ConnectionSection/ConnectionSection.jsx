import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faSpinner, faCheck, faTimes, faSearch, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { initiativeServiceFactory } from '../../../../Services/StoryPubServiceFactory';
import { useAuthContext } from '../../../../contexts/UserContext';
import './ConnectionSection.css';

const ConnectionSection = ({
    values,
    errors,
    onChangeHandler,
    onBlurHandler,
    setValues,
    currentStoryId // Add this prop
}) => {
    const { t } = useTranslation('content');
    const { token } = useAuthContext();
    const [initiatives, setInitiatives] = useState([]);
    const [projects, setProjects] = useState([]);
    const [stories, setStories] = useState([]);
    const [loadingInitiatives, setLoadingInitiatives] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingStories, setLoadingStories] = useState(false);

    // Search states
    const [initiativeSearch, setInitiativeSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [storySearch, setStorySearch] = useState('');
    const [showInitiativeDropdown, setShowInitiativeDropdown] = useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [showStoryDropdown, setShowStoryDropdown] = useState(false);

    // Refs for click outside detection
    const initiativeRef = useRef(null);
    const projectRef = useRef(null);
    const storyRef = useRef(null);

    // Create service instance
    const service = useMemo(() => initiativeServiceFactory(token), [token]);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (initiativeRef.current && !initiativeRef.current.contains(event.target)) {
                setShowInitiativeDropdown(false);
            }
            if (projectRef.current && !projectRef.current.contains(event.target)) {
                setShowProjectDropdown(false);
            }
            if (storyRef.current && !storyRef.current.contains(event.target)) {
                setShowStoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch ALL initiatives (both drafts and published)
    useEffect(() => {
        const fetchInitiatives = async () => {
            if (!token) return;

            setLoadingInitiatives(true);
            try {
                const response = await service.getAllInitiativesForConnections();
                if (response && response.data) {
                    setInitiatives(response.data);
                } else {
                    console.error('Invalid response format for initiatives:', response);
                }
            } catch (error) {
                console.error('Error fetching initiatives:', error);
            } finally {
                setLoadingInitiatives(false);
            }
        };

        fetchInitiatives();
    }, [service, token]);

    // Fetch ALL projects (both drafts and published)
    useEffect(() => {
        const fetchProjects = async () => {
            if (!token) return;

            setLoadingProjects(true);
            try {
                const response = await service.getAllProjectsForConnections();
                if (response && response.data) {
                    setProjects(response.data);
                } else {
                    console.error('Invalid response format for projects:', response);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchProjects();
    }, [service, token]);

    // Fetch ALL stories (both drafts and published)
    useEffect(() => {
        const fetchStories = async () => {
            if (!token) return;

            setLoadingStories(true);
            try {
                const response = await service.getAllStoriesForConnections();
                if (response && response.data) {
                    setStories(response.data);
                } else {
                    console.error('Invalid response format for stories:', response);
                }
            } catch (error) {
                console.error('Error fetching stories:', error);
            } finally {
                setLoadingStories(false);
            }
        };

        fetchStories();
    }, [service, token]);

    // Filter initiatives based on search (limit to 6 results)
    const filteredInitiatives = useMemo(() => {
        if (!initiativeSearch.trim()) return initiatives.slice(0, 6);
        return initiatives.filter(initiative =>
            initiative.title.toLowerCase().includes(initiativeSearch.toLowerCase()) ||
            initiative.slug.toLowerCase().includes(initiativeSearch.toLowerCase())
        ).slice(0, 6);
    }, [initiatives, initiativeSearch]);

    // Filter projects based on search (limit to 6 results)
    const filteredProjects = useMemo(() => {
        if (!projectSearch.trim()) return projects.slice(0, 6);
        return projects.filter(project =>
            project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
            project.slug.toLowerCase().includes(projectSearch.toLowerCase())
        ).slice(0, 6);
    }, [projects, projectSearch]);

    // Filter stories based on search (limit to 6 results) and exclude current story
    const filteredStories = useMemo(() => {
        let filtered = stories;

        // Exclude current story if we're in edit mode
        if (currentStoryId) {
            filtered = stories.filter(story => story.id !== currentStoryId);
        }

        if (!storySearch.trim()) return filtered.slice(0, 6);
        return filtered.filter(story =>
            story.title.toLowerCase().includes(storySearch.toLowerCase()) ||
            story.slug.toLowerCase().includes(storySearch.toLowerCase())
        ).slice(0, 6);
    }, [stories, storySearch, currentStoryId]);

    // Handle initiative selection (multi-select)
    const handleInitiativeSelect = (initiative) => {
        const currentIds = values.connectedInitiativeIds || [];
        const isSelected = currentIds.includes(initiative.id);

        if (isSelected) {
            // Remove if already selected
            setValues(prev => ({
                ...prev,
                connectedInitiativeIds: currentIds.filter(id => id !== initiative.id)
            }));
        } else {
            // Add if not selected
            setValues(prev => ({
                ...prev,
                connectedInitiativeIds: [...currentIds, initiative.id]
            }));
        }

        setInitiativeSearch('');
        setShowInitiativeDropdown(false);
    };

    // Handle project selection (multi-select)
    const handleProjectSelect = (project) => {
        const currentIds = values.connectedProjectIds || [];
        const isSelected = currentIds.includes(project.id);

        if (isSelected) {
            // Remove if already selected
            setValues(prev => ({
                ...prev,
                connectedProjectIds: currentIds.filter(id => id !== project.id)
            }));
        } else {
            // Add if not selected
            setValues(prev => ({
                ...prev,
                connectedProjectIds: [...currentIds, project.id]
            }));
        }

        setProjectSearch('');
        setShowProjectDropdown(false);
    };

    // Handle story selection (multi-select)
    const handleStorySelect = (story) => {
        const currentIds = values.relatedStories || [];
        const isSelected = currentIds.includes(story.id);

        if (isSelected) {
            // Remove if already selected
            setValues(prev => ({
                ...prev,
                relatedStories: currentIds.filter(id => id !== story.id)
            }));
        } else {
            // Add if not selected
            setValues(prev => ({
                ...prev,
                relatedStories: [...currentIds, story.id]
            }));
        }

        setStorySearch('');
        setShowStoryDropdown(false);
    };

    // Remove specific initiative connection
    const removeInitiativeConnection = (initiativeId) => {
        setValues(prev => ({
            ...prev,
            connectedInitiativeIds: (prev.connectedInitiativeIds || []).filter(id => id !== initiativeId)
        }));
    };

    // Remove specific project connection
    const removeProjectConnection = (projectId) => {
        setValues(prev => ({
            ...prev,
            connectedProjectIds: (prev.connectedProjectIds || []).filter(id => id !== projectId)
        }));
    };

    // Remove specific story connection
    const removeStoryConnection = (storyId) => {
        setValues(prev => ({
            ...prev,
            relatedStories: (prev.relatedStories || []).filter(id => id !== storyId)
        }));
    };

    // Get selected initiatives
    const selectedInitiatives = initiatives.filter(init =>
        (values.connectedInitiativeIds || []).includes(init.id)
    );

    // Get selected projects
    const selectedProjects = projects.filter(proj =>
        (values.connectedProjectIds || []).includes(proj.id)
    );

    // Get selected stories
    const selectedStories = stories.filter(story =>
        (values.relatedStories || []).includes(story.id)
    );

    return (
        <div className="publication-form-section-card">
            <div className="publication-form-section-header">
                <h2 className="publication-form-section-title">
                    <FontAwesomeIcon icon={faLink} />
                    {t('stories.sections.connections')}
                </h2>
            </div>

            <div className="publication-form-section-content">
                <div className="publication-connections-help">
                    <p>{t('stories.connections.connectionsHelp')}</p>
                </div>

                {/* Initiative Connection */}
                <div className="publication-connection-group" ref={initiativeRef}>
                    <label className="publication-connection-label">
                        {t('stories.connections.connectInitiatives')}
                    </label>

                    <div className="publication-connection-search-container">
                        <div className="publication-connection-search-input-wrapper">
                            <FontAwesomeIcon icon={faSearch} className="publication-connection-search-icon" />
                            <input
                                type="text"
                                value={initiativeSearch}
                                onChange={(e) => setInitiativeSearch(e.target.value)}
                                onFocus={() => setShowInitiativeDropdown(true)}
                                placeholder={t('stories.connections.searchInitiatives')}
                                className="publication-connection-search-input"
                                disabled={loadingInitiatives}
                            />
                            <button
                                type="button"
                                onClick={() => setShowInitiativeDropdown(!showInitiativeDropdown)}
                                className="publication-connection-dropdown-toggle"
                                disabled={loadingInitiatives}
                            >
                                <FontAwesomeIcon icon={faChevronDown} />
                            </button>
                        </div>

                        {loadingInitiatives && (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="publication-connection-loading"
                                spin
                            />
                        )}
                    </div>

                    {/* Initiative Dropdown */}
                    {showInitiativeDropdown && (
                        <div className="publication-connection-dropdown">
                            {filteredInitiatives.length === 0 ? (
                                <div className="publication-connection-dropdown-empty">
                                    {initiativeSearch ? t('stories.connections.noInitiativesFound') : t('stories.connections.noInitiativesAvailable')}
                                </div>
                            ) : (
                                filteredInitiatives.map(initiative => {
                                    const isSelected = (values.connectedInitiativeIds || []).includes(initiative.id);
                                    return (
                                        <div
                                            key={initiative.id}
                                            className={`publication-connection-dropdown-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleInitiativeSelect(initiative)}
                                        >
                                            <div className="publication-connection-dropdown-title">
                                                {initiative.title}
                                                {initiative.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('stories.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-dropdown-slug">
                                                {initiative.slug}
                                            </div>
                                            {isSelected && (
                                                <FontAwesomeIcon icon={faCheck} className="publication-connection-dropdown-check" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {errors.connectedInitiativeIds && (
                        <div className="publication-connection-error">
                            {errors.connectedInitiativeIds}
                        </div>
                    )}
                </div>

                {/* Project Connection */}
                <div className="publication-connection-group" ref={projectRef}>
                    <label className="publication-connection-label">
                        {t('stories.connections.connectProjects')}
                    </label>

                    <div className="publication-connection-search-container">
                        <div className="publication-connection-search-input-wrapper">
                            <FontAwesomeIcon icon={faSearch} className="publication-connection-search-icon" />
                            <input
                                type="text"
                                value={projectSearch}
                                onChange={(e) => setProjectSearch(e.target.value)}
                                onFocus={() => setShowProjectDropdown(true)}
                                placeholder={t('stories.connections.searchProjects')}
                                className="publication-connection-search-input"
                                disabled={loadingProjects}
                            />
                            <button
                                type="button"
                                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                                className="publication-connection-dropdown-toggle"
                                disabled={loadingProjects}
                            >
                                <FontAwesomeIcon icon={faChevronDown} />
                            </button>
                        </div>

                        {loadingProjects && (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="publication-connection-loading"
                                spin
                            />
                        )}
                    </div>

                    {/* Project Dropdown */}
                    {showProjectDropdown && (
                        <div className="publication-connection-dropdown">
                            {filteredProjects.length === 0 ? (
                                <div className="publication-connection-dropdown-empty">
                                    {projectSearch ? t('stories.connections.noProjectsFound') : t('stories.connections.noProjectsAvailable')}
                                </div>
                            ) : (
                                filteredProjects.map(project => {
                                    const isSelected = (values.connectedProjectIds || []).includes(project.id);
                                    return (
                                        <div
                                            key={project.id}
                                            className={`publication-connection-dropdown-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleProjectSelect(project)}
                                        >
                                            <div className="publication-connection-dropdown-title">
                                                {project.title}
                                                {project.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('stories.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-dropdown-slug">
                                                {project.slug}
                                            </div>
                                            {isSelected && (
                                                <FontAwesomeIcon icon={faCheck} className="publication-connection-dropdown-check" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {errors.connectedProjectIds && (
                        <div className="publication-connection-error">
                            {errors.connectedProjectIds}
                        </div>
                    )}
                </div>

                {/* Story Connection */}
                <div className="publication-connection-group" ref={storyRef}>
                    <label className="publication-connection-label">
                        {t('stories.connections.connectStories')}
                    </label>

                    <div className="publication-connection-search-container">
                        <div className="publication-connection-search-input-wrapper">
                            <FontAwesomeIcon icon={faSearch} className="publication-connection-search-icon" />
                            <input
                                type="text"
                                value={storySearch}
                                onChange={(e) => setStorySearch(e.target.value)}
                                onFocus={() => setShowStoryDropdown(true)}
                                placeholder={t('stories.connections.searchStories')}
                                className="publication-connection-search-input"
                                disabled={loadingStories}
                            />
                            <button
                                type="button"
                                onClick={() => setShowStoryDropdown(!showStoryDropdown)}
                                className="publication-connection-dropdown-toggle"
                                disabled={loadingStories}
                            >
                                <FontAwesomeIcon icon={faChevronDown} />
                            </button>
                        </div>

                        {loadingStories && (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="publication-connection-loading"
                                spin
                            />
                        )}
                    </div>

                    {/* Story Dropdown */}
                    {showStoryDropdown && (
                        <div className="publication-connection-dropdown">
                            {filteredStories.length === 0 ? (
                                <div className="publication-connection-dropdown-empty">
                                    {storySearch ? t('stories.connections.noStoriesFound') : t('stories.connections.noStoriesAvailable')}
                                </div>
                            ) : (
                                filteredStories.map(story => {
                                    const isSelected = (values.relatedStories || []).includes(story.id);
                                    return (
                                        <div
                                            key={story.id}
                                            className={`publication-connection-dropdown-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleStorySelect(story)}
                                        >
                                            <div className="publication-connection-dropdown-title">
                                                {story.title}
                                                {story.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('stories.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-dropdown-slug">
                                                {story.slug}
                                            </div>
                                            {isSelected && (
                                                <FontAwesomeIcon icon={faCheck} className="publication-connection-dropdown-check" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {errors.relatedStories && (
                        <div className="publication-connection-error">
                            {errors.relatedStories}
                        </div>
                    )}
                </div>

                {/* Connection Status with Connected Items */}
                <div className="publication-connection-status">
                    <div className="publication-connection-status-section">
                        <div className="publication-connection-status-header">
                            <span className="publication-connection-status-label">
                                {t('stories.connections.initiativeConnections')}:
                            </span>
                            <span className={`publication-connection-status-value ${selectedInitiatives.length > 0 ? 'connected' : 'not-connected'}`}>
                                {selectedInitiatives.length > 0 ? `${selectedInitiatives.length} ${t('stories.connections.connected')}` : t('stories.connections.notConnected')}
                            </span>
                        </div>

                        {selectedInitiatives.length > 0 && (
                            <div className="publication-connection-status-items">
                                {selectedInitiatives.map(initiative => (
                                    <div key={initiative.id} className="publication-connection-status-item">
                                        <div className="publication-connection-status-item-content">
                                            <div className="publication-connection-status-item-title">
                                                {initiative.title}
                                                {initiative.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('stories.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-status-item-slug">
                                                {initiative.slug}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeInitiativeConnection(initiative.id)}
                                            className="publication-connection-status-remove"
                                            title={t('stories.connections.removeConnection')}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="publication-connection-status-section">
                        <div className="publication-connection-status-header">
                            <span className="publication-connection-status-label">
                                {t('stories.connections.projectConnections')}:
                            </span>
                            <span className={`publication-connection-status-value ${selectedProjects.length > 0 ? 'connected' : 'not-connected'}`}>
                                {selectedProjects.length > 0 ? `${selectedProjects.length} ${t('stories.connections.connected')}` : t('stories.connections.notConnected')}
                            </span>
                        </div>

                        {selectedProjects.length > 0 && (
                            <div className="publication-connection-status-items">
                                {selectedProjects.map(project => (
                                    <div key={project.id} className="publication-connection-status-item">
                                        <div className="publication-connection-status-item-content">
                                            <div className="publication-connection-status-item-title">
                                                {project.title}
                                                {project.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('stories.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-status-item-slug">
                                                {project.slug}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeProjectConnection(project.id)}
                                            className="publication-connection-status-remove"
                                            title={t('stories.connections.removeConnection')}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="publication-connection-status-section">
                        <div className="publication-connection-status-header">
                            <span className="publication-connection-status-label">
                                {t('stories.connections.storyConnections')}:
                            </span>
                            <span className={`publication-connection-status-value ${selectedStories.length > 0 ? 'connected' : 'not-connected'}`}>
                                {selectedStories.length > 0 ? `${selectedStories.length} ${t('stories.connections.connected')}` : t('stories.connections.notConnected')}
                            </span>
                        </div>

                        {selectedStories.length > 0 && (
                            <div className="publication-connection-status-items">
                                {selectedStories.map(story => (
                                    <div key={story.id} className="publication-connection-status-item">
                                        <div className="publication-connection-status-item-content">
                                            <div className="publication-connection-status-item-title">
                                                {story.title}
                                                {story.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('stories.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-status-item-slug">
                                                {story.slug}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStoryConnection(story.id)}
                                            className="publication-connection-status-remove"
                                            title={t('stories.connections.removeConnection')}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionSection;
