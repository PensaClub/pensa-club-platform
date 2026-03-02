// src/components/AdminDigiBridgeMentors/AdminDigiBridgeMentors.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
import { toast } from 'react-toastify';
import './adminDigiBridgeMentors.css';
import { AdminDigiBridgeMentorStats } from './AdminDigiBridgeMentorStats/AdminDigiBridgeMentorStats';
import { AdminDigiBridgeMentorFilters } from './AdminDigiBridgeMentorFilters/AdminDigiBridgeMentorFilters';
import { AdminDigiBridgeMentorCard } from './AdminDigiBridgeMentorCard/AdminDigiBridgeMentorCard';
import { AdminDigiBridgeMentorDetailModal } from './AdminDigiBridgeMentorDetailModal/AdminDigiBridgeMentorDetailModal';
import { AdminDigiBridgeSendEmailModal } from './AdminDigiBridgeSendEmailModal/AdminDigiBridgeSendEmailModal';
import { AdminDigiBridgeRejectedDetailModal } from './AdminDigiBridgeRejectedDetailModal/AdminDigiBridgeRejectedDetailModal';
import { AdminDigiBridgeMentorEditModal } from './AdminDigiBridgeMentorEditModal/adminDigiBridgeMentorEditModal';
import { AdminDigiBridgeSendEmailToRejectedModal } from './AdminDigiBridgeSendEmailToRejectedModal/AdminDigiBridgeSendEmailToRejectedModal';

export const AdminDigiBridgeMentors = () => {
    const { t } = useTranslation('digibridge');
    const {
        sendPersonalEmail,
        getAllMentors,
        getRejectedMentorApplications,
        activateMentor,
        deactivateMentor,
        deleteMentor,
        approveMentor,
        bulkDeleteMentors,
        updateMentor,
    } = useAcademy();

    // STATE
    const [mentors, setMentors] = useState([]);
    const [filteredMentors, setFilteredMentors] = useState([]);
    const [rejectedApplications, setRejectedApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showRejected, setShowRejected] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);

    // MODALS
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [rejectedDetailModalOpen, setRejectedDetailModalOpen] = useState(false);
    const [selectedRejectedApplication, setSelectedRejectedApplication] = useState(null);
    const [emailRejectedModalOpen, setEmailRejectedModalOpen] = useState(false);

    // FILTERS
    const [filters, setFilters] = useState({
        search: '',
        specialization: 'all',
        status: 'all',
        sortBy: 'name'
    });

    // BULK ACTIONS
    const [selectedMentors, setSelectedMentors] = useState([]);
    const [bulkActionMode, setBulkActionMode] = useState(false);

    // ===============================
    // FETCH MENTORS
    // ===============================
    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        setIsLoading(true);
        try {
            const [approvedData, rejectedData] = await Promise.all([
                getAllMentors({ page: 1, limit: 100 }),
                getRejectedMentorApplications()
            ]);

            setMentors(approvedData.mentors || approvedData);
            setFilteredMentors(approvedData.mentors || approvedData);
            setRejectedApplications(rejectedData.applications || rejectedData);
        } catch (error) {
            console.error('Error fetching mentors:', error);
            toast.error('Грешка при зареждане на менторите');
        } finally {
            setIsLoading(false);
        }
    };

    // ===============================
    // FILTER & SORT
    // ===============================
    useEffect(() => {
        let filtered = [...mentors];

        if (filters.search) {
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                m.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                (m.specialization && m.specialization.toLowerCase().includes(filters.search.toLowerCase()))
            );
        }

        if (filters.specialization !== 'all') {
            filtered = filtered.filter(m => m.specialization === filters.specialization);
        }

        if (filters.status === 'online') {
            filtered = filtered.filter(m => m.isOnline);
        } else if (filters.status === 'offline') {
            filtered = filtered.filter(m => !m.isOnline);
        }

        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'students':
                    return (b.studentsCount || 0) - (a.studentsCount || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'date':
                    return new Date(b.approvedAt || b.createdAt) - new Date(a.approvedAt || a.createdAt);
                default:
                    return 0;
            }
        });

        setFilteredMentors(filtered);
    }, [filters, mentors]);

    // ===============================
    // HANDLERS
    // ===============================
    const handleViewDetails = (mentor) => {
        setSelectedMentor(mentor);
        setDetailModalOpen(true);
    };

    const handleEdit = (mentor) => {
        setSelectedMentor(mentor);
        setEditModalOpen(true);
    };

    const handleSendEmail = (mentor) => {
        setSelectedMentor(mentor);
        setEmailModalOpen(true);
    };
    const handleActivate = async (mentorId) => {
        if (!window.confirm('Сигурни ли сте, че искате да активирате този ментор?')) return;

        try {
            await activateMentor(mentorId);
            toast.success('Менторът беше активиран');
            fetchMentors();
        } catch (error) {
            console.error('Error activating mentor:', error);
            toast.error('Грешка при активиране на ментор');
        }
    };
    const handleDeactivate = async (mentorId) => {
        if (!window.confirm('Сигурни ли сте, че искате да деактивирате този ментор?')) return;

        try {
            await deactivateMentor(mentorId);
            toast.success('Менторът беше деактивиран');
            fetchMentors();
        } catch (error) {
            console.error('Error deactivating mentor:', error);
            toast.error('Грешка при деактивиране на ментор');
        }
    };

    const handleDelete = async (mentorId) => {
        if (!window.confirm('Сигурни ли сте, че искате да изтриете този ментор?')) return;

        try {
            await deleteMentor(mentorId);
            toast.success('Менторът беше изтрит');
            fetchMentors();
        } catch (error) {
            console.error('Error deleting mentor:', error);
            toast.error('Грешка при изтриване на ментор');
        }
    };

    const handleApproveRejected = async (applicationId) => {
        if (!window.confirm('Сигурни ли сте, че искате да одобрите тази кандидатура?')) return;

        try {
            await approveMentor(applicationId);
            toast.success('Кандидатурата беше одобрена');
            fetchMentors();
        } catch (error) {
            console.error('Error approving mentor:', error);
            toast.error('Грешка при одобряване на кандидатура');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Сигурни ли сте, че искате да изтриете ${selectedMentors.length} ментор(и)?`)) return;

        try {
            await bulkDeleteMentors(selectedMentors);
            toast.success('Менторите бяха изтрити');
            setSelectedMentors([]);
            setBulkActionMode(false);
            fetchMentors();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            toast.error('Грешка при масово изтриване');
        }
    };

    const handleExportCSV = () => {
        const csv = [
            ['Име', 'Email', 'Телефон', 'Специализация', 'Студенти', 'Рейтинг'].join(','),
            ...filteredMentors.map(m =>
                [
                    m.name,
                    m.email,
                    m.phone,
                    m.specialization || '',
                    m.studentsCount || 0,
                    m.rating || 0
                ].join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mentors_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        toast.success('CSV файлът беше експортиран');
    };

    const toggleMentorSelection = (mentorId) => {
        setSelectedMentors(prev =>
            prev.includes(mentorId)
                ? prev.filter(id => id !== mentorId)
                : [...prev, mentorId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedMentors.length === filteredMentors.length) {
            setSelectedMentors([]);
        } else {
            setSelectedMentors(filteredMentors.map(m => m.id));
        }
    };

    return (
        <div className="admin-digibridge-mentors">
            {/* HERO */}
            <div className="admin-digibridge-mentors-hero">
                <div className="admin-digibridge-mentors-hero-content">
                    <h1>{t('AdminDigiBridgeMentors.title') || 'Управление на ментори'}</h1>
                    <p>{t('AdminDigiBridgeMentors.subtitle') || 'Преглед и управление на всички одобрени ментори'}</p>
                </div>

                <div className="admin-digibridge-mentors-hero-actions">
                    <button
                        className="admin-digibridge-mentors-action-btn admin-digibridge-mentors-action-btn-secondary"
                        onClick={handleExportCSV}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Експорт CSV
                    </button>

                    <button
                        className={`admin-digibridge-mentors-action-btn ${bulkActionMode
                            ? 'admin-digibridge-mentors-action-btn-danger'
                            : 'admin-digibridge-mentors-action-btn-primary'
                            }`}
                        onClick={() => {
                            setBulkActionMode(!bulkActionMode);
                            setSelectedMentors([]);
                        }}
                    >
                        {bulkActionMode ? (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Откажи
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                Масови действия
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* BULK ACTION BAR */}
            {bulkActionMode && selectedMentors.length > 0 && (
                <div className="admin-digibridge-mentors-bulk-bar">
                    <span>Избрани: {selectedMentors.length}</span>
                    <button
                        className="admin-digibridge-mentors-bulk-btn admin-digibridge-mentors-bulk-btn-delete"
                        onClick={handleBulkDelete}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Изтрий избраните
                    </button>
                </div>
            )}

            {/* STATS */}
            <AdminDigiBridgeMentorStats
                totalMentors={mentors.length}
                onlineMentors={mentors.filter(m => m.isOnline).length}
                totalStudents={mentors.reduce((sum, m) => sum + (m.studentsCount || 0), 0)}
                averageRating={(mentors.reduce((sum, m) => sum + (m.rating || 0), 0) / mentors.length || 0).toFixed(1)}
            />

            {/* FILTERS */}
            <AdminDigiBridgeMentorFilters
                filters={filters}
                setFilters={setFilters}
                mentorsCount={filteredMentors.length}
            />

            {/* MENTORS LIST */}
            <div className="admin-digibridge-mentors-list">
                {bulkActionMode && (
                    <div className="admin-digibridge-mentors-select-all">
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedMentors.length === filteredMentors.length && filteredMentors.length > 0}
                                onChange={toggleSelectAll}
                            />
                            <span>Избери всички</span>
                        </label>
                    </div>
                )}

                {isLoading ? (
                    <div className="admin-digibridge-mentors-loading">
                        <div className="admin-digibridge-mentors-spinner"></div>
                        <p>Зареждане...</p>
                    </div>
                ) : filteredMentors.length > 0 ? (
                    <div className="admin-digibridge-mentors-grid">
                        {filteredMentors.map(mentor => (
                            <AdminDigiBridgeMentorCard
                                key={mentor.id}
                                mentor={mentor}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEdit}
                                onSendEmail={handleSendEmail}
                                onActivate={handleActivate}  
                                onDeactivate={handleDeactivate}
                                onDelete={handleDelete}
                                bulkMode={bulkActionMode}
                                isSelected={selectedMentors.includes(mentor.id)}
                                onToggleSelect={toggleMentorSelection}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="admin-digibridge-mentors-empty">
                        <div className="admin-digibridge-mentors-empty-icon">🔍</div>
                        <h3>Няма намерени ментори</h3>
                        <p>Опитайте да промените филтрите</p>
                    </div>
                )}
            </div>

            {/* REJECTED APPLICATIONS */}
            {rejectedApplications.length > 0 && (
                <div className="admin-digibridge-mentors-rejected-section">
                    <button
                        className="admin-digibridge-mentors-rejected-toggle"
                        onClick={() => setShowRejected(!showRejected)}
                    >
                        <h2>
                            Отхвърлени кандидатури ({rejectedApplications.length})
                        </h2>
                        <svg
                            className={`admin-digibridge-mentors-toggle-arrow ${showRejected ? 'open' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {showRejected && (
                        <div className="admin-digibridge-mentors-rejected-list">
                            {rejectedApplications.map(app => (
                                <div
                                    key={app.id}
                                    className="admin-digibridge-mentors-rejected-card"
                                    onClick={() => {
                                        setSelectedRejectedApplication(app);
                                        setRejectedDetailModalOpen(true);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img src={app.photoUrl} alt={app.name} />
                                    <div className="admin-digibridge-mentors-rejected-info">
                                        <h3>{app.name}</h3>
                                        <p>{app.email}</p>
                                        <span className="admin-digibridge-mentors-rejected-spec">
                                            {app.specialization}
                                        </span>
                                        <span className="admin-digibridge-mentors-rejected-reason">
                                            Причина: {app.rejectionReason}
                                        </span>
                                    </div>
                                    <button
                                        className="admin-digibridge-mentors-approve-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApproveRejected(app.id);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Одобри сега
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODALS */}
            {detailModalOpen && selectedMentor && (
                <AdminDigiBridgeMentorDetailModal
                    mentor={selectedMentor}
                    onClose={() => setDetailModalOpen(false)}
                    onSendEmail={() => {
                        setDetailModalOpen(false);
                        setEmailModalOpen(true);
                    }}
                />
            )}

            {emailModalOpen && selectedMentor && (
                <AdminDigiBridgeSendEmailModal
                    mentor={selectedMentor}
                    onClose={() => setEmailModalOpen(false)}
                />
            )}

            {rejectedDetailModalOpen && selectedRejectedApplication && (
                <AdminDigiBridgeRejectedDetailModal
                    application={selectedRejectedApplication}
                    onClose={() => setRejectedDetailModalOpen(false)}
                    onApprove={handleApproveRejected}
                    onSendEmail={() => {
                        setRejectedDetailModalOpen(false);
                        setEmailRejectedModalOpen(true);
                    }}
                />
            )}

            {emailRejectedModalOpen && selectedRejectedApplication && (
                <AdminDigiBridgeSendEmailToRejectedModal
                    application={selectedRejectedApplication}
                    onClose={() => setEmailRejectedModalOpen(false)}
                />
            )}

            {editModalOpen && selectedMentor && (
                <AdminDigiBridgeMentorEditModal
                    mentor={selectedMentor}
                    onClose={() => setEditModalOpen(false)}
                    onSave={async (updatedData) => {
                        try {
                            await updateMentor(selectedMentor.id, updatedData);
                            setEditModalOpen(false);
                            fetchMentors();
                            toast.success('Менторът беше обновен успешно');
                        } catch (error) {
                            toast.error('Грешка при обновяване на ментор');
                        }
                    }}
                />
            )}
        </div>
    );
};