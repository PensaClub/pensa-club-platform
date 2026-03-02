import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { Award, Download, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import './studentCertificates.css';

const StudentCertificates = ({ certificates = [], availableCertificates = [] }) => {
    const { t } = useTranslation('student-dashboard');

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const totalItems = certificates.length + availableCertificates.length;

    if (totalItems === 0) {
        return (
            <div className="scr-container">
                <div className="scr-header">
                    <h3 className="scr-title">
                        <Award className="scr-title-icon" />
                        {t('studentCertificates.title')}
                    </h3>
                </div>
                <div className="scr-empty">
                    <Award className="scr-empty-icon" />
                    <p className="scr-empty-text">{t('studentCertificates.noCertificates')}</p>
                    <Link to="/academy/courses" className="scr-empty-link">
                        {t('studentCertificates.browseCourses')}
                    </Link>
                </div>
            </div>
        );
    }

    // Колко слота остават за available след earned
    const earnedToShow = certificates.slice(0, 3);
    const availableSlots = 3 - earnedToShow.length;
    const availableToShow = availableCertificates.slice(0, availableSlots);

    return (
        <div className="scr-container">
            <div className="scr-header">
                <h3 className="scr-title">
                    <Award className="scr-title-icon" />
                    {t('studentCertificates.title')}
                </h3>
                <Link to="/academy/my/certificates" className="scr-view-all">
                    {t('studentCertificates.viewAll')}
                    <ArrowRight className="scr-view-all-icon" />
                </Link>
            </div>

            <div className="scr-grid">
                {/* Earned Certificates */}
                {earnedToShow.map((cert) => (
                    <div key={cert.id} className="scr-card scr-card-earned">
                        <div className="scr-card-badge">
                            <CheckCircle className="scr-badge-icon" />
                        </div>
                        <div className="scr-card-icon">
                            <Award className="scr-icon" />
                        </div>
                        <h4 className="scr-card-title">
                            {cert.courseTitle || cert.course?.name || t('studentCertificates.certificate')}
                        </h4>
                        <p className="scr-card-date">
                            {t('studentCertificates.earned')} {formatDate(cert.issuedAt)}
                        </p>
                        {cert.pdfUrl && (
                            <a 
                                href={cert.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="scr-card-btn scr-btn-download"
                            >
                                <Download className="scr-btn-icon" />
                                {t('studentCertificates.download')}
                            </a>
                        )}
                    </div>
                ))}

                {/* Available (Locked) Certificates */}
                {availableToShow.map((cert) => {
                    const progress = cert.requiredCredits > 0 
                        ? Math.round((cert.currentCredits / cert.requiredCredits) * 100)
                        : cert.progressPercentage;

                    return (
                        <Link 
                            key={cert.id} 
                            to={`/academy/courses/${cert.courseSlug}`}
                            className="scr-card scr-card-locked"
                        >
                            <div className="scr-card-badge scr-badge-locked">
                                <Lock className="scr-badge-icon" />
                            </div>
                            <div className="scr-card-icon scr-icon-locked">
                                <Award className="scr-icon" />
                            </div>
                            <h4 className="scr-card-title">{cert.courseName}</h4>
                            <p className="scr-card-progress">
                                {cert.currentCredits}/{cert.requiredCredits} {t('studentCertificates.credits')}
                            </p>
                            <div className="scr-progress-bar">
                                <div 
                                    className="scr-progress-fill"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentCertificates;