
import { useTranslation } from 'react-i18next';
import './digiBridgeFAQ.css';
import { useState } from 'react';
import { DigiBridgeContactModal } from './DigiBridgeContactModal';

export const DigiBridgeFAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const faqs = [
    {
      id: 1,
      question: t('digiBridge.faq.q1.question'),
      answer: t('digiBridge.faq.q1.answer'),
    },
    {
      id: 2,
      question: t('digiBridge.faq.q2.question'),
      answer: t('digiBridge.faq.q2.answer'),
    },
    {
      id: 3,
      question: t('digiBridge.faq.q3.question'),
      answer: t('digiBridge.faq.q3.answer'),
    },
    {
      id: 4,
      question: t('digiBridge.faq.q4.question'),
      answer: t('digiBridge.faq.q4.answer'),
    },
    {
      id: 5,
      question: t('digiBridge.faq.q5.question'),
      answer: t('digiBridge.faq.q5.answer'),
    },
    {
      id: 6,
      question: t('digiBridge.faq.q6.question'),
      answer: t('digiBridge.faq.q6.answer'),
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="digibridge-faq">
      <div className="digibridge-faq-container">
        
        {/* Header */}
        <div className="digibridge-faq-header">
          <span className="digibridge-faq-label">
            {t('digiBridge.faq.label')}
          </span>
          <h2 className="digibridge-faq-title">
            {t('digiBridge.faq.title')}
          </h2>
          <p className="digibridge-faq-subtitle">
            {t('digiBridge.faq.subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="digibridge-faq-list">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`digibridge-faq-item ${openIndex === index ? 'digibridge-faq-item-open' : ''}`}
            >
              <button
                className="digibridge-faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="digibridge-faq-question-text">{faq.question}</span>
                <div className="digibridge-faq-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line 
                      x1="5" 
                      y1="12" 
                      x2="19" 
                      y2="12"
                      className="digibridge-faq-icon-horizontal"
                    />
                  </svg>
                </div>
              </button>
              
              <div className="digibridge-faq-answer-wrapper">
                <div className="digibridge-faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="digibridge-faq-contact">
          <div className="digibridge-faq-contact-icon">💬</div>
          <h3 className="digibridge-faq-contact-title">
            {t('digiBridge.faq.stillHaveQuestions')}
          </h3>
          <p className="digibridge-faq-contact-description">
            {t('digiBridge.faq.contactUs')}
          </p>
           <button 
            className="digibridge-faq-contact-button"
            onClick={() => setIsContactModalOpen(true)} // ← ПРОМЕНЕНО
          >
            {t('digiBridge.faq.contactButton')}
          </button>
        </div>

      </div>
       {/* Contact Modal */}
      <DigiBridgeContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </section>
  );
};