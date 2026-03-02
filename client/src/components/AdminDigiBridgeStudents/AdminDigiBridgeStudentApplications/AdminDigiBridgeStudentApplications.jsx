// src/components/AdminDigiBridgeStudentApplications/AdminDigiBridgeStudentApplications.jsx

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import { ApplicationsByStatusChart } from './Charts/ApplicationsByStatusChart';
import { ApplicationsByMentorChart } from './Charts/ApplicationsByMentorChart';
import './adminDigiBridgeStudentApplications.css';

export const AdminDigiBridgeStudentApplications = () => {
  const { t } = useTranslation('digibridge-students');
  const {
    getAllStudentApplications,
    approveStudentApplicationByAdmin,
    rejectStudentApplicationByAdmin,
    reapproveStudentApplicationByAdmin,
    deleteStudentApplicationByAdmin,
    getAllMentors
  } = useAcademy();

  const [applications, setApplications] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({ search: '', status: 'all', mentorId: 'all', sortBy: 'newest' });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modals, setModals] = useState({ view: false, approve: false, reject: false, delete: false });

  const fetchApplications = useCallback(async (showRefreshing = false) => {
    try {
      showRefreshing ? setRefreshing(true) : setLoading(true);
      const response = await getAllStudentApplications();
      if (response?.success) {
        setApplications(response.applications || []);
        setStatusCounts(response.statusCounts || { pending: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllStudentApplications]);

  const fetchMentors = useCallback(async () => {
    try {
      const response = await getAllMentors({ status: 'active', limit: 100 });
      if (response?.mentors) setMentors(response.mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  }, [getAllMentors]);

  useEffect(() => {
    fetchApplications();
    fetchMentors();
  }, [fetchApplications, fetchMentors]);

  const getFilteredApplications = useCallback(() => {
    let filtered = [...applications];
    if (activeTab !== 'overview') filtered = filtered.filter(app => app.status === activeTab);
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(app =>
        app.userName?.toLowerCase().includes(searchLower) ||
        app.userEmail?.toLowerCase().includes(searchLower) ||
        app.mentorName?.toLowerCase().includes(searchLower)
      );
    }
    if (activeTab === 'overview' && filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }
    if (filters.mentorId !== 'all') {
      filtered = filtered.filter(app => app.mentorId === parseInt(filters.mentorId));
    }
    switch (filters.sortBy) {
      case 'oldest': filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'studentName': filtered.sort((a, b) => (a.userName || '').localeCompare(b.userName || '')); break;
      case 'mentorName': filtered.sort((a, b) => (a.mentorName || '').localeCompare(b.mentorName || '')); break;
      default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return filtered;
  }, [applications, activeTab, filters]);

  const handleRefresh = () => fetchApplications(true);
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleClearFilters = () => setFilters({ search: '', status: 'all', mentorId: 'all', sortBy: 'newest' });
  
  const openModal = (modalType, application = null) => {
    setSelectedApplication(application);
    setModals(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
    if (!Object.values({ ...modals, [modalType]: false }).some(Boolean)) setSelectedApplication(null);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    try {
      await approveStudentApplicationByAdmin(selectedApplication.id);
      closeModal('approve');
      fetchApplications(true);
    } catch (error) { console.error('Error approving:', error); }
  };

  const handleReapprove = async () => {
    if (!selectedApplication) return;
    try {
      await reapproveStudentApplicationByAdmin(selectedApplication.id);
      closeModal('approve');
      fetchApplications(true);
    } catch (error) { console.error('Error reapproving:', error); }
  };

  const handleReject = async (reason) => {
    if (!selectedApplication) return;
    try {
      await rejectStudentApplicationByAdmin(selectedApplication.id, reason);
      closeModal('reject');
      fetchApplications(true);
    } catch (error) { console.error('Error rejecting:', error); }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    try {
      await deleteStudentApplicationByAdmin(selectedApplication.id);
      closeModal('delete');
      fetchApplications(true);
    } catch (error) { console.error('Error deleting:', error); }
  };

  const filteredApplications = getFilteredApplications();
  const totalApplications = applications.length;

  const chartDataByStatus = [
    { status: 'pending', count: statusCounts.pending },
    { status: 'approved', count: statusCounts.approved },
    { status: 'rejected', count: statusCounts.rejected }
  ];

  const chartDataByMentor = mentors
    .map(m => ({ mentorId: m.id, mentorName: m.name, mentorPhoto: m.photoUrl, count: applications.filter(a => a.mentorId === m.id).length }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="adminStudentApplications">
        <div className="adminStudentApplications-loading">
          <div className="adminStudentApplications-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="adminStudentApplications">
      {/* HEADER */}
      <div className="adminStudentApplications-header">
        <div className="adminStudentApplications-headerLeft">
          <h1 className="adminStudentApplications-title">
            <span className="adminStudentApplications-titleIcon">📋</span>
            {t('adminStudentApplications.title')}
          </h1>
          <p className="adminStudentApplications-subtitle">{t('adminStudentApplications.subtitle')}</p>
        </div>
        <div className="adminStudentApplications-headerRight">
          <button
            className={`adminStudentApplications-refreshBtn ${refreshing ? 'adminStudentApplications-refreshBtn--loading' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? t('common.refreshing') : t('common.refresh')}</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="adminStudentApplications-stats">
        <div className="adminStudentApplications-statCard adminStudentApplications-statCard--total">
          <div className="adminStudentApplications-statIcon">📊</div>
          <div className="adminStudentApplications-statInfo">
            <span className="adminStudentApplications-statValue">{totalApplications}</span>
            <span className="adminStudentApplications-statLabel">{t('adminStudentApplications.stats.total')}</span>
          </div>
        </div>
        <div className="adminStudentApplications-statCard adminStudentApplications-statCard--pending">
          <div className="adminStudentApplications-statIcon">⏳</div>
          <div className="adminStudentApplications-statInfo">
            <span className="adminStudentApplications-statValue">{statusCounts.pending}</span>
            <span className="adminStudentApplications-statLabel">{t('adminStudentApplications.stats.pending')}</span>
          </div>
        </div>
        <div className="adminStudentApplications-statCard adminStudentApplications-statCard--approved">
          <div className="adminStudentApplications-statIcon">✅</div>
          <div className="adminStudentApplications-statInfo">
            <span className="adminStudentApplications-statValue">{statusCounts.approved}</span>
            <span className="adminStudentApplications-statLabel">{t('adminStudentApplications.stats.approved')}</span>
          </div>
        </div>
        <div className="adminStudentApplications-statCard adminStudentApplications-statCard--rejected">
          <div className="adminStudentApplications-statIcon">❌</div>
          <div className="adminStudentApplications-statInfo">
            <span className="adminStudentApplications-statValue">{statusCounts.rejected}</span>
            <span className="adminStudentApplications-statLabel">{t('adminStudentApplications.stats.rejected')}</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="adminStudentApplications-tabs">
        {['overview', 'pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            className={`adminStudentApplications-tab ${activeTab === tab ? 'adminStudentApplications-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="adminStudentApplications-tabIcon">
              {tab === 'overview' ? '📊' : tab === 'pending' ? '⏳' : tab === 'approved' ? '✅' : '❌'}
            </span>
            {t(`adminStudentApplications.tabs.${tab}`)}
            {tab === 'pending' && statusCounts.pending > 0 && (
              <span className="adminStudentApplications-tabBadge">{statusCounts.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="adminStudentApplications-content">
        {/* Charts */}
        {activeTab === 'overview' && (
          <div className="adminStudentApplications-charts">
            <div className="adminStudentApplications-chartCard">
              <h3 className="adminStudentApplications-chartTitle">{t('adminStudentApplications.charts.byStatus')}</h3>
              <ApplicationsByStatusChart data={chartDataByStatus} loading={refreshing} />
            </div>
            <div className="adminStudentApplications-chartCard">
              <h3 className="adminStudentApplications-chartTitle">{t('adminStudentApplications.charts.byMentor')}</h3>
              <ApplicationsByMentorChart data={chartDataByMentor} loading={refreshing} />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="adminStudentApplications-filtersWrapper">
          <div className="adminStudentApplications-filters">
            <div className="adminStudentApplications-filterGroup">
              <div className="adminStudentApplications-searchInput">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder={t('adminStudentApplications.filters.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="adminStudentApplications-filterGroup">
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="adminStudentApplications-select">
                  <option value="all">{t('adminStudentApplications.filters.allStatuses')}</option>
                  <option value="pending">{t('adminStudentApplications.status.pending')}</option>
                  <option value="approved">{t('adminStudentApplications.status.approved')}</option>
                  <option value="rejected">{t('adminStudentApplications.status.rejected')}</option>
                </select>
              </div>
            )}

            <div className="adminStudentApplications-filterGroup">
              <select value={filters.mentorId} onChange={(e) => handleFilterChange('mentorId', e.target.value)} className="adminStudentApplications-select">
                <option value="all">{t('adminStudentApplications.filters.allMentors')}</option>
                {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="adminStudentApplications-filterGroup">
              <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} className="adminStudentApplications-select">
                <option value="newest">{t('adminStudentApplications.filters.newest')}</option>
                <option value="oldest">{t('adminStudentApplications.filters.oldest')}</option>
                <option value="studentName">{t('adminStudentApplications.filters.studentName')}</option>
                <option value="mentorName">{t('adminStudentApplications.filters.mentorName')}</option>
              </select>
            </div>

            {(filters.search || filters.status !== 'all' || filters.mentorId !== 'all' || filters.sortBy !== 'newest') && (
              <button className="adminStudentApplications-clearFiltersBtn" onClick={handleClearFilters}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {t('adminStudentApplications.filters.clearAll')}
              </button>
            )}
          </div>
          <div className="adminStudentApplications-resultsCount">
            {t('adminStudentApplications.filters.showing', {
              count: filteredApplications.length,
              total: activeTab === 'overview' ? totalApplications : applications.filter(a => a.status === activeTab).length
            })}
          </div>
        </div>

        {/* TABLE / CARDS */}
        <div className="adminStudentApplications-tableWrapper">
          {filteredApplications.length === 0 ? (
            <div className="adminStudentApplications-empty">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <rect x="8" y="8" width="48" height="48" rx="4" fill="currentColor" opacity="0.1" />
                <path d="M24 28h16M24 36h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{t('adminStudentApplications.table.noApplications')}</span>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="adminStudentApplications-desktopView">
                <table className="adminStudentApplications-table">
                  <thead>
                    <tr>
                      <th>{t('adminStudentApplications.table.student')}</th>
                      <th>{t('adminStudentApplications.table.mentor')}</th>
                      <th>{t('adminStudentApplications.table.status')}</th>
                      <th>{t('adminStudentApplications.table.appliedAt')}</th>
                      <th>{t('adminStudentApplications.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map(app => (
                      <tr key={app.id}>
                        <td>
                          <div className="adminStudentApplications-userCell">
                            <div className="adminStudentApplications-avatar">
                              {app.userAvatar ? <img src={app.userAvatar} alt={app.userName} /> : <span>{app.userName?.charAt(0)?.toUpperCase() || '?'}</span>}
                            </div>
                            <div className="adminStudentApplications-userInfo">
                              <span className="adminStudentApplications-userName">{app.userName}</span>
                              <span className="adminStudentApplications-userEmail">{app.userEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="adminStudentApplications-userCell">
                            <div className="adminStudentApplications-avatar adminStudentApplications-avatar--mentor">
                              {app.mentorPhoto ? <img src={app.mentorPhoto} alt={app.mentorName} /> : <span>{app.mentorName?.charAt(0)?.toUpperCase() || '?'}</span>}
                            </div>
                            <div className="adminStudentApplications-userInfo">
                              <span className="adminStudentApplications-userName">{app.mentorName}</span>
                              <span className="adminStudentApplications-userEmail">{app.mentorSpecialization || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`adminStudentApplications-statusBadge adminStudentApplications-statusBadge--${app.status}`}>
                            {t(`adminStudentApplications.status.${app.status}`)}
                          </span>
                        </td>
                        <td>
                          <span className="adminStudentApplications-date">
                            {new Date(app.createdAt).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <div className="adminStudentApplications-actions">
                            <button className="adminStudentApplications-actionBtn adminStudentApplications-actionBtn--view" onClick={() => openModal('view', app)} title={t('adminStudentApplications.actions.view')}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            {app.status === 'pending' && (
                              <>
                                <button className="adminStudentApplications-actionBtn adminStudentApplications-actionBtn--approve" onClick={() => openModal('approve', app)} title={t('adminStudentApplications.actions.approve')}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                </button>
                                <button className="adminStudentApplications-actionBtn adminStudentApplications-actionBtn--reject" onClick={() => openModal('reject', app)} title={t('adminStudentApplications.actions.reject')}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                              </>
                            )}
                            {app.status === 'rejected' && (
                              <button className="adminStudentApplications-actionBtn adminStudentApplications-actionBtn--reapprove" onClick={() => openModal('approve', app)} title={t('adminStudentApplications.actions.reapprove')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                              </button>
                            )}
                            <button className="adminStudentApplications-actionBtn adminStudentApplications-actionBtn--delete" onClick={() => openModal('delete', app)} title={t('adminStudentApplications.actions.delete')}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="adminStudentApplications-mobileView">
                {filteredApplications.map(app => (
                  <div key={app.id} className="adminStudentApplications-appCard">
                    <div className="adminStudentApplications-appCardHeader">
                      <div className="adminStudentApplications-appCardStudent">
                        <div className="adminStudentApplications-avatar">
                          {app.userAvatar ? <img src={app.userAvatar} alt={app.userName} /> : <span>{app.userName?.charAt(0)?.toUpperCase() || '?'}</span>}
                        </div>
                        <div className="adminStudentApplications-appCardInfo">
                          <span className="adminStudentApplications-appCardName">{app.userName}</span>
                          <span className="adminStudentApplications-appCardEmail">{app.userEmail}</span>
                        </div>
                      </div>
                      <span className={`adminStudentApplications-statusBadge adminStudentApplications-statusBadge--${app.status} adminStudentApplications-statusBadge--small`}>
                        {t(`adminStudentApplications.status.${app.status}`)}
                      </span>
                    </div>

                    <div className="adminStudentApplications-appCardBody">
                      <div className="adminStudentApplications-appCardRow">
                        <span className="adminStudentApplications-appCardLabel">{t('adminStudentApplications.table.mentor')}</span>
                        <div className="adminStudentApplications-appCardMentor">
                          <div className="adminStudentApplications-appCardMentorAvatar">
                            {app.mentorPhoto ? <img src={app.mentorPhoto} alt={app.mentorName} /> : <span>{app.mentorName?.charAt(0)?.toUpperCase() || '?'}</span>}
                          </div>
                          <span className="adminStudentApplications-appCardMentorName">{app.mentorName}</span>
                        </div>
                      </div>
                      <div className="adminStudentApplications-appCardRow">
                        <span className="adminStudentApplications-appCardLabel">{t('adminStudentApplications.table.appliedAt')}</span>
                        <span className="adminStudentApplications-appCardValue">
                          {new Date(app.createdAt).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="adminStudentApplications-appCardActions">
                      <button className="adminStudentApplications-appCardBtn adminStudentApplications-appCardBtn--view" onClick={() => openModal('view', app)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button className="adminStudentApplications-appCardBtn adminStudentApplications-appCardBtn--approve" onClick={() => openModal('approve', app)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          </button>
                          <button className="adminStudentApplications-appCardBtn adminStudentApplications-appCardBtn--reject" onClick={() => openModal('reject', app)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </>
                      )}
                      {app.status === 'rejected' && (
                        <button className="adminStudentApplications-appCardBtn adminStudentApplications-appCardBtn--reapprove" onClick={() => openModal('approve', app)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                        </button>
                      )}
                      <button className="adminStudentApplications-appCardBtn adminStudentApplications-appCardBtn--delete" onClick={() => openModal('delete', app)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {modals.view && selectedApplication && (
        <div className="adminStudentApplications-modalOverlay" onClick={() => closeModal('view')}>
          <div className="adminStudentApplications-modal adminStudentApplications-modal--view" onClick={e => e.stopPropagation()}>
            <div className="adminStudentApplications-modalHeader">
              <h2>{t('adminStudentApplications.modals.viewTitle')}</h2>
              <button className="adminStudentApplications-modalClose" onClick={() => closeModal('view')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="adminStudentApplications-modalBody">
              <div className="adminStudentApplications-viewSection">
                <h3>{t('adminStudentApplications.modals.studentInfo')}</h3>
                <div className="adminStudentApplications-viewRow">
                  <div className="adminStudentApplications-avatar adminStudentApplications-avatar--large">
                    {selectedApplication.userAvatar ? <img src={selectedApplication.userAvatar} alt={selectedApplication.userName} /> : <span>{selectedApplication.userName?.charAt(0)?.toUpperCase() || '?'}</span>}
                  </div>
                  <div className="adminStudentApplications-viewDetails">
                    <p><strong>{t('adminStudentApplications.modals.name')}:</strong> {selectedApplication.userName}</p>
                    <p><strong>{t('adminStudentApplications.modals.email')}:</strong> {selectedApplication.userEmail}</p>
                    {selectedApplication.userPhone && <p><strong>{t('adminStudentApplications.modals.phone')}:</strong> {selectedApplication.userPhone}</p>}
                  </div>
                </div>
              </div>
              <div className="adminStudentApplications-viewSection">
                <h3>{t('adminStudentApplications.modals.mentorInfo')}</h3>
                <div className="adminStudentApplications-viewRow">
                  <div className="adminStudentApplications-avatar adminStudentApplications-avatar--large adminStudentApplications-avatar--mentor">
                    {selectedApplication.mentorPhoto ? <img src={selectedApplication.mentorPhoto} alt={selectedApplication.mentorName} /> : <span>{selectedApplication.mentorName?.charAt(0)?.toUpperCase() || '?'}</span>}
                  </div>
                  <div className="adminStudentApplications-viewDetails">
                    <p><strong>{t('adminStudentApplications.modals.name')}:</strong> {selectedApplication.mentorName}</p>
                    <p><strong>{t('adminStudentApplications.modals.email')}:</strong> {selectedApplication.mentorEmail}</p>
                    {selectedApplication.mentorSpecialization && <p><strong>{t('adminStudentApplications.modals.specialization')}:</strong> {selectedApplication.mentorSpecialization}</p>}
                  </div>
                </div>
              </div>
              <div className="adminStudentApplications-viewSection">
                <h3>{t('adminStudentApplications.modals.applicationInfo')}</h3>
                <div className="adminStudentApplications-viewGrid">
                  <p>
                    <strong>{t('adminStudentApplications.modals.status')}:</strong>
                    <span className={`adminStudentApplications-statusBadge adminStudentApplications-statusBadge--${selectedApplication.status}`}>
                      {t(`adminStudentApplications.status.${selectedApplication.status}`)}
                    </span>
                  </p>
                  <p><strong>{t('adminStudentApplications.modals.appliedAt')}:</strong> {new Date(selectedApplication.createdAt).toLocaleString('bg-BG')}</p>
                  {selectedApplication.approvedAt && <p><strong>{t('adminStudentApplications.modals.approvedAt')}:</strong> {new Date(selectedApplication.approvedAt).toLocaleString('bg-BG')}</p>}
                  {selectedApplication.rejectedAt && <p><strong>{t('adminStudentApplications.modals.rejectedAt')}:</strong> {new Date(selectedApplication.rejectedAt).toLocaleString('bg-BG')}</p>}
                  {selectedApplication.rejectionReason && (
                    <p className="adminStudentApplications-rejectionReason">
                      <strong>{t('adminStudentApplications.modals.rejectionReason')}:</strong>
                      <span>{selectedApplication.rejectionReason}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="adminStudentApplications-modalFooter">
              <button className="adminStudentApplications-btn adminStudentApplications-btn--secondary" onClick={() => closeModal('view')}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {modals.approve && selectedApplication && (
        <div className="adminStudentApplications-modalOverlay" onClick={() => closeModal('approve')}>
          <div className="adminStudentApplications-modal" onClick={e => e.stopPropagation()}>
            <div className="adminStudentApplications-modalHeader">
              <h2>{selectedApplication.status === 'rejected' ? t('adminStudentApplications.modals.reapproveTitle') : t('adminStudentApplications.modals.approveTitle')}</h2>
              <button className="adminStudentApplications-modalClose" onClick={() => closeModal('approve')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="adminStudentApplications-modalBody">
              <div className="adminStudentApplications-confirmIcon adminStudentApplications-confirmIcon--approve">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="adminStudentApplications-confirmText">
                {selectedApplication.status === 'rejected'
                  ? t('adminStudentApplications.modals.reapproveConfirm', { student: selectedApplication.userName, mentor: selectedApplication.mentorName })
                  : t('adminStudentApplications.modals.approveConfirm', { student: selectedApplication.userName, mentor: selectedApplication.mentorName })}
              </p>
            </div>
            <div className="adminStudentApplications-modalFooter">
              <button className="adminStudentApplications-btn adminStudentApplications-btn--secondary" onClick={() => closeModal('approve')}>{t('common.cancel')}</button>
              <button className="adminStudentApplications-btn adminStudentApplications-btn--success" onClick={selectedApplication.status === 'rejected' ? handleReapprove : handleApprove}>
                {selectedApplication.status === 'rejected' ? t('adminStudentApplications.actions.reapprove') : t('adminStudentApplications.actions.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {modals.reject && selectedApplication && (
        <RejectModal application={selectedApplication} onClose={() => closeModal('reject')} onReject={handleReject} />
      )}

      {/* DELETE MODAL */}
      {modals.delete && selectedApplication && (
        <div className="adminStudentApplications-modalOverlay" onClick={() => closeModal('delete')}>
          <div className="adminStudentApplications-modal" onClick={e => e.stopPropagation()}>
            <div className="adminStudentApplications-modalHeader">
              <h2>{t('adminStudentApplications.modals.deleteTitle')}</h2>
              <button className="adminStudentApplications-modalClose" onClick={() => closeModal('delete')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="adminStudentApplications-modalBody">
              <div className="adminStudentApplications-confirmIcon adminStudentApplications-confirmIcon--delete">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </div>
              <p className="adminStudentApplications-confirmText">{t('adminStudentApplications.modals.deleteConfirm', { student: selectedApplication.userName })}</p>
              <p className="adminStudentApplications-warningText">{t('adminStudentApplications.modals.deleteWarning')}</p>
            </div>
            <div className="adminStudentApplications-modalFooter">
              <button className="adminStudentApplications-btn adminStudentApplications-btn--secondary" onClick={() => closeModal('delete')}>{t('common.cancel')}</button>
              <button className="adminStudentApplications-btn adminStudentApplications-btn--danger" onClick={handleDelete}>{t('adminStudentApplications.actions.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RejectModal = ({ application, onClose, onReject }) => {
  const { t } = useTranslation('digibridge-students');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) { setError(t('adminStudentApplications.modals.reasonRequired')); return; }
    if (reason.trim().length < 10) { setError(t('adminStudentApplications.modals.reasonTooShort')); return; }
    onReject(reason.trim());
  };

  return (
    <div className="adminStudentApplications-modalOverlay" onClick={onClose}>
      <div className="adminStudentApplications-modal" onClick={e => e.stopPropagation()}>
        <div className="adminStudentApplications-modalHeader">
          <h2>{t('adminStudentApplications.modals.rejectTitle')}</h2>
          <button className="adminStudentApplications-modalClose" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="adminStudentApplications-modalBody">
          <p className="adminStudentApplications-rejectInfo">{t('adminStudentApplications.modals.rejectInfo', { student: application.userName, mentor: application.mentorName })}</p>
          <div className="adminStudentApplications-formGroup">
            <label>{t('adminStudentApplications.modals.rejectionReasonLabel')}</label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              placeholder={t('adminStudentApplications.modals.rejectionReasonPlaceholder')}
              rows={4}
              className={error ? 'adminStudentApplications-textarea--error' : ''}
            />
            {error && <span className="adminStudentApplications-error">{error}</span>}
          </div>
        </div>
        <div className="adminStudentApplications-modalFooter">
          <button className="adminStudentApplications-btn adminStudentApplications-btn--secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button className="adminStudentApplications-btn adminStudentApplications-btn--danger" onClick={handleSubmit}>{t('adminStudentApplications.actions.reject')}</button>
        </div>
      </div>
    </div>
  );
};