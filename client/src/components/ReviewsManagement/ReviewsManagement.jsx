// src/components/ReviewsManagement/ReviewsManagement.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
import { toast } from 'react-toastify';
// import { ReviewsManagementHeader } from './ReviewsManagementHeader/ReviewsManagementHeader';
// import { ReviewsManagementList } from './ReviewsManagementList/ReviewsManagementList';
// import { ReviewDetailsModal } from './ReviewDetailsModal/ReviewDetailsModal';
// import { ReviewActionModal } from './ReviewActionModal/ReviewActionModal';
import './reviewsManagement.css';
import { ReviewsManagementHeader } from './ReviewsManagementHeader/ReviewsManagementHeader';
import { ReviewsManagementList } from './ReviewsManagementList/ReviewsManagementList';
import { ReviewDetailsModal } from './ReviewDetailsModal/ReviewDetailsModal';
import { ReviewActionModal } from './ReviewActionModal/ReviewActionModal';

export const ReviewsManagement = () => {
    const { t } = useTranslation('digibridge');
    const {
        getPendingReviews,
        approveReview,
        rejectReview,
        deleteReview
    } = useAcademy();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all', // all, pending, approved, rejected
        type: 'all',   // all, academy, mentor, course, lecture
        search: ''
    });

    const [selectedReview, setSelectedReview] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // approve, reject, delete
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [filters.status, filters.type]);

    const fetchReviews = async () => {
        try {
            setLoading(true);

            const params = {};
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.type !== 'all') params.reviewType = filters.type;

            const response = await getPendingReviews(params);
            setReviews(response?.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error(t('reviewsManagement.errorFetching'));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setDetailsModalOpen(true);
    };

    const handleOpenActionModal = (review, action) => {
        setSelectedReview(review);
        setActionType(action);
        setActionModalOpen(true);
        setRejectionReason('');
    };

    const handleConfirmAction = async () => {
        if (!selectedReview) return;

        try {
            if (actionType === 'approve') {
                await approveReview(selectedReview.id);
                toast.success(t('reviewsManagement.approveSuccess'));
            } else if (actionType === 'reject') {
                if (!rejectionReason.trim()) {
                    toast.error(t('reviewsManagement.rejectionReasonRequired'));
                    return;
                }
                await rejectReview(selectedReview.id, rejectionReason);
                toast.success(t('reviewsManagement.rejectSuccess'));
            } else if (actionType === 'delete') {
                await deleteReview(selectedReview.id);
                toast.success(t('reviewsManagement.deleteSuccess'));
            }

            setActionModalOpen(false);
            setSelectedReview(null);
            setRejectionReason('');
            fetchReviews();
        } catch (error) {
            console.error('Error performing action:', error);
            toast.error(t('reviewsManagement.actionError'));
        }
    };

    const filteredReviews = reviews.filter(review => {
        const searchLower = filters.search.toLowerCase();
        return (
            review.name.toLowerCase().includes(searchLower) ||
            review.email.toLowerCase().includes(searchLower) ||
            review.text.toLowerCase().includes(searchLower)
        );
    });

    const reviewStats = {
        total: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length
    };

    return (
        <div className="reviews-management-pensa-club">
            <div className="reviews-management-pensa-club-container">

                {/* Header със заглавие */}
                <div className="reviews-management-pensa-club-page-header">
                    <h1 className="reviews-management-pensa-club-title">
                        {t('reviewsManagement.title')}
                    </h1>
                    <p className="reviews-management-pensa-club-subtitle">
                        {t('reviewsManagement.subtitle')}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="reviews-management-pensa-club-stats">
                    <div className="reviews-management-pensa-club-stat-card">
                        <div className="reviews-management-pensa-club-stat-icon reviews-management-pensa-club-stat-icon-all">
                            📊
                        </div>
                        <div className="reviews-management-pensa-club-stat-content">
                            <div className="reviews-management-pensa-club-stat-value">{reviewStats.total}</div>
                            <div className="reviews-management-pensa-club-stat-label">{t('reviewsManagement.allReviews')}</div>
                        </div>
                    </div>

                    <div className="reviews-management-pensa-club-stat-card">
                        <div className="reviews-management-pensa-club-stat-icon reviews-management-pensa-club-stat-icon-pending">
                            ⏳
                        </div>
                        <div className="reviews-management-pensa-club-stat-content">
                            <div className="reviews-management-pensa-club-stat-value">{reviewStats.pending}</div>
                            <div className="reviews-management-pensa-club-stat-label">{t('reviewsManagement.pendingReviews')}</div>
                        </div>
                    </div>

                    <div className="reviews-management-pensa-club-stat-card">
                        <div className="reviews-management-pensa-club-stat-icon reviews-management-pensa-club-stat-icon-approved">
                            ✅
                        </div>
                        <div className="reviews-management-pensa-club-stat-content">
                            <div className="reviews-management-pensa-club-stat-value">{reviewStats.approved}</div>
                            <div className="reviews-management-pensa-club-stat-label">{t('reviewsManagement.approvedReviews')}</div>
                        </div>
                    </div>

                    <div className="reviews-management-pensa-club-stat-card">
                        <div className="reviews-management-pensa-club-stat-icon reviews-management-pensa-club-stat-icon-rejected">
                            ❌
                        </div>
                        <div className="reviews-management-pensa-club-stat-content">
                            <div className="reviews-management-pensa-club-stat-value">{reviewStats.rejected}</div>
                            <div className="reviews-management-pensa-club-stat-label">{t('reviewsManagement.rejectedReviews')}</div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <ReviewsManagementHeader
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* Reviews List */}
                <ReviewsManagementList
                    reviews={filteredReviews}
                    loading={loading}
                    onViewReview={handleViewReview}
                    onApprove={(review) => handleOpenActionModal(review, 'approve')}
                    onReject={(review) => handleOpenActionModal(review, 'reject')}
                    onDelete={(review) => handleOpenActionModal(review, 'delete')}
                />

                {/* Modals */}
                <ReviewDetailsModal
                    review={selectedReview}
                    isOpen={detailsModalOpen}
                    onClose={() => {
                        setDetailsModalOpen(false);
                        setSelectedReview(null);
                    }}
                    onApprove={() => {
                        setDetailsModalOpen(false);
                        handleOpenActionModal(selectedReview, 'approve');
                    }}
                    onReject={() => {
                        setDetailsModalOpen(false);
                        handleOpenActionModal(selectedReview, 'reject');
                    }}
                    onDelete={(review) => handleOpenActionModal(review, 'delete')}
                />

                {actionModalOpen && selectedReview && (
                    <ReviewActionModal
                        review={selectedReview}
                        actionType={actionType}
                        rejectionReason={rejectionReason}
                        onReasonChange={setRejectionReason}
                        onConfirm={handleConfirmAction}
                        onCancel={() => {
                            setActionModalOpen(false);
                            setSelectedReview(null);
                            setRejectionReason('');
                        }}
                        isOpen={actionModalOpen}  
                    />
                )}

            </div>
        </div>
    );
};