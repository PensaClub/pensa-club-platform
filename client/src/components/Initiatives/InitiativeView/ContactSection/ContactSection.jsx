import React from 'react';
import './contactSection.css';
import { useTranslation } from 'react-i18next';

export const ContactSection = ({ contact, additionalContacts  }) => {
  const { t } = useTranslation();
console.log('Contact:', contact);
console.log('Additional contacts:', additionalContacts);
  if (!contact) {
    return null;
  }

  return (
    <section id="contact" className="contact-section">
      <h2 className="section-title">
        {t('initiatives.view.contactPerson', 'Контактно лице')}
      </h2>
      
      {/* Main Contact */}
      <div className="main-contact-card">
        <div className="contact-image-section">
          {contact.image ? (
            <img 
              src={contact.image} 
              alt={contact.name}
              className="contact-photo"
            />
          ) : (
            <div className="contact-avatar">
              {contact.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="contact-info-section">
          <h3 className="contact-name">{contact.name}</h3>
          <p className="contact-position">{contact.position}</p>
          
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-label">
                {t('initiatives.view.phone', 'Телефон')}
              </span>
              <a href={`tel:${contact.phone}`} className="contact-value">
                {contact.phone}
              </a>
            </div>
            
            <div className="contact-item">
              <span className="contact-label">
                {t('initiatives.view.email', 'Имейл')}
              </span>
              <a href={`mailto:${contact.email}`} className="contact-value">
                {contact.email}
              </a>
            </div>
          </div>
          
          <a 
            href={`mailto:${contact.email}`}
            className="email-contact-btn"
          >
            <span className="email-icon">✉️</span>
            {t('initiatives.view.emailTo', 'e-mail to')} {contact.name.split(' ')[0]}
          </a>
        </div>
      </div>
      
      {/* Additional Contacts */}
      {additionalContacts && additionalContacts.length > 0 && (
        <div className="additional-contacts-section">
          <h4 className="additional-title">
            {t('initiatives.view.additionalContacts', 'Допълнителни контакти')}
          </h4>
          
          <div className="additional-contacts-grid">
            {additionalContacts.map((additionalContact, index) => (
              <div key={index} className="additional-contact-card">
                <div className="additional-contact-avatar">
                  {additionalContact.name.charAt(0)}
                </div>
                
                <div className="additional-contact-info">
                  <h5 className="additional-contact-name">{additionalContact.name}</h5>
                  
                  <div className="additional-contact-details">
                    <a href={`tel:${additionalContact.phone}`} className="additional-contact-item">
                      <span className="contact-icon">📞</span>
                      {additionalContact.phone}
                    </a>
                    
                    <a href={`mailto:${additionalContact.email}`} className="additional-contact-item">
                      <span className="contact-icon">✉️</span>
                      {additionalContact.email}
                    </a>
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