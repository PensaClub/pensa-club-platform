// src/components/SEO/SEOHead.jsx
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image = '/images/iniciatives/iniciatives-2.jpg',
  type = 'website',
  publishedTime = null,
  modifiedTime = null,
  author = null,
  section = null,
  tags = [],
  noindex = false,
  canonical = null,
  structuredData = null
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'bg';
  
  const baseUrl = 'https://pensa.club';
  const currentUrl = canonical || window.location.href;
  
  const localeMap = {
    'bg': 'bg_BG',
    'de': 'de_DE',
    'en': 'en_US'
  };
  
  const ogLocale = localeMap[currentLanguage] || 'bg_BG';
  const alternateLocales = Object.keys(localeMap)
    .filter(lang => lang !== currentLanguage)
    .map(lang => localeMap[lang]);

  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLanguage} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || "Pensa Foundation"} />
      <meta name="language" content={currentLanguage} />
      <meta httpEquiv="content-language" content={currentLanguage} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* hreflang Tags */}
      <link rel="alternate" hreflang="bg" href={currentUrl} />
      <link rel="alternate" hreflang="de" href={currentUrl} />
      <link rel="alternate" hreflang="en" href={currentUrl} />
      <link rel="alternate" hreflang="x-default" href={currentUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Pensa Club" />
      <meta property="og:locale" content={ogLocale} />
      {alternateLocales.map(locale => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}
      
      {/* Article Meta Tags (за type="article") */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.length > 0 && 
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))
      }
      
      {/* Facebook */}
      <meta property="fb:pages" content="61578204366479" />
      <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;