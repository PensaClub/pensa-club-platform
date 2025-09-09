import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkedAlt, 
  faNetworkWired,
  faBuilding,
  faSitemap,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faInfoCircle,
  faGlobe,
  faUsers,
  faMapMarkerAlt,
  faSearch,
  faLink,
  faUnlink,
  faExchangeAlt,
  faHeart,
  faCrown,
  faHome,
  faCodeBranch,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './regionalInfoManager.css';

const RegionalInfoManager = ({ 
  regionalData, 
  onRegionalChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAffiliatedClub, setNewAffiliatedClub] = useState('');
  const [searchingClubs, setSearchingClubs] = useState(false);

  // Regional role options
  const regionalRoles = [
    { 
      value: 'local', 
      label: t('clubForm.regional.roles.local'), 
      icon: faHome,
      description: t('clubForm.regional.roles.localDescription')
    },
    { 
      value: 'central', 
      label: t('clubForm.regional.roles.central'), 
      icon: faCrown,
      description: t('clubForm.regional.roles.centralDescription')
    },
    { 
      value: 'branch', 
      label: t('clubForm.regional.roles.branch'), 
      icon: faCodeBranch,
      description: t('clubForm.regional.roles.branchDescription')
    }
  ];

  // Coverage areas suggestions
  const coverageAreas = [
    t('clubForm.regional.coverage.neighborhood'),
    t('clubForm.regional.coverage.district'),
    t('clubForm.regional.coverage.city'),
    t('clubForm.regional.coverage.region'),
    t('clubForm.regional.coverage.national')
  ];

 // Handle data changes - ПОДОБРЕНА ВЕРСИЯ
const handleDataChange = (field, value, currentData = regionalData) => {
  
  const updatedData = { ...currentData };
  
  if (field.includes('.')) {
    const keys = field.split('.');
    let current = updatedData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  } else {
    updatedData[field] = value;
  }
  
  onRegionalChange(updatedData);
  return updatedData; // Върни новите данни
};

// Handle role change - ВЕРСИЯ 2
const handleRoleChange = (role) => {
  
  if (disabled) {
    return;
  }
  
  // Chain the updates - всяко използва резултата от предишното
  let newData = handleDataChange('regionalRole', role);
  
  if (role === 'central') {
    newData = handleDataChange('isCentralClub', true, newData);
    newData = handleDataChange('centralClubId', '', newData);
  } else if (role === 'branch') {
    newData = handleDataChange('isCentralClub', false, newData);
  } else {
    newData = handleDataChange('isCentralClub', false, newData);
    newData = handleDataChange('centralClubId', '', newData);
  }
  
  console.log('Role changed successfully to:', role);
};

  // Add affiliated club
  const addAffiliatedClub = () => {
    if (!newAffiliatedClub.trim()) return;
    
    const affiliatedClubs = [...(regionalData?.affiliatedClubs || []), newAffiliatedClub.trim()];
    handleDataChange('affiliatedClubs', affiliatedClubs);
    
    setNewAffiliatedClub('');
    setShowAddForm(false);
  };

  // Remove affiliated club
  const removeAffiliatedClub = (index) => {
    const affiliatedClubs = (regionalData?.affiliatedClubs || []).filter((_, i) => i !== index);
    handleDataChange('affiliatedClubs', affiliatedClubs);
  };

  // Simulate club search
  const searchClubs = async (query) => {
    if (!query.trim()) return [];
    
    setSearchingClubs(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockClubs = [
      `${query} - Централен`,
      `${query} - Филиал 1`,
      `${query} - Филиал 2`,
      `Клуб "${query}" - София`,
      `Пенсионерски клуб "${query}"`
    ];
    
    setSearchingClubs(false);
    return mockClubs.slice(0, 3);
  };

  // Get current role info
  const getCurrentRoleInfo = () => {
    const role = regionalData?.regionalRole || 'local';
    return regionalRoles.find(r => r.value === role) || regionalRoles[0];
  };

  // Render role selection
  const renderRoleSelection = () => (
    <div className="regional-manager-role-section">
      <h4>{t('clubForm.regional.roleTitle')}</h4>
      <p>{t('clubForm.regional.roleDescription')}</p>
      
      <div className="regional-manager-role-grid">
        {regionalRoles.map(role => {
          const isSelected = (regionalData?.regionalRole || 'local') === role.value;
          
          return (
            <div
              key={role.value}
              className={`regional-manager-role-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleRoleChange(role.value)}
            >
              <div className="regional-manager-role-icon">
                <FontAwesomeIcon icon={role.icon} />
              </div>
              <div className="regional-manager-role-info">
                <h5>{role.label}</h5>
                <p>{role.description}</p>
              </div>
              {isSelected && (
                <div className="regional-manager-role-check">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render central club connection (for branch clubs)
  const renderCentralClubConnection = () => {
    if (regionalData?.regionalRole !== 'branch') return null;
    
    return (
      <div className="regional-manager-central-section">
        <h4>{t('clubForm.regional.centralClub.title')}</h4>
        <p>{t('clubForm.regional.centralClub.description')}</p>
        
        <div className="regional-manager-form-group">
          <label className="regional-manager-form-label">
            <FontAwesomeIcon icon={faLink} />
            {t('clubForm.regional.fields.centralClubId')}
          </label>
          <input
            type="text"
            className="regional-manager-form-input"
            placeholder={t('clubForm.regional.placeholders.centralClubId')}
            value={regionalData?.centralClubId || ''}
            onChange={(e) => handleDataChange('centralClubId', e.target.value)}
            disabled={disabled}
          />
          <div className="regional-manager-form-help">
            {t('clubForm.regional.centralClub.help')}
          </div>
        </div>
      </div>
    );
  };

  // Render affiliated clubs (for central clubs)
  const renderAffiliatedClubs = () => {
    if (regionalData?.regionalRole !== 'central') return null;
    
    const affiliatedClubs = regionalData?.affiliatedClubs || [];
    
    return (
      <div className="regional-manager-affiliated-section">
        <h4>{t('clubForm.regional.affiliated.title')}</h4>
        <p>{t('clubForm.regional.affiliated.description')}</p>
        
        {/* Add Form */}
        {showAddForm && (
          <div className="regional-manager-add-form">
            <div className="regional-manager-add-form-header">
              <h5>{t('clubForm.regional.affiliated.addNew')}</h5>
              <button 
                className="regional-manager-close-form-btn"
                onClick={() => setShowAddForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="regional-manager-form-group">
              <label className="regional-manager-form-label">
                <FontAwesomeIcon icon={faUsers} />
                {t('clubForm.regional.fields.clubName')}
              </label>
              <input
                type="text"
                className="regional-manager-form-input"
                placeholder={t('clubForm.regional.placeholders.clubName')}
                value={newAffiliatedClub}
                onChange={(e) => setNewAffiliatedClub(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="regional-manager-form-actions">
              <button
                type="button"
                className="regional-manager-form-btn cancel"
                onClick={() => setShowAddForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} />
                {t('clubForm.regional.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="regional-manager-form-btn add"
                onClick={addAffiliatedClub}
                disabled={disabled || !newAffiliatedClub.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('clubForm.regional.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Affiliated Clubs List */}
        {affiliatedClubs.length > 0 ? (
          <div className="regional-manager-clubs-list">
            {affiliatedClubs.map((club, index) => (
              <div key={index} className="regional-manager-club-item">
                <div className="regional-manager-club-icon">
                  <FontAwesomeIcon icon={faCodeBranch} />
                </div>
                <div className="regional-manager-club-name">
                  {club}
                </div>
                <button
                  className="regional-manager-remove-club-btn"
                  onClick={() => removeAffiliatedClub(index)}
                  title={t('clubForm.regional.actions.remove')}
                  disabled={disabled}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="regional-manager-empty-clubs">
            <FontAwesomeIcon icon={faUsers} />
            <p>{t('clubForm.regional.affiliated.empty')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <div className="regional-manager-add-section">
            <button
              className="regional-manager-add-btn"
              onClick={() => setShowAddForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('clubForm.regional.affiliated.addNew')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render coverage area
  const renderCoverageArea = () => (
    <div className="regional-manager-coverage-section">
      <h4>{t('clubForm.regional.coverage.title')}</h4>
      <p>{t('clubForm.regional.coverage.description')}</p>
      
      <div className="regional-manager-form-group">
        <label className="regional-manager-form-label">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          {t('clubForm.regional.fields.coverageArea')}
        </label>
        
        <div className="regional-manager-coverage-input">
          <input
            type="text"
            className="regional-manager-form-input"
            placeholder={t('clubForm.regional.placeholders.coverageArea')}
            value={regionalData?.coverageArea || ''}
            onChange={(e) => handleDataChange('coverageArea', e.target.value)}
            disabled={disabled}
          />
        </div>
        
        {/* Coverage suggestions */}
        <div className="regional-manager-coverage-suggestions">
          <span className="regional-manager-suggestions-label">
            {t('clubForm.regional.coverage.suggestions')}:
          </span>
          <div className="regional-manager-suggestions-list">
            {coverageAreas.map((area, index) => (
              <button
                key={index}
                type="button"
                className="regional-manager-suggestion-btn"
                onClick={() => handleDataChange('coverageArea', area)}
                disabled={disabled}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="regional-manager">
      
      {/* Header */}
      <div className="regional-manager-header">
        <h3 className="regional-manager-title">
          <FontAwesomeIcon icon={faMapMarkedAlt} />
          {t('clubForm.regional.title')}
        </h3>
        <p className="regional-manager-subtitle">
          {t('clubForm.regional.subtitle')}
        </p>
      </div>

      {/* Current Status Overview */}
      <div className="regional-manager-overview">
        <div className="regional-manager-status-card">
          <div className="regional-manager-status-icon">
            <FontAwesomeIcon icon={getCurrentRoleInfo().icon} />
          </div>
          <div className="regional-manager-status-info">
            <h4>{getCurrentRoleInfo().label}</h4>
            <p>{getCurrentRoleInfo().description}</p>
          </div>
        </div>
        
        {regionalData?.coverageArea && (
          <div className="regional-manager-coverage-display">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{regionalData.coverageArea}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="regional-manager-content">
        
        {/* Role Selection */}
        {renderRoleSelection()}

        {/* Central Club Connection (for branches) */}
        {renderCentralClubConnection()}

        {/* Affiliated Clubs (for central clubs) */}
        {renderAffiliatedClubs()}

        {/* Coverage Area */}
        {renderCoverageArea()}

      </div>

      {/* Help Section */}
      <div className="regional-manager-help">
        <div className="regional-manager-help-icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="regional-manager-help-content">
          <h5>{t('clubForm.regional.help.title')}</h5>
          <p>{t('clubForm.regional.help.description')}</p>
          <ul>
            <li>{t('clubForm.regional.help.tip1')}</li>
            <li>{t('clubForm.regional.help.tip2')}</li>
            <li>{t('clubForm.regional.help.tip3')}</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default RegionalInfoManager;