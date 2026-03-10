import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import './factCheckCard.css';

const FactCheckCard = ({ module }) => {
  const { t } = useTranslation('factcheck');

  const verdictClass = `fccard-verdict--${module.verdict}`;
  const date = new Date(module.createdAt).toLocaleDateString('bg-BG');

  return (
    <Link to={`/fact-check/${module.slug}`} className="fccard">
      <div className="fccard-top">
        <span className={`fccard-verdict ${verdictClass}`}>
          {t(`verdicts.${module.verdict}`)}
        </span>
        <span className="fccard-category">{module.category}</span>
      </div>

      <blockquote className="fccard-claim">
        &ldquo;{module.claimText.length > 150 ? module.claimText.substring(0, 150) + '...' : module.claimText}&rdquo;
      </blockquote>

      <p className="fccard-preview">
        {module.verification?.length > 120 ? module.verification.substring(0, 120) + '...' : module.verification}
      </p>

      <div className="fccard-footer">
        <span className="fccard-date">{date}</span>
        <span className="fccard-views">
          {module.viewsCount || 0} {t('card.views')}
        </span>
      </div>

      <span className="fccard-read-more">{t('card.readMore')} &rarr;</span>
    </Link>
  );
};

export default FactCheckCard;
