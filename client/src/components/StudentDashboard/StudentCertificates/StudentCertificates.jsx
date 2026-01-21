import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Award, Download, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import './studentCertificates.css';

const StudentCertificates = ({ certificates = [], availableCertificates = [] }) => {
    const { t } = useTranslation();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const earnedCertificates = certificates.filter(c => c.issuedAt || c.earnedAt);
    const totalCertificates = [...earnedCertificates, ...availableCertificates];

    if (totalCertificates.length === 0) {
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
                {earnedCertificates.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="scr-card scr-card-earned">
                        <div className="scr-card-badge">
                            <CheckCircle className="scr-badge-icon" />
                        </div>
                        <div className="scr-card-icon">
                            <Award className="scr-icon" />
                        </div>
                        <h4 className="scr-card-title">{cert.title || cert.courseName}</h4>
                        <p className="scr-card-date">
                            {t('studentCertificates.earned')} {formatDate(cert.issuedAt || cert.earnedAt)}
                        </p>
                        {cert.downloadUrl && (
                            <a 
                                href={cert.downloadUrl} 
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
                {availableCertificates.slice(0, 3 - earnedCertificates.length).map((cert) => (
                    <div key={cert.id} className="scr-card scr-card-locked">
                        <div className="scr-card-badge scr-badge-locked">
                            <Lock className="scr-badge-icon" />
                        </div>
                        <div className="scr-card-icon scr-icon-locked">
                            <Award className="scr-icon" />
                        </div>
                        <h4 className="scr-card-title">{cert.title || cert.courseName}</h4>
                        <p className="scr-card-progress">
                            {cert.currentCredits || 0}/{cert.requiredCredits || 100} {t('studentCertificates.credits')}
                        </p>
                        <div className="scr-progress-bar">
                            <div 
                                className="scr-progress-fill"
                                style={{ width: `${((cert.currentCredits || 0) / (cert.requiredCredits || 100)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentCertificates;