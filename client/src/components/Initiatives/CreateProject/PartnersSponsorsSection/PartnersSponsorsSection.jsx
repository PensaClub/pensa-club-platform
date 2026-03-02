// components/Projects/ProjectCreateForm/PartnersSponsorsSection/PartnersSponsorsSection.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHandshake, faPlus, faTrash, faBuilding, faDollarSign, 
    faUpload, faLink, faEye, faEyeSlash, faGlobe, faImage, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './partnersSponsorsSection.css';

const PartnersSponsorsSection = ({
    values,
    errors,
    setValues,
    addPartner,
    removePartner,
    addSponsor,
    removeSponsor,
    handlePartnerImageUpload,
    removePartnerImage,
    handleSponsorImageUpload,
    removeSponsorImage
}) => {
    const { t } = useTranslation('content');
    const [activeTab, setActiveTab] = useState('partners');

    // Handle partner field changes
    const handlePartnerChange = (index, field, value) => {
        setValues(prev => {
            const newPartners = [...prev.partners];
            newPartners[index] = { ...newPartners[index], [field]: value };
            return { ...prev, partners: newPartners };
        });
    };

    // Handle sponsor field changes  
    const handleSponsorChange = (index, field, value) => {
        setValues(prev => {
            const newSponsors = [...prev.sponsors];
            newSponsors[index] = { ...newSponsors[index], [field]: value };
            return { ...prev, sponsors: newSponsors };
        });
    };

    // Handle partner logo upload
  const handlePartnerLogoUpload = async (e, partnerIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    
    await handlePartnerImageUpload(file, partnerIndex);
    e.target.value = '';
};

    // Handle sponsor logo upload
   const handleSponsorLogoUpload = async (e, sponsorIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    
    await handleSponsorImageUpload(file, sponsorIndex);
    e.target.value = '';
}
    // Handle logo click
    const handleLogoClick = (type, index) => {
        const fileInput = document.getElementById(`${type}-logo-input-${index}`);
        if (fileInput) {
            fileInput.click();
        }
    };

    // Calculate statistics
    const getStats = () => {
        const totalPartners = values.partners?.length || 0;
        const visiblePartners = values.partners?.filter(p => p.visible !== false).length || 0;
        const partnersWithLogos = values.partners?.filter(p => p.logo && p.logo.trim()).length || 0;

        const totalSponsors = values.sponsors?.length || 0;
        const visibleSponsors = values.sponsors?.filter(s => s.visible !== false).length || 0;
        const sponsorsWithLogos = values.sponsors?.filter(s => s.logo && s.logo.trim()).length || 0;
        const totalFunding = values.sponsors?.reduce((sum, sponsor) => {
            return sum + (parseFloat(sponsor.amount) || 0);
        }, 0) || 0;

        return {
            partners: { total: totalPartners, visible: visiblePartners, withLogos: partnersWithLogos },
            sponsors: { total: totalSponsors, visible: visibleSponsors, withLogos: sponsorsWithLogos, totalFunding }
        };
    };

    const stats = getStats();

    return (
        <div className="project-partners-section-card">
            <div className="project-partners-section-header">
                <h2 className="project-partners-section-title">
                    <FontAwesomeIcon icon={faHandshake} />
                    {t('projects.create.partnersSponsors')}
                </h2>
            </div>

            <div className="project-form-section-content">
                <div className="project-partners-help">
                    <p>{t('projects.create.partners-sponsors-help')}</p>
                </div>

                {/* Tabs */}
                <div className="project-partners-tabs">
                    <button
                        type="button"
                        className={`project-partners-tab ${activeTab === 'partners' ? 'active' : ''}`}
                        onClick={() => setActiveTab('partners')}
                    >
                        <FontAwesomeIcon icon={faBuilding} />
                        {t('projects.create.partners')} ({stats.partners.total})
                    </button>
                    <button
                        type="button"
                        className={`project-partners-tab ${activeTab === 'sponsors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sponsors')}
                    >
                        <FontAwesomeIcon icon={faDollarSign} />
                        {t('projects.create.sponsors')} ({stats.sponsors.total})
                    </button>
                </div>

                {/* Partners Tab */}
                {activeTab === 'partners' && (
                    <div className="project-partners-tab-content">
                        <div className="project-partners-tab-header">
                            <h3>{t('projects.create.partners')}</h3>
                            <button
                                type="button"
                                className="project-partners-form-btn primary"
                                onClick={addPartner}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('projects.create.addPartner')}
                            </button>
                        </div>

                        {(!values.partners || values.partners.length === 0) ? (
                            <div className="project-partners-empty-state">
                                <div className="project-partners-empty-content">
                                    <FontAwesomeIcon icon={faBuilding} className="project-partners-empty-icon" />
                                    <h3>{t('projects.create.noPartners')}</h3>
                                    <p>{t('projects.create.partnersDescription')}</p>
                                    <button
                                        type="button"
                                        className="project-partners-form-btn primary"
                                        onClick={addPartner}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        {t('projects.create.addFirstPartner')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="project-partners-list">
                                {values.partners.map((partner, index) => (
                                    <div key={partner.titleSlug || index} className="project-partners-item">
                                        <div className="project-partners-item-header">
                                            <div className="project-partners-item-info">
                                                <h4>
                                                    <FontAwesomeIcon icon={faBuilding} />
                                                    {partner.name || t('projects.create.unnamedPartner')}
                                                    {errors[`partners[${index}].name`] && (
                                                        <span className="project-partners-error-indicator">⚠️</span>
                                                    )}
                                                </h4>
                                                <div className="project-partners-item-type">
                                                    {partner.type || t('projects.create.noType')}
                                                </div>
                                            </div>

                                            <div className="project-partners-item-actions">
                                                <button
                                                    type="button"
                                                    className={`project-partners-visibility-btn ${partner.visible !== false ? 'visible' : 'hidden'}`}
                                                    onClick={() => handlePartnerChange(index, 'visible', !partner.visible)}
                                                    title={partner.visible !== false ? t('projects.create.hidePartner') : t('projects.create.showPartner')}
                                                >
                                                    <FontAwesomeIcon icon={partner.visible !== false ? faEye : faEyeSlash} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="project-partners-remove-btn"
                                                    onClick={() => removePartner(index)}
                                                    title={t('projects.create.removePartner')}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    {t('projects.create.remove')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="project-partners-item-content">
                                            {/* Partner Logo */}
                                            <div className="project-partners-logo-upload">
                                                <label>{t('projects.create.partnerLogo')}</label>
                                                <div 
                                                    className="project-partners-logo-preview"
                                                    onClick={() => handleLogoClick('partner', index)}
                                                    title={t('projects.create.clickToChangeLogo')}
                                                >
                                                    {partner.logo ? (
                                                        <>
                                                            <img src={partner.logo} alt={partner.name || 'Partner logo'} />
                                                            <div className="project-partners-logo-overlay">
                                                                <button
                                                                    type="button"
                                                                    className="project-partners-logo-remove-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePartnerChange(index, 'logo', '');
                                                                    }}
                                                                    title={t('projects.create.removeLogo')}
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="project-partners-logo-placeholder">
                                                            <FontAwesomeIcon icon={faImage} />
                                                            <span>{t('projects.create.noLogo')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <input
                                                    type="file"
                                                    id={`partner-logo-input-${index}`}
                                                    accept="image/*"
                                                    onChange={(e) => handlePartnerLogoUpload(e, index)}
                                                    style={{ display: 'none' }}
                                                />

                                                <label className="project-partners-logo-upload-btn">
                                                    <FontAwesomeIcon icon={faUpload} />
                                                    {partner.logo ? t('projects.create.changeLogo') : t('projects.create.uploadLogo')}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handlePartnerLogoUpload(e, index)}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            </div>

                                            <div className="project-partners-form-row">
                                                {/* Partner Name */}
                                                <div className="project-partners-form-group">
                                                    <label htmlFor={`partner-name-${index}`}>
                                                        {t('projects.create.partnerName')}
                                                        <span className="project-required-indicator">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id={`partner-name-${index}`}
                                                        value={partner.name || ''}
                                                        onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                                                        placeholder={t('projects.create.partnerNamePlaceholder')}
                                                        className={`project-partners-form-input ${errors[`partners[${index}].name`] ? 'error' : ''}`}
                                                        maxLength={100}
                                                    />
                                                    {errors[`partners[${index}].name`] && (
                                                        <div className="project-partners-error-message">{errors[`partners[${index}].name`]}</div>
                                                    )}
                                                </div>

                                                {/* Partner Type */}
                                                <div className="project-partners-form-group">
                                                    <label htmlFor={`partner-type-${index}`}>
                                                        {t('projects.create.partnerType')}
                                                    </label>
                                                    <select
                                                        id={`partner-type-${index}`}
                                                        value={partner.type || ''}
                                                        onChange={(e) => handlePartnerChange(index, 'type', e.target.value)}
                                                        className="project-partners-form-input"
                                                    >
                                                        <option value="">{t('projects.create.selectType')}</option>
                                                        <option value="Strategic">{t('projects.create.strategic')}</option>
                                                        <option value="Technical">{t('projects.create.technical')}</option>
                                                        <option value="Media">{t('projects.create.mediaSponsor')}</option>
                                                        <option value="Educational">{t('projects.create.educational')}</option>
                                                        <option value="Government">{t('projects.create.government')}</option>
                                                        <option value="NGO">{t('projects.create.ngo')}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Partner Website */}
                                            <div className="project-partners-form-group">
                                                <label htmlFor={`partner-website-${index}`}>
                                                    <FontAwesomeIcon icon={faGlobe} />
                                                    {t('projects.create.partnerWebsite')}
                                                </label>
                                                <input
                                                    type="url"
                                                    id={`partner-website-${index}`}
                                                    value={partner.website || ''}
                                                    onChange={(e) => handlePartnerChange(index, 'website', e.target.value)}
                                                    placeholder={t('projects.create.partnerWebsitePlaceholder')}
                                                    className={`project-partners-form-input ${errors[`partners[${index}].website`] ? 'error' : ''}`}
                                                />
                                                {errors[`partners[${index}].website`] && (
                                                    <div className="project-partners-error-message">{errors[`partners[${index}].website`]}</div>
                                                )}
                                            </div>

                                            {/* Partner Description */}
                                            <div className="project-partners-form-group">
                                                <label htmlFor={`partner-description-${index}`}>
                                                    {t('projects.create.partnerDescription')}
                                                </label>
                                                <textarea
                                                    id={`partner-description-${index}`}
                                                    value={partner.description || ''}
                                                    onChange={(e) => handlePartnerChange(index, 'description', e.target.value)}
                                                    placeholder={t('projects.create.partnerDescriptionPlaceholder')}
                                                    className={`project-partners-form-input ${errors[`partners[${index}].description`] ? 'error' : ''}`}
                                                    rows={3}
                                                    maxLength={1000}
                                                />
                                                <div className="project-partners-char-count">
                                                    {partner.description?.length || 0}/1000
                                                </div>
                                                {errors[`partners[${index}].description`] && (
                                                    <div className="project-partners-error-message">{errors[`partners[${index}].description`]}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sponsors Tab */}
                {activeTab === 'sponsors' && (
                    <div className="project-partners-tab-content">
                        <div className="project-partners-tab-header">
                            <h3>{t('projects.create.sponsors')}</h3>
                            <button
                                type="button"
                                className="project-partners-form-btn primary"
                                onClick={addSponsor}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('projects.create.addSponsor')}
                            </button>
                        </div>

                        {(!values.sponsors || values.sponsors.length === 0) ? (
                            <div className="project-partners-empty-state">
                                <div className="project-partners-empty-content">
                                    <FontAwesomeIcon icon={faDollarSign} className="project-partners-empty-icon" />
                                    <h3>{t('projects.create.noSponsors')}</h3>
                                    <p>{t('projects.create.sponsorsDescription')}</p>
                                    <button
                                        type="button"
                                        className="project-partners-form-btn primary"
                                        onClick={addSponsor}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        {t('projects.create.addFirstSponsor')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="project-partners-list">
                                {values.sponsors.map((sponsor, index) => (
                                    <div key={sponsor.id || index} className="project-partners-item">
                                        <div className="project-partners-item-header">
                                            <div className="project-partners-item-info">
                                                <h4>
                                                    <FontAwesomeIcon icon={faDollarSign} />
                                                    {sponsor.name || t('projects.create.unnamedSponsor')}
                                                    {errors[`sponsors[${index}].name`] && (
                                                        <span className="project-partners-error-indicator">⚠️</span>
                                                    )}
                                                </h4>
                                                <div className="project-partners-item-type">
                                                    {sponsor.amount && (
                                                        <span className="project-partners-amount">
                                                            {sponsor.amount} {sponsor.currency || 'BGN'}
                                                        </span>
                                                    )}
                                                    {sponsor.type && ` • ${sponsor.type}`}
                                                </div>
                                            </div>

                                            <div className="project-partners-item-actions">
                                                <button
                                                    type="button"
                                                    className={`project-partners-visibility-btn ${sponsor.visible !== false ? 'visible' : 'hidden'}`}
                                                    onClick={() => handleSponsorChange(index, 'visible', !sponsor.visible)}
                                                    title={sponsor.visible !== false ? t('projects.create.hideSponsor') : t('projects.create.showSponsor')}
                                                >
                                                    <FontAwesomeIcon icon={sponsor.visible !== false ? faEye : faEyeSlash} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="project-partners-remove-btn"
                                                    onClick={() => removeSponsor(index)}
                                                    title={t('projects.create.removeSponsor')}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    {t('projects.create.remove')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="project-partners-item-content">
                                            {/* Sponsor Logo */}
                                            <div className="project-partners-logo-upload">
                                                <label>{t('projects.create.sponsorLogo')}</label>
                                                <div 
                                                    className="project-partners-logo-preview"
                                                    onClick={() => handleLogoClick('sponsor', index)}
                                                    title={t('projects.create.clickToChangeLogo')}
                                                >
                                                    {sponsor.logo ? (
                                                        <>
                                                            <img src={sponsor.logo} alt={sponsor.name || 'Sponsor logo'} />
                                                            <div className="project-partners-logo-overlay">
                                                                <button
                                                                    type="button"
                                                                    className="project-partners-logo-remove-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSponsorChange(index, 'logo', '');
                                                                    }}
                                                                    title={t('projects.create.removeLogo')}
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="project-partners-logo-placeholder">
                                                            <FontAwesomeIcon icon={faImage} />
                                                            <span>{t('projects.create.noLogo')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <input
                                                    type="file"
                                                    id={`sponsor-logo-input-${index}`}
                                                    accept="image/*"
                                                    onChange={(e) => handleSponsorLogoUpload(e, index)}
                                                    style={{ display: 'none' }}
                                                />

                                                <label className="project-partners-logo-upload-btn">
                                                    <FontAwesomeIcon icon={faUpload} />
                                                    {sponsor.logo ? t('projects.create.changeLogo') : t('projects.create.uploadLogo')}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleSponsorLogoUpload(e, index)}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            </div>

                                            <div className="project-partners-form-row">
                                                {/* Sponsor Name */}
                                                <div className="project-partners-form-group">
                                                    <label htmlFor={`sponsor-name-${index}`}>
                                                        {t('projects.create.sponsorName')}
                                                        <span className="project-required-indicator">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id={`sponsor-name-${index}`}
                                                        value={sponsor.name || ''}
                                                        onChange={(e) => handleSponsorChange(index, 'name', e.target.value)}
                                                        placeholder={t('projects.create.sponsorNamePlaceholder')}
                                                        className={`project-partners-form-input ${errors[`sponsors[${index}].name`] ? 'error' : ''}`}
                                                        maxLength={100}
                                                    />
                                                    {errors[`sponsors[${index}].name`] && (
                                                        <div className="project-partners-error-message">{errors[`sponsors[${index}].name`]}</div>
                                                    )}
                                                </div>

                                                {/* Sponsor Type */}
                                                <div className="project-partners-form-group">
                                                    <label htmlFor={`sponsor-type-${index}`}>
                                                        {t('projects.create.sponsorType')}
                                                    </label>
                                                    <select
                                                        id={`sponsor-type-${index}`}
                                                        value={sponsor.type || ''}
                                                        onChange={(e) => handleSponsorChange(index, 'type', e.target.value)}
                                                        className="project-partners-form-input"
                                                    >
                                                        <option value="">{t('projects.create.selectType')}</option>
                                                        <option value="Financial">{t('projects.create.financial')}</option>
                                                        <option value="InKind">{t('projects.create.inKind')}</option>
                                                        <option value="Services">{t('projects.create.services')}</option>
                                                        <option value="Equipment">{t('projects.create.equipment')}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="project-partners-form-row">
                                                {/* Sponsor Amount */}
                                                <div className="project-partners-form-group">
                                                    <label htmlFor={`sponsor-amount-${index}`}>
                                                        <FontAwesomeIcon icon={faDollarSign} />
                                                        {t('projects.create.sponsorAmount')}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id={`sponsor-amount-${index}`}
                                                        value={sponsor.amount || ''}
                                                        onChange={(e) => handleSponsorChange(index, 'amount', e.target.value)}
                                                        placeholder={t('projects.create.sponsorAmountPlaceholder')}
                                                        className={`project-partners-form-input ${errors[`sponsors[${index}].amount`] ? 'error' : ''}`}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                    {errors[`sponsors[${index}].amount`] && (
                                                        <div className="project-partners-error-message">{errors[`sponsors[${index}].amount`]}</div>
                                                    )}
                                                </div>

                                                {/* Sponsor Currency */}
                                                <div className="project-partners-form-group">
                                                    <label htmlFor={`sponsor-currency-${index}`}>
                                                        {t('projects.create.currency')}
                                                    </label>
                                                    <select
                                                        id={`sponsor-currency-${index}`}
                                                        value={sponsor.currency || 'BGN'}
                                                        onChange={(e) => handleSponsorChange(index, 'currency', e.target.value)}
                                                        className="project-partners-form-input"
                                                    >
                                                        <option value="BGN">BGN</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="USD">USD</option>
                                                        <option value="GBP">GBP</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Sponsor Website */}
                                            <div className="project-partners-form-group">
                                                <label htmlFor={`sponsor-website-${index}`}>
                                                    <FontAwesomeIcon icon={faGlobe} />
                                                    {t('projects.create.sponsorWebsite')}
                                                </label>
                                                <input
                                                    type="url"
                                                    id={`sponsor-website-${index}`}
                                                    value={sponsor.website || ''}
                                                    onChange={(e) => handleSponsorChange(index, 'website', e.target.value)}
                                                    placeholder={t('projects.create.sponsorWebsitePlaceholder')}
                                                    className={`project-partners-form-input ${errors[`sponsors[${index}].website`] ? 'error' : ''}`}
                                                />
                                                {errors[`sponsors[${index}].website`] && (
                                                    <div className="project-partners-error-message">{errors[`sponsors[${index}].website`]}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Summary Statistics */}
                {(values.partners?.length > 0 || values.sponsors?.length > 0) && (
                    <div className="project-partners-summary">
                        <h4>📊 {t('projects.create.partnersSponsorsSummary')}</h4>
                        <div className="project-partners-summary-stats">
                            {values.partners?.length > 0 && (
                                <>
                                    <div className="project-partners-stat">
                                        <span className="project-partners-stat-label">{t('projects.create.totalPartners')}:</span>
                                        <span className="project-partners-stat-value">{stats.partners.total}</span>
                                    </div>
                                    <div className="project-partners-stat">
                                        <span className="project-partners-stat-label">{t('projects.create.visiblePartners')}:</span>
                                        <span className="project-partners-stat-value">{stats.partners.visible}</span>
                                    </div>
                                </>
                            )}
                            {values.sponsors?.length > 0 && (
                                <>
                                    <div className="project-partners-stat">
                                        <span className="project-partners-stat-label">{t('projects.create.totalSponsors')}:</span>
                                        <span className="project-partners-stat-value">{stats.sponsors.total}</span>
                                    </div>
                                    <div className="project-partners-stat">
                                        <span className="project-partners-stat-label">{t('projects.create.visibleSponsors')}:</span>
                                        <span className="project-partners-stat-value">{stats.sponsors.visible}</span>
                                    </div>
                                    <div className="project-partners-stat">
                                        <span className="project-partners-stat-label">{t('projects.create.totalFunding')}:</span>
                                        <span className="project-partners-stat-value">{stats.sponsors.totalFunding.toFixed(2)} BGN</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnersSponsorsSection;