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
    setValues
}) => {
    const { t } = useTranslation('content');
    const { token } = useAuthContext();
    const [initiatives, setInitiatives] = useState([]);
    const [projects, setProjects] = useState([]);
    const [publications, setPublications] = useState([]);
    const [loadingInitiatives, setLoadingInitiatives] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingPublications, setLoadingPublications] = useState(false);

    // Search states
    const [initiativeSearch, setInitiativeSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [publicationSearch, setPublicationSearch] = useState('');
    const [showInitiativeDropdown, setShowInitiativeDropdown] = useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [showPublicationDropdown, setShowPublicationDropdown] = useState(false);

    // Refs for click outside detection
    const initiativeRef = useRef(null);
    const projectRef = useRef(null);
    const publicationRef = useRef(null);

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
            if (publicationRef.current && !publicationRef.current.contains(event.target)) {
                setShowPublicationDropdown(false);
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

    // Fetch ALL publications (both drafts and published)
    useEffect(() => {
        const fetchPublications = async () => {
            if (!token) return;

            setLoadingPublications(true);
            try {
                const response = await service.getAllPublicationsForConnections();
                if (response && response.data) {
                    setPublications(response.data);
                } else {
                    console.error('Invalid response format for publications:', response);
                }
            } catch (error) {
                console.error('Error fetching publications:', error);
            } finally {
                setLoadingPublications(false);
            }
        };

        fetchPublications();
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

    // Filter publications based on search (limit to 6 results)
    const filteredPublications = useMemo(() => {
        if (!publicationSearch.trim()) return publications.slice(0, 6);
        return publications.filter(pub =>
            pub.title.toLowerCase().includes(publicationSearch.toLowerCase()) ||
            pub.slug.toLowerCase().includes(publicationSearch.toLowerCase())
        ).slice(0, 6);
    }, [publications, publicationSearch]);

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

    // Handle publication selection (multi-select)
    const handlePublicationSelect = (pub) => {
        const currentIds = values.relatedPublications || [];
        const isSelected = currentIds.includes(pub.id);

        if (isSelected) {
            // Remove if already selected
            setValues(prev => ({
                ...prev,
                relatedPublications: currentIds.filter(id => id !== pub.id)
            }));
        } else {
            // Add if not selected
            setValues(prev => ({
                ...prev,
                relatedPublications: [...currentIds, pub.id]
            }));
        }

        setPublicationSearch('');
        setShowPublicationDropdown(false);
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

    // Remove specific publication connection
    const removePublicationConnection = (publicationId) => {
        setValues(prev => ({
            ...prev,
            relatedPublications: (prev.relatedPublications || []).filter(id => id !== publicationId)
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

    // Get selected publications
    const selectedPublications = publications.filter(pub =>
        (values.relatedPublications || []).includes(pub.id)
    );

    return (
        <div className="publication-form-section-card">
            <div className="publication-form-section-header">
                <h2 className="publication-form-section-title">
                    <FontAwesomeIcon icon={faLink} />
                    {t('publications.sections.connections')}
                </h2>
            </div>

            <div className="publication-form-section-content">
                <div className="publication-connections-help">
                    <p>{t('publications.connections.connectionsHelp')}</p>
                </div>

                {/* Initiative Connection */}
                <div className="publication-connection-group" ref={initiativeRef}>
                    <label className="publication-connection-label">
                        {t('publications.connections.connectInitiatives')}
                    </label>

                    <div className="publication-connection-search-container">
                        <div className="publication-connection-search-input-wrapper">
                            <FontAwesomeIcon icon={faSearch} className="publication-connection-search-icon" />
                            <input
                                type="text"
                                value={initiativeSearch}
                                onChange={(e) => setInitiativeSearch(e.target.value)}
                                onFocus={() => setShowInitiativeDropdown(true)}
                                placeholder={t('publications.connections.searchInitiatives')}
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
                                    {initiativeSearch ? t('publications.connections.noInitiativesFound') : t('publications.connections.noInitiativesAvailable')}
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
                                                    <span className="publication-connection-draft-badge">{t('publications.connections.draft')}</span>
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
                        {t('publications.connections.connectProjects')}
                    </label>

                    <div className="publication-connection-search-container">
                        <div className="publication-connection-search-input-wrapper">
                            <FontAwesomeIcon icon={faSearch} className="publication-connection-search-icon" />
                            <input
                                type="text"
                                value={projectSearch}
                                onChange={(e) => setProjectSearch(e.target.value)}
                                onFocus={() => setShowProjectDropdown(true)}
                                placeholder={t('publications.connections.searchProjects')}
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
                                    {projectSearch ? t('publications.connections.noProjectsFound') : t('publications.connections.noProjectsAvailable')}
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
                                                    <span className="publication-connection-draft-badge">{t('publications.connections.draft')}</span>
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

                {/* Publication Connection */}
                <div className="publication-connection-group" ref={publicationRef}>
                    <label className="publication-connection-label">
                        {t('publications.connections.connectPublications')}
                    </label>

                    <div className="publication-connection-search-container">
                        <div className="publication-connection-search-input-wrapper">
                            <FontAwesomeIcon icon={faSearch} className="publication-connection-search-icon" />
                            <input
                                type="text"
                                value={publicationSearch}
                                onChange={(e) => setPublicationSearch(e.target.value)}
                                onFocus={() => setShowPublicationDropdown(true)}
                                placeholder={t('publications.connections.searchPublications')}
                                className="publication-connection-search-input"
                                disabled={loadingPublications}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPublicationDropdown(!showPublicationDropdown)}
                                className="publication-connection-dropdown-toggle"
                                disabled={loadingPublications}
                            >
                                <FontAwesomeIcon icon={faChevronDown} />
                            </button>
                        </div>

                        {loadingPublications && (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="publication-connection-loading"
                                spin
                            />
                        )}
                    </div>

                    {/* Publication Dropdown */}
                    {showPublicationDropdown && (
                        <div className="publication-connection-dropdown">
                            {filteredPublications.length === 0 ? (
                                <div className="publication-connection-dropdown-empty">
                                    {publicationSearch ? t('publications.connections.noPublicationsFound') : t('publications.connections.noPublicationsAvailable')}
                                </div>
                            ) : (
                                filteredPublications.map(pub => {
                                    const isSelected = (values.relatedPublications || []).includes(pub.id);
                                    return (
                                        <div
                                            key={pub.id}
                                            className={`publication-connection-dropdown-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handlePublicationSelect(pub)}
                                        >
                                            <div className="publication-connection-dropdown-title">
                                                {pub.title}
                                                {pub.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('publications.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-dropdown-slug">
                                                {pub.slug}
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

                    {errors.relatedPublications && (
                        <div className="publication-connection-error">
                            {errors.relatedPublications}
                        </div>
                    )}
                </div>

                {/* Connection Status with Connected Items */}
                <div className="publication-connection-status">
                    <div className="publication-connection-status-section">
                        <div className="publication-connection-status-header">
                            <span className="publication-connection-status-label">
                                {t('publications.connections.initiativeConnections')}:
                            </span>
                            <span className={`publication-connection-status-value ${selectedInitiatives.length > 0 ? 'connected' : 'not-connected'}`}>
                                {selectedInitiatives.length > 0 ? `${selectedInitiatives.length} ${t('publications.connections.connected')}` : t('publications.connections.notConnected')}
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
                                                    <span className="publication-connection-draft-badge">{t('publications.connections.draft')}</span>
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
                                            title={t('publications.connections.removeConnection')}
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
                                {t('publications.connections.projectConnections')}:
                            </span>
                            <span className={`publication-connection-status-value ${selectedProjects.length > 0 ? 'connected' : 'not-connected'}`}>
                                {selectedProjects.length > 0 ? `${selectedProjects.length} ${t('publications.connections.connected')}` : t('publications.connections.notConnected')}
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
                                                    <span className="publication-connection-draft-badge">{t('publications.connections.draft')}</span>
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
                                            title={t('publications.connections.removeConnection')}
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
                                {t('publications.connections.publicationConnections')}:
                            </span>
                            <span className={`publication-connection-status-value ${selectedPublications.length > 0 ? 'connected' : 'not-connected'}`}>
                                {selectedPublications.length > 0 ? `${selectedPublications.length} ${t('publications.connections.connected')}` : t('publications.connections.notConnected')}
                            </span>
                        </div>

                        {selectedPublications.length > 0 && (
                            <div className="publication-connection-status-items">
                                {selectedPublications.map(pub => (
                                    <div key={pub.id} className="publication-connection-status-item">
                                        <div className="publication-connection-status-item-content">
                                            <div className="publication-connection-status-item-title">
                                                {pub.title}
                                                {pub.isDraft && (
                                                    <span className="publication-connection-draft-badge">{t('publications.connections.draft')}</span>
                                                )}
                                            </div>
                                            <div className="publication-connection-status-item-slug">
                                                {pub.slug}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePublicationConnection(pub.id)}
                                            className="publication-connection-status-remove"
                                            title={t('publications.connections.removeConnection')}
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
