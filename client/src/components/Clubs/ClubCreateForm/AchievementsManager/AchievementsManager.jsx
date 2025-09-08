import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faAward,
  faCertificate,
  faStar,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faCheck,
  faCalendarAlt,
  faBuilding,
  faInfoCircle,
  faGem 
} from '@fortawesome/free-solid-svg-icons';
import './achievementsManager.css';

const AchievementsManager = ({ 
  achievementsData, 
  onAchievementsChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('awards');
  const [showAddAwardForm, setShowAddAwardForm] = useState(false);
  const [showAddCertificateForm, setShowAddCertificateForm] = useState(false);
  const [showAddRecognitionForm, setShowAddRecognitionForm] = useState(false);
  const [editingAwardIndex, setEditingAwardIndex] = useState(-1);
  const [editingCertificateIndex, setEditingCertificateIndex] = useState(-1);
  const [editingRecognitionIndex, setEditingRecognitionIndex] = useState(-1);
  
  const [newAward, setNewAward] = useState({
    name: '',
    year: new Date().getFullYear(),
    awardedBy: '',
    description: ''
  });
  
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issueDate: '',
    validUntil: '',
    issuedBy: ''
  });
  
  const [newRecognition, setNewRecognition] = useState('');

  // Tabs configuration
  const achievementTabs = [
    { id: 'awards', label: t('clubForm.achievements.tabs.awards'), icon: faTrophy },
    { id: 'certificates', label: t('clubForm.achievements.tabs.certificates'), icon: faCertificate },
    { id: 'recognitions', label: t('clubForm.achievements.tabs.recognitions'), icon: faStar }
  ];

  // Add award
  const addAward = () => {
    if (!newAward.name.trim()) return;
    
    const currentAwards = achievementsData?.awards || [];
    const updatedAwards = [...currentAwards, { ...newAward }];
    
    onAchievementsChange({
      ...achievementsData,
      awards: updatedAwards
    });
    
    setNewAward({
      name: '',
      year: new Date().getFullYear(),
      awardedBy: '',
      description: ''
    });
    setShowAddAwardForm(false);
  };

  // Edit award
  const editAward = (index, updatedAward) => {
    const currentAwards = achievementsData?.awards || [];
    const updatedAwards = currentAwards.map((award, i) => 
      i === index ? updatedAward : award
    );
    
    onAchievementsChange({
      ...achievementsData,
      awards: updatedAwards
    });
    
    setEditingAwardIndex(-1);
  };

  // Remove award
  const removeAward = (index) => {
    const currentAwards = achievementsData?.awards || [];
    const updatedAwards = currentAwards.filter((_, i) => i !== index);
    
    onAchievementsChange({
      ...achievementsData,
      awards: updatedAwards
    });
  };

  // Add certificate
  const addCertificate = () => {
    if (!newCertificate.name.trim()) return;
    
    const currentCertificates = achievementsData?.certificates || [];
    const updatedCertificates = [...currentCertificates, { ...newCertificate }];
    
    onAchievementsChange({
      ...achievementsData,
      certificates: updatedCertificates
    });
    
    setNewCertificate({
      name: '',
      issueDate: '',
      validUntil: '',
      issuedBy: ''
    });
    setShowAddCertificateForm(false);
  };

  // Edit certificate
  const editCertificate = (index, updatedCertificate) => {
    const currentCertificates = achievementsData?.certificates || [];
    const updatedCertificates = currentCertificates.map((cert, i) => 
      i === index ? updatedCertificate : cert
    );
    
    onAchievementsChange({
      ...achievementsData,
      certificates: updatedCertificates
    });
    
    setEditingCertificateIndex(-1);
  };

  // Remove certificate
  const removeCertificate = (index) => {
    const currentCertificates = achievementsData?.certificates || [];
    const updatedCertificates = currentCertificates.filter((_, i) => i !== index);
    
    onAchievementsChange({
      ...achievementsData,
      certificates: updatedCertificates
    });
  };

  // Add recognition
  const addRecognition = () => {
    if (!newRecognition.trim()) return;
    
    const currentRecognitions = achievementsData?.recognitions || [];
    const updatedRecognitions = [...currentRecognitions, newRecognition.trim()];
    
    onAchievementsChange({
      ...achievementsData,
      recognitions: updatedRecognitions
    });
    
    setNewRecognition('');
    setShowAddRecognitionForm(false);
  };

  // Edit recognition
  const editRecognition = (index, value) => {
    const currentRecognitions = achievementsData?.recognitions || [];
    const updatedRecognitions = currentRecognitions.map((recog, i) => 
      i === index ? value : recog
    );
    
    onAchievementsChange({
      ...achievementsData,
      recognitions: updatedRecognitions
    });
    
    setEditingRecognitionIndex(-1);
  };

  // Remove recognition
  const removeRecognition = (index) => {
    const currentRecognitions = achievementsData?.recognitions || [];
    const updatedRecognitions = currentRecognitions.filter((_, i) => i !== index);
    
    onAchievementsChange({
      ...achievementsData,
      recognitions: updatedRecognitions
    });
  };

  // Render awards section
  const renderAwardsSection = () => {
    const awards = achievementsData?.awards || [];
    
    return (
      <div className="achievements-manager-tab-content">
        <div className="achievements-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faTrophy} className="achievements-manager-section-icon" />
            {t('clubForm.achievements.awards.title')}
          </h4>
          <p>{t('clubForm.achievements.awards.description')}</p>
        </div>

        {/* Add Form */}
        {showAddAwardForm && (
          <div className="achievements-manager-add-form">
            <div className="achievements-manager-form-header">
              <h5>{t('clubForm.achievements.awards.addNew')}</h5>
              <button 
                className="achievements-manager-close-btn"
                onClick={() => setShowAddAwardForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="achievements-manager-close-icon" />
              </button>
            </div>

            <div className="achievements-manager-form-grid">
              <div className="achievements-manager-form-group">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faAward} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.awards.fields.name')}
                </label>
                <input
                  type="text"
                  className="achievements-manager-form-input"
                  placeholder={t('clubForm.achievements.awards.placeholders.name')}
                  value={newAward.name}
                  onChange={(e) => setNewAward({...newAward, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="achievements-manager-form-group">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.awards.fields.year')}
                </label>
                <input
                  type="number"
                  className="achievements-manager-form-input"
                  placeholder={t('clubForm.achievements.awards.placeholders.year')}
                  value={newAward.year}
                  onChange={(e) => setNewAward({...newAward, year: parseInt(e.target.value) || new Date().getFullYear()})}
                  disabled={disabled}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="achievements-manager-form-group">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faBuilding} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.awards.fields.awardedBy')}
                </label>
                <input
                  type="text"
                  className="achievements-manager-form-input"
                  placeholder={t('clubForm.achievements.awards.placeholders.awardedBy')}
                  value={newAward.awardedBy}
                  onChange={(e) => setNewAward({...newAward, awardedBy: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="achievements-manager-form-group achievements-manager-full-width">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.awards.fields.description')}
                </label>
                <textarea
                  className="achievements-manager-form-textarea"
                  placeholder={t('clubForm.achievements.awards.placeholders.description')}
                  value={newAward.description}
                  onChange={(e) => setNewAward({...newAward, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="achievements-manager-form-actions">
              <button
                type="button"
                className="achievements-manager-btn achievements-manager-btn-cancel"
                onClick={() => setShowAddAwardForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="achievements-manager-btn-icon" />
                {t('clubForm.achievements.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="achievements-manager-btn achievements-manager-btn-add"
                onClick={addAward}
                disabled={disabled || !newAward.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="achievements-manager-btn-icon" />
                {t('clubForm.achievements.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Awards List */}
        {awards.length > 0 ? (
          <div className="achievements-manager-awards-list">
            {awards.map((award, index) => (
              <div key={index} className="achievements-manager-award-item">
                {editingAwardIndex === index ? (
                  <AwardEditForm 
                    award={award}
                    onSave={(updatedAward) => editAward(index, updatedAward)}
                    onCancel={() => setEditingAwardIndex(-1)}
                    disabled={disabled}
                  />
                ) : (
                  <AwardDisplayCard 
                    award={award}
                    onEdit={() => setEditingAwardIndex(index)}
                    onDelete={() => removeAward(index)}
                    disabled={disabled}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="achievements-manager-empty-state">
            <FontAwesomeIcon icon={faTrophy} className="achievements-manager-empty-icon" />
            <h4>{t('clubForm.achievements.awards.empty.title')}</h4>
            <p>{t('clubForm.achievements.awards.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddAwardForm && (
          <div className="achievements-manager-add-section">
            <button
              className="achievements-manager-add-btn"
              onClick={() => setShowAddAwardForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="achievements-manager-add-icon" />
              {t('clubForm.achievements.awards.addNew')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Award Display Card Component
  const AwardDisplayCard = ({ award, onEdit, onDelete, disabled }) => (
    <div className="achievements-manager-award-card">
      <div className="achievements-manager-award-icon">
        <FontAwesomeIcon icon={faTrophy} className="achievements-manager-trophy-icon" />
      </div>
      
      <div className="achievements-manager-award-content">
        <h5 className="achievements-manager-award-name">{award.name}</h5>
        <div className="achievements-manager-award-meta">
          <span className="achievements-manager-award-year">{award.year}</span>
          {award.awardedBy && (
            <span className="achievements-manager-award-by">
              {t('clubForm.achievements.awards.by')} {award.awardedBy}
            </span>
          )}
        </div>
        {award.description && (
          <p className="achievements-manager-award-description">{award.description}</p>
        )}
      </div>

      <div className="achievements-manager-award-actions">
        <button
          className="achievements-manager-action-btn achievements-manager-edit-btn"
          onClick={onEdit}
          disabled={disabled}
          title={t('clubForm.achievements.actions.edit')}
        >
          <FontAwesomeIcon icon={faEdit} className="achievements-manager-action-icon" />
        </button>
        
        <button
          className="achievements-manager-action-btn achievements-manager-delete-btn"
          onClick={onDelete}
          disabled={disabled}
          title={t('clubForm.achievements.actions.delete')}
        >
          <FontAwesomeIcon icon={faTrash} className="achievements-manager-action-icon" />
        </button>
      </div>
    </div>
  );

  // Award Edit Form Component
  const AwardEditForm = ({ award, onSave, onCancel, disabled }) => {
    const [editData, setEditData] = useState({ ...award });

    return (
      <div className="achievements-manager-edit-form">
        <div className="achievements-manager-form-grid">
          <div className="achievements-manager-form-group">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faAward} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.awards.fields.name')}
            </label>
            <input
              type="text"
              className="achievements-manager-form-input"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="achievements-manager-form-group">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.awards.fields.year')}
            </label>
            <input
              type="number"
              className="achievements-manager-form-input"
              value={editData.year}
              onChange={(e) => setEditData({...editData, year: parseInt(e.target.value) || new Date().getFullYear()})}
              disabled={disabled}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="achievements-manager-form-group">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faBuilding} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.awards.fields.awardedBy')}
            </label>
            <input
              type="text"
              className="achievements-manager-form-input"
              value={editData.awardedBy}
              onChange={(e) => setEditData({...editData, awardedBy: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="achievements-manager-form-group achievements-manager-full-width">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faInfoCircle} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.awards.fields.description')}
            </label>
            <textarea
              className="achievements-manager-form-textarea"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              disabled={disabled}
              rows={3}
            />
          </div>
        </div>

        <div className="achievements-manager-form-actions">
          <button
            type="button"
            className="achievements-manager-btn achievements-manager-btn-cancel"
            onClick={onCancel}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} className="achievements-manager-btn-icon" />
            {t('clubForm.achievements.actions.cancel')}
          </button>
          
          <button
            type="button"
            className="achievements-manager-btn achievements-manager-btn-save"
            onClick={() => onSave(editData)}
            disabled={disabled || !editData.name.trim()}
          >
            <FontAwesomeIcon icon={faCheck} className="achievements-manager-btn-icon" />
            {t('clubForm.achievements.actions.save')}
          </button>
        </div>
      </div>
    );
  };

  // Render certificates section
  const renderCertificatesSection = () => {
    const certificates = achievementsData?.certificates || [];
    
    return (
      <div className="achievements-manager-tab-content">
        <div className="achievements-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faCertificate} className="achievements-manager-section-icon" />
            {t('clubForm.achievements.certificates.title')}
          </h4>
          <p>{t('clubForm.achievements.certificates.description')}</p>
        </div>

        {/* Add Form */}
        {showAddCertificateForm && (
          <div className="achievements-manager-add-form">
            <div className="achievements-manager-form-header">
              <h5>{t('clubForm.achievements.certificates.addNew')}</h5>
              <button 
                className="achievements-manager-close-btn"
                onClick={() => setShowAddCertificateForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="achievements-manager-close-icon" />
              </button>
            </div>

            <div className="achievements-manager-form-grid">
              <div className="achievements-manager-form-group">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faCertificate} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.certificates.fields.name')}
                </label>
                <input
                  type="text"
                  className="achievements-manager-form-input"
                  placeholder={t('clubForm.achievements.certificates.placeholders.name')}
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="achievements-manager-form-group">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.certificates.fields.issueDate')}
                </label>
                <input
                  type="date"
                  className="achievements-manager-form-input"
                  value={newCertificate.issueDate}
                  onChange={(e) => setNewCertificate({...newCertificate, issueDate: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="achievements-manager-form-group">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.certificates.fields.validUntil')}
                </label>
                <input
                  type="date"
                  className="achievements-manager-form-input"
                  value={newCertificate.validUntil}
                  onChange={(e) => setNewCertificate({...newCertificate, validUntil: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="achievements-manager-form-group">
                <label className="achievements-manager-form-label">
                  <FontAwesomeIcon icon={faBuilding} className="achievements-manager-label-icon" />
                  {t('clubForm.achievements.certificates.fields.issuedBy')}
                </label>
                <input
                  type="text"
                  className="achievements-manager-form-input"
                  placeholder={t('clubForm.achievements.certificates.placeholders.issuedBy')}
                  value={newCertificate.issuedBy}
                  onChange={(e) => setNewCertificate({...newCertificate, issuedBy: e.target.value})}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="achievements-manager-form-actions">
              <button
                type="button"
                className="achievements-manager-btn achievements-manager-btn-cancel"
                onClick={() => setShowAddCertificateForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="achievements-manager-btn-icon" />
                {t('clubForm.achievements.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="achievements-manager-btn achievements-manager-btn-add"
                onClick={addCertificate}
                disabled={disabled || !newCertificate.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="achievements-manager-btn-icon" />
                {t('clubForm.achievements.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Certificates List */}
        {certificates.length > 0 ? (
          <div className="achievements-manager-certificates-list">
            {certificates.map((certificate, index) => (
              <div key={index} className="achievements-manager-certificate-item">
                {editingCertificateIndex === index ? (
                  <CertificateEditForm 
                    certificate={certificate}
                    onSave={(updatedCertificate) => editCertificate(index, updatedCertificate)}
                    onCancel={() => setEditingCertificateIndex(-1)}
                    disabled={disabled}
                  />
                ) : (
                  <CertificateDisplayCard 
                    certificate={certificate}
                    onEdit={() => setEditingCertificateIndex(index)}
                    onDelete={() => removeCertificate(index)}
                    disabled={disabled}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="achievements-manager-empty-state">
            <FontAwesomeIcon icon={faCertificate} className="achievements-manager-empty-icon" />
            <h4>{t('clubForm.achievements.certificates.empty.title')}</h4>
            <p>{t('clubForm.achievements.certificates.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddCertificateForm && (
          <div className="achievements-manager-add-section">
            <button
              className="achievements-manager-add-btn"
              onClick={() => setShowAddCertificateForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="achievements-manager-add-icon" />
              {t('clubForm.achievements.certificates.addNew')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Certificate Display Card Component
  const CertificateDisplayCard = ({ certificate, onEdit, onDelete, disabled }) => (
    <div className="achievements-manager-certificate-card">
      <div className="achievements-manager-certificate-icon">
        <FontAwesomeIcon icon={faCertificate} className="achievements-manager-cert-icon" />
      </div>
      
      <div className="achievements-manager-certificate-content">
        <h5 className="achievements-manager-certificate-name">{certificate.name}</h5>
        <div className="achievements-manager-certificate-meta">
          {certificate.issueDate && (
            <span className="achievements-manager-certificate-date">
              {t('clubForm.achievements.certificates.issued')}: {new Date(certificate.issueDate).toLocaleDateString()}
            </span>
          )}
          {certificate.validUntil && (
            <span className="achievements-manager-certificate-valid">
              {t('clubForm.achievements.certificates.validUntil')}: {new Date(certificate.validUntil).toLocaleDateString()}
            </span>
          )}
          {certificate.issuedBy && (
            <span className="achievements-manager-certificate-by">
              {t('clubForm.achievements.certificates.by')} {certificate.issuedBy}
            </span>
          )}
        </div>
      </div>

      <div className="achievements-manager-certificate-actions">
        <button
          className="achievements-manager-action-btn achievements-manager-edit-btn"
          onClick={onEdit}
          disabled={disabled}
          title={t('clubForm.achievements.actions.edit')}
        >
          <FontAwesomeIcon icon={faEdit} className="achievements-manager-action-icon" />
        </button>
        
        <button
          className="achievements-manager-action-btn achievements-manager-delete-btn"
          onClick={onDelete}
          disabled={disabled}
          title={t('clubForm.achievements.actions.delete')}
        >
          <FontAwesomeIcon icon={faTrash} className="achievements-manager-action-icon" />
        </button>
      </div>
    </div>
  );

  // Certificate Edit Form Component
  const CertificateEditForm = ({ certificate, onSave, onCancel, disabled }) => {
    const [editData, setEditData] = useState({ ...certificate });

    return (
      <div className="achievements-manager-edit-form">
        <div className="achievements-manager-form-grid">
          <div className="achievements-manager-form-group">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faCertificate} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.certificates.fields.name')}
            </label>
            <input
              type="text"
              className="achievements-manager-form-input"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="achievements-manager-form-group">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.certificates.fields.issueDate')}
            </label>
            <input
              type="date"
              className="achievements-manager-form-input"
              value={editData.issueDate}
              onChange={(e) => setEditData({...editData, issueDate: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="achievements-manager-form-group">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.certificates.fields.validUntil')}
            </label>
            <input
              type="date"
              className="achievements-manager-form-input"
              value={editData.validUntil}
              onChange={(e) => setEditData({...editData, validUntil: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="achievements-manager-form-group">
            <label className="achievements-manager-form-label">
              <FontAwesomeIcon icon={faBuilding} className="achievements-manager-label-icon" />
              {t('clubForm.achievements.certificates.fields.issuedBy')}
            </label>
            <input
              type="text"
              className="achievements-manager-form-input"
              value={editData.issuedBy}
              onChange={(e) => setEditData({...editData, issuedBy: e.target.value})}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="achievements-manager-form-actions">
          <button
            type="button"
            className="achievements-manager-btn achievements-manager-btn-cancel"
            onClick={onCancel}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} className="achievements-manager-btn-icon" />
            {t('clubForm.achievements.actions.cancel')}
          </button>
          
          <button
            type="button"
            className="achievements-manager-btn achievements-manager-btn-save"
            onClick={() => onSave(editData)}
            disabled={disabled || !editData.name.trim()}
          >
            <FontAwesomeIcon icon={faCheck} className="achievements-manager-btn-icon" />
            {t('clubForm.achievements.actions.save')}
          </button>
        </div>
      </div>
    );
  };

  // Render recognitions section
  const renderRecognitionsSection = () => {
    const recognitions = achievementsData?.recognitions || [];
    
    return (
      <div className="achievements-manager-tab-content">
        <div className="achievements-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faStar} className="achievements-manager-section-icon" />
            {t('clubForm.achievements.recognitions.title')}
          </h4>
          <p>{t('clubForm.achievements.recognitions.description')}</p>
        </div>

        {/* Add Form */}
        {showAddRecognitionForm && (
          <div className="achievements-manager-add-form">
            <div className="achievements-manager-form-header">
              <h5>{t('clubForm.achievements.recognitions.addNew')}</h5>
              <button 
                className="achievements-manager-close-btn"
                onClick={() => setShowAddRecognitionForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="achievements-manager-close-icon" />
              </button>
            </div>

            <div className="achievements-manager-form-group achievements-manager-full-width">
              <label className="achievements-manager-form-label">
                <FontAwesomeIcon icon={faGem } className="achievements-manager-label-icon" />
                {t('clubForm.achievements.recognitions.fields.recognition')}
              </label>
              <textarea
                className="achievements-manager-form-textarea"
                placeholder={t('clubForm.achievements.recognitions.placeholders.recognition')}
                value={newRecognition}
                onChange={(e) => setNewRecognition(e.target.value)}
                disabled={disabled}
                rows={3}
              />
            </div>

            <div className="achievements-manager-form-actions">
              <button
                type="button"
                className="achievements-manager-btn achievements-manager-btn-cancel"
                onClick={() => setShowAddRecognitionForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="achievements-manager-btn-icon" />
                {t('clubForm.achievements.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="achievements-manager-btn achievements-manager-btn-add"
                onClick={addRecognition}
                disabled={disabled || !newRecognition.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="achievements-manager-btn-icon" />
                {t('clubForm.achievements.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Recognitions List */}
        {recognitions.length > 0 ? (
          <div className="achievements-manager-recognitions-list">
            {recognitions.map((recognition, index) => (
              <div key={index} className="achievements-manager-recognition-item">
                {editingRecognitionIndex === index ? (
                  <div className="achievements-manager-recognition-edit">
                    <textarea
                      className="achievements-manager-form-textarea"
                      value={recognition}
                      onChange={(e) => editRecognition(index, e.target.value)}
                      disabled={disabled}
                      rows={3}
                      onBlur={() => setEditingRecognitionIndex(-1)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setEditingRecognitionIndex(-1);
                        }
                        if (e.key === 'Escape') {
                          setEditingRecognitionIndex(-1);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="achievements-manager-recognition-card">
                    <div className="achievements-manager-recognition-icon">
                      <FontAwesomeIcon icon={faStar} className="achievements-manager-star-icon" />
                    </div>
                    
                    <div className="achievements-manager-recognition-content">
                      <p>{recognition}</p>
                    </div>

                    <div className="achievements-manager-recognition-actions">
                      <button
                        className="achievements-manager-action-btn achievements-manager-edit-btn"
                        onClick={() => setEditingRecognitionIndex(index)}
                        disabled={disabled}
                        title={t('clubForm.achievements.actions.edit')}
                      >
                        <FontAwesomeIcon icon={faEdit} className="achievements-manager-action-icon" />
                      </button>
                      
                      <button
                        className="achievements-manager-action-btn achievements-manager-delete-btn"
                        onClick={() => removeRecognition(index)}
                        disabled={disabled}
                        title={t('clubForm.achievements.actions.delete')}
                      >
                        <FontAwesomeIcon icon={faTrash} className="achievements-manager-action-icon" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="achievements-manager-empty-state">
            <FontAwesomeIcon icon={faStar} className="achievements-manager-empty-icon" />
            <h4>{t('clubForm.achievements.recognitions.empty.title')}</h4>
            <p>{t('clubForm.achievements.recognitions.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddRecognitionForm && (
          <div className="achievements-manager-add-section">
            <button
              className="achievements-manager-add-btn"
              onClick={() => setShowAddRecognitionForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="achievements-manager-add-icon" />
              {t('clubForm.achievements.recognitions.addNew')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="achievements-manager">
      
      {/* Header */}
      <div className="achievements-manager-header">
        <h3 className="achievements-manager-title">
          <FontAwesomeIcon icon={faTrophy} className="achievements-manager-title-icon" />
          {t('clubForm.achievements.title')}
        </h3>
        <p className="achievements-manager-subtitle">
          {t('clubForm.achievements.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="achievements-manager-tabs">
        {achievementTabs.map(tab => (
          <button
            key={tab.id}
            className={`achievements-manager-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={tab.icon} className="achievements-manager-tab-icon" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="achievements-manager-content">
        {activeTab === 'awards' && renderAwardsSection()}
        {activeTab === 'certificates' && renderCertificatesSection()}
        {activeTab === 'recognitions' && renderRecognitionsSection()}
      </div>

    </div>
  );
};

export default AchievementsManager;