import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMapMarkerAlt,
    faPhone,
    faEnvelope,
    faGlobe,
    faClock,
    faUserMd,
    faChevronDown,
    faChevronUp,
    faInfoCircle,
    faIdCard,
} from '@fortawesome/free-solid-svg-icons';
import './telkRegionCard.css';

const TelkRegionCard = ({ region }) => {
    const { t } = useTranslation('telk-rkme-rzi');
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded((prev) => !prev);

    const renderContactField = (icon, label, value, isLink = false, linkType = null) => {
        if (!value) return null;
        return (
            <div className="trc-field">
                <FontAwesomeIcon icon={icon} className="trc-field-icon" />
                <div className="trc-field-content">
                    <span className="trc-field-label">{label}</span>
                    {isLink && linkType === 'email' ? (
                        <a href={`mailto:${value}`} className="trc-field-value trc-link">
                            {value}
                        </a>
                    ) : isLink && linkType === 'website' ? (
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="trc-field-value trc-link"
                        >
                            {value}
                        </a>
                    ) : (
                        <span className="trc-field-value">{value}</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`trc-card ${isExpanded ? 'trc-card--expanded' : ''}`}>
            <div className="trc-header" onClick={toggleExpand}>
                <div className="trc-header-left">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="trc-region-icon" />
                    <h3 className="trc-region-name">{region.region}</h3>
                    <span className="trc-telk-count">
                        {t('page.telkCount', { count: region.telkList.length })}
                    </span>
                </div>
                <FontAwesomeIcon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    className="trc-expand-icon"
                />
            </div>

            <div className={`trc-body ${isExpanded ? 'trc-body--visible' : ''}`}>
                <div className="trc-sections">
                    {/* РЗИ */}
                    <div className="trc-section trc-section--rzi">
                        <div className="trc-section-header">
                            <span className="trc-badge trc-badge--rzi">{t('labels.rziShort')}</span>
                            <span className="trc-section-title">{t('labels.rzi')}</span>
                        </div>
                        <div className="trc-section-body">
                            {renderContactField(faMapMarkerAlt, t('labels.address'), region.rpiData.address)}
                            {renderContactField(faPhone, t('labels.phone'), region.rpiData.phone)}
                            {renderContactField(
                                faEnvelope,
                                t('labels.email'),
                                region.rpiData.email,
                                true,
                                'email'
                            )}
                            {renderContactField(
                                faGlobe,
                                t('labels.website'),
                                region.rpiData.website,
                                true,
                                'website'
                            )}
                        </div>
                    </div>

                    {/* РКМЕ */}
                    <div className="trc-section trc-section--rkme">
                        <div className="trc-section-header">
                            <span className="trc-badge trc-badge--rkme">{t('labels.rkmeShort')}</span>
                            <span className="trc-section-title">{t('labels.rkme')}</span>
                        </div>
                        <div className="trc-section-body">
                            {renderContactField(faMapMarkerAlt, t('labels.address'), region.rkmeData.address)}
                            {renderContactField(faPhone, t('labels.phone'), region.rkmeData.phone)}
                            {renderContactField(
                                faEnvelope,
                                t('labels.email'),
                                region.rkmeData.email,
                                true,
                                'email'
                            )}
                            {renderContactField(faClock, t('labels.workingHours'), region.rkmeData.workingHours)}
                            {region.rkmeData.note &&
                                renderContactField(faInfoCircle, t('labels.note'), region.rkmeData.note)}
                        </div>
                    </div>

                    {/* ТЕЛК */}
                    <div className="trc-section trc-section--telk">
                        <div className="trc-section-header">
                            <span className="trc-badge trc-badge--telk">{t('labels.telkShort')}</span>
                            <span className="trc-section-title">{t('labels.telk')}</span>
                        </div>
                        <div className="trc-section-body">
                            {region.telkList.map((telk, index) => (
                                <div key={index} className="trc-telk-item">
                                    <h4 className="trc-telk-name">
                                        <FontAwesomeIcon icon={faIdCard} className="trc-telk-icon" />
                                        {telk.name}
                                    </h4>
                                    <div className="trc-telk-details">
                                        {renderContactField(faMapMarkerAlt, t('labels.address'), telk.address)}
                                        {renderContactField(faPhone, t('labels.phone'), telk.phone)}
                                        {telk.additionalPhones &&
                                            renderContactField(
                                                faPhone,
                                                t('labels.additionalPhones'),
                                                telk.additionalPhones
                                            )}
                                        {renderContactField(
                                            faEnvelope,
                                            t('labels.email'),
                                            telk.email,
                                            true,
                                            'email'
                                        )}
                                        {renderContactField(faUserMd, t('labels.chairman'), telk.chairman)}
                                        {renderContactField(faClock, t('labels.workingHours'), telk.workingHours)}
                                        {telk.note &&
                                            renderContactField(faInfoCircle, t('labels.note'), telk.note)}
                                        {telk.contacts && (
                                            <div className="trc-field">
                                                <FontAwesomeIcon icon={faPhone} className="trc-field-icon" />
                                                <div className="trc-field-content">
                                                    <span className="trc-field-label">{t('labels.contacts')}</span>
                                                    <ul className="trc-contacts-list">
                                                        {telk.contacts.map((contact, ci) => (
                                                            <li key={ci} className="trc-field-value">
                                                                {contact}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {region.source && (
                    <div className="trc-source">
                        <FontAwesomeIcon icon={faGlobe} className="trc-source-icon" />
                        <span>{t('labels.source')}: </span>
                        <a href={region.source} target="_blank" rel="noopener noreferrer">
                            {region.source}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TelkRegionCard;
