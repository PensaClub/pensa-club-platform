import { useTranslation } from 'react-i18next';
import './reActionHowItWorks.css';

const ReActionHowItWorks = () => {
  const { t } = useTranslation('reaction');

  const steps = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      title: t('howItWorks.step1Title'),
      desc: t('howItWorks.step1Desc'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      title: t('howItWorks.step2Title'),
      desc: t('howItWorks.step2Desc'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: t('howItWorks.step3Title'),
      desc: t('howItWorks.step3Desc'),
    },
  ];

  return (
    <section className="rahiw">
      <div className="rahiw-container">
        <h2 className="rahiw-title">{t('howItWorks.title')}</h2>

        <div className="rahiw-steps">
          {steps.map((step, i) => (
            <div key={i} className="rahiw-step">
              <div className="rahiw-step-number">{i + 1}</div>
              <div className="rahiw-step-icon">{step.icon}</div>
              <h3 className="rahiw-step-title">{step.title}</h3>
              <p className="rahiw-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReActionHowItWorks;
