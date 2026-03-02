
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faAddressCard, faUser, faEnvelope, faPhone, faBriefcase,
    faUpload, faTimes, faImage, faInfoCircle, faEdit,
    faUserCircle, faSpinner, faCamera
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './contactSection.css';

const ContactSection = ({
    values,
    errors,
    onChangeHandler,
    onBlurHandler,
    setValues,
    handleContactImageUpload,
    removeContactImage
}) => {
    const { t } = useTranslation('content');
    const contactImageInputRef = useRef(null);

    // Handle contact image upload
    const handleContactImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        await handleContactImageUpload(file);
        e.target.value = '';
    };

    // Handle drag over
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Handle drop
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                await handleContactImageUpload(file);
            }
        }
    };

    return (
        <div className="project-contact-section-card">
            <div className="project-contact-section-header">
                <h2 className="project-contact-section-title">
                    <FontAwesomeIcon icon={faAddressCard} />
                    {t('projects.create.contact')}
                </h2>
            </div>

            <div className="project-form-section-content">
                <div className="project-contact-help">
                    <p>{t('projects.create.contact-help')}</p>
                </div>

                <div className="project-contact-content">
                    {/* Contact Image Upload */}
                    <div className="project-contact-image-section">
                        <label className="project-contact-image-label">
                            <FontAwesomeIcon icon={faCamera} />
                            {t('projects.create.contactImage')}
                        </label>
                        
                        <div className="project-contact-image-container">
                            <div className="project-contact-image-preview">
                                {values.contact?.image ? (
                                    <div className="project-contact-image-wrapper">
                                        <img 
                                            src={values.contact.image} 
                                            alt="Contact person" 
                                            className="project-contact-image"
                                        />
                                        <div className="project-contact-image-overlay">
                                            <button
                                                type="button"
                                                className="project-contact-image-btn remove"
                                                onClick={removeContactImage}
                                                title={t('projects.create.removeImage')}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="project-contact-image-placeholder"
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onClick={() => contactImageInputRef.current?.click()}
                                    >
                                        <FontAwesomeIcon icon={faUserCircle} />
                                        <span>{t('projects.create.contactImagePlaceholder')}</span>
                                        <small>{t('projects.create.dragDropImage')}</small>
                                    </div>
                                )}
                            </div>
                            
                            <input
                                ref={contactImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleContactImageChange}
                                style={{ display: 'none' }}
                            />
                            
                            <div className="project-contact-image-actions">
                                <button
                                    type="button"
                                    className="project-contact-form-btn primary"
                                    onClick={() => contactImageInputRef.current?.click()}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    {values.contact?.image ? t('projects.create.changeImage') : t('projects.create.uploadImage')}
                                </button>
                            </div>
                        </div>
                        
                        <div className="project-contact-image-help">
                            <p>{t('projects.create.contact-image-help')}</p>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="project-contact-info-section">
                        <h3 className="project-contact-info-title">
                            <FontAwesomeIcon icon={faUser} />
                            {t('projects.create.contactInformation')}
                        </h3>

                        <div className="project-contact-form-grid">
                            {/* Name */}
                            <div className="project-contact-form-group">
                                <label htmlFor="contact.name">
                                    <FontAwesomeIcon icon={faUser} />
                                    {t('projects.create.contactName')}
                                    <span className="project-contact-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="contact.name"
                                    name="contact.name"
                                    value={values.contact?.name || ''}
                                    onChange={onChangeHandler}
                                    onBlur={onBlurHandler}
                                    className={errors['contact.name'] ? 'error' : ''}
                                    placeholder={t('projects.create.contactNamePlaceholder')}
                                />
                                {errors['contact.name'] && (
                                    <div className="project-contact-error-message">
                                        {errors['contact.name']}
                                    </div>
                                )}
                            </div>

                            {/* Role */}
                            <div className="project-contact-form-group">
                                <label htmlFor="contact.role">
                                    <FontAwesomeIcon icon={faBriefcase} />
                                    {t('projects.create.contactRole')}
                                </label>
                                <input
                                    type="text"
                                    id="contact.role"
                                    name="contact.role"
                                    value={values.contact?.role || ''}
                                    onChange={onChangeHandler}
                                    onBlur={onBlurHandler}
                                    className={errors['contact.role'] ? 'error' : ''}
                                    placeholder={t('projects.create.contactRolePlaceholder')}
                                />
                                {errors['contact.role'] && (
                                    <div className="project-contact-error-message">
                                        {errors['contact.role']}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="project-contact-form-group">
                                <label htmlFor="contact.email">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    {t('projects.create.contactEmail')}
                                    <span className="project-contact-required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="contact.email"
                                    name="contact.email"
                                    value={values.contact?.email || ''}
                                    onChange={onChangeHandler}
                                    onBlur={onBlurHandler}
                                    className={errors['contact.email'] ? 'error' : ''}
                                    placeholder={t('projects.create.contactEmailPlaceholder')}
                                />
                                {errors['contact.email'] && (
                                    <div className="project-contact-error-message">
                                        {errors['contact.email']}
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="project-contact-form-group">
                                <label htmlFor="contact.phone">
                                    <FontAwesomeIcon icon={faPhone} />
                                    {t('projects.create.contactPhone')}
                                </label>
                                <input
                                    type="tel"
                                    id="contact.phone"
                                    name="contact.phone"
                                    value={values.contact?.phone || ''}
                                    onChange={onChangeHandler}
                                    onBlur={onBlurHandler}
                                    className={errors['contact.phone'] ? 'error' : ''}
                                    placeholder={t('projects.create.contactPhonePlaceholder')}
                                />
                                {errors['contact.phone'] && (
                                    <div className="project-contact-error-message">
                                        {errors['contact.phone']}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="project-contact-form-group project-contact-full-width">
                            <label htmlFor="contact.additionalInfo">
                                <FontAwesomeIcon icon={faInfoCircle} />
                                {t('projects.create.contactAdditionalInfo')}
                            </label>
                            <textarea
                                id="contact.additionalInfo"
                                name="contact.additionalInfo"
                                value={values.contact?.additionalInfo || ''}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors['contact.additionalInfo'] ? 'error' : ''}
                                placeholder={t('projects.create.contactAdditionalInfoPlaceholder')}
                                rows={4}
                            />
                            <div className="project-contact-field-help">
                                {t('projects.create.contact-additional-help')}
                            </div>
                            {errors['contact.additionalInfo'] && (
                                <div className="project-contact-error-message">
                                    {errors['contact.additionalInfo']}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Summary */}
                    {(values.contact?.name || values.contact?.email) && (
                        <div className="project-contact-summary">
                            <h4>
                                <FontAwesomeIcon icon={faAddressCard} />
                                {t('projects.create.contactSummary')}
                            </h4>
                            <div className="project-contact-summary-content">
                                <div className="project-contact-summary-avatar">
                                    {values.contact?.image ? (
                                        <img src={values.contact.image} alt="Contact" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserCircle} />
                                    )}
                                </div>
                                <div className="project-contact-summary-info">
                                    <div className="project-contact-summary-name">
                                        {values.contact?.name || t('projects.create.contactNamePlaceholder')}
                                    </div>
                                    <div className="project-contact-summary-role">
                                        {values.contact?.role || t('projects.create.contactRolePlaceholder')}
                                    </div>
                                    <div className="project-contact-summary-details">
                                        {values.contact?.email && (
                                            <div className="project-contact-summary-item">
                                                <FontAwesomeIcon icon={faEnvelope} />
                                                {values.contact.email}
                                            </div>
                                        )}
                                        {values.contact?.phone && (
                                            <div className="project-contact-summary-item">
                                                <FontAwesomeIcon icon={faPhone} />
                                                {values.contact.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactSection;