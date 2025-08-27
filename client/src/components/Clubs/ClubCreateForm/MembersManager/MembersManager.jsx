import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUserTie,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faSearch,
  faFilter,
  faUpload,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendarAlt,
  faCrown,
  faStar,
  faEye,
  faEyeSlash,
  faUserShield,
  faUserCheck,
  faUserPlus,
  faUserMinus,
  faImage,
  faInfoCircle,
  faSortAmountDown,
  faSortAmountUp,
  faCheckSquare,
  faSquare,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useFirebaseUpload } from '../../../hooks/useFirebaseUpload';
import './membersManager.css';

const MembersManager = ({ 
  membersData, 
  onMembersChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  const { uploadFile, uploading, uploadProgress } = useFirebaseUpload();
  
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [bulkActions, setBulkActions] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState({});
  
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    photo: { src: '', alt: '' },
    joinDate: '',
    isActive: true,
    role: 'член'
  });

  const [newBoardMember, setNewBoardMember] = useState({
    name: '',
    role: 'член',
    phone: '',
    email: '',
    address: '',
    avatar: '',
    bio: ''
  });

  const photoInputRef = useRef(null);

  // Member tabs
  const memberTabs = [
    { id: 'members', label: t('clubForm.members.tabs.members'), icon: faUsers },
    { id: 'board', label: t('clubForm.members.tabs.board'), icon: faUserTie }
  ];

  // Member roles for regular members
  const memberRoles = [
    'член',
    'активен член', 
    'почетен член',
    'младши треньор',
    'инструктор',
    'координатор'
  ];

  // Board roles
  const boardRoles = [
    'председател',
    'заместник-председател', 
    'секретар',
    'касиер',
    'културен деец',
    'треньор-координатор',
    'инструктор йога',
    'координатор проекти',
    'член'
  ];

  // Handle data changes
  const handleDataChange = (field, value) => {
    const updatedData = { ...membersData };
    
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
    
    onMembersChange(updatedData);
  };

  // Add new member
  const addMember = () => {
    if (!newMember.firstName.trim() || !newMember.lastName.trim()) return;
    
    const member = {
      ...newMember,
      id: Date.now().toString(),
      joinDate: newMember.joinDate || new Date().toISOString().split('T')[0]
    };
    
    const members = [...(membersData?.members || []), member];
    handleDataChange('members', members);
    
    setNewMember({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      photo: { src: '', alt: '' },
      joinDate: '',
      isActive: true,
      role: 'член'
    });
    setShowAddForm(false);
  };

  // Add new board member
  const addBoardMember = () => {
    if (!newBoardMember.name.trim()) return;
    
    const boardMember = {
      ...newBoardMember,
      id: Date.now().toString()
    };
    
    const board = [...(membersData?.management?.board || []), boardMember];
    handleDataChange('management.board', board);
    
    setNewBoardMember({
      name: '',
      role: 'член',
      phone: '',
      email: '',
      address: '',
      avatar: '',
      bio: ''
    });
    setShowAddForm(false);
  };

  // Remove member
  const removeMember = (id, type = 'members') => {
    if (type === 'members') {
      const members = (membersData?.members || []).filter(member => member.id !== id);
      handleDataChange('members', members);
    } else {
      const board = (membersData?.management?.board || []).filter(member => member.id !== id);
      handleDataChange('management.board', board);
    }
  };

  // Update member
  const updateMember = (id, updates, type = 'members') => {
    if (type === 'members') {
      const members = (membersData?.members || []).map(member =>
        member.id === id ? { ...member, ...updates } : member
      );
      handleDataChange('members', members);
    } else {
      const board = (membersData?.management?.board || []).map(member =>
        member.id === id ? { ...member, ...updates } : member
      );
      handleDataChange('management.board', board);
    }
  };

  // Start editing
  const startEditMember = (member) => {
    setEditingMember(member.id);
    setEditForm({ ...member });
  };

  // Save edit
  const saveEditMember = () => {
    if (activeTab === 'members') {
      updateMember(editingMember, editForm);
    } else {
      updateMember(editingMember, editForm, 'board');
    }
    setEditingMember(null);
    setEditForm({});
  };

  // Cancel edit
  const cancelEditMember = () => {
    setEditingMember(null);
    setEditForm({});
  };

  // Handle photo upload - ОБНОВЕНО ЗА FIREBASE
  const handlePhotoUpload = async (file, memberId, type = 'members') => {
    if (!file) return;
    
    setUploadingPhoto(prev => ({ ...prev, [memberId]: true }));
    
    try {
      // Upload към Firebase
      const uploadResult = await uploadFile(file, `clubs/members/photos`);
      
      if (type === 'members') {
        updateMember(memberId, { 
          photo: { 
            src: uploadResult.url, 
            alt: `${t('clubForm.members.photoAlt')} ${memberId}` 
          } 
        });
      } else {
        updateMember(memberId, { avatar: uploadResult.url }, 'board');
      }
      
    } catch (error) {
      console.error('Photo upload failed:', error);
      // Можеш да добавиш error notification тук
    } finally {
      setUploadingPhoto(prev => ({ ...prev, [memberId]: false }));
    }
  };

  // Filter and sort members
  const getFilteredMembers = () => {
    const members = activeTab === 'members' 
      ? (membersData?.members || [])
      : (membersData?.management?.board || []);
    
    // Filter by search
    let filtered = members.filter(member => {
      const searchText = searchQuery.toLowerCase();
      const name = activeTab === 'members' 
        ? `${member.firstName} ${member.lastName}`.toLowerCase()
        : member.name.toLowerCase();
      
      return name.includes(searchText) || 
             member.email?.toLowerCase().includes(searchText) ||
             member.phone?.includes(searchText);
    });
    
    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = activeTab === 'members' 
            ? `${a.firstName} ${a.lastName}` 
            : a.name;
          bValue = activeTab === 'members' 
            ? `${b.firstName} ${b.lastName}` 
            : b.name;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'joinDate':
          aValue = a.joinDate || '';
          bValue = b.joinDate || '';
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    
    return filtered;
  };

  // Toggle member selection
  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Select all members
  const selectAllMembers = () => {
    const filteredMembers = getFilteredMembers();
    setSelectedMembers(filteredMembers.map(member => member.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedMembers([]);
  };

  // Bulk delete
  const bulkDeleteMembers = () => {
    if (activeTab === 'members') {
      const members = (membersData?.members || []).filter(
        member => !selectedMembers.includes(member.id)
      );
      handleDataChange('members', members);
    } else {
      const board = (membersData?.management?.board || []).filter(
        member => !selectedMembers.includes(member.id)
      );
      handleDataChange('management.board', board);
    }
    setSelectedMembers([]);
    setBulkActions(false);
  };

  // Render member card - ОБНОВЕНО С EDIT ФОРМА
  const renderMemberCard = (member) => {
    const isSelected = selectedMembers.includes(member.id);
    const isBoard = activeTab === 'board';
    const isUploading = uploadingPhoto[member.id];
    const isEditing = editingMember === member.id;
    
    return (
      <div key={member.id} className={`members-manager-member-card ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}>
        
        {bulkActions && !isEditing && (
          <div className="members-manager-selection-checkbox">
            <button
              className="members-manager-checkbox-btn"
              onClick={() => toggleMemberSelection(member.id)}
            >
              <FontAwesomeIcon icon={isSelected ? faCheckSquare : faSquare} />
            </button>
          </div>
        )}

        <div className="members-manager-member-photo">
          {isUploading ? (
            <div className="members-manager-photo-uploading">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
          ) : (
            <>
              {(isBoard ? member.avatar : member.photo?.src) ? (
                <img 
                  src={isBoard ? member.avatar : member.photo.src} 
                  alt={isBoard ? member.name : `${member.firstName} ${member.lastName}`}
                />
              ) : (
                <div className="members-manager-photo-placeholder">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              )}
              
              {!isEditing && (
                <div className="members-manager-photo-overlay">
                  <button
                    className="members-manager-photo-upload-btn"
                    onClick={() => {
                      photoInputRef.current?.click();
                      photoInputRef.current.onchange = (e) => {
                        if (e.target.files[0]) {
                          handlePhotoUpload(e.target.files[0], member.id, activeTab);
                        }
                      };
                    }}
                    title={t('clubForm.members.actions.uploadPhoto')}
                  >
                    <FontAwesomeIcon icon={faUpload} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="members-manager-member-info">
          {isEditing ? (
            // EDIT РЕЖИМ
            <div className="members-manager-edit-form">
              {isBoard ? (
                <input
                  type="text"
                  className="members-manager-edit-input"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Име"
                />
              ) : (
                <div className="members-manager-edit-name-row">
                  <input
                    type="text"
                    className="members-manager-edit-input"
                    value={editForm.firstName || ''}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    placeholder="Име"
                  />
                  <input
                    type="text"
                    className="members-manager-edit-input"
                    value={editForm.lastName || ''}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    placeholder="Фамилия"
                  />
                </div>
              )}
              
              <select
                className="members-manager-edit-select"
                value={editForm.role || ''}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
              >
                {(isBoard ? boardRoles : memberRoles).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <input
                type="tel"
                className="members-manager-edit-input"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Телефон"
              />
              
              <input
                type="email"
                className="members-manager-edit-input"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="Email"
              />
              
              {isBoard && (
                <textarea
                  className="members-manager-edit-textarea"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Биография"
                  rows={3}
                />
              )}
              
              <div className="members-manager-edit-actions">
                <button
                  className="members-manager-edit-btn save"
                  onClick={saveEditMember}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  className="members-manager-edit-btn cancel"
                  onClick={cancelEditMember}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          ) : (
            // НОРМАЛЕН РЕЖИМ
            <>
              <h4 className="members-manager-member-name">
                {isBoard ? member.name : `${member.firstName} ${member.lastName}`}
              </h4>
              
              <div className="members-manager-member-role">
                <span className={`members-manager-role-badge ${member.role === 'председател' ? 'president' : ''}`}>
                  {member.role === 'председател' && <FontAwesomeIcon icon={faCrown} />}
                  {member.role}
                </span>
              </div>

              <div className="members-manager-member-details">
                {member.phone && (
                  <div className="members-manager-detail">
                    <FontAwesomeIcon icon={faPhone} />
                    <span>{member.phone}</span>
                  </div>
                )}
                
                {member.email && (
                  <div className="members-manager-detail">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{member.email}</span>
                  </div>
                )}
                
                {!isBoard && member.joinDate && (
                  <div className="members-manager-detail">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{new Date(member.joinDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {!isBoard && (
                  <div className="members-manager-detail">
                    <FontAwesomeIcon icon={member.isActive ? faUserCheck : faUserMinus} />
                    <span>{member.isActive ? t('clubForm.members.active') : t('clubForm.members.inactive')}</span>
                  </div>
                )}
              </div>

              {isBoard && member.bio && (
                <p className="members-manager-member-bio">{member.bio}</p>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="members-manager-member-actions">
            <button
              className="members-manager-action-btn edit"
              onClick={() => startEditMember(member)}
              title={t('clubForm.members.actions.edit')}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            
            <button
              className="members-manager-action-btn delete"
              onClick={() => removeMember(member.id, activeTab)}
              title={t('clubForm.members.actions.delete')}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render add form
  const renderAddForm = () => {
    const isBoard = activeTab === 'board';
    const currentMember = isBoard ? newBoardMember : newMember;
    const setCurrentMember = isBoard ? setNewBoardMember : setNewMember;
    const roles = isBoard ? boardRoles : memberRoles;
    
    return (
      <div className="members-manager-add-form">
        <div className="members-manager-add-form-header">
          <h4>{isBoard ? t('clubForm.members.addBoardMember') : t('clubForm.members.addMember')}</h4>
          <button 
            className="members-manager-close-form-btn"
            onClick={() => setShowAddForm(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="members-manager-form-grid">
          {/* Name fields */}
          {isBoard ? (
            <div className="members-manager-form-group full-width">
              <label className="members-manager-form-label">
                <FontAwesomeIcon icon={faUser} />
                {t('clubForm.members.fields.fullName')}
              </label>
              <input
                type="text"
                className="members-manager-form-input"
                placeholder={t('clubForm.members.placeholders.fullName')}
                value={currentMember.name}
                onChange={(e) => setCurrentMember({...currentMember, name: e.target.value})}
                disabled={disabled}
              />
            </div>
          ) : (
            <>
              <div className="members-manager-form-group">
                <label className="members-manager-form-label">
                  <FontAwesomeIcon icon={faUser} />
                  {t('clubForm.members.fields.firstName')}
                </label>
                <input
                  type="text"
                  className="members-manager-form-input"
                  placeholder={t('clubForm.members.placeholders.firstName')}
                  value={currentMember.firstName}
                  onChange={(e) => setCurrentMember({...currentMember, firstName: e.target.value})}
                  disabled={disabled}
                />
              </div>
              
              <div className="members-manager-form-group">
                <label className="members-manager-form-label">
                  <FontAwesomeIcon icon={faUser} />
                  {t('clubForm.members.fields.lastName')}
                </label>
                <input
                  type="text"
                  className="members-manager-form-input"
                  placeholder={t('clubForm.members.placeholders.lastName')}
                  value={currentMember.lastName}
                  onChange={(e) => setCurrentMember({...currentMember, lastName: e.target.value})}
                  disabled={disabled}
                />
              </div>
            </>
          )}

          {/* Role */}
          <div className="members-manager-form-group">
            <label className="members-manager-form-label">
              <FontAwesomeIcon icon={faUserShield} />
              {t('clubForm.members.fields.role')}
            </label>
            <select
              className="members-manager-form-select"
              value={currentMember.role}
              onChange={(e) => setCurrentMember({...currentMember, role: e.target.value})}
              disabled={disabled}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Contact info */}
          <div className="members-manager-form-group">
            <label className="members-manager-form-label">
              <FontAwesomeIcon icon={faPhone} />
              {t('clubForm.members.fields.phone')}
            </label>
            <input
              type="tel"
              className="members-manager-form-input"
              placeholder={t('clubForm.members.placeholders.phone')}
              value={currentMember.phone}
              onChange={(e) => setCurrentMember({...currentMember, phone: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="members-manager-form-group">
            <label className="members-manager-form-label">
              <FontAwesomeIcon icon={faEnvelope} />
              {t('clubForm.members.fields.email')}
            </label>
            <input
              type="email"
              className="members-manager-form-input"
              placeholder={t('clubForm.members.placeholders.email')}
              value={currentMember.email}
              onChange={(e) => setCurrentMember({...currentMember, email: e.target.value})}
              disabled={disabled}
            />
          </div>

          {/* Address */}
          <div className="members-manager-form-group full-width">
            <label className="members-manager-form-label">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              {t('clubForm.members.fields.address')}
            </label>
            <input
              type="text"
              className="members-manager-form-input"
              placeholder={t('clubForm.members.placeholders.address')}
              value={currentMember.address}
              onChange={(e) => setCurrentMember({...currentMember, address: e.target.value})}
              disabled={disabled}
            />
          </div>

          {/* Join date for regular members */}
          {!isBoard && (
            <div className="members-manager-form-group">
              <label className="members-manager-form-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                {t('clubForm.members.fields.joinDate')}
              </label>
              <input
                type="date"
                className="members-manager-form-input"
                value={currentMember.joinDate}
                onChange={(e) => setCurrentMember({...currentMember, joinDate: e.target.value})}
                disabled={disabled}
              />
            </div>
          )}

          {/* Bio for board members */}
          {isBoard && (
            <div className="members-manager-form-group full-width">
              <label className="members-manager-form-label">
                <FontAwesomeIcon icon={faInfoCircle} />
                {t('clubForm.members.fields.bio')}
              </label>
              <textarea
                className="members-manager-form-textarea"
                placeholder={t('clubForm.members.placeholders.bio')}
                value={currentMember.bio}
                onChange={(e) => setCurrentMember({...currentMember, bio: e.target.value})}
                disabled={disabled}
                rows={3}
              />
            </div>
          )}

          {/* Active status for regular members */}
          {!isBoard && (
            <div className="members-manager-form-group">
              <label className="members-manager-checkbox-label">
                <input
                  type="checkbox"
                  checked={currentMember.isActive}
                  onChange={(e) => setCurrentMember({...currentMember, isActive: e.target.checked})}
                  disabled={disabled}
                />
                <span className="members-manager-checkbox"></span>
                <span>{t('clubForm.members.fields.isActive')}</span>
              </label>
            </div>
          )}
        </div>

        <div className="members-manager-form-actions">
          <button
            type="button"
            className="members-manager-form-btn cancel"
            onClick={() => setShowAddForm(false)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} />
            {t('clubForm.members.actions.cancel')}
          </button>
          
          <button
            type="button"
            className="members-manager-form-btn add"
            onClick={isBoard ? addBoardMember : addMember}
            disabled={disabled || !(isBoard ? currentMember.name.trim() : currentMember.firstName.trim() && currentMember.lastName.trim())}
          >
            <FontAwesomeIcon icon={faPlus} />
            {t('clubForm.members.actions.add')}
          </button>
        </div>
      </div>
    );
  };

  const filteredMembers = getFilteredMembers();

  return (
    <div className="members-manager">
      
      {/* Header */}
      <div className="members-manager-header">
        <h3 className="members-manager-title">
          <FontAwesomeIcon icon={faUsers} />
          {t('clubForm.members.title')}
        </h3>
        <p className="members-manager-subtitle">
          {t('clubForm.members.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="members-manager-tabs">
        {memberTabs.map(tab => (
          <button
            key={tab.id}
            className={`members-manager-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setShowAddForm(false);
              setSelectedMembers([]);
              setBulkActions(false);
              setEditingMember(null);
              setEditForm({});
            }}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={tab.icon} />
            <span>{tab.label}</span>
            <span className="members-manager-tab-count">
              ({activeTab === 'members' 
                ? (membersData?.members?.length || 0)
                : (membersData?.management?.board?.length || 0)
              })
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="members-manager-controls">
        
        {/* Search and Filter */}
        <div className="members-manager-search-filters">
          <div className="members-manager-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder={t('clubForm.members.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="members-manager-filters">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              disabled={disabled}
            >
              <option value="all">{t('clubForm.members.filter.allRoles')}</option>
              {(activeTab === 'board' ? boardRoles : memberRoles).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={disabled}
            >
              <option value="name">{t('clubForm.members.sort.name')}</option>
              <option value="role">{t('clubForm.members.sort.role')}</option>
              {activeTab === 'members' && <option value="joinDate">{t('clubForm.members.sort.joinDate')}</option>}
            </select>
            
            <button
              className="members-manager-sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={t(`clubForm.members.sort.${sortOrder === 'asc' ? 'descending' : 'ascending'}`)}
            >
              <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortAmountUp : faSortAmountDown} />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="members-manager-actions">
          <button
            className="members-manager-action-btn add-new"
            onClick={() => setShowAddForm(true)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            {activeTab === 'board' ? t('clubForm.members.addBoardMember') : t('clubForm.members.addMember')}
          </button>
          
          {filteredMembers.length > 0 && (
            <button
              className="members-manager-action-btn bulk"
              onClick={() => setBulkActions(!bulkActions)}
            >
              <FontAwesomeIcon icon={faCheckSquare} />
              {t('clubForm.members.bulkActions')}
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkActions && (
        <div className="members-manager-bulk-bar">
          <div className="members-manager-bulk-info">
            {selectedMembers.length > 0 
              ? t('clubForm.members.selected', { count: selectedMembers.length })
              : t('clubForm.members.selectMembers')
            }
          </div>
          
          <div className="members-manager-bulk-actions">
            <button 
              className="members-manager-bulk-btn"
              onClick={selectAllMembers}
            >
              {t('clubForm.members.selectAll')}
            </button>
            
            <button 
              className="members-manager-bulk-btn"
              onClick={clearSelection}
            >
              {t('clubForm.members.clearSelection')}
            </button>
            
            <button 
              className="members-manager-bulk-btn delete"
              onClick={bulkDeleteMembers}
              disabled={selectedMembers.length === 0}
            >
              <FontAwesomeIcon icon={faTrash} />
              {t('clubForm.members.deleteSelected')}
            </button>
            
            <button 
              className="members-manager-bulk-btn"
              onClick={() => {
                setBulkActions(false);
                clearSelection();
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && renderAddForm()}

      {/* Members Grid */}
      <div className="members-manager-content">
        {filteredMembers.length > 0 ? (
          <div className="members-manager-grid">
            {filteredMembers.map(member => renderMemberCard(member))}
          </div>
        ) : (
          <div className="members-manager-empty">
            <FontAwesomeIcon icon={faUsers} />
            <h4>{t('clubForm.members.empty.title')}</h4>
            <p>{t('clubForm.members.empty.description')}</p>
            <button
              className="members-manager-empty-add-btn"
              onClick={() => setShowAddForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              {activeTab === 'board' ? t('clubForm.members.addFirstBoardMember') : t('clubForm.members.addFirstMember')}
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Help Section */}
      <div className="members-manager-help">
        <div className="members-manager-help-icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="members-manager-help-content">
          <h5>{t('clubForm.members.help.title')}</h5>
          <p>{t('clubForm.members.help.description')}</p>
          <ul>
            <li>{t('clubForm.members.help.tip1')}</li>
            <li>{t('clubForm.members.help.tip2')}</li>
            <li>{t('clubForm.members.help.tip3')}</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default MembersManager;