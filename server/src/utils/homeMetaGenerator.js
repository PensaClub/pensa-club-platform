const { generateHreflangTags } = require('./hreflangHelper');

const BASE_URL = 'https://pensa.club';

const TRANSLATIONS = {
    bg: {
        htmlLang: 'bg',
        ogLocale: 'bg_BG',
        title: 'Pensa Club - Платформа за пенсионери в дигиталния свят | DigiBridge Academy',
        ogTitle: 'Pensa Club - Общност за пенсионери в дигиталния свят',
        twitterTitle: 'Pensa Club - Платформа за пенсионери в дигиталния свят',
        description: 'Pensa Club е дигитална платформа за активни пенсионери в България. Общност, статии, карта на 150+ клуба в 40+ града, ментори и вградената DigiBridge Academy — безплатни курсове за дигитална грамотност 60+.',
        ogDescription: 'Pensa Club обединява пенсионерска общност, статии, карта на 150+ клуба в цяла България и ментори. Вградената DigiBridge Academy предлага безплатни онлайн курсове за дигитална грамотност, интернет сигурност и електронни услуги.',
        twitterDescription: 'Платформа за активни пенсионери — общност, 150+ клуба, ментори и DigiBridge Academy с безплатни курсове за дигитална грамотност 60+.',
        keywords: 'Pensa Club, пенсионери, пенсионерски клубове, пенса, клуб на пенсионера, DigiBridge Academy, безплатни курсове за възрастни, ментори, дигитална грамотност за пенсионери, дигитална сигурност, ментори за пенсионери, PensaMap, карта на пенсионерски клубове, онлайн обучение 60+, интернет безопасност за възрастни, електронна комуникация, избягване интернет измами, активен живот в третата възраст, технологии за възрастни, обществена интеграция, доброволчество, общност 60+, дигитално образование, медийна грамотност, курсове за пенсионери, онлайн помощ, чат за възрастни, игри за пенсионери, форум, статии за здраве, проекти за възрастни, обяви за дарения, туризъм 60+, услуги за пенсионери',
        ogImageAlt: 'Pensa Club - Платформа за дигитално образование на пенсионери',
        twitterImageAlt: 'Pensa Club платформа',
        bodyFallback: 'Ако не бъдете пренасочени автоматично, кликнете тук',
    },
    en: {
        htmlLang: 'en',
        ogLocale: 'en_US',
        title: 'Pensa Club - Digital platform for active retirees | DigiBridge Academy',
        ogTitle: 'Pensa Club - Community for retirees in the digital world',
        twitterTitle: 'Pensa Club - Digital platform for active retirees',
        description: 'Pensa Club is a digital platform for active retirees in Bulgaria. Community, articles, map of 150+ clubs in 40+ cities, mentors and the integrated DigiBridge Academy — free digital literacy courses 60+.',
        ogDescription: 'Pensa Club brings together a retiree community, articles, map of 150+ clubs across Bulgaria and mentors. The integrated DigiBridge Academy offers free online courses on digital literacy, internet security and electronic services.',
        twitterDescription: 'Platform for active retirees — community, 150+ clubs, mentors and DigiBridge Academy with free digital literacy courses 60+.',
        keywords: 'Pensa Club, retirees, retirement clubs, DigiBridge Academy, free courses for seniors, mentors, digital literacy for retirees, digital security, PensaMap, retirement clubs map, online learning 60+, internet safety for seniors, electronic communication, avoiding internet scams, active life in third age, technology for seniors, social integration, volunteering, community 60+, digital education, media literacy, courses for retirees, online help, chat for seniors, games for retirees, forum, health articles, projects for seniors, services for retirees',
        ogImageAlt: 'Pensa Club - Digital education platform for retirees',
        twitterImageAlt: 'Pensa Club platform',
        bodyFallback: 'If you are not redirected automatically, click here',
    },
    de: {
        htmlLang: 'de',
        ogLocale: 'de_DE',
        title: 'Pensa Club - Digitale Plattform für aktive Rentner | DigiBridge Academy',
        ogTitle: 'Pensa Club - Gemeinschaft für Rentner in der digitalen Welt',
        twitterTitle: 'Pensa Club - Digitale Plattform für aktive Rentner',
        description: 'Pensa Club ist eine digitale Plattform für aktive Rentner in Bulgarien. Gemeinschaft, Artikel, Karte von 150+ Clubs in 40+ Städten, Mentoren und die integrierte DigiBridge Academy — kostenlose Kurse zur digitalen Kompetenz 60+.',
        ogDescription: 'Pensa Club vereint eine Rentnergemeinschaft, Artikel, Karte von 150+ Clubs in ganz Bulgarien und Mentoren. Die integrierte DigiBridge Academy bietet kostenlose Online-Kurse zu digitaler Kompetenz, Internetsicherheit und elektronischen Dienstleistungen.',
        twitterDescription: 'Plattform für aktive Rentner — Gemeinschaft, 150+ Clubs, Mentoren und DigiBridge Academy mit kostenlosen Kursen zur digitalen Kompetenz 60+.',
        keywords: 'Pensa Club, Rentner, Rentnerclubs, DigiBridge Academy, kostenlose Kurse für Senioren, Mentoren, digitale Kompetenz für Rentner, digitale Sicherheit, PensaMap, Karte der Rentnerclubs, Online-Lernen 60+, Internetsicherheit für Senioren, elektronische Kommunikation, aktives Leben im dritten Alter, Technologie für Senioren, soziale Integration, Ehrenamt, Gemeinschaft 60+, digitale Bildung, Medienkompetenz, Kurse für Rentner, Online-Hilfe, Spiele für Rentner, Forum, Gesundheitsartikel, Dienstleistungen für Rentner',
        ogImageAlt: 'Pensa Club - Digitale Bildungsplattform für Rentner',
        twitterImageAlt: 'Pensa Club Plattform',
        bodyFallback: 'Wenn Sie nicht automatisch weitergeleitet werden, klicken Sie hier',
    },
};

