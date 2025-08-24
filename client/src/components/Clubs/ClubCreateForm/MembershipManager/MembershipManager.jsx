import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faPlus,
  faMinus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faInfoCircle,
  faCrown,
  faUserTie,
  faUserGraduate,
  faUserShield,
  faEuroSign,
  faCalendarAlt,
  faGavel,
  faHandshake,
  faAward,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './membershipManager.css';

const MembershipManager = ({ 
  membershipData, 
  onMembershipChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [editingRole, setEditingRole] = useState(null);
  const [editingFee, setEditingFee] = useState(null);
  const [newRole, setNewRole] = useState({ name: '', description: '', responsibilities: '' });
  const [newFee, setNewFee] = useState({ type: '', amount: '', period: 'yearly', description: '' });
const [newRequirement, setNewRequirement] = useState('');
const [newBenefit, setNewBenefit] = useState('');
  // Membership types
  const membershipTypes = [
    { value: 'open', label: t('clubForm.membership.types.open'), icon: faHandshake },
    { value: 'invitation', label: t('clubForm.membership.types.invitation'), icon: faUserShield },
    { value: 'application', label: t('clubForm.membership.types.application'), icon: faUserGraduate },
    { value: 'recommendation', label: t('clubForm.membership.types.recommendation'), icon: faAward }
  ];

  // Default management roles
  const defaultRoles = [
    { 
      id: 'president', 
      name: t('clubForm.membership.roles.president'), 
      icon: faCrown,
      isRequired: true,
      maxCount: 1,
      responsibilities: t('clubForm.membership.roles.presidentDesc')
    },
    { 
      id: 'vice_president', 
      name: t('clubForm.membership.roles.vicePresident'), 
      icon: faUserTie,
      isRequired: false,
      maxCount: 2,
      responsibilities: t('clubForm.membership.roles.vicePresidentDesc')
    },
    { 
      id: 'secretary', 
      name: t('clubForm.membership.roles.secretary'), 
      icon: faEdit,
      isRequired: true,
      maxCount: 1,
      responsibilities: t('clubForm.membership.roles.secretaryDesc')
    },
    { 
      id: 'treasurer', 
      name: t('clubForm.membership.roles.treasurer'), 
      icon: faEuroSign,
      isRequired: true,
      maxCount: 1,
      responsibilities: t('clubForm.membership.roles.treasurerDesc')
    }
  ];

  // Fee periods
  const feePeriods = [
    { value: 'monthly', label: t('clubForm.membership.fees.periods.monthly') },
    { value: 'quarterly', label: t('clubForm.membership.fees.periods.quarterly') },
    { value: 'yearly', label: t('clubForm.membership.fees.periods.yearly') },
    { value: 'onetime', label: t('clubForm.membership.fees.periods.onetime') }
  ];

  // Handle field changes
  const handleFieldChange = (field, value) => {
    const updatedMembership = { ...membershipData };
    
    if (field.includes('.')) {
      const keys = field.split('.');
      let current = updatedMembership;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedMembership[field] = value;
    }
    
    onMembershipChange(updatedMembership);
  };

  // Handle management role changes
  const handleRoleUpdate = (roleId, field, value) => {
    const updatedRoles = { ...membershipData.management?.roles || {} };
    if (!updatedRoles[roleId]) {
      updatedRoles[roleId] = {};
    }
    updatedRoles[roleId][field] = value;
    handleFieldChange('management.roles', updatedRoles);
  };

  // Add new custom role
  const addCustomRole = () => {
    if (!newRole.name.trim()) return;
    
    const roleId = `custom_${Date.now()}`;
    const customRole = {
      ...newRole,
      id: roleId,
      isCustom: true,
      icon: faUserTie
    };
    
    const updatedRoles = { ...membershipData.management?.roles || {} };
    updatedRoles[roleId] = customRole;
    
    handleFieldChange('management.roles', updatedRoles);
    setNewRole({ name: '', description: '', responsibilities: '' });
  };

  // Remove custom role
  const removeCustomRole = (roleId) => {
    const updatedRoles = { ...membershipData.management?.roles || {} };
    delete updatedRoles[roleId];
    handleFieldChange('management.roles', updatedRoles);
  };

  // Handle membership fees
  const handleFeeUpdate = (feeIndex, field, value) => {
    const updatedFees = [...(membershipData.fees?.list || [])];
    if (!updatedFees[feeIndex]) {
      updatedFees[feeIndex] = {};
    }
    updatedFees[feeIndex][field] = value;
    handleFieldChange('fees.list', updatedFees);
  };

  // Add new fee
  const addFee = () => {
    if (!newFee.type.trim() || !newFee.amount) return;
    
    const updatedFees = [...(membershipData.fees?.list || [])];
    updatedFees.push({ ...newFee, id: Date.now() });
    
    handleFieldChange('fees.list', updatedFees);
    setNewFee({ type: '', amount: '', period: 'yearly', description: '' });
  };

  // Remove fee
  const removeFee = (feeIndex) => {
    const updatedFees = [...(membershipData.fees?.list || [])];
    updatedFees.splice(feeIndex, 1);
    handleFieldChange('fees.list', updatedFees);
  };
const addRequirement = () => {
  if (!newRequirement.trim()) return;
  
  const updatedRequirements = [...(membershipData?.requirements || [])];
  updatedRequirements.push(newRequirement.trim());
  
  handleFieldChange('requirements', updatedRequirements);
  setNewRequirement('');
};

const removeRequirement = (index) => {
  const updatedRequirements = [...(membershipData?.requirements || [])];
  updatedRequirements.splice(index, 1);
  handleFieldChange('requirements', updatedRequirements);
};

// Benefits functions
const addBenefit = () => {
  if (!newBenefit.trim()) return;
  
  const updatedBenefits = [...(membershipData?.benefits || [])];
  updatedBenefits.push(newBenefit.trim());
  
  handleFieldChange('benefits', updatedBenefits);
  setNewBenefit('');
};

const removeBenefit = (index) => {
  const updatedBenefits = [...(membershipData?.benefits || [])];
  updatedBenefits.splice(index, 1);
  handleFieldChange('benefits', updatedBenefits);
};
  return (
    <div className="membership-manager">
      
      {/* Header */}
      <div className="membership-manager-header">
        <h3 className="membership-manager-title">
          <FontAwesomeIcon icon={faUsers} />
          {t('clubForm.membership.title')}
        </h3>
        <p className="membership-manager-subtitle">
          {t('clubForm.membership.subtitle')}
        </p>
      </div>

      {/* Membership Type */}
      <div className="membership-manager-section">
        <h4 className="membership-manager-section-title">
          <FontAwesomeIcon icon={faHandshake} />
          {t('clubForm.membership.typeSection')}
        </h4>
        
        <div className="membership-manager-types-grid">
          {membershipTypes.map(type => (
            <label
              key={type.value}
              className={`membership-manager-type-card ${
                membershipData?.type === type.value ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name="membershipType"
                value={type.value}
                checked={membershipData?.type === type.value}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                disabled={disabled}
              />
              <div className="membership-manager-type-icon">
                <FontAwesomeIcon icon={type.icon} />
              </div>
              <div className="membership-manager-type-label">
                {type.label}
              </div>
              <div className="membership-manager-type-description">
                {t(`clubForm.membership.types.${type.value}Desc`)}
              </div>
            </label>
          ))}
        </div>

        {/* Additional Type Settings */}
        <div className="membership-manager-type-settings">
          
          {/* Minimum Age */}
          <div className="membership-manager-form-group">
            <label className="membership-manager-form-label">
              {t('clubForm.membership.fields.minimumAge')}
            </label>
            <input
              type="number"
              className="membership-manager-form-input"
              placeholder="18"
              value={membershipData?.minimumAge || ''}
              onChange={(e) => handleFieldChange('minimumAge', parseInt(e.target.value) || 18)}
              disabled={disabled}
              min="0"
              max="100"
            />
          </div>

          {/* Maximum Members */}
          <div className="membership-manager-form-group">
            <label className="membership-manager-form-label">
              {t('clubForm.membership.fields.maxMembers')}
            </label>
            <input
              type="number"
              className="membership-manager-form-input"
              placeholder={t('clubForm.membership.placeholders.unlimited')}
              value={membershipData?.maxMembers || ''}
              onChange={(e) => handleFieldChange('maxMembers', parseInt(e.target.value) || null)}
              disabled={disabled}
              min="1"
            />
          </div>

          {/* Trial Period */}
          <div className="membership-manager-form-group">
            <label className="membership-manager-checkbox-label">
              <input
                type="checkbox"
                checked={membershipData?.trialPeriod?.enabled || false}
                onChange={(e) => handleFieldChange('trialPeriod.enabled', e.target.checked)}
                disabled={disabled}
              />
              <span className="membership-manager-checkbox"></span>
              {t('clubForm.membership.fields.trialPeriod')}
            </label>
            
            {membershipData?.trialPeriod?.enabled && (
              <input
                type="number"
                className="membership-manager-form-input"
                placeholder="30"
                value={membershipData?.trialPeriod?.days || ''}
                onChange={(e) => handleFieldChange('trialPeriod.days', parseInt(e.target.value) || 30)}
                disabled={disabled}
                min="1"
                max="365"
              />
            )}
          </div>

        </div>
      </div>
      {/* Membership Demographics */}
<div className="membership-manager-section">
  <h4 className="membership-manager-section-title">
    <FontAwesomeIcon icon={faUsers} />
    {t('clubForm.membership.demographicsSection')}
  </h4>

  {/* Total Members */}
  <div className="membership-manager-demographics-header">
    <div className="membership-manager-form-group">
      <label className="membership-manager-form-label">
        {t('clubForm.membership.fields.totalMembers')}
      </label>
      <input
        type="number"
        className="membership-manager-form-input"
        placeholder="0"
        value={membershipData?.totalMembers || ''}
        onChange={(e) => handleFieldChange('totalMembers', parseInt(e.target.value) || 0)}
        disabled={disabled}
        min="0"
      />
      <div className="membership-manager-form-help">
        {t('clubForm.membership.help.totalMembers')}
      </div>
    </div>
  </div>

  {/* Age Groups Distribution */}
  <div className="membership-manager-age-groups">
    <h5 className="membership-manager-subsection-title">
      <FontAwesomeIcon icon={faCalendarAlt} />
      {t('clubForm.membership.ageGroups.title')}
    </h5>
    
    <div className="membership-manager-age-groups-grid">
      
      {/* Under 60 */}
      <div className="membership-manager-age-group-item">
        <div className="membership-manager-age-group-header">
          <div className="membership-manager-age-group-icon under-60">
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
          <div className="membership-manager-age-group-info">
            <h6>{t('clubForm.membership.ageGroups.under60')}</h6>
            <p>{t('clubForm.membership.ageGroups.under60Desc')}</p>
          </div>
        </div>
        <div className="membership-manager-age-group-input">
          <input
            type="number"
            className="membership-manager-form-input compact"
            placeholder="0"
            value={membershipData?.ageGroups?.['под-60'] || ''}
            onChange={(e) => handleFieldChange('ageGroups.под-60', parseInt(e.target.value) || 0)}
            disabled={disabled}
            min="0"
          />
          <span className="membership-manager-age-group-label">
            {t('clubForm.membership.ageGroups.members')}
          </span>
        </div>
      </div>

      {/* 60-70 */}
      <div className="membership-manager-age-group-item">
        <div className="membership-manager-age-group-header">
          <div className="membership-manager-age-group-icon age-60-70">
            <FontAwesomeIcon icon={faUserTie} />
          </div>
          <div className="membership-manager-age-group-info">
            <h6>{t('clubForm.membership.ageGroups.age60to70')}</h6>
            <p>{t('clubForm.membership.ageGroups.age60to70Desc')}</p>
          </div>
        </div>
        <div className="membership-manager-age-group-input">
          <input
            type="number"
            className="membership-manager-form-input compact"
            placeholder="0"
            value={membershipData?.ageGroups?.['60-70'] || ''}
            onChange={(e) => handleFieldChange('ageGroups.60-70', parseInt(e.target.value) || 0)}
            disabled={disabled}
            min="0"
          />
          <span className="membership-manager-age-group-label">
            {t('clubForm.membership.ageGroups.members')}
          </span>
        </div>
      </div>

      {/* 70-80 */}
      <div className="membership-manager-age-group-item">
        <div className="membership-manager-age-group-header">
          <div className="membership-manager-age-group-icon age-70-80">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <div className="membership-manager-age-group-info">
            <h6>{t('clubForm.membership.ageGroups.age70to80')}</h6>
            <p>{t('clubForm.membership.ageGroups.age70to80Desc')}</p>
          </div>
        </div>
        <div className="membership-manager-age-group-input">
          <input
            type="number"
            className="membership-manager-form-input compact"
            placeholder="0"
            value={membershipData?.ageGroups?.['70-80'] || ''}
            onChange={(e) => handleFieldChange('ageGroups.70-80', parseInt(e.target.value) || 0)}
            disabled={disabled}
            min="0"
          />
          <span className="membership-manager-age-group-label">
            {t('clubForm.membership.ageGroups.members')}
          </span>
        </div>
      </div>

      {/* 80+ */}
      <div className="membership-manager-age-group-item">
        <div className="membership-manager-age-group-header">
          <div className="membership-manager-age-group-icon age-80-plus">
            <FontAwesomeIcon icon={faCrown} />
          </div>
          <div className="membership-manager-age-group-info">
            <h6>{t('clubForm.membership.ageGroups.age80plus')}</h6>
            <p>{t('clubForm.membership.ageGroups.age80plusDesc')}</p>
          </div>
        </div>
        <div className="membership-manager-age-group-input">
          <input
            type="number"
            className="membership-manager-form-input compact"
            placeholder="0"
            value={membershipData?.ageGroups?.['80+'] || ''}
            onChange={(e) => handleFieldChange('ageGroups.80+', parseInt(e.target.value) || 0)}
            disabled={disabled}
            min="0"
          />
          <span className="membership-manager-age-group-label">
            {t('clubForm.membership.ageGroups.members')}
          </span>
        </div>
      </div>

    </div>

    {/* Age Groups Summary */}
    <div className="membership-manager-age-groups-summary">
      <div className="membership-manager-summary-item">
        <span className="membership-manager-summary-label">
          {t('clubForm.membership.ageGroups.totalCalculated')}:
        </span>
        <span className="membership-manager-summary-value">
          {(membershipData?.ageGroups?.['под-60'] || 0) + 
           (membershipData?.ageGroups?.['60-70'] || 0) + 
           (membershipData?.ageGroups?.['70-80'] || 0) + 
           (membershipData?.ageGroups?.['80+'] || 0)} 
          {t('clubForm.membership.ageGroups.members')}
        </span>
      </div>
      
      {/* Warning if totals don't match */}
      {membershipData?.totalMembers && 
       membershipData.totalMembers !== 
       ((membershipData?.ageGroups?.['под-60'] || 0) + 
        (membershipData?.ageGroups?.['60-70'] || 0) + 
        (membershipData?.ageGroups?.['70-80'] || 0) + 
        (membershipData?.ageGroups?.['80+'] || 0)) && (
        <div className="membership-manager-age-warning">
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>{t('clubForm.membership.ageGroups.totalMismatch')}</span>
        </div>
      )}
    </div>
  </div>
</div>
{/* Membership Requirements & Benefits */}
<div className="membership-manager-section">
  <h4 className="membership-manager-section-title">
    <FontAwesomeIcon icon={faGavel} />
    {t('clubForm.membership.requirementsBenefitsSection')}
  </h4>

  {/* Requirements */}
  <div className="membership-manager-subsection">
    <h5 className="membership-manager-subsection-title">
      <FontAwesomeIcon icon={faUserShield} />
      {t('clubForm.membership.requirements.title')}
    </h5>
    
    {/* Requirements List */}
    <div className="membership-manager-list">
      {(membershipData?.requirements || []).map((requirement, index) => (
        <div key={index} className="membership-manager-list-item">
          <div className="membership-manager-list-content">
            <span className="membership-manager-list-text">{requirement}</span>
          </div>
          <button
            type="button"
            className="membership-manager-remove-item-btn"
            onClick={() => removeRequirement(index)}
            disabled={disabled}
            title={t('clubForm.membership.actions.removeRequirement')}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}
      
      {(membershipData?.requirements || []).length === 0 && (
        <div className="membership-manager-empty-state">
          <FontAwesomeIcon icon={faInfoCircle} />
          <p>{t('clubForm.membership.requirements.empty')}</p>
        </div>
      )}
    </div>

    {/* Add Requirement */}
    <div className="membership-manager-add-item">
      <div className="membership-manager-add-item-form">
        <input
          type="text"
          className="membership-manager-form-input"
          placeholder={t('clubForm.membership.requirements.placeholder')}
          value={newRequirement}
          onChange={(e) => setNewRequirement(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
          disabled={disabled}
        />
        <button
          type="button"
          className="membership-manager-add-btn compact"
          onClick={addRequirement}
          disabled={disabled || !newRequirement.trim()}
        >
          <FontAwesomeIcon icon={faPlus} />
          {t('clubForm.membership.actions.addRequirement')}
        </button>
      </div>
    </div>
  </div>

  {/* Benefits */}
  <div className="membership-manager-subsection">
    <h5 className="membership-manager-subsection-title">
      <FontAwesomeIcon icon={faAward} />
      {t('clubForm.membership.benefits.title')}
    </h5>
    
    {/* Benefits List */}
    <div className="membership-manager-list">
      {(membershipData?.benefits || []).map((benefit, index) => (
        <div key={index} className="membership-manager-list-item">
          <div className="membership-manager-list-content">
            <span className="membership-manager-list-text">{benefit}</span>
          </div>
          <button
            type="button"
            className="membership-manager-remove-item-btn"
            onClick={() => removeBenefit(index)}
            disabled={disabled}
            title={t('clubForm.membership.actions.removeBenefit')}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}
      
      {(membershipData?.benefits || []).length === 0 && (
        <div className="membership-manager-empty-state">
          <FontAwesomeIcon icon={faInfoCircle} />
          <p>{t('clubForm.membership.benefits.empty')}</p>
        </div>
      )}
    </div>

    {/* Add Benefit */}
    <div className="membership-manager-add-item">
      <div className="membership-manager-add-item-form">
        <input
          type="text"
          className="membership-manager-form-input"
          placeholder={t('clubForm.membership.benefits.placeholder')}
          value={newBenefit}
          onChange={(e) => setNewBenefit(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
          disabled={disabled}
        />
        <button
          type="button"
          className="membership-manager-add-btn compact"
          onClick={addBenefit}
          disabled={disabled || !newBenefit.trim()}
        >
          <FontAwesomeIcon icon={faPlus} />
          {t('clubForm.membership.actions.addBenefit')}
        </button>
      </div>
    </div>
  </div>
</div>
      {/* Management Structure */}
      <div className="membership-manager-section">
        <h4 className="membership-manager-section-title">
          <FontAwesomeIcon icon={faGavel} />
          {t('clubForm.membership.managementSection')}
        </h4>

        {/* Default Roles */}
        <div className="membership-manager-roles-grid">
          {defaultRoles.map(role => {
            const currentRole = membershipData?.management?.roles?.[role.id] || {};
            
            return (
              <div key={role.id} className="membership-manager-role-card">
                <div className="membership-manager-role-header">
                  <div className="membership-manager-role-icon">
                    <FontAwesomeIcon icon={role.icon} />
                  </div>
                  <div className="membership-manager-role-info">
                    <h5>{role.name}</h5>
                    {role.isRequired && (
                      <span className="membership-manager-required-badge">
                        {t('clubForm.membership.required')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="membership-manager-role-content">
                  <p className="membership-manager-role-description">
                    {role.responsibilities}
                  </p>

                  {/* Person Name */}
                  <div className="membership-manager-form-group">
                    <label className="membership-manager-form-label">
                      {t('clubForm.membership.fields.personName')}
                    </label>
                    <input
                      type="text"
                      className="membership-manager-form-input"
                      placeholder={t('clubForm.membership.placeholders.personName')}
                      value={currentRole.personName || ''}
                      onChange={(e) => handleRoleUpdate(role.id, 'personName', e.target.value)}
                      disabled={disabled}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="membership-manager-form-group">
                    <label className="membership-manager-form-label">
                      {t('clubForm.membership.fields.contactInfo')}
                    </label>
                    <input
                      type="text"
                      className="membership-manager-form-input"
                      placeholder={t('clubForm.membership.placeholders.contactInfo')}
                      value={currentRole.contactInfo || ''}
                      onChange={(e) => handleRoleUpdate(role.id, 'contactInfo', e.target.value)}
                      disabled={disabled}
                    />
                  </div>

                  {/* Term Length */}
                  <div className="membership-manager-form-group">
                    <label className="membership-manager-form-label">
                      {t('clubForm.membership.fields.termLength')}
                    </label>
                    <select
                      className="membership-manager-form-select"
                      value={currentRole.termLength || 'yearly'}
                      onChange={(e) => handleRoleUpdate(role.id, 'termLength', e.target.value)}
                      disabled={disabled}
                    >
                      <option value="yearly">{t('clubForm.membership.terms.yearly')}</option>
                      <option value="biannual">{t('clubForm.membership.terms.biannual')}</option>
                      <option value="permanent">{t('clubForm.membership.terms.permanent')}</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Roles */}
        {Object.entries(membershipData?.management?.roles || {})
          .filter(([id, role]) => role.isCustom)
          .map(([id, role]) => (
            <div key={id} className="membership-manager-role-card custom">
              <div className="membership-manager-role-header">
                <div className="membership-manager-role-icon">
                  <FontAwesomeIcon icon={faUserTie} />
                </div>
                <div className="membership-manager-role-info">
                  <h5>{role.name}</h5>
                  <span className="membership-manager-custom-badge">
                    {t('clubForm.membership.custom')}
                  </span>
                </div>
                <button
                  type="button"
                  className="membership-manager-remove-btn"
                  onClick={() => removeCustomRole(id)}
                  disabled={disabled}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              
              <div className="membership-manager-role-content">
                <p className="membership-manager-role-description">
                  {role.responsibilities}
                </p>
                {/* Similar fields as default roles */}
              </div>
            </div>
          ))
        }

        {/* Add Custom Role */}
        <div className="membership-manager-add-role">
          <h5>{t('clubForm.membership.addCustomRole')}</h5>
          
          <div className="membership-manager-add-role-form">
            <input
              type="text"
              className="membership-manager-form-input"
              placeholder={t('clubForm.membership.placeholders.roleName')}
              value={newRole.name}
              onChange={(e) => setNewRole({...newRole, name: e.target.value})}
              disabled={disabled}
            />
            <textarea
              className="membership-manager-form-textarea"
              placeholder={t('clubForm.membership.placeholders.roleResponsibilities')}
              value={newRole.responsibilities}
              onChange={(e) => setNewRole({...newRole, responsibilities: e.target.value})}
              disabled={disabled}
              rows={2}
            />
            <button
              type="button"
              className="membership-manager-add-btn"
              onClick={addCustomRole}
              disabled={disabled || !newRole.name.trim()}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('clubForm.membership.actions.addRole')}
            </button>
          </div>
        </div>
      </div>

      {/* Membership Fees */}
      <div className="membership-manager-section">
        <h4 className="membership-manager-section-title">
          <FontAwesomeIcon icon={faEuroSign} />
          {t('clubForm.membership.feesSection')}
        </h4>

        {/* Fee List */}
        <div className="membership-manager-fees-list">
          {(membershipData?.fees?.list || []).map((fee, index) => (
            <div key={fee.id || index} className="membership-manager-fee-item">
              <div className="membership-manager-fee-content">
                <div className="membership-manager-fee-main">
                  <h6>{fee.type}</h6>
                  <div className="membership-manager-fee-amount">
                    {fee.amount} лв. / {feePeriods.find(p => p.value === fee.period)?.label}
                  </div>
                </div>
                {fee.description && (
                  <p className="membership-manager-fee-description">
                    {fee.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="membership-manager-remove-fee-btn"
                onClick={() => removeFee(index)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Fee */}
        <div className="membership-manager-add-fee">
          <h5>{t('clubForm.membership.addFee')}</h5>
          
          <div className="membership-manager-add-fee-form">
            <div className="membership-manager-fee-form-row">
              <input
                type="text"
                className="membership-manager-form-input"
                placeholder={t('clubForm.membership.placeholders.feeType')}
                value={newFee.type}
                onChange={(e) => setNewFee({...newFee, type: e.target.value})}
                disabled={disabled}
              />
              <input
                type="number"
                className="membership-manager-form-input"
                placeholder="0"
                value={newFee.amount}
                onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                disabled={disabled}
                min="0"
                step="0.01"
              />
              <select
                className="membership-manager-form-select"
                value={newFee.period}
                onChange={(e) => setNewFee({...newFee, period: e.target.value})}
                disabled={disabled}
              >
                {feePeriods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              className="membership-manager-form-textarea"
              placeholder={t('clubForm.membership.placeholders.feeDescription')}
              value={newFee.description}
              onChange={(e) => setNewFee({...newFee, description: e.target.value})}
              disabled={disabled}
              rows={2}
            />
            
            <button
              type="button"
              className="membership-manager-add-btn"
              onClick={addFee}
              disabled={disabled || !newFee.type.trim() || !newFee.amount}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('clubForm.membership.actions.addFee')}
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="membership-manager-help">
        <div className="membership-manager-help-icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="membership-manager-help-content">
          <h5>{t('clubForm.membership.help.title')}</h5>
          <p>{t('clubForm.membership.help.description')}</p>
        </div>
      </div>

    </div>
  );
};

export default MembershipManager;