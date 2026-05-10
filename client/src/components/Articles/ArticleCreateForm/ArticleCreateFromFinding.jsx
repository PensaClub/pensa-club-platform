import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Info } from 'lucide-react';
import { useCrawlerContext } from '../../contexts/CrawlerContext';
import ArticleCreateForm from './ArticleCreateForm';
import { generateSlug } from '../../../utils/slugUtils';
import './articleCreateFromFinding.css';

// Wraps ArticleCreateForm so that when the URL carries `?fromFinding=N`
// we pre-populate the form with a starting point derived from the bot
// crawler's finding. Everything is editable — the goal is to save the
// admin keystrokes, NOT to copy the original article verbatim. The banner
// at the top makes the source explicit so the editor can verify-and-edit
// instead of just publishing whatever the bot dragged in.
const ArticleCreateFromFinding = () => {
  const { t } = useTranslation('botCrawler');
  const [searchParams] = useSearchParams();
  const findingId = searchParams.get('fromFinding');
  const { getFinding } = useCrawlerContext();

  const [finding, setFinding] = useState(null);
  const [loading, setLoading] = useState(!!findingId);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!findingId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const data = await getFinding(findingId);
        const item = data?.item ?? data;
        if (!cancelled) setFinding(item || null);
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [findingId, getFinding]);

  // Build form initialValues from the finding, mirroring useCreateArticle's
  // default shape. Anything we can't fill stays empty so admin sees the
  // usual blank field rather than a bogus value.
  const initialValues = useMemo(() => {
    if (!finding) return null;

    const today = new Date().toISOString().split('T')[0];
    const summaryText = (finding.description || '').trim();

    const summary = summaryText
      ? [{ type: 'paragraph', children: [{ text: summaryText }] }]
      : [{ type: 'paragraph', children: [{ text: '' }] }];

    const sources = finding.imageUrl ? [finding.imageUrl] : [];

    const usefulLinks = [{
      title: finding.source?.name
        ? t('fromFinding.linkLabel', { source: finding.source.name })
        : t('fromFinding.linkLabelGeneric'),
      url: finding.externalUrl,
      description: '',
    }];

    return {
      title: finding.title || '',
      slug: finding.title ? generateSlug(finding.title) : '',
      author: '',
      publishDate: today,
      summary,
      mainImage: {
        type: 'image',
        sources,
        alt: [{ type: 'paragraph', children: [{ text: finding.title || '' }] }],
        thumbnail: '',
        videoUrl: '',
        subtitles: [],
        allowDownload: false,
      },
      sections: [
        {
          title: '',
          content: [{ type: 'paragraph', children: [{ text: '' }] }],
          image: [],
          order: 1,
        },
      ],
      tags: [],
      usefulLinks,
      previousArticle: null,
      nextArticle: null,
    };
  }, [finding, t]);

  // No fromFinding param → render the form with no pre-fill (preserves
  // the existing /profile/article-create behaviour for direct visits).
  if (!findingId) {
    return <ArticleCreateForm />;
  }

  if (loading) {
    return (
      <div className="acff-loading">
        <p>{t('fromFinding.loading')}</p>
      </div>
    );
  }

  if (errored || !finding) {
    return (
      <div className="acff-error">
        <p>{t('fromFinding.error')}</p>
        <ArticleCreateForm />
      </div>
    );
  }

  const sourceName = finding.source?.name || finding.bot?.name || '';

  return (
    <div className="acff-wrap">
      <div className="acff-banner" role="note">
        <div className="acff-banner-icon" aria-hidden="true">
          <Info size={20} />
        </div>
        <div className="acff-banner-body">
          <div className="acff-banner-title">{t('fromFinding.banner.title')}</div>
          <p className="acff-banner-text">
            {t('fromFinding.banner.text')}
          </p>
          <div className="acff-banner-meta">
            {sourceName && (
              <span className="acff-banner-source">
                {t('fromFinding.banner.source')}: <strong>{sourceName}</strong>
              </span>
            )}
            <a
              href={finding.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="acff-banner-link"
            >
              <span>{t('fromFinding.banner.openOriginal')}</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <ArticleCreateForm initialValues={initialValues} />
    </div>
  );
};

export default ArticleCreateFromFinding;
