import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandsHelping,
  faUsers,
  faHandshake,
  faProjectDiagram,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faCheck,
  faCalendarAlt,
  faBuilding,
  faInfoCircle,
  faUserFriends,
  faClock,
  faHeart,
  faGlobe,
  faChartLine,
  faPlay,
  faStop,
  faPause,
  faCogs
} from '@fortawesome/free-solid-svg-icons';
import './socialImpactManager.css';

const SocialImpactManager = ({ 
  socialImpactData, 
  onSocialImpactChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('volunteering');
  const [showAddVolunteeringForm, setShowAddVolunteeringForm] = useState(false);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [showAddPartnershipForm, setShowAddPartnershipForm] = useState(false);
  const [editingVolunteeringIndex, setEditingVolunteeringIndex] = useState(-1);
  const [editingProjectIndex, setEditingProjectIndex] = useState(-1);
  const [editingPartnershipIndex, setEditingPartnershipIndex] = useState(-1);
  
  const [newVolunteering, setNewVolunteering] = useState({
    project: '',
    participants: 0,
    hoursPerMonth: 0,
    coordinator: '',
    description: '',
    frequency: '',
    duration: ''
  });
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    beneficiaries: 0,
    status: 'активен',
    budget: 0
  });
  
  const [newPartnership, setNewPartnership] = useState({
    partner: '',
    type: 'социално',
    description: ''
  });

  // Tabs configuration
  const socialImpactTabs = [
    { id: 'volunteering', label: t('clubForm.socialImpact.tabs.volunteering'), icon: faHandsHelping },
    { id: 'projects', label: t('clubForm.socialImpact.tabs.projects'), icon: faProjectDiagram },
    { id: 'partnerships', label: t('clubForm.socialImpact.tabs.partnerships'), icon: faHandshake }
  ];

  // Project statuses
  const projectStatuses = [
    { value: 'активен', label: t('clubForm.socialImpact.projects.statuses.active') },
    { value: 'завършен', label: t('clubForm.socialImpact.projects.statuses.completed') },
    { value: 'планиран', label: t('clubForm.socialImpact.projects.statuses.planned') },
    { value: 'спрян', label: t('clubForm.socialImpact.projects.statuses.stopped') },
    { value: 'сезонен', label: t('clubForm.socialImpact.projects.statuses.seasonal') }
  ];

  // Partnership types
  const partnershipTypes = [
    { value: 'социално', label: t('clubForm.socialImpact.partnerships.types.social') },
    { value: 'образователно', label: t('clubForm.socialImpact.partnerships.types.educational') },
    { value: 'здравно', label: t('clubForm.socialImpact.partnerships.types.health') },
    { value: 'културно', label: t('clubForm.socialImpact.partnerships.types.cultural') },
    { value: 'спортно', label: t('clubForm.socialImpact.partnerships.types.sports') },
    { value: 'благотворително', label: t('clubForm.socialImpact.partnerships.types.charity') }
  ];

  // Add volunteering
  const addVolunteering = () => {
    if (!newVolunteering.project.trim()) return;
    
    const currentVolunteering = socialImpactData?.volunteering || [];
    const updatedVolunteering = [...currentVolunteering, { ...newVolunteering }];
    
    onSocialImpactChange({
      ...socialImpactData,
      volunteering: updatedVolunteering
    });
    
    setNewVolunteering({
      project: '',
      participants: 0,
      hoursPerMonth: 0,
      coordinator: '',
      description: '',
      frequency: '',
      duration: ''
    });
    setShowAddVolunteeringForm(false);
  };

  // Edit volunteering
  const editVolunteering = (index, updatedVolunteering) => {
    const currentVolunteering = socialImpactData?.volunteering || [];
    const updatedList = currentVolunteering.map((item, i) => 
      i === index ? updatedVolunteering : item
    );
    
    onSocialImpactChange({
      ...socialImpactData,
      volunteering: updatedList
    });
    
    setEditingVolunteeringIndex(-1);
  };

  // Remove volunteering
  const removeVolunteering = (index) => {
    const currentVolunteering = socialImpactData?.volunteering || [];
    const updatedVolunteering = currentVolunteering.filter((_, i) => i !== index);
    
    onSocialImpactChange({
      ...socialImpactData,
      volunteering: updatedVolunteering
    });
  };

  // Add project
  const addProject = () => {
    if (!newProject.name.trim()) return;
    
    const currentProjects = socialImpactData?.communityProjects || [];
    const updatedProjects = [...currentProjects, { ...newProject }];
    
    onSocialImpactChange({
      ...socialImpactData,
      communityProjects: updatedProjects
    });
    
    setNewProject({
      name: '',
      description: '',
      beneficiaries: 0,
      status: 'активен',
      budget: 0
    });
    setShowAddProjectForm(false);
  };

  // Edit project
  const editProject = (index, updatedProject) => {
    const currentProjects = socialImpactData?.communityProjects || [];
    const updatedList = currentProjects.map((item, i) => 
      i === index ? updatedProject : item
    );
    
    onSocialImpactChange({
      ...socialImpactData,
      communityProjects: updatedList
    });
    
    setEditingProjectIndex(-1);
  };

  // Remove project
  const removeProject = (index) => {
    const currentProjects = socialImpactData?.communityProjects || [];
    const updatedProjects = currentProjects.filter((_, i) => i !== index);
    
    onSocialImpactChange({
      ...socialImpactData,
      communityProjects: updatedProjects
    });
  };

  // Add partnership
  const addPartnership = () => {
    if (!newPartnership.partner.trim()) return;
    
    const currentPartnerships = socialImpactData?.partnerships || [];
    const updatedPartnerships = [...currentPartnerships, { ...newPartnership }];
    
    onSocialImpactChange({
      ...socialImpactData,
      partnerships: updatedPartnerships
    });
    
    setNewPartnership({
      partner: '',
      type: 'социално',
      description: ''
    });
    setShowAddPartnershipForm(false);
  };

  // Edit partnership
  const editPartnership = (index, updatedPartnership) => {
    const currentPartnerships = socialImpactData?.partnerships || [];
    const updatedList = currentPartnerships.map((item, i) => 
      i === index ? updatedPartnership : item
    );
    
    onSocialImpactChange({
      ...socialImpactData,
      partnerships: updatedList
    });
    
    setEditingPartnershipIndex(-1);
  };

  // Remove partnership
  const removePartnership = (index) => {
    const currentPartnerships = socialImpactData?.partnerships || [];
    const updatedPartnerships = currentPartnerships.filter((_, i) => i !== index);
    
    onSocialImpactChange({
      ...socialImpactData,
      partnerships: updatedPartnerships
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'активен': return faPlay;
      case 'завършен': return faCheck;
      case 'планиран': return faClock;
      case 'спрян': return faStop;
      case 'сезонен': return faCogs;
      default: return faInfoCircle;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'активен': return '#22c55e';
      case 'завършен': return '#3b82f6';
      case 'планиран': return '#f59e0b';
      case 'спрян': return '#ef4444';
      case 'сезонен': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  // Render volunteering section
  const renderVolunteeringSection = () => {
    const volunteering = socialImpactData?.volunteering || [];
    
    return (
      <div className="social-impact-manager-tab-content">
        <div className="social-impact-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faHandsHelping} className="social-impact-manager-section-icon" />
            {t('clubForm.socialImpact.volunteering.title')}
          </h4>
          <p>{t('clubForm.socialImpact.volunteering.description')}</p>
        </div>

        {/* Add Form */}
        {showAddVolunteeringForm && (
          <div className="social-impact-manager-add-form">
            <div className="social-impact-manager-form-header">
              <h5>{t('clubForm.socialImpact.volunteering.addNew')}</h5>
              <button 
                className="social-impact-manager-close-btn"
                onClick={() => setShowAddVolunteeringForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="social-impact-manager-close-icon" />
              </button>
            </div>

            <div className="social-impact-manager-form-grid">
              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faProjectDiagram} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.volunteering.fields.project')}
                </label>
                <input
                  type="text"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.volunteering.placeholders.project')}
                  value={newVolunteering.project}
                  onChange={(e) => setNewVolunteering({...newVolunteering, project: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faUsers} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.volunteering.fields.participants')}
                </label>
                <input
                  type="number"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.volunteering.placeholders.participants')}
                  value={newVolunteering.participants}
                  onChange={(e) => setNewVolunteering({...newVolunteering, participants: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faClock} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.volunteering.fields.hoursPerMonth')}
                </label>
                <input
                  type="number"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.volunteering.placeholders.hoursPerMonth')}
                  value={newVolunteering.hoursPerMonth}
                  onChange={(e) => setNewVolunteering({...newVolunteering, hoursPerMonth: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faUserFriends} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.volunteering.fields.coordinator')}
                </label>
                <input
                  type="text"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.volunteering.placeholders.coordinator')}
                  value={newVolunteering.coordinator}
                  onChange={(e) => setNewVolunteering({...newVolunteering, coordinator: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.volunteering.fields.frequency')}
                </label>
                <input
                  type="text"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.volunteering.placeholders.frequency')}
                  value={newVolunteering.frequency}
                  onChange={(e) => setNewVolunteering({...newVolunteering, frequency: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faClock} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.volunteering.fields.duration')}
                </label>
                <input
                  type="text"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.volunteering.placeholders.duration')}
                  value={newVolunteering.duration}
                  onChange={(e) => setNewVolunteering({...newVolunteering, duration: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="social-impact-manager-form-group social-impact-manager-full-width">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.volunteering.fields.description')}
                </label>
                <textarea
                  className="social-impact-manager-form-textarea"
                  placeholder={t('clubForm.socialImpact.volunteering.placeholders.description')}
                  value={newVolunteering.description}
                  onChange={(e) => setNewVolunteering({...newVolunteering, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="social-impact-manager-form-actions">
              <button
                type="button"
                className="social-impact-manager-btn social-impact-manager-btn-cancel"
                onClick={() => setShowAddVolunteeringForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="social-impact-manager-btn-icon" />
                {t('clubForm.socialImpact.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="social-impact-manager-btn social-impact-manager-btn-add"
                onClick={addVolunteering}
                disabled={disabled || !newVolunteering.project.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="social-impact-manager-btn-icon" />
                {t('clubForm.socialImpact.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Volunteering List */}
        {volunteering.length > 0 ? (
          <div className="social-impact-manager-volunteering-list">
            {volunteering.map((item, index) => (
              <div key={index} className="social-impact-manager-volunteering-item">
                {editingVolunteeringIndex === index ? (
                  <VolunteeringEditForm 
                    volunteering={item}
                    onSave={(updated) => editVolunteering(index, updated)}
                    onCancel={() => setEditingVolunteeringIndex(-1)}
                    disabled={disabled}
                  />
                ) : (
                  <VolunteeringDisplayCard 
                    volunteering={item}
                    onEdit={() => setEditingVolunteeringIndex(index)}
                    onDelete={() => removeVolunteering(index)}
                    disabled={disabled}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="social-impact-manager-empty-state">
            <FontAwesomeIcon icon={faHandsHelping} className="social-impact-manager-empty-icon" />
            <h4>{t('clubForm.socialImpact.volunteering.empty.title')}</h4>
            <p>{t('clubForm.socialImpact.volunteering.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddVolunteeringForm && (
          <div className="social-impact-manager-add-section">
            <button
              className="social-impact-manager-add-btn"
              onClick={() => setShowAddVolunteeringForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="social-impact-manager-add-icon" />
              {t('clubForm.socialImpact.volunteering.addNew')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Volunteering Display Card Component
  const VolunteeringDisplayCard = ({ volunteering, onEdit, onDelete, disabled }) => (
    <div className="social-impact-manager-volunteering-card">
      <div className="social-impact-manager-volunteering-icon">
        <FontAwesomeIcon icon={faHandsHelping} className="social-impact-manager-helping-icon" />
      </div>
      
      <div className="social-impact-manager-volunteering-content">
        <h5 className="social-impact-manager-volunteering-name">{volunteering.project}</h5>
        <div className="social-impact-manager-volunteering-meta">
          {volunteering.participants > 0 && (
            <span className="social-impact-manager-volunteering-participants">
              <FontAwesomeIcon icon={faUsers} className="social-impact-manager-meta-icon" />
              {volunteering.participants} {t('clubForm.socialImpact.volunteering.participants')}
            </span>
          )}
          {volunteering.hoursPerMonth > 0 && (
            <span className="social-impact-manager-volunteering-hours">
              <FontAwesomeIcon icon={faClock} className="social-impact-manager-meta-icon" />
              {volunteering.hoursPerMonth} {t('clubForm.socialImpact.volunteering.hoursPerMonth')}
            </span>
          )}
          {volunteering.coordinator && (
            <span className="social-impact-manager-volunteering-coordinator">
              <FontAwesomeIcon icon={faUserFriends} className="social-impact-manager-meta-icon" />
              {volunteering.coordinator}
            </span>
          )}
          {volunteering.frequency && (
            <span className="social-impact-manager-volunteering-frequency">
              <FontAwesomeIcon icon={faCalendarAlt} className="social-impact-manager-meta-icon" />
              {volunteering.frequency}
            </span>
          )}
        </div>
        {volunteering.description && (
          <p className="social-impact-manager-volunteering-description">{volunteering.description}</p>
        )}
      </div>

      <div className="social-impact-manager-volunteering-actions">
        <button
          className="social-impact-manager-action-btn social-impact-manager-edit-btn"
          onClick={onEdit}
          disabled={disabled}
          title={t('clubForm.socialImpact.actions.edit')}
        >
          <FontAwesomeIcon icon={faEdit} className="social-impact-manager-action-icon" />
        </button>
        
        <button
          className="social-impact-manager-action-btn social-impact-manager-delete-btn"
          onClick={onDelete}
          disabled={disabled}
          title={t('clubForm.socialImpact.actions.delete')}
        >
          <FontAwesomeIcon icon={faTrash} className="social-impact-manager-action-icon" />
        </button>
      </div>
    </div>
  );

  // Volunteering Edit Form Component
  const VolunteeringEditForm = ({ volunteering, onSave, onCancel, disabled }) => {
    const [editData, setEditData] = useState({ ...volunteering });

    return (
      <div className="social-impact-manager-edit-form">
        <div className="social-impact-manager-form-grid">
          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faProjectDiagram} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.volunteering.fields.project')}
            </label>
            <input
              type="text"
              className="social-impact-manager-form-input"
              value={editData.project}
              onChange={(e) => setEditData({...editData, project: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faUsers} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.volunteering.fields.participants')}
            </label>
            <input
              type="number"
              className="social-impact-manager-form-input"
              value={editData.participants}
              onChange={(e) => setEditData({...editData, participants: parseInt(e.target.value) || 0})}
              disabled={disabled}
              min="0"
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faClock} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.volunteering.fields.hoursPerMonth')}
            </label>
            <input
              type="number"
              className="social-impact-manager-form-input"
              value={editData.hoursPerMonth}
              onChange={(e) => setEditData({...editData, hoursPerMonth: parseInt(e.target.value) || 0})}
              disabled={disabled}
              min="0"
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faUserFriends} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.volunteering.fields.coordinator')}
            </label>
            <input
              type="text"
              className="social-impact-manager-form-input"
              value={editData.coordinator}
              onChange={(e) => setEditData({...editData, coordinator: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.volunteering.fields.frequency')}
            </label>
            <input
              type="text"
              className="social-impact-manager-form-input"
              value={editData.frequency}
              onChange={(e) => setEditData({...editData, frequency: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faClock} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.volunteering.fields.duration')}
            </label>
            <input
              type="text"
              className="social-impact-manager-form-input"
              value={editData.duration}
              onChange={(e) => setEditData({...editData, duration: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="social-impact-manager-form-group social-impact-manager-full-width">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faInfoCircle} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.volunteering.fields.description')}
            </label>
            <textarea
              className="social-impact-manager-form-textarea"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              disabled={disabled}
              rows={3}
            />
          </div>
        </div>

        <div className="social-impact-manager-form-actions">
          <button
            type="button"
            className="social-impact-manager-btn social-impact-manager-btn-cancel"
            onClick={onCancel}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} className="social-impact-manager-btn-icon" />
            {t('clubForm.socialImpact.actions.cancel')}
          </button>
          
          <button
            type="button"
            className="social-impact-manager-btn social-impact-manager-btn-save"
            onClick={() => onSave(editData)}
            disabled={disabled || !editData.project.trim()}
          >
            <FontAwesomeIcon icon={faCheck} className="social-impact-manager-btn-icon" />
            {t('clubForm.socialImpact.actions.save')}
          </button>
        </div>
      </div>
    );
  };

  // Render projects section
  const renderProjectsSection = () => {
    const projects = socialImpactData?.communityProjects || [];
    
    return (
      <div className="social-impact-manager-tab-content">
        <div className="social-impact-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faProjectDiagram} className="social-impact-manager-section-icon" />
            {t('clubForm.socialImpact.projects.title')}
          </h4>
          <p>{t('clubForm.socialImpact.projects.description')}</p>
        </div>

        {/* Add Form */}
        {showAddProjectForm && (
          <div className="social-impact-manager-add-form">
            <div className="social-impact-manager-form-header">
              <h5>{t('clubForm.socialImpact.projects.addNew')}</h5>
              <button 
                className="social-impact-manager-close-btn"
                onClick={() => setShowAddProjectForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="social-impact-manager-close-icon" />
              </button>
            </div>

            <div className="social-impact-manager-form-grid">
              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faProjectDiagram} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.projects.fields.name')}
                </label>
                <input
                  type="text"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.projects.placeholders.name')}
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faChartLine} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.projects.fields.status')}
                </label>
                <select
                  className="social-impact-manager-form-select"
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                  disabled={disabled}
                >
                  {projectStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faUsers} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.projects.fields.beneficiaries')}
                </label>
                <input
                  type="number"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.projects.placeholders.beneficiaries')}
                  value={newProject.beneficiaries}
                  onChange={(e) => setNewProject({...newProject, beneficiaries: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faGlobe} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.projects.fields.budget')}
                </label>
                <input
                  type="number"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.projects.placeholders.budget')}
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: parseFloat(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="social-impact-manager-form-group social-impact-manager-full-width">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.projects.fields.description')}
                </label>
                <textarea
                  className="social-impact-manager-form-textarea"
                  placeholder={t('clubForm.socialImpact.projects.placeholders.description')}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="social-impact-manager-form-actions">
              <button
                type="button"
                className="social-impact-manager-btn social-impact-manager-btn-cancel"
                onClick={() => setShowAddProjectForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="social-impact-manager-btn-icon" />
                {t('clubForm.socialImpact.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="social-impact-manager-btn social-impact-manager-btn-add"
                onClick={addProject}
                disabled={disabled || !newProject.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="social-impact-manager-btn-icon" />
                {t('clubForm.socialImpact.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length > 0 ? (
          <div className="social-impact-manager-projects-list">
            {projects.map((project, index) => (
              <div key={index} className="social-impact-manager-project-item">
                {editingProjectIndex === index ? (
                  <ProjectEditForm 
                    project={project}
                    onSave={(updated) => editProject(index, updated)}
                    onCancel={() => setEditingProjectIndex(-1)}
                    disabled={disabled}
                    projectStatuses={projectStatuses}
                  />
                ) : (
                  <ProjectDisplayCard 
                    project={project}
                    onEdit={() => setEditingProjectIndex(index)}
                    onDelete={() => removeProject(index)}
                    disabled={disabled}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="social-impact-manager-empty-state">
            <FontAwesomeIcon icon={faProjectDiagram} className="social-impact-manager-empty-icon" />
            <h4>{t('clubForm.socialImpact.projects.empty.title')}</h4>
            <p>{t('clubForm.socialImpact.projects.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddProjectForm && (
          <div className="social-impact-manager-add-section">
            <button
              className="social-impact-manager-add-btn"
              onClick={() => setShowAddProjectForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="social-impact-manager-add-icon" />
              {t('clubForm.socialImpact.projects.addNew')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Project Display Card Component
  const ProjectDisplayCard = ({ project, onEdit, onDelete, disabled, getStatusIcon, getStatusColor }) => (
    <div className="social-impact-manager-project-card">
      <div className="social-impact-manager-project-icon">
        <FontAwesomeIcon icon={faProjectDiagram} className="social-impact-manager-diagram-icon" />
      </div>
      
      <div className="social-impact-manager-project-content">
        <div className="social-impact-manager-project-header">
          <h5 className="social-impact-manager-project-name">{project.name}</h5>
          <span 
            className="social-impact-manager-project-status"
            style={{ color: getStatusColor(project.status) }}
          >
            <FontAwesomeIcon icon={getStatusIcon(project.status)} className="social-impact-manager-status-icon" />
            {projectStatuses.find(s => s.value === project.status)?.label || project.status}
          </span>
        </div>
        <div className="social-impact-manager-project-meta">
          {project.beneficiaries > 0 && (
            <span className="social-impact-manager-project-beneficiaries">
              <FontAwesomeIcon icon={faUsers} className="social-impact-manager-meta-icon" />
              {project.beneficiaries} {t('clubForm.socialImpact.projects.beneficiaries')}
            </span>
          )}
          {project.budget > 0 && (
            <span className="social-impact-manager-project-budget">
              <FontAwesomeIcon icon={faGlobe} className="social-impact-manager-meta-icon" />
              {project.budget.toFixed(2)} лв.
            </span>
          )}
        </div>
        {project.description && (
          <p className="social-impact-manager-project-description">{project.description}</p>
        )}
      </div>

      <div className="social-impact-manager-project-actions">
        <button
          className="social-impact-manager-action-btn social-impact-manager-edit-btn"
          onClick={onEdit}
          disabled={disabled}
          title={t('clubForm.socialImpact.actions.edit')}
        >
          <FontAwesomeIcon icon={faEdit} className="social-impact-manager-action-icon" />
        </button>
        
        <button
          className="social-impact-manager-action-btn social-impact-manager-delete-btn"
          onClick={onDelete}
          disabled={disabled}
          title={t('clubForm.socialImpact.actions.delete')}
        >
          <FontAwesomeIcon icon={faTrash} className="social-impact-manager-action-icon" />
        </button>
      </div>
    </div>
  );

  // Project Edit Form Component
  const ProjectEditForm = ({ project, onSave, onCancel, disabled, projectStatuses }) => {
    const [editData, setEditData] = useState({ ...project });

    return (
      <div className="social-impact-manager-edit-form">
        <div className="social-impact-manager-form-grid">
          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faProjectDiagram} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.projects.fields.name')}
            </label>
            <input
              type="text"
              className="social-impact-manager-form-input"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faChartLine} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.projects.fields.status')}
            </label>
            <select
              className="social-impact-manager-form-select"
              value={editData.status}
              onChange={(e) => setEditData({...editData, status: e.target.value})}
              disabled={disabled}
            >
              {projectStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faUsers} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.projects.fields.beneficiaries')}
            </label>
            <input
              type="number"
              className="social-impact-manager-form-input"
              value={editData.beneficiaries}
              onChange={(e) => setEditData({...editData, beneficiaries: parseInt(e.target.value) || 0})}
              disabled={disabled}
              min="0"
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faGlobe} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.projects.fields.budget')}
            </label>
            <input
              type="number"
              className="social-impact-manager-form-input"
              value={editData.budget}
              onChange={(e) => setEditData({...editData, budget: parseFloat(e.target.value) || 0})}
              disabled={disabled}
              min="0"
              step="0.01"
            />
          </div>

          <div className="social-impact-manager-form-group social-impact-manager-full-width">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faInfoCircle} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.projects.fields.description')}
            </label>
            <textarea
              className="social-impact-manager-form-textarea"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              disabled={disabled}
              rows={3}
            />
          </div>
        </div>

        <div className="social-impact-manager-form-actions">
          <button
            type="button"
            className="social-impact-manager-btn social-impact-manager-btn-cancel"
            onClick={onCancel}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} className="social-impact-manager-btn-icon" />
            {t('clubForm.socialImpact.actions.cancel')}
          </button>
          
          <button
            type="button"
            className="social-impact-manager-btn social-impact-manager-btn-save"
            onClick={() => onSave(editData)}
            disabled={disabled || !editData.name.trim()}
          >
            <FontAwesomeIcon icon={faCheck} className="social-impact-manager-btn-icon" />
            {t('clubForm.socialImpact.actions.save')}
          </button>
        </div>
      </div>
    );
  };

  // Render partnerships section
  const renderPartnershipsSection = () => {
    const partnerships = socialImpactData?.partnerships || [];
    
    return (
      <div className="social-impact-manager-tab-content">
        <div className="social-impact-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faHandshake} className="social-impact-manager-section-icon" />
            {t('clubForm.socialImpact.partnerships.title')}
          </h4>
          <p>{t('clubForm.socialImpact.partnerships.description')}</p>
        </div>

        {/* Add Form */}
        {showAddPartnershipForm && (
          <div className="social-impact-manager-add-form">
            <div className="social-impact-manager-form-header">
              <h5>{t('clubForm.socialImpact.partnerships.addNew')}</h5>
              <button 
                className="social-impact-manager-close-btn"
                onClick={() => setShowAddPartnershipForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="social-impact-manager-close-icon" />
              </button>
            </div>

            <div className="social-impact-manager-form-grid">
              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faBuilding} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.partnerships.fields.partner')}
                </label>
                <input
                  type="text"
                  className="social-impact-manager-form-input"
                  placeholder={t('clubForm.socialImpact.partnerships.placeholders.partner')}
                  value={newPartnership.partner}
                  onChange={(e) => setNewPartnership({...newPartnership, partner: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="social-impact-manager-form-group">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faHandshake} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.partnerships.fields.type')}
                </label>
                <select
                  className="social-impact-manager-form-select"
                  value={newPartnership.type}
                  onChange={(e) => setNewPartnership({...newPartnership, type: e.target.value})}
                  disabled={disabled}
                >
                  {partnershipTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="social-impact-manager-form-group social-impact-manager-full-width">
                <label className="social-impact-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="social-impact-manager-label-icon" />
                  {t('clubForm.socialImpact.partnerships.fields.description')}
                </label>
                <textarea
                  className="social-impact-manager-form-textarea"
                  placeholder={t('clubForm.socialImpact.partnerships.placeholders.description')}
                  value={newPartnership.description}
                  onChange={(e) => setNewPartnership({...newPartnership, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="social-impact-manager-form-actions">
              <button
                type="button"
                className="social-impact-manager-btn social-impact-manager-btn-cancel"
                onClick={() => setShowAddPartnershipForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="social-impact-manager-btn-icon" />
                {t('clubForm.socialImpact.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="social-impact-manager-btn social-impact-manager-btn-add"
                onClick={addPartnership}
                disabled={disabled || !newPartnership.partner.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="social-impact-manager-btn-icon" />
                {t('clubForm.socialImpact.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Partnerships List */}
        {partnerships.length > 0 ? (
          <div className="social-impact-manager-partnerships-list">
            {partnerships.map((partnership, index) => (
              <div key={index} className="social-impact-manager-partnership-item">
                {editingPartnershipIndex === index ? (
                  <PartnershipEditForm 
                    partnership={partnership}
                    onSave={(updated) => editPartnership(index, updated)}
                    onCancel={() => setEditingPartnershipIndex(-1)}
                    disabled={disabled}
                    partnershipTypes={partnershipTypes}
                  />
                ) : (
                  <PartnershipDisplayCard 
                    partnership={partnership}
                    onEdit={() => setEditingPartnershipIndex(index)}
                    onDelete={() => removePartnership(index)}
                    disabled={disabled}
                    partnershipTypes={partnershipTypes}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="social-impact-manager-empty-state">
            <FontAwesomeIcon icon={faHandshake} className="social-impact-manager-empty-icon" />
            <h4>{t('clubForm.socialImpact.partnerships.empty.title')}</h4>
            <p>{t('clubForm.socialImpact.partnerships.empty.description')}</p>
          </div>
        )}

        {/* Add Button */}
        {!showAddPartnershipForm && (
          <div className="social-impact-manager-add-section">
            <button
              className="social-impact-manager-add-btn"
              onClick={() => setShowAddPartnershipForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="social-impact-manager-add-icon" />
              {t('clubForm.socialImpact.partnerships.addNew')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Partnership Display Card Component
  const PartnershipDisplayCard = ({ partnership, onEdit, onDelete, disabled, partnershipTypes }) => (
    <div className="social-impact-manager-partnership-card">
      <div className="social-impact-manager-partnership-icon">
        <FontAwesomeIcon icon={faHandshake} className="social-impact-manager-handshake-icon" />
      </div>
      
      <div className="social-impact-manager-partnership-content">
        <h5 className="social-impact-manager-partnership-name">{partnership.partner}</h5>
        <div className="social-impact-manager-partnership-meta">
          <span className="social-impact-manager-partnership-type">
            {partnershipTypes.find(t => t.value === partnership.type)?.label || partnership.type}
          </span>
        </div>
        {partnership.description && (
          <p className="social-impact-manager-partnership-description">{partnership.description}</p>
        )}
      </div>

      <div className="social-impact-manager-partnership-actions">
        <button
          className="social-impact-manager-action-btn social-impact-manager-edit-btn"
          onClick={onEdit}
          disabled={disabled}
          title={t('clubForm.socialImpact.actions.edit')}
        >
          <FontAwesomeIcon icon={faEdit} className="social-impact-manager-action-icon" />
        </button>
        
        <button
          className="social-impact-manager-action-btn social-impact-manager-delete-btn"
          onClick={onDelete}
          disabled={disabled}
          title={t('clubForm.socialImpact.actions.delete')}
        >
          <FontAwesomeIcon icon={faTrash} className="social-impact-manager-action-icon" />
        </button>
      </div>
    </div>
  );

  // Partnership Edit Form Component
  const PartnershipEditForm = ({ partnership, onSave, onCancel, disabled, partnershipTypes }) => {
    const [editData, setEditData] = useState({ ...partnership });

    return (
      <div className="social-impact-manager-edit-form">
        <div className="social-impact-manager-form-grid">
          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faBuilding} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.partnerships.fields.partner')}
            </label>
            <input
              type="text"
              className="social-impact-manager-form-input"
              value={editData.partner}
              onChange={(e) => setEditData({...editData, partner: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="social-impact-manager-form-group">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faHandshake} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.partnerships.fields.type')}
            </label>
            <select
              className="social-impact-manager-form-select"
              value={editData.type}
              onChange={(e) => setEditData({...editData, type: e.target.value})}
              disabled={disabled}
            >
              {partnershipTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="social-impact-manager-form-group social-impact-manager-full-width">
            <label className="social-impact-manager-form-label">
              <FontAwesomeIcon icon={faInfoCircle} className="social-impact-manager-label-icon" />
              {t('clubForm.socialImpact.partnerships.fields.description')}
            </label>
            <textarea
              className="social-impact-manager-form-textarea"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              disabled={disabled}
              rows={3}
            />
          </div>
        </div>

        <div className="social-impact-manager-form-actions">
          <button
            type="button"
            className="social-impact-manager-btn social-impact-manager-btn-cancel"
            onClick={onCancel}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} className="social-impact-manager-btn-icon" />
            {t('clubForm.socialImpact.actions.cancel')}
          </button>
          
          <button
            type="button"
            className="social-impact-manager-btn social-impact-manager-btn-save"
            onClick={() => onSave(editData)}
            disabled={disabled || !editData.partner.trim()}
          >
            <FontAwesomeIcon icon={faCheck} className="social-impact-manager-btn-icon" />
            {t('clubForm.socialImpact.actions.save')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="social-impact-manager">
      
      {/* Header */}
      <div className="social-impact-manager-header">
        <h3 className="social-impact-manager-title">
          <FontAwesomeIcon icon={faHandsHelping} className="social-impact-manager-title-icon" />
          {t('clubForm.socialImpact.title')}
        </h3>
        <p className="social-impact-manager-subtitle">
          {t('clubForm.socialImpact.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="social-impact-manager-tabs">
        {socialImpactTabs.map(tab => (
          <button
            key={tab.id}
            className={`social-impact-manager-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={tab.icon} className="social-impact-manager-tab-icon" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="social-impact-manager-content">
        {activeTab === 'volunteering' && renderVolunteeringSection()}
        {activeTab === 'projects' && renderProjectsSection()}
        {activeTab === 'partnerships' && renderPartnershipsSection()}
      </div>

    </div>
  );
};

export default SocialImpactManager;