// src/components/AdminForumDashboard/AdminForumSpaces/AdminForumSpaces.jsx
// Prefix: afsp-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  Users,
  Archive,
  RefreshCw,
  Boxes,
} from 'lucide-react';
import './adminForumSpaces.css';

const AdminForumSpaces = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();

  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#8b2040', icon: '' });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [moderatorModal, setModeratorModal] = useState(null);
  const [moderatorEmail, setModeratorEmail] = useState('');

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await forumService.adminGetSpaces();
      setSpaces(data.spaces || data || []);
    } catch {
      toast.error(t('forum.spaces.loadError', 'Error loading spaces'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const openCreateForm = () => {
    setEditingSpace(null);
    setFormData({ name: '', description: '', color: '#8b2040', icon: '' });
    setShowForm(true);
  };

  const openEditForm = (space) => {
    setEditingSpace(space);
    setFormData({
      name: space.name || '',
      description: space.description || '',
      color: space.color || '#8b2040',
      icon: space.icon || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      if (editingSpace) {
        await forumService.adminUpdateSpace(editingSpace.id, formData);
        toast.success(t('forum.spaces.updated', 'Space updated'));
      } else {
        await forumService.adminCreateSpace(formData);
        toast.success(t('forum.spaces.created', 'Space created'));
      }
      setShowForm(false);
      setEditingSpace(null);
      fetchSpaces();
    } catch {
      toast.error(t('forum.spaces.saveError', 'Error saving space'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('forum.spaces.confirmDelete', 'Delete this space?'))) return;
    try {
      setActionLoading(id);
      await forumService.adminDeleteSpace(id);
      toast.success(t('forum.spaces.deleted', 'Space deleted'));
      fetchSpaces();
    } catch {
      toast.error(t('forum.spaces.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await forumService.adminApproveSpace(id);
      toast.success(t('forum.spaces.approved', 'Space approved'));
      fetchSpaces();
    } catch {
      toast.error(t('forum.spaces.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetModerator = async () => {
    if (!moderatorEmail.trim() || !moderatorModal) return;
    try {
      await forumService.adminSetModerator(moderatorModal, { email: moderatorEmail });
      toast.success(t('forum.spaces.moderatorSet', 'Moderator assigned'));
      setModeratorModal(null);
      setModeratorEmail('');
      fetchSpaces();
    } catch {
      toast.error(t('forum.spaces.actionError', 'Action failed'));
    }
  };

  return (
    <div className="afsp-container">
      <div className="afsp-header">
        <button className="afsp-create-btn" onClick={openCreateForm}>
          <Plus size={16} />
          {t('forum.spaces.create', 'Create Space')}
        </button>
        <button className="afsp-refresh-btn" onClick={fetchSpaces}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="afsp-form-overlay">
          <form className="afsp-form" onSubmit={handleSubmit}>
            <h3 className="afsp-form-title">
              {editingSpace
                ? t('forum.spaces.editTitle', 'Edit Space')
                : t('forum.spaces.createTitle', 'Create Space')}
            </h3>
            <div className="afsp-field">
              <label className="afsp-label">{t('forum.spaces.name', 'Name')}</label>
              <input
                type="text"
                className="afsp-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="afsp-field">
              <label className="afsp-label">{t('forum.spaces.description', 'Description')}</label>
              <textarea
                className="afsp-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="afsp-field-row">
              <div className="afsp-field">
                <label className="afsp-label">{t('forum.spaces.color', 'Color')}</label>
                <input
                  type="color"
                  className="afsp-color-input"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="afsp-field">
                <label className="afsp-label">{t('forum.spaces.icon', 'Icon (emoji)')}</label>
                <input
                  type="text"
                  className="afsp-input afsp-input-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="afsp-form-actions">
              <button type="button" className="afsp-cancel-btn" onClick={() => setShowForm(false)}>
                {t('forum.spaces.cancel', 'Cancel')}
              </button>
              <button type="submit" className="afsp-save-btn" disabled={saving}>
                {saving
                  ? t('forum.spaces.saving', 'Saving...')
                  : t('forum.spaces.save', 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Moderator modal */}
      {moderatorModal && (
        <div className="afsp-form-overlay">
          <div className="afsp-form afsp-moderator-form">
            <h3 className="afsp-form-title">{t('forum.spaces.assignModerator', 'Assign Moderator')}</h3>
            <div className="afsp-field">
              <label className="afsp-label">{t('forum.spaces.moderatorEmail', 'User email')}</label>
              <input
                type="email"
                className="afsp-input"
                value={moderatorEmail}
                onChange={(e) => setModeratorEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="afsp-form-actions">
              <button
                type="button"
                className="afsp-cancel-btn"
                onClick={() => { setModeratorModal(null); setModeratorEmail(''); }}
              >
                {t('forum.spaces.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="afsp-save-btn"
                onClick={handleSetModerator}
                disabled={!moderatorEmail.trim()}
              >
                {t('forum.spaces.assign', 'Assign')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spaces grid */}
      {loading ? (
        <div className="afsp-loading">
          <div className="afsp-spinner"></div>
        </div>
      ) : spaces.length === 0 ? (
        <div className="afsp-empty">
          <Boxes size={32} />
          <p>{t('forum.spaces.noSpaces', 'No spaces yet')}</p>
        </div>
      ) : (
        <div className="afsp-grid">
          {spaces.map((space) => (
            <div key={space.id} className="afsp-card">
              <div className="afsp-card-header" style={{ borderLeftColor: space.color || '#8b2040' }}>
                <div className="afsp-card-icon">{space.icon || '📂'}</div>
                <div className="afsp-card-info">
                  <span className="afsp-card-name">{space.name}</span>
                  <span className="afsp-card-desc">{space.description || '-'}</span>
                </div>
                <span className={`afd-badge afd-badge-${space.status || 'published'}`}>
                  {space.status || 'active'}
                </span>
              </div>
              <div className="afsp-card-stats">
                <span className="afsp-card-stat">
                  <Users size={14} />
                  {space.memberCount || 0} {t('forum.spaces.members', 'members')}
                </span>
                <span className="afsp-card-stat">
                  {space.postCount || 0} {t('forum.spaces.postsCount', 'posts')}
                </span>
              </div>
              <div className="afsp-card-actions">
                {actionLoading === space.id ? (
                  <div className="afsp-action-spinner"></div>
                ) : (
                  <>
                    {space.status === 'pending' && (
                      <button
                        className="afsp-action-btn afsp-action-approve"
                        onClick={() => handleApprove(space.id)}
                        title={t('forum.spaces.approve', 'Approve')}
                      >
                        <Check size={14} />
                        {t('forum.spaces.approve', 'Approve')}
                      </button>
                    )}
                    <button
                      className="afsp-action-btn"
                      onClick={() => openEditForm(space)}
                      title={t('forum.spaces.edit', 'Edit')}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="afsp-action-btn"
                      onClick={() => setModeratorModal(space.id)}
                      title={t('forum.spaces.assignModerator', 'Assign Moderator')}
                    >
                      <Shield size={14} />
                    </button>
                    <button
                      className="afsp-action-btn afsp-action-delete"
                      onClick={() => handleDelete(space.id)}
                      title={t('forum.spaces.delete', 'Delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminForumSpaces;
