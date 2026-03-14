import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './reActionFAQ.css';

const ReActionFAQ = () => {
  const { t } = useTranslation('reaction');
  const [openIndex, setOpenIndex] = useState(null);

  const items = t('faq.items', { returnObjects: true });

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (!Array.isArray(items)) return null;

  return (
    <section className="rafaq">
      <div className="rafaq-container">
        <h2 className="rafaq-title">{t('faq.title')}</h2>

        <div className="rafaq-list">
          {items.map((item, index) => (
            <div
              key={index}
              className={`rafaq-item ${openIndex === index ? 'rafaq-item--open' : ''}`}
            >
              <button
                className="rafaq-question"
                onClick={() => handleToggle(index)}
                type="button"
                aria-expanded={openIndex === index}
              >
                <span className="rafaq-question-text">{item.question}</span>
                <svg
                  className="rafaq-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="rafaq-answer-wrapper">
                <div className="rafaq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReActionFAQ;
