import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCoins, 
  faWallet,
  faHandshake,
  faChartLine,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faInfoCircle,
  faEuroSign,
  faDollarSign,
  faMoneyBillWave,
  faBuildingColumns,
  faUsers,
  faGift,
  faCalendarAlt,
  faHeart,
  faPhone,
  faMapMarkerAlt,
  faGlobe,
  faClock,
  faPercentage,
  faBusinessTime,
  faSpinner,
  faEye,
  faEyeSlash,
  faCalculator,
  faPiggyBank,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';
import './financesManager.css';

const FinancesManager = ({ 
  financesData, 
  onFinancesChange, 
  disabled = false 
}) => {
  const { t } = useTranslation('clubs');
  
  const [activeTab, setActiveTab] = useState('budget');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAmounts, setShowAmounts] = useState(true);
  
  const [newFunding, setNewFunding] = useState({
    source: '',
    amount: 0,
    type: 'subsidy'
  });

  const [newSponsor, setNewSponsor] = useState({
    name: '',
    contribution: '',
    type: 'services',
    contact: '',
    address: '',
    website: '',
    workingHours: '',
    discount: '',
    description: ''
  });

  // Finance tabs
  const financeTabs = [
    { id: 'budget', label: t('clubForm.finances.tabs.budget'), icon: faWallet },
    { id: 'funding', label: t('clubForm.finances.tabs.funding'), icon: faChartLine },
    { id: 'sponsors', label: t('clubForm.finances.tabs.sponsors'), icon: faHandshake }
  ];

  // Currency options
  const currencies = [
    { value: 'BGN', label: 'BGN (лв.)', symbol: 'лв.' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'USD', label: 'USD ($)', symbol: '$' }
  ];

  // Funding types
  const fundingTypes = [
    { value: 'subsidy', label: t('clubForm.finances.fundingTypes.subsidy'), icon: faBuildingColumns },
    { value: 'membership', label: t('clubForm.finances.fundingTypes.membership'), icon: faUsers },
    { value: 'donations', label: t('clubForm.finances.fundingTypes.donations'), icon: faHeart },
    { value: 'events', label: t('clubForm.finances.fundingTypes.events'), icon: faCalendarAlt },
    { value: 'sponsorship', label: t('clubForm.finances.fundingTypes.sponsorship'), icon: faHandshake }
  ];

  // Sponsor types
  const sponsorTypes = [
    { value: 'services', label: t('clubForm.finances.sponsorTypes.services'), icon: faBusinessTime },
    { value: 'discounts', label: t('clubForm.finances.sponsorTypes.discounts'), icon: faPercentage },
    { value: 'goods', label: t('clubForm.finances.sponsorTypes.goods'), icon: faGift },
    { value: 'money', label: t('clubForm.finances.sponsorTypes.money'), icon: faMoneyBillWave }
  ];

  // Handle data changes
  const handleDataChange = (field, value) => {
    const updatedData = { ...financesData };
    
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
    
    onFinancesChange(updatedData);
  };

  // Add funding source
  const addFunding = () => {
    if (!newFunding.source.trim() || newFunding.amount <= 0) return;
    
    const funding = [...(financesData?.funding || []), { ...newFunding, id: Date.now().toString() }];
    handleDataChange('funding', funding);
    
    setNewFunding({
      source: '',
      amount: 0,
      type: 'subsidy'
    });
    setShowAddForm(false);
  };

  // Add sponsor
  const addSponsor = () => {
    if (!newSponsor.name.trim()) return;
    
    const sponsors = [...(financesData?.sponsors || []), { ...newSponsor, id: Date.now().toString() }];
    handleDataChange('sponsors', sponsors);
    
    setNewSponsor({
      name: '',
      contribution: '',
      type: 'services',
      contact: '',
      address: '',
      website: '',
      workingHours: '',
      discount: '',
      description: ''
    });
    setShowAddForm(false);
  };

  // Remove item
  const removeItem = (id, type) => {
    if (type === 'funding') {
      const funding = (financesData?.funding || []).filter(item => item.id !== id);
      handleDataChange('funding', funding);
    } else {
      const sponsors = (financesData?.sponsors || []).filter(item => item.id !== id);
      handleDataChange('sponsors', sponsors);
    }
  };

  // Update item
  const updateItem = (id, updates, type) => {
    if (type === 'funding') {
      const funding = (financesData?.funding || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      handleDataChange('funding', funding);
    } else {
      const sponsors = (financesData?.sponsors || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      handleDataChange('sponsors', sponsors);
    }
  };

  // Calculate total funding
  const calculateTotalFunding = () => {
    return (financesData?.funding || []).reduce((total, item) => total + (item.amount || 0), 0);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = financesData?.budget?.currency || 'BGN';
    return currencies.find(c => c.value === currency)?.symbol || 'лв.';
  };

  // Format amount
  const formatAmount = (amount) => {
    if (!showAmounts) return '***';
    return new Intl.NumberFormat('bg-BG').format(amount);
  };

  // Render budget section
  const renderBudgetSection = () => (
    <div className="finances-manager-section-content">
      <div className="finances-manager-budget-overview">
        <div className="finances-manager-budget-card main">
          <div className="finances-manager-budget-icon">
            <FontAwesomeIcon icon={faWallet} />
          </div>
          <div className="finances-manager-budget-info">
            <h4>{t('clubForm.finances.budget.yearlyBudget')}</h4>
            <div className="finances-manager-budget-amount">
              {formatAmount(financesData?.budget?.yearly || 0)} {getCurrencySymbol()}
            </div>
          </div>
        </div>

        <div className="finances-manager-budget-card">
          <div className="finances-manager-budget-icon funding">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="finances-manager-budget-info">
            <h4>{t('clubForm.finances.budget.totalFunding')}</h4>
            <div className="finances-manager-budget-amount">
              {formatAmount(calculateTotalFunding())} {getCurrencySymbol()}
            </div>
          </div>
        </div>

        <div className="finances-manager-budget-card">
          <div className="finances-manager-budget-icon sponsors">
            <FontAwesomeIcon icon={faHandshake} />
          </div>
          <div className="finances-manager-budget-info">
            <h4>{t('clubForm.finances.budget.sponsors')}</h4>
            <div className="finances-manager-budget-amount">
              {(financesData?.sponsors || []).length}
            </div>
          </div>
        </div>
      </div>

      <div className="finances-manager-budget-form">
        <div className="finances-manager-form-row">
          <div className="finances-manager-form-group">
            <label className="finances-manager-form-label">
              <FontAwesomeIcon icon={faCalculator} />
              {t('clubForm.finances.fields.yearlyBudget')}
            </label>
            <input
              type="number"
              className="finances-manager-form-input"
              placeholder={t('clubForm.finances.placeholders.yearlyBudget')}
              value={financesData?.budget?.yearly || ''}
              onChange={(e) => handleDataChange('budget.yearly', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              min="0"
              step="0.01"
            />
          </div>

          <div className="finances-manager-form-group">
            <label className="finances-manager-form-label">
              <FontAwesomeIcon icon={faCoins} />
              {t('clubForm.finances.fields.currency')}
            </label>
            <select
              className="finances-manager-form-select"
              value={financesData?.budget?.currency || 'BGN'}
              onChange={(e) => handleDataChange('budget.currency', e.target.value)}
              disabled={disabled}
            >
              {currencies.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Render funding section
  const renderFundingSection = () => {
    const funding = financesData?.funding || [];
    
    return (
      <div className="finances-manager-section-content">
        
        {/* Add Form */}
        {showAddForm && (
          <div className="finances-manager-add-form">
            <div className="finances-manager-add-form-header">
              <h4>{t('clubForm.finances.addFunding')}</h4>
              <button 
                className="finances-manager-close-form-btn"
                onClick={() => setShowAddForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="finances-manager-form-grid">
              <div className="finances-manager-form-group full-width">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faBuildingColumns} />
                  {t('clubForm.finances.fields.source')}
                </label>
                <input
                  type="text"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.source')}
                  value={newFunding.source}
                  onChange={(e) => setNewFunding({...newFunding, source: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  {t('clubForm.finances.fields.amount')}
                </label>
                <input
                  type="number"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.amount')}
                  value={newFunding.amount}
                  onChange={(e) => setNewFunding({...newFunding, amount: parseFloat(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faChartPie} />
                  {t('clubForm.finances.fields.type')}
                </label>
                <select
                  className="finances-manager-form-select"
                  value={newFunding.type}
                  onChange={(e) => setNewFunding({...newFunding, type: e.target.value})}
                  disabled={disabled}
                >
                  {fundingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="finances-manager-form-actions">
              <button
                type="button"
                className="finances-manager-form-btn cancel"
                onClick={() => setShowAddForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} />
                {t('clubForm.finances.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="finances-manager-form-btn add"
                onClick={addFunding}
                disabled={disabled || !newFunding.source.trim() || newFunding.amount <= 0}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('clubForm.finances.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Funding List */}
        {funding.length > 0 ? (
          <div className="finances-manager-list">
            {funding.map(item => {
              const typeInfo = fundingTypes.find(t => t.value === item.type);
              
              return (
                <div key={item.id} className="finances-manager-item-card">
                  <div className="finances-manager-item-icon">
                    <FontAwesomeIcon icon={typeInfo?.icon || faChartLine} />
                  </div>
                  
                  <div className="finances-manager-item-info">
                    <h5>{item.source}</h5>
                    <div className="finances-manager-item-details">
                      <span className="finances-manager-amount">
                        {formatAmount(item.amount)} {getCurrencySymbol()}
                      </span>
                      <span className="finances-manager-type-badge">
                        {typeInfo?.label}
                      </span>
                    </div>
                  </div>

                  <div className="finances-manager-item-actions">
                    <button
                      className="finances-manager-action-btn edit"
                      onClick={() => setEditingItem(item)}
                      title={t('clubForm.finances.actions.edit')}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    
                    <button
                      className="finances-manager-action-btn delete"
                      onClick={() => removeItem(item.id, 'funding')}
                      title={t('clubForm.finances.actions.delete')}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="finances-manager-empty">
            <FontAwesomeIcon icon={faChartLine} />
            <h4>{t('clubForm.finances.funding.empty.title')}</h4>
            <p>{t('clubForm.finances.funding.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <div className="finances-manager-add-section">
            <button
              className="finances-manager-add-btn"
              onClick={() => setShowAddForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('clubForm.finances.addFunding')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render sponsors section
  const renderSponsorsSection = () => {
    const sponsors = financesData?.sponsors || [];
    
    return (
      <div className="finances-manager-section-content">
        
        {/* Add Form */}
        {showAddForm && (
          <div className="finances-manager-add-form">
            <div className="finances-manager-add-form-header">
              <h4>{t('clubForm.finances.addSponsor')}</h4>
              <button 
                className="finances-manager-close-form-btn"
                onClick={() => setShowAddForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="finances-manager-form-grid">
              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faHandshake} />
                  {t('clubForm.finances.fields.sponsorName')}
                </label>
                <input
                  type="text"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.sponsorName')}
                  value={newSponsor.name}
                  onChange={(e) => setNewSponsor({...newSponsor, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faGift} />
                  {t('clubForm.finances.fields.sponsorType')}
                </label>
                <select
                  className="finances-manager-form-select"
                  value={newSponsor.type}
                  onChange={(e) => setNewSponsor({...newSponsor, type: e.target.value})}
                  disabled={disabled}
                >
                  {sponsorTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="finances-manager-form-group full-width">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  {t('clubForm.finances.fields.contribution')}
                </label>
                <textarea
                  className="finances-manager-form-textarea"
                  placeholder={t('clubForm.finances.placeholders.contribution')}
                  value={newSponsor.contribution}
                  onChange={(e) => setNewSponsor({...newSponsor, contribution: e.target.value})}
                  disabled={disabled}
                  rows={2}
                />
              </div>

              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faPhone} />
                  {t('clubForm.finances.fields.contact')}
                </label>
                <input
                  type="tel"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.contact')}
                  value={newSponsor.contact}
                  onChange={(e) => setNewSponsor({...newSponsor, contact: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faGlobe} />
                  {t('clubForm.finances.fields.website')}
                </label>
                <input
                  type="url"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.website')}
                  value={newSponsor.website}
                  onChange={(e) => setNewSponsor({...newSponsor, website: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="finances-manager-form-group full-width">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {t('clubForm.finances.fields.address')}
                </label>
                <input
                  type="text"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.address')}
                  value={newSponsor.address}
                  onChange={(e) => setNewSponsor({...newSponsor, address: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faClock} />
                  {t('clubForm.finances.fields.workingHours')}
                </label>
                <input
                  type="text"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.workingHours')}
                  value={newSponsor.workingHours}
                  onChange={(e) => setNewSponsor({...newSponsor, workingHours: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="finances-manager-form-group">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faPercentage} />
                  {t('clubForm.finances.fields.discount')}
                </label>
                <input
                  type="text"
                  className="finances-manager-form-input"
                  placeholder={t('clubForm.finances.placeholders.discount')}
                  value={newSponsor.discount}
                  onChange={(e) => setNewSponsor({...newSponsor, discount: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="finances-manager-form-group full-width">
                <label className="finances-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  {t('clubForm.finances.fields.description')}
                </label>
                <textarea
                  className="finances-manager-form-textarea"
                  placeholder={t('clubForm.finances.placeholders.description')}
                  value={newSponsor.description}
                  onChange={(e) => setNewSponsor({...newSponsor, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="finances-manager-form-actions">
              <button
                type="button"
                className="finances-manager-form-btn cancel"
                onClick={() => setShowAddForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} />
                {t('clubForm.finances.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="finances-manager-form-btn add"
                onClick={addSponsor}
                disabled={disabled || !newSponsor.name.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('clubForm.finances.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Sponsors List */}
        {sponsors.length > 0 ? (
          <div className="finances-manager-sponsors-grid">
            {sponsors.map(sponsor => {
              const typeInfo = sponsorTypes.find(t => t.value === sponsor.type);
              
              return (
                <div key={sponsor.id} className="finances-manager-sponsor-card">
                  <div className="finances-manager-sponsor-header">
                    <div className="finances-manager-sponsor-icon">
                      <FontAwesomeIcon icon={typeInfo?.icon || faHandshake} />
                    </div>
                    <div className="finances-manager-sponsor-name">
                      <h5>{sponsor.name}</h5>
                      <span className="finances-manager-sponsor-type">
                        {typeInfo?.label}
                      </span>
                    </div>
                    <div className="finances-manager-sponsor-actions">
                      <button
                        className="finances-manager-action-btn edit"
                        onClick={() => setEditingItem(sponsor)}
                        title={t('clubForm.finances.actions.edit')}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      
                      <button
                        className="finances-manager-action-btn delete"
                        onClick={() => removeItem(sponsor.id, 'sponsors')}
                        title={t('clubForm.finances.actions.delete')}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>

                  <div className="finances-manager-sponsor-content">
                    {sponsor.contribution && (
                      <p className="finances-manager-sponsor-contribution">
                        {sponsor.contribution}
                      </p>
                    )}

                    <div className="finances-manager-sponsor-details">
                      {sponsor.contact && (
                        <div className="finances-manager-sponsor-detail">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{sponsor.contact}</span>
                        </div>
                      )}
                      
                      {sponsor.website && (
                        <div className="finances-manager-sponsor-detail">
                          <FontAwesomeIcon icon={faGlobe} />
                          <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                            {sponsor.website}
                          </a>
                        </div>
                      )}
                      
                      {sponsor.discount && (
                        <div className="finances-manager-sponsor-detail discount">
                          <FontAwesomeIcon icon={faPercentage} />
                          <span>{sponsor.discount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="finances-manager-empty">
            <FontAwesomeIcon icon={faHandshake} />
            <h4>{t('clubForm.finances.sponsors.empty.title')}</h4>
            <p>{t('clubForm.finances.sponsors.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <div className="finances-manager-add-section">
            <button
              className="finances-manager-add-btn"
              onClick={() => setShowAddForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('clubForm.finances.addSponsor')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="finances-manager">
      
      {/* Header */}
      <div className="finances-manager-header">
        <h3 className="finances-manager-title">
          <FontAwesomeIcon icon={faCoins} />
          {t('clubForm.finances.title')}
        </h3>
        <p className="finances-manager-subtitle">
          {t('clubForm.finances.subtitle')}
        </p>
        
        {/* Privacy Toggle */}
        <div className="finances-manager-privacy">
          <button
            className="finances-manager-privacy-btn"
            onClick={() => setShowAmounts(!showAmounts)}
            title={showAmounts ? t('clubForm.finances.hideAmounts') : t('clubForm.finances.showAmounts')}
          >
            <FontAwesomeIcon icon={showAmounts ? faEyeSlash : faEye} />
            {showAmounts ? t('clubForm.finances.hideAmounts') : t('clubForm.finances.showAmounts')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="finances-manager-tabs">
        {financeTabs.map(tab => (
          <button
            key={tab.id}
            className={`finances-manager-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setShowAddForm(false);
            }}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="finances-manager-content">
        
        {/* Budget Section */}
        {activeTab === 'budget' && (
          <div className="finances-manager-section">
            <div className="finances-manager-section-header">
              <h4>{t('clubForm.finances.budget.title')}</h4>
              <p>{t('clubForm.finances.budget.description')}</p>
            </div>
            {renderBudgetSection()}
          </div>
        )}

        {/* Funding Section */}
        {activeTab === 'funding' && (
          <div className="finances-manager-section">
            <div className="finances-manager-section-header">
              <h4>{t('clubForm.finances.funding.title')}</h4>
              <p>{t('clubForm.finances.funding.description')}</p>
            </div>
            {renderFundingSection()}
          </div>
        )}

        {/* Sponsors Section */}
        {activeTab === 'sponsors' && (
          <div className="finances-manager-section">
            <div className="finances-manager-section-header">
              <h4>{t('clubForm.finances.sponsors.title')}</h4>
              <p>{t('clubForm.finances.sponsors.description')}</p>
            </div>
            {renderSponsorsSection()}
          </div>
        )}

      </div>

      {/* Help Section */}
      <div className="finances-manager-help">
        <div className="finances-manager-help-icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="finances-manager-help-content">
          <h5>{t('clubForm.finances.help.title')}</h5>
          <p>{t('clubForm.finances.help.description')}</p>
          <ul>
            <li>{t('clubForm.finances.help.tip1')}</li>
            <li>{t('clubForm.finances.help.tip2')}</li>
            <li>{t('clubForm.finances.help.tip3')}</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default FinancesManager;