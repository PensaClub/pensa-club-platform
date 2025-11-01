// src/components/AdminDigiBridgeMentorApplications/AdminDigiBridgeMentorApplications.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './adminDigiBridgeMentorApplications.css';
import { useAcademy } from '../contexts/AcademyProvider';
import { ApplicationsStats } from './ApplicationsStats/ApplicationsStats';
import { ApplicationsFilters } from './ApplicationsFilters/ApplicationsFilters';
import { AdminDigiBridgeApplicationCard } from './AdminDigiBridgeApplicationCard/AdminDigiBridgeApplicationCard';
import { AdminDigiBridgeApplicationDetailModal } from './AdminDigiBridgeApplicationDetailModal/AdminDigiBridgeApplicationDetailModal';
import { AdminDigiBridgeSendEmailToApplicantModal } from './AdminDigiBridgeSendEmailToApplicantModal/AdminDigiBridgeSendEmailToApplicantModal';

export const AdminDigiBridgeMentorApplications = () => {
    const { t } = useTranslation();
    const {
        sendPersonalEmail,
        approveMentor,
        rejectMentorApplication,
        getPendingMentorApplications, // ✅ От AcademyProvider
    } = useAcademy();

    // STATE
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // MODALS
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);

    // FILTERS
    const [filters, setFilters] = useState({
        search: '',
        specialization: 'all',
        sortBy: 'newest'
    });

    // ===================================
    // EFFECTS
    // ===================================

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, applications]);

    // ===================================
    // FETCH APPLICATIONS
    // ===================================

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const data = await getPendingMentorApplications();
            
            console.log('📥 Pending Applications:', data);
            
            setApplications(data);
            setFilteredApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Грешка при зареждане на кандидатури');
        } finally {
            setIsLoading(false);
        }
    };

    // ===================================
    // FILTER LOGIC
    // ===================================

    const applyFilters = () => {
        let filtered = [...applications];

        // Search
        if (filters.search) {
            filtered = filtered.filter(app =>
                app.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                app.email.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Specialization
        if (filters.specialization !== 'all') {
            filtered = filtered.filter(app => app.specialization === filters.specialization);
        }

        // Sort
        switch (filters.sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        setFilteredApplications(filtered);
    };

    // ===================================
    // HANDLERS
    // ===================================

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setDetailModalOpen(true);
    };

    const handleSendEmail = (application) => {
        setSelectedApplication(application);
        setEmailModalOpen(true);
    };

    const handleApprove = async (applicationId, additionalNotes = '') => {
        try {
            setIsLoading(true);
            
            console.log('🎯 Approving application:', applicationId);
            
            await approveMentor(applicationId);

            // Премахва от списъка
            setApplications(prev => prev.filter(app => app.id !== applicationId));

            toast.success('Кандидатурата беше одобрена успешно!');
            setDetailModalOpen(false);
            
            // Refresh списъка
            await fetchApplications();
        } catch (error) {
            console.error('Error approving application:', error);
            toast.error('Грешка при одобряване на кандидатура');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (applicationId, rejectionReason) => {
        try {
            setIsLoading(true);
            
            console.log('❌ Rejecting application:', applicationId, rejectionReason);
            
            await rejectMentorApplication(applicationId, rejectionReason);

            // Премахва от списъка
            setApplications(prev => prev.filter(app => app.id !== applicationId));

            toast.success('Кандидатурата беше отхвърлена');
            setDetailModalOpen(false);
            
            // Refresh списъка
            await fetchApplications();
        } catch (error) {
            console.error('Error rejecting application:', error);
            toast.error('Грешка при отхвърляне на кандидатура');
        } finally {
            setIsLoading(false);
        }
    };

    // ===================================
    // STATS
    // ===================================

    const stats = {
        totalApplications: applications.length,
        newToday: applications.filter(app => {
            const today = new Date().toDateString();
            return new Date(app.createdAt).toDateString() === today;
        }).length,
        pending: applications.filter(app => app.status === 'pending').length
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="admin-digibridge-mentor-applications">
            {/* HERO SECTION */}
            <div className="admin-digibridge-mentor-applications-hero">
                <div className="admin-digibridge-mentor-applications-hero-content">
                    <h1>{t('AdminDigiBridgeMentorApplications.title') || 'Кандидатури за ментори'}</h1>
                    <p>{t('AdminDigiBridgeMentorApplications.description') || 'Преглед и управление на заявки за менторство'}</p>
                </div>
            </div>

            {/* STATS */}
            <ApplicationsStats stats={stats} />

            {/* FILTERS */}
            <ApplicationsFilters
                filters={filters}
                onFilterChange={(newFilters) => setFilters(newFilters)}
            />

            {/* APPLICATIONS LIST */}
            <div className="admin-digibridge-mentor-applications-list">
                {isLoading ? (
                    <div className="admin-digibridge-mentor-applications-loading">
                        <div className="admin-digibridge-mentor-applications-spinner"></div>
                        <p>{t('AdminDigiBridgeMentorApplications.loading') || 'Зареждане...'}</p>
                    </div>
                ) : filteredApplications.length > 0 ? (
                    <div className="admin-digibridge-mentor-applications-grid">
                        {filteredApplications.map(application => (
                            <AdminDigiBridgeApplicationCard
                                key={application.id}
                                application={application}
                                onViewDetails={handleViewDetails}
                                onSendEmail={handleSendEmail}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="admin-digibridge-mentor-applications-empty">
                        <div className="admin-digibridge-mentor-applications-empty-icon">📭</div>
                        <h3>{t('AdminDigiBridgeMentorApplications.noApplications') || 'Няма кандидатури'}</h3>
                        <p>{t('AdminDigiBridgeMentorApplications.noApplicationsDescription') || 'Все още няма постъпили заявки за менторство'}</p>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {detailModalOpen && selectedApplication && (
                <AdminDigiBridgeApplicationDetailModal
                    application={selectedApplication}
                    onClose={() => setDetailModalOpen(false)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onSendEmail={() => {
                        setDetailModalOpen(false);
                        setEmailModalOpen(true);
                    }}
                />
            )}

            {emailModalOpen && selectedApplication && (
                <AdminDigiBridgeSendEmailToApplicantModal
                    application={selectedApplication}
                    onClose={() => setEmailModalOpen(false)}
                />
            )}
        </div>
    );
};
