import { useTranslation } from 'react-i18next';
import './factCheckHowItWorks.css';

const FactCheckHowItWorks = () => {
  const { t } = useTranslation('factcheck');

  const steps = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      ),
      title: t('howItWorks.step1Title'),
      desc: t('howItWorks.step1Desc'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
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
    <section className="fchiw">
      <div className="fchiw-container">
        <h2 className="fchiw-title">{t('howItWorks.title')}</h2>

        <div className="fchiw-steps">
          {steps.map((step, i) => (
            <div key={i} className="fchiw-step">
              <div className="fchiw-step-number">{i + 1}</div>
              <div className="fchiw-step-icon">{step.icon}</div>
              <h3 className="fchiw-step-title">{step.title}</h3>
              <p className="fchiw-step-desc">{step.desc}</p>
              {i < steps.length - 1 && <div className="fchiw-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FactCheckHowItWorks;
