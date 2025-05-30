import React from 'react';
import './contactSection.css';
import { useTranslation } from 'react-i18next';

export const ContactSection = ({ contact, additionalContacts }) => {
  const { t } = useTranslation();
  
  console.log('Contact:', contact);
  console.log('Additional contacts:', additionalContacts);
  
  if (!contact) {
    return null;
  }

  return (
    <section id="contact" className="contact-section-initiatives">
      <h2 className="section-title">
        {t('initiatives.view.contactPerson', 'Контактно лице')}
      </h2>
      
      {/* Main Contact */}
      <div className="main-contact-card-initiatives">
        <div className="contact-image-section-initiatives">
          {contact.image ? (
            <img 
              src={contact.image} 
              alt={contact.name}
              className="contact-photo-initiatives"
            />
          ) : (
            <div className="contact-avatar-initiatives">
              {contact.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="contact-info-section-initiatives">
          <h3 className="contact-name-initiatives">{contact.name}</h3>
          <p className="contact-position-initiatives">{contact.position}</p>
          
          <div className="contact-details-initiatives">
            <div className="contact-item-initiatives">
              <span className="contact-label-initiatives">
                {t('initiatives.view.phone', 'Телефон')}
              </span>
              <a href={`tel:${contact.phone}`} className="contact-value-initiatives">
                {contact.phone}
              </a>
            </div>
            
            <div className="contact-item-initiatives">
              <span className="contact-label-initiatives">
                {t('initiatives.view.email', 'Имейл')}
              </span>
              <a href={`mailto:${contact.email}`} className="contact-value-initiatives">
                {contact.email}
              </a>
            </div>
          </div>
          
          <a 
            href={`mailto:${contact.email}`}
            className="email-contact-btn-initiatives"
          >
            <span className="email-icon-initiatives">✉️</span>
            {t('initiatives.view.emailTo', 'e-mail to')} {contact.name.split(' ')[0]}
          </a>
        </div>
      </div>
      
      {/* Additional Contacts */}
      {additionalContacts && additionalContacts.length > 0 && (
        <div className="additional-contacts-section-initiatives">
          <h4 className="additional-title-initiatives">
            {t('initiatives.view.additionalContacts', 'Допълнителни контакти')}
          </h4>
          
          <div className="additional-contacts-grid-initiatives">
            {additionalContacts.map((additionalContact, index) => (
              <div 
                key={`additional-contact-${additionalContact.email}-${index}`} 
                className="additional-contact-card-initiatives"
              >
                <div className="additional-contact-avatar-initiatives">
                  {additionalContact.name.charAt(0)}
                </div>
                
                <div className="additional-contact-info-initiatives">
                  <h5 className="additional-contact-name-initiatives">{additionalContact.name}</h5>
                  
                  <div className="additional-contact-details-initiatives">
                    <a href={`tel:${additionalContact.phone}`} className="additional-contact-item-initiatives">
                      <span className="contact-icon-initiatives">📞</span>
                      {additionalContact.phone}
                    </a>
                    
                    <a href={`mailto:${additionalContact.email}`} className="additional-contact-item-initiatives">
                      <span className="contact-icon-initiatives">✉️</span>
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