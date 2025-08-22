import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faEnvelope,
  faGlobe,
  faMapMarkerAlt,
  faClock,
  faPlus,
  faMinus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faInfoCircle,
  faUser,
  faUserTie,
  faCalendarAlt,
  faQrcode,
  faExternalLinkAlt,
  faCopy,
  faShareAlt,

} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF,
  faTwitter as faTwitterBrand,
  faInstagram as faInstagramBrand,
  faYoutube as faYoutubeBrand,
  faLinkedinIn,
  faTelegramPlane,
  faWhatsapp as faWhatsappBrand,
  faViber as faViberBrand,
  faSkype as faSkypeBrand
} from '@fortawesome/free-brands-svg-icons';
import './contactsManager.css';

const ContactsManager = ({ 
  contactsData, 
  onContactsChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [activeSection, setActiveSection] = useState('basic');
  const [newContactPerson, setNewContactPerson] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    description: ''
  });
  const [editingPerson, setEditingPerson] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);

  // Contact sections
  const contactSections = [
    { id: 'basic', label: t('clubForm.contacts.sections.basic'), icon: faPhone },
    { id: 'social', label: t('clubForm.contacts.sections.social'), icon: faShareAlt },
    { id: 'address', label: t('clubForm.contacts.sections.address'), icon: faMapMarkerAlt },
    { id: 'hours', label: t('clubForm.contacts.sections.hours'), icon: faClock },
    { id: 'people', label: t('clubForm.contacts.sections.people'), icon: faUser }
  ];

  // Social media platforms
  const socialPlatforms = [
    { id: 'facebook', label: 'Facebook', icon: faFacebookF, color: '#1877f2', placeholder: 'https://facebook.com/yourclub' },
    { id: 'instagram', label: 'Instagram', icon: faInstagramBrand, color: '#e4405f', placeholder: 'https://instagram.com/yourclub' },
    { id: 'youtube', label: 'YouTube', icon: faYoutubeBrand, color: '#ff0000', placeholder: 'https://youtube.com/c/yourclub' },
    { id: 'twitter', label: 'Twitter/X', icon: faTwitterBrand, color: '#1da1f2', placeholder: 'https://twitter.com/yourclub' },
    { id: 'linkedin', label: 'LinkedIn', icon: faLinkedinIn, color: '#0077b5', placeholder: 'https://linkedin.com/company/yourclub' },
    { id: 'telegram', label: 'Telegram', icon: faTelegramPlane, color: '#0088cc', placeholder: 'https://t.me/yourclub' },
    { id: 'whatsapp', label: 'WhatsApp', icon: faWhatsappBrand, color: '#25d366', placeholder: '+359888123456' },
    { id: 'viber', label: 'Viber', icon: faViberBrand, color: '#665cac', placeholder: '+359888123456' },
    { id: 'skype', label: 'Skype', icon: faSkypeBrand, color: '#00aff0', placeholder: 'yourclub.skype' }
  ];

  // Days of week for working hours
  const daysOfWeek = [
    { id: 'monday', label: t('clubForm.contacts.days.monday'), short: 'Пн' },
    { id: 'tuesday', label: t('clubForm.contacts.days.tuesday'), short: 'Вт' },
    { id: 'wednesday', label: t('clubForm.contacts.days.wednesday'), short: 'Ср' },
    { id: 'thursday', label: t('clubForm.contacts.days.thursday'), short: 'Чт' },
    { id: 'friday', label: t('clubForm.contacts.days.friday'), short: 'Пт' },
    { id: 'saturday', label: t('clubForm.contacts.days.saturday'), short: 'Сб' },
    { id: 'sunday', label: t('clubForm.contacts.days.sunday'), short: 'Нд' }
  ];

  // Handle field changes
  const handleFieldChange = (field, value) => {
    const updatedContacts = { ...contactsData };
    
    if (field.includes('.')) {
      const keys = field.split('.');
      let current = updatedContacts;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedContacts[field] = value;
    }
    
    onContactsChange(updatedContacts);
  };

  // Handle working hours change
  const handleWorkingHoursChange = (day, field, value) => {
    const updatedHours = { ...contactsData.workingHours?.days || {} };
    if (!updatedHours[day]) {
      updatedHours[day] = { enabled: false, open: '09:00', close: '17:00' };
    }
    updatedHours[day][field] = value;
    handleFieldChange('workingHours.days', updatedHours);
  };

  // Add contact person
  const addContactPerson = () => {
    if (!newContactPerson.name.trim() || !newContactPerson.role.trim()) return;
    
    const people = [...(contactsData.people || [])];
    people.push({ ...newContactPerson, id: Date.now() });
    
    handleFieldChange('people', people);
    setNewContactPerson({
      name: '',
      role: '',
      phone: '',
      email: '',
      description: ''
    });
  };

  // Remove contact person
  const removeContactPerson = (personId) => {
    const people = (contactsData.people || []).filter(person => person.id !== personId);
    handleFieldChange('people', people);
  };

  // Update contact person
  const updateContactPerson = (personId, updates) => {
    const people = (contactsData.people || []).map(person =>
      person.id === personId ? { ...person, ...updates } : person
    );
    handleFieldChange('people', people);
  };

  // Generate QR code data
  const generateQrCodeData = () => {
    const data = [];
    if (contactsData.basic?.phone) data.push(`Tel: ${contactsData.basic.phone}`);
    if (contactsData.basic?.email) data.push(`Email: ${contactsData.basic.email}`);
    if (contactsData.basic?.website) data.push(`Web: ${contactsData.basic.website}`);
    return data.join('\n');
  };

  // Copy contact info to clipboard
  const copyContactInfo = () => {
    const info = [];
    if (contactsData.basic?.phone) info.push(`📞 ${contactsData.basic.phone}`);
    if (contactsData.basic?.email) info.push(`📧 ${contactsData.basic.email}`);
    if (contactsData.basic?.website) info.push(`🌐 ${contactsData.basic.website}`);
    
    navigator.clipboard.writeText(info.join('\n'));
  };

  // Render basic contacts section
  const renderBasicSection = () => (
    <div className="contacts-manager-section-content">
      <div className="contacts-manager-form-grid">
        
        {/* Phone */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            <FontAwesomeIcon icon={faPhone} />
            {t('clubForm.contacts.fields.phone')}
          </label>
          <input
            type="tel"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.phone')}
            value={contactsData?.basic?.phone || ''}
            onChange={(e) => handleFieldChange('basic.phone', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Email */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            <FontAwesomeIcon icon={faEnvelope} />
            {t('clubForm.contacts.fields.email')}
          </label>
          <input
            type="email"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.email')}
            value={contactsData?.basic?.email || ''}
            onChange={(e) => handleFieldChange('basic.email', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Website */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            <FontAwesomeIcon icon={faGlobe} />
            {t('clubForm.contacts.fields.website')}
          </label>
          <input
            type="url"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.website')}
            value={contactsData?.basic?.website || ''}
            onChange={(e) => handleFieldChange('basic.website', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Secondary Phone */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            <FontAwesomeIcon icon={faPhone} />
            {t('clubForm.contacts.fields.secondaryPhone')}
          </label>
          <input
            type="tel"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.secondaryPhone')}
            value={contactsData?.basic?.secondaryPhone || ''}
            onChange={(e) => handleFieldChange('basic.secondaryPhone', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Fax */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            <FontAwesomeIcon icon={faPhone} />
            {t('clubForm.contacts.fields.fax')}
          </label>
          <input
            type="tel"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.fax')}
            value={contactsData?.basic?.fax || ''}
            onChange={(e) => handleFieldChange('basic.fax', e.target.value)}
            disabled={disabled}
          />
        </div>

      </div>

      {/* Contact Actions */}
      <div className="contacts-manager-actions">
        <button
          type="button"
          className="contacts-manager-action-btn copy"
          onClick={copyContactInfo}
          title={t('clubForm.contacts.actions.copyInfo')}
        >
          <FontAwesomeIcon icon={faCopy} />
          {t('clubForm.contacts.actions.copyInfo')}
        </button>
        
        <button
          type="button"
          className="contacts-manager-action-btn qr"
          onClick={() => setShowQrCode(!showQrCode)}
          title={t('clubForm.contacts.actions.showQr')}
        >
          <FontAwesomeIcon icon={faQrcode} />
          {t('clubForm.contacts.actions.showQr')}
        </button>
      </div>

      {/* QR Code */}
      {showQrCode && (
        <div className="contacts-manager-qr-section">
          <h5>{t('clubForm.contacts.qr.title')}</h5>
          <p>{t('clubForm.contacts.qr.description')}</p>
          <div className="contacts-manager-qr-placeholder">
            <FontAwesomeIcon icon={faQrcode} />
            <span>{t('clubForm.contacts.qr.placeholder')}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Render social media section
  const renderSocialSection = () => (
    <div className="contacts-manager-section-content">
      <div className="contacts-manager-social-grid">
        {socialPlatforms.map(platform => (
          <div key={platform.id} className="contacts-manager-social-item">
            <div className="contacts-manager-social-header">
              <div 
                className="contacts-manager-social-icon"
                style={{ backgroundColor: platform.color }}
              >
                <FontAwesomeIcon icon={platform.icon} />
              </div>
              <label className="contacts-manager-social-label">
                {platform.label}
              </label>
            </div>
            
            <input
              type="text"
              className="contacts-manager-form-input"
              placeholder={platform.placeholder}
              value={contactsData?.social?.[platform.id] || ''}
              onChange={(e) => handleFieldChange(`social.${platform.id}`, e.target.value)}
              disabled={disabled}
            />
            
            {contactsData?.social?.[platform.id] && (
              
               <a href={contactsData.social[platform.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="contacts-manager-social-link"
                title={t('clubForm.contacts.actions.openLink')}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render address section
  const renderAddressSection = () => (
    <div className="contacts-manager-section-content">
      <div className="contacts-manager-address-note">
        <FontAwesomeIcon icon={faInfoCircle} />
        <span>{t('clubForm.contacts.address.note')}</span>
      </div>
      
      <div className="contacts-manager-form-grid">
        
        {/* Street Address */}
        <div className="contacts-manager-form-group full-width">
          <label className="contacts-manager-form-label">
            {t('clubForm.contacts.fields.street')}
          </label>
          <input
            type="text"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.street')}
            value={contactsData?.address?.street || ''}
            onChange={(e) => handleFieldChange('address.street', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* City */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            {t('clubForm.contacts.fields.city')}
          </label>
          <input
            type="text"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.city')}
            value={contactsData?.address?.city || ''}
            onChange={(e) => handleFieldChange('address.city', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Postal Code */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            {t('clubForm.contacts.fields.postalCode')}
          </label>
          <input
            type="text"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.postalCode')}
            value={contactsData?.address?.postalCode || ''}
            onChange={(e) => handleFieldChange('address.postalCode', e.target.value)}
            disabled={disabled}
            maxLength={4}
          />
        </div>

        {/* Country */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            {t('clubForm.contacts.fields.country')}
          </label>
          <input
            type="text"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.country')}
            value={contactsData?.address?.country || 'България'}
            onChange={(e) => handleFieldChange('address.country', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* PO Box */}
        <div className="contacts-manager-form-group">
          <label className="contacts-manager-form-label">
            {t('clubForm.contacts.fields.poBox')}
          </label>
          <input
            type="text"
            className="contacts-manager-form-input"
            placeholder={t('clubForm.contacts.placeholders.poBox')}
            value={contactsData?.address?.poBox || ''}
            onChange={(e) => handleFieldChange('address.poBox', e.target.value)}
            disabled={disabled}
          />
        </div>

      </div>
    </div>
  );

  // Render working hours section
  const renderHoursSection = () => (
    <div className="contacts-manager-section-content">
      <div className="contacts-manager-hours-grid">
        {daysOfWeek.map(day => {
          const dayData = contactsData?.workingHours?.days?.[day.id] || { enabled: false, open: '09:00', close: '17:00' };
          
          return (
            <div key={day.id} className="contacts-manager-hours-item">
              <div className="contacts-manager-hours-header">
                <label className="contacts-manager-checkbox-label">
                  <input
                    type="checkbox"
                    checked={dayData.enabled}
                    onChange={(e) => handleWorkingHoursChange(day.id, 'enabled', e.target.checked)}
                    disabled={disabled}
                  />
                  <span className="contacts-manager-checkbox"></span>
                  <span className="contacts-manager-day-label">{day.label}</span>
                </label>
              </div>
              
              {dayData.enabled && (
                <div className="contacts-manager-hours-times">
                  <input
                    type="time"
                    className="contacts-manager-time-input"
                    value={dayData.open}
                    onChange={(e) => handleWorkingHoursChange(day.id, 'open', e.target.value)}
                    disabled={disabled}
                  />
                  <span className="contacts-manager-time-separator">-</span>
                  <input
                    type="time"
                    className="contacts-manager-time-input"
                    value={dayData.close}
                    onChange={(e) => handleWorkingHoursChange(day.id, 'close', e.target.value)}
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Special Hours */}
      <div className="contacts-manager-special-hours">
        <h5>{t('clubForm.contacts.hours.special')}</h5>
        <textarea
          className="contacts-manager-form-textarea"
          placeholder={t('clubForm.contacts.placeholders.specialHours')}
          value={contactsData?.workingHours?.special || ''}
          onChange={(e) => handleFieldChange('workingHours.special', e.target.value)}
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  );

  // Render contact people section
  const renderPeopleSection = () => (
    <div className="contacts-manager-section-content">
      
      {/* Existing Contact People */}
      {(contactsData?.people?.length > 0) && (
        <div className="contacts-manager-people-list">
          {contactsData.people.map(person => (
            <div key={person.id} className="contacts-manager-person-card">
              <div className="contacts-manager-person-header">
                <div className="contacts-manager-person-icon">
                  <FontAwesomeIcon icon={faUserTie} />
                </div>
                <div className="contacts-manager-person-info">
                  <h6>{person.name}</h6>
                  <span className="contacts-manager-person-role">{person.role}</span>
                </div>
                <button
                  type="button"
                  className="contacts-manager-remove-person-btn"
                  onClick={() => removeContactPerson(person.id)}
                  disabled={disabled}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              
              <div className="contacts-manager-person-details">
                {person.phone && (
                  <div className="contacts-manager-person-contact">
                    <FontAwesomeIcon icon={faPhone} />
                    <span>{person.phone}</span>
                  </div>
                )}
                {person.email && (
                  <div className="contacts-manager-person-contact">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{person.email}</span>
                  </div>
                )}
                {person.description && (
                  <p className="contacts-manager-person-description">
                    {person.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Contact Person */}
      <div className="contacts-manager-add-person">
        <h5>{t('clubForm.contacts.people.addNew')}</h5>
        
        <div className="contacts-manager-add-person-form">
          <div className="contacts-manager-form-row">
            <input
              type="text"
              className="contacts-manager-form-input"
              placeholder={t('clubForm.contacts.placeholders.personName')}
              value={newContactPerson.name}
              onChange={(e) => setNewContactPerson({...newContactPerson, name: e.target.value})}
              disabled={disabled}
            />
            <input
              type="text"
              className="contacts-manager-form-input"
              placeholder={t('clubForm.contacts.placeholders.personRole')}
              value={newContactPerson.role}
              onChange={(e) => setNewContactPerson({...newContactPerson, role: e.target.value})}
              disabled={disabled}
            />
          </div>
          
          <div className="contacts-manager-form-row">
            <input
              type="tel"
              className="contacts-manager-form-input"
              placeholder={t('clubForm.contacts.placeholders.personPhone')}
              value={newContactPerson.phone}
              onChange={(e) => setNewContactPerson({...newContactPerson, phone: e.target.value})}
              disabled={disabled}
            />
            <input
              type="email"
              className="contacts-manager-form-input"
              placeholder={t('clubForm.contacts.placeholders.personEmail')}
              value={newContactPerson.email}
              onChange={(e) => setNewContactPerson({...newContactPerson, email: e.target.value})}
              disabled={disabled}
            />
          </div>
          
          <textarea
            className="contacts-manager-form-textarea"
            placeholder={t('clubForm.contacts.placeholders.personDescription')}
            value={newContactPerson.description}
            onChange={(e) => setNewContactPerson({...newContactPerson, description: e.target.value})}
            disabled={disabled}
            rows={2}
          />
          
          <button
            type="button"
            className="contacts-manager-add-btn"
            onClick={addContactPerson}
            disabled={disabled || !newContactPerson.name.trim() || !newContactPerson.role.trim()}
          >
            <FontAwesomeIcon icon={faPlus} />
            {t('clubForm.contacts.actions.addPerson')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="contacts-manager">
      
      {/* Header */}
      <div className="contacts-manager-header">
        <h3 className="contacts-manager-title">
          <FontAwesomeIcon icon={faPhone} />
          {t('clubForm.contacts.title')}
        </h3>
        <p className="contacts-manager-subtitle">
          {t('clubForm.contacts.subtitle')}
        </p>
      </div>

      {/* Section Navigation */}
      <div className="contacts-manager-nav">
        {contactSections.map(section => (
          <button
            key={section.id}
            className={`contacts-manager-nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={section.icon} />
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="contacts-manager-content">
        
        {/* Basic Contacts */}
        {activeSection === 'basic' && (
          <div className="contacts-manager-section">
            <div className="contacts-manager-section-header">
              <h4>{t('clubForm.contacts.sections.basic')}</h4>
              <p>{t('clubForm.contacts.sections.basicDescription')}</p>
            </div>
            {renderBasicSection()}
          </div>
        )}

        {/* Social Media */}
        {activeSection === 'social' && (
          <div className="contacts-manager-section">
            <div className="contacts-manager-section-header">
              <h4>{t('clubForm.contacts.sections.social')}</h4>
              <p>{t('clubForm.contacts.sections.socialDescription')}</p>
            </div>
            {renderSocialSection()}
          </div>
        )}

        {/* Address */}
        {activeSection === 'address' && (
          <div className="contacts-manager-section">
            <div className="contacts-manager-section-header">
              <h4>{t('clubForm.contacts.sections.address')}</h4>
              <p>{t('clubForm.contacts.sections.addressDescription')}</p>
            </div>
            {renderAddressSection()}
          </div>
        )}

        {/* Working Hours */}
        {activeSection === 'hours' && (
          <div className="contacts-manager-section">
            <div className="contacts-manager-section-header">
              <h4>{t('clubForm.contacts.sections.hours')}</h4>
              <p>{t('clubForm.contacts.sections.hoursDescription')}</p>
            </div>
            {renderHoursSection()}
          </div>
        )}

        {/* Contact People */}
        {activeSection === 'people' && (
          <div className="contacts-manager-section">
            <div className="contacts-manager-section-header">
              <h4>{t('clubForm.contacts.sections.people')}</h4>
              <p>{t('clubForm.contacts.sections.peopleDescription')}</p>
            </div>
            {renderPeopleSection()}
          </div>
        )}

      </div>

      {/* Help Section */}
      <div className="contacts-manager-help">
        <div className="contacts-manager-help-icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="contacts-manager-help-content">
          <h5>{t('clubForm.contacts.help.title')}</h5>
          <p>{t('clubForm.contacts.help.description')}</p>
          <ul>
            <li>{t('clubForm.contacts.help.tip1')}</li>
            <li>{t('clubForm.contacts.help.tip2')}</li>
            <li>{t('clubForm.contacts.help.tip3')}</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default ContactsManager;