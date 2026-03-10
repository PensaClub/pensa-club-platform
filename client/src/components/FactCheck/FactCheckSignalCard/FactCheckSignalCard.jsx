import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import './factCheckSignalCard.css';

const FactCheckSignalCard = ({ signal }) => {
  const { t } = useTranslation('factcheck');

  const isResolved = signal.status === 'resolved' && signal.moduleSlug;
  const verdict = signal.verdict;
  const date = new Date(signal.createdAt).toLocaleDateString('bg-BG');

  const cardContent = (
    <>
      <div className="fcsc-top">
        {isResolved && verdict ? (
          <span className={`fcsc-verdict fcsc-verdict--${verdict}`}>
            {t(`verdicts.${verdict}`)}
          </span>
        ) : (
          <span className="fcsc-status fcsc-status--pending">
            {t('signal.statusPending')}
          </span>
        )}
        <span className="fcsc-source">
          {t(`sourceTypes.${signal.sourceType}`)}
        </span>
      </div>

      <blockquote className="fcsc-claim">
        &ldquo;{signal.claimText.length > 150 ? signal.claimText.substring(0, 150) + '...' : signal.claimText}&rdquo;
      </blockquote>

      {signal.city && (
        <p className="fcsc-city">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fcsc-city-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {signal.city}
        </p>
      )}

      <div className="fcsc-footer">
        <span className="fcsc-date">{date}</span>
        {isResolved && (
          <span className="fcsc-read-answer">{t('signal.readAnswer')} &rarr;</span>
        )}
      </div>
    </>
  );

  if (isResolved) {
    return (
      <Link to={`/fact-check/${signal.moduleSlug}`} className={`fcsc fcsc--resolved ${verdict ? `fcsc--verdict-${verdict}` : ''}`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="fcsc fcsc--pending">
      {cardContent}
    </div>
  );
};

export default FactCheckSignalCard;