const buildLangUrl = (path, lang) => {
    if (lang === 'bg') return `${BASE_URL}${path}`;
    return `${BASE_URL}/${lang}${path}`;
};

/**
 * Generates SSR meta HTML for the home page. Lang-aware: serves correct
 * title/description/canonical/og:locale based on the prefix the bot requested
 * (/, /en/, /de/).
 *
 * Schemas use the BG-default canonical URL of the underlying entities (the
 * organization, website, courses are the same regardless of UI language) but
 * include `inLanguage` per request so search engines understand the locale.
 */
function generateHomeMetaHTML(lang = 'bg') {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.bg;
    const url = buildLangUrl('/', lang);
    const imageUrl = `${BASE_URL}/images/home/hero-img.jpg`;

    return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Basic Meta Tags -->
    <title>${t.title}</title>
    <meta name="title" content="${t.title}">
    <meta name="description" content="${t.description}">
    <meta name="keywords" content="${t.keywords}">
    <meta name="author" content="Pensa Foundation">
    <meta name="publisher" content="Pensa Foundation">
    <meta http-equiv="content-language" content="${t.htmlLang}">
    <meta name="language" content="${t.htmlLang}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <meta name="revisit-after" content="3 days">
    <meta name="geo.region" content="BG">
    <meta name="geo.placename" content="България">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${t.ogTitle}">
    <meta property="og:description" content="${t.ogDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${t.ogImageAlt}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="${t.ogLocale}">
    <meta property="og:locale:alternate" content="bg_BG">
    <meta property="og:locale:alternate" content="de_DE">
    <meta property="og:locale:alternate" content="en_US">

    <!-- Facebook -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    <meta property="og:see_also" content="https://www.facebook.com/profile.php?id=61578204366479">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${t.twitterTitle}">
    <meta name="twitter:description" content="${t.twitterDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${t.twitterImageAlt}">

    <!-- Canonical URL — lang-specific so Google indexes each variant separately -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/')}

    <!-- Structured Data - Organization -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Pensa Club",
        "alternateName": "Pensa Foundation",
        "url": "${BASE_URL}/",
        "logo": "${BASE_URL}/logo.png",
        "description": "${t.description}",
        "foundingDate": "2023",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BG",
            "addressLocality": "България"
        },
        "sameAs": [
            "https://www.facebook.com/profile.php?id=61578204366479"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "availableLanguage": ["Bulgarian", "German", "English"]
        }
    }
    </script>

    <!-- Structured Data - WebSite -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Pensa Club",
        "url": "${url}",
        "description": "${t.description}",
        "inLanguage": "${t.htmlLang}",
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Foundation",
            "sameAs": "https://www.facebook.com/profile.php?id=61578204366479"
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": "${BASE_URL}/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
    </script>

    <!-- Structured Data - EducationalOrganization -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "DigiBridge Academy",
        "url": "${BASE_URL}/academy",
        "description": "DigiBridge Academy — free online courses on digital literacy, internet security and e-services for older adults, funded by the EU Civic Innovation Fund.",
        "parentOrganization": {
            "@type": "Organization",
            "name": "Pensa Club"
        },
        "areaServed": ["BG", "DE"],
        "audience": {
            "@type": "PeopleAudience",
            "suggestedMinAge": 60
        },
        "courseMode": "online",
        "isAccessibleForFree": true
    }
    </script>

    <!-- Redirect to React App -->
    <meta http-equiv="refresh" content="0; url=${url}">
    <script>window.location.href = "${url}";</script>
</head>
<body>
    <h1>${t.title}</h1>
    <p>${t.description}</p>
    <p>${t.bodyFallback}: <a href="${url}">${url}</a></p>
</body>
</html>
    `.trim();
}

module.exports = generateHomeMetaHTML;
