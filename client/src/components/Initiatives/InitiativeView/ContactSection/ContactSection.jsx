import React from 'react';
import './contactSection.css';
import { useTranslation } from 'react-i18next';

export const ContactSection = ({ contact, additionalContacts, openEmailModal }) => {
  const { t } = useTranslation();
  
  const getFirstChar = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const getFirstName = (name) => {
    if (!name || typeof name !== 'string') return 'N/A';
    return name.trim().split(' ')[0];
  };

  const isValid = (value) => {
    return value && typeof value === 'string' && value.trim().length > 0;
  };
  
  if (!contact) {
    return null;
  }

  return (
    <section id="contact" className="contact-section-initiatives">
      <h2 className="section-title">
        {t('initiatives.view.contactPerson')}
      </h2>
      
      {/* Main Contact */}
      <div className="main-contact-card-initiatives">
        <div className="contact-image-section-initiatives">
          {contact.image ? (
            <img 
              src={contact.image} 
              alt={contact.name || 'Contact'}
              className="contact-photo-initiatives"
            />
          ) : (
            <div className="contact-avatar-initiatives">
              {getFirstChar(contact.name)}
            </div>
          )}
        </div>
        
        <div className="contact-info-section-initiatives">
          <h3 className="contact-name-initiatives">
            {contact.name || 'Няма име'}
          </h3>
          
          {/* Position and Role */}
          <div className="contact-roles-initiatives">
            {isValid(contact.position) && (
              <p className="contact-position-initiatives">
                {contact.position}
              </p>
            )}
            {isValid(contact.role) && (
              <p className="contact-role-initiatives">
                <span className="role-label">Роля:</span> {contact.role}
              </p>
            )}
          </div>
          
          <div className="contact-details-initiatives">
            {isValid(contact.phone) && (
              <div className="contact-item-initiatives">
                <span className="contact-label-initiatives">
                  {t('initiatives.view.phone')}
                </span>
                <a href={`tel:${contact.phone}`} className="contact-value-initiatives">
                  {contact.phone}
                </a>
              </div>
            )}
            
            {isValid(contact.email) && (
              <div className="contact-item-initiatives">
                <span className="contact-label-initiatives">
                  {t('initiatives.view.email')}
                </span>
                {openEmailModal ? (
                  <button
                    onClick={() => openEmailModal(contact.name, contact.email)}
                    className="contact-value-initiatives contact-email-button"
                  >
                    {contact.email}
                  </button>
                ) : (
                  <a href={`mailto:${contact.email}`} className="contact-value-initiatives">
                    {contact.email}
                  </a>
                )}
              </div>
            )}
          </div>
          
          {isValid(contact.email) && openEmailModal && (
            <button 
              onClick={() => openEmailModal(contact.name, contact.email)}
              className="email-contact-btn-initiatives"
            >
              <span className="email-icon-initiatives">✉️</span>
              {t('initiatives.view.emailTo')} {getFirstName(contact.name)}
            </button>
          )}
          {isValid(contact.email) && !openEmailModal && (
            <a 
              href={`mailto:${contact.email}`}
              className="email-contact-btn-initiatives"
            >
              <span className="email-icon-initiatives">✉️</span>
              {t('initiatives.view.emailTo')} {getFirstName(contact.name)}
            </a>
          )}
        </div>
      </div>
      
      {/* Additional Contacts */}
      {additionalContacts && additionalContacts.length > 0 && (
        <div className="additional-contacts-section-initiatives">
          <h4 className="additional-title-initiatives">
            {t('initiatives.view.additionalContacts')}
          </h4>
          
          <div className="additional-contacts-grid-initiatives">
            {additionalContacts
              .filter(additionalContact => additionalContact && (isValid(additionalContact.name) || isValid(additionalContact.email)))
              .map((additionalContact, index) => (
              <div 
                key={`additional-contact-${additionalContact.email || index}-${index}`} 
                className="additional-contact-card-initiatives"
              >
                {/* Image or Avatar */}
                <div className="additional-contact-image-section">
                  {additionalContact.image ? (
                    <img 
                      src={additionalContact.image} 
                      alt={additionalContact.name || 'Contact'}
                      className="additional-contact-photo-initiatives"
                    />
                  ) : (
                    <div className="additional-contact-avatar-initiatives">
                      {getFirstChar(additionalContact.name)}
                    </div>
                  )}
                </div>
                
                <div className="additional-contact-info-initiatives">
                  <h5 className="additional-contact-name-initiatives">
                    {additionalContact.name || 'Няма име'}
                  </h5>
                  
                  {/* Position and Role */}
                  {(isValid(additionalContact.position) || isValid(additionalContact.role)) && (
                    <div className="additional-contact-roles">
                      {isValid(additionalContact.position) && (
                        <p className="additional-contact-position">
                          {additionalContact.position}
                        </p>
                      )}
                      {isValid(additionalContact.role) && (
                        <p className="additional-contact-role">
                          <span className="role-label">Роля:</span> {additionalContact.role}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="additional-contact-details-initiatives">
                    {isValid(additionalContact.phone) && (
                      <a href={`tel:${additionalContact.phone}`} className="additional-contact-item-initiatives">
                        <span className="contact-icon-initiatives">📞</span>
                        {additionalContact.phone}
                      </a>
                    )}
                    
                    {isValid(additionalContact.email) && (
                      <>
                        {openEmailModal ? (
                          <button
                            onClick={() => openEmailModal(additionalContact.name, additionalContact.email)}
                            className="additional-contact-item-initiatives contact-email-button"
                          >
                            <span className="contact-icon-initiatives">✉️</span>
                            {additionalContact.email}
                          </button>
                        ) : (
                          <a href={`mailto:${additionalContact.email}`} className="additional-contact-item-initiatives">
                            <span className="contact-icon-initiatives">✉️</span>
                            {additionalContact.email}
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};