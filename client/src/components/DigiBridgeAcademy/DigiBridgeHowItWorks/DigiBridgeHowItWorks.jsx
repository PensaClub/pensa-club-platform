import React from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgeHowItWorks.css';

export const DigiBridgeHowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      icon: '✍️',
      title: t('digiBridge.howItWorks.step1.title'),
      description: t('digiBridge.howItWorks.step1.description'),
    },
    {
      number: '02',
      icon: '📚',
      title: t('digiBridge.howItWorks.step2.title'),
      description: t('digiBridge.howItWorks.step2.description'),
    },
    {
      number: '03',
      icon: '🎓',
      title: t('digiBridge.howItWorks.step3.title'),
      description: t('digiBridge.howItWorks.step3.description'),
    },
    {
      number: '04',
      icon: '🤝',
      title: t('digiBridge.howItWorks.step4.title'),
      description: t('digiBridge.howItWorks.step4.description'),
    },
  ];

  return (
    <section className="digibridge-how-it-works">
      <div className="digibridge-how-it-works-container">
        
        <div className="digibridge-how-it-works-header">
          <span className="digibridge-how-it-works-label">
            {t('digiBridge.howItWorks.label')}
          </span>
          <h2 className="digibridge-how-it-works-title">
            {t('digiBridge.howItWorks.title')}
          </h2>
          <p className="digibridge-how-it-works-subtitle">
            {t('digiBridge.howItWorks.subtitle')}
          </p>
        </div>

        <div className="digibridge-how-it-works-steps">
          {steps.map((step, index) => (
            <div key={index} className="digibridge-how-it-works-step">
              <div className="digibridge-how-it-works-step-number">{step.number}</div>
              <div className="digibridge-how-it-works-step-icon">{step.icon}</div>
              <h3 className="digibridge-how-it-works-step-title">{step.title}</h3>
              <p className="digibridge-how-it-works-step-description">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="digibridge-how-it-works-step-arrow">→</div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};