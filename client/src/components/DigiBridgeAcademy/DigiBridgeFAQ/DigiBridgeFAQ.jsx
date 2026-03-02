import { useTranslation } from 'react-i18next';
import './digiBridgeFAQ.css';
import { useState } from 'react';
import { DigiBridgeContactModal } from './DigiBridgeContactModal';

export const DigiBridgeFAQ = () => {
    const { t } = useTranslation('digibridge');
    const [openIndex, setOpenIndex] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const faqs = [
        {
            id: 1,
            question: t('digiBridge.faq.q1.question', 'Какво е DigiBridge Academy?'),
            answer: t('digiBridge.faq.q1.answer', 'DigiBridge Academy е безплатна платформа за обучение по дигитална грамотност, част от европейския проект BRIDGE.'),
        },
        {
            id: 2,
            question: t('digiBridge.faq.q2.question', 'За кого е предназначена платформата?'),
            answer: t('digiBridge.faq.q2.answer', 'Платформата е създадена за възрастни хора, които искат да подобрят дигиталните си умения.'),
        },
        {
            id: 3,
            question: t('digiBridge.faq.q3.question', 'Колко струва обучението?'),
            answer: t('digiBridge.faq.q3.answer', 'Обучението е напълно безплатно. Финансирано е от Европейския съюз.'),
        },
        {
            id: 4,
            question: t('digiBridge.faq.q4.question', 'Как мога да стана ментор?'),
            answer: t('digiBridge.faq.q4.answer', 'Можете да кандидатствате през страницата "Стани ментор". Ще преминете кратко обучение.'),
        },
        {
            id: 5,
            question: t('digiBridge.faq.q5.question', 'На какви езици е достъпна платформата?'),
            answer: t('digiBridge.faq.q5.answer', 'Платформата е достъпна на български, английски и немски език.'),
        },
        {
            id: 6,
            question: t('digiBridge.faq.q6.question', 'Как се провеждат уроците?'),
            answer: t('digiBridge.faq.q6.answer', 'Уроците могат да бъдат онлайн или присъствени, според предпочитанията на участника.'),
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="dbfaq-section">
            {/* Background */}
            <div className="dbfaq-glow dbfaq-glow--1"></div>
            <div className="dbfaq-glow dbfaq-glow--2"></div>

            <div className="dbfaq-container">
                {/* Header */}
                <div className="dbfaq-header">
                    <span className="dbfaq-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        {t('digiBridge.faq.label', 'FAQ')}
                    </span>
                    <h2 className="dbfaq-title">
                        {t('digiBridge.faq.titlePart1', 'Често задавани ')}
                        <span className="dbfaq-title-highlight">
                            {t('digiBridge.faq.titlePart2', 'въпроси')}
                        </span>
                    </h2>
                    <p className="dbfaq-subtitle">
                        {t('digiBridge.faq.subtitle', 'Намерете отговори на най-честите въпроси за нашата програма')}
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="dbfaq-list">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className={`dbfaq-item ${openIndex === index ? 'dbfaq-item--open' : ''}`}
                        >
                            <button
                                className="dbfaq-question"
                                onClick={() => toggleFAQ(index)}
                                aria-expanded={openIndex === index}
                            >
                                <span className="dbfaq-question-number">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="dbfaq-question-text">{faq.question}</span>
                                <div className="dbfaq-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19" className="dbfaq-icon-vertical"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                </div>
                            </button>
                            
                            <div className="dbfaq-answer-wrapper">
                                <div className="dbfaq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="dbfaq-contact">
                    <div className="dbfaq-contact-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <path d="M8 9h8M8 13h6"/>
                        </svg>
                    </div>
                    <div className="dbfaq-contact-content">
                        <h3 className="dbfaq-contact-title">
                            {t('digiBridge.faq.stillHaveQuestions', 'Имате още въпроси?')}
                        </h3>
                        <p className="dbfaq-contact-desc">
                            {t('digiBridge.faq.contactUs', 'Свържете се с нас и ще ви отговорим възможно най-скоро')}
                        </p>
                    </div>
                    <button 
                        className="dbfaq-contact-btn"
                        onClick={() => setIsContactModalOpen(true)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {t('digiBridge.faq.contactButton', 'Свържете се с нас')}
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