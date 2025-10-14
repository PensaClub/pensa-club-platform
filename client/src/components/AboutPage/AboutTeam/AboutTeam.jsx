import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faStar,
  faPaperPlane,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faTimes,
  faInfoCircle,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import './aboutTeam.css';
import { useClubContext } from '../../contexts/ClubContext';

export const AboutTeam = () => {
  const { t } = useTranslation();
  const { sendPersonalEmail } = useClubContext();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [expandedBios, setExpandedBios] = useState({});
  const [emailForm, setEmailForm] = useState({
    from: '',
    to: '',
    subject: '',
    message: ''
  });
  const [emailStatus, setEmailStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamMembers = [
    {
      id: 'elina',
      name: 'Елина Кирова',
      email: 'elinakirova@yahoo.com',
      phone: '+359 877 777 421',
      image: '/images/about/elina.jpg'
    },  
    {
      id: 'lubima',
      name: 'Любима Милкоева',
      email: 'milkoeva@abv.bg',
      phone: null,
      image: '/images/about/luba.png'
    },
    {
      id: 'lena',
      name: 'Лена Петкова',
      email: 'lenadoncheva1958@gmail.com',
      phone: '+359 888 569890',
      image: '/images/about/lena.JPG'
    },
    {
      id: 'borislav',
      name: 'Борислав Илиев',
      email: 'borislaviliev47@gmail.com',
      phone: '0894371779',
      image: '/images/about/borislav.jpg'
    },
  ];

  const toggleBio = (memberId) => {
    setExpandedBios(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const openEmailModal = (member) => {
    setSelectedMember(member);
    setShowEmailModal(true);
    setEmailStatus({ type: '', message: '' });
    setEmailForm({
      from: '',
      to: member.email,
      subject: `Съобщение до ${member.name}`,
      message: ''
    });
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setSelectedMember(null);
    setEmailStatus({ type: '', message: '' });
    setEmailForm({
      from: '',
      to: '',
      subject: '',
      message: ''
    });
  };

  const handleEmailChange = (field, value) => {
    setEmailForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!emailForm.from.trim() || !emailForm.to.trim() || !emailForm.subject.trim() || !emailForm.message.trim()) {
      setEmailStatus({
        type: 'error',
        message: 'Моля, попълнете всички полета'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.from)) {
      setEmailStatus({
        type: 'error',
        message: 'Моля, въведете валиден имейл адрес'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await sendPersonalEmail({
        from: emailForm.from,
        to: emailForm.to,
        subject: emailForm.subject,
        message: emailForm.message
      });

      if (success) {
        setEmailStatus({
          type: 'success',
          message: 'Съобщението е изпратено успешно!'
        });
        setTimeout(() => {
          closeEmailModal();
        }, 2000);
      } else {
        setEmailStatus({
          type: 'error',
          message: 'Възникна грешка при изпращането!'
        });
      }
    } catch (error) {
      console.error('Грешка при изпращане на имейл:', error);
      setEmailStatus({
        type: 'error',
        message: 'Възникна грешка при изпращането!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="aboutteam-section">
      <div className="aboutteam-container">
        <div className="aboutteam-header">
          <span className="aboutteam-label">{t('about.team.label')}</span>
          <h2 className="aboutteam-title">{t('about.team.title')}</h2>
          <p className="aboutteam-description">
            {t('about.team.description')}
          </p>
        </div>

        <div className="aboutteam-grid">
          {teamMembers.map((member) => {
            const bioText = t(`about.team.members.${member.id}.bio`);
            const isExpanded = expandedBios[member.id];
            const shouldShowToggle = bioText.length > 90;

            return (
              <div key={member.id} className="aboutteam-card">
                <div className="aboutteam-card-top">
                  <div className="aboutteam-avatar">
                    <img src={member.image} alt={member.name} />
                  </div>
                  <div className="aboutteam-badge">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                </div>

                <div className="aboutteam-info">
                  <h3>{member.name}</h3>
                  <p className="aboutteam-role">{t(`about.team.members.${member.id}.role`)}</p>
                  <p className={`aboutteam-bio ${isExpanded ? 'aboutteam-bio-expanded' : ''}`}>
                    {bioText}
                  </p>
                  {shouldShowToggle && (
                    <button 
                      className="aboutteam-toggle-bio"
                      onClick={() => toggleBio(member.id)}
                    >
                      {isExpanded ? (
                        <>
                          Покажи по-малко <FontAwesomeIcon icon={faChevronUp} />
                        </>
                      ) : (
                        <>
                          Прочети повече <FontAwesomeIcon icon={faChevronDown} />
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="aboutteam-actions">
                  <button 
                    onClick={() => openEmailModal(member)}
                    className="aboutteam-btn aboutteam-btn-email"
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                  </button>
                  {member.phone && (
                    <a 
                      href={`tel:${member.phone}`} 
                      className="aboutteam-btn aboutteam-btn-phone"
                    >
                      <FontAwesomeIcon icon={faPhone} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedMember && (
        <div className="aboutteam-modal-overlay" onClick={closeEmailModal}>
          <div className="aboutteam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aboutteam-modal-header">
              <h3>
                <FontAwesomeIcon icon={faPaperPlane} />
                {t('about.team.modalTitle', { name: selectedMember.name })}
              </h3>
              <button className="aboutteam-modal-close" onClick={closeEmailModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="aboutteam-modal-content">
              <div className="aboutteam-recipient">
                <img src={selectedMember.image} alt={selectedMember.name} />
                <div>
                  <h4>{selectedMember.name}</h4>
                  <p>{t(`about.team.members.${selectedMember.id}.role`)}</p>
                  <span>{selectedMember.email}</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="aboutteam-form">
                <div className="aboutteam-form-row">
                  <div className="aboutteam-form-group">
                    <label>{t('about.team.form.from')} *</label>
                    <input
                      type="email"
                      value={emailForm.from}
                      onChange={(e) => handleEmailChange('from', e.target.value)}
                      placeholder={t('about.team.form.fromPlaceholder')}
                      required
                    />
                  </div>

                  <div className="aboutteam-form-group">
                    <label>{t('about.team.form.to')} *</label>
                    <input
                      type="email"
                      value={emailForm.to}
                      onChange={(e) => handleEmailChange('to', e.target.value)}
                      readOnly
                    />
                  </div>
                </div>

                <div className="aboutteam-form-group">
                  <label>{t('about.team.form.subject')} *</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => handleEmailChange('subject', e.target.value)}
                    placeholder={t('about.team.form.subjectPlaceholder')}
                    required
                  />
                </div>

                <div className="aboutteam-form-group">
                  <label>{t('about.team.form.message')} *</label>
                  <textarea
                    value={emailForm.message}
                    onChange={(e) => handleEmailChange('message', e.target.value)}
                    placeholder={t('about.team.form.messagePlaceholder')}
                    rows="5"
                    required
                  />
                </div>

                <button type="submit" className="aboutteam-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="aboutteam-spin" />
                      {t('about.team.form.sending')}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      {t('about.team.form.send')}
                    </>
                  )}
                </button>

                {emailStatus.message && (
                  <div className={`aboutteam-alert aboutteam-alert-${emailStatus.type}`}>
                    <FontAwesomeIcon
                      icon={emailStatus.type === 'success' ? faCheckCircle : faExclamationTriangle}
                    />
                    <span>{emailStatus.message}</span>
                  </div>
                )}
              </form>

              <div className="aboutteam-note">
                <FontAwesomeIcon icon={faInfoCircle} /> 
                {t('about.team.form.note')}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AboutTeam;