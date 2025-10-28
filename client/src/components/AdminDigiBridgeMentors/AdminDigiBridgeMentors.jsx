// src/components/AdminDigiBridgeMentors/AdminDigiBridgeMentors.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
// import { AdminDigiBridgeMentorFilters } from './AdminDigiBridgeMentorFilters/AdminDigiBridgeMentorFilters';
// import { AdminDigiBridgeMentorStats } from './AdminDigiBridgeMentorStats/AdminDigiBridgeMentorStats';
// import { AdminDigiBridgeMentorCard } from './AdminDigiBridgeMentorCard/AdminDigiBridgeMentorCard';
// import { AdminDigiBridgeMentorDetailModal } from './AdminDigiBridgeMentorDetailModal/AdminDigiBridgeMentorDetailModal';
// import { AdminDigiBridgeMentorEditModal } from './AdminDigiBridgeMentorEditModal/AdminDigiBridgeMentorEditModal';
// import { AdminDigiBridgeSendEmailModal } from './AdminDigiBridgeSendEmailModal/AdminDigiBridgeSendEmailModal';
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

// ===================================
// МОКНАТИ ДАННИ ЗА ТЕСТВАНЕ
// ===================================
const MOCK_MENTORS = [
    {
        id: 1,
        userId: "user_001",
        name: "Мария Петрова",
        email: "borislaviliev47@gmail.com",
        phone: "+359888123456",
        age: 24,
        photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        specialization: "Digital Security",
        education: "СУ - Киберсигурност, Бакалавър 2023",
        experience: "2 години опит в обучение на възрастни хора",
        motivation: "Искам да помагам на хората да се чувстват по-сигурни онлайн",
        availability: "Гъвкав график",
        languages: ["bg", "en"],
        viber: "+359888123456",
        facebook: "facebook.com/maria.petrova",
        linkedin: "linkedin.com/in/mariapetrova",
        otherContact: "",
        cvUrl: "https://example.com/cv_maria.pdf",
        cvOriginalName: "Maria_Petrova_CV.pdf",
        status: "approved",
        isOnline: true,
        studentsCount: 12,
        rating: 4.9,
        sessionsCount: 45,
        createdAt: "2025-01-10T10:00:00Z",
        approvedAt: "2025-01-11T14:30:00Z",
        lastActiveAt: "2025-01-28T11:00:00Z",
        priorityContact: "viber",
        adminNotes: "Много добър ментор, отзивчив и професионален"
    },
    {
        id: 2,
        userId: "user_002",
        name: "Иван Георгиев",
        email: "borislaviliev47@gmail.com",
        phone: "+359887654321",
        age: 28,
        photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
        specialization: "Social Media",
        education: "НБУ - Комуникации и дигитални медии",
        experience: "3 години опит като социален мениджър",
        motivation: "Обичам да споделям знания за социалните мрежи",
        availability: "Вечер и уикенди",
        languages: ["bg", "en", "de"],
        viber: "+359887654321",
        facebook: "facebook.com/ivan.georgiev",
        linkedin: "linkedin.com/in/ivangeorgiev",
        otherContact: "Telegram: @ivangeorgiev",
        cvUrl: "https://example.com/cv_ivan.pdf",
        cvOriginalName: "Ivan_Georgiev_CV.pdf",
        status: "approved",
        isOnline: false,
        studentsCount: 8,
        rating: 4.7,
        sessionsCount: 32,
        createdAt: "2025-01-12T09:00:00Z",
        approvedAt: "2025-01-13T16:00:00Z",
        lastActiveAt: "2025-01-27T18:30:00Z",
        priorityContact: "facebook",
        adminNotes: ""
    },
    {
        id: 3,
        userId: "user_003",
        name: "Елена Димитрова",
        email: "borislaviliev47@gmail.com",
        phone: "+359889999888",
        age: 26,
        photoUrl: "https://randomuser.me/api/portraits/women/65.jpg",
        specialization: "Online Banking",
        education: "УНСС - Финанси и банкиране",
        experience: "4 години в банков сектор",
        motivation: "Желая да помогна на възрастните хора с онлайн банкиране",
        availability: "Работни дни следобед",
        languages: ["bg", "en"],
        viber: "",
        facebook: "",
        linkedin: "linkedin.com/in/elenadimitrova",
        otherContact: "",
        cvUrl: "https://example.com/cv_elena.pdf",
        cvOriginalName: "Elena_Dimitrova_CV.pdf",
        status: "approved",
        isOnline: true,
        studentsCount: 15,
        rating: 5.0,
        sessionsCount: 58,
        createdAt: "2025-01-08T14:00:00Z",
        approvedAt: "2025-01-09T10:30:00Z",
        lastActiveAt: "2025-01-28T09:15:00Z",
        priorityContact: "linkedin",
        adminNotes: "Топ ментор! Много отговорна и компетентна"
    }
];

const MOCK_REJECTED = [
    {
        id: 4,
        userId: "user_004",                    // ✅ ДОБАВЕНО
        name: "Петър Иванов",
        email: "borislaviliev47@gmail.com",
        phone: "+359888777666",
        age: 22,
        photoUrl: "https://randomuser.me/api/portraits/men/75.jpg",
        specialization: "Media Literacy",
        education: "Студент в СУ - Журналистика",  // ✅ РАЗШИРЕНО
        experience: "6 месеца стаж в местна медия", // ✅ ДОБАВЕНО
        motivation: "Искам да помагам на хората да разпознават фалшиви новини", // ✅ ДОБАВЕНО
        availability: "Уикенди",                // ✅ ДОБАВЕНО
        languages: ["bg"],                      // ✅ ДОБАВЕНО
        viber: "+359888777666",                 // ✅ ДОБАВЕНО
        facebook: "facebook.com/peter.ivanov",  // ✅ ДОБАВЕНО
        linkedin: "",                           // ✅ ДОБАВЕНО
        otherContact: "",                       // ✅ ДОБАВЕНО
        cvUrl: "https://example.com/cv_peter.pdf",        // ✅ ДОБАВЕНО
        cvOriginalName: "Peter_Ivanov_CV.pdf",  // ✅ ДОБАВЕНО
        status: "rejected",
        createdAt: "2025-01-20T11:00:00Z",
        rejectedAt: "2025-01-21T09:00:00Z",
        rejectionReason: "Недостатъчен опит в областта"
    }
];

export const AdminDigiBridgeMentors = () => {
    const { t } = useTranslation();
    const {
        sendPersonalEmail,
        // getApprovedMentors,
        // getRejectedMentorApplications,
        deactivateMentor,
        deleteMentor,
        approveMentor,
        bulkDeleteMentors
    } = useAcademy();

    // STATE
    const [mentors, setMentors] = useState(MOCK_MENTORS); // МОКНАТИ ДАННИ
    const [filteredMentors, setFilteredMentors] = useState(MOCK_MENTORS); // МОКНАТИ ДАННИ
    const [rejectedApplications, setRejectedApplications] = useState(MOCK_REJECTED); // МОКНАТИ ДАННИ
    const [isLoading, setIsLoading] = useState(false); // false защото не зареждаме от API
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

    // FETCH MENTORS - ЗАКОМЕНТИРАНО ЗА СЕГА
    // useEffect(() => {
    //   fetchMentors();
    // }, []);

    // const fetchMentors = async () => {
    //   setIsLoading(true);
    //   try {
    //     const [approvedData, rejectedData] = await Promise.all([
    //       getApprovedMentors(),
    //       getRejectedMentorApplications()
    //     ]);

    //     setMentors(approvedData);
    //     setFilteredMentors(approvedData);
    //     setRejectedApplications(rejectedData);
    //   } catch (error) {
    //     console.error('Error fetching mentors:', error);
    //     toast.error(t('AdminDigiBridgeMentors.errors.fetchError'));
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // FILTER & SORT
    useEffect(() => {
        let filtered = [...mentors];

        if (filters.search) {
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                m.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                m.specialization.toLowerCase().includes(filters.search.toLowerCase())
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
                    return b.studentsCount - a.studentsCount;
                case 'rating':
                    return b.rating - a.rating;
                case 'date':
                    return new Date(b.approvedAt) - new Date(a.approvedAt);
                default:
                    return 0;
            }
        });

        setFilteredMentors(filtered);
    }, [filters, mentors]);

    // HANDLERS
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

    const handleDeactivate = async (mentorId) => {
        if (!window.confirm(t('AdminDigiBridgeMentors.confirmDeactivate'))) return;

        try {
            // await deactivateMentor(mentorId);
            toast.success(t('AdminDigiBridgeMentors.deactivateSuccess'));
            // fetchMentors();
        } catch (error) {
            console.error('Error deactivating mentor:', error);
            toast.error(t('AdminDigiBridgeMentors.errors.deactivateError'));
        }
    };

    const handleDelete = async (mentorId) => {
        if (!window.confirm(t('AdminDigiBridgeMentors.confirmDelete'))) return;

        try {
            // await deleteMentor(mentorId);
            toast.success(t('AdminDigiBridgeMentors.deleteSuccess'));
            // fetchMentors();
        } catch (error) {
            console.error('Error deleting mentor:', error);
            toast.error(t('AdminDigiBridgeMentors.errors.deleteError'));
        }
    };

    const handleApproveRejected = async (applicationId) => {
        if (!window.confirm(t('AdminDigiBridgeMentors.confirmApprove'))) return;

        try {
            // await approveMentor(applicationId);
            toast.success(t('AdminDigiBridgeMentors.approveSuccess'));
            // fetchMentors();
        } catch (error) {
            console.error('Error approving mentor:', error);
            toast.error(t('AdminDigiBridgeMentors.errors.approveError'));
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(t('AdminDigiBridgeMentors.confirmBulkDelete', { count: selectedMentors.length }))) return;

        try {
            // await bulkDeleteMentors(selectedMentors);
            toast.success(t('AdminDigiBridgeMentors.bulkDeleteSuccess'));
            setSelectedMentors([]);
            setBulkActionMode(false);
            // fetchMentors();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            toast.error(t('AdminDigiBridgeMentors.errors.bulkDeleteError'));
        }
    };

    const handleExportCSV = () => {
        const csv = [
            ['Име', 'Email', 'Телефон', 'Специализация', 'Студенти', 'Рейтинг'].join(','),
            ...filteredMentors.map(m =>
                [m.name, m.email, m.phone, m.specialization, m.studentsCount, m.rating].join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mentors_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        toast.success(t('AdminDigiBridgeMentors.exportSuccess'));
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
                    <h1>{t('AdminDigiBridgeMentors.title')}</h1>
                    <p>{t('AdminDigiBridgeMentors.subtitle')}</p>
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
                        {t('AdminDigiBridgeMentors.exportCSV')}
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
                                {t('AdminDigiBridgeMentors.cancelBulk')}
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                {t('AdminDigiBridgeMentors.bulkActions')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* BULK ACTION BAR */}
            {bulkActionMode && selectedMentors.length > 0 && (
                <div className="admin-digibridge-mentors-bulk-bar">
                    <span>{t('AdminDigiBridgeMentors.selectedCount', { count: selectedMentors.length })}</span>
                    <button
                        className="admin-digibridge-mentors-bulk-btn admin-digibridge-mentors-bulk-btn-delete"
                        onClick={handleBulkDelete}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        {t('AdminDigiBridgeMentors.deleteSelected')}
                    </button>
                </div>
            )}

            {/* STATS */}
            <AdminDigiBridgeMentorStats
                totalMentors={mentors.length}
                onlineMentors={mentors.filter(m => m.isOnline).length}
                totalStudents={mentors.reduce((sum, m) => sum + m.studentsCount, 0)}
                averageRating={(mentors.reduce((sum, m) => sum + m.rating, 0) / mentors.length || 0).toFixed(1)}
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
                            <span>{t('AdminDigiBridgeMentors.selectAll')}</span>
                        </label>
                    </div>
                )}

                {isLoading ? (
                    <div className="admin-digibridge-mentors-loading">
                        <div className="admin-digibridge-mentors-spinner"></div>
                        <p>{t('AdminDigiBridgeMentors.loading')}</p>
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
                        <h3>{t('AdminDigiBridgeMentors.noResults')}</h3>
                        <p>{t('AdminDigiBridgeMentors.noResultsDescription')}</p>
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
                            {t('AdminDigiBridgeMentors.rejectedApplications')} ({rejectedApplications.length})
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
                                            {t('AdminDigiBridgeMentors.rejectionReason')}: {app.rejectionReason}
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
                                        {t('AdminDigiBridgeMentors.approveNow')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODALS - ВРЕМЕННО ЗАКОМЕНТИРАНИ */}
            {detailModalOpen && (
                <AdminDigiBridgeMentorDetailModal
                    mentor={selectedMentor}
                    onClose={() => setDetailModalOpen(false)}
                    onSendEmail={() => {
                        setDetailModalOpen(false);
                        setEmailModalOpen(true);
                    }}
                />
            )}
            {emailModalOpen && (
                <AdminDigiBridgeSendEmailModal
                    mentor={selectedMentor}
                    onClose={() => setEmailModalOpen(false)}
                />
            )}
            {rejectedDetailModalOpen && (
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

            {emailRejectedModalOpen && (
                <AdminDigiBridgeSendEmailToRejectedModal
                    application={selectedRejectedApplication}
                    onClose={() => setEmailRejectedModalOpen(false)}
                />
            )}
            {editModalOpen && (
                <AdminDigiBridgeMentorEditModal
                    mentor={selectedMentor}
                    onClose={() => setEditModalOpen(false)}
                    onSave={(updated) => {
                        setEditModalOpen(false);
                        // fetchMentors();
                        toast.success(t('AdminDigiBridgeMentors.EditModal.successMessage'));
                    }}
                />
            )}

            {/* {emailModalOpen && (
        <AdminDigiBridgeSendEmailModal
          mentor={selectedMentor}
          onClose={() => setEmailModalOpen(false)}
          onSend={async (emailData) => {
            await sendPersonalEmail(emailData);
            setEmailModalOpen(false);
          }}
        />
      )} */}

        </div>
    );
};