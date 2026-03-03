import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faFileWord,
    faFilePdf,
    faDownload,
    faPhone,
    faEnvelope,
    faGlobe,
    faMapMarkerAlt,
    faClock,
    faCalendarAlt,
    faInfoCircle,
    faHospital,
} from '@fortawesome/free-solid-svg-icons';
import SEOHead from '../SEO/SEOHead';
import TelkRegionCard from './TelkRegionCard/TelkRegionCard';
import { nelkData, regionsData } from './telkRkmeRziData';
import './telkRkmeRzi.css';

const TelkRkmeRzi = () => {
    const { t } = useTranslation('telk-rkme-rzi');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceTimer = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 400);
    }, []);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const filteredRegions = useMemo(() => {
        if (!debouncedSearch.trim()) return regionsData;
        const term = debouncedSearch.toLowerCase().trim();
        return regionsData.filter((r) => r.region.toLowerCase().includes(term));
    }, [debouncedSearch]);

    const metaData = useMemo(
        () => ({
            title: `${t('page.title')} | Pensa Club`,
            description: t('page.subtitle'),
            keywords:
                'ТЕЛК, РКМЕ, РЗИ, медицински комисии, България, инвалидност, експертиза, здравна инспекция, НЕЛК, пенсионери, Pensa Club',
            image: '/images/rkme.jpeg',
            author: 'Pensa Foundation',
        }),
        [t]
    );

    const structuredData = useMemo(
        () => ({
            '@context': 'https://schema.org',
            '@type': 'GovernmentService',
            name: t('page.title'),
            description: metaData.description,
            url: 'https://pensa.club/telk-rkme-rzi',
            image: 'https://pensa.club/images/rkme.jpeg',
            provider: {
                '@type': 'Organization',
                name: 'Pensa Foundation',
                url: 'https://pensa.club',
            },
            areaServed: {
                '@type': 'Country',
                name: 'Bulgaria',
            },
            serviceType: 'Medical Expertise Commission Directory',
        }),
        [t, metaData.description]
    );

    return (
        <div className="trr-page">
            <SEOHead
                title={metaData.title}
                description={metaData.description}
                keywords={metaData.keywords}
                image={metaData.image}
                type="website"
                author={metaData.author}
                structuredData={structuredData}
            />

            {/* Hero */}
            <section className="trr-hero">
                <div className="trr-hero-bg"></div>
                <div className="trr-hero-content">
                    <div className="trr-hero-icon">
                        <FontAwesomeIcon icon={faHospital} />
                    </div>
                    <h1 className="trr-hero-title">{t('page.title')}</h1>
                    <p className="trr-hero-subtitle">{t('page.subtitle')}</p>
                    <div className="trr-hero-stats">
                        <span className="trr-stat">
                            {t('page.totalRegions', { count: regionsData.length })}
                        </span>
                        <span className="trr-stat-divider">|</span>
                        <span className="trr-stat">{t('page.updatedDate')}</span>
                    </div>

                    {/* Download buttons */}
                    <div className="trr-download-section">
                        <span className="trr-download-label">
                            <FontAwesomeIcon icon={faDownload} /> {t('page.downloadSection')}
                        </span>
                        <div className="trr-download-buttons">
                            <a
                                href="/downloads/telk-rkme-rzi.docx"
                                download
                                className="trr-download-btn trr-download-btn--docx"
                            >
                                <FontAwesomeIcon icon={faFileWord} />
                                {t('page.downloadDocx')}
                            </a>
                            <a
                                href="/downloads/telk-rkme-rzi.pdf"
                                download
                                className="trr-download-btn trr-download-btn--pdf"
                            >
                                <FontAwesomeIcon icon={faFilePdf} />
                                {t('page.downloadPdf')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <div className="trr-container">
                {/* НЕЛК section */}
                <section className="trr-nelk">
                    <h2 className="trr-nelk-title">{t('page.nelkTitle')}</h2>
                    <div className="trr-nelk-card">
                        <div className="trr-nelk-grid">
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.address')}</span>
                                    <span className="trr-nelk-value">{nelkData.address}</span>
                                </div>
                            </div>
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faPhone} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.phone')}</span>
                                    <span className="trr-nelk-value">{nelkData.phone}</span>
                                </div>
                            </div>
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faPhone} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.hotlines')}</span>
                                    <span className="trr-nelk-value">{nelkData.hotlines}</span>
                                </div>
                            </div>
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faPhone} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.consultations')}</span>
                                    <span className="trr-nelk-value">{nelkData.consultations}</span>
                                </div>
                            </div>
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faEnvelope} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.email')}</span>
                                    <a href={`mailto:${nelkData.email}`} className="trr-nelk-value trr-nelk-link">
                                        {nelkData.email}
                                    </a>
                                </div>
                            </div>
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faClock} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.workingHours')}</span>
                                    <span className="trr-nelk-value">{nelkData.workingHours}</span>
                                </div>
                            </div>
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faCalendarAlt} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.receptionDay')}</span>
                                    <span className="trr-nelk-value">{nelkData.receptionDay}</span>
                                </div>
                            </div>
                            <div className="trr-nelk-field">
                                <FontAwesomeIcon icon={faGlobe} className="trr-nelk-icon" />
                                <div>
                                    <span className="trr-nelk-label">{t('labels.website')}</span>
                                    <a
                                        href={nelkData.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="trr-nelk-value trr-nelk-link"
                                    >
                                        {nelkData.website}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search */}
                <section className="trr-search-section">
                    <h2 className="trr-regions-title">{t('page.regionsTitle')}</h2>
                    <div className="trr-search-wrapper">
                        <FontAwesomeIcon icon={faSearch} className="trr-search-icon" />
                        <input
                            type="text"
                            className="trr-search-input"
                            placeholder={t('page.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </section>

                {/* Regions list */}
                <section className="trr-regions">
                    {filteredRegions.length > 0 ? (
                        filteredRegions.map((region) => (
                            <TelkRegionCard key={region.id} region={region} />
                        ))
                    ) : (
                        <div className="trr-no-results">
                            <FontAwesomeIcon icon={faInfoCircle} className="trr-no-results-icon" />
                            <p>{t('page.noResults')}</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default TelkRkmeRzi;
