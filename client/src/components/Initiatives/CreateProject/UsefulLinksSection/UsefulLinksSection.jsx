import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faLink, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './usefulLinksSection.css';

const UsefulLinksSection = ({ values, setValues }) => {
    const { t } = useTranslation('content');

    const addLink = () => {
        const newLinks = [...(values.usefulLinks || []), { url: '', label: '' }];
        setValues(prev => ({ ...prev, usefulLinks: newLinks }));
    };

    const removeLink = (index) => {
        const newLinks = (values.usefulLinks || []).filter((_, i) => i !== index);
        setValues(prev => ({ ...prev, usefulLinks: newLinks }));
    };

    const updateLink = (index, field, value) => {
        const newLinks = [...(values.usefulLinks || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setValues(prev => ({ ...prev, usefulLinks: newLinks }));
    };

    const links = values.usefulLinks || [];

    return (
        <div className="project-form-section-card">
            <div className="uls-section-header">
                <h2 className="uls-section-title">
                    🔗 {t('projects.create.usefulLinks')}
                </h2>
                <button
                    type="button"
                    className="uls-form-btn accent"
                    onClick={addLink}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {t('projects.create.addLink')}
                </button>
            </div>

            <div className="project-form-section-content">
                <div className="uls-help">
                    <p>{t('projects.create.usefulLinksDescription')}</p>
                </div>

                {links.length === 0 ? (
                    <div className="uls-empty-state">
                        <div className="uls-empty-content">
                            <FontAwesomeIcon icon={faLink} className="uls-empty-icon" />
                            <h3>{t('projects.create.noLinks')}</h3>
                            <p>{t('projects.create.noLinksDescription')}</p>
                            <button
                                type="button"
                                className="uls-form-btn primary"
                                onClick={addLink}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('projects.create.addFirstLink')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="uls-list">
                        {links.map((link, index) => (
                            <div key={index} className="uls-item">
                                <div className="uls-item-header">
                                    <h4>
                                        <FontAwesomeIcon icon={faLink} />
                                        {t('projects.create.linkNumber', { number: index + 1 })}
                                    </h4>
                                    <button
                                        type="button"
                                        className="uls-remove-btn"
                                        onClick={() => removeLink(index)}
                                        title={t('projects.create.removeLink')}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        {t('projects.create.removeLink')}
                                    </button>
                                </div>

                                <div className="uls-item-content">
                                    <div className="uls-form-group">
                                        <label htmlFor={`link-label-${index}`}>
                                            {t('projects.create.linkLabel')}
                                        </label>
                                        <input
                                            type="text"
                                            id={`link-label-${index}`}
                                            value={link.label || ''}
                                            onChange={(e) => updateLink(index, 'label', e.target.value)}
                                            placeholder={t('projects.create.linkLabelPlaceholder')}
                                            className="uls-input"
                                            maxLength={200}
                                        />
                                        <div className="uls-char-count">
                                            {link.label?.length || 0}/200
                                        </div>
                                    </div>

                                    <div className="uls-form-group">
                                        <label htmlFor={`link-url-${index}`}>
                                            {t('projects.create.linkUrl')}
                                        </label>
                                        <div className="uls-url-row">
                                            <input
                                                type="url"
                                                id={`link-url-${index}`}
                                                value={link.url || ''}
                                                onChange={(e) => updateLink(index, 'url', e.target.value)}
                                                placeholder={t('projects.create.linkUrlPlaceholder')}
                                                className="uls-input"
                                            />
                                            {link.url && (
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="uls-preview-link"
                                                    title={link.url}
                                                >
                                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {links.length > 0 && (
                    <div className="uls-summary">
                        <h4>📊 {t('projects.create.linksSummary')}</h4>
                        <div className="uls-summary-stats">
                            <div className="uls-stat">
                                <span className="uls-stat-label">{t('projects.create.totalLinks')}:</span>
                                <span className="uls-stat-value">{links.length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsefulLinksSection;
